import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PeopleSearchClient from "./PeopleSearchClient";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/welcome");
  }

  const searchQuery = searchParams.q || "";

  // Search for users
  const users = searchQuery
    ? await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: "insensitive" } },
            { name: { contains: searchQuery, mode: "insensitive" } },
            {
              profile: {
                displayName: { contains: searchQuery, mode: "insensitive" },
              },
            },
          ],
          NOT: {
            id: session.user.id, // Exclude current user
          },
        },
        take: 20,
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
              region: true,
            },
          },
          _count: {
            select: {
              follows: true,
              followers: true,
              posts: true,
            },
          },
        },
      })
    : [];

  // Get current user's following list
  const following = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followeeId: true },
  });

  const followingIds = following.map((f) => f.followeeId);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-3xl font-bold text-ink-900 mb-6">Find People</h1>

        <PeopleSearchClient
          users={users}
          followingIds={followingIds}
          initialQuery={searchQuery}
        />
      </div>
    </main>
  );
}
