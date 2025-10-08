import { adminLoginAction } from "./actions";
import AdminLoginForm from "./AdminLoginForm";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-ink-900 mb-2">
              Admin Login
            </h1>
            <p className="text-sm text-ink-500">
              Secure access to the admin panel
            </p>
          </div>

          {/* Login Form */}
          <AdminLoginForm loginAction={adminLoginAction} />

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">⚠️</span>
              <div className="text-xs text-amber-900">
                <p className="font-semibold mb-1">Security Notice:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Admin sessions expire after 8 hours</li>
                  <li>All admin actions are logged for audit purposes</li>
                  <li>Failed login attempts are monitored</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Back to Site Link */}
          <div className="mt-6 text-center">
            <Link
              href="/feed"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              ← Back to Cerebral People
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
