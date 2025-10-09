import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          View and manage your notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-[#216093]" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Notification features are under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This feature will be available in Task 8 of the MVP. You'll be able to:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>View all your notifications in one place</li>
            <li>Filter by notification type (tasks, maintenance, system)</li>
            <li>Mark notifications as read</li>
            <li>Receive email notifications for important events</li>
            <li>Configure notification preferences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
