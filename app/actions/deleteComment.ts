"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Find the comment and verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new Error("Not authorized to delete this comment");
  }

  // Delete the comment (cascades to children due to schema)
  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/feed");
}
