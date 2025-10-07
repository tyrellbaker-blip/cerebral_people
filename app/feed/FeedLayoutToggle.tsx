"use client";

import { useState, useEffect } from "react";

export type LayoutMode = "compact" | "spacious";

interface FeedLayoutToggleProps {
  onLayoutChange: (mode: LayoutMode) => void;
}

export default function FeedLayoutToggle({ onLayoutChange }: FeedLayoutToggleProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("spacious");

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("feedLayoutMode") as LayoutMode;
    if (saved) {
      setLayoutMode(saved);
      onLayoutChange(saved);
    }
  }, [onLayoutChange]);

  const handleToggle = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem("feedLayoutMode", mode);
    onLayoutChange(mode);
  };

  return (
    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-[2px] border border-white/60 rounded-[0.75rem] p-2 shadow-soft">
      <span className="text-xs text-ink-700 font-medium mr-1">Density:</span>
      <button
        onClick={() => handleToggle("compact")}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all motion-reduce:transition-none
          ${
            layoutMode === "compact"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white/70 text-ink-700 hover:bg-brand-50 border border-neutral-200"
          }
        `}
        title="Compact mode - Reading efficiency"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>Compact</span>
      </button>
      <button
        onClick={() => handleToggle("spacious")}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all motion-reduce:transition-none
          ${
            layoutMode === "spacious"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white/70 text-ink-700 hover:bg-brand-50 border border-neutral-200"
          }
        `}
        title="Spacious mode - Motor-ease, larger buttons"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 14h16M4 18h16" />
        </svg>
        <span>Spacious</span>
      </button>
    </div>
  );
}