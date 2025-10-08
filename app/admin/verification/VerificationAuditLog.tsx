"use client";

import AdminBadge from "../components/AdminBadge";

interface AuditLogEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  detail: any;
  createdAt: Date;
}

interface VerificationAuditLogProps {
  logs: AuditLogEntry[];
}

export default function VerificationAuditLog({
  logs,
}: VerificationAuditLogProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case "VERIFY_CREDENTIALS":
        return "success";
      case "REJECT_VERIFICATION":
        return "danger";
      case "REMOVE_VERIFIED_BADGE":
        return "warning";
      default:
        return "default";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "VERIFY_CREDENTIALS":
        return "Verified";
      case "REJECT_VERIFICATION":
        return "Rejected";
      case "REMOVE_VERIFIED_BADGE":
        return "Badge Removed";
      default:
        return action;
    }
  };

  return (
    <div className="space-y-4">
      {logs.length > 0 ? (
        logs.map((log) => (
          <div
            key={log.id}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Action Header */}
                <div className="flex items-center gap-3 mb-3">
                  <AdminBadge variant={getActionColor(log.action) as any}>
                    {getActionLabel(log.action)}
                  </AdminBadge>
                  <span className="text-sm text-ink-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {log.detail && typeof log.detail === "object" && (
                    <>
                      {log.detail.message && (
                        <div className="text-sm text-ink-900">
                          {log.detail.message}
                        </div>
                      )}

                      {log.detail.profileType && (
                        <div className="text-sm text-ink-600">
                          <span className="font-medium">Profile Type:</span>{" "}
                          {log.detail.profileType}
                        </div>
                      )}

                      {log.detail.reason && (
                        <div className="text-sm text-ink-600">
                          <span className="font-medium">Reason:</span>{" "}
                          {log.detail.reason}
                        </div>
                      )}

                      {log.detail.notes && (
                        <div className="text-sm text-ink-600">
                          <span className="font-medium">Notes:</span>{" "}
                          {log.detail.notes}
                        </div>
                      )}

                      {log.detail.credentialsCleared !== undefined && (
                        <div className="text-sm text-ink-600">
                          <span className="font-medium">
                            Credentials Cleared:
                          </span>{" "}
                          {log.detail.credentialsCleared ? "Yes" : "No"}
                        </div>
                      )}

                      {log.detail.adminUsername && (
                        <div className="text-xs text-ink-500 mt-2">
                          By: {log.detail.adminName || log.detail.adminUsername}{" "}
                          (Admin)
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Target ID */}
              {log.targetId && (
                <div className="ml-4">
                  <div className="text-xs text-ink-500 mb-1">Target ID</div>
                  <div className="text-xs font-mono text-ink-700 bg-neutral-100 px-2 py-1 rounded">
                    {log.targetId.slice(0, 8)}...
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-ink-500">No verification audit logs yet</p>
        </div>
      )}
    </div>
  );
}
