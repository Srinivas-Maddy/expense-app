import { prisma } from "@expense-app/db";
import { CATEGORY_KEYWORDS } from "@expense-app/shared";
import type { CategorySuggestion, MoneyLeak, MoneyLeaksReport } from "@expense-app/shared";

/**
 * Auto-categorize: suggest category for a description.
 * Strategy: 1) Check user's past transactions for same/similar description
 *           2) Keyword matching against known patterns
 */
export async function suggestCategory(
  userId: string,
  description: string,
): Promise<CategorySuggestion[]> {
  const suggestions: CategorySuggestion[] = [];
  const descLower = description.toLowerCase().trim();

  // 1. Check user's past transactions with similar description
  const pastExpenses = await prisma.expense.findMany({
    where: {
      userId,
      description: { contains: description, mode: "insensitive" },
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (pastExpenses.length > 0) {
    // Count category frequency
    const catCounts = new Map<string, { id: string; name: string; count: number }>();
    for (const exp of pastExpenses) {
      const key = exp.categoryId;
      const existing = catCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        catCounts.set(key, { id: exp.categoryId, name: exp.category.name, count: 1 });
      }
    }

    // Sort by frequency
    const sorted = [...catCounts.values()].sort((a, b) => b.count - a.count);
    for (const cat of sorted) {
      const confidence = Math.min(95, 50 + cat.count * 10);
      suggestions.push({
        categoryId: cat.id,
        categoryName: cat.name,
        confidence,
        reason: `Used ${cat.count}x for similar transactions`,
      });
    }
  }

  // 2. Keyword matching
  const userCategories = await prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
  });
  const catNameMap = new Map(userCategories.map((c) => [c.name, c.id]));

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const catId = catNameMap.get(categoryName);
    if (!catId) continue;

    // Check if already suggested from past transactions
    if (suggestions.some((s) => s.categoryId === catId)) continue;

    const matchedKeyword = keywords.find((kw) => descLower.includes(kw));
    if (matchedKeyword) {
      suggestions.push({
        categoryId: catId,
        categoryName,
        confidence: 70,
        reason: `Keyword match: "${matchedKeyword}"`,
      });
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

/**
 * Money Leaks Detector: analyzes spending patterns to find:
 * 1. Subscriptions: similar amounts recurring monthly
 * 2. Repeat spending: same merchant/description appearing frequently
 * 3. Impulse spending: small frequent charges that add up
 */
export async function detectMoneyLeaks(userId: string): Promise<MoneyLeaksReport> {
  // Get last 6 months of expenses
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const expenses = await prisma.expense.findMany({
    where: { userId, date: { gte: sixMonthsAgo } },
    include: { category: { select: { name: true, color: true } } },
    orderBy: { date: "desc" },
  });

  if (expenses.length === 0) {
    return { totalLeaks: 0, totalMonthly: 0, totalAnnual: 0, leaks: [] };
  }

  const leaks: MoneyLeak[] = [];

  // --- 1. Detect Subscriptions ---
  // Group by similar description + similar amount (within 5% tolerance)
  const descGroups = new Map<string, typeof expenses>();
  for (const exp of expenses) {
    const key = exp.description.toLowerCase().trim();
    const group = descGroups.get(key) ?? [];
    group.push(exp);
    descGroups.set(key, group);
  }

  for (const [desc, group] of descGroups) {
    if (group.length < 2) continue;

    const amounts = group.map((e) => Number(e.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Check if amounts are consistent (within 10% of average)
    const isConsistent = amounts.every((a) => Math.abs(a - avgAmount) / avgAmount < 0.1);

    if (isConsistent && group.length >= 2) {
      // Check if it's roughly monthly (20-40 day gaps)
      const dates = group.map((e) => e.date.getTime()).sort((a, b) => a - b);
      const gaps: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      }
      const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;

      let frequency = "";
      let annualMultiplier = 1;
      if (avgGap >= 25 && avgGap <= 35) {
        frequency = "Monthly";
        annualMultiplier = 12;
      } else if (avgGap >= 6 && avgGap <= 8) {
        frequency = "Weekly";
        annualMultiplier = 52;
      } else if (avgGap >= 13 && avgGap <= 16) {
        frequency = "Bi-weekly";
        annualMultiplier = 26;
      } else if (avgGap >= 85 && avgGap <= 95) {
        frequency = "Quarterly";
        annualMultiplier = 4;
      } else {
        continue; // Not a recognizable pattern
      }

      leaks.push({
        type: "subscription",
        title: group[0].description,
        description: `${frequency} charge of ~${avgAmount.toFixed(0)} detected ${group.length} times`,
        amount: avgAmount,
        frequency,
        annualCost: avgAmount * annualMultiplier,
        transactions: group.slice(0, 5).map((e) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          date: e.date.toISOString(),
        })),
        severity: avgAmount * annualMultiplier > 5000 ? "high" : avgAmount * annualMultiplier > 1000 ? "medium" : "low",
      });
    }
  }

  // --- 2. Detect Repeat Spending (same category, high frequency) ---
  const catGroups = new Map<string, { name: string; expenses: typeof expenses }>();
  for (const exp of expenses) {
    const key = exp.categoryId;
    const existing = catGroups.get(key);
    if (existing) {
      existing.expenses.push(exp);
    } else {
      catGroups.set(key, { name: exp.category.name, expenses: [exp] });
    }
  }

  for (const [catId, group] of catGroups) {
    // Skip if already detected as subscription
    if (group.expenses.length < 10) continue;

    const total = group.expenses.reduce((s, e) => s + Number(e.amount), 0);
    const monthlyAvg = total / 6;
    const txPerMonth = group.expenses.length / 6;

    // Flag categories with high frequency (>8 transactions/month)
    if (txPerMonth > 8) {
      leaks.push({
        type: "repeat_spend",
        title: `Frequent ${group.name} spending`,
        description: `${Math.round(txPerMonth)} transactions/month averaging ${(total / group.expenses.length).toFixed(0)} each`,
        amount: monthlyAvg,
        frequency: `${Math.round(txPerMonth)}x/month`,
        annualCost: monthlyAvg * 12,
        transactions: group.expenses.slice(0, 5).map((e) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          date: e.date.toISOString(),
        })),
        severity: monthlyAvg * 12 > 10000 ? "high" : monthlyAvg * 12 > 3000 ? "medium" : "low",
      });
    }
  }

  // --- 3. Detect Small Impulse Charges ---
  // Lots of small transactions (<200) that add up
  const smallExpenses = expenses.filter((e) => Number(e.amount) < 200);
  if (smallExpenses.length > 20) {
    const totalSmall = smallExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const monthlySmall = totalSmall / 6;

    if (monthlySmall > 500) {
      leaks.push({
        type: "impulse",
        title: "Small impulse purchases",
        description: `${smallExpenses.length} small transactions under 200 in 6 months`,
        amount: monthlySmall,
        frequency: `${Math.round(smallExpenses.length / 6)}/month`,
        annualCost: monthlySmall * 12,
        transactions: smallExpenses.slice(0, 5).map((e) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          date: e.date.toISOString(),
        })),
        severity: monthlySmall * 12 > 10000 ? "high" : monthlySmall * 12 > 5000 ? "medium" : "low",
      });
    }
  }

  // Sort by severity then annual cost
  const severityOrder = { high: 0, medium: 1, low: 2 };
  leaks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.annualCost - a.annualCost);

  const totalMonthly = leaks.reduce((s, l) => s + l.amount, 0);

  return {
    totalLeaks: leaks.length,
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    leaks,
  };
}
