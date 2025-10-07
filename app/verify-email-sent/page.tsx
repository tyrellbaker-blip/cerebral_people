import Link from "next/link";

export default function VerifyEmailSentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Check Your Email</h1>
          <p className="text-amber-700">We&apos;ve sent you a verification link</p>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-amber-800">
            Please check your email inbox and click the verification link to complete your registration.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <p className="font-medium mb-1">Didn&apos;t receive the email?</p>
            <p className="text-amber-700">
              Check your spam folder, or wait a few minutes and try again.
            </p>
          </div>

          <div className="pt-4">
            <Link
              href="/signin"
              className="inline-block text-amber-700 hover:text-amber-900 font-medium"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
