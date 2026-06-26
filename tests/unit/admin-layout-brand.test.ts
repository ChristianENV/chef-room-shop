import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import { CHEF_ROOM_ICON_SRC, CHEF_ROOM_LOGO_SRC } from '@/lib/brand'
import { routes } from '@/src/config/routes'

describe('admin layout brand assets', () => {
  it('exposes full logo and collapsed sidebar icon paths', () => {
    assert.equal(CHEF_ROOM_LOGO_SRC, '/chef-room-logo.png')
    assert.equal(CHEF_ROOM_ICON_SRC, '/icono-chefroom.png')
  })

  it('includes public icon asset for collapsed admin sidebar', () => {
    assert.equal(existsSync(resolve('public/icono-chefroom.png')), true)
  })

  it('links Ver tienda to the public landing', () => {
    assert.equal(routes.home, '/')
  })
})

describe('admin shell layout classes', () => {
  it('constrains main content width in AdminShell', () => {
    const source = readAdminPageConfigSource()
    assert.match(source, /SidebarInset className="min-w-0 overflow-x-hidden"/)
    assert.match(source, /main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden/)
  })

  it('contains products table scroll inside the table card', () => {
    const source = readProductsTableSource()
    assert.match(source, /min-w-0 w-full max-w-full overflow-x-auto/)
    assert.match(source, /Table className="min-w-\[960px\]"/)
  })
})

function readAdminPageConfigSource(): string {
  return readFileSync(resolve('src/features/admin/layout/admin-page-config.tsx'), 'utf8')
}

function readProductsTableSource(): string {
  return readFileSync(resolve('src/features/admin/products/products-table.tsx'), 'utf8')
}
