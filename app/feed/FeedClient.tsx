"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../actions/createPost";
import PostCard from "./PostCard";
import FeedLayoutToggle, { LayoutMode } from "./FeedLayoutToggle";
import VoiceControls from "./VoiceControls";
import PacingMode from "./PacingMode";
import {
  glassCard,
  textareaBase,
  inputBase,
  buttonPrimary,
} from "../components/cardStyles";

interface FeedClientProps {
  posts: any[];
  currentUserId: string;
}

export default function FeedClient({ posts, currentUserId }: FeedClientProps) {
  const router = useRouter();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("spacious");
  const [postBody, setPostBody] = useState("");
  const [pacingModeEnabled, setPacingModeEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Capture form reference immediately before React clears it
    const form = e.currentTarget;
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      console.log("Submitting post...", Object.fromEntries(formData));
      const result = await createPost(formData);
      console.log("Post result:", result);

      if (!result.success) {
        console.error("Post failed:", result.error);
        alert(result.error || "Failed to create post");
        setIsSubmitting(false);
        return;
      }

      console.log("Post successful, clearing form and refreshing...");

      // Clear form state
      setPostBody("");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      form.reset();

      // Refresh the page data instantly
      router.refresh();
    } catch (error) {
      console.error("Post exception:", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <PacingMode
          enabled={pacingModeEnabled}
          onToggle={handlePacingModeToggle}
        />
        <FeedLayoutToggle onLayoutChange={setLayoutMode} />
      </div>

      {/* Post Composer - Sticky */}
      <div
        className={`${glassCard} ${composerPadding} sticky top-4 z-10 backdrop-blur-md`}
      >
        <form onSubmit={handleSubmit} className={postCardSpacing}>
          {/* Energy Check-In */}
          <div>
            <label className="block text-sm font-medium text-ink-900 mb-3">
              How&apos;s your energy today?
            </label>
            <div className="grid grid-cols-4 gap-3">
              <label className="cursor-pointer" htmlFor="energy-1">
                <input
                  id="energy-1"
                  type="radio"
                  name="energyLevel"
                  value="1"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-[0.75rem] border-2 border-neutral-200 bg-white/60 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md transition-all hover:border-brand-300 hover:bg-brand-50/50 motion-reduce:transition-none">
                  <div className="text-2xl mb-1">😴</div>
                  <div className="text-xs font-medium text-ink-700">Low</div>
                </div>
              </label>
              <label className="cursor-pointer" htmlFor="energy-2">
                <input
                  id="energy-2"
                  type="radio"
                  name="energyLevel"
                  value="2"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-[0.75rem] border-2 border-neutral-200 bg-white/60 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md transition-all hover:border-brand-300 hover:bg-brand-50/50 motion-reduce:transition-none">
                  <div className="text-2xl mb-1">😐</div>
                  <div className="text-xs font-medium text-ink-700">Med-Low</div>
                </div>
              </label>
              <label className="cursor-pointer" htmlFor="energy-3">
                <input
                  id="energy-3"
                  type="radio"
                  name="energyLevel"
                  value="3"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="p-3 text-center rounded-[0.75rem] border-2 border-neutral-200 bg-white/60 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md transition-all hover:border-brand-300 hover:bg-brand-50/50 motion-reduce:transition-none">
                  <div className="text-2xl mb-1">🙂</div>
                  <div className="text-xs font-medium text-ink-700">Med-High</div>
                </div>
              </label>
              <label className="cursor-pointer" htmlFor="energy-4">
                <input
                  id="energy-4"
                  type="radio"
                  name="energyLevel"
                  value="4"
                  className="peer sr-only"
                />
                <div className="p-3 text-center rounded-[0.75rem] border-2 border-neutral-200 bg-white/60 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:shadow-md transition-all hover:border-brand-300 hover:bg-brand-50/50 motion-reduce:transition-none">
                  <div className="text-2xl mb-1">💪</div>
                  <div className="text-xs font-medium text-ink-700">High</div>
                </div>
              </label>
            </div>
          </div>

          {/* Post Type */}
          <div>
            <label
              htmlFor="postType"
              className="block text-sm font-medium text-ink-900 mb-2"
            >
              Post Type
            </label>
            <select
              id="postType"
              name="postType"
              className={inputBase}
            >
              <option value="GENERAL">General</option>
              <option value="ASSISTIVE_WIN">🎉 Assistive Win</option>
              <option value="QUESTION">❓ Question</option>
              <option value="RECOMMENDATION">💡 Recommendation</option>
            </select>
          </div>

          {/* Post Body with Voice Controls */}
          <div className="space-y-2">
            <label htmlFor="postBody" className="sr-only">
              Post content
            </label>
            <textarea
              id="postBody"
              ref={textareaRef}
              name="body"
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Share something helpful…"
              className={textareaBase}
              rows={layoutMode === "compact" ? 2 : 3}
              required
            />
            <VoiceControls onTranscript={handleVoiceTranscript} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <label htmlFor="visibility" className="sr-only">
              Post visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              className={inputBase}
              style={{ width: "auto", minWidth: "150px" }}
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button type="submit" className={buttonPrimary} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {/* Posts - Scroll Snap Container */}
      <section className={`${spacingClass} scroll-smooth`}>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} currentUserId={currentUserId} />
        ))}
      </section>
    </div>
  );
}