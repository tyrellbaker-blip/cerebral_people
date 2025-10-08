"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { approveVerification, rejectVerification, requestMoreInfo } from "./actions";
import AdminBadge from "../components/AdminBadge";
import NPILookupButton from "./NPILookupButton";

interface VerificationRequest {
  id: string;
  role: string;
  npi: string | null;
  licenseNumber: string;
  licenseState: string;
  evidenceFileUrl: string | null;
  evidenceFileName: string | null;
  websiteUrl: string | null;
  status: string;
  notes: string | null;
  source: any;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    email: string | null;
    createdAt: Date;
    profile: {
      bio: string | null;
      profileType: string;
    } | null;
  };
}

interface PendingVerificationQueueProps {
  users: VerificationRequest[];
}

export default function PendingVerificationQueue({
  users,
}: PendingVerificationQueueProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleApprove = async (requestId: string, username: string) => {
    const notes = prompt(
      `Add optional admin notes for verification of @${username}:`
    );

    if (
      !confirm(
        `Approve verification for @${username}? They will receive a verified badge.`
      )
    ) {
      return;
    }

    setActioningId(requestId);
    startTransition(async () => {
      const result = await approveVerification(requestId, notes || undefined);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to approve verification");
      }
      setActioningId(null);
    });
  };

  const handleReject = async (requestId: string, username: string) => {
    const reason = prompt(`Enter reason for rejecting @${username}'s verification:`);
    if (!reason) return;

    if (!confirm(`Reject verification for @${username}?`)) return;

    setActioningId(requestId);
    startTransition(async () => {
      const result = await rejectVerification(requestId, reason);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to reject verification");
      }
      setActioningId(null);
    });
  };

  const handleRequestMoreInfo = async (requestId: string, username: string) => {
    const message = prompt(
      `What additional information is needed from @${username}?`
    );
    if (!message) return;

    setActioningId(requestId);
    startTransition(async () => {
      const result = await requestMoreInfo(requestId, message);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to request more info");
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
                  <AdminBadge variant="info">{request.role}</AdminBadge>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-ink-700">
                    <span className="font-medium">Name:</span>{" "}
                    {request.user.name || "Not provided"}
                  </div>
                  <div className="text-sm text-ink-700">
                    <span className="font-medium">Email:</span> {request.user.email || "Not provided"}
                  </div>
                  <div className="text-sm text-ink-500">
                    <span className="font-medium">Account created:</span>{" "}
                    {new Date(request.user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-ink-500">
                    <span className="font-medium">Request submitted:</span>{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
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

                {/* License Information */}
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    License Information
                  </div>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>
                      <span className="font-medium">License #:</span>{" "}
                      {request.licenseNumber}
                    </div>
                    <div>
                      <span className="font-medium">State:</span> {request.licenseState}
                    </div>
                    {request.npi && (
                      <div>
                        <span className="font-medium">NPI:</span> {request.npi}
                      </div>
                    )}
                    {request.websiteUrl && (
                      <div>
                        <span className="font-medium">Website:</span>{" "}
                        <a
                          href={request.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {request.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* User's Notes */}
                {request.notes && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-ink-700 mb-1">
                      Applicant's Notes:
                    </div>
                    <div className="text-sm text-ink-600 bg-neutral-50 p-3 rounded border border-neutral-200">
                      {request.notes}
                    </div>
                  </div>
                )}

                {/* Evidence File */}
                {request.evidenceFileUrl && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-ink-700 mb-1">
                      Evidence File:
                    </div>
                    <a
                      href={request.evidenceFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:text-brand-700 underline"
                    >
                      {request.evidenceFileName || "View Evidence"}
                    </a>
                  </div>
                )}

                {/* NPI Lookup Result */}
                {request.source && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-900 mb-2">
                      NPI Registry Check
                    </div>
                    <div className="text-xs text-green-800 whitespace-pre-wrap font-mono">
                      {JSON.stringify(request.source, null, 2)}
                    </div>
                  </div>
                )}

                {/* NPI Lookup Button */}
                {request.npi && (
                  <NPILookupButton
                    npi={request.npi}
                    firstName={request.user.name?.split(" ")[0]}
                    lastName={request.user.name?.split(" ").slice(1).join(" ")}
                    state={request.licenseState}
                    role={request.role}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="ml-6 flex flex-col gap-2 min-w-[140px]">
                <button
                  onClick={() => handleApprove(request.id, request.user.username || "user")}
                  disabled={isPending && actioningId === request.id}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && actioningId === request.id
                    ? "Processing..."
                    : "✓ Approve"}
                </button>
                <button
                  onClick={() => handleReject(request.id, request.user.username || "user")}
                  disabled={isPending && actioningId === request.id}
                  className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && actioningId === request.id
                    ? "Processing..."
                    : "✗ Reject"}
                </button>
                <button
                  onClick={() => handleRequestMoreInfo(request.id, request.user.username || "user")}
                  disabled={isPending && actioningId === request.id}
                  className="px-4 py-2 border border-amber-300 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending && actioningId === request.id
                    ? "Processing..."
                    : "? More Info"}
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
          <p className="text-ink-500">
            No pending verification requests at this time
          </p>
        </div>
      )}
    </div>
  );
}
