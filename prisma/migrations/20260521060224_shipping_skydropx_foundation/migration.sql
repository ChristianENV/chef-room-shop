-- CreateEnum
CREATE TYPE "ShippingProvider" AS ENUM ('SKYDROPX');

-- CreateTable
CREATE TABLE "shipping_quotes" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "guestSessionId" UUID,
    "cartId" UUID,
    "orderId" UUID,
    "provider" "ShippingProvider" NOT NULL DEFAULT 'SKYDROPX',
    "providerQuoteId" TEXT,
    "originPostalCode" TEXT NOT NULL,
    "destinationPostalCode" TEXT NOT NULL,
    "packageJson" JSONB NOT NULL,
    "rawRequestJson" JSONB,
    "rawResponseJson" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "providerRateId" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "service" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "estimatedDays" INTEGER,
    "estimatedDeliveryDate" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rawJson" JSONB,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_webhook_events" (
    "id" UUID NOT NULL,
    "provider" "ShippingProvider" NOT NULL DEFAULT 'SKYDROPX',
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerShipmentId" TEXT,
    "shipmentId" UUID,
    "orderId" UUID,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    "rawPayloadJson" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_quotes_userId_idx" ON "shipping_quotes"("userId");

-- CreateIndex
CREATE INDEX "shipping_quotes_guestSessionId_idx" ON "shipping_quotes"("guestSessionId");

-- CreateIndex
CREATE INDEX "shipping_quotes_cartId_idx" ON "shipping_quotes"("cartId");

-- CreateIndex
CREATE INDEX "shipping_quotes_orderId_idx" ON "shipping_quotes"("orderId");

-- CreateIndex
CREATE INDEX "shipping_quotes_providerQuoteId_idx" ON "shipping_quotes"("providerQuoteId");

-- CreateIndex
CREATE INDEX "shipping_rates_quoteId_idx" ON "shipping_rates"("quoteId");

-- CreateIndex
CREATE INDEX "shipping_rates_providerRateId_idx" ON "shipping_rates"("providerRateId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_webhook_events_eventId_key" ON "shipping_webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_provider_idx" ON "shipping_webhook_events"("provider");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_eventType_idx" ON "shipping_webhook_events"("eventType");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_processedAt_idx" ON "shipping_webhook_events"("processedAt");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_shipmentId_idx" ON "shipping_webhook_events"("shipmentId");

-- CreateIndex
CREATE INDEX "shipping_webhook_events_orderId_idx" ON "shipping_webhook_events"("orderId");

-- AddForeignKey
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_guestSessionId_fkey" FOREIGN KEY ("guestSessionId") REFERENCES "guest_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "shipping_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
