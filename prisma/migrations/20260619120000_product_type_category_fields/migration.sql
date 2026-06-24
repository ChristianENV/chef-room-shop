-- Extend product_types for dynamic storefront/admin categories.
-- Existing internal slugs (chef-jacket, apron, pants) are unchanged.
-- shopSlug backfill aligns with /shop?category=... URL params; shoes is seeded via prisma/seed.ts.

ALTER TABLE "product_types" ADD COLUMN "shopSlug" TEXT;
ALTER TABLE "product_types" ADD COLUMN "description" TEXT;
ALTER TABLE "product_types" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "product_types" ADD COLUMN "showInNav" BOOLEAN NOT NULL DEFAULT true;

UPDATE "product_types"
SET
  "shopSlug" = 'filipinas',
  "nameEs" = 'Filipinas',
  "nameEn" = 'Chef jackets',
  "isActive" = true,
  "showInNav" = true
WHERE "slug" = 'chef-jacket';

UPDATE "product_types"
SET
  "shopSlug" = 'mandiles',
  "nameEs" = 'Mandiles',
  "nameEn" = 'Aprons',
  "isActive" = true,
  "showInNav" = true
WHERE "slug" = 'apron';

UPDATE "product_types"
SET
  "shopSlug" = 'pantalones',
  "nameEs" = 'Pantalones',
  "nameEn" = 'Pants',
  "isActive" = true,
  "showInNav" = true
WHERE "slug" = 'pants';

CREATE UNIQUE INDEX "product_types_shopSlug_key" ON "product_types"("shopSlug");
