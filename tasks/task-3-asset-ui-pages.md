# Task 3: Asset UI Pages

## Objective

Create user-facing pages for asset management with a mobile-first responsive design. Build interfaces for viewing, adding, editing, and managing home assets with photo upload capabilities.

## Prerequisites

- Task 1 completed (Database schema with Asset model)
- Task 2 completed (Asset Management API routes)
- shadcn/ui components available in `components/ui/`
- TanStack Query configured in app
- NextAuth.js authentication working
- TailwindCSS v4 configured with HelixIntel brand colors

## Implementation Plan

### Step 1: Create Asset List Page

Create `app/(protected)/assets/page.tsx`:

```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetList from '@/components/assets/asset-list'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AssetsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get user's homes
  const homes = await prisma.home.findMany({
    where: { userId: session.user.id },
    select: { id: true }
  })

  const homeIds = homes.map(h => h.id)

  // Get all assets with relationships
  const assets = await prisma.asset.findMany({
    where: {
      homeId: { in: homeIds }
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-gray-600 mt-1">Manage your home assets and equipment</p>
        </div>
        <Link href="/assets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </Link>
      </div>

      <AssetList initialAssets={assets} />
    </div>
  )
}
```

### Step 2: Create Asset List Component (Client)

Create `components/assets/asset-list.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { AssetCategory } from '@prisma/client'
import AssetCard from './asset-card'
import AssetFilters from './asset-filters'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

type Asset = {
  id: string
  name: string
  category: AssetCategory
  modelNumber: string | null
  photoUrl: string | null
  home: {
    id: string
    name: string
  }
  _count: {
    tasks: number
    recurringSchedules: number
  }
}

interface AssetListProps {
  initialAssets: Asset[]
}

export default function AssetList({ initialAssets }: AssetListProps) {
  const [assets, setAssets] = useState(initialAssets)
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory
    const matchesSearch = !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.modelNumber?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search assets by name or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters */}
      <AssetFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No assets found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or add a new asset</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 3: Create Asset Card Component

Create `components/assets/asset-card.tsx`:

```typescript
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AssetCategory } from '@prisma/client'
import { getCategoryIcon, getCategoryColor, formatCategory } from '@/lib/utils/asset-helpers'

type AssetCardProps = {
  asset: {
    id: string
    name: string
    category: AssetCategory
    modelNumber: string | null
    photoUrl: string | null
    home: {
      name: string
    }
    _count: {
      tasks: number
      recurringSchedules: number
    }
  }
}

export default function AssetCard({ asset }: AssetCardProps) {
  const Icon = getCategoryIcon(asset.category)
  const categoryColor = getCategoryColor(asset.category)

  return (
    <Link href={`/assets/${asset.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="aspect-video relative bg-gray-100 rounded-md overflow-hidden">
            {asset.photoUrl ? (
              <Image
                src={asset.photoUrl}
                alt={asset.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{asset.name}</h3>
            <Badge variant="secondary" className={categoryColor}>
              {formatCategory(asset.category)}
            </Badge>
          </div>
          {asset.modelNumber && (
            <p className="text-sm text-gray-600 line-clamp-1">
              Model: {asset.modelNumber}
            </p>
          )}
          <p className="text-xs text-gray-500">{asset.home.name}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between text-xs text-gray-500">
          <span>{asset._count.tasks} tasks</span>
          <span>{asset._count.recurringSchedules} schedules</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

### Step 4: Create Category Filters Component

Create `components/assets/asset-filters.tsx`:

```typescript
'use client'

import { AssetCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { getCategoryIcon, formatCategory } from '@/lib/utils/asset-helpers'

type AssetFiltersProps = {
  selectedCategory: AssetCategory | 'ALL'
  onCategoryChange: (category: AssetCategory | 'ALL') => void
}

const categories: (AssetCategory | 'ALL')[] = [
  'ALL',
  'HVAC',
  'APPLIANCE',
  'PLUMBING',
  'ELECTRICAL',
  'STRUCTURAL',
  'OUTDOOR',
  'OTHER'
]

export default function AssetFilters({ selectedCategory, onCategoryChange }: AssetFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map(category => {
        const Icon = category !== 'ALL' ? getCategoryIcon(category) : null
        const isSelected = selectedCategory === category

        return (
          <Button
            key={category}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className="flex-shrink-0"
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {category === 'ALL' ? 'All' : formatCategory(category)}
          </Button>
        )
      })}
    </div>
  )
}
```

### Step 5: Create Asset Helper Utilities

Create `lib/utils/asset-helpers.ts`:

```typescript
import { AssetCategory } from '@prisma/client'
import {
  Refrigerator,
  Wind,
  Droplets,
  Zap,
  Home,
  Trees,
  Package,
} from 'lucide-react'

export function getCategoryIcon(category: AssetCategory) {
  const icons = {
    APPLIANCE: Refrigerator,
    HVAC: Wind,
    PLUMBING: Droplets,
    ELECTRICAL: Zap,
    STRUCTURAL: Home,
    OUTDOOR: Trees,
    OTHER: Package,
  }
  return icons[category]
}

export function getCategoryColor(category: AssetCategory) {
  const colors = {
    APPLIANCE: 'bg-blue-100 text-blue-800',
    HVAC: 'bg-orange-100 text-orange-800',
    PLUMBING: 'bg-cyan-100 text-cyan-800',
    ELECTRICAL: 'bg-yellow-100 text-yellow-800',
    STRUCTURAL: 'bg-gray-100 text-gray-800',
    OUTDOOR: 'bg-green-100 text-green-800',
    OTHER: 'bg-purple-100 text-purple-800',
  }
  return colors[category]
}

export function formatCategory(category: AssetCategory) {
  return category.charAt(0) + category.slice(1).toLowerCase()
}
```

### Step 6: Create New Asset Page

Create `app/(protected)/assets/new/page.tsx`:

```typescript
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
```

### Step 7: Create Asset Form Component

Create `components/assets/asset-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AssetCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

const assetSchema = z.object({
  homeId: z.string().min(1, 'Home is required'),
  name: z.string().min(1, 'Asset name is required'),
  category: z.nativeEnum(AssetCategory),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  homes: { id: string; name: string }[]
  initialData?: Partial<AssetFormData>
  assetId?: string
}

export default function AssetForm({ homes, initialData, assetId }: AssetFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      homeId: initialData?.homeId || homes[0]?.id,
      category: initialData?.category || 'APPLIANCE',
      ...initialData
    }
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true)

    try {
      const url = assetId ? `/api/assets/${assetId}` : '/api/assets'
      const method = assetId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save asset')
      }

      const asset = await response.json()

      toast({
        title: assetId ? 'Asset updated' : 'Asset created',
        description: `${data.name} has been ${assetId ? 'updated' : 'added'} successfully.`
      })

      router.push(`/assets/${asset.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save asset',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Home Selection */}
      <div>
        <Label htmlFor="homeId">Home *</Label>
        <Select
          value={watch('homeId')}
          onValueChange={(value) => setValue('homeId', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {homes.map(home => (
              <SelectItem key={home.id} value={home.id}>
                {home.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.homeId && (
          <p className="text-sm text-red-600 mt-1">{errors.homeId.message}</p>
        )}
      </div>

      {/* Asset Name */}
      <div>
        <Label htmlFor="name">Asset Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Kitchen Refrigerator"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue('category', value as AssetCategory)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="APPLIANCE">Appliance</SelectItem>
            <SelectItem value="HVAC">HVAC</SelectItem>
            <SelectItem value="PLUMBING">Plumbing</SelectItem>
            <SelectItem value="ELECTRICAL">Electrical</SelectItem>
            <SelectItem value="STRUCTURAL">Structural</SelectItem>
            <SelectItem value="OUTDOOR">Outdoor</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Model Number */}
      <div>
        <Label htmlFor="modelNumber">Model Number</Label>
        <Input
          id="modelNumber"
          {...register('modelNumber')}
          placeholder="e.g., LG LFXS26973S"
        />
      </div>

      {/* Serial Number */}
      <div>
        <Label htmlFor="serialNumber">Serial Number</Label>
        <Input
          id="serialNumber"
          {...register('serialNumber')}
          placeholder="e.g., ABC123456789"
        />
      </div>

      {/* Purchase Date */}
      <div>
        <Label htmlFor="purchaseDate">Purchase Date</Label>
        <Input
          id="purchaseDate"
          type="date"
          {...register('purchaseDate')}
        />
      </div>

      {/* Warranty Expiry */}
      <div>
        <Label htmlFor="warrantyExpiryDate">Warranty Expiry Date</Label>
        <Input
          id="warrantyExpiryDate"
          type="date"
          {...register('warrantyExpiryDate')}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {assetId ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </form>
  )
}
```

### Step 8: Create Asset Detail Page

Create `app/(protected)/assets/[id]/page.tsx`:

```typescript
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
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
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
          template: {
            select: {
              name: true,
              defaultFrequency: true,
            }
          }
        }
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/assets">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Button>
      </Link>

      <AssetDetail asset={asset} />
    </div>
  )
}
```

### Step 9: Create Asset Detail Component

Create `components/assets/asset-detail.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AssetCategory, TaskStatus } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { getCategoryIcon, getCategoryColor, formatCategory } from '@/lib/utils/asset-helpers'
import { Edit, Trash2, Upload, Calendar, Wrench } from 'lucide-react'
import PhotoUploadDialog from './photo-upload-dialog'
import DeleteAssetDialog from './delete-asset-dialog'

type AssetDetailProps = {
  asset: {
    id: string
    name: string
    category: AssetCategory
    modelNumber: string | null
    serialNumber: string | null
    purchaseDate: Date | null
    warrantyExpiryDate: Date | null
    photoUrl: string | null
    createdAt: Date
    home: {
      name: string
    }
    tasks: Array<{
      id: string
      title: string
      dueDate: Date
      status: TaskStatus
      priority: string
    }>
    recurringSchedules: Array<{
      id: string
      frequency: string
      nextDueDate: Date
      template: {
        name: string
      }
    }>
  }
}

export default function AssetDetail({ asset }: AssetDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const Icon = getCategoryIcon(asset.category)
  const categoryColor = getCategoryColor(asset.category)

  const handleEdit = () => {
    router.push(`/assets/${asset.id}/edit`)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-8 w-8 text-gray-600" />
              <h1 className="text-3xl font-bold">{asset.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={categoryColor}>
                {formatCategory(asset.category)}
              </Badge>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{asset.home.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative bg-gray-100 rounded-md overflow-hidden">
              {asset.photoUrl ? (
                <Image
                  src={asset.photoUrl}
                  alt={asset.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-24 w-24 text-gray-300" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowPhotoDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {asset.photoUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.modelNumber && (
              <div>
                <p className="text-sm text-gray-500">Model Number</p>
                <p className="font-medium">{asset.modelNumber}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{asset.serialNumber}</p>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="font-medium">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {asset.warrantyExpiryDate && (
              <div>
                <p className="text-sm text-gray-500">Warranty Expiry</p>
                <p className="font-medium">
                  {new Date(asset.warrantyExpiryDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Added</p>
              <p className="font-medium">
                {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tasks & Schedules Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">
              <Calendar className="h-4 w-4 mr-2" />
              Tasks ({asset.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="schedules">
              <Wrench className="h-4 w-4 mr-2" />
              Schedules ({asset.recurringSchedules.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Upcoming and recent tasks for this asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                {asset.tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks yet</p>
                ) : (
                  <div className="space-y-3">
                    {asset.tasks.map(task => (
                      <div key={task.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={task.status === 'PENDING' ? 'default' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedules" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recurring Schedules</CardTitle>
                <CardDescription>
                  Automated maintenance schedules for this asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                {asset.recurringSchedules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No schedules yet</p>
                ) : (
                  <div className="space-y-3">
                    {asset.recurringSchedules.map(schedule => (
                      <div key={schedule.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{schedule.template.name}</p>
                          <p className="text-sm text-gray-500">
                            {schedule.frequency} • Next: {new Date(schedule.nextDueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PhotoUploadDialog
        assetId={asset.id}
        open={showPhotoDialog}
        onOpenChange={setShowPhotoDialog}
      />
      <DeleteAssetDialog
        assetId={asset.id}
        assetName={asset.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  )
}
```

### Step 10: Create Photo Upload Dialog

Create `components/assets/photo-upload-dialog.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Upload, Loader2 } from 'lucide-react'

interface PhotoUploadDialogProps {
  assetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PhotoUploadDialog({
  assetId,
  open,
  onOpenChange
}: PhotoUploadDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`/api/assets/${assetId}/photo`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload photo')
      }

      toast({
        title: 'Photo uploaded',
        description: 'Asset photo has been updated successfully.'
      })

      router.refresh()
      onOpenChange(false)
      setFile(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
          <DialogDescription>
            Upload a photo of this asset (max 5MB, JPEG/PNG/WebP)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="photo">Select Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <p className="text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Step 11: Create Delete Asset Dialog

Create `components/assets/delete-asset-dialog.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface DeleteAssetDialogProps {
  assetId: string
  assetName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DeleteAssetDialog({
  assetId,
  assetName,
  open,
  onOpenChange
}: DeleteAssetDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete asset')
      }

      toast({
        title: 'Asset deleted',
        description: `${assetName} has been deleted successfully.`
      })

      router.push('/assets')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive'
      })
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Asset</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{assetName}</strong>? This will also delete
            all associated tasks and recurring schedules. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Step 12: Create Edit Asset Page

Create `app/(protected)/assets/[id]/edit/page.tsx`:

```typescript
import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssetForm from '@/components/assets/asset-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EditAssetPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      home: {
        select: {
          userId: true
        }
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

  // Get user's homes for the form
  const homes = await prisma.home.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true }
  })

  const initialData = {
    homeId: asset.homeId,
    name: asset.name,
    category: asset.category,
    modelNumber: asset.modelNumber || undefined,
    serialNumber: asset.serialNumber || undefined,
    purchaseDate: asset.purchaseDate?.toISOString().split('T')[0] || undefined,
    warrantyExpiryDate: asset.warrantyExpiryDate?.toISOString().split('T')[0] || undefined,
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link href={`/assets/${params.id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Asset
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-2">Edit Asset</h1>
      <p className="text-gray-600 mb-8">Update asset information</p>

      <AssetForm homes={homes} initialData={initialData} assetId={params.id} />
    </div>
  )
}
```

## Success Criteria

- ✅ Users can view list of all assets
- ✅ Assets displayed in grid with photos and key info
- ✅ Category filtering works
- ✅ Search by name/model works
- ✅ Users can add new asset with form validation
- ✅ Users can view asset details
- ✅ Users can edit asset information
- ✅ Users can delete asset with confirmation
- ✅ Users can upload asset photos
- ✅ Mobile-responsive design
- ✅ Loading states shown
- ✅ Error handling with toast notifications
- ✅ Protected routes (authentication required)
- ✅ All TypeScript types correct
- ✅ No ESLint errors

## Validation Commands

```bash
# Check TypeScript
npm run typecheck

# Run linter
npm run lint

# Test in browser
# Navigate to http://localhost:3000/assets
```

## Next Steps

After completing Task 3:

- Task 4: Implement Maintenance Templates
- Task 5: Task Management System
- Task 6: Dashboard Enhancement

## Time Estimate

**12-16 hours** (including testing, styling, and refinement)

## Notes

- All components use shadcn/ui for consistency
- Mobile-first responsive design
- Client components for interactivity
- Server components for data fetching
- Toast notifications for user feedback
- Protected routes redirect to signin
- Photo uploads handled client-side with FormData
- Category icons from lucide-react
- HelixIntel brand colors applied

---

**Status**: Ready to execute
**Assigned to**: AI Coding Agent
**Last Updated**: 2025-10-03
