import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import FeedClient from "./FeedClient";
import {
  CalmCornerCard,
  PeopleToFollow,
  AccessibilityQuickToggles,
  KeyboardShortcutsCard,
  SafetyCard,
  EnergyFiltersCard,
} from "./RightRail";

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
          image: true,
          profile: {
            select: {
              displayName: true,
              isVerified: true,
              profileType: true,
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
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          authorId: true,
          parentId: true,
          author: {
            select: {
              username: true,
              name: true,
              image: true,
              profile: {
                select: {
                  displayName: true,
                  isVerified: true,
                  profileType: true,
                },
              },
            },
          },
        },
      },
      tags: {
        select: {
          tag: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Feed column */}
          <section className="lg:col-span-7 xl:col-span-8">
            <div className="max-w-3xl">
              <FeedClient posts={posts} currentUserId={session.user!.id!} />
            </div>
          </section>

          {/* Right rail - visible on all screen sizes */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-4">
              <CalmCornerCard />
              <EnergyFiltersCard />
              <PeopleToFollow />
              <AccessibilityQuickToggles />
              <KeyboardShortcutsCard />
              <SafetyCard />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
