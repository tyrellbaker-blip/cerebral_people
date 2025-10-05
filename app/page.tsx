import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPost } from "./actions/createPost";

export default async function Home() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { author: { include: { profile: true } } }
  });

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Cerebral People</h1>

      {session ? (
        <form action={createPost} className="space-y-3">
          <textarea
            name="body"
            placeholder="Share something helpful…"
            className="w-full rounded border p-3"
          />
          <select name="visibility" className="rounded border p-2">
            <option value="PUBLIC">Public</option>
            <option value="FOLLOWERS">Followers</option>
            <option value="PRIVATE">Private</option>
          </select>
          <button className="rounded bg-black text-white px-4 py-2">Post</button>
        </form>
      ) : (
        <a href="/api/auth/signin" className="underline">Sign in</a>
      )}

      <section className="space-y-4">
        {posts.map(p => (
          <article key={p.id} className="rounded border p-4">
            <div className="text-sm opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
            <div className="font-medium">{p.author?.profile?.displayName ?? "Someone"}</div>
            <p className="mt-2">{p.body}</p>
            <div className="text-xs mt-2 opacity-60">visibility: {p.visibility}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
