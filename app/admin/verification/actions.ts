"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get pending verification requests
 */
export async function getPendingVerifications() {
  await requireAdminAuth();

  const requests = await prisma.verificationRequest.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              profileType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc", // Oldest first (FIFO)
    },
  });

  return requests;
}

/**
 * Get verification requests needing more info
 */
export async function getMoreInfoNeeded() {
  await requireAdminAuth();

  const requests = await prisma.verificationRequest.findMany({
    where: {
      status: "MORE_INFO_NEEDED",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: {
            select: {
              bio: true,
              profileType: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return requests;
}

/**
 * Get all verified professionals
 */
export async function getVerifiedProfessionals() {
  await requireAdminAuth();

  const requests = await prisma.verificationRequest.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          profile: {
            select: {
              bio: true,
              profileType: true,
              isVerified: true,
              verifiedAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      reviewedAt: "desc",
    },
  });

  return requests;
}

/**
 * Get single verification request with full details
 */
export async function getVerificationRequestDetail(requestId: string) {
  await requireAdminAuth();

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              profileType: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });

  return request;
}

/**
 * Approve verification request
 */
export async function approveVerification(requestId: string, adminNotes?: string) {
  const { admin } = await requireAdminAuth();

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: {
            select: {
              id: true,
              profileType: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    return { success: false, error: "Verification request not found" };
  }

  if (request.status === "APPROVED") {
    return { success: false, error: "Request is already approved" };
  }

  // Update verification request
  await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      adminNotes,
      reviewedBy: admin.username,
      reviewedAt: new Date(),
    },
  });

  // Update user profile to mark as verified
  if (request.user.profile) {
    // Map verification role to ProfileType
    const profileType = request.role === "PT" ? "PT" : "DOCTOR";

    await prisma.profile.update({
      where: { id: request.user.profile.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        // Update profileType to match the verification role if needed
        profileType: profileType as any,
      },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "APPROVE_VERIFICATION",
      targetType: "USER",
      targetId: request.userId,
      detail: {
        message: `Approved ${request.role} verification for @${request.user.username}`,
        role: request.role,
        npi: request.npi,
        licenseNumber: request.licenseNumber,
        licenseState: request.licenseState,
        adminNotes,
        adminUsername: admin.username,
        adminName: admin.name,
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true };
}

/**
 * Reject verification request
 */
export async function rejectVerification(requestId: string, reason: string) {
  const { admin } = await requireAdminAuth();

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!request) {
    return { success: false, error: "Verification request not found" };
  }

  // Update verification request
  await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      adminNotes: reason,
      reviewedBy: admin.username,
      reviewedAt: new Date(),
    },
  });

  // Log the rejection
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "REJECT_VERIFICATION",
      targetType: "USER",
      targetId: request.userId,
      detail: {
        message: `Rejected ${request.role} verification for @${request.user.username}`,
        role: request.role,
        reason,
        adminUsername: admin.username,
        adminName: admin.name,
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true };
}

/**
 * Request more information
 */
export async function requestMoreInfo(requestId: string, message: string) {
  const { admin } = await requireAdminAuth();

  const request = await prisma.verificationRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  if (!request) {
    return { success: false, error: "Verification request not found" };
  }

  // Update verification request
  await prisma.verificationRequest.update({
    where: { id: requestId },
    data: {
      status: "MORE_INFO_NEEDED",
      adminNotes: message,
      reviewedBy: admin.username,
      reviewedAt: new Date(),
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "REQUEST_MORE_INFO",
      targetType: "USER",
      targetId: request.userId,
      detail: {
        message: `Requested more info for ${request.role} verification from @${request.user.username}`,
        role: request.role,
        adminMessage: message,
        adminUsername: admin.username,
        adminName: admin.name,
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true };
}

/**
 * Remove verified badge
 */
export async function removeVerifiedBadge(userId: string, reason: string) {
  const { admin } = await requireAdminAuth();

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      profile: {
        select: {
          id: true,
          profileType: true,
          isVerified: true,
        },
      },
      verificationRequest: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!user || !user.profile) {
    return { success: false, error: "User or profile not found" };
  }

  if (!user.profile.isVerified) {
    return { success: false, error: "User is not verified" };
  }

  // Remove verification from profile
  await prisma.profile.update({
    where: { id: user.profile.id },
    data: {
      isVerified: false,
      verifiedAt: null,
    },
  });

  // Update verification request to rejected if exists
  if (user.verificationRequest) {
    await prisma.verificationRequest.update({
      where: { id: user.verificationRequest.id },
      data: {
        status: "REJECTED",
        adminNotes: `Badge removed: ${reason}`,
        reviewedBy: admin.username,
        reviewedAt: new Date(),
      },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "REMOVE_VERIFIED_BADGE",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Removed verified badge from @${user.username}`,
        profileType: user.profile.profileType,
        reason,
        adminUsername: admin.username,
        adminName: admin.name,
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true };
}

/**
 * Get verification audit log
 */
export async function getVerificationAuditLog() {
  await requireAdminAuth();

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          "APPROVE_VERIFICATION",
          "REJECT_VERIFICATION",
          "REQUEST_MORE_INFO",
          "REMOVE_VERIFIED_BADGE",
        ],
      },
    },
    select: {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      detail: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  return auditLogs;
}
