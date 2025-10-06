"use client";

import { useState, useRef, useEffect } from "react";
import { createPost } from "../actions/createPost";
import PostCard from "./PostCard";
import FeedLayoutToggle, { LayoutMode } from "./FeedLayoutToggle";
import VoiceControls from "./VoiceControls";
import PacingMode from "./PacingMode";

interface FeedClientProps {
  posts: any[];
  currentUserId: string;
}

export default function FeedClient({ posts, currentUserId }: FeedClientProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("spacious");
  const [postBody, setPostBody] = useState("");
  const [pacingModeEnabled, setPacingModeEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load pacing mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pacingModeEnabled");
    if (saved) {
      setPacingModeEnabled(saved === "true");
    }
  }, []);

  const spacingClass = layoutMode === "compact" ? "space-y-3" : "space-y-6";
  const composerPadding = layoutMode === "compact" ? "p-4" : "p-6";
  const postCardSpacing = layoutMode === "compact" ? "space-y-3" : "space-y-4";

  const handleVoiceTranscript = (transcript: string) => {
    setPostBody((prev) => (prev ? `${prev} ${transcript}` : transcript));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handlePacingModeToggle = (enabled: boolean) => {
    setPacingModeEnabled(enabled);
    localStorage.setItem("pacingModeEnabled", enabled.toString());
  };

  return (
    <>
      {/* Controls Row */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <PacingMode enabled={pacingModeEnabled} onToggle={handlePacingModeToggle} />
        <FeedLayoutToggle onLayoutChange={setLayoutMode} />
      </div>

      {/* Post Composer */}
      <div className={`bg-white rounded-2xl shadow-[0_4px_8px_rgba(255,135,65,0.15)] ${composerPadding}`}>
        <form action={createPost} className={postCardSpacing}>
          {/* Energy Check-In */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              How&apos;s your energy today?
            </label>
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="energyLevel"
                  value="1"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-lg border-2 border-amber-200 bg-white peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:border-amber-400">
                  <div className="text-2xl">😴</div>
                  <div className="text-xs text-amber-900 mt-1">Low</div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="energyLevel"
                  value="2"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-lg border-2 border-amber-200 bg-white peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:border-amber-400">
                  <div className="text-2xl">😐</div>
                  <div className="text-xs text-amber-900 mt-1">Med-Low</div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="energyLevel"
                  value="3"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="p-3 text-center rounded-lg border-2 border-amber-200 bg-white peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:border-amber-400">
                  <div className="text-2xl">🙂</div>
                  <div className="text-xs text-amber-900 mt-1">Med-High</div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="energyLevel"
                  value="4"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-lg border-2 border-amber-200 bg-white peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:border-amber-400">
                  <div className="text-2xl">💪</div>
                  <div className="text-xs text-amber-900 mt-1">High</div>
                </div>
              </label>
            </div>
          </div>

          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Post Type
            </label>
            <select
              name="postType"
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="GENERAL">General</option>
              <option value="ASSISTIVE_WIN">🎉 Assistive Win</option>
              <option value="QUESTION">Question</option>
              <option value="RECOMMENDATION">Recommendation</option>
            </select>
          </div>

          {/* Post Body with Voice Controls */}
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              name="body"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Share something helpful…"
              className="w-full rounded-lg border border-amber-200 p-3 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={layoutMode === "compact" ? 2 : 3}
              required
            />
            <VoiceControls onTranscript={handleVoiceTranscript} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              name="visibility"
              className="rounded-lg border border-amber-200 px-3 py-2 text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button className="rounded-lg bg-amber-600 text-white px-6 py-2 font-medium hover:bg-amber-700 transition-colors">
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      <section className={spacingClass}>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={currentUserId} />
        ))}
      </section>
    </>
  );
}