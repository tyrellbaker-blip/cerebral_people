-- Add firstName and lastName to users table
ALTER TABLE users
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;
