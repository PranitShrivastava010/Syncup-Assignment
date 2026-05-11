import { prisma } from "../lib/prisma";
import { emitNotificationToUser } from "../sockets/notification.socket";
import { createHttpError } from "../utils/httpError";
import { buildPaginationMeta, PaginationParams } from "../utils/pagination";

export type CreateNotificationInput = {
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
};

export const createNotificationService = async (
  userId: string,
  input: CreateNotificationInput
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      title: input.title,
      message: input.message,
      payload: input.payload ? JSON.stringify(input.payload) : undefined,
    },
  });

  emitNotificationToUser(userId, {
    ...notification,
    payload: input.payload ?? null,
  });

  return notification;
};

export const getMyNotificationsService = async (
  userId: string,
  pagination: PaginationParams
) => {
  const where = { userId };
  const [notifications, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    result: notifications,
    pagination: buildPaginationMeta({
      page: pagination.page,
      limit: pagination.limit,
      total,
    }),
  };
};

export const markNotificationReadService = async (
  userId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw createHttpError(404, "Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsReadService = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
};
