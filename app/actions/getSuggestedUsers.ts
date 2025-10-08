"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore, getDistanceString } from "@/lib/matchScoring";

export interface SuggestedUser {
  id: string;
  username: string | null;
  displayName: string | null;
  image: string | null;
  cpSubtype: string | null;
  gmfcs: string | null;
  distance: string;
  matchScore: number;
}

export async function getSuggestedUsers(): Promise<SuggestedUser[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const currentUserId = (session.user as any).id as string;

  // Get current user's profile with location
  const currentUserProfile = await prisma.profile.findUnique({
    where: { userId: currentUserId },
    select: {
      latitude: true,
      longitude: true,
      cpSubtype: true,
      gmfcs: true,
    },
  });

  if (!currentUserProfile?.latitude || !currentUserProfile?.longitude) {
    // User doesn't have location data yet
    return [];
  }

  // Get users the current user is already following
  const following = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followeeId: true },
  });

  const followingIds = following.map((f) => f.followeeId);

  // Get all potential matches (users not currently followed and not self)
  const potentialMatches = await prisma.user.findMany({
    where: {
      AND: [
        { id: { not: currentUserId } },
        { id: { notIn: followingIds } },
      ],
    },
    select: {
      id: true,
      username: true,
      image: true,
      profile: {
        select: {
          displayName: true,
          latitude: true,
          longitude: true,
          cpSubtype: true,
          gmfcs: true,
        },
      },
    },
    take: 100, // Limit initial fetch for performance
  });

  // Filter out users without location data and calculate scores
  const scoredUsers = potentialMatches
    .filter((user) => user.profile?.latitude && user.profile?.longitude)
    .map((user) => {
      const matchScore = calculateMatchScore(
        {
          latitude: currentUserProfile.latitude!.toNumber(),
          longitude: currentUserProfile.longitude!.toNumber(),
          cpSubtype: currentUserProfile.cpSubtype,
          gmfcs: currentUserProfile.gmfcs,
        },
        {
          latitude: user.profile!.latitude!.toNumber(),
          longitude: user.profile!.longitude!.toNumber(),
          cpSubtype: user.profile!.cpSubtype,
          gmfcs: user.profile!.gmfcs,
        }
      );

      const distance = getDistanceString(
        {
          latitude: currentUserProfile.latitude!.toNumber(),
          longitude: currentUserProfile.longitude!.toNumber(),
          cpSubtype: currentUserProfile.cpSubtype,
          gmfcs: currentUserProfile.gmfcs,
        },
        {
          latitude: user.profile!.latitude!.toNumber(),
          longitude: user.profile!.longitude!.toNumber(),
          cpSubtype: user.profile!.cpSubtype,
          gmfcs: user.profile!.gmfcs,
        }
      );

      return {
        id: user.id,
        username: user.username,
        displayName: user.profile!.displayName,
        image: user.image,
        cpSubtype: user.profile!.cpSubtype,
        gmfcs: user.profile!.gmfcs,
        distance,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore) // Sort by score descending
    .slice(0, 20); // Return top 20

  return scoredUsers;
}
