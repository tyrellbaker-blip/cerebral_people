import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

/**
 * Get the current admin from session
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  // Find valid session
  const session = await prisma.adminSession.findUnique({
    where: { token: sessionToken },
    include: {
      admin: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          isActive: true,
          isSuperAdmin: true,
        },
      },
    },
  });

  // Check if session exists, is valid, and admin is active
  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    // Clean up invalid session
    if (session) {
      await prisma.adminSession.delete({
        where: { id: session.id },
      });
    }
    return null;
  }

  return {
    sessionId: session.id,
    admin: session.admin,
  };
}

/**
 * Require admin authentication - redirect to login if not authenticated
 */
export async function requireAdminAuth() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin-login");
  }

  return session;
}

/**
 * Login admin and create session
 */
export async function loginAdmin(
  username: string,
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ success: true; admin: any } | { success: false; error: string }> {
  try {
    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check if admin is active
    if (!admin.isActive) {
      return { success: false, error: "Account is disabled" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Create session
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return {
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        isSuperAdmin: admin.isSuperAdmin,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

/**
 * Logout admin and destroy session
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionToken) {
    // Delete session from database
    await prisma.adminSession.deleteMany({
      where: { token: sessionToken },
    });

    // Clear cookie
    cookieStore.delete(ADMIN_SESSION_COOKIE);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  await prisma.adminSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

/**
 * Get admin stats for dashboard
 */
export async function getAdminStats() {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalPosts,
    totalComments,
    openReports,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.post.count({ where: { status: "ACTIVE" } }),
    prisma.comment.count({ where: { status: "ACTIVE" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.profile.count({
      where: {
        profileType: { in: ["DOCTOR", "PT"] },
        isVerified: false,
      },
    }),
  ]);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const dailyActiveUsers = await prisma.user.count({
    where: {
      lastLoginAt: {
        gte: oneDayAgo,
      },
    },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newSignups = await prisma.user.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    dailyActiveUsers,
    newSignups,
    totalPosts,
    totalComments,
    openReports,
    pendingVerifications,
  };
}

/**
 * Log an admin action to audit trail
 */
export async function logAdminAction(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      detail: params.detail,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
