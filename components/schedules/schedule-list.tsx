'use client'

import { useState, useEffect } from 'react'
import ScheduleCard from './schedule-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Schedule {
  id: string
  frequency: any
  customFrequencyDays?: number | null
  nextDueDate: Date
  lastCompletedDate?: Date | null
  isActive: boolean
  template: {
    id: string
    name: string
    description?: string
    estimatedDurationMinutes?: number
  }
  asset?: {
    id: string
    name: string
    category: string
  }
}

interface ScheduleListProps {
  assetId?: string
  initialSchedules?: Schedule[]
}

export default function ScheduleList({ assetId, initialSchedules = [] }: ScheduleListProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused'>('active')

  useEffect(() => {
    // Always fetch fresh data to get both active and inactive schedules
    fetchSchedules()
  }, [assetId])

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (assetId) params.append('assetId', assetId)
      // Fetch all schedules (both active and inactive) so we can show them in tabs
      params.append('includeInactive', 'true')

      const response = await fetch(`/api/schedules?${params}`)
      if (!response.ok) throw new Error('Failed to fetch schedules')

      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleUpdate = () => {
    fetchSchedules()
  }

  const filteredSchedules = schedules.filter(schedule => {
    if (activeTab === 'active') return schedule.isActive
    if (activeTab === 'paused') return !schedule.isActive
    return true
  })

  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const dueDate = new Date(schedule.nextDueDate)
    const now = new Date()
    const daysUntil = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let group = 'Upcoming'
    if (daysUntil < 0) group = 'Overdue'
    else if (daysUntil === 0) group = 'Due Today'
    else if (daysUntil <= 7) group = 'This Week'
    else if (daysUntil <= 30) group = 'This Month'

    if (!groups[group]) groups[group] = []
    groups[group].push(schedule)
    return groups
  }, {} as Record<string, Schedule[]>)

  const groupOrder = ['Overdue', 'Due Today', 'This Week', 'This Month', 'Upcoming']

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading schedules...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No Maintenance Schedules</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {assetId
                ? "Apply templates to this asset to create recurring schedules"
                : "Apply templates to your assets to create recurring maintenance schedules"}
            </p>
            <Link href="/templates">
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.length > 0 && (
        <Tabs defaultValue="active" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({schedules.filter(s => s.isActive).length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({schedules.filter(s => !s.isActive).length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({schedules.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {filteredSchedules.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                No {activeTab === 'active' ? 'active' : activeTab === 'paused' ? 'paused' : ''} schedules
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupOrder.map(groupName => {
            const group = groupedSchedules[groupName]
            if (!group || group.length === 0) return null

            return (
              <div key={groupName}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {groupName} ({group.length})
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.map(schedule => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onUpdate={handleScheduleUpdate}
                      showAsset={!assetId}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}