"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export async function followUser(username: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const followerId = (session.user as any).id;

  // Find the user to follow
  const userToFollow = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!userToFollow) {
    throw new Error("User not found");
  }

  // Can't follow yourself
  if (userToFollow.id === followerId) {
    throw new Error("Cannot follow yourself");
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followeeId: {
        followerId,
        followeeId: userToFollow.id,
      },
    },
  });

  if (existingFollow) {
    throw new Error("Already following this user");
  }

  // Create the follow relationship
  await prisma.follow.create({
    data: {
      followerId,
      followeeId: userToFollow.id,
    },
  });

  // Create notification for the followed user
  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { username: true, name: true },
  });

  await createNotification(userToFollow.id, "NEW_FOLLOW", {
    followerUsername: follower?.username,
    followerName: follower?.name,
  });

  revalidatePath(`/profile/${username}`);
  revalidatePath("/feed");
}

export async function unfollowUser(username: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const followerId = (session.user as any).id;

  // Find the user to unfollow
  const userToUnfollow = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!userToUnfollow) {
    throw new Error("User not found");
  }

  // Delete the follow relationship
  await prisma.follow.deleteMany({
    where: {
      followerId,
      followeeId: userToUnfollow.id,
    },
  });

  revalidatePath(`/profile/${username}`);
  revalidatePath("/feed");
}
