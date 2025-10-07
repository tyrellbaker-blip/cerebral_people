"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  recommendationId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  region: z.string().max(100).optional(),
  url: z.string().url().optional().or(z.literal("")),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function updateRecommendation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Parse meta if it exists
  let meta = undefined;
  const metaStr = formData.get("meta")?.toString();
  if (metaStr) {
    try {
      meta = JSON.parse(metaStr);
    } catch {
      throw new Error("Invalid meta JSON");
    }
  }

  const parsed = schema.parse({
    recommendationId: String(formData.get("recommendationId") || ""),
    title: String(formData.get("title") || ""),
    body: String(formData.get("body") || ""),
    region: formData.get("region") ? String(formData.get("region")) : undefined,
    url: formData.get("url") ? String(formData.get("url")) : undefined,
    meta,
  });

  // Find the recommendation and verify ownership
  const recommendation = await prisma.recommendation.findUnique({
    where: { id: parsed.recommendationId },
    select: { authorId: true },
  });

  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  if (recommendation.authorId !== userId) {
    throw new Error("Not authorized to edit this recommendation");
  }

  // Update the recommendation
  await prisma.recommendation.update({
    where: { id: parsed.recommendationId },
    data: {
      title: parsed.title,
      body: parsed.body,
      region: parsed.region,
      url: parsed.url || undefined,
      meta: (parsed.meta as Prisma.JsonValue) || Prisma.JsonNull,
    },
  });

  revalidatePath("/recommendations");
}
