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

describe('admin invitations UX polish (Phase 3C)', () => {
  it('customers segment page includes Invitar cliente CTA', async () => {
    const segmentPage = await readFile(
      resolve(ROOT, 'src/features/admin/users/components/admin-users-segment-page.tsx'),
      'utf-8',
    )
    assert.ok(segmentPage.includes('Invitar cliente'))
    assert.ok(segmentPage.includes('admin-users-invite-customer'))
    assert.ok(segmentPage.includes("defaultRole: 'CUSTOMER'"))
  })

  it('admins segment page includes Invitar al equipo CTA', async () => {
    const segmentPage = await readFile(
      resolve(ROOT, 'src/features/admin/users/components/admin-users-segment-page.tsx'),
      'utf-8',
    )
    assert.ok(segmentPage.includes('Invitar al equipo'))
    assert.ok(segmentPage.includes('admin-users-invite-team'))
    assert.ok(segmentPage.includes("defaultRole: 'ADMIN'"))
  })

  it('quick invite dialogs lock target role per segment', async () => {
    const segmentPage = await readFile(
      resolve(ROOT, 'src/features/admin/users/components/admin-users-segment-page.tsx'),
      'utf-8',
    )
    assert.ok(segmentPage.includes('lockTargetRole'))
    assert.ok(segmentPage.includes('defaultTargetRole={inviteCta.defaultRole}'))
  })

  it('create invitation dialog does not offer SUPERADMIN', async () => {
    const dialog = await readFile(
      resolve(ROOT, 'src/features/admin/users/components/create-user-invitation-dialog.tsx'),
      'utf-8',
    )
    assert.equal(dialog.includes('SUPERADMIN'), false)
    assert.ok(dialog.includes('SelectItem value="CUSTOMER"'))
    assert.ok(dialog.includes('SelectItem value="ADMIN"'))
  })

  it('invitations tab and route still exist', async () => {
    assert.ok(exists('src/app/(admin)/admin/(protected)/users/invitations/page.tsx'))
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-users-segment-tabs.tsx',
        'adminUsersInvitations',
      ),
    )
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-users-segment-tabs.tsx',
        'Invitaciones',
      ),
    )
  })

  it('invitations table has improved empty state', async () => {
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-invitations-table.tsx',
        'admin-invitations-empty',
      ),
    )
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-invitations-table.tsx',
        'se unan a la app',
      ),
    )
  })

  it('create invitation shows success toast and invalidates list', async () => {
    const dialog = await readFile(
      resolve(ROOT, 'src/features/admin/users/components/create-user-invitation-dialog.tsx'),
      'utf-8',
    )
    assert.ok(dialog.includes('toast({'))
    assert.ok(dialog.includes('Invitación enviada'))

    const mutation = await readFile(
      resolve(ROOT, 'src/features/admin/users/api/use-create-user-invitation-mutation.ts'),
      'utf-8',
    )
    assert.ok(mutation.includes('invalidateQueries'))
  })

  it('auth core files were not modified for invitation UX', async () => {
    const authCorePaths = [
      'src/server/auth/build-auth.ts',
      'src/server/auth/better-auth.ts',
      'src/server/auth/current-user.ts',
    ]

    for (const relPath of authCorePaths) {
      if (!exists(relPath)) continue
      assert.ok(!(await fileContains(relPath, 'Invitar cliente')))
      assert.ok(!(await fileContains(relPath, 'CreateUserInvitationDialog')))
    }
  })
})
