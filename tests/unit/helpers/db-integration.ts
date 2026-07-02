/**
 * Whether DB-backed integration tests should run.
 *
 * - Skips local dev `chef_room` (not `chef_room_ci`) to avoid mutating shared dev data.
 * - Skips CI placeholder `chef_room_ci` (PR workflow sets DATABASE_URL but no Postgres service).
 */
export function canRunDbIntegrationTests(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return false
  if (/localhost:5432\/chef_room(?!_ci)/.test(url)) return false
  if (url.includes('localhost:5432/chef_room_ci')) return false
  return true
}

/** @deprecated Use canRunDbIntegrationTests */
export const canRunNotificationDbTests = canRunDbIntegrationTests
