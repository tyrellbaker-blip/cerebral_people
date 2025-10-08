-- Create verification requests table for doctor/PT credential submissions
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('MD', 'DO', 'PA', 'PT')),
  npi TEXT,
  "licenseNumber" TEXT NOT NULL,
  "licenseState" TEXT NOT NULL,
  "evidenceFileUrl" TEXT,
  "evidenceFileName" TEXT,
  "websiteUrl" TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MORE_INFO_NEEDED')) DEFAULT 'PENDING',
  notes TEXT,
  "adminNotes" TEXT,
  source JSONB,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for efficient queries
CREATE INDEX "verification_requests_userId_idx" ON verification_requests("userId");
CREATE INDEX "verification_requests_status_idx" ON verification_requests(status);
CREATE INDEX "verification_requests_createdAt_idx" ON verification_requests("createdAt" DESC);
CREATE INDEX "verification_requests_role_idx" ON verification_requests(role);
