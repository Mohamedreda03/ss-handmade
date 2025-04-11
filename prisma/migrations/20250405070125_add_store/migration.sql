/*
  Warnings:

  - You are about to drop the column `user_phone` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `action` on the `History` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "History_action_idx";

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "user_phone",
ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "History" DROP COLUMN "action";

-- DropEnum
DROP TYPE "Actions";
