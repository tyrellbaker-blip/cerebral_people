"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "./actions";
import AdminBadge from "../../components/AdminBadge";

interface RoleChangeModalProps {
  userId: string;
  currentRole: string;
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleChangeModal({
  userId,
  currentRole,
  username,
  isOpen,
  onClose,
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState<
    "MEMBER" | "MODERATOR" | "ADMIN"
  >(currentRole as any);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedRole === currentRole) {
      setError("Please select a different role");
      return;
    }

    startTransition(async () => {
      const result = await updateUserRole(userId, selectedRole);

      if (!result.success) {
        setError(result.error || "Failed to update role");
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MODERATOR":
        return "warning";
      case "MEMBER":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Full access to admin panel, can manage all users and content";
      case "MODERATOR":
        return "Can moderate content and manage user reports";
      case "MEMBER":
        return "Standard user with no special privileges";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-ink-900">Change User Role</h2>
          <p className="text-sm text-ink-500 mt-1">
            Update role for @{username || "no-username"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4">
              <div className="text-sm text-ink-500 mb-2">Current Role</div>
              <AdminBadge variant={getRoleColor(currentRole) as any}>
                {currentRole}
              </AdminBadge>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-3">
                Select New Role
              </label>
              <div className="space-y-3">
                {(["MEMBER", "MODERATOR", "ADMIN"] as const).map((role) => (
                  <label
                    key={role}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRole === role
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) =>
                        setSelectedRole(
                          e.target.value as "MEMBER" | "MODERATOR" | "ADMIN"
                        )
                      }
                      className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-900">
                          {role}
                        </span>
                        <AdminBadge variant={getRoleColor(role) as any}>
                          {role}
                        </AdminBadge>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">
                        {getRoleDescription(role)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                ⚠️ This action will be logged in the audit trail. Granting admin
                or moderator access gives significant privileges.
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
              disabled={isPending || selectedRole === currentRole}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
