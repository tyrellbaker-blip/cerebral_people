"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { softDeleteUser } from "./actions";

interface DeleteModalProps {
  userId: string;
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteModal({
  userId,
  username,
  isOpen,
  onClose,
}: DeleteModalProps) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please provide a deletion reason");
      return;
    }

    if (confirmText !== (username || "no-username")) {
      setError("Username confirmation does not match");
      return;
    }

    startTransition(async () => {
      const result = await softDeleteUser(userId, reason);

      if (!result.success) {
        setError(result.error || "Failed to delete user");
      } else {
        setReason("");
        setConfirmText("");
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-neutral-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900">Delete User Account</h2>
          <p className="text-sm text-red-700 mt-1">
            Soft delete @{username || "no-username"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                ℹ️ About Soft Delete
              </h3>
              <p className="text-xs text-blue-800">
                This is a <strong>soft delete</strong> - the account will be marked as
                deleted but can be restored. The user will not be able to log in or
                access the platform. All their content will be hidden from other users.
              </p>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Deletion Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for deletion (for audit trail)..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Confirmation */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Type <span className="font-bold">{username || "no-username"}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Enter username to confirm"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                required
              />
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">
                ⚠️ <strong>Warning:</strong> This will immediately mark the account
                as deleted. The user will not be able to log in. This action can be
                reversed by restoring the account.
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
              disabled={isPending || !reason.trim() || confirmText !== (username || "no-username")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
