"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createComment } from "../actions/createComment";
import { deleteComment } from "../actions/deleteComment";
import { textareaBase } from "../components/cardStyles";

interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  parentId: string | null;
  author: {
    username: string | null;
    name: string | null;
    image: string | null;
    profile: {
      displayName: string | null;
    } | null;
  };
}

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  commentCount: number;
  currentUserId: string;
}

export default function CommentsSection({
  postId,
  comments,
  commentCount,
  currentUserId,
}: CommentsSectionProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("body", commentBody);

      await createComment(formData);
      setCommentBody("");
      setIsCommenting(false);
      router.refresh();
    } catch (error) {
      alert("Failed to post comment");
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("body", replyBody);
      formData.append("parentId", parentId);

      await createComment(formData);
      setReplyBody("");
      setReplyingTo(null);
      router.refresh();
    } catch (error) {
      alert("Failed to post reply");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment(commentId);
      router.refresh();
    } catch (error) {
      alert("Failed to delete comment");
    }
  };

  // Organize comments into threads (top-level and replies)
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => {
    const isOwnComment = comment.authorId === currentUserId;
    const replies = getReplies(comment.id);

    return (
      <div className={`${isReply ? "ml-12 mt-3" : "mt-4"}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author?.image ? (
              <Image
                src={comment.author.image}
                alt={comment.author?.profile?.displayName || "User"}
                width={isReply ? 32 : 40}
                height={isReply ? 32 : 40}
                className="rounded-full"
              />
            ) : (
              <div
                className={`${
                  isReply ? "w-8 h-8 text-sm" : "w-10 h-10"
                } rounded-full bg-brand-100 flex items-center justify-center`}
              >
                <span className="font-bold text-brand-700">
                  {(
                    comment.author?.profile?.displayName ||
                    comment.author?.username ||
                    "?"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-neutral-50 rounded-[0.75rem] p-3 border border-neutral-200/50">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-sm font-medium text-ink-900 truncate">
                  {comment.author?.profile?.displayName ||
                    comment.author?.username ||
                    "Anonymous"}
                </span>
                <span className="text-xs text-ink-500 flex-shrink-0">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-ink-900 leading-relaxed [text-wrap:pretty]">
                {comment.body}
              </p>
            </div>

            {/* Comment actions */}
            <div className="flex items-center gap-3 mt-2 ml-3">
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors motion-reduce:transition-none"
                  aria-label={`Reply to ${
                    comment.author?.profile?.displayName ||
                    comment.author?.username
                  }`}
                >
                  Reply
                </button>
              )}
              {isOwnComment && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-[#C44C4C] hover:text-[#A43838] font-medium transition-colors motion-reduce:transition-none"
                  aria-label="Delete comment"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <form
                onSubmit={(e) => handleReply(e, comment.id)}
                className="mt-3 ml-3 space-y-2"
              >
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  className={`${textareaBase} text-sm`}
                  rows={2}
                  required
                  autoFocus
                  aria-label="Reply text"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-[0.75rem] hover:bg-brand-600 transition-colors motion-reduce:transition-none font-medium"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyBody("");
                    }}
                    className="text-xs bg-neutral-200 text-ink-700 px-3 py-1.5 rounded-[0.75rem] hover:bg-neutral-300 transition-colors motion-reduce:transition-none font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Nested replies */}
            {replies.length > 0 && (
              <div className="mt-2">
                {replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div data-comments-section>
      {/* Comments header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-ink-900 hover:text-brand-600 transition-colors motion-reduce:transition-none"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Hide" : "Show"} ${commentCount} ${
          commentCount === 1 ? "comment" : "comments"
        }`}
        data-comments-toggle
      >

        <svg
          className={`w-4 h-4 transition-transform motion-reduce:transition-none ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>
          {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
        </span>
      </button>

      {/* Expanded comments */}
      {isExpanded && (
        <div className="mt-4">
          {/* Add comment button */}
          {!isCommenting && (
            <button
              onClick={() => setIsCommenting(true)}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium mb-4 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors motion-reduce:transition-none"
              aria-label="Add a comment"
              data-add-comment-button
            >
              + Add a comment
            </button>
          )}

          {/* New comment form */}
          {isCommenting && (
            <form onSubmit={handleComment} className="mb-4 space-y-2">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                className={`${textareaBase} text-sm`}
                rows={3}
                required
                autoFocus
                aria-label="Comment text"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-sm bg-brand-500 text-white px-4 py-2 rounded-[0.75rem] hover:bg-brand-600 font-medium transition-colors motion-reduce:transition-none"
                >
                  Comment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCommenting(false);
                    setCommentBody("");
                  }}
                  className="text-sm bg-neutral-200 text-ink-700 px-4 py-2 rounded-[0.75rem] hover:bg-neutral-300 font-medium transition-colors motion-reduce:transition-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Comments list */}
          {topLevelComments.length > 0 ? (
            <div>
              {topLevelComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500 text-center py-6 italic">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
