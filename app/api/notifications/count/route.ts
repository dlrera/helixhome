import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/notifications/count
 * Returns unread notification count for authenticated user
 *
 * Currently returns 0 since notification system (Task 8) is not yet implemented
 * This endpoint exists to support the navigation UI without breaking the interface
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Task 8 - Implement actual notification count query
    // For now, return 0 to support navigation UI
    return NextResponse.json({ count: 0 })
  } catch (error) {
    console.error('Error fetching notification count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification count' },
      { status: 500 }
    )
  }
}
