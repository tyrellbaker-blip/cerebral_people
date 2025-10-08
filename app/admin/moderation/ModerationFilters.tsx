"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ModerationFiltersProps {
  view: "content" | "reports";
  currentParams: {
    contentType?: string;
    status?: string;
    search?: string;
    timeframe?: string;
    reportStatus?: string;
    reportType?: string;
  };
}

export default function ModerationFilters({
  view,
  currentParams,
}: ModerationFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentParams.search || "");

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    params.set("view", view);

    // Keep existing params
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value && key !== "view") {
        params.set(key, value);
      }
    });

    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/admin/moderation?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const clearFilters = () => {
    setSearch("");
    router.push(`/admin/moderation?view=${view}`);
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="space-y-4">
        {/* Content Dashboard Filters */}
        {view === "content" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Content Type
                </label>
                <select
                  value={currentParams.contentType || "all"}
                  onChange={(e) => updateFilters({ contentType: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">All Content</option>
                  <option value="posts">Posts Only</option>
                  <option value="comments">Comments Only</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Status
                </label>
                <select
                  value={currentParams.status || "ALL"}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="HIDDEN">Hidden</option>
                  <option value="REMOVED">Removed</option>
                </select>
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Timeframe
                </label>
                <select
                  value={currentParams.timeframe || "24h"}
                  onChange={(e) => updateFilters({ timeframe: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 hover:bg-neutral-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit}>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Search Content
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by keyword..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                >
                  Search
                </button>
              </div>
            </form>
          </>
        )}

        {/* Reports Queue Filters */}
        {view === "reports" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Status */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Report Status
              </label>
              <select
                value={currentParams.reportStatus || "OPEN"}
                onChange={(e) => updateFilters({ reportStatus: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="TRIAGED">Triaged</option>
                <option value="ACTIONED">Actioned</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Content Type
              </label>
              <select
                value={currentParams.reportType || "ALL"}
                onChange={(e) => updateFilters({ reportType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Types</option>
                <option value="POST">Posts</option>
                <option value="COMMENT">Comments</option>
                <option value="USER">Users</option>
                <option value="RECOMMENDATION">Recommendations</option>
                <option value="MESSAGE">Messages</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-ink-700 hover:bg-neutral-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
