-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('REGULAR', 'PREMIUM', 'VIP');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "customerTier" "CustomerTier" NOT NULL DEFAULT 'REGULAR';

-- CreateIndex
CREATE INDEX "users_customerTier_idx" ON "users"("customerTier");
