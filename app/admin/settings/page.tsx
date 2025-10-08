import { requireAdminAuth } from "@/lib/admin-auth";
import PasswordChangeForm from "./PasswordChangeForm";
import { changePasswordAction } from "./actions";

export default async function AdminSettingsPage() {
  const { admin } = await requireAdminAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage your admin account settings
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-4">
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1">
              Username
            </label>
            <p className="text-sm text-ink-900 font-medium">{admin.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1">
              Name
            </label>
            <p className="text-sm text-ink-900 font-medium">{admin.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1">
              Email
            </label>
            <p className="text-sm text-ink-900 font-medium">{admin.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-500 mb-1">
              Account Type
            </label>
            <div className="flex items-center gap-2">
              {admin.isSuperAdmin ? (
                <span className="px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                  SUPER ADMIN
                </span>
              ) : (
                <span className="px-2 py-1 rounded-md bg-brand-100 text-brand-700 text-xs font-medium">
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-4">
          Change Password
        </h2>
        <div className="max-w-md">
          <PasswordChangeForm changePasswordAction={changePasswordAction} />
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-amber-600 text-xl mt-0.5">🔒</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              Security Best Practices
            </h3>
            <ul className="space-y-1 text-xs text-amber-900 list-disc list-inside">
              <li>Use a strong, unique password for your admin account</li>
              <li>Never share your admin credentials with anyone</li>
              <li>Change your password regularly (every 90 days recommended)</li>
              <li>Always log out when finished with admin tasks</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
