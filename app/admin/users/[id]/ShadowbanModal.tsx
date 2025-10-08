"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { shadowbanUser } from "./actions";

interface ShadowbanModalProps {
  userId: string;
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShadowbanModal({
  userId,
  username,
  isOpen,
  onClose,
}: ShadowbanModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please provide a shadowban reason");
      return;
    }

    startTransition(async () => {
      const result = await shadowbanUser(userId, reason);

      if (!result.success) {
        setError(result.error || "Failed to shadowban user");
      } else {
        setReason("");
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-ink-900">Shadowban User</h2>
          <p className="text-sm text-ink-500 mt-1">
            Shadowban @{username || "no-username"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                What is Shadowban?
              </h3>
              <p className="text-xs text-amber-800">
                A shadowbanned user can still log in and post content, but their
                posts and comments will be hidden from other users. This is useful
                for dealing with spammers and trolls without alerting them that
                they've been banned.
              </p>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Shadowban Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for shadowban (internal use only)..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-xs text-ink-500 mt-1">
                This reason is for internal tracking only and will not be shown to
                the user
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Unlike suspension, shadowban is
                indefinite. You'll need to manually remove it when appropriate.
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
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Shadowbanning..." : "Shadowban User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
