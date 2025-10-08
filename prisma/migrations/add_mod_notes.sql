-- Add mod notes table for admin internal notes on content
CREATE TABLE mod_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentType" TEXT NOT NULL,
  "contentId" UUID NOT NULL,
  note TEXT NOT NULL,
  "adminUsername" TEXT NOT NULL,
  "adminName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for efficient queries
CREATE INDEX "mod_notes_contentType_contentId_idx" ON mod_notes("contentType", "contentId");
CREATE INDEX "mod_notes_createdAt_idx" ON mod_notes("createdAt" DESC);
