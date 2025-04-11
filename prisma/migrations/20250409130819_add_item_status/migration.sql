-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "OrderItem_status_idx" ON "OrderItem"("status");
