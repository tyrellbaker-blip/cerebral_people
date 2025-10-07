"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePost(
  postId: string,
  body: string,
  visibility: string,
  tags?: string[]
) {
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
    throw new Error("Not authorized to edit this post");
  }

  // Update the post
  await prisma.post.update({
    where: { id: postId },
    data: {
      body,
      visibility: visibility as "PUBLIC" | "FOLLOWERS" | "PRIVATE",
    },
  });

  // Update tags if provided
  if (tags !== undefined) {
    // Delete existing tags
    await prisma.postTag.deleteMany({
      where: { postId },
    });

    // Create new tags
    if (tags.length > 0) {
      await prisma.postTag.createMany({
        data: tags.map(tag => ({
          postId,
          tag: tag.toLowerCase(),
        })),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath("/feed");
}