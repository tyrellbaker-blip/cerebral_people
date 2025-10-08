"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { dismissReport, actionReport } from "./actions";
import AdminBadge from "../components/AdminBadge";

interface Report {
  id: string;
  subjectType: string;
  subjectId: string;
  reason: string;
  status: string;
  createdAt: Date;
  reporter: {
    id: string;
    username: string | null;
    name: string | null;
  };
  post: {
    id: string;
    body: string;
    author: {
      username: string | null;
      name: string | null;
    };
  } | null;
  comment: {
    id: string;
    body: string;
    author: {
      username: string | null;
      name: string | null;
    };
  } | null;
  _count: {
    moderationActions: number;
  };
}

interface ReportsQueueProps {
  reports: Report[];
}

export default function ReportsQueue({ reports }: ReportsQueueProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleDismissReport = async (reportId: string) => {
    const reason = prompt("Enter reason for dismissing this report:");
    if (!reason) return;

    setActioningId(reportId);
    startTransition(async () => {
      await dismissReport(reportId, reason);
      router.refresh();
      setActioningId(null);
    });
  };

  const handleActionReport = async (
    reportId: string,
    action: "HIDE" | "WARN" | "BAN" | "DELETE"
  ) => {
    const notes = prompt(
      `Enter notes for this ${action} action (optional):`
    );

    if (!confirm(`Are you sure you want to ${action} based on this report?`))
      return;

    setActioningId(reportId);
    startTransition(async () => {
      await actionReport(reportId, action, notes || undefined);
      router.refresh();
      setActioningId(null);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "danger";
      case "TRIAGED":
        return "warning";
      case "ACTIONED":
        return "success";
      case "DISMISSED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {reports.length > 0 ? (
        reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Report Header */}
                <div className="flex items-center gap-3 mb-3">
                  <AdminBadge variant={getStatusColor(report.status) as any}>
                    {report.status}
                  </AdminBadge>
                  <span className="text-sm font-medium text-ink-700">
                    {report.subjectType}
                  </span>
                  <span className="text-xs text-ink-500">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Reporter Info */}
                <div className="text-sm text-ink-600 mb-3">
                  Reported by:{" "}
                  <Link
                    href={`/admin/users/${report.reporter.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    @{report.reporter.username || "no-username"}
                  </Link>
                </div>

                {/* Reason */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <div className="text-xs font-medium text-amber-900 mb-1">
                    Reason:
                  </div>
                  <div className="text-sm text-amber-800">{report.reason}</div>
                </div>

                {/* Reported Content */}
                {report.post && (
                  <div className="bg-neutral-50 rounded-lg p-3 mb-2">
                    <div className="text-xs text-ink-500 mb-1">
                      Post by @
                      {report.post.author.username || "no-username"}:
                    </div>
                    <div className="text-sm text-ink-900">
                      {report.post.body.slice(0, 150)}
                      {report.post.body.length > 150 && "..."}
                    </div>
                  </div>
                )}

                {report.comment && (
                  <div className="bg-neutral-50 rounded-lg p-3 mb-2">
                    <div className="text-xs text-ink-500 mb-1">
                      Comment by @
                      {report.comment.author.username || "no-username"}:
                    </div>
                    <div className="text-sm text-ink-900">
                      {report.comment.body}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="text-xs text-ink-500">
                  {report._count.moderationActions > 0 && (
                    <span>{report._count.moderationActions} previous actions</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {report.status === "OPEN" && (
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleActionReport(report.id, "HIDE")}
                    disabled={isPending && actioningId === report.id}
                    className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                  >
                    Hide Content
                  </button>
                  <button
                    onClick={() => handleActionReport(report.id, "WARN")}
                    disabled={isPending && actioningId === report.id}
                    className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    Warn User
                  </button>
                  <button
                    onClick={() => handleActionReport(report.id, "BAN")}
                    disabled={isPending && actioningId === report.id}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Ban User
                  </button>
                  <button
                    onClick={() => handleActionReport(report.id, "DELETE")}
                    disabled={isPending && actioningId === report.id}
                    className="px-3 py-1.5 text-xs bg-red-900 text-white rounded hover:bg-red-950 disabled:opacity-50"
                  >
                    Delete Content
                  </button>
                  <div className="border-t border-neutral-200 my-1" />
                  <button
                    onClick={() => handleDismissReport(report.id)}
                    disabled={isPending && actioningId === report.id}
                    className="px-3 py-1.5 text-xs border border-neutral-300 text-ink-700 rounded hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-ink-500">No reports found with the current filters</p>
        </div>
      )}
    </div>
  );
}
