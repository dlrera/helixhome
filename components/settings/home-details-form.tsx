'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  MapPin,
  Home as HomeIcon,
  Ruler,
  Calendar,
} from 'lucide-react'
import { updateHomeDetails } from '@/app/(protected)/settings/actions'
import { PROPERTY_TYPES, CLIMATE_ZONES } from '@/lib/validation/settings'
import { useTransition } from 'react'

// Form schema
const homeDetailsFormSchema = z.object({
  homeId: z.string().min(1),
  name: z.string().min(1, 'Home name is required').max(100),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  propertyType: z.string().optional(),
  yearBuilt: z.string().optional(),
  sizeSqFt: z.string().optional(),
  climateZone: z.string().optional(),
})

type HomeDetailsFormData = z.infer<typeof homeDetailsFormSchema>

interface HomeDetailsFormProps {
  initialData: {
    id: string
    name: string
    address: {
      street?: string | null
      city?: string | null
      state?: string | null
      zip?: string | null
    } | null
    propertyType: string | null
    yearBuilt: number | null
    sizeSqFt: number | null
    climateZone: string | null
  }
}

export default function HomeDetailsForm({ initialData }: HomeDetailsFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<HomeDetailsFormData>({
    resolver: zodResolver(homeDetailsFormSchema),
    defaultValues: {
      homeId: initialData.id,
      name: initialData.name,
      street: initialData.address?.street || '',
      city: initialData.address?.city || '',
      state: initialData.address?.state || '',
      zip: initialData.address?.zip || '',
      propertyType: initialData.propertyType || '',
      yearBuilt: initialData.yearBuilt?.toString() || '',
      sizeSqFt: initialData.sizeSqFt?.toString() || '',
      climateZone: initialData.climateZone || '',
    },
  })

  const onSubmit = async (data: HomeDetailsFormData) => {
    startTransition(async () => {
      const result = await updateHomeDetails({
        homeId: data.homeId,
        name: data.name,
        address: {
          street: data.street || null,
          city: data.city || null,
          state: data.state || null,
          zip: data.zip || null,
        },
        propertyType:
          (data.propertyType as (typeof PROPERTY_TYPES)[number]) || null,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt, 10) : null,
        sizeSqFt: data.sizeSqFt ? parseInt(data.sizeSqFt, 10) : null,
        climateZone:
          (data.climateZone as (typeof CLIMATE_ZONES)[number]) || null,
      })

      if (result.success) {
        toast({
          title: 'Home details updated',
          description: 'Your property information has been saved.',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update home details.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-[#216093]" />
            Property Information
          </CardTitle>
          <CardDescription>Basic details about your home</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Home Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Home Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="e.g., Main Residence"
              className="min-h-[44px]"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select
              value={form.watch('propertyType') || ''}
              onValueChange={(value) => form.setValue('propertyType', value)}
            >
              <SelectTrigger id="propertyType" className="min-h-[44px]">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year Built */}
            <div className="space-y-2">
              <Label htmlFor="yearBuilt" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Year Built
              </Label>
              <Input
                id="yearBuilt"
                type="number"
                {...form.register('yearBuilt')}
                placeholder="e.g., 1995"
                min="1800"
                max={new Date().getFullYear()}
                className="min-h-[44px]"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="sizeSqFt" className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-500" />
                Size (sq ft)
              </Label>
              <Input
                id="sizeSqFt"
                type="number"
                {...form.register('sizeSqFt')}
                placeholder="e.g., 2400"
                min="1"
                max="100000"
                className="min-h-[44px]"
              />
            </div>
          </div>

          {/* Climate Zone */}
          <div className="space-y-2">
            <Label htmlFor="climateZone">Climate Zone</Label>
            <Select
              value={form.watch('climateZone') || ''}
              onValueChange={(value) => form.setValue('climateZone', value)}
            >
              <SelectTrigger id="climateZone" className="min-h-[44px]">
                <SelectValue placeholder="Select climate zone" />
              </SelectTrigger>
              <SelectContent>
                {CLIMATE_ZONES.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Used for personalized maintenance recommendations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#216093]" />
            Address
          </CardTitle>
          <CardDescription>Your property location</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Street */}
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              {...form.register('street')}
              placeholder="e.g., 123 Main St"
              className="min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...form.register('city')}
                placeholder="City"
                className="min-h-[44px]"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...form.register('state')}
                placeholder="State"
                className="min-h-[44px]"
              />
            </div>

            {/* ZIP */}
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                {...form.register('zip')}
                placeholder="ZIP"
                className="min-h-[44px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] min-w-[120px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}
