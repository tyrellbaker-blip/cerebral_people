import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import VerificationForm from "./VerificationForm";
import { getVerificationRequest } from "@/app/actions/verification";

export default async function VerifyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/verify");
  }

  // Get existing verification request if any
  const existingRequest = await getVerificationRequest();

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink-900 mb-2">
              Professional Verification
            </h1>
            <p className="text-ink-600">
              Submit your credentials to receive a verified professional badge on your profile.
            </p>
          </div>

          {/* Show current status if exists */}
          {existingRequest && (
            <div className="mb-8">
              <StatusBanner status={existingRequest.status} adminNotes={existingRequest.adminNotes} />
            </div>
          )}

          {/* Show form if no request or if rejected/more info needed */}
          {(!existingRequest ||
            existingRequest.status === "REJECTED" ||
            existingRequest.status === "MORE_INFO_NEEDED") && (
            <VerificationForm existingRequest={existingRequest} />
          )}

          {/* Show pending message */}
          {existingRequest && existingRequest.status === "PENDING" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold text-ink-900 mb-2">
                Verification In Progress
              </h2>
              <p className="text-ink-600 mb-6">
                Your verification request is being reviewed by our team. We'll notify you once a decision is made.
              </p>
              <div className="text-sm text-ink-500 bg-warm-50 p-4 rounded-lg">
                <p className="font-medium mb-1">Submitted Information:</p>
                <div className="space-y-1 text-left max-w-md mx-auto">
                  <p><span className="font-medium">Role:</span> {existingRequest.role}</p>
                  <p><span className="font-medium">License #:</span> {existingRequest.licenseNumber}</p>
                  <p><span className="font-medium">State:</span> {existingRequest.licenseState}</p>
                  {existingRequest.npi && (
                    <p><span className="font-medium">NPI:</span> {existingRequest.npi}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show approved message */}
          {existingRequest && existingRequest.status === "APPROVED" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-ink-900 mb-2">
                Verification Approved!
              </h2>
              <p className="text-ink-600 mb-6">
                Your professional credentials have been verified. You now have a verified badge on your profile.
              </p>
              <div className="text-sm text-ink-500 bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-medium mb-1">Verified As:</p>
                <p className="text-green-900">{existingRequest.role}</p>
                {existingRequest.reviewedAt && (
                  <p className="text-xs text-green-700 mt-2">
                    Approved on {new Date(existingRequest.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-6">
                If you need to update your verification information, please contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({
  status,
  adminNotes
}: {
  status: string;
  adminNotes: string | null;
}) {
  if (status === "PENDING") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-900 font-medium mb-1">
          <span>⏳</span>
          <span>Verification Pending</span>
        </div>
        <p className="text-sm text-blue-700">
          Your verification request is currently being reviewed by our team.
        </p>
      </div>
    );
  }

  if (status === "MORE_INFO_NEEDED") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-900 font-medium mb-1">
          <span>ℹ️</span>
          <span>Additional Information Needed</span>
        </div>
        <p className="text-sm text-amber-700 mb-2">
          Our team needs more information to complete your verification:
        </p>
        {adminNotes && (
          <div className="bg-white p-3 rounded border border-amber-200 text-sm text-amber-900">
            {adminNotes}
          </div>
        )}
        <p className="text-sm text-amber-700 mt-2">
          Please update your information below and resubmit.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-900 font-medium mb-1">
          <span>❌</span>
          <span>Verification Not Approved</span>
        </div>
        <p className="text-sm text-red-700 mb-2">
          Your verification request was not approved:
        </p>
        {adminNotes && (
          <div className="bg-white p-3 rounded border border-red-200 text-sm text-red-900">
            {adminNotes}
          </div>
        )}
        <p className="text-sm text-red-700 mt-2">
          You may submit a new request below if you'd like to try again.
        </p>
      </div>
    );
  }

  return null;
}
