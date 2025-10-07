"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export async function addReaction(
  postId: string,
  kind: "SUPPORT" | "PROUD" | "HELPFUL"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Get post info
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Check if reaction already exists
  const existing = await prisma.reaction.findFirst({
    where: {
      userId,
      postId,
    },
  });

  const isNewReaction = !existing;

  if (existing) {
    // Update existing reaction
    await prisma.reaction.update({
      where: { id: existing.id },
      data: { kind },
    });
  } else {
    // Create new reaction
    await prisma.reaction.create({
      data: {
        userId,
        postId,
        kind,
      },
    });
  }

  // Notify post author (only for new reactions, not updates, and not reacting to own post)
  if (isNewReaction && post.authorId !== userId) {
    const reactor = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, name: true },
    });

    await createNotification(post.authorId, "NEW_REACTION", {
      reactorUsername: reactor?.username,
      reactorName: reactor?.name,
      postId,
      reactionKind: kind,
    });
  }

  revalidatePath("/feed");
}

export async function removeReaction(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  await prisma.reaction.deleteMany({
    where: {
      userId,
      postId,
    },
  });

  revalidatePath("/feed");
}