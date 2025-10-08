"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeContent, restoreContent, pinPost, unpinPost } from "./actions";
import AdminBadge from "../components/AdminBadge";
import ModNotes from "./ModNotes";

interface ModNote {
  id: string;
  note: string;
  adminUsername: string;
  adminName: string | null;
  createdAt: Date;
}

interface Post {
  id: string;
  body: string;
  images: string[];
  status: string;
  postType: string;
  energyLevel: number | null;
  isPinned: boolean;
  pinnedAt: Date | null;
  pinnedBy: string | null;
  createdAt: Date;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    status: string;
  };
  _count: {
    comments: number;
    reactions: number;
    reports: number;
  };
  modNotes: ModNote[];
}

interface Comment {
  id: string;
  body: string;
  status: string;
  createdAt: Date;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    status: string;
  };
  post: {
    id: string;
    body: string;
  };
  _count: {
    reactions: number;
    reports: number;
  };
  modNotes: ModNote[];
}

interface ContentDashboardProps {
  posts: Post[];
  comments: Comment[];
}

export default function ContentDashboard({
  posts,
  comments,
}: ContentDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleRemoveContent = async (
    id: string,
    type: "POST" | "COMMENT",
    action: "HIDE" | "REMOVE"
  ) => {
    const reason = prompt(`Enter reason for ${action === "HIDE" ? "hiding" : "removing"} this ${type.toLowerCase()}:`);
    if (!reason) return;

    setActioningId(id);
    startTransition(async () => {
      await removeContent(id, type, reason, action);
      router.refresh();
      setActioningId(null);
    });
  };

  const handleRestoreContent = async (id: string, type: "POST" | "COMMENT") => {
    if (!confirm(`Are you sure you want to restore this ${type.toLowerCase()}?`)) return;

    setActioningId(id);
    startTransition(async () => {
      await restoreContent(id, type);
      router.refresh();
      setActioningId(null);
    });
  };

  const handlePinPost = async (postId: string) => {
    if (!confirm("Pin this post? It will appear at the top of feeds.")) return;

    setActioningId(postId);
    startTransition(async () => {
      const result = await pinPost(postId);
      if (result.error) {
        alert(result.error);
      }
      router.refresh();
      setActioningId(null);
    });
  };

  const handleUnpinPost = async (postId: string) => {
    if (!confirm("Unpin this post?")) return;

    setActioningId(postId);
    startTransition(async () => {
      const result = await unpinPost(postId);
      if (result.error) {
        alert(result.error);
      }
      router.refresh();
      setActioningId(null);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "HIDDEN":
        return "warning";
      case "REMOVED":
        return "danger";
      default:
        return "default";
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "SUSPENDED":
        return "danger";
      case "SHADOWBANNED":
        return "warning";
      case "DELETED":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <h2 className="text-lg font-semibold text-ink-900">
              Posts ({posts.length})
            </h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        href={`/admin/users/${post.author.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        @{post.author.username || "no-username"}
                      </Link>
                      <AdminBadge variant={getUserStatusColor(post.author.status) as any}>
                        {post.author.status}
                      </AdminBadge>
                      <span className="text-xs text-ink-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div className="text-sm text-ink-900 mb-3">
                      {post.body.slice(0, 200)}
                      {post.body.length > 200 && "..."}
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center gap-4 text-xs text-ink-500">
                      <span>Type: {post.postType}</span>
                      {post.energyLevel && <span>Energy: {post.energyLevel}/4</span>}
                      <span>{post._count.comments} comments</span>
                      <span>{post._count.reactions} reactions</span>
                      {post._count.reports > 0 && (
                        <span className="text-red-600 font-medium">
                          ⚠ {post._count.reports} reports
                        </span>
                      )}
                    </div>

                    {/* Mod Notes */}
                    <ModNotes
                      contentId={post.id}
                      contentType="POST"
                      notes={post.modNotes}
                    />
                  </div>

                  {/* Status and Actions */}
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <AdminBadge variant={getStatusColor(post.status) as any}>
                        {post.status}
                      </AdminBadge>
                      {post.isPinned && (
                        <AdminBadge variant="info">
                          📌 PINNED
                        </AdminBadge>
                      )}
                    </div>

                    {/* Content Actions */}
                    <div className="flex gap-2">
                      {post.status === "ACTIVE" ? (
                        <>
                          <button
                            onClick={() => handleRemoveContent(post.id, "POST", "HIDE")}
                            disabled={isPending && actioningId === post.id}
                            className="px-3 py-1 text-xs border border-amber-300 rounded text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() => handleRemoveContent(post.id, "POST", "REMOVE")}
                            disabled={isPending && actioningId === post.id}
                            className="px-3 py-1 text-xs border border-red-300 rounded text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreContent(post.id, "POST")}
                          disabled={isPending && actioningId === post.id}
                          className="px-3 py-1 text-xs border border-green-300 rounded text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>

                    {/* Pin/Unpin Actions */}
                    <div className="flex gap-2">
                      {post.isPinned ? (
                        <button
                          onClick={() => handleUnpinPost(post.id)}
                          disabled={isPending && actioningId === post.id}
                          className="px-3 py-1 text-xs border border-blue-300 rounded text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                        >
                          📌 Unpin
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePinPost(post.id)}
                          disabled={isPending && actioningId === post.id}
                          className="px-3 py-1 text-xs border border-blue-300 rounded text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                        >
                          📌 Pin Post
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {comments.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <h2 className="text-lg font-semibold text-ink-900">
              Comments ({comments.length})
            </h2>
          </div>
          <div className="divide-y divide-neutral-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        href={`/admin/users/${comment.author.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        @{comment.author.username || "no-username"}
                      </Link>
                      <AdminBadge variant={getUserStatusColor(comment.author.status) as any}>
                        {comment.author.status}
                      </AdminBadge>
                      <span className="text-xs text-ink-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <div className="text-sm text-ink-900 mb-3">{comment.body}</div>

                    {/* On Post */}
                    <div className="text-xs text-ink-500 bg-neutral-50 rounded p-2">
                      On post: {comment.post.body.slice(0, 80)}...
                    </div>

                    {/* Comment Meta */}
                    <div className="flex items-center gap-4 text-xs text-ink-500 mt-2">
                      <span>{comment._count.reactions} reactions</span>
                      {comment._count.reports > 0 && (
                        <span className="text-red-600 font-medium">
                          ⚠ {comment._count.reports} reports
                        </span>
                      )}
                    </div>

                    {/* Mod Notes */}
                    <ModNotes
                      contentId={comment.id}
                      contentType="COMMENT"
                      notes={comment.modNotes}
                    />
                  </div>

                  {/* Status and Actions */}
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <AdminBadge variant={getStatusColor(comment.status) as any}>
                      {comment.status}
                    </AdminBadge>

                    <div className="flex gap-2">
                      {comment.status === "ACTIVE" ? (
                        <>
                          <button
                            onClick={() =>
                              handleRemoveContent(comment.id, "COMMENT", "HIDE")
                            }
                            disabled={isPending && actioningId === comment.id}
                            className="px-3 py-1 text-xs border border-amber-300 rounded text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                          >
                            Hide
                          </button>
                          <button
                            onClick={() =>
                              handleRemoveContent(comment.id, "COMMENT", "REMOVE")
                            }
                            disabled={isPending && actioningId === comment.id}
                            className="px-3 py-1 text-xs border border-red-300 rounded text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreContent(comment.id, "COMMENT")}
                          disabled={isPending && actioningId === comment.id}
                          className="px-3 py-1 text-xs border border-green-300 rounded text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && comments.length === 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <p className="text-ink-500">No content found with the current filters</p>
        </div>
      )}
    </div>
  );
}
