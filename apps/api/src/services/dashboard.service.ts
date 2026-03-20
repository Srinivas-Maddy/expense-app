import { prisma } from "@expense-app/db";
import type { DashboardSummary, CategoryBreakdown, MonthComparison } from "@expense-app/shared";

function getMonthRange(month: string) {
  const start = new Date(`${month}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { start, end };
}

export async function getSummary(userId: string, month: string): Promise<DashboardSummary> {
  const { start, end } = getMonthRange(month);

  const [expenseAgg, incomeAgg] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.income.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
  ]);

  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const totalIncome = Number(incomeAgg._sum.amount ?? 0);

  return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
}

export async function getCategoryBreakdown(
  userId: string,
  month: string,
): Promise<CategoryBreakdown[]> {
  const { start, end } = getMonthRange(month);

  const groups = await prisma.expense.groupBy({
    by: ["categoryId"],
    where: { userId, date: { gte: start, lte: end } },
    _sum: { amount: true },
  });

  if (groups.length === 0) return [];

  const total = groups.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

  const categoryIds = groups.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return groups
    .map((g) => {
      const cat = catMap.get(g.categoryId);
      const amount = Number(g._sum.amount ?? 0);
      return {
        categoryId: g.categoryId,
        categoryName: cat?.name ?? "Unknown",
        total: amount,
        percentage: total > 0 ? Math.round((amount / total) * 10000) / 100 : 0,
        color: cat?.color ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function getPrevMonth(month: string): string {
  const d = new Date(`${month}-01`);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

export async function getMonthComparison(userId: string, month: string): Promise<MonthComparison> {
  const prev = getPrevMonth(month);

  const [currentSummary, prevSummary, currentBreakdown, prevBreakdown] = await Promise.all([
    getSummary(userId, month),
    getSummary(userId, prev),
    getCategoryBreakdown(userId, month),
    getCategoryBreakdown(userId, prev),
  ]);

  // Build category comparison
  const allCatIds = new Set([
    ...currentBreakdown.map((c) => c.categoryId),
    ...prevBreakdown.map((c) => c.categoryId),
  ]);

  const prevMap = new Map(prevBreakdown.map((c) => [c.categoryId, c]));
  const currMap = new Map(currentBreakdown.map((c) => [c.categoryId, c]));

  const categoryComparison = [...allCatIds].map((catId) => {
    const curr = currMap.get(catId);
    const prv = prevMap.get(catId);
    const currentTotal = curr?.total ?? 0;
    const previousTotal = prv?.total ?? 0;
    return {
      categoryId: catId,
      categoryName: curr?.categoryName ?? prv?.categoryName ?? "Unknown",
      color: curr?.color ?? prv?.color ?? null,
      currentTotal,
      previousTotal,
      change: currentTotal - previousTotal,
      changePercent: pctChange(currentTotal, previousTotal),
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // Top increases and decreases
  const topIncreases = categoryComparison.filter((c) => c.change > 0).slice(0, 3);
  const topDecreases = categoryComparison.filter((c) => c.change < 0).slice(0, 3);

  return {
    currentMonth: month,
    previousMonth: prev,
    current: currentSummary,
    previous: prevSummary,
    incomeChange: pctChange(currentSummary.totalIncome, prevSummary.totalIncome),
    expenseChange: pctChange(currentSummary.totalExpenses, prevSummary.totalExpenses),
    balanceChange: currentSummary.balance - prevSummary.balance,
    categoryComparison,
    topIncreases,
    topDecreases,
  };
}
