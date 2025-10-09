import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and application preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-[#216093]" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Settings features are planned for future development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is not part of the Core MVP but will be added in future releases. Expected features:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>Notification preferences (email, push, SMS)</li>
            <li>Default home selection</li>
            <li>Theme customization</li>
            <li>Data export and backup</li>
            <li>Account management and security</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
