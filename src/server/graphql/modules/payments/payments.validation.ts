import { z } from 'zod'

export const createConektaCheckoutInputSchema = z.object({
  orderNumber: z.string().trim().min(1, 'orderNumber es requerido'),
  email: z.string().trim().email().optional().nullable(),
})
