import { test, expect } from '@playwright/test'

import { postGraphQL } from '../helpers/graphql'

test.describe('GraphQL smoke', () => {
  test('health query returns ok', async ({ request }) => {
    const data = await postGraphQL<{ health: string }>(request, '{ health }')
    expect(data.health).toBe('ok')
  })
})
