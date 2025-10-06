import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPost } from "../actions/createPost";
import PostCard from "./PostCard";

export default async function FeedPage() {
  const session = await auth();

  if (!session) {
    redirect("/welcome");
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: { include: { profile: true } } }
  });

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <form action={createPost} className="space-y-3">
          <textarea
            name="body"
            placeholder="Share something helpful…"
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
          />
          <div className="flex items-center gap-3">
            <select name="visibility" className="rounded-lg border border-amber-200 px-3 py-2 text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button className="rounded-lg bg-amber-600 text-white px-6 py-2 font-medium hover:bg-amber-700">
              Post
            </button>
          </div>
        </form>
      </div>

      <section className="space-y-4">
        {posts.map(p => (
          <PostCard key={p.id} post={p} currentUserId={session.user!.id!} />
        ))}
      </section>
    </main>
  );
}
