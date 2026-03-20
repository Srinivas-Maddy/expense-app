import { prisma } from "@expense-app/db";
import { AppError } from "../middleware/errorHandler";

export async function getNotifications(
  userId: string,
  opts: { page: number; limit: number; unreadOnly: boolean },
) {
  const where: Record<string, unknown> = { userId };
  if (opts.unreadOnly) where.isRead = false;

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data,
    meta: {
      page: opts.page,
      limit: opts.limit,
      total,
      totalPages: Math.ceil(total / opts.limit),
    },
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(userId: string, id: string) {
  const notif = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notif) throw new AppError(404, "NOT_FOUND", "Notification not found");

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(userId: string, id: string) {
  const notif = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notif) throw new AppError(404, "NOT_FOUND", "Notification not found");
  await prisma.notification.delete({ where: { id } });
}
