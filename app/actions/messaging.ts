"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "./notifications";

const sendMessageSchema = z.object({
  threadId: z.string().uuid(),
  body: z.string().min(1).max(2000),
  attachments: z.array(z.string().url()).max(5).optional(),
});

/**
 * Send a message in an existing thread
 */
export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Parse attachments if they exist
  let attachments: string[] | undefined;
  const attachmentsStr = formData.get("attachments")?.toString();
  if (attachmentsStr) {
    try {
      attachments = JSON.parse(attachmentsStr);
    } catch {
      throw new Error("Invalid attachments JSON");
    }
  }

  const parsed = sendMessageSchema.parse({
    threadId: String(formData.get("threadId") || ""),
    body: String(formData.get("body") || ""),
    attachments,
  });

  // Verify thread exists and is not blocked
  const thread = await prisma.messageThread.findUnique({
    where: { id: parsed.threadId },
    select: { isBlocked: true },
  });

  if (!thread) {
    throw new Error("Thread not found");
  }

  if (thread.isBlocked) {
    throw new Error("This conversation has been blocked");
  }

  // Create the message
  await prisma.message.create({
    data: {
      threadId: parsed.threadId,
      senderId: userId,
      body: parsed.body,
      attachments: parsed.attachments || [],
    },
  });

  // TODO: Notify other participants in the thread
  // This requires fetching participants from messages or adding a participants table

  revalidatePath("/messages");
}

/**
 * Block a message thread
 */
export async function blockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Verify user is part of the thread
  const isParticipant = await prisma.message.findFirst({
    where: {
      threadId,
      OR: [
        { senderId: userId },
        {
          thread: {
            createdById: userId,
          },
        },
      ],
    },
  });

  if (!isParticipant) {
    throw new Error("Not authorized to block this thread");
  }

  await prisma.messageThread.update({
    where: { id: threadId },
    data: { isBlocked: true },
  });

  revalidatePath("/messages");
}

/**
 * Unblock a message thread
 */
export async function unblockThread(threadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Verify user created the thread or is a participant
  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: { createdById: true },
  });

  if (!thread || thread.createdById !== userId) {
    throw new Error("Not authorized to unblock this thread");
  }

  await prisma.messageThread.update({
    where: { id: threadId },
    data: { isBlocked: false },
  });

  revalidatePath("/messages");
}
