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

describe('user invitation accept source inspection', () => {
  it('accept-invite page route exists', () => {
    assert.ok(exists('src/app/(storefront)/accept-invite/page.tsx'))
  })

  it('scoped signup form exists on accept page feature', () => {
    assert.ok(
      exists('src/features/storefront/invitations/components/accept-invite-signup-form.tsx'),
    )
  })

  it('accept page uses scoped signup form not global register form', async () => {
    const page = await readFile(
      resolve(ROOT, 'src/app/(storefront)/accept-invite/page.tsx'),
      'utf-8',
    )
    assert.ok(page.includes('AcceptInviteSignupForm'))
    assert.equal(page.includes('RegisterForm'), false)
  })

  it('accept page uses login callbackUrl back to accept link', async () => {
    const page = await readFile(
      resolve(ROOT, 'src/app/(storefront)/accept-invite/page.tsx'),
      'utf-8',
    )
    assert.ok(page.includes('acceptInvite({ token })'))
    assert.ok(page.includes('login({ callbackUrl })'))
  })

  it('GraphQL includes preview and accept operations', async () => {
    assert.ok(await fileContains('src/server/graphql/type-defs.ts', 'previewUserInvitation'))
    assert.ok(await fileContains('src/server/graphql/type-defs.ts', 'acceptUserInvitation'))
    assert.ok(await fileContains('src/server/graphql/type-defs.ts', 'PublicUserInvitationPreview'))
  })

  it('preview service does not expose tokenHash', async () => {
    const service = await readFile(
      resolve(ROOT, 'src/server/invitations/user-invitation-accept.service.ts'),
      'utf-8',
    )
    assert.equal(service.includes('tokenHash'), false)
  })

  it('assignRoleIfMissing helper exists in roles-core', async () => {
    assert.ok(await fileContains('src/server/auth/roles-core.ts', 'assignRoleIfMissing'))
  })

  it('auth core files were not modified for accept flow', async () => {
    const authCorePaths = [
      'src/server/auth/build-auth.ts',
      'src/server/auth/better-auth.ts',
      'src/server/auth/current-user.ts',
    ]

    for (const relPath of authCorePaths) {
      if (!exists(relPath)) continue
      assert.ok(!(await fileContains(relPath, 'acceptUserInvitation')))
      assert.ok(!(await fileContains(relPath, 'previewUserInvitation')))
      assert.ok(!(await fileContains(relPath, 'UserInvitation')))
    }
  })

  it('global login/register forms were not modified', async () => {
    const loginForm = 'components/shared/auth/login-form.tsx'
    const registerForm = 'src/features/storefront/auth/register-form.tsx'

    if (exists(loginForm)) {
      assert.ok(!(await fileContains(loginForm, 'accept-invite')))
    }

    if (exists(registerForm)) {
      const content = await readFile(resolve(ROOT, registerForm), 'utf-8')
      assert.equal(content.includes('AcceptInviteSignupForm'), false)
    }
  })
})
