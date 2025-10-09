import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Wrench, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'
import { formatFrequency } from '@/lib/utils/template-helpers'

interface UpcomingTask {
  id: string
  title: string
  dueDate: Date
  asset: {
    id: string
    name: string
  } | null
  template: {
    estimatedDurationMinutes: number
  } | null
}

interface UpcomingMaintenanceProps {
  tasks: UpcomingTask[]
}

export default function UpcomingMaintenance({ tasks }: UpcomingMaintenanceProps) {
  const getStatusColor = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return 'bg-red-100 text-red-800'
    if (daysUntilDue <= 3) return 'bg-orange-100 text-orange-800'
    if (daysUntilDue <= 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (dueDate: Date) => {
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return 'Overdue'
    if (daysUntilDue === 0) return 'Due Today'
    if (daysUntilDue === 1) return 'Tomorrow'
    if (daysUntilDue <= 7) return `${daysUntilDue} days`
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#216093]" />
              Upcoming Maintenance
            </CardTitle>
            <CardDescription>
              Scheduled tasks for the next 30 days
            </CardDescription>
          </div>
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No upcoming maintenance scheduled</p>
            <Link href="/templates">
              <Button variant="outline" size="sm">
                Browse Templates
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {task.asset && (
                      <Link
                        href={`/assets/${task.asset.id}`}
                        className="text-sm text-[#216093] hover:underline"
                      >
                        {task.asset.name}
                      </Link>
                    )}
                    {task.template?.estimatedDurationMinutes && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.template.estimatedDurationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={getStatusColor(task.dueDate)}
                >
                  {getStatusText(task.dueDate)}
                </Badge>
              </div>
            ))}
            {tasks.length > 5 && (
              <div className="text-center pt-2">
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    +{tasks.length - 5} more tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}