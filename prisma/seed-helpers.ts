/**
 * Shared utilities for Prisma seeds (base + demo).
 */

/** Converts MXN pesos to integer centavos. */
export function cents(amount: number): number {
  return Math.round(amount * 100)
}

/** Lowercase slug with hyphens. */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Joins SKU segments with a demo prefix. */
export function buildSku(parts: string[]): string {
  return ['DEMO', ...parts.map((p) => p.toUpperCase().replace(/[^A-Z0-9]/g, ''))].join('-')
}

/** Picks a random element from a non-empty array. */
export function randomFrom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]!
}

/** Throws when value is null or undefined. */
export function getOrThrow<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
  return value
}

/** Date at start of day N days ago. */
export function daysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

/** Date N days from now. */
export function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

/** Pads an integer for order numbers (e.g. CR-2026-000001). */
export function padOrderSequence(sequence: number, width = 6): string {
  return String(sequence).padStart(width, '0')
}
