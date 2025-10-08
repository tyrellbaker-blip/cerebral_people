"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  unsuspendUser,
  removeShadowban,
  restoreUser,
  forceEmailVerification,
  triggerPasswordReset,
  impersonateUser,
} from "./actions";
import SuspendModal from "./SuspendModal";
import ShadowbanModal from "./ShadowbanModal";
import DeleteModal from "./DeleteModal";

interface UserActionsMenuProps {
  userId: string;
  username: string | null;
  currentStatus: string;
}

export default function UserActionsMenu({
  userId,
  username,
  currentStatus,
}: UserActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isShadowbanModalOpen, setIsShadowbanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUnsuspend = async () => {
    if (!confirm(`Are you sure you want to unsuspend @${username || "no-username"}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await unsuspendUser(userId);
      if (result.success) {
        router.refresh();
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to unsuspend user");
      }
    });
  };

  const handleRemoveShadowban = async () => {
    if (!confirm(`Are you sure you want to remove shadowban from @${username || "no-username"}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await removeShadowban(userId);
      if (result.success) {
        router.refresh();
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to remove shadowban");
      }
    });
  };

  const handleRestoreUser = async () => {
    if (!confirm(`Are you sure you want to restore @${username || "no-username"}'s account?`)) {
      return;
    }

    startTransition(async () => {
      const result = await restoreUser(userId);
      if (result.success) {
        router.refresh();
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to restore user");
      }
    });
  };

  const handleForceEmailVerification = async () => {
    if (!confirm(`Force email re-verification for @${username || "no-username"}? They will need to verify their email again to access protected features.`)) {
      return;
    }

    startTransition(async () => {
      const result = await forceEmailVerification(userId);
      if (result.success) {
        alert("Email verification has been cleared. User will need to re-verify.");
        router.refresh();
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to force email verification");
      }
    });
  };

  const handleTriggerPasswordReset = async () => {
    if (!confirm(`Trigger password reset for @${username || "no-username"}? This will generate a temporary password.`)) {
      return;
    }

    startTransition(async () => {
      const result = await triggerPasswordReset(userId);
      if (result.success && result.tempPassword) {
        alert(`Temporary password: ${result.tempPassword}\n\nPlease provide this to the user securely. They should change it immediately upon login.`);
        router.refresh();
        setIsOpen(false);
      } else {
        alert(result.error || "Failed to trigger password reset");
      }
    });
  };

  const handleImpersonateUser = async () => {
    if (!confirm(`Impersonate @${username || "no-username"}? You will be logged in as this user for 1 hour. This action is fully audited.`)) {
      return;
    }

    startTransition(async () => {
      const result = await impersonateUser(userId);
      if (result.success && result.sessionToken) {
        // Set the session cookie and redirect to main app
        document.cookie = `next-auth.session-token=${result.sessionToken}; path=/; max-age=3600; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;

        alert("Impersonation session created. Redirecting to main app...");

        // Redirect to home page as the user
        window.location.href = "/";
      } else {
        alert(result.error || "Failed to impersonate user");
      }
    });
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 bg-white hover:bg-neutral-50 transition-colors"
        >
          More Actions ▾
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
              <div className="py-1">
                {currentStatus === "SUSPENDED" ? (
                  <button
                    onClick={handleUnsuspend}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Unsuspending..." : "✓ Unsuspend User"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSuspendModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    ⚠ Suspend User
                  </button>
                )}

                <div className="border-t border-neutral-200 my-1" />

                {currentStatus === "SHADOWBANNED" ? (
                  <button
                    onClick={handleRemoveShadowban}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Removing..." : "✓ Remove Shadowban"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsShadowbanModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                  >
                    👻 Shadowban User
                  </button>
                )}

                {currentStatus === "DELETED" ? (
                  <button
                    onClick={handleRestoreUser}
                    disabled={isPending}
                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Restoring..." : "↻ Restore Account"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    🗑 Delete Account
                  </button>
                )}

                <div className="border-t border-neutral-200 my-1" />

                <button
                  onClick={handleForceEmailVerification}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Processing..." : "✉ Force Email Verification"}
                </button>
                <button
                  onClick={handleTriggerPasswordReset}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2 text-sm text-ink-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Processing..." : "🔑 Trigger Password Reset"}
                </button>

                <div className="border-t border-neutral-200 my-1" />

                <button
                  onClick={handleImpersonateUser}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Processing..." : "👤 Impersonate User"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <SuspendModal
        userId={userId}
        username={username}
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
      />

      <ShadowbanModal
        userId={userId}
        username={username}
        isOpen={isShadowbanModalOpen}
        onClose={() => setIsShadowbanModalOpen(false)}
      />

      <DeleteModal
        userId={userId}
        username={username}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}
