-- CreateEnum
CREATE TYPE "ProductModelAssetStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PROCESSING', 'FAILED');

-- CreateTable
CREATE TABLE "product_model_assets" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT,
    "format" TEXT NOT NULL DEFAULT 'glb',
    "contentType" TEXT NOT NULL DEFAULT 'model/gltf-binary',
    "sizeBytes" INTEGER NOT NULL,
    "originalSizeBytes" INTEGER,
    "compressionRatio" DOUBLE PRECISION,
    "optimizerVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProductModelAssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadataJson" JSONB,
    "materialHintsJson" JSONB,
    "meshHintsJson" JSONB,
    "anchorsJson" JSONB,
    "optimizationReportJson" JSONB,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_model_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_model_assets_productId_idx" ON "product_model_assets"("productId");

-- CreateIndex
CREATE INDEX "product_model_assets_productId_isActive_idx" ON "product_model_assets"("productId", "isActive");

-- CreateIndex
CREATE INDEX "product_model_assets_status_idx" ON "product_model_assets"("status");

-- AddForeignKey
ALTER TABLE "product_model_assets" ADD CONSTRAINT "product_model_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
