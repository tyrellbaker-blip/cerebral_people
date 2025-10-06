"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function recalcBadges() {
  const session = await auth();
  if (!session?.user?.id) return;

  const userId = session.user.id;

  // Fetch counts
  const [posts, recommendations] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.recommendation.count({ where: { authorId: userId } }).catch(() => 0),
  ]);

  // Calculate badges
  const badges = new Set<string>();
  badges.add("18_PLUS"); // All users have confirmed 18+

  if (posts >= 1) badges.add("FIRST_POST");
  if (posts >= 10) badges.add("ACTIVE_MEMBER");
  if (recommendations >= 3) badges.add("REC_HELPER");
  if (recommendations >= 10) badges.add("COMMUNITY_GUIDE");

  // Update profile with new badges
  await prisma.profile.upsert({
    where: { userId },
    update: { badges: Array.from(badges) },
    create: {
      userId,
      badges: Array.from(badges),
      a11yPrefs: {},
      visibility: {},
    },
  });
}