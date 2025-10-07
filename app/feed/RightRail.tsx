"use client";

import { useState } from "react";

const railCard =
  "rounded-[1rem] bg-white/70 backdrop-blur-[2px] border border-white/60 shadow-soft p-4";

export function CalmCornerCard() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className={railCard}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-ink-900">Calm Corner</h3>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-brand-500" : "bg-neutral-300"
          }`}
          aria-label="Toggle Calm Corner"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-ink-500 leading-relaxed">
        Hides energy-intense posts and prioritizes gentle content when you need a
        calmer feed.
      </p>
    </div>
  );
}

export function PeopleToFollow() {
  const suggestedUsers = [
    {
      name: "Jordan Ellis",
      handle: "@jordan",
      subtitle: "GMFCS II • Power chair",
    },
    { name: "Sam Rivera", handle: "@samr", subtitle: "Spastic CP • Advocate" },
    {
      name: "Alex Chen",
      handle: "@alexc",
      subtitle: "GMFCS III • Tech enthusiast",
    },
  ];

  return (
    <div className={railCard}>
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        People to follow
      </h3>
      <ul className="space-y-3">
        {suggestedUsers.map((user) => (
          <li key={user.handle} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-full bg-brand-100 flex-shrink-0 border border-brand-200/50 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-700">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="text-xs min-w-0">
                <div className="font-medium text-ink-900 truncate">
                  {user.name}
                </div>
                <div className="text-ink-500/80 truncate">{user.subtitle}</div>
              </div>
            </div>
            <button className="px-2.5 py-1 rounded-lg border border-brand-500/30 bg-white/70 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0">
              Follow
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccessibilityQuickToggles() {
  const [settings, setSettings] = useState({
    highContrast: false,
    reduceMotion: false,
  });

  return (
    <div className={railCard}>
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        Quick accessibility
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white/70 text-xs font-medium hover:bg-brand-50 hover:border-brand-300 transition-colors"
          aria-label="Decrease font size"
        >
          A−
        </button>
        <button
          className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white/70 text-xs font-medium hover:bg-brand-50 hover:border-brand-300 transition-colors"
          aria-label="Increase font size"
        >
          A+
        </button>
        <button
          onClick={() =>
            setSettings({ ...settings, highContrast: !settings.highContrast })
          }
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            settings.highContrast
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-neutral-200 bg-white/70 hover:bg-brand-50 hover:border-brand-300"
          }`}
        >
          High contrast
        </button>
        <button
          onClick={() =>
            setSettings({ ...settings, reduceMotion: !settings.reduceMotion })
          }
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            settings.reduceMotion
              ? "border-brand-500 bg-brand-50 text-brand-700"
              : "border-neutral-200 bg-white/70 hover:bg-brand-50 hover:border-brand-300"
          }`}
        >
          Reduce motion
        </button>
      </div>
    </div>
  );
}

export function KeyboardShortcutsCard() {
  const shortcuts = [
    { key: "C", action: "Compose post" },
    { key: "J / K", action: "Navigate feed" },
    { key: "L", action: "Like post" },
    { key: "?", action: "Show all shortcuts" },
  ];

  return (
    <div className={railCard}>
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        Keyboard shortcuts
      </h3>
      <ul className="space-y-2">
        {shortcuts.map((shortcut) => (
          <li
            key={shortcut.key}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-ink-500">{shortcut.action}</span>
            <kbd className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono font-medium text-ink-700">
              {shortcut.key}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SafetyCard() {
  return (
    <div className={railCard}>
      <h3 className="text-sm font-semibold text-ink-900 mb-2">
        Safety & Support
      </h3>
      <p className="text-xs text-ink-500 leading-relaxed mb-3">
        Need help or want to report something? We're here for you.
      </p>
      <div className="space-y-2">
        <button className="w-full px-3 py-2 rounded-lg border border-brand-500/30 bg-white/70 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors">
          Get support
        </button>
        <button className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white/70 text-xs font-medium text-ink-700 hover:bg-neutral-50 transition-colors">
          Report content
        </button>
      </div>
    </div>
  );
}

export function EnergyFiltersCard() {
  const [selected, setSelected] = useState<string[]>([]);

  const energyLevels = [
    { value: "low", label: "Low energy", emoji: "😴" },
    { value: "medium", label: "Medium", emoji: "🙂" },
    { value: "high", label: "High energy", emoji: "💪" },
  ];

  const toggleFilter = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className={railCard}>
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        Filter by energy
      </h3>
      <div className="flex flex-wrap gap-2">
        {energyLevels.map((level) => (
          <button
            key={level.value}
            onClick={() => toggleFilter(level.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              selected.includes(level.value)
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-neutral-200 bg-white/70 hover:bg-brand-50 hover:border-brand-300"
            }`}
          >
            <span className="mr-1">{level.emoji}</span>
            {level.label}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          onClick={() => setSelected([])}
          className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
