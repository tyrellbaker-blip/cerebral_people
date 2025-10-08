"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileType } from "./actions";

interface ProfileTypeModalProps {
  userId: string;
  currentProfileType: string;
  username: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileTypeModal({
  userId,
  currentProfileType,
  username,
  isOpen,
  onClose,
}: ProfileTypeModalProps) {
  const [selectedType, setSelectedType] = useState<
    "NORMAL" | "DOCTOR" | "PT" | "PARENT"
  >(currentProfileType as any);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedType === currentProfileType) {
      setError("Please select a different profile type");
      return;
    }

    startTransition(async () => {
      const result = await updateProfileType(userId, selectedType);

      if (!result.success) {
        setError(result.error || "Failed to update profile type");
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case "NORMAL":
        return "Standard user profile with basic features";
      case "DOCTOR":
        return "Medical doctor - requires credential verification";
      case "PT":
        return "Physical Therapist - requires credential verification";
      case "PARENT":
        return "Parent or caregiver of someone with CP";
      default:
        return "";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "NORMAL":
        return "👤";
      case "DOCTOR":
        return "🩺";
      case "PT":
        return "🏃";
      case "PARENT":
        return "👪";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-ink-900">
            Change Profile Type
          </h2>
          <p className="text-sm text-ink-500 mt-1">
            Update profile type for @{username || "no-username"}
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
              <div className="text-sm text-ink-500 mb-2">
                Current Profile Type
              </div>
              <div className="text-base font-medium text-ink-900">
                {getTypeIcon(currentProfileType)} {currentProfileType}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-3">
                Select New Profile Type
              </label>
              <div className="space-y-3">
                {(["NORMAL", "DOCTOR", "PT", "PARENT"] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedType === type
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="profileType"
                      value={type}
                      checked={selectedType === type}
                      onChange={(e) =>
                        setSelectedType(
                          e.target.value as "NORMAL" | "DOCTOR" | "PT" | "PARENT"
                        )
                      }
                      className="mt-1 h-4 w-4 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(type)}</span>
                        <span className="text-sm font-medium text-ink-900">
                          {type}
                        </span>
                      </div>
                      <p className="text-xs text-ink-500 mt-1">
                        {getTypeDescription(type)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {(selectedType === "DOCTOR" || selectedType === "PT") && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ℹ️ This profile type requires credential verification. You may
                  need to manually verify their credentials in the Verification
                  section.
                </p>
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                ⚠️ This action will be logged in the audit trail. Changing profile
                type may affect user permissions and features.
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
              disabled={isPending || selectedType === currentProfileType}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Updating..." : "Update Profile Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
