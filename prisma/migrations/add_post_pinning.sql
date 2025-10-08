-- Add pinning fields to posts table for admin moderation
ALTER TABLE posts
ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pinnedAt" TIMESTAMP(3),
ADD COLUMN "pinnedBy" TEXT;

-- Add index for pinned posts for efficient queries
CREATE INDEX "posts_isPinned_createdAt_idx" ON posts("isPinned", "createdAt" DESC);
