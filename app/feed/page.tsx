import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const session = await auth();

  if (!session) {
    redirect("/welcome");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      body: true,
      createdAt: true,
      visibility: true,
      authorId: true,
      postType: true,
      energyLevel: true,
      author: {
        select: {
          username: true,
          name: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      reactions: {
        select: {
          kind: true,
          userId: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <FeedClient posts={posts} currentUserId={session.user!.id!} />
    </main>
  );
}
