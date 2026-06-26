-- AlterTable
ALTER TABLE "products" ADD COLUMN "seoImageId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "products_seoImageId_key" ON "products"("seoImageId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seoImageId_fkey" FOREIGN KEY ("seoImageId") REFERENCES "product_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;
