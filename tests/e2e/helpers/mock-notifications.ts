import type { Page, Route } from '@playwright/test'

type MockNotification = {
  id: string
  audience: 'USER' | 'ADMIN'
  type: string
  title: string
  message: string
  href: string | null
  metadataJson: Record<string, unknown> | null
  readAt: string | null
  expiresAt: string | null
  createdAt: string
}

type MockNotificationsState = {
  unreadCount: number
  notifications: MockNotification[]
}

function buildNotification(
  overrides: Partial<MockNotification> & Pick<MockNotification, 'id' | 'title' | 'message'>,
): MockNotification {
  return {
    audience: 'USER',
    type: 'SYSTEM',
    href: null,
    metadataJson: null,
    readAt: null,
    expiresAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function countUnread(
  notifications: MockNotification[],
  audience?: 'USER' | 'ADMIN',
): number {
  return notifications.filter(
    (item) => !item.readAt && (audience ? item.audience === audience : true),
  ).length
}

export const defaultAdminMockNotifications: MockNotificationsState = {
  unreadCount: 2,
  notifications: [
    buildNotification({
      id: '22222222-2222-4222-8222-222222222201',
      audience: 'ADMIN',
      title: 'Nuevo pedido demo',
      message: 'Pedido CR-DEMO-042 requiere revisión.',
      href: '/admin/orders',
      type: 'ADMIN_NEW_ORDER',
    }),
    buildNotification({
      id: '22222222-2222-4222-8222-222222222202',
      audience: 'ADMIN',
      title: 'Pago recibido',
      message: 'Se confirmó el pago del pedido CR-DEMO-041.',
      type: 'ADMIN_PAYMENT_RECEIVED',
    }),
    buildNotification({
      id: '22222222-2222-4222-8222-222222222203',
      audience: 'ADMIN',
      title: 'Excepción de envío',
      message: 'Revisar guía con incidencia en Skydropx.',
      readAt: new Date().toISOString(),
      type: 'ADMIN_SHIPMENT_EXCEPTION',
    }),
  ],
}

export const defaultMockNotifications: MockNotificationsState = {
  unreadCount: 2,
  notifications: [
    buildNotification({
      id: '11111111-1111-4111-8111-111111111101',
      title: 'Pedido registrado',
      message: 'Tu pedido CR-DEMO-001 fue creado.',
      href: '/account/orders',
      type: 'ORDER_CREATED',
    }),
    buildNotification({
      id: '11111111-1111-4111-8111-111111111102',
      title: 'Diseño guardado',
      message: 'Tu diseño está listo para editar.',
      type: 'DESIGN_SAVED',
    }),
    buildNotification({
      id: '11111111-1111-4111-8111-111111111103',
      title: 'Pago confirmado',
      message: 'Recibimos tu pago correctamente.',
      readAt: new Date().toISOString(),
      type: 'PAYMENT_CONFIRMED',
    }),
  ],
}

type MockNotificationsOptions = {
  initial?: MockNotificationsState
  passthrough?: boolean
}

/**
 * Intercepts notification GraphQL operations with in-memory state.
 * Other GraphQL operations pass through when passthrough is true (default).
 */
export async function mockNotificationsGraphQL(
  page: Page,
  options: MockNotificationsOptions = {},
): Promise<{ getState: () => MockNotificationsState }> {
  const state: MockNotificationsState = {
    unreadCount: options.initial?.unreadCount ?? defaultMockNotifications.unreadCount,
    notifications: [...(options.initial?.notifications ?? defaultMockNotifications.notifications)],
  }

  const passthrough = options.passthrough ?? true

  await page.route('**/api/graphql', async (route: Route) => {
    const request = route.request()
    if (request.method() !== 'POST') {
      await route.continue()
      return
    }

    const payload = request.postDataJSON() as { query?: string; variables?: Record<string, unknown> }
    const query = payload.query ?? ''

    if (query.includes('myUnreadNotificationCount')) {
      const audience = payload.variables?.audience as 'USER' | 'ADMIN' | undefined
      const unreadCount = countUnread(state.notifications, audience)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { myUnreadNotificationCount: unreadCount } }),
      })
      return
    }

    if (query.includes('myNotifications')) {
      const input = (payload.variables?.input ?? {}) as {
        unreadOnly?: boolean
        first?: number
        audience?: 'USER' | 'ADMIN'
      }
      const unreadOnly = Boolean(input.unreadOnly)
      const first = Number(input.first ?? 20)
      const nodes = state.notifications
        .filter((item) => (input.audience ? item.audience === input.audience : true))
        .filter((item) => (unreadOnly ? !item.readAt : true))
        .slice(0, first)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            myNotifications: {
              nodes,
              totalCount: nodes.length,
            },
          },
        }),
      })
      return
    }

    if (query.includes('markNotificationRead')) {
      const id = String(payload.variables?.id ?? '')
      const notification = state.notifications.find((item) => item.id === id)
      if (notification && !notification.readAt) {
        notification.readAt = new Date().toISOString()
      }
      state.unreadCount = countUnread(state.notifications)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { markNotificationRead: notification ?? null } }),
      })
      return
    }

    if (query.includes('markAllNotificationsRead')) {
      const audience = payload.variables?.audience as 'USER' | 'ADMIN' | undefined
      let updatedCount = 0
      for (const notification of state.notifications) {
        if (!notification.readAt && (!audience || notification.audience === audience)) {
          notification.readAt = new Date().toISOString()
          updatedCount += 1
        }
      }
      state.unreadCount = countUnread(state.notifications)

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { markAllNotificationsRead: { updatedCount } },
        }),
      })
      return
    }

    if (passthrough) {
      await route.continue()
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
    })
  })

  return { getState: () => state }
}

export async function countNotificationGraphQLRequests(page: Page): Promise<{
  unreadCount: number
  list: number
}> {
  const counts = { unreadCount: 0, list: 0 }

  await page.route('**/api/graphql', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') {
      const payload = request.postDataJSON() as { query?: string }
      const query = payload.query ?? ''
      if (query.includes('myUnreadNotificationCount')) counts.unreadCount += 1
      if (query.includes('myNotifications')) counts.list += 1
    }
    await route.continue()
  })

  return counts
}
