-- Admin System Migration
-- Run this SQL in Supabase SQL Editor

-- Add new enums
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');
CREATE TYPE "ProfileType" AS ENUM ('NORMAL', 'DOCTOR', 'PT', 'PARENT');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'SHADOWBANNED', 'DELETED');

-- Add admin fields to users table
ALTER TABLE users
ADD COLUMN role "UserRole" DEFAULT 'MEMBER' NOT NULL,
ADD COLUMN status "UserStatus" DEFAULT 'ACTIVE' NOT NULL,
ADD COLUMN "suspendedUntil" TIMESTAMP,
ADD COLUMN "suspensionReason" TEXT;

-- Add profile type and verification to profiles table
ALTER TABLE profiles
ADD COLUMN "profileType" "ProfileType" DEFAULT 'NORMAL' NOT NULL,
ADD COLUMN "isVerified" BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN "verifiedAt" TIMESTAMP,
ADD COLUMN credentials TEXT;

-- Enhance audit_logs table
ALTER TABLE audit_logs
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "userAgent" TEXT;

CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs("createdAt" DESC);

-- Create content_filters table
CREATE TABLE content_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  type TEXT NOT NULL, -- 'keyword', 'link', 'regex'
  action TEXT NOT NULL, -- 'flag', 'auto-remove', 'shadowban'
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  reason TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_content_filters_type_active ON content_filters(type, "isActive");

-- Create system_announcements table
CREATE TABLE system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'info', 'warning', 'maintenance'
  "targetRole" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "startsAt" TIMESTAMP,
  "endsAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_system_announcements_active ON system_announcements("isActive", "startsAt", "endsAt");

-- Create feature_flags table
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  "isEnabled" BOOLEAN DEFAULT FALSE NOT NULL,
  description TEXT,
  config JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create data_export_requests table
CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  format TEXT NOT NULL, -- 'json', 'csv'
  "downloadUrl" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completedAt" TIMESTAMP
);

CREATE INDEX idx_data_export_requests_user_status ON data_export_requests("userId", status);

-- Insert some default feature flags
INSERT INTO feature_flags (key, "isEnabled", description) VALUES
('beta_voice_posts', false, 'Enable voice post recording'),
('beta_video_posts', false, 'Enable video post uploads'),
('enhanced_accessibility', true, 'Enhanced accessibility features'),
('community_events', false, 'Community events feature');

COMMENT ON TABLE content_filters IS 'Keyword and pattern filters for auto-moderation';
COMMENT ON TABLE system_announcements IS 'System-wide announcements and banners';
COMMENT ON TABLE feature_flags IS 'Feature flag configuration for A/B testing and gradual rollouts';
COMMENT ON TABLE data_export_requests IS 'User data export requests for GDPR compliance';
