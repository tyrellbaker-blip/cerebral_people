import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface VerifyEmailPageProps {
  searchParams: { token?: string };
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-900 mb-4">Invalid Link</h1>
            <p className="text-red-700 mb-6">This verification link is invalid.</p>
            <Link
              href="/signin"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Find the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-900 mb-4">Link Not Found</h1>
            <p className="text-red-700 mb-6">This verification link doesn&apos;t exist or has already been used.</p>
            <Link
              href="/signin"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-900 mb-4">Link Expired</h1>
            <p className="text-red-700 mb-6">This verification link has expired. Please sign up again to receive a new verification email.</p>
            <Link
              href="/signup"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Sign Up Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Find the user with this email
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-900 mb-4">User Not Found</h1>
            <p className="text-red-700 mb-6">No account found with this email address.</p>
            <Link
              href="/signup"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verify the user's email
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // Delete the verification token
  await prisma.verificationToken.delete({
    where: { token },
  });

  // Award FIRST_POST badge (optional)
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      badges: {
        push: "VERIFIED_EMAIL",
      },
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Email Verified!</h1>
          <p className="text-green-700 mb-6">Your email has been successfully verified. You can now sign in to your account.</p>
          <Link
            href="/signin"
            className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
