"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "../actions/followUser";

interface FollowButtonProps {
  username: string;
  isFollowing: boolean;
  isOwnProfile: boolean;
}

export default function FollowButton({ username, isFollowing: initialIsFollowing, isOwnProfile }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  if (isOwnProfile) {
    return null; // Don't show follow button on own profile
  }

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
      } else {
        await followUser(username);
        setIsFollowing(true);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={`
        px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50
        ${
          isFollowing
            ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
            : "bg-amber-600 text-white hover:bg-amber-700"
        }
      `}
    >
      {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
