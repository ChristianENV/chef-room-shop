import { GraphQLError } from 'graphql'

type DesignPreviewUploadToken = {
  v: 1
  kind: 'design-preview'
  designId: string
  iat: number
}

type DesignAssetUploadToken = {
  v: 1
  kind: 'design-asset'
  designId: string
  assetId: string
  iat: number
}

function encode(payload: DesignPreviewUploadToken | DesignAssetUploadToken): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function invalidToken(): GraphQLError {
  return new GraphQLError('Token de subida inválido o expirado.', {
    extensions: { code: 'BAD_USER_INPUT' },
  })
}

export function encodeDesignPreviewUploadToken(designId: string): string {
  return encode({ v: 1, kind: 'design-preview', designId, iat: Date.now() })
}

export function decodeDesignPreviewUploadToken(uploadId: string): DesignPreviewUploadToken {
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
  if (
    candidate.v !== 1 ||
    candidate.kind !== 'design-preview' ||
    typeof candidate.designId !== 'string'
  ) {
    throw invalidToken()
  }

  return candidate as unknown as DesignPreviewUploadToken
}

export function encodeDesignAssetUploadToken(designId: string, assetId: string): string {
  return encode({ v: 1, kind: 'design-asset', designId, assetId, iat: Date.now() })
}

export function decodeDesignAssetUploadToken(uploadId: string): DesignAssetUploadToken {
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
  if (
    candidate.v !== 1 ||
    candidate.kind !== 'design-asset' ||
    typeof candidate.designId !== 'string' ||
    typeof candidate.assetId !== 'string'
  ) {
    throw invalidToken()
  }

  return candidate as unknown as DesignAssetUploadToken
}
