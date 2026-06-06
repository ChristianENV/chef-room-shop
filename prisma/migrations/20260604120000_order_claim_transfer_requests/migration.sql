-- CreateEnum
CREATE TYPE "OrderClaimTransferRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "order_claim_transfer_requests" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "requestedByUserId" UUID NOT NULL,
    "requestedByEmail" TEXT NOT NULL,
    "orderEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "status" "OrderClaimTransferRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_claim_transfer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_claim_transfer_requests_tokenHash_key" ON "order_claim_transfer_requests"("tokenHash");

-- CreateIndex
CREATE INDEX "order_claim_transfer_requests_orderId_idx" ON "order_claim_transfer_requests"("orderId");

-- CreateIndex
CREATE INDEX "order_claim_transfer_requests_requestedByUserId_idx" ON "order_claim_transfer_requests"("requestedByUserId");

-- CreateIndex
CREATE INDEX "order_claim_transfer_requests_status_idx" ON "order_claim_transfer_requests"("status");

-- CreateIndex
CREATE INDEX "order_claim_transfer_requests_expiresAt_idx" ON "order_claim_transfer_requests"("expiresAt");

-- AddForeignKey
ALTER TABLE "order_claim_transfer_requests" ADD CONSTRAINT "order_claim_transfer_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_claim_transfer_requests" ADD CONSTRAINT "order_claim_transfer_requests_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
