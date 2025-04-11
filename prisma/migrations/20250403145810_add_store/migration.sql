-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('HANDMADE', 'EQUIPMENT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'HANDMADE',
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
