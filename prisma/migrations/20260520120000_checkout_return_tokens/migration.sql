-- CreateTable
CREATE TABLE "checkout_return_tokens" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkout_return_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_return_tokens_orderId_key" ON "checkout_return_tokens"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "checkout_return_tokens_tokenHash_key" ON "checkout_return_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "checkout_return_tokens_expiresAt_idx" ON "checkout_return_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "checkout_return_tokens" ADD CONSTRAINT "checkout_return_tokens_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
