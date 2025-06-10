/*
  Warnings:

  - You are about to drop the column `upload_id` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "upload_id";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "CenterOrOnline";

-- DropEnum
DROP TYPE "Gender";
