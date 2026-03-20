import { prisma } from "@expense-app/db";
import type { CreateBudgetInput, UpdateBudgetInput, Budget } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";

export async function getBudgets(userId: string, month: string): Promise<Budget[]> {
  const budgets = await prisma.budget.findMany({
    where: { userId, month },
    include: { category: { select: { id: true, name: true, color: true } } },
  });

  const start = new Date(`${month}-01`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);

  // Calculate spent amounts
  const result: Budget[] = [];
  for (const b of budgets) {
    let spent: number;
    if (b.categoryId) {
      const agg = await prisma.expense.aggregate({
        where: { userId, categoryId: b.categoryId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      spent = Number(agg._sum.amount ?? 0);
    } else {
      // Overall budget
      const agg = await prisma.expense.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      });
      spent = Number(agg._sum.amount ?? 0);
    }

    const amount = Number(b.amount);
    const remaining = amount - spent;
    const percentUsed = amount > 0 ? Math.round((spent / amount) * 10000) / 100 : 0;

    result.push({
      id: b.id,
      userId: b.userId,
      categoryId: b.categoryId,
      category: b.category,
      month: b.month,
      amount,
      spent,
      remaining,
      percentUsed,
      isExceeded: spent > amount,
    });
  }

  return result;
}

export async function createBudget(userId: string, input: CreateBudgetInput) {
  const existing = await prisma.budget.findFirst({
    where: { userId, categoryId: input.categoryId ?? null, month: input.month },
  });
  if (existing) throw new AppError(409, "CONFLICT", "Budget already exists for this month/category");

  if (input.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!cat) throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId ?? null,
      month: input.month,
      amount: input.amount,
    },
    include: { category: { select: { id: true, name: true, color: true } } },
  });

  return { ...budget, amount: Number(budget.amount) };
}

export async function updateBudget(userId: string, id: string, input: UpdateBudgetInput) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Budget not found");

  const budget = await prisma.budget.update({
    where: { id },
    data: { amount: input.amount },
    include: { category: { select: { id: true, name: true, color: true } } },
  });

  return { ...budget, amount: Number(budget.amount) };
}

export async function deleteBudget(userId: string, id: string) {
  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Budget not found");
  await prisma.budget.delete({ where: { id } });
}

export async function checkBudgetAlerts(userId: string, month: string) {
  const budgets = await getBudgets(userId, month);
  const alerts = budgets.filter((b) => b.percentUsed >= 80);

  for (const b of alerts) {
    const label = b.category ? b.category.name : "Overall";
    const existingNotif = await prisma.notification.findFirst({
      where: {
        userId,
        type: "budget_alert",
        metadata: { contains: b.id },
        createdAt: { gte: new Date(`${month}-01`) },
      },
    });

    if (!existingNotif) {
      const title = b.isExceeded
        ? `Budget exceeded: ${label}`
        : `Budget warning: ${label}`;
      const message = b.isExceeded
        ? `You've spent $${b.spent.toFixed(2)} of your $${b.amount.toFixed(2)} ${label} budget.`
        : `You've used ${b.percentUsed}% of your $${b.amount.toFixed(2)} ${label} budget.`;

      await prisma.notification.create({
        data: {
          userId,
          type: "budget_alert",
          title,
          message,
          metadata: JSON.stringify({ budgetId: b.id }),
        },
      });
    }
  }

  return alerts;
}
