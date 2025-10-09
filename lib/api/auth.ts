import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function getUserHome(userId: string) {
  const home = await prisma.home.findFirst({
    where: { userId },
  })

  if (!home) {
    throw new Error('No home found for user')
  }

  return home
}

export async function verifyAssetOwnership(assetId: string, userId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      home: {
        select: { userId: true }
      }
    }
  })

  if (!asset) {
    return { authorized: false, asset: null, reason: 'not_found' as const }
  }

  if (asset.home.userId !== userId) {
    return { authorized: false, asset: null, reason: 'forbidden' as const }
  }

  return { authorized: true, asset, reason: null }
}
