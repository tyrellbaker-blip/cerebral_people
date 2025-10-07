"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "./notifications";

const reportSchema = z.object({
  subjectType: z.enum(["POST", "COMMENT", "USER", "RECOMMENDATION", "MESSAGE"]),
  subjectId: z.string().uuid(),
  reason: z.string().min(10).max(1000),
});

/**
 * Report content for moderation
 */
export async function reportContent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  const parsed = reportSchema.parse({
    subjectType: String(formData.get("subjectType") || ""),
    subjectId: String(formData.get("subjectId") || ""),
    reason: String(formData.get("reason") || ""),
  });

  // Check if user already reported this content
  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId: userId,
      subjectType: parsed.subjectType,
      subjectId: parsed.subjectId,
    },
  });

  if (existingReport) {
    throw new Error("You have already reported this content");
  }

  // Create the report
  await prisma.report.create({
    data: {
      reporterId: userId,
      subjectType: parsed.subjectType,
      subjectId: parsed.subjectId,
      reason: parsed.reason,
      status: "OPEN",
    },
  });

  // TODO: Notify moderators/admins about new report

  revalidatePath("/");
}

const moderationSchema = z.object({
  reportId: z.string().uuid(),
  action: z.enum(["HIDE", "WARN", "BAN", "DELETE"]),
  notes: z.string().max(1000).optional(),
});

/**
 * Take moderation action on a report
 * NOTE: This should be restricted to moderators/admins only
 * You'll need to add role-based permissions
 */
export async function moderateContent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  // TODO: Check if user is a moderator/admin
  // For now, we'll just proceed but you should add role checks

  const parsed = moderationSchema.parse({
    reportId: String(formData.get("reportId") || ""),
    action: String(formData.get("action") || ""),
    notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
  });

  // Verify report exists
  const report = await prisma.report.findUnique({
    where: { id: parsed.reportId },
    select: {
      id: true,
      subjectType: true,
      subjectId: true,
      status: true,
    },
  });

  if (!report) {
    throw new Error("Report not found");
  }

  // Create moderation action
  await prisma.moderationAction.create({
    data: {
      reportId: parsed.reportId,
      actorId: userId,
      action: parsed.action,
      notes: parsed.notes,
    },
  });

  // Update report status
  await prisma.report.update({
    where: { id: parsed.reportId },
    data: { status: "ACTIONED" },
  });

  // Apply the moderation action based on type
  switch (parsed.action) {
    case "HIDE":
      // Hide the content
      if (report.subjectType === "POST") {
        await prisma.post.update({
          where: { id: report.subjectId },
          data: { status: "HIDDEN" },
        });
      } else if (report.subjectType === "COMMENT") {
        await prisma.comment.update({
          where: { id: report.subjectId },
          data: { status: "HIDDEN" },
        });
      } else if (report.subjectType === "RECOMMENDATION") {
        await prisma.recommendation.update({
          where: { id: report.subjectId },
          data: { status: "HIDDEN" },
        });
      }
      break;

    case "DELETE":
      // Remove the content
      if (report.subjectType === "POST") {
        await prisma.post.update({
          where: { id: report.subjectId },
          data: { status: "REMOVED" },
        });
      } else if (report.subjectType === "COMMENT") {
        await prisma.comment.update({
          where: { id: report.subjectId },
          data: { status: "REMOVED" },
        });
      } else if (report.subjectType === "RECOMMENDATION") {
        await prisma.recommendation.update({
          where: { id: report.subjectId },
          data: { status: "REMOVED" },
        });
      }
      break;

    case "WARN":
    case "BAN":
      // TODO: Implement user warnings/bans
      // This would require adding fields to the User model
      break;
  }

  // TODO: Notify the reported user about the moderation action

  revalidatePath("/admin/reports");
}

/**
 * Dismiss a report without taking action
 * NOTE: Should be restricted to moderators/admins
 */
export async function dismissReport(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // TODO: Check if user is a moderator/admin

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/admin/reports");
}
