/*
  Warnings:

  - You are about to drop the column `userId` on the `ArtConfiguration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomParticipants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userClerkId,configId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userClerkId` to the `ArtConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userClerkId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerClerkId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ArtConfiguration" DROP CONSTRAINT "ArtConfiguration_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipants" DROP CONSTRAINT "_RoomParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipants" DROP CONSTRAINT "_RoomParticipants_B_fkey";

-- DropIndex
DROP INDEX "ArtConfiguration_userId_idx";

-- DropIndex
DROP INDEX "Like_userId_configId_key";

-- DropIndex
DROP INDEX "Like_userId_idx";

-- DropIndex
DROP INDEX "Room_ownerId_idx";

-- AlterTable
ALTER TABLE "ArtConfiguration" DROP COLUMN "userId",
ADD COLUMN     "userClerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "userId",
ADD COLUMN     "userClerkId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "ownerId",
ADD COLUMN     "ownerClerkId" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_RoomParticipants";

-- CreateIndex
CREATE INDEX "ArtConfiguration_userClerkId_idx" ON "ArtConfiguration"("userClerkId");

-- CreateIndex
CREATE INDEX "Like_userClerkId_idx" ON "Like"("userClerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userClerkId_configId_key" ON "Like"("userClerkId", "configId");

-- CreateIndex
CREATE INDEX "Room_ownerClerkId_idx" ON "Room"("ownerClerkId");
