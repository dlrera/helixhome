import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetForm from '@/components/assets/asset-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewAssetPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get user's homes
  const homes = await prisma.home.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true }
  })

  if (homes.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">No Home Found</h1>
        <p className="text-gray-600">You need to create a home before adding assets.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href="/assets">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-2">Add New Asset</h1>
      <p className="text-gray-600 mb-8">Add a new asset to track maintenance and tasks</p>

      <AssetForm homes={homes} />
    </div>
  )
}
