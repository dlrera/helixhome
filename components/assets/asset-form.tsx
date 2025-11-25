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
import { FileUpload } from '@/components/file-upload'

const assetSchema = z.object({
  homeId: z.string().min(1, 'Home is required'),
  name: z.string().min(1, 'Asset name is required'),
  category: z.nativeEnum(AssetCategory),
  location: z.string().optional().transform(val => val === '' ? undefined : val),
  modelNumber: z.string().optional().transform(val => val === '' ? undefined : val),
  serialNumber: z.string().optional().transform(val => val === '' ? undefined : val),
  purchaseDate: z.string().optional().transform(val => val === '' ? undefined : val),
  warrantyExpiryDate: z.string().optional().transform(val => val === '' ? undefined : val),
  photoUrl: z.string().optional(),
  manualUrl: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  homes: { id: string; name: string }[]
  initialData?: Partial<AssetFormData>
  assetId?: string
}

export default function AssetForm({
  homes,
  initialData,
  assetId,
}: AssetFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [manualFile, setManualFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      homeId: initialData?.homeId || homes[0]?.id,
      category: initialData?.category || 'APPLIANCE',
      ...initialData,
    },
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true)

    try {
      // Show optimistic toast immediately
      toast({
        title: assetId ? 'Saving changes...' : 'Creating asset...',
        description: 'Please wait',
      })

      // First, create or update the asset to get the ID
      const url = assetId ? `/api/assets/${assetId}` : '/api/assets'
      const method = assetId ? 'PUT' : 'POST'

      // For updates, exclude homeId from the request body
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { homeId, photoUrl, manualUrl, ...updateData } = data
      const requestData = assetId ? updateData : { homeId, ...updateData }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save asset')
      }

      const asset = await response.json()
      const actualAssetId = asset.id

      // Upload files if they exist
      let uploadedPhotoUrl = data.photoUrl
      let uploadedManualUrl = data.manualUrl

      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('file', imageFile)
        imageFormData.append('assetId', actualAssetId)

        const imageResponse = await fetch('/api/assets/upload-image', {
          method: 'POST',
          body: imageFormData,
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()
          uploadedPhotoUrl = imageData.url
        }
      }

      if (manualFile) {
        const manualFormData = new FormData()
        manualFormData.append('file', manualFile)
        manualFormData.append('assetId', actualAssetId)

        const manualResponse = await fetch('/api/assets/upload-manual', {
          method: 'POST',
          body: manualFormData,
        })

        if (manualResponse.ok) {
          const manualData = await manualResponse.json()
          uploadedManualUrl = manualData.url
        }
      }

      // Update asset with file URLs if files were uploaded
      if (
        (imageFile && uploadedPhotoUrl) ||
        (manualFile && uploadedManualUrl)
      ) {
        await fetch(`/api/assets/${actualAssetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoUrl: uploadedPhotoUrl,
            manualUrl: uploadedManualUrl,
          }),
        })
      }

      toast({
        title: assetId ? 'Asset updated' : 'Asset created',
        description: `${data.name} has been ${assetId ? 'updated' : 'added'} successfully.`,
      })

      router.push(`/assets/${actualAssetId}`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save asset',
        variant: 'destructive',
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
            {homes.map((home) => (
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
          onValueChange={(value) =>
            setValue('category', value as AssetCategory)
          }
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

      {/* Location */}
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          placeholder="e.g., Kitchen, Master Bedroom, Garage"
        />
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
        <Input id="purchaseDate" type="date" {...register('purchaseDate')} />
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

      {/* Asset Photo */}
      <div>
        <Label>Asset Photo</Label>
        <FileUpload
          type="image"
          currentFileUrl={initialData?.photoUrl}
          onUploadComplete={(file) => {
            if (file instanceof File) {
              setImageFile(file)
            } else if (typeof file === 'string') {
              setImageFile(null)
              setValue('photoUrl', file)
            }
          }}
          disabled={isSubmitting}
        />
      </div>

      {/* Asset Manual */}
      <div>
        <Label>Asset Manual / Documentation</Label>
        <FileUpload
          type="manual"
          currentFileUrl={initialData?.manualUrl}
          onUploadComplete={(file) => {
            if (file instanceof File) {
              setManualFile(file)
            } else if (typeof file === 'string') {
              setManualFile(null)
              setValue('manualUrl', file)
            }
          }}
          disabled={isSubmitting}
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
