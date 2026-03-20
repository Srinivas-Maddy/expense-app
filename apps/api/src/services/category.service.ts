import { prisma } from "@expense-app/db";
import type { CreateCategoryInput } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";

export async function getCategories(userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: { name: input.name, userId },
  });
  if (existing) throw new AppError(409, "CONFLICT", "Category already exists");

  return prisma.category.create({
    data: { ...input, userId, isDefault: false },
  });
}

export async function deleteCategory(userId: string, id: string) {
  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) throw new AppError(404, "NOT_FOUND", "Category not found or is a default category");

  // Check if category is in use
  const usageCount = await prisma.expense.count({ where: { categoryId: id } });
  if (usageCount > 0) {
    throw new AppError(400, "IN_USE", "Cannot delete category that has expenses");
  }

  await prisma.category.delete({ where: { id } });
}
