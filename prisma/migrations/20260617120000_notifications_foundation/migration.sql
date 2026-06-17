-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
    'ORDER_CREATED',
    'PAYMENT_CONFIRMED',
    'PAYMENT_PENDING',
    'PAYMENT_FAILED',
    'ORDER_IN_PRODUCTION',
    'ORDER_READY_TO_SHIP',
    'ORDER_SHIPPED',
    'ORDER_DELIVERED',
    'DESIGN_SAVED',
    'ACCOUNT_EMAIL_VERIFICATION',
    'ADMIN_NEW_ORDER',
    'ADMIN_PAYMENT_RECEIVED',
    'ADMIN_SHIPMENT_EXCEPTION',
    'ORDER_CLAIM_TRANSFER',
    'SYSTEM'
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "audience" "NotificationAudience" NOT NULL DEFAULT 'USER',
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "href" TEXT,
    "metadataJson" JSONB,
    "readAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_audience_readAt_createdAt_idx" ON "notifications"("audience", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_type_createdAt_idx" ON "notifications"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
