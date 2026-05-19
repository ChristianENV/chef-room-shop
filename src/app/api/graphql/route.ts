import { NextResponse } from 'next/server'

/**
 * GraphQL API route placeholder.
 * Implement schema and handlers when the backend is ready.
 */
export async function POST() {
  return NextResponse.json(
    { errors: [{ message: 'GraphQL endpoint not implemented yet' }] },
    { status: 501 }
  )
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chef Room GraphQL API — use POST for queries' },
    { status: 200 }
  )
}
