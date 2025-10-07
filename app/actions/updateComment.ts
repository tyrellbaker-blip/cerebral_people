"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  commentId: z.string().uuid(),
  body: z.string().min(1).max(1000),
});

export async function updateComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = schema.parse({
    commentId: String(formData.get("commentId") || ""),
    body: String(formData.get("body") || ""),
  });

  const userId = (session.user as any).id;

  // Find the comment and verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: parsed.commentId },
    select: { authorId: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId) {
    throw new Error("Not authorized to edit this comment");
  }

  // Update the comment
  await prisma.comment.update({
    where: { id: parsed.commentId },
    data: { body: parsed.body },
  });

  revalidatePath("/feed");
}
