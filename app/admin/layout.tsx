import { requireAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = await requireAdminAuth();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Moderation", href: "/admin/moderation", icon: "🛡️" },
    { name: "Verification", href: "/admin/verification", icon: "✓" },
    { name: "Communications", href: "/admin/communications", icon: "📢" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
    { name: "Configuration", href: "/admin/config", icon: "⚙️" },
    { name: "Audit Logs", href: "/admin/audit", icon: "📝" },
    { name: "Settings", href: "/admin/settings", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-ink-900">
              Cerebral People Admin
            </h1>
            {admin.isSuperAdmin && (
              <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                SUPER ADMIN
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-ink-900">{admin.name}</div>
              <div className="text-xs text-ink-500">@{admin.username}</div>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-ink-700 hover:bg-neutral-100 hover:text-ink-900 transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
