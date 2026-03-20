import { prisma } from "@expense-app/db";
import type { MonthlyTrend } from "@expense-app/shared";

export async function getMonthlyTrends(userId: string, months: number): Promise<MonthlyTrend[]> {
  const now = new Date();
  const results: MonthlyTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const [expAgg, incAgg] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
    ]);

    const totalExpenses = Number(expAgg._sum.amount ?? 0);
    const totalIncome = Number(incAgg._sum.amount ?? 0);

    results.push({
      month,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    });
  }

  return results;
}
