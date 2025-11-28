import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Temporary debug endpoint - remove after fixing auth
export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrlValue: process.env.NEXTAUTH_URL?.substring(0, 30) + '...',
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  }

  // Test database connection
  try {
    const userCount = await prisma.user.count()
    diagnostics.dbConnected = true
    diagnostics.userCount = userCount

    // Check if test user exists (without exposing sensitive data)
    const testUser = await prisma.user.findFirst({
      select: { id: true, email: true, password: true },
    })
    if (testUser) {
      diagnostics.testUserExists = true
      diagnostics.testUserEmail = testUser.email
      diagnostics.testUserHasPassword = !!testUser.password
      diagnostics.passwordLength = testUser.password?.length || 0
    }
  } catch (error) {
    diagnostics.dbConnected = false
    diagnostics.dbError =
      error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(diagnostics)
}
