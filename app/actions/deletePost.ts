"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // Find the post and verify ownership
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.authorId !== session.user.id) {
    throw new Error("Not authorized to delete this post");
  }

  // Delete the post
  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/feed");
}