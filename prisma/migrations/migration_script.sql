-- Drop tables that are no longer needed
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Room";
DROP TABLE IF EXISTS "Post";

-- Modify the User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkId";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileImageUrl" TEXT;

-- Modify the ArtConfiguration table
ALTER TABLE "ArtConfiguration" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "ArtConfiguration" ADD COLUMN IF NOT EXISTS "baseFrequency" DOUBLE PRECISION;
ALTER TABLE "ArtConfiguration" ADD COLUMN IF NOT EXISTS "harmonicRatio" DOUBLE PRECISION;
ALTER TABLE "ArtConfiguration" ADD COLUMN IF NOT EXISTS "mode" TEXT;
ALTER TABLE "ArtConfiguration" ADD COLUMN IF NOT EXISTS "colorScheme" TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "ArtConfiguration_isPublic_idx" ON "ArtConfiguration"("isPublic");
CREATE INDEX IF NOT EXISTS "ArtConfiguration_createdAt_idx" ON "ArtConfiguration"("createdAt");

-- Update foreign key constraints to cascade delete
ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "Like_userId_fkey";
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "Like" DROP CONSTRAINT IF EXISTS "Like_configId_fkey";
ALTER TABLE "Like" ADD CONSTRAINT "Like_configId_fkey" 
    FOREIGN KEY ("configId") REFERENCES "ArtConfiguration"("id") ON DELETE CASCADE;

ALTER TABLE "ArtConfiguration" DROP CONSTRAINT IF EXISTS "ArtConfiguration_userId_fkey";
ALTER TABLE "ArtConfiguration" ADD CONSTRAINT "ArtConfiguration_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE; 