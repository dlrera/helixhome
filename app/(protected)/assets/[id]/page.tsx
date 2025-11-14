import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetDetail from '@/components/assets/asset-detail'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AssetDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      home: {
        select: {
          id: true,
          name: true,
          userId: true,
        }
      },
      tasks: {
        orderBy: { dueDate: 'asc' },
        take: 5
      },
      recurringSchedules: {
        include: {
          template: true
        }
        // Fetch all schedules (both active and inactive) so they can be managed
      }
    }
  })

  if (!asset) {
    notFound()
  }

  // Verify ownership
  if (asset.home.userId !== session.user.id) {
    redirect('/assets')
  }

  // Get IDs of already applied templates (only active ones)
  const appliedTemplateIds = asset.recurringSchedules
    .filter(s => s.isActive)
    .map(s => s.template.id)

  // Fetch template suggestions
  const suggestedTemplates = await prisma.maintenanceTemplate.findMany({
    where: {
      category: asset.category,
      isActive: true,
      id: {
        notIn: appliedTemplateIds
      }
    },
    select: {
      id: true,
      name: true,
      description: true,
      defaultFrequency: true,
      estimatedDurationMinutes: true,
      difficulty: true
    },
    orderBy: [
      { difficulty: 'asc' },
      { defaultFrequency: 'asc' }
    ],
    take: 5
  })

  return (
    <div className="space-y-6">
      <Link href="/assets">
        <Button variant="ghost" size="sm" className="min-h-[44px]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </Link>

      <AssetDetail asset={asset} suggestedTemplates={suggestedTemplates} />
    </div>
  )
}
