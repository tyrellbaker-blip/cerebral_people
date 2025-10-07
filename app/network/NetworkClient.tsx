"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { unfollowUser } from "../actions/followUser";
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
  } | null;
  _count: {
    followers: number;
    posts: number;
  };
}

interface NetworkClientProps {
  followers: User[];
  following: User[];
  mutualIds: string[];
  currentTab: string;
  currentUserId: string;
}

export default function NetworkClient({
  followers,
  following,
  mutualIds,
  currentTab,
  currentUserId,
}: NetworkClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState(currentTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/network?tab=${tab}`);
  };

  const handleUnfollow = (username: string) => {
    if (!confirm("Unfollow this person?")) return;

    startTransition(async () => {
      await unfollowUser(username);
      router.refresh();
    });
  };

  const renderUserCard = (user: User, showUnfollow: boolean = false) => {
    const displayName =
      user.profile?.displayName || user.name || user.username || "Anonymous";
    const isMutual = mutualIds.includes(user.id);

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
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-brand-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${user.username}`}
                  className="font-semibold text-ink-900 hover:text-brand-600 transition-colors"
                >
                  {displayName}
                </Link>
                {isMutual && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">
                    Mutual
                  </span>
                )}
              </div>

              {user.username && (
                <p className="text-sm text-ink-500">@{user.username}</p>
              )}

              {user.profile?.bio && (
                <p className="text-sm text-ink-700 mt-2 line-clamp-2">
                  {user.profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-500">
                {user.profile?.cpSubtype &&
                  user.profile.cpSubtype !== "UNKNOWN" && (
                    <span>{user.profile.cpSubtype}</span>
                  )}
                {user.profile?.gmfcs && user.profile.gmfcs !== "UNKNOWN" && (
                  <span>GMFCS {user.profile.gmfcs}</span>
                )}
                <span>
                  <strong className="text-ink-900">
                    {user._count.followers}
                  </strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="text-ink-900">{user._count.posts}</strong>{" "}
                  posts
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          {showUnfollow && user.username && (
            <button
              onClick={() => handleUnfollow(user.username!)}
              disabled={isPending}
              className="px-4 py-2 rounded-[0.75rem] font-medium text-sm bg-neutral-200 text-ink-700 hover:bg-neutral-300 transition-colors motion-reduce:transition-none flex-shrink-0"
            >
              {isPending ? "..." : "Unfollow"}
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className={`${glassCard} p-2`}>
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("following")}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all motion-reduce:transition-none ${
              activeTab === "following"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white/70 text-ink-700 hover:bg-brand-50"
            }`}
          >
            Following ({following.length})
          </button>
          <button
            onClick={() => handleTabChange("followers")}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all motion-reduce:transition-none ${
              activeTab === "followers"
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-white/70 text-ink-700 hover:bg-brand-50"
            }`}
          >
            Followers ({followers.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "following" && (
        <div>
          {following.length === 0 ? (
            <div className={`${glassCard} p-12 text-center`}>
              <p className="text-ink-500 mb-4">
                You're not following anyone yet
              </p>
              <Link
                href="/people"
                className="inline-block px-6 py-2.5 rounded-[0.75rem] bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
              >
                Find people
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {following.map((user) => renderUserCard(user, true))}
            </div>
          )}
        </div>
      )}

      {activeTab === "followers" && (
        <div>
          {followers.length === 0 ? (
            <div className={`${glassCard} p-12 text-center`}>
              <p className="text-ink-500">No followers yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {followers.map((user) => renderUserCard(user, false))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
