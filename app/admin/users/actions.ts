"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get users with pagination and filters
 */
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  profileType?: string;
}) {
  await requireAdminAuth();

  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search by username, email, or name
  if (params.search && params.search.trim()) {
    where.OR = [
      { username: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
      { name: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Filter by status
  if (params.status && params.status !== "ALL") {
    where.status = params.status;
  }

  // Filter by role
  if (params.role && params.role !== "ALL") {
    where.role = params.role;
  }

  // Filter by profile type
  if (params.profileType && params.profileType !== "ALL") {
    where.profile = {
      profileType: params.profileType,
    };
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedUntil: true,
        suspensionReason: true,
        profile: {
          select: {
            profileType: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

// More actions will be added here as we implement each feature
