-- AlterTable
ALTER TABLE "products" ADD COLUMN "seo_image_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "products_seo_image_id_key" ON "products"("seo_image_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seo_image_id_fkey" FOREIGN KEY ("seo_image_id") REFERENCES "product_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
