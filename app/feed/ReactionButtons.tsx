"use client";

import { useState, useTransition } from "react";
import { addReaction, removeReaction } from "../actions/addReaction";

interface ReactionButtonsProps {
  postId: string;
  reactions: {
    kind: string;
    userId: string;
  }[];
  currentUserId: string;
}

const reactionConfig = {
  SUPPORT: { emoji: "💚", label: "Support", color: "hover:bg-green-100" },
  PROUD: { emoji: "🌟", label: "Proud", color: "hover:bg-amber-100" },
  HELPFUL: { emoji: "💡", label: "Helpful", color: "hover:bg-blue-100" },
};

export default function ReactionButtons({
  postId,
  reactions,
  currentUserId,
}: ReactionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  // Count reactions by type
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.kind] = (acc[r.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check user's current reaction
  const userReaction = reactions.find((r) => r.userId === currentUserId);

  const handleReaction = (kind: "SUPPORT" | "PROUD" | "HELPFUL") => {
    startTransition(async () => {
      if (userReaction?.kind === kind) {
        // Remove reaction if clicking the same one
        await removeReaction(postId);
      } else {
        // Add or change reaction
        await addReaction(postId, kind);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(reactionConfig).map(([kind, config]) => {
        const count = reactionCounts[kind] || 0;
        const isActive = userReaction?.kind === kind;

        return (
          <button
            key={kind}
            onClick={() => handleReaction(kind as any)}
            disabled={isPending}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
              border-2 transition-all
              ${
                isActive
                  ? "border-amber-600 bg-amber-50"
                  : "border-amber-200 bg-white"
              }
              ${config.color}
              disabled:opacity-50
            `}
            title={config.label}
          >
            <span className="text-base">{config.emoji}</span>
            {count > 0 && (
              <span className="text-xs font-medium text-amber-900">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}