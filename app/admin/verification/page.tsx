import { getPendingVerifications, getVerifiedProfessionals, getVerificationAuditLog } from "./actions";
import AdminBadge from "../components/AdminBadge";
import PendingVerificationQueue from "./PendingVerificationQueue";
import VerifiedProfessionals from "./VerifiedProfessionals";
import VerificationAuditLog from "./VerificationAuditLog";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: "pending" | "verified" | "audit";
  }>;
}) {
  const params = await searchParams;
  const view = params.view || "pending";

  const [pendingUsers, verifiedUsers, auditLog] = await Promise.all([
    view === "pending" ? getPendingVerifications() : Promise.resolve([]),
    view === "verified" ? getVerifiedProfessionals() : Promise.resolve([]),
    view === "audit" ? getVerificationAuditLog() : Promise.resolve([]),
  ]);

  const pendingCount = view === "pending" ? pendingUsers.length : await getPendingVerifications().then(u => u.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">
          Professional Verification
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Review and verify doctor and PT credentials
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <nav className="flex gap-6">
          <a
            href="/admin/verification?view=pending"
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === "pending"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-neutral-300"
            }`}
          >
            Pending Verification
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                {pendingCount}
              </span>
            )}
          </a>
          <a
            href="/admin/verification?view=verified"
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === "verified"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-neutral-300"
            }`}
          >
            Verified Professionals
          </a>
          <a
            href="/admin/verification?view=audit"
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              view === "audit"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-neutral-300"
            }`}
          >
            Audit Log
          </a>
        </nav>
      </div>

      {/* Content */}
      {view === "pending" && <PendingVerificationQueue users={pendingUsers} />}
      {view === "verified" && <VerifiedProfessionals users={verifiedUsers} />}
      {view === "audit" && <VerificationAuditLog logs={auditLog} />}
    </div>
  );
}
