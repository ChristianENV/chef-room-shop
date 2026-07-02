import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

const ROOT = resolve(process.cwd())

function exists(relPath: string) {
  return existsSync(resolve(ROOT, relPath))
}

async function fileContains(relPath: string, needle: string) {
  const content = await readFile(resolve(ROOT, relPath), 'utf-8')
  return content.includes(needle)
}

describe('admin users source inspection', () => {
  it('customers route file exists', () => {
    assert.ok(
      exists('src/app/(admin)/admin/(protected)/users/customers/page.tsx'),
      'customers page.tsx must exist',
    )
  })

  it('admins route file exists', () => {
    assert.ok(
      exists('src/app/(admin)/admin/(protected)/users/admins/page.tsx'),
      'admins page.tsx must exist',
    )
  })

  it('edit dialog component exists', () => {
    assert.ok(
      exists('src/features/admin/users/components/admin-user-edit-dialog.tsx'),
      'edit dialog must exist',
    )
  })

  it('action dialog (pause/block/reactivate) component exists', () => {
    assert.ok(
      exists('src/features/admin/users/components/admin-user-action-dialog.tsx'),
      'action dialog must exist',
    )
  })

  it('segment tabs component exists', () => {
    assert.ok(
      exists('src/features/admin/users/components/admin-users-segment-tabs.tsx'),
      'segment tabs must exist',
    )
  })

  it('routes config contains adminUsersCustomers and adminUsersAdmins', async () => {
    const hasCustomers = await fileContains('src/config/routes.ts', 'adminUsersCustomers')
    const hasAdmins = await fileContains('src/config/routes.ts', 'adminUsersAdmins')
    assert.ok(hasCustomers, 'routes.ts must have adminUsersCustomers')
    assert.ok(hasAdmins, 'routes.ts must have adminUsersAdmins')
  })

  it('GraphQL type-defs contains user management mutations', async () => {
    const hasPause = await fileContains('src/server/graphql/type-defs.ts', 'pauseAdminUser')
    const hasBlock = await fileContains('src/server/graphql/type-defs.ts', 'blockAdminUser')
    const hasReactivate = await fileContains(
      'src/server/graphql/type-defs.ts',
      'reactivateAdminUser',
    )
    const hasUpdate = await fileContains('src/server/graphql/type-defs.ts', 'updateAdminUser')
    assert.ok(hasPause, 'type-defs must have pauseAdminUser')
    assert.ok(hasBlock, 'type-defs must have blockAdminUser')
    assert.ok(hasReactivate, 'type-defs must have reactivateAdminUser')
    assert.ok(hasUpdate, 'type-defs must have updateAdminUser')
  })

  it('GraphQL type-defs contains segment filter', async () => {
    assert.ok(
      await fileContains('src/server/graphql/type-defs.ts', 'segment: String'),
      'AdminUsersFilterInput must have segment field',
    )
  })

  it('users.write permission check exists in mutations service', async () => {
    assert.ok(
      await fileContains(
        'src/server/graphql/modules/admin-users/admin-users.mutations.ts',
        'requireUsersWriteGraphQL',
      ),
      'mutations must call requireUsersWriteGraphQL',
    )
  })

  it('auth core files were not modified by this feature', async () => {
    // Verify auth files do NOT contain user management mutation logic
    const buildAuthPath = 'src/server/auth/build-auth.ts'
    const currentUserPath = 'src/server/auth/current-user.ts'

    if (exists(buildAuthPath)) {
      const noMutationLogic = !(await fileContains(buildAuthPath, 'pauseAdminUser'))
      assert.ok(noMutationLogic, 'build-auth.ts must not contain user management mutations')
    }

    if (exists(currentUserPath)) {
      const noMutationLogic = !(await fileContains(currentUserPath, 'pauseAdminUser'))
      assert.ok(noMutationLogic, 'current-user.ts must not contain user management mutations')
    }
  })

  it('pause/block/reactivate dialog has data-testid attributes', async () => {
    assert.ok(
      await fileContains(
        'src/features/admin/users/components/admin-user-action-dialog.tsx',
        'data-testid',
      ),
      'action dialog must have data-testid attributes',
    )
  })
})
