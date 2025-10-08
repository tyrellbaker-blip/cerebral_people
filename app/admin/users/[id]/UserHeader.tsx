"use client";

import { useState } from "react";
import Link from "next/link";
import RoleChangeModal from "./RoleChangeModal";
import ProfileTypeModal from "./ProfileTypeModal";
import UserActionsMenu from "./UserActionsMenu";

interface UserHeaderProps {
  userId: string;
  username: string | null;
  currentRole: string;
  currentProfileType: string;
  currentStatus: string;
}

export default function UserHeader({
  userId,
  username,
  currentRole,
  currentProfileType,
  currentStatus,
}: UserHeaderProps) {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProfileTypeModalOpen, setIsProfileTypeModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            ← Back to Users
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-ink-900">User Details</h1>
            <p className="mt-1 text-sm text-ink-500">@{username || "no-username"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            Edit Role
          </button>
          <button
            onClick={() => setIsProfileTypeModalOpen(true)}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 bg-white hover:bg-neutral-50 transition-colors"
          >
            Edit Profile Type
          </button>
          <UserActionsMenu
            userId={userId}
            username={username}
            currentStatus={currentStatus}
          />
        </div>
      </div>

      <RoleChangeModal
        userId={userId}
        currentRole={currentRole}
        username={username || "no-username"}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <ProfileTypeModal
        userId={userId}
        currentProfileType={currentProfileType}
        username={username || "no-username"}
        isOpen={isProfileTypeModalOpen}
        onClose={() => setIsProfileTypeModalOpen(false)}
      />
    </>
  );
}
