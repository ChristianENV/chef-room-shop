-- CreateEnum
CREATE TYPE "ProductOptionInputType" AS ENUM ('SINGLE_SELECT', 'BOOLEAN');

-- CreateTable
CREATE TABLE "product_option_groups" (
    "id" UUID NOT NULL,
    "productId" UUID,
    "productTypeId" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputType" "ProductOptionInputType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_values" (
    "id" UUID NOT NULL,
    "optionGroupId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "priceDeltaCents" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_option_groups_productId_idx" ON "product_option_groups"("productId");

-- CreateIndex
CREATE INDEX "product_option_groups_productTypeId_idx" ON "product_option_groups"("productTypeId");

-- CreateIndex
CREATE INDEX "product_option_groups_slug_idx" ON "product_option_groups"("slug");

-- CreateIndex
CREATE INDEX "product_option_groups_isActive_idx" ON "product_option_groups"("isActive");

-- CreateIndex
CREATE INDEX "product_option_values_optionGroupId_idx" ON "product_option_values"("optionGroupId");

-- CreateIndex
CREATE INDEX "product_option_values_slug_idx" ON "product_option_values"("slug");

-- CreateIndex
CREATE INDEX "product_option_values_isActive_idx" ON "product_option_values"("isActive");

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "product_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN "optionPriceCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN "selectedOptionsJson" JSONB;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "optionPriceCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "selectedOptionsJson" JSONB;
