"use client";

import { useState } from "react";
import { deletePost } from "../actions/deletePost";
import { updatePost } from "../actions/updatePost";
import ReactionButtons from "./ReactionButtons";
import VoiceControls from "./VoiceControls";

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
      profile: {
        displayName: string | null;
      } | null;
    };
    reactions: {
      kind: string;
      userId: string;
    }[];
  };
  currentUserId: string;
}

// Energy level colors and emojis
const energyConfig = {
  1: { emoji: "😴", label: "Low energy", color: "bg-blue-50 border-l-4 border-l-blue-400" },
  2: { emoji: "😐", label: "Medium-low energy", color: "bg-green-50 border-l-4 border-l-green-400" },
  3: { emoji: "🙂", label: "Medium-high energy", color: "bg-amber-50 border-l-4 border-l-amber-400" },
  4: { emoji: "💪", label: "High energy", color: "bg-orange-50 border-l-4 border-l-orange-400" },
};

// Post type styling
const postTypeConfig = {
  GENERAL: { label: "", color: "" },
  ASSISTIVE_WIN: { label: "🎉 Assistive Win", color: "bg-gradient-to-r from-amber-100 to-orange-100" },
  QUESTION: { label: "❓ Question", color: "bg-purple-50" },
  RECOMMENDATION: { label: "💡 Recommendation", color: "bg-blue-50" },
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

  const energyInfo = post.energyLevel ? energyConfig[post.energyLevel as keyof typeof energyConfig] : null;
  const postTypeInfo = postTypeConfig[post.postType as keyof typeof postTypeConfig] || postTypeConfig.GENERAL;

  // Combine energy and post type colors
  const cardBackgroundClass = postTypeInfo.color || (energyInfo?.color || "bg-white");
  const isAssistiveWin = post.postType === "ASSISTIVE_WIN";

  return (
    <article className={`rounded-2xl shadow-[0_4px_8px_rgba(255,135,65,0.15)] p-6 transition-all ${cardBackgroundClass} ${isAssistiveWin ? 'ring-2 ring-amber-300' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {/* Post Type Badge */}
          {postTypeInfo.label && (
            <div className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-white/80 text-amber-900">
              {postTypeInfo.label}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="font-medium text-amber-900">
              {post.author?.profile?.displayName ||
                post.author?.username ||
                post.author?.name ||
                "Anonymous"}
            </div>
            {/* Energy Indicator */}
            {energyInfo && (
              <span className="text-lg" title={energyInfo.label}>
                {energyInfo.emoji}
              </span>
            )}
          </div>

          <div className="text-xs text-amber-700 mt-1">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>

        {isOwnPost && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-amber-600 hover:text-amber-700 px-2 py-1 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-700 px-2 py-1 disabled:opacity-50 transition-colors"
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
            className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            required
          />
          <div className="flex items-center gap-3">
            <select
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
              className="rounded-lg border border-amber-200 px-3 py-2 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-amber-900 leading-relaxed">{post.body}</p>

          {/* Text-to-Speech */}
          <div className="mt-3">
            <VoiceControls textToSpeak={post.body} />
          </div>

          {/* Reactions */}
          <div className="mt-4">
            <ReactionButtons
              postId={post.id}
              reactions={post.reactions}
              currentUserId={currentUserId}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-amber-200">
            <span className="text-xs px-2 py-1 rounded bg-white/60 text-amber-700">
              {post.visibility}
            </span>
          </div>
        </>
      )}
    </article>
  );
}