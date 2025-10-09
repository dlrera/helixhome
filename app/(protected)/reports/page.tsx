import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">
          Analytics and insights for your home maintenance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-[#216093]" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Reporting features are planned for future development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature is not part of the Core MVP but will be added in future releases. Expected features:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>Maintenance cost tracking and analysis</li>
            <li>Task completion rates and trends</li>
            <li>Asset lifecycle and warranty status reports</li>
            <li>Export reports to PDF or CSV</li>
            <li>Custom date range filtering</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
