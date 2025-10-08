"use client";

import { useState } from "react";
import Image from "next/image";
import { deletePost } from "../actions/deletePost";
import { updatePost } from "../actions/updatePost";
import ReactionButtons from "./ReactionButtons";
import VoiceControls from "./VoiceControls";
import CommentsSection from "./CommentsSection";
import EnergyHalo from "../components/EnergyHalo";
import {
  glassCard,
  hairlineDivider,
  textareaBase,
  inputBase,
  buttonPrimary,
  buttonSecondary,
  badgeSecondary,
  energyLevelToEmoji,
  energyLevelToLabel,
} from "../components/cardStyles";

interface PostCardProps {
  post: {
    id: string;
    createdAt: Date;
    body: string;
    visibility: string;
    authorId: string;
    postType: string;
    energyLevel: number | null;
    author: {
      username: string | null;
      name: string | null;
      image: string | null;
      profile: {
        displayName: string | null;
        isVerified: boolean;
        profileType: string;
      } | null;
    };
    reactions: {
      kind: string;
      userId: string;
    }[];
    comments?: {
      id: string;
      body: string;
      createdAt: Date;
      authorId: string;
      parentId: string | null;
      author: {
        username: string | null;
        name: string | null;
        image: string | null;
        profile: {
          displayName: string | null;
          isVerified: boolean;
          profileType: string;
        } | null;
      };
    }[];
    _count?: {
      comments: number;
    };
  };
  currentUserId: string;
}

// Post type styling with warm design system
const postTypeConfig = {
  GENERAL: { label: "", badge: "" },
  ASSISTIVE_WIN: {
    label: "🎉 Assistive Win",
    badge: "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8FBF8F]/20 to-brand-200/30 px-3 py-1 text-xs font-medium text-[#4A7C4A] border border-[#8FBF8F]/30",
  },
  QUESTION: {
    label: "❓ Question",
    badge: "inline-flex items-center gap-1 rounded-full bg-[#E6A1A6]/20 px-3 py-1 text-xs font-medium text-[#8B4548] border border-[#E6A1A6]/30",
  },
  RECOMMENDATION: {
    label: "💡 Recommendation",
    badge: "inline-flex items-center gap-1 rounded-full bg-[#E5B769]/20 px-3 py-1 text-xs font-medium text-[#8B6E3D] border border-[#E5B769]/30",
  },
};

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = post.authorId === currentUserId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(post.id);
    } catch (error) {
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePost(post.id, editBody, editVisibility);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setEditBody(post.body);
    setEditVisibility(post.visibility);
    setIsEditing(false);
  };

  const postTypeInfo =
    postTypeConfig[post.postType as keyof typeof postTypeConfig] ||
    postTypeConfig.GENERAL;
  const isAssistiveWin = post.postType === "ASSISTIVE_WIN";

  // Map energy level to EnergyHalo level
  const getEnergyHaloLevel = (
    energyLevel: number | null
  ): "NONE" | "LOW" | "MEDIUM" | "HIGH" => {
    if (!energyLevel) return "NONE";
    if (energyLevel === 1) return "LOW";
    if (energyLevel === 4) return "HIGH";
    return "MEDIUM";
  };

  return (
    <article
      className={`${glassCard} p-6 ${
        isAssistiveWin ? "ring-2 ring-[#8FBF8F]/40" : ""
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 flex-1">
          {/* Profile Picture with Energy Halo */}
          <div className="flex-shrink-0 relative">
            <EnergyHalo level={getEnergyHaloLevel(post.energyLevel)} size="md" />
            <div className="absolute inset-0 flex items-center justify-center">
              {post.author?.image ? (
                <Image
                  src={post.author.image}
                  alt={
                    post.author?.profile?.displayName ||
                    post.author?.username ||
                    "User"
                  }
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-base font-bold text-brand-700">
                    {(
                      post.author?.profile?.displayName ||
                      post.author?.username ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Post Type Badge */}
            {postTypeInfo.label && (
              <div className={postTypeInfo.badge}>{postTypeInfo.label}</div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <div className="font-medium text-ink-900">
                {post.author?.profile?.displayName ||
                  post.author?.username ||
                  post.author?.name ||
                  "Anonymous"}
              </div>
              {/* Verified Professional Badge */}
              {post.author?.profile?.isVerified &&
               (post.author?.profile?.profileType === "DOCTOR" || post.author?.profile?.profileType === "PT") && (
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  title={`Verified ${post.author?.profile?.profileType === "PT" ? "Physical Therapist" : "Healthcare Professional"}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {post.energyLevel && (
                <span
                  className="text-sm"
                  title={energyLevelToLabel(post.energyLevel)}
                  aria-label={energyLevelToLabel(post.energyLevel)}
                >
                  {energyLevelToEmoji(post.energyLevel)}
                </span>
              )}
            </div>

            <div className="text-xs text-ink-500 mt-0.5">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {isOwnPost && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-brand-600 hover:text-brand-700 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors motion-reduce:transition-none"
              aria-label="Edit post"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-[#C44C4C] hover:text-[#A43838] px-3 py-1.5 rounded-lg hover:bg-[#E6A1A6]/10 disabled:opacity-50 transition-colors motion-reduce:transition-none"
              aria-label="Delete post"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className={textareaBase}
            rows={3}
            required
          />
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
              className={inputBase}
              style={{ width: "auto" }}
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button type="submit" className={buttonPrimary}>
              Save
            </button>
            <button type="button" onClick={handleCancelEdit} className={buttonSecondary}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-ink-900 leading-relaxed [text-wrap:pretty]">
            {post.body}
          </p>

          {/* Hairline Divider */}
          <hr className={`${hairlineDivider} my-4`} />

          {/* Text-to-Speech */}
          <div className="mb-3">
            <VoiceControls textToSpeak={post.body} />
          </div>

          {/* Reactions */}
          <div className="mb-4">
            <ReactionButtons
              postId={post.id}
              reactions={post.reactions}
              currentUserId={currentUserId}
            />
          </div>

          {/* Comments Section */}
          {post.comments && post._count && (
            <>
              <hr className={`${hairlineDivider} my-4`} />
              <CommentsSection
                postId={post.id}
                comments={post.comments}
                commentCount={post._count.comments}
                currentUserId={currentUserId}
              />
            </>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 mt-4 pt-4">
            <hr className={`${hairlineDivider} flex-1`} />
            <span className={badgeSecondary}>{post.visibility}</span>
            <hr className={`${hairlineDivider} flex-1`} />
          </div>
        </>
      )}
    </article>
  );
}