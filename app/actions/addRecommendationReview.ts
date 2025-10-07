"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  recommendationId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(1000).optional(),
});

export async function addRecommendationReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  const parsed = schema.parse({
    recommendationId: String(formData.get("recommendationId") || ""),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  // Verify recommendation exists
  const recommendation = await prisma.recommendation.findUnique({
    where: { id: parsed.recommendationId },
    select: { id: true },
  });

  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  // Check if user already reviewed this
  const existing = await prisma.recommendationReview.findUnique({
    where: {
      recommendationId_reviewerId: {
        recommendationId: parsed.recommendationId,
        reviewerId: userId,
      },
    },
  });

  if (existing) {
    // Update existing review
    await prisma.recommendationReview.update({
      where: { id: existing.id },
      data: {
        rating: parsed.rating,
        notes: parsed.notes,
      },
    });
  } else {
    // Create new review
    await prisma.recommendationReview.create({
      data: {
        recommendationId: parsed.recommendationId,
        reviewerId: userId,
        rating: parsed.rating,
        notes: parsed.notes,
      },
    });
  }

  revalidatePath("/recommendations");
}

export async function deleteRecommendationReview(recommendationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  await prisma.recommendationReview.deleteMany({
    where: {
      recommendationId,
      reviewerId: userId,
    },
  });

  revalidatePath("/recommendations");
}
