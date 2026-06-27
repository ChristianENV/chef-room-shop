-- Color scope flags: fabric vs product vs general usage
ALTER TABLE "colors" ADD COLUMN "isFabricColor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "colors" ADD COLUMN "isProductColor" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "colors" ADD COLUMN "isGeneralColor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "colors" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "colors" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill canonical product colors
UPDATE "colors" SET
  "isFabricColor" = true,
  "isProductColor" = true,
  "isGeneralColor" = true,
  "isActive" = true,
  "sortOrder" = 10
WHERE "slug" = 'black';

UPDATE "colors" SET
  "isFabricColor" = true,
  "isProductColor" = true,
  "isGeneralColor" = false,
  "isActive" = true,
  "sortOrder" = 20
WHERE "slug" = 'white';

UPDATE "colors" SET
  "isFabricColor" = true,
  "isProductColor" = true,
  "isGeneralColor" = false,
  "isActive" = true,
  "sortOrder" = 30
WHERE "slug" = 'chef-blue';

UPDATE "colors" SET
  "isFabricColor" = true,
  "isProductColor" = true,
  "isGeneralColor" = false,
  "isActive" = true,
  "sortOrder" = 40
WHERE "slug" = 'warm-gray';
