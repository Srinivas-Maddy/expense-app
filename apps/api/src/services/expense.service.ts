import { prisma } from "@expense-app/db";
import type { CreateExpenseInput, UpdateExpenseInput, ExpenseQuery } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";
import { resolveTags } from "./tag.service";

export async function getExpenses(userId: string, query: ExpenseQuery) {
  const { page, limit, startDate, endDate, categoryId, accountId, search, tagId, minAmount, maxAmount } = query;
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.accountId = accountId;
  if (tagId) where.tags = { some: { id: tagId } };
  if (minAmount !== undefined || maxAmount !== undefined) {
    where.amount = {
      ...(minAmount !== undefined && { gte: minAmount }),
      ...(maxAmount !== undefined && { lte: maxAmount }),
    };
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { category: { name: { contains: search, mode: "insensitive" } } },
      { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        account: { select: { id: true, name: true, type: true } },
        tags: true,
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    data: data.map((e) => ({ ...e, amount: Number(e.amount) })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createExpense(userId: string, input: CreateExpenseInput) {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
  });
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");

  const { tagIds, newTags, ...expenseData } = input;
  const resolvedTagIds = await resolveTags(userId, tagIds, newTags);

  const expense = await prisma.expense.create({
    data: {
      ...expenseData,
      date: new Date(input.date),
      userId,
      tags: resolvedTagIds.length > 0 ? { connect: resolvedTagIds.map((id) => ({ id })) } : undefined,
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
      tags: true,
    },
  });
  return { ...expense, amount: Number(expense.amount) };
}

export async function updateExpense(userId: string, id: string, input: UpdateExpenseInput) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Expense not found");

  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw new AppError(404, "NOT_FOUND", "Category not found");
  }

  const { tagIds, newTags, ...expenseData } = input;
  let tagsUpdate: any = undefined;
  if (tagIds !== undefined || newTags !== undefined) {
    const resolvedTagIds = await resolveTags(userId, tagIds, newTags);
    tagsUpdate = { set: resolvedTagIds.map((tid) => ({ id: tid })) };
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...expenseData,
      date: input.date ? new Date(input.date) : undefined,
      tags: tagsUpdate,
    },
    include: {
      category: { select: { id: true, name: true, color: true } },
      tags: true,
    },
  });
  return { ...expense, amount: Number(expense.amount) };
}

export async function deleteExpense(userId: string, id: string) {
  const existing = await prisma.expense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Expense not found");
  await prisma.expense.delete({ where: { id } });
}
