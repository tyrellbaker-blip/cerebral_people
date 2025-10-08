"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitVerificationRequest } from "@/app/actions/verification";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

const ROLE_OPTIONS = [
  { value: "MD", label: "MD - Doctor of Medicine" },
  { value: "DO", label: "DO - Doctor of Osteopathic Medicine" },
  { value: "PA", label: "PA - Physician Assistant" },
  { value: "PT", label: "PT - Physical Therapist" },
];

interface VerificationFormProps {
  existingRequest: {
    id: string;
    role: string;
    npi: string | null;
    licenseNumber: string;
    licenseState: string;
    evidenceFileUrl: string | null;
    evidenceFileName: string | null;
    websiteUrl: string | null;
    status: string;
    notes: string | null;
    adminNotes: string | null;
  } | null;
}

export default function VerificationForm({ existingRequest }: VerificationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    role: existingRequest?.role || "MD",
    licenseNumber: existingRequest?.licenseNumber || "",
    licenseState: existingRequest?.licenseState || "",
    npi: existingRequest?.npi || "",
    websiteUrl: existingRequest?.websiteUrl || "",
    notes: existingRequest?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required";
    if (!formData.licenseState) newErrors.licenseState = "License state is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const result = await submitVerificationRequest({
        role: formData.role as "MD" | "DO" | "PA" | "PT",
        licenseNumber: formData.licenseNumber,
        licenseState: formData.licenseState,
        npi: formData.npi || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        notes: formData.notes || undefined,
        // TODO: Add file upload integration
        // evidenceFileUrl: uploadedFileUrl,
        // evidenceFileName: uploadedFileName,
      });

      if (result.success) {
        alert(result.message || "Verification request submitted successfully!");
        router.refresh();
      } else {
        alert(result.error || "Failed to submit verification request");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-ink-900 mb-2">
          Professional Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          required
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
      </div>

      {/* License Number */}
      <div>
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-ink-900 mb-2">
          License Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="licenseNumber"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          placeholder="Enter your professional license number"
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          required
        />
        {errors.licenseNumber && (
          <p className="text-sm text-red-600 mt-1">{errors.licenseNumber}</p>
        )}
        <p className="text-xs text-ink-500 mt-1">
          Your state-issued professional license number
        </p>
      </div>

      {/* License State */}
      <div>
        <label htmlFor="licenseState" className="block text-sm font-medium text-ink-900 mb-2">
          License State <span className="text-red-500">*</span>
        </label>
        <select
          id="licenseState"
          value={formData.licenseState}
          onChange={(e) => setFormData({ ...formData, licenseState: e.target.value })}
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          required
        >
          <option value="">Select a state</option>
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.licenseState && (
          <p className="text-sm text-red-600 mt-1">{errors.licenseState}</p>
        )}
        <p className="text-xs text-ink-500 mt-1">
          The state where your license was issued
        </p>
      </div>

      {/* NPI (Optional) */}
      <div>
        <label htmlFor="npi" className="block text-sm font-medium text-ink-900 mb-2">
          NPI Number <span className="text-ink-500 font-normal">(Optional but recommended)</span>
        </label>
        <input
          type="text"
          id="npi"
          value={formData.npi}
          onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
          placeholder="10-digit National Provider Identifier"
          maxLength={10}
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <p className="text-xs text-ink-500 mt-1">
          Providing your NPI speeds up verification. Find yours at{" "}
          <a
            href="https://npiregistry.cms.hhs.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline"
          >
            npiregistry.cms.hhs.gov
          </a>
        </p>
      </div>

      {/* Website/Clinic URL (Optional) */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-ink-900 mb-2">
          Professional Website or Clinic URL <span className="text-ink-500 font-normal">(Optional)</span>
        </label>
        <input
          type="url"
          id="websiteUrl"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <p className="text-xs text-ink-500 mt-1">
          Link to your practice website or clinic page
        </p>
      </div>

      {/* Evidence File Upload (TODO) */}
      <div>
        <label className="block text-sm font-medium text-ink-900 mb-2">
          Evidence File <span className="text-ink-500 font-normal">(Upload coming soon)</span>
        </label>
        <div className="border-2 border-dashed border-warm-300 rounded-lg p-6 text-center bg-warm-50">
          <div className="text-ink-500 text-sm">
            <p className="mb-1">📎 File upload will be available soon</p>
            <p className="text-xs">
              You'll be able to upload a copy of your license or other verification documents
            </p>
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-1">
          Accepted formats: PDF, JPG, PNG (max 5MB)
        </p>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink-900 mb-2">
          Additional Notes <span className="text-ink-500 font-normal">(Optional)</span>
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional information you'd like to provide..."
          rows={4}
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-ink-500 mt-1">
          Include any details that might help with verification
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">🔒 Privacy Notice:</span> Your verification information will only be visible to our admin team and will be used solely for the purpose of confirming your professional credentials. Your license number and NPI will not be publicly displayed.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? "Submitting..."
            : existingRequest
            ? "Update Verification Request"
            : "Submit Verification Request"}
        </button>
      </div>

      <p className="text-xs text-center text-ink-500">
        By submitting, you confirm that all information provided is accurate and truthful.
      </p>
    </form>
  );
}
