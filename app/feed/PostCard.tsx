"use client";

import { useState } from "react";
import { deletePost } from "../actions/deletePost";
import { updatePost } from "../actions/updatePost";

interface PostCardProps {
  post: {
    id: string;
    createdAt: Date;
    body: string;
    visibility: string;
    authorId: string;
    author: {
      username: string | null;
      name: string | null;
      profile: {
        displayName: string | null;
      } | null;
    };
  };
  currentUserId: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(post.body);
  const [editVisibility, setEditVisibility] = useState(post.visibility);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnPost = post.authorId === currentUserId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(post.id);
    } catch (error) {
      alert("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePost(post.id, editBody, editVisibility);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setEditBody(post.body);
    setEditVisibility(post.visibility);
    setIsEditing(false);
  };

  return (
    <article className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-sm text-amber-600">
            {new Date(post.createdAt).toLocaleString()}
          </div>
          <div className="font-medium text-amber-900 mt-1">
            {post.author?.profile?.displayName ||
              post.author?.username ||
              post.author?.name ||
              "Anonymous"}
          </div>
        </div>

        {isOwnPost && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-amber-600 hover:text-amber-700 px-2 py-1"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-700 px-2 py-1 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate} className="mt-3 space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full rounded-lg border border-amber-200 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            required
          />
          <div className="flex items-center gap-3">
            <select
              value={editVisibility}
              onChange={(e) => setEditVisibility(e.target.value)}
              className="rounded-lg border border-amber-200 px-3 py-2 text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PUBLIC">Public</option>
              <option value="FOLLOWERS">Followers</option>
              <option value="PRIVATE">Private</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-lg bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-3 text-amber-800">{post.body}</p>
          <div className="text-xs mt-3 text-amber-600">
            visibility: {post.visibility}
          </div>
        </>
      )}
    </article>
  );
}