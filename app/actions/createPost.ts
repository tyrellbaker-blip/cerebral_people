"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  body: z.string().min(1).max(2000),
  visibility: z.enum(["PUBLIC","FOLLOWERS","PRIVATE"]).default("PUBLIC"),
  postType: z.enum(["GENERAL","ASSISTIVE_WIN","QUESTION","RECOMMENDATION"]).default("GENERAL"),
  energyLevel: z.coerce.number().int().min(1).max(4).optional(),
});

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = schema.parse({
    body: String(formData.get("body") || ""),
    visibility: String(formData.get("visibility") || "PUBLIC"),
    postType: String(formData.get("postType") || "GENERAL"),
    energyLevel: formData.get("energyLevel") ? Number(formData.get("energyLevel")) : undefined,
  });

  await prisma.post.create({
    data: {
      authorId: (session.user as any).id,
      body: parsed.body,
      visibility: parsed.visibility as any,
      postType: parsed.postType as any,
      energyLevel: parsed.energyLevel,
    },
  });
}