"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  body: z.string().min(1).max(2000),
  visibility: z.enum(["PUBLIC","FOLLOWERS","PRIVATE"]).default("PUBLIC"),
  postType: z.enum(["GENERAL","ASSISTIVE_WIN","QUESTION","RECOMMENDATION"]).default("GENERAL"),
  energyLevel: z.coerce.number().int().min(1).max(4).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export async function createPost(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Parse tags if they exist (comma-separated string)
    let tags: string[] | undefined;
    const tagsStr = formData.get("tags")?.toString();
    if (tagsStr) {
      tags = tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
    }

    const parsed = schema.parse({
      body: String(formData.get("body") || ""),
      visibility: String(formData.get("visibility") || "PUBLIC"),
      postType: String(formData.get("postType") || "GENERAL"),
      energyLevel: formData.get("energyLevel") ? Number(formData.get("energyLevel")) : undefined,
      tags,
    });

    const post = await prisma.post.create({
      data: {
        authorId: (session.user as any).id,
        body: parsed.body,
        visibility: parsed.visibility as any,
        postType: parsed.postType as any,
        energyLevel: parsed.energyLevel,
      },
    });

    // Create tags if provided
    if (parsed.tags && parsed.tags.length > 0) {
      await prisma.postTag.createMany({
        data: parsed.tags.map(tag => ({
          postId: post.id,
          tag: tag.toLowerCase(), // Store tags in lowercase for consistency
        })),
        skipDuplicates: true,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create post" };
  }
}