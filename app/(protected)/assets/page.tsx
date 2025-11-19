import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetList from '@/components/assets/asset-list'
import ApplyTemplateToAsset from '@/components/assets/apply-template-to-asset'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

export default async function AssetsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get all assets with relationships in a single optimized query
  const assets = await prisma.asset.findMany({
    where: {
      home: {
        userId: session.user.id
      }
    },
    include: {
      home: {
        select: {
          id: true,
          name: true,
        }
      },
      _count: {
        select: {
          tasks: true,
          recurringSchedules: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Assets</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your home assets and equipment</p>
        </div>
        <Link href="/assets/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      <AssetList initialAssets={assets} />

      {/* Apply Template Modal - wrapped in Suspense for searchParams */}
      <Suspense fallback={null}>
        <ApplyTemplateToAsset assets={assets} />
      </Suspense>
    </div>
  )
}
