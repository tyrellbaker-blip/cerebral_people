"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get current user's verification request status
 */
export async function getVerificationRequest() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userId = (session.user as any).id as string;

  const request = await prisma.verificationRequest.findUnique({
    where: { userId },
    select: {
      id: true,
      role: true,
      npi: true,
      licenseNumber: true,
      licenseState: true,
      evidenceFileUrl: true,
      evidenceFileName: true,
      websiteUrl: true,
      status: true,
      notes: true,
      adminNotes: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return request;
}

/**
 * Submit verification request
 */
export async function submitVerificationRequest(data: {
  role: "MD" | "DO" | "PA" | "PT";
  npi?: string;
  licenseNumber: string;
  licenseState: string;
  evidenceFileUrl?: string;
  evidenceFileName?: string;
  websiteUrl?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = (session.user as any).id as string;

  // Check if user already has a verification request
  const existing = await prisma.verificationRequest.findUnique({
    where: { userId },
  });

  if (existing) {
    // Update existing request (only if not already approved)
    if (existing.status === "APPROVED") {
      return {
        success: false,
        error: "You are already verified. Contact support if you need to update your information.",
      };
    }

    await prisma.verificationRequest.update({
      where: { userId },
      data: {
        role: data.role,
        npi: data.npi || null,
        licenseNumber: data.licenseNumber,
        licenseState: data.licenseState,
        evidenceFileUrl: data.evidenceFileUrl || null,
        evidenceFileName: data.evidenceFileName || null,
        websiteUrl: data.websiteUrl || null,
        notes: data.notes || null,
        status: "PENDING",
        adminNotes: null,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: "Verification request updated successfully" };
  }

  // Create new request
  await prisma.verificationRequest.create({
    data: {
      userId,
      role: data.role,
      npi: data.npi || null,
      licenseNumber: data.licenseNumber,
      licenseState: data.licenseState,
      evidenceFileUrl: data.evidenceFileUrl || null,
      evidenceFileName: data.evidenceFileName || null,
      websiteUrl: data.websiteUrl || null,
      notes: data.notes || null,
      status: "PENDING",
    },
  });

  return { success: true, message: "Verification request submitted successfully" };
}

/**
 * Cancel verification request (only if pending or more info needed)
 */
export async function cancelVerificationRequest() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = (session.user as any).id as string;

  const existing = await prisma.verificationRequest.findUnique({
    where: { userId },
  });

  if (!existing) {
    return { success: false, error: "No verification request found" };
  }

  if (existing.status === "APPROVED") {
    return { success: false, error: "Cannot cancel approved verification" };
  }

  await prisma.verificationRequest.delete({
    where: { userId },
  });

  return { success: true };
}
