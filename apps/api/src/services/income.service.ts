import { prisma } from "@expense-app/db";
import type { CreateIncomeInput, UpdateIncomeInput, IncomeQuery } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";
import { resolveTags } from "./tag.service";

export async function getIncomes(userId: string, query: IncomeQuery) {
  const { page, limit, startDate, endDate, accountId, search, tagId, minAmount, maxAmount } = query;
  const where: any = { userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }
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
      { source: { contains: search, mode: "insensitive" } },
      { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, type: true } },
        tags: true,
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.income.count({ where }),
  ]);

  return {
    data: data.map((i) => ({ ...i, amount: Number(i.amount) })),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createIncome(userId: string, input: CreateIncomeInput) {
  const { tagIds, newTags, ...incomeData } = input;
  const resolvedTagIds = await resolveTags(userId, tagIds, newTags);

  const income = await prisma.income.create({
    data: {
      ...incomeData,
      date: new Date(input.date),
      userId,
      tags: resolvedTagIds.length > 0 ? { connect: resolvedTagIds.map((id) => ({ id })) } : undefined,
    },
    include: { tags: true },
  });
  return { ...income, amount: Number(income.amount) };
}

export async function updateIncome(userId: string, id: string, input: UpdateIncomeInput) {
  const existing = await prisma.income.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Income not found");

  const { tagIds, newTags, ...incomeData } = input;
  let tagsUpdate: any = undefined;
  if (tagIds !== undefined || newTags !== undefined) {
    const resolvedTagIds = await resolveTags(userId, tagIds, newTags);
    tagsUpdate = { set: resolvedTagIds.map((tid) => ({ id: tid })) };
  }

  const income = await prisma.income.update({
    where: { id },
    data: {
      ...incomeData,
      date: input.date ? new Date(input.date) : undefined,
      tags: tagsUpdate,
    },
    include: { tags: true },
  });
  return { ...income, amount: Number(income.amount) };
}

export async function deleteIncome(userId: string, id: string) {
  const existing = await prisma.income.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Income not found");
  await prisma.income.delete({ where: { id } });
}
