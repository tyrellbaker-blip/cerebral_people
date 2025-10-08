"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface UserFiltersProps {
  search: string;
  status: string;
  role: string;
  profileType: string;
}

export default function UserFilters({ search, status, role, profileType }: UserFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(search);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin/users?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/admin/users");
    });
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username, email, or name..."
            disabled={isPending}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            disabled={isPending}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="SHADOWBANNED">Shadowbanned</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => updateFilters({ role: e.target.value })}
            disabled={isPending}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="ALL">All Roles</option>
            <option value="MEMBER">Member</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Profile Type Filter */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Profile Type
          </label>
          <select
            value={profileType}
            onChange={(e) => updateFilters({ profileType: e.target.value })}
            disabled={isPending}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="ALL">All Types</option>
            <option value="NORMAL">Normal</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PT">Physical Therapist</option>
            <option value="PARENT">Parent/Caregiver</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(search || status !== "ALL" || role !== "ALL" || profileType !== "ALL") && (
        <div>
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
