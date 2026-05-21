-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "costCents" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "labelFormat" TEXT,
ADD COLUMN     "labelUrl" TEXT,
ADD COLUMN     "provider" "ShippingProvider" NOT NULL DEFAULT 'SKYDROPX',
ADD COLUMN     "providerLabelId" TEXT,
ADD COLUMN     "providerShipmentId" TEXT,
ADD COLUMN     "quoteId" UUID,
ADD COLUMN     "rateId" UUID,
ADD COLUMN     "rawResponseJson" JSONB,
ADD COLUMN     "service" TEXT;

-- CreateIndex
CREATE INDEX "shipments_providerShipmentId_idx" ON "shipments"("providerShipmentId");

-- CreateIndex
CREATE INDEX "shipments_quoteId_idx" ON "shipments"("quoteId");

-- CreateIndex
CREATE INDEX "shipments_rateId_idx" ON "shipments"("rateId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "shipping_quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_rateId_fkey" FOREIGN KEY ("rateId") REFERENCES "shipping_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
