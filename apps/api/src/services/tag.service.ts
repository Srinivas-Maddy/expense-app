import { prisma } from "@expense-app/db";
import type { CreateTagInput, UpdateTagInput } from "@expense-app/shared";
import { AppError } from "../middleware/errorHandler";

export async function getTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createTag(userId: string, input: CreateTagInput) {
  const existing = await prisma.tag.findFirst({
    where: { name: input.name, userId },
  });
  if (existing) throw new AppError(409, "CONFLICT", "Tag already exists");

  return prisma.tag.create({
    data: { ...input, userId },
  });
}

export async function updateTag(userId: string, id: string, input: UpdateTagInput) {
  const existing = await prisma.tag.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Tag not found");

  if (input.name) {
    const dup = await prisma.tag.findFirst({ where: { name: input.name, userId, NOT: { id } } });
    if (dup) throw new AppError(409, "CONFLICT", "Tag with this name already exists");
  }

  return prisma.tag.update({ where: { id }, data: input });
}

export async function deleteTag(userId: string, id: string) {
  const existing = await prisma.tag.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "NOT_FOUND", "Tag not found");
  await prisma.tag.delete({ where: { id } });
}

/** Resolve tag IDs + create new tags inline, return final tag ID list */
export async function resolveTags(
  userId: string,
  tagIds?: string[],
  newTags?: string[],
): Promise<string[]> {
  const ids = [...(tagIds ?? [])];

  if (newTags && newTags.length > 0) {
    for (const name of newTags) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      let tag = await prisma.tag.findFirst({ where: { name: trimmed, userId } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: trimmed, userId } });
      }
      if (!ids.includes(tag.id)) ids.push(tag.id);
    }
  }

  return ids;
}
