import type { PrismaClient } from '@prisma/client'
import { NotificationType } from '@prisma/client'

import { createAdminNotification, createUserNotification } from '@/src/server/notifications/notification.service'

type DemoNotificationSeedInput = {
  prisma: PrismaClient
  customerIds: string[]
  adminIds: string[]
}

/**
 * Seeds sample in-app notifications for demo users only.
 */
export async function seedDemoNotifications(
  input: DemoNotificationSeedInput,
): Promise<{ notifications: number }> {
  const { prisma, customerIds, adminIds } = input
  let notifications = 0

  const sampleCustomerId = customerIds[0]
  if (sampleCustomerId) {
    await createUserNotification(prisma, {
      userId: sampleCustomerId,
      type: NotificationType.ORDER_CREATED,
      title: 'Pedido demo creado',
      message: 'Este es un ejemplo de notificación de pedido en la cuenta demo.',
      href: '/cuenta/pedidos',
      metadataJson: { source: 'demo-seed' },
    })
    notifications += 1

    await createUserNotification(prisma, {
      userId: sampleCustomerId,
      type: NotificationType.DESIGN_SAVED,
      title: 'Diseño guardado',
      message: 'Tu diseño demo está listo para personalizar de nuevo.',
      metadataJson: { source: 'demo-seed' },
    })
    notifications += 1
  }

  const sampleAdminId = adminIds[0]
  if (sampleAdminId) {
    await createAdminNotification(prisma, {
      userId: sampleAdminId,
      type: NotificationType.ADMIN_NEW_ORDER,
      title: 'Nuevo pedido demo',
      message: 'Revisa el panel de pedidos para ver órdenes de ejemplo.',
      href: '/admin/pedidos',
      metadataJson: { source: 'demo-seed' },
    })
    notifications += 1
  }

  return { notifications }
}
