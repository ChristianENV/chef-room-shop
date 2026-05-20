/*
  Warnings:

  - Made the column `token` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "token" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "order_claim_tokens" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "sentToEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB,

    CONSTRAINT "order_claim_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_claim_tokens_tokenHash_key" ON "order_claim_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "order_claim_tokens_orderId_idx" ON "order_claim_tokens"("orderId");

-- CreateIndex
CREATE INDEX "order_claim_tokens_expiresAt_idx" ON "order_claim_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "order_claim_tokens_sentToEmail_idx" ON "order_claim_tokens"("sentToEmail");

-- AddForeignKey
ALTER TABLE "order_claim_tokens" ADD CONSTRAINT "order_claim_tokens_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
