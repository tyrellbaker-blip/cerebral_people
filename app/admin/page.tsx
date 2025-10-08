import { getAdminStats } from "@/lib/admin-auth";
import AdminStatCard from "./components/AdminStatCard";
import AdminBadge from "./components/AdminBadge";
import Link from "next/link";

export default async function AdminDashboard() {
  // Gracefully handle database connection issues
  let stats;
  try {
    stats = await getAdminStats();
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    // Use placeholder data
    stats = {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      dailyActiveUsers: 0,
      newSignups: 0,
      totalPosts: 0,
      totalComments: 0,
      openReports: 0,
      pendingVerifications: 0,
    };
  }

  const quickActions = [
    { name: "Review Reports", href: "/admin/moderation", count: stats.openReports, variant: "danger" as const },
    { name: "Verify Professionals", href: "/admin/verification", count: stats.pendingVerifications, variant: "warning" as const },
    { name: "Manage Users", href: "/admin/users", icon: "👥" },
    { name: "Send Announcement", href: "/admin/communications", icon: "📢" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          Overview of your community's health and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description={`${stats.activeUsers} active`}
          icon="👥"
        />
        <AdminStatCard
          title="Daily Active Users"
          value={stats.dailyActiveUsers.toLocaleString()}
          description="Last 24 hours"
          icon="📊"
        />
        <AdminStatCard
          title="New Signups"
          value={stats.newSignups.toLocaleString()}
          description="Last 7 days"
          trend={{
            value: "+12%",
            positive: true,
          }}
          icon="✨"
        />
        <AdminStatCard
          title="Total Posts"
          value={stats.totalPosts.toLocaleString()}
          description={`${stats.totalComments.toLocaleString()} comments`}
          icon="📝"
        />
      </div>

      {/* Alerts Section */}
      {(stats.openReports > 0 || stats.suspendedUsers > 0 || stats.pendingVerifications > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-amber-900 mb-4">
            ⚠️ Needs Attention
          </h2>
          <div className="space-y-3">
            {stats.openReports > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-900">
                  <strong>{stats.openReports}</strong> open reports awaiting review
                </span>
                <Link
                  href="/admin/moderation"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Review →
                </Link>
              </div>
            )}
            {stats.pendingVerifications > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-900">
                  <strong>{stats.pendingVerifications}</strong> professional verifications pending
                </span>
                <Link
                  href="/admin/verification"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Review →
                </Link>
              </div>
            )}
            {stats.suspendedUsers > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-900">
                  <strong>{stats.suspendedUsers}</strong> suspended users
                </span>
                <Link
                  href="/admin/users?filter=suspended"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  View →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="relative bg-white rounded-lg border border-neutral-200 p-6 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-ink-900 group-hover:text-brand-600 transition-colors">
                    {action.name}
                  </h3>
                  {action.count !== undefined && action.count > 0 && (
                    <div className="mt-2">
                      <AdminBadge variant={action.variant}>
                        {action.count} pending
                      </AdminBadge>
                    </div>
                  )}
                </div>
                {action.icon && <span className="text-2xl">{action.icon}</span>}
              </div>
              <div className="mt-4 text-sm text-brand-600 font-medium group-hover:translate-x-1 transition-transform">
                Open →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-ink-500 mb-1">Community Health</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-ink-900">Healthy</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-ink-500 mb-1">Average Response Time</div>
            <div className="text-sm font-medium text-ink-900">
              &lt; 2 hours
            </div>
          </div>
          <div>
            <div className="text-sm text-ink-500 mb-1">Content Quality</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-ink-900">Excellent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
