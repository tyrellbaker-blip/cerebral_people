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
    <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-md">
      <span className="text-sm text-amber-900 font-medium mr-2">Layout:</span>
      <button
        onClick={() => handleToggle("compact")}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all
          ${
            layoutMode === "compact"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100"
          }
        `}
        title="Compact mode - Reading efficiency"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span>🧱 Compact</span>
      </button>
      <button
        onClick={() => handleToggle("spacious")}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all
          ${
            layoutMode === "spacious"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-900 hover:bg-amber-100"
          }
        `}
        title="Spacious mode - Motor-ease, larger buttons"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 14h16M4 18h16" />
        </svg>
        <span>🌿 Spacious</span>
      </button>
    </div>
  );
}