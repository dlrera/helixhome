import { getUserHome } from '@/app/(protected)/settings/actions'
import HomeDetailsForm from '@/components/settings/home-details-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default async function HomeSettingsPage() {
  const home = await getUserHome()

  if (!home) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            No Home Found
          </CardTitle>
          <CardDescription>
            You need to create a home to manage settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Please contact support if you believe this is an error, or create a
            home from the dashboard.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <HomeDetailsForm
      initialData={{
        id: home.id,
        name: home.name,
        address: home.address,
        propertyType: home.propertyType,
        yearBuilt: home.yearBuilt,
        sizeSqFt: home.sizeSqFt,
        climateZone: home.climateZone,
      }}
    />
  )
}
