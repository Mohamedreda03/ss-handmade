/*
  Warnings:

  - You are about to drop the column `owned_money` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "maxUses" INTEGER DEFAULT 1,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "owned_money";

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
