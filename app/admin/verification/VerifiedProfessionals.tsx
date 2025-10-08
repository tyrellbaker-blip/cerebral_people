"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { removeVerifiedBadge } from "./actions";
import AdminBadge from "../components/AdminBadge";

interface VerifiedRequest {
  id: string;
  role: string;
  status: string;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    profile: {
      bio: string | null;
      profileType: string;
      isVerified: boolean;
      verifiedAt: Date | null;
    } | null;
  };
}

interface VerifiedProfessionalsProps {
  users: VerifiedRequest[];
}

export default function VerifiedProfessionals({
  users,
}: VerifiedProfessionalsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleRemoveBadge = async (userId: string, username: string) => {
    const reason = prompt(`Enter reason for removing verified badge from @${username}:`);
    if (!reason) return;

    if (
      !confirm(
        `Remove verified badge from @${username}? This action is logged and can be reversed.`
      )
    ) {
      return;
    }

    setActioningId(userId);
    startTransition(async () => {
      const result = await removeVerifiedBadge(userId, reason);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to remove verified badge");
      }
      setActioningId(null);
    });
  };

  return (
    <div className="space-y-4">
      {users.length > 0 ? (
        users.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* User Header */}
                <div className="flex items-center gap-3 mb-3">
                  <Link
                    href={`/admin/users/${request.user.id}`}
                    className="text-lg font-semibold text-brand-600 hover:text-brand-700"
                  >
                    @{request.user.username || "no-username"}
                  </Link>
                  {request.user.profile && (
                    <>
                      <AdminBadge variant="info">
                        {request.user.profile.profileType}
                      </AdminBadge>
                      {request.user.profile.isVerified && (
                        <AdminBadge variant="success">
                          ✓ VERIFIED
                        </AdminBadge>
                      )}
                    </>
                  )}
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-ink-700">
                    <span className="font-medium">Name:</span> {request.user.name || "Not provided"}
                  </div>
                  <div className="text-sm text-ink-700">
                    <span className="font-medium">Email:</span> {request.user.email || "Not provided"}
                  </div>
                  {request.user.profile?.verifiedAt && (
                    <div className="text-sm text-green-600">
                      <span className="font-medium">Verified on:</span>{" "}
                      {new Date(request.user.profile.verifiedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {request.user.profile?.bio && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-ink-700 mb-1">
                      Bio:
                    </div>
                    <div className="text-sm text-ink-600 bg-neutral-50 p-3 rounded border border-neutral-200">
                      {request.user.profile.bio}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="ml-6 flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleRemoveBadge(request.user.id, request.user.username || "no-username")
                  }
                  disabled={isPending && actioningId === request.user.id}
                  className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && actioningId === request.user.id
                    ? "Removing..."
                    : "Remove Badge"}
                </button>
                <Link
                  href={`/admin/users/${request.user.id}`}
                  className="px-4 py-2 border border-neutral-300 text-ink-700 text-sm font-medium rounded-lg hover:bg-neutral-50 text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-ink-500">No verified professionals yet</p>
        </div>
      )}
    </div>
  );
}
