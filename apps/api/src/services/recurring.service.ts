import { prisma } from "@expense-app/db";
import type { CreateRecurringExpenseInput, UpdateRecurringExpenseInput } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";

export async function getRecurringExpenses(userId: string) {
  const items = await prisma.recurringExpense.findMany({
    where: { userId },
    orderBy: { nextRunDate: "asc" },
  });
  return items.map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function createRecurringExpense(userId: string, input: CreateRecurringExpenseInput) {
  const item = await prisma.recurringExpense.create({
    data: {
      ...input,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      nextRunDate: new Date(input.startDate),
      userId,
    },
  });
  return { ...item, amount: Number(item.amount) };
}

export async function updateRecurringExpense(userId: string, id: string, input: UpdateRecurringExpenseInput) {
  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Recurring expense not found");

  const data: Record<string, unknown> = { ...input };
  if (input.startDate) data.startDate = new Date(input.startDate);
  if (input.endDate) data.endDate = new Date(input.endDate);
  if (input.endDate === null) data.endDate = null;

  const item = await prisma.recurringExpense.update({
    where: { id },
    data,
  });
  return { ...item, amount: Number(item.amount) };
}

export async function deleteRecurringExpense(userId: string, id: string) {
  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Recurring expense not found");
  await prisma.recurringExpense.delete({ where: { id } });
}

export async function toggleRecurringExpense(userId: string, id: string) {
  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Recurring expense not found");

  const item = await prisma.recurringExpense.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  return { ...item, amount: Number(item.amount) };
}

function getNextDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case "daily": next.setDate(next.getDate() + 1); break;
    case "weekly": next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly": next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}

/** Called by a cron job or on-demand to process due recurring expenses */
export async function processRecurringExpenses() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = await prisma.recurringExpense.findMany({
    where: { isActive: true, nextRunDate: { lte: today } },
  });

  let created = 0;
  for (const r of due) {
    // Check end date
    if (r.endDate && r.endDate < today) {
      await prisma.recurringExpense.update({ where: { id: r.id }, data: { isActive: false } });
      continue;
    }

    // Create the expense
    await prisma.expense.create({
      data: {
        amount: r.amount,
        description: r.description,
        date: today,
        userId: r.userId,
        categoryId: r.categoryId,
        accountId: r.accountId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: r.userId,
        type: "recurring_created",
        title: "Recurring expense added",
        message: `$${Number(r.amount).toFixed(2)} for "${r.description}" was automatically added.`,
        metadata: JSON.stringify({ recurringExpenseId: r.id }),
      },
    });

    // Advance next run date
    const nextDate = getNextDate(new Date(r.nextRunDate), r.frequency);
    await prisma.recurringExpense.update({
      where: { id: r.id },
      data: { nextRunDate: nextDate },
    });

    created++;
  }

  return { processed: due.length, created };
}
