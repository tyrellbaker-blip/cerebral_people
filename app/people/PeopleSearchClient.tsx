"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { followUser, unfollowUser } from "../actions/followUser";
import { glassCard } from "../components/cardStyles";

interface User {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  profile: {
    displayName: string | null;
    bio: string | null;
    cpSubtype: string | null;
    gmfcs: string | null;
    region: string | null;
  } | null;
  _count: {
    followers: number;
    follows: number;
    posts: number;
  };
}

interface PeopleSearchClientProps {
  users: User[];
  followingIds: string[];
  initialQuery: string;
}

export default function PeopleSearchClient({
  users,
  followingIds,
  initialQuery,
}: PeopleSearchClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/people?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleToggleFollow = (username: string, isFollowing: boolean) => {
    startTransition(async () => {
      if (isFollowing) {
        await unfollowUser(username);
      } else {
        await followUser(username);
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className={`${glassCard} p-4`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="flex-1 rounded-[0.75rem] border border-neutral-200 bg-white/80 px-4 py-2.5 text-ink-900 placeholder:text-ink-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-shadow motion-reduce:transition-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-[0.75rem] bg-brand-500 text-white font-medium shadow-[0_6px_14px_rgba(255,135,65,.25)] hover:bg-brand-600 transition-colors motion-reduce:transition-none"
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {initialQuery && (
        <div>
          <h2 className="text-lg font-semibold text-ink-900 mb-4">
            {users.length} {users.length === 1 ? "person" : "people"} found
          </h2>

          {users.length === 0 ? (
            <div className={`${glassCard} p-8 text-center`}>
              <p className="text-ink-500">
                No one found matching "{initialQuery}"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const isFollowing = followingIds.includes(user.id);
                const displayName =
                  user.profile?.displayName || user.name || user.username || "Anonymous";

                return (
                  <article key={user.id} className={`${glassCard} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      {/* User info */}
                      <div className="flex gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <Link href={`/profile/${user.username}`}>
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={displayName}
                              width={56}
                              height={56}
                              className="rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-brand-700">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/profile/${user.username}`}
                            className="font-semibold text-ink-900 hover:text-brand-600 transition-colors"
                          >
                            {displayName}
                          </Link>
                          {user.username && (
                            <p className="text-sm text-ink-500">
                              @{user.username}
                            </p>
                          )}

                          {user.profile?.bio && (
                            <p className="text-sm text-ink-700 mt-2 line-clamp-2">
                              {user.profile.bio}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink-500">
                            {user.profile?.cpSubtype &&
                              user.profile.cpSubtype !== "UNKNOWN" && (
                                <span>{user.profile.cpSubtype}</span>
                              )}
                            {user.profile?.gmfcs &&
                              user.profile.gmfcs !== "UNKNOWN" && (
                                <span>GMFCS {user.profile.gmfcs}</span>
                              )}
                            {user.profile?.region && (
                              <span>📍 {user.profile.region}</span>
                            )}
                          </div>

                          <div className="flex gap-4 mt-3 text-xs text-ink-500">
                            <span>
                              <strong className="text-ink-900">
                                {user._count.posts}
                              </strong>{" "}
                              posts
                            </span>
                            <span>
                              <strong className="text-ink-900">
                                {user._count.followers}
                              </strong>{" "}
                              followers
                            </span>
                            <span>
                              <strong className="text-ink-900">
                                {user._count.follows}
                              </strong>{" "}
                              following
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Follow button */}
                      <button
                        onClick={() =>
                          handleToggleFollow(user.username!, isFollowing)
                        }
                        disabled={isPending || !user.username}
                        className={`px-4 py-2 rounded-[0.75rem] font-medium text-sm transition-colors motion-reduce:transition-none flex-shrink-0 ${
                          isFollowing
                            ? "bg-neutral-200 text-ink-700 hover:bg-neutral-300"
                            : "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_4px_10px_rgba(255,135,65,.25)]"
                        }`}
                      >
                        {isPending
                          ? "..."
                          : isFollowing
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!initialQuery && (
        <div className={`${glassCard} p-12 text-center`}>
          <svg
            className="w-16 h-16 mx-auto mb-4 text-ink-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-ink-900 mb-2">
            Find people in the CP community
          </h3>
          <p className="text-ink-500">
            Search by name or username to connect with others
          </p>
        </div>
      )}
    </div>
  );
}
