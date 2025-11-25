'use client'

import { useState } from 'react'
import { Task, Asset, MaintenanceTemplate } from '@prisma/client'
import { TaskCalendar } from '@/components/tasks/task-calendar'
import { TaskFilterBar } from '@/components/tasks/task-filter-bar'
import { Button } from '@/components/ui/button'
import { List, Plus } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QuickTaskForm } from '@/components/tasks/quick-task-form'
import type { TaskFilterInput } from '@/lib/validation/task'

interface TaskWithRelations extends Task {
  asset?: Asset | null
  template?: MaintenanceTemplate | null
}

interface TaskCalendarClientProps {
  tasks: TaskWithRelations[]
  requireCompletionPhoto: boolean
}

export function TaskCalendarClient({ tasks, requireCompletionPhoto }: TaskCalendarClientProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [homeId, setHomeId] = useState<string | null>(null)
  const [assets, setAssets] = useState<{ id: string; name: string; category: string }[]>([])
  const [filters, setFilters] = useState<Partial<TaskFilterInput>>({})

  // Get user's home ID and assets
  useState(() => {
    fetch('/api/homes')
      .then((res) => res.json())
      .then((data) => {
        if (data.homes && data.homes.length > 0) {
          setHomeId(data.homes[0].id)
          // Fetch assets for this home
          fetch(`/api/assets?homeId=${data.homes[0].id}`)
            .then((res) => res.json())
            .then((assetData) => {
              if (assetData.assets) {
                setAssets(
                  assetData.assets.map((a: { id: string; name: string; category: string }) => ({
                    id: a.id,
                    name: a.name,
                    category: a.category,
                  }))
                )
              }
            })
            .catch(() => {
              // Handle error silently
            })
        }
      })
      .catch(() => {
        // Handle error silently
      })
  })

  const handleFilterChange = (newFilters: Partial<TaskFilterInput>) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Task Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View all your tasks in calendar format
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tasks">
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </Link>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        showSearch
      />

      <TaskCalendar
        tasks={tasks}
        requireCompletionPhoto={requireCompletionPhoto}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          {homeId && (
            <QuickTaskForm
              homeId={homeId}
              assets={assets}
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Mobile FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
        size="icon"
        onClick={() => setShowCreateDialog(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
