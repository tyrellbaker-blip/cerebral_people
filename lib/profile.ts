import { prisma } from "@/lib/prisma";

export const DEFAULT_VIS = {
  displayName: "PUBLIC",
  pronouns: "PUBLIC",
  bio: "PUBLIC",
  region: "FOLLOWERS",
  cpSubtype: "FOLLOWERS",
  gmfcs: "FOLLOWERS",
  mobilityAids: "FOLLOWERS",
  assistiveTech: "FOLLOWERS",
  commModes: "FOLLOWERS",
  exerciseTolerance: "FOLLOWERS",
  bestTimes: "FOLLOWERS",
  transport: "FOLLOWERS",
  a11yPrefs: "PRIVATE",
  photos: "PUBLIC",
  badges: "PUBLIC",
} as const;

export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId,
        followeeId,
      },
    },
  });
  return !!follow;
}

export function applyVisibility<T extends Record<string, any>>(
  viewerId: string | null,
  ownerId: string,
  data: T,
  vis: any,
  isFollowerFlag: boolean = false
): Partial<T> {
  const isOwner = viewerId === ownerId;
  const out: any = {};

  for (const key of Object.keys(data)) {
    const mode = (vis?.[key] ?? (DEFAULT_VIS as any)[key] ?? "PUBLIC") as
      | "PUBLIC"
      | "FOLLOWERS"
      | "PRIVATE";

    if (isOwner) {
      // Owner sees everything
      out[key] = data[key];
    } else if (mode === "PUBLIC") {
      // Public fields visible to everyone
      out[key] = data[key];
    } else if (mode === "FOLLOWERS" && isFollowerFlag) {
      // Followers-only fields visible to followers
      out[key] = data[key];
    }
    // PRIVATE fields are never shown to non-owners
  }

  return out as Partial<T>;
}

export async function ensureProfile(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      a11yPrefs: {},
      visibility: DEFAULT_VIS as any,
      badges: ["18_PLUS"],
    },
  });
}
