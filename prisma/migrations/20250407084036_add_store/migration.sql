-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "constructorId" TEXT;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_constructorId_fkey" FOREIGN KEY ("constructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
