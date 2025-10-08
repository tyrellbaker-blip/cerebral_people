"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Get detailed user information including auth metadata
 */
export async function getUserDetails(userId: string) {
  await requireAdminAuth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      suspendedUntil: true,
      suspensionReason: true,

      profile: {
        select: {
          id: true,
          profileType: true,
          isVerified: true,
          verifiedAt: true,
          bio: true,
          region: true,
          city: true,
          state: true,
          zip: true,
          mobilityAids: true,
          assistiveTech: true,
          commModes: true,
          cpSubtype: true,
          gmfcs: true,
          transport: true,
          credentials: true,
          createdAt: true,
          updatedAt: true,
        },
      },

      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
          type: true,
        },
      },

      sessions: {
        select: {
          id: true,
          sessionToken: true,
          expires: true,
        },
        orderBy: { expires: "desc" },
        take: 5,
      },

      _count: {
        select: {
          posts: true,
          comments: true,
          followers: true,
          follows: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: string) {
  await requireAdminAuth();

  const [recentPosts, recentComments] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        body: true,
        createdAt: true,
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.comment.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        body: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            body: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    recentPosts,
    recentComments,
  };
}

/**
 * Get user's audit log (admin actions on this user)
 */
export async function getUserAuditLog(userId: string) {
  await requireAdminAuth();

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { targetId: userId },
        { targetType: "USER" },
      ],
    },
    select: {
      id: true,
      action: true,
      detail: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      actor: {
        select: {
          username: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return auditLogs;
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: "MEMBER" | "MODERATOR" | "ADMIN"
) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, username: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Update the role
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "UPDATE_USER_ROLE",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Changed role from ${user.role} to ${newRole} for @${user.username}`,
        oldRole: user.role,
        newRole,
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
 * Update user profile type
 */
export async function updateProfileType(
  userId: string,
  newProfileType: "NORMAL" | "DOCTOR" | "PT" | "PARENT"
) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      profile: {
        select: {
          id: true,
          profileType: true,
        },
      },
    },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // If user doesn't have a profile, create one
  if (!user.profile) {
    await prisma.profile.create({
      data: {
        userId,
        profileType: newProfileType,
      },
    });
  } else {
    // Update existing profile
    await prisma.profile.update({
      where: { id: user.profile.id },
      data: { profileType: newProfileType },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "UPDATE_PROFILE_TYPE",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Changed profile type from ${user.profile?.profileType || "NORMAL"} to ${newProfileType} for @${user.username}`,
        oldProfileType: user.profile?.profileType || "NORMAL",
        newProfileType,
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
 * Suspend user with reason and duration
 */
export async function suspendUser(
  userId: string,
  reason: string,
  durationDays: number
) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status === "SUSPENDED") {
    return { success: false, error: "User is already suspended" };
  }

  const suspendedUntil = new Date();
  suspendedUntil.setDate(suspendedUntil.getDate() + durationDays);

  // Update user status to suspended
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "SUSPENDED",
      suspendedUntil,
      suspensionReason: reason,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "SUSPEND_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Suspended @${user.username} for ${durationDays} days. Reason: ${reason}`,
        reason,
        durationDays,
        suspendedUntil: suspendedUntil.toISOString(),
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
 * Unsuspend user
 */
export async function unsuspendUser(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status !== "SUSPENDED") {
    return { success: false, error: "User is not suspended" };
  }

  // Update user status to active
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      suspendedUntil: null,
      suspensionReason: null,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "UNSUSPEND_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Unsuspended @${user.username}`,
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
 * Shadowban user
 */
export async function shadowbanUser(userId: string, reason: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status === "SHADOWBANNED") {
    return { success: false, error: "User is already shadowbanned" };
  }

  // Update user status to shadowbanned
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "SHADOWBANNED",
      suspensionReason: reason, // Store shadowban reason in same field
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "SHADOWBAN_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Shadowbanned @${user.username}. Reason: ${reason}`,
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
 * Remove shadowban from user
 */
export async function removeShadowban(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status !== "SHADOWBANNED") {
    return { success: false, error: "User is not shadowbanned" };
  }

  // Update user status to active
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      suspensionReason: null,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "REMOVE_SHADOWBAN",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Removed shadowban from @${user.username}`,
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
 * Soft delete user (reversible)
 */
export async function softDeleteUser(userId: string, reason: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status === "DELETED") {
    return { success: false, error: "User is already deleted" };
  }

  // Update user status to deleted
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "DELETED",
      suspensionReason: reason, // Store deletion reason
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "SOFT_DELETE_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Soft deleted @${user.username}. Reason: ${reason}`,
        reason,
        reversible: true,
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
 * Restore soft deleted user
 */
export async function restoreUser(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status !== "DELETED") {
    return { success: false, error: "User is not deleted" };
  }

  // Restore user status to active
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      suspensionReason: null,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null, // Admin is not a User, so actorId is null
      action: "RESTORE_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Restored deleted account @${user.username}`,
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
 * Force email re-verification
 */
export async function forceEmailVerification(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true, emailVerified: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (!user.emailVerified) {
    return { success: false, error: "Email is already not verified" };
  }

  // Clear email verification
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: null,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "FORCE_EMAIL_VERIFICATION",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Forced email re-verification for @${user.username}`,
        email: user.email,
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
 * Trigger password reset
 */
export async function triggerPasswordReset(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true, password: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (!user.password) {
    return { success: false, error: "User does not have a password (OAuth/magic link user)" };
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-12) + "!A1";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Update user password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "TRIGGER_PASSWORD_RESET",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Triggered password reset for @${user.username}`,
        tempPassword, // Store temporarily for admin to communicate to user
        adminUsername: admin.username,
        adminName: admin.name,
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true, tempPassword };
}

/**
 * Impersonate user (create admin session as user)
 */
export async function impersonateUser(userId: string) {
  const { admin } = await requireAdminAuth();

  // Get current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, status: true, role: true },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.status !== "ACTIVE") {
    return { success: false, error: "Cannot impersonate inactive user" };
  }

  if (user.role === "ADMIN") {
    return { success: false, error: "Cannot impersonate another admin" };
  }

  // Create impersonation session token
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour impersonation session

  // Create session in database
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  // Log the impersonation
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "IMPERSONATE_USER",
      targetType: "USER",
      targetId: userId,
      detail: {
        message: `Admin impersonating @${user.username}`,
        adminUsername: admin.username,
        adminName: admin.name,
        sessionToken: sessionToken.slice(0, 16) + "...", // Only log partial token
        expiresAt: expires.toISOString(),
      },
      ipAddress: null,
      userAgent: null,
    },
  });

  return { success: true, sessionToken };
}
