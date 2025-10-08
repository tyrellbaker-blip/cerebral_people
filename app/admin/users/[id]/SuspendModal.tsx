"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendUser } from "./actions";

interface SuspendModalProps {
  userId: string;
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SuspendModal({
  userId,
  username,
  isOpen,
  onClose,
}: SuspendModalProps) {
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please provide a suspension reason");
      return;
    }

    if (durationDays < 1) {
      setError("Duration must be at least 1 day");
      return;
    }

    startTransition(async () => {
      const result = await suspendUser(userId, reason, durationDays);

      if (!result.success) {
        setError(result.error || "Failed to suspend user");
      } else {
        setReason("");
        setDurationDays(7);
        router.refresh();
        onClose();
      }
    });
  };

  const presetDurations = [
    { label: "1 day", days: 1 },
    { label: "3 days", days: 3 },
    { label: "7 days", days: 7 },
    { label: "14 days", days: 14 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-ink-900">Suspend User</h2>
          <p className="text-sm text-ink-500 mt-1">
            Temporarily suspend @{username || "no-username"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Suspension Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for suspension..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-ink-500 mt-1">
                This reason will be visible to the user and logged in the audit
                trail
              </p>
            </div>

            {/* Duration Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presetDurations.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setDurationDays(preset.days)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                      durationDays === preset.days
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-neutral-300 text-ink-700 hover:border-neutral-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Or enter custom duration (days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-ink-500 mt-1">
                User will be suspended until{" "}
                {new Date(
                  Date.now() + durationDays * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">
                ⚠️ <strong>Warning:</strong> This will immediately suspend the
                user's account. They will not be able to log in or access the
                platform until the suspension expires or is manually lifted.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Suspending..." : "Suspend User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
