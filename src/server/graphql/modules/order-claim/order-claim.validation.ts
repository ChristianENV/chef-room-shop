import { z } from 'zod'

export const orderClaimTokenSchema = z.string().min(16).max(256)
