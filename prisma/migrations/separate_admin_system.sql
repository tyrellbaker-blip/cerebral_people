-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Separate Admin System
-- Description: Creates a completely separate authentication system for admins,
--              independent from user accounts
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- 1. Create admins table
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- bcrypt hashed
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE,
  "lastLoginIp" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 2. Create admin_sessions table
-- ───────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "adminId" UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ───────────────────────────────────────────────────────────────────────────────
-- 3. Create indexes for performance
-- ───────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_isActive ON admins("isActive");
CREATE INDEX IF NOT EXISTS idx_admin_sessions_adminId ON admin_sessions("adminId");
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiresAt ON admin_sessions("expiresAt");

-- ───────────────────────────────────────────────────────────────────────────────
-- 4. Insert default super admin account
-- ───────────────────────────────────────────────────────────────────────────────
-- Username: admin
-- Password: admin123 (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!)
-- The password hash will be inserted in the next step after bcrypt generation

-- This placeholder will be replaced with actual hash
INSERT INTO admins (username, password, email, name, "isSuperAdmin")
VALUES (
  'admin',
  'BCRYPT_HASH_PLACEHOLDER',
  'admin@cerebralpeople.local',
  'System Administrator',
  true
) ON CONFLICT (username) DO NOTHING;

-- ───────────────────────────────────────────────────────────────────────────────
-- 5. Cleanup script (optional - run manually to clean expired sessions)
-- ───────────────────────────────────────────────────────────────────────────────
-- DELETE FROM admin_sessions WHERE "expiresAt" < CURRENT_TIMESTAMP;

-- ═══════════════════════════════════════════════════════════════════════════════
-- End of Migration
-- ═══════════════════════════════════════════════════════════════════════════════
