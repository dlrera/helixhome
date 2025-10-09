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

      // Show optimistic toast immediately
      toast({
        title: assetId ? 'Saving changes...' : 'Creating asset...',
        description: 'Please wait'
      })

      // For updates, exclude homeId from the request body
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { homeId, ...updateData } = data
      const requestData = assetId ? updateData : data

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
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
