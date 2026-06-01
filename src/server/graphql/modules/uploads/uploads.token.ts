import { GraphQLError } from 'graphql'

/**
 * Stateless upload token (`uploadId`) encoding the minimal identity needed to
 * confirm an upload. It carries NO secrets and NO presigned URLs — only ids
 * that are fully re-authorized server-side on confirm. Object keys are
 * re-derived deterministically from these ids, so a tampered token cannot
 * point at someone else's object without also failing authorization.
 */
type AvatarUploadToken = {
  v: 1
  kind: 'avatar'
  userId: string
  iat: number
}

type ProductUploadToken = {
  v: 1
  kind: 'product'
  productId: string
  imageId: string
  iat: number
}

export type UploadToken = AvatarUploadToken | ProductUploadToken

function encode(payload: UploadToken): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function invalidToken(): GraphQLError {
  return new GraphQLError('Token de subida inválido o expirado.', {
    extensions: { code: 'BAD_USER_INPUT' },
  })
}

export function encodeAvatarUploadToken(userId: string): string {
  return encode({ v: 1, kind: 'avatar', userId, iat: Date.now() })
}

export function encodeProductUploadToken(productId: string, imageId: string): string {
  return encode({ v: 1, kind: 'product', productId, imageId, iat: Date.now() })
}

function decode(uploadId: string): UploadToken {
  let parsed: unknown
  try {
    const json = Buffer.from(uploadId, 'base64url').toString('utf8')
    parsed = JSON.parse(json)
  } catch {
    throw invalidToken()
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw invalidToken()
  }
  const candidate = parsed as Record<string, unknown>
  if (candidate.v !== 1) {
    throw invalidToken()
  }
  return candidate as unknown as UploadToken
}

/** Decodes an avatar upload token, validating its shape. */
export function decodeAvatarUploadToken(uploadId: string): AvatarUploadToken {
  const token = decode(uploadId)
  if (token.kind !== 'avatar' || typeof token.userId !== 'string') {
    throw invalidToken()
  }
  return token
}

/** Decodes a product image upload token, validating its shape. */
export function decodeProductUploadToken(uploadId: string): ProductUploadToken {
  const token = decode(uploadId)
  if (
    token.kind !== 'product' ||
    typeof token.productId !== 'string' ||
    typeof token.imageId !== 'string'
  ) {
    throw invalidToken()
  }
  return token
}
