import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ROOT = resolve(process.cwd())

function exists(relPath: string) {
  return existsSync(resolve(ROOT, relPath))
}

async function fileContains(relPath: string, needle: string) {
  const content = await readFile(resolve(ROOT, relPath), 'utf-8')
  return content.includes(needle)
}

describe('admin invitations source inspection', () => {
  it('invitations route exists', () => {
    assert.ok(
      exists('src/app/(admin)/admin/(protected)/users/invitations/page.tsx'),
      'invitations page must exist',
    )
  })

  it('segment tabs include Invitaciones link', async () => {
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-users-segment-tabs.tsx',
        'adminUsersInvitations',
      ),
    )
  })

  it('create invitation dialog exists', () => {
    assert.ok(exists('src/features/admin/users/components/create-user-invitation-dialog.tsx'))
  })

  it('revoke/resend dialogs exist', () => {
    assert.ok(exists('src/features/admin/users/components/admin-invitation-action-dialog.tsx'))
  })

  it('GraphQL includes invitation mutations', async () => {
    assert.ok(await fileContains('src/server/graphql/type-defs.ts', 'createUserInvitation'))
    assert.ok(await fileContains('src/server/graphql/type-defs.ts', 'adminUserInvitations'))
  })

  it('email template user_invitation exists', async () => {
    assert.ok(await fileContains('src/server/email/email.types.ts', 'user_invitation'))
    assert.ok(await fileContains('src/server/email/email.templates.ts', 'user_invitation'))
  })

  it('buildUserInvitationUrl exists', async () => {
    assert.ok(await fileContains('src/server/email/email.links.ts', 'buildUserInvitationUrl'))
    assert.ok(await fileContains('src/server/email/email.links.ts', 'acceptInvite'))
  })

  it('mapper does not expose tokenHash field name in GraphQL type', async () => {
    const mapper = await readFile(
      resolve(ROOT, 'src/server/graphql/modules/admin-invitations/admin-invitations.mappers.ts'),
      'utf-8',
    )
    assert.ok(mapper.includes('never exposes tokenHash'))
    assert.equal(mapper.includes('tokenHash:'), false)
  })

  it('auth core files were not modified for invitations', async () => {
    if (exists('src/server/auth/build-auth.ts')) {
      assert.ok(!(await fileContains('src/server/auth/build-auth.ts', 'UserInvitation')))
      assert.ok(!(await fileContains('src/server/auth/build-auth.ts', 'createUserInvitation')))
    }
  })

  it('migration for user_invitations exists', () => {
    assert.ok(exists('prisma/migrations/20260701120000_user_invitations/migration.sql'))
  })
})
