-- Product options schema (idempotent for databases previously updated via db push)

DO $$ BEGIN
    CREATE TYPE "ProductOptionInputType" AS ENUM ('SINGLE_SELECT', 'BOOLEAN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "product_option_groups" (
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

CREATE TABLE IF NOT EXISTS "product_option_values" (
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

CREATE INDEX IF NOT EXISTS "product_option_groups_productId_idx" ON "product_option_groups"("productId");
CREATE INDEX IF NOT EXISTS "product_option_groups_productTypeId_idx" ON "product_option_groups"("productTypeId");
CREATE INDEX IF NOT EXISTS "product_option_groups_slug_idx" ON "product_option_groups"("slug");
CREATE INDEX IF NOT EXISTS "product_option_groups_isActive_idx" ON "product_option_groups"("isActive");
CREATE INDEX IF NOT EXISTS "product_option_values_optionGroupId_idx" ON "product_option_values"("optionGroupId");
CREATE INDEX IF NOT EXISTS "product_option_values_slug_idx" ON "product_option_values"("slug");
CREATE INDEX IF NOT EXISTS "product_option_values_isActive_idx" ON "product_option_values"("isActive");

DO $$ BEGIN
    ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "product_option_groups" ADD CONSTRAINT "product_option_groups_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "product_option_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "optionPriceCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "selectedOptionsJson" JSONB;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "optionPriceCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "selectedOptionsJson" JSONB;
