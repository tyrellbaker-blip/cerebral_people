"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteRecommendation(recommendationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // Find the recommendation and verify ownership
  const recommendation = await prisma.recommendation.findUnique({
    where: { id: recommendationId },
    select: { authorId: true },
  });

  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  if (recommendation.authorId !== userId) {
    throw new Error("Not authorized to delete this recommendation");
  }

  // Delete the recommendation (cascades to reviews due to schema)
  await prisma.recommendation.delete({
    where: { id: recommendationId },
  });

  revalidatePath("/recommendations");
}
