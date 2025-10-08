"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminBadge from "../components/AdminBadge";

interface User {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  role: string;
  status: string;
  emailVerified: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  suspendedUntil: Date | null;
  suspensionReason: string | null;
  profile: {
    profileType: string;
    isVerified: boolean;
  } | null;
}

interface UserTableProps {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  currentPage: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "danger";
    case "SHADOWBANNED":
      return "warning";
    case "DELETED":
      return "default";
    default:
      return "default";
  }
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

export default function UserTable({ users, pagination, currentPage }: UserTableProps) {
  const router = useRouter();

  const goToPage = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    router.push(url.pathname + url.search);
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                Profile Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-ink-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-ink-900">
                          {user.name || "No name"}
                        </div>
                        <div className="text-sm text-ink-500">
                          @{user.username || "no-username"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-ink-900">{user.email || "No email"}</div>
                    {user.email && user.emailVerified ? (
                      <div className="text-xs text-green-600">✓ Verified</div>
                    ) : user.email ? (
                      <div className="text-xs text-amber-600">⚠ Not verified</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminBadge variant={getRoleColor(user.role) as any}>
                      {user.role}
                    </AdminBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AdminBadge variant={getStatusColor(user.status) as any}>
                      {user.status}
                    </AdminBadge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-ink-900">
                      {user.profile?.profileType || "NORMAL"}
                    </div>
                    {user.profile?.isVerified && (
                      <div className="text-xs text-blue-600">✓ Verified</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-sm text-ink-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{" "}
            {pagination.totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
