-- CreateTable
CREATE TABLE "SellerEarning" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerEarning_orderItemId_key" ON "SellerEarning"("orderItemId");

-- CreateIndex
CREATE INDEX "SellerEarning_sellerId_idx" ON "SellerEarning"("sellerId");

-- CreateIndex
CREATE INDEX "SellerEarning_orderId_idx" ON "SellerEarning"("orderId");

-- CreateIndex
CREATE INDEX "SellerEarning_isPaid_idx" ON "SellerEarning"("isPaid");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "SellerEarning" ADD CONSTRAINT "SellerEarning_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEarning" ADD CONSTRAINT "SellerEarning_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerEarning" ADD CONSTRAINT "SellerEarning_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
