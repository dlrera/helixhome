import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetForm from '@/components/assets/asset-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EditAssetPage({
  params,
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
          userId: true,
        },
      },
    },
  })

  if (!asset) {
    notFound()
  }

  // Verify ownership
  if (asset.home.userId !== session.user.id) {
    redirect('/assets')
  }

  // Get user's homes for the form
  const homes = await prisma.home.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  })

  const initialData = {
    homeId: asset.homeId,
    name: asset.name,
    category: asset.category,
    modelNumber: asset.modelNumber || undefined,
    serialNumber: asset.serialNumber || undefined,
    purchaseDate: asset.purchaseDate?.toISOString().split('T')[0] || undefined,
    warrantyExpiryDate:
      asset.warrantyExpiryDate?.toISOString().split('T')[0] || undefined,
    photoUrl: asset.photoUrl || undefined,
    manualUrl: asset.manualUrl || undefined,
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href={`/assets/${id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Asset
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-2">Edit Asset</h1>
      <p className="text-gray-600 mb-8">Update asset information</p>

      <AssetForm homes={homes} initialData={initialData} assetId={id} />
    </div>
  )
}
