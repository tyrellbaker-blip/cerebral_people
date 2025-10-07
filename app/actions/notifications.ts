"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Create a notification for a user
 */
export async function createNotification(
  userId: string,
  type: "NEW_FOLLOW" | "NEW_COMMENT" | "NEW_REACTION" | "NEW_MESSAGE" | "MODERATION" | "SYSTEM",
  payload: any
) {
  await prisma.notification.create({
    data: {
      userId,
      type,
      payload,
    },
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Verify ownership
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  revalidatePath("/notifications");
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/notifications");
}

/**
 * Get unread notification count for the current user
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const userId = (session.user as any).id;

  return await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}
