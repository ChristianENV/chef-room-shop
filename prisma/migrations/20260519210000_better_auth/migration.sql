-- Better Auth migration (DEV). Custom auth tables → Better Auth core schema.
-- Business tables (orders, products, RBAC, guest_sessions) are unchanged.

-- Sessions: legacy hashed tokens are incompatible — clear before reshape.
TRUNCATE TABLE "sessions";

-- Drop legacy auth tables
DROP TABLE IF EXISTS "email_verification_tokens";
DROP TABLE IF EXISTS "oauth_states";
DROP TABLE IF EXISTS "oauth_accounts";
DROP TABLE IF EXISTS "password_reset_tokens";

DROP TYPE IF EXISTS "AuthProvider";

-- Users: add Better Auth + profile columns (nullable first for backfill)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketingOptIn" BOOLEAN NOT NULL DEFAULT false;

UPDATE "users"
SET "name" = COALESCE(
  NULLIF(TRIM(CONCAT(COALESCE("firstName", ''), ' ', COALESCE("lastName", ''))), ''),
  "email"
)
WHERE "name" IS NULL;

UPDATE "users"
SET "emailVerified" = true
WHERE "emailVerifiedAt" IS NOT NULL;

UPDATE "users"
SET "image" = "avatarUrl"
WHERE "avatarUrl" IS NOT NULL;

ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "users" DROP COLUMN IF EXISTS "avatarUrl";
ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerifiedAt";
ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordHash";

-- Sessions: Better Auth shape
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "revokedAt";
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "tokenHash";
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "token" TEXT;
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "sessions_tokenHash_key";
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_key" ON "sessions"("token");

-- Accounts (credential + OAuth)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Verification (email, reset, OAuth state)
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications"("identifier");
