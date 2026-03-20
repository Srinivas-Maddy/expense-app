import { prisma } from "@expense-app/db";
import type { CreateAccountInput, UpdateAccountInput } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";

export async function getAccounts(userId: string) {
  const accounts = await prisma.account.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return accounts.map((a) => ({ ...a, balance: Number(a.balance) }));
}

export async function createAccount(userId: string, input: CreateAccountInput) {
  const existing = await prisma.account.findFirst({
    where: { name: input.name, userId },
  });
  if (existing) throw new AppError(409, "CONFLICT", "Account with this name already exists");

  const account = await prisma.account.create({
    data: { ...input, userId },
  });
  return { ...account, balance: Number(account.balance) };
}

export async function updateAccount(userId: string, id: string, input: UpdateAccountInput) {
  const existing = await prisma.account.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Account not found");

  const account = await prisma.account.update({
    where: { id },
    data: input,
  });
  return { ...account, balance: Number(account.balance) };
}

export async function deleteAccount(userId: string, id: string) {
  const existing = await prisma.account.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Account not found");

  // Check if account has transactions
  const [expCount, incCount] = await Promise.all([
    prisma.expense.count({ where: { accountId: id } }),
    prisma.income.count({ where: { accountId: id } }),
  ]);
  if (expCount + incCount > 0) {
    throw new AppError(400, "IN_USE", "Cannot delete account with existing transactions. Remove or reassign transactions first.");
  }

  await prisma.account.delete({ where: { id } });
}
