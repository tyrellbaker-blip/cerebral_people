import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NetworkClient from "./NetworkClient";

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/welcome");
  }

  const currentTab = searchParams.tab || "following";

  // Get followers
  const followers = await prisma.follow.findMany({
    where: { followeeId: session.user.id },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          profile: {
            select: {
              displayName: true,
              bio: true,
              cpSubtype: true,
              gmfcs: true,
            },
          },
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get following
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    include: {
      followee: {
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          profile: {
            select: {
              displayName: true,
              bio: true,
              cpSubtype: true,
              gmfcs: true,
            },
          },
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get mutual follows (people you follow who also follow you)
  const followingIds = following.map((f) => f.followeeId);
  const followerIds = followers.map((f) => f.followerId);
  const mutualIds = followingIds.filter((id) => followerIds.includes(id));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold text-ink-900 mb-6">My Network</h1>

        <NetworkClient
          followers={followers.map((f) => f.follower)}
          following={following.map((f) => f.followee)}
          mutualIds={mutualIds}
          currentTab={currentTab}
          currentUserId={session.user.id}
        />
      </div>
    </main>
  );
}
