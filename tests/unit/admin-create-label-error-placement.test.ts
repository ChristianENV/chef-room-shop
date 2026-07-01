import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

const dialogSource = readFileSync(
  resolve('src/features/admin/shipping/components/admin-create-label-dialog.tsx'),
  'utf8',
)
const cardSource = readFileSync(
  resolve('src/features/admin/shipping/components/admin-shipment-card.tsx'),
  'utf8',
)

describe('Skydropx create-label error placement', () => {
  it('renders mutation errors inside the dialog with a dedicated test id', () => {
    assert.match(dialogSource, /error\?: string \| null/)
    assert.match(dialogSource, /data-testid="admin-create-label-error"/)
    assert.match(dialogSource, /\{error \?/)
    assert.match(dialogSource, /role="alert"/)
  })

  it('passes create-label errors to the dialog while it stays open', () => {
    assert.match(cardSource, /const \[createLabelError, setCreateLabelError\] = useState/)
    assert.match(cardSource, /setCreateLabelError\(message\)/)
    assert.match(cardSource, /error=\{createDialogOpen \? createLabelError : null\}/)
  })

  it('keeps the dialog open on create-label failure so the in-modal error is visible', () => {
    const handleCreateLabelMatch = cardSource.match(
      /const handleCreateLabel = async \(labelFormat: string\) => \{([\s\S]*?)\n  \}/,
    )
    assert.ok(handleCreateLabelMatch)
    const handleCreateLabelBody = handleCreateLabelMatch[1] ?? ''
    assert.match(handleCreateLabelBody, /catch \(error\) \{[\s\S]*setCreateLabelError\(message\)/)
    assert.doesNotMatch(
      handleCreateLabelBody,
      /catch \(error\) \{[\s\S]*setCreateDialogOpen\(false\)/,
    )
  })

  it('shows card-level error only after the dialog is closed', () => {
    assert.match(cardSource, /createLabelError && !createDialogOpen/)
    assert.match(cardSource, /data-testid="admin-create-label-card-error"/)
  })

  it('clears stale create-label errors when reopening the dialog', () => {
    assert.match(cardSource, /setCreateLabelError\(null\)[\s\S]*setCreateDialogOpen\(true\)/)
    assert.match(cardSource, /if \(open\) setCreateLabelError\(null\)/)
  })
})
