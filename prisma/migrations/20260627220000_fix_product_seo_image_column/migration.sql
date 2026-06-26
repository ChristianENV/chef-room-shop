-- Correct snake_case column from an earlier manual migration attempt, or add camelCase column if missing.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'seo_image_id'
  ) THEN
    ALTER TABLE "products" RENAME COLUMN "seo_image_id" TO "seoImageId";

    IF EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'products_seo_image_id_key'
    ) THEN
      ALTER INDEX "products_seo_image_id_key" RENAME TO "products_seoImageId_key";
    END IF;

    IF EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'products'
        AND constraint_name = 'products_seo_image_id_fkey'
    ) THEN
      ALTER TABLE "products" RENAME CONSTRAINT "products_seo_image_id_fkey" TO "products_seoImageId_fkey";
    END IF;
  ELSIF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'seoImageId'
  ) THEN
    ALTER TABLE "products" ADD COLUMN "seoImageId" UUID;
    CREATE UNIQUE INDEX "products_seoImageId_key" ON "products"("seoImageId");
    ALTER TABLE "products"
      ADD CONSTRAINT "products_seoImageId_fkey"
      FOREIGN KEY ("seoImageId") REFERENCES "product_images"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
