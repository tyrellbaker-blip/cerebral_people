import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Check if the current user has admin or moderator role
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    console.log("❌ No session found, redirecting to admin login");
    redirect("/admin-login");
  }

  console.log("✅ Session found for user:", session.user.id);

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { role: true, status: true },
    });
    console.log("✅ User fetched:", user);
  } catch (error) {
    console.error("❌ Database error fetching user:", error);
    redirect("/feed");
  }

  if (!user || user.status !== "ACTIVE") {
    console.log("❌ User not found or not active, redirecting to feed");
    redirect("/feed");
  }

  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    console.log("❌ User role is:", user.role, "- not admin/moderator, redirecting to feed");
    redirect("/feed");
  }

  console.log("✅ Admin access granted for role:", user.role);
  return {
    userId: session.user.id as string,
    role: user.role,
  };
}

/**
 * Check if user is strictly an admin (not just moderator)
 */
export async function requireStrictAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE" || user.role !== "ADMIN") {
    redirect("/feed");
  }

  return {
    userId: session.user.id as string,
    role: user.role,
  };
}

/**
 * Check user role without redirecting
 */
export async function getUserRole(): Promise<UserRole | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { role: true },
  });

  return user?.role || null;
}

/**
 * Check if current user is admin/moderator
 */
export async function isAdminOrModerator(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN" || role === "MODERATOR";
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

/**
 * Get statistics for admin dashboard
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

  // Get daily active users (last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const dailyActiveUsers = await prisma.user.count({
    where: {
      lastLoginAt: {
        gte: oneDayAgo,
      },
    },
  });

  // Get new signups (last 7 days)
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
