"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addReaction(
  postId: string,
  kind: "SUPPORT" | "PROUD" | "HELPFUL"
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Check if reaction already exists
  const existing = await prisma.reaction.findFirst({
    where: {
      userId,
      postId,
    },
  });

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