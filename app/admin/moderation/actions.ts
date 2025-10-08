"use server";

import { requireAdminAuth } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * Get content dashboard with recent posts and comments
 */
export async function getContentDashboard(params: {
  contentType?: "posts" | "comments" | "all";
  status?: string;
  authorId?: string;
  search?: string;
  timeframe?: "24h" | "7d" | "30d" | "all";
  limit?: number;
}) {
  await requireAdminAuth();

  const {
    contentType = "all",
    status,
    authorId,
    search,
    timeframe = "24h",
    limit = 50,
  } = params;

  // Calculate date filter based on timeframe
  let createdAfter: Date | undefined;
  const now = new Date();
  switch (timeframe) {
    case "24h":
      createdAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      createdAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      createdAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      createdAfter = undefined;
  }

  // Build where clause for posts
  const postsWhere: any = {};
  if (status && status !== "ALL") {
    postsWhere.status = status;
  }
  if (authorId) {
    postsWhere.authorId = authorId;
  }
  if (search && search.trim()) {
    postsWhere.body = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (createdAfter) {
    postsWhere.createdAt = {
      gte: createdAfter,
    };
  }

  // Build where clause for comments
  const commentsWhere: any = {};
  if (status && status !== "ALL") {
    commentsWhere.status = status;
  }
  if (authorId) {
    commentsWhere.authorId = authorId;
  }
  if (search && search.trim()) {
    commentsWhere.body = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (createdAfter) {
    commentsWhere.createdAt = {
      gte: createdAfter,
    };
  }

  // Fetch data based on content type
  let posts: any[] = [];
  let comments: any[] = [];

  if (contentType === "posts" || contentType === "all") {
    posts = await prisma.post.findMany({
      where: postsWhere,
      select: {
        id: true,
        body: true,
        images: true,
        status: true,
        postType: true,
        energyLevel: true,
        isPinned: true,
        pinnedAt: true,
        pinnedBy: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: contentType === "all" ? Math.floor(limit / 2) : limit,
    });

    // Fetch mod notes for posts
    const postIds = posts.map((p) => p.id);
    const postNotes = await prisma.modNote.findMany({
      where: {
        contentType: "POST",
        contentId: { in: postIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group notes by post ID
    const notesByPostId = postNotes.reduce((acc: any, note: any) => {
      if (!acc[note.contentId]) acc[note.contentId] = [];
      acc[note.contentId].push(note);
      return acc;
    }, {});

    // Add notes to posts
    posts = posts.map((post: any) => ({
      ...post,
      modNotes: notesByPostId[post.id] || [],
    }));
  }

  if (contentType === "comments" || contentType === "all") {
    comments = await prisma.comment.findMany({
      where: commentsWhere,
      select: {
        id: true,
        body: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            status: true,
          },
        },
        post: {
          select: {
            id: true,
            body: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: contentType === "all" ? Math.floor(limit / 2) : limit,
    });

    // Fetch mod notes for comments
    const commentIds = comments.map((c) => c.id);
    const commentNotes = await prisma.modNote.findMany({
      where: {
        contentType: "COMMENT",
        contentId: { in: commentIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group notes by comment ID
    const notesByCommentId = commentNotes.reduce((acc: any, note: any) => {
      if (!acc[note.contentId]) acc[note.contentId] = [];
      acc[note.contentId].push(note);
      return acc;
    }, {});

    // Add notes to comments
    comments = comments.map((comment: any) => ({
      ...comment,
      modNotes: notesByCommentId[comment.id] || [],
    }));
  }

  return { posts, comments };
}

/**
 * Get reports queue
 */
export async function getReportsQueue(params: {
  status?: string;
  subjectType?: string;
  limit?: number;
}) {
  await requireAdminAuth();

  const { status = "OPEN", subjectType, limit = 50 } = params;

  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (subjectType && subjectType !== "ALL") {
    where.subjectType = subjectType;
  }

  const reports = await prisma.report.findMany({
    where,
    select: {
      id: true,
      subjectType: true,
      subjectId: true,
      reason: true,
      status: true,
      createdAt: true,
      reporter: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      post: {
        select: {
          id: true,
          body: true,
          author: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
      comment: {
        select: {
          id: true,
          body: true,
          author: {
            select: {
              username: true,
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          moderationActions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reports;
}

/**
 * Remove content (hide or delete)
 */
export async function removeContent(
  contentId: string,
  contentType: "POST" | "COMMENT",
  reason: string,
  action: "HIDE" | "REMOVE" = "HIDE"
) {
  const { admin } = await requireAdminAuth();

  const newStatus = action === "HIDE" ? "HIDDEN" : "REMOVED";

  if (contentType === "POST") {
    await prisma.post.update({
      where: { id: contentId },
      data: { status: newStatus },
    });
  } else {
    await prisma.comment.update({
      where: { id: contentId },
      data: { status: newStatus },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: `${action}_${contentType}`,
      targetType: contentType,
      targetId: contentId,
      detail: {
        message: `${action === "HIDE" ? "Hid" : "Removed"} ${contentType.toLowerCase()}: ${reason}`,
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
 * Restore content
 */
export async function restoreContent(
  contentId: string,
  contentType: "POST" | "COMMENT"
) {
  const { admin } = await requireAdminAuth();

  if (contentType === "POST") {
    await prisma.post.update({
      where: { id: contentId },
      data: { status: "ACTIVE" },
    });
  } else {
    await prisma.comment.update({
      where: { id: contentId },
      data: { status: "ACTIVE" },
    });
  }

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: `RESTORE_${contentType}`,
      targetType: contentType,
      targetId: contentId,
      detail: {
        message: `Restored ${contentType.toLowerCase()}`,
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
 * Dismiss a report
 */
export async function dismissReport(reportId: string, reason: string) {
  const { admin } = await requireAdminAuth();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { subjectType: true, subjectId: true },
  });

  if (!report) {
    return { success: false, error: "Report not found" };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "DISMISSED" },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "DISMISS_REPORT",
      targetType: "REPORT",
      targetId: reportId,
      detail: {
        message: `Dismissed report for ${report.subjectType}. Reason: ${reason}`,
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
 * Action a report (mark as actioned)
 */
export async function actionReport(
  reportId: string,
  action: "HIDE" | "WARN" | "BAN" | "DELETE",
  notes?: string
) {
  const { admin } = await requireAdminAuth();

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { subjectType: true, subjectId: true },
  });

  if (!report) {
    return { success: false, error: "Report not found" };
  }

  // Update report status
  await prisma.report.update({
    where: { id: reportId },
    data: { status: "ACTIONED" },
  });

  // Create moderation action (this would need the actorId to be a User, not Admin)
  // For now, we'll just log it in the audit log
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "ACTION_REPORT",
      targetType: "REPORT",
      targetId: reportId,
      detail: {
        message: `Actioned report for ${report.subjectType} with ${action}${notes ? `. Notes: ${notes}` : ""}`,
        action,
        notes,
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
 * Pin a post
 */
export async function pinPost(postId: string) {
  const { admin } = await requireAdminAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { body: true, isPinned: true },
  });

  if (!post) {
    return { success: false, error: "Post not found" };
  }

  if (post.isPinned) {
    return { success: false, error: "Post is already pinned" };
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      isPinned: true,
      pinnedAt: new Date(),
      pinnedBy: admin.username,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "PIN_POST",
      targetType: "POST",
      targetId: postId,
      detail: {
        message: `Pinned post`,
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
 * Unpin a post
 */
export async function unpinPost(postId: string) {
  const { admin } = await requireAdminAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { isPinned: true },
  });

  if (!post) {
    return { success: false, error: "Post not found" };
  }

  if (!post.isPinned) {
    return { success: false, error: "Post is not pinned" };
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: "UNPIN_POST",
      targetType: "POST",
      targetId: postId,
      detail: {
        message: `Unpinned post`,
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
 * Add a mod note to content
 */
export async function addModNote(
  contentId: string,
  contentType: "POST" | "COMMENT",
  note: string
) {
  const { admin } = await requireAdminAuth();

  await prisma.modNote.create({
    data: {
      contentId,
      contentType,
      note,
      adminUsername: admin.username,
      adminName: admin.name,
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: `ADD_MOD_NOTE_${contentType}`,
      targetType: contentType,
      targetId: contentId,
      detail: {
        message: `Added mod note to ${contentType.toLowerCase()}`,
        note,
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
 * Get mod notes for content
 */
export async function getModNotes(contentId: string, contentType: "POST" | "COMMENT") {
  await requireAdminAuth();

  const notes = await prisma.modNote.findMany({
    where: {
      contentId,
      contentType,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
}
