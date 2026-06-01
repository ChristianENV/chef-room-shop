import 'server-only'

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

import { requireR2Config } from './r2.config'
import type { R2Config } from './r2.types'

const globalForR2 = globalThis as unknown as {
  r2Client: S3Client | undefined
  r2ClientEndpoint: string | undefined
}

/**
 * Returns a shared S3 client configured for Cloudflare R2.
 * The client is cached on the global scope and rebuilt if config changes.
 */
export function getR2Client(): S3Client {
  const config: R2Config = requireR2Config()

  if (globalForR2.r2Client && globalForR2.r2ClientEndpoint === config.endpoint) {
    return globalForR2.r2Client
  }

  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  globalForR2.r2Client = client
  globalForR2.r2ClientEndpoint = config.endpoint
  return client
}

/**
 * Checks whether an object exists in the bucket (HEAD request).
 *
 * @returns true when the object exists, false on a 404/NotFound.
 */
export async function r2HeadObject(key: string): Promise<boolean> {
  const { bucketName } = requireR2Config()
  try {
    await getR2Client().send(
      new HeadObjectCommand({ Bucket: bucketName, Key: key }),
    )
    return true
  } catch (error) {
    if (isNotFoundError(error)) {
      return false
    }
    throw error
  }
}

/**
 * Deletes a single object from the bucket. Used for replace/cleanup flows.
 * Treats a missing object as success (idempotent).
 */
export async function r2DeleteObject(key: string): Promise<void> {
  const { bucketName } = requireR2Config()
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
  )
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const candidate = error as {
    name?: string
    $metadata?: { httpStatusCode?: number }
  }
  return candidate.name === 'NotFound' || candidate.$metadata?.httpStatusCode === 404
}
