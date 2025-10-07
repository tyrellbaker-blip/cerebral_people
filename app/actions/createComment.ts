"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "./notifications";

const schema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = schema.parse({
    postId: String(formData.get("postId") || ""),
    body: String(formData.get("body") || ""),
    parentId: formData.get("parentId") ? String(formData.get("parentId")) : undefined,
  });

  const userId = (session.user as any).id;

  // Verify the post exists and get author info
  const post = await prisma.post.findUnique({
    where: { id: parsed.postId },
    select: {
      id: true,
      authorId: true,
      author: {
        select: { username: true }
      }
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  let parentCommentAuthorId: string | null = null;

  // If replying to a comment, verify it exists and belongs to the same post
  if (parsed.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parsed.parentId },
      select: { postId: true, authorId: true },
    });

    if (!parentComment || parentComment.postId !== parsed.postId) {
      throw new Error("Parent comment not found or doesn't belong to this post");
    }

    parentCommentAuthorId = parentComment.authorId;
  }

  await prisma.comment.create({
    data: {
      postId: parsed.postId,
      authorId: userId,
      body: parsed.body,
      parentId: parsed.parentId,
    },
  });

  // Get commenter info for notification
  const commenter = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, name: true },
  });

  // Notify post author (if not commenting on own post)
  if (post.authorId !== userId) {
    await createNotification(post.authorId, "NEW_COMMENT", {
      commenterUsername: commenter?.username,
      commenterName: commenter?.name,
      postId: parsed.postId,
      isReply: false,
    });
  }

  // Notify parent comment author (if replying and not replying to self)
  if (parentCommentAuthorId && parentCommentAuthorId !== userId) {
    await createNotification(parentCommentAuthorId, "NEW_COMMENT", {
      commenterUsername: commenter?.username,
      commenterName: commenter?.name,
      postId: parsed.postId,
      isReply: true,
    });
  }

  revalidatePath("/feed");
}
