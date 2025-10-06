"use client";

import { useState, useEffect } from "react";

interface PacingModeProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function PacingMode({ enabled, onToggle }: PacingModeProps) {
  const [scrollTime, setScrollTime] = useState(0);
  const [showBreakReminder, setShowBreakReminder] = useState(false);

  const REMINDER_INTERVAL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (!enabled) {
      setScrollTime(0);
      setShowBreakReminder(false);
      return;
    }

    let startTime = Date.now();
    let intervalId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      setScrollTime((prev) => prev + elapsed);
      startTime = currentTime;
    };

    window.addEventListener("scroll", handleScroll);

    // Check scroll time every second
    intervalId = setInterval(() => {
      if (scrollTime >= REMINDER_INTERVAL && !showBreakReminder) {
        setShowBreakReminder(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(intervalId);
    };
  }, [enabled, scrollTime, showBreakReminder]);

  const handleDismissReminder = () => {
    setShowBreakReminder(false);
    setScrollTime(0);
  };

  const handleTakeBreak = () => {
    setShowBreakReminder(false);
    setScrollTime(0);
    // Could integrate with a break timer here
  };

  return (
    <>
      {/* Pacing Mode Toggle */}
      <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-md">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-amber-900">
            ⏱️ Pacing Mode
          </span>
        </label>
        {enabled && (
          <span className="text-xs text-amber-700">
            {Math.floor(scrollTime / 60000)}m active
          </span>
        )}
      </div>

      {/* Break Reminder Modal */}
      {showBreakReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="text-5xl mb-4">🌿</div>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Time for a break?
              </h3>
              <p className="text-amber-800 mb-6">
                You&apos;ve been scrolling for about{" "}
                {Math.floor(scrollTime / 60000)} minutes. Taking regular breaks
                helps prevent fatigue and strain.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleTakeBreak}
                  className="w-full rounded-lg bg-amber-600 text-white px-6 py-3 font-medium hover:bg-amber-700 transition-colors"
                >
                  Take a 5-minute break
                </button>
                <button
                  onClick={handleDismissReminder}
                  className="w-full rounded-lg bg-amber-100 text-amber-900 px-6 py-3 font-medium hover:bg-amber-200 transition-colors"
                >
                  Continue for now
                </button>
              </div>

              <p className="text-xs text-amber-600 mt-4">
                💡 Tip: Stretch, rest your eyes, or grab some water
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}