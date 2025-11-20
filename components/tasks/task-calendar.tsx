'use client'

import { useState } from 'react'
import { Task, Priority, TaskStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, Circle, ArrowUp } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay
} from 'date-fns'
import { getTaskPriorityColor, isTaskOverdue, getPriorityLabel, getStatusLabel } from '@/lib/utils/task-helpers'
import { TaskDetailDrawer } from './task-detail-drawer'
import type { TaskFilterInput } from '@/lib/validation/task'

interface TaskCalendarProps {
  tasks: Task[]
  view?: 'month' | 'week'
  onViewChange?: (view: 'month' | 'week') => void
  requireCompletionPhoto?: boolean
  filters?: Partial<TaskFilterInput>
  onFilterChange?: (filters: Partial<TaskFilterInput>) => void
}

// Priority icon mapping with colors
const getPriorityIcon = (priority: Priority) => {
  switch (priority) {
    case 'URGENT':
      return <AlertCircle className="h-3 w-3 text-red-600" />
    case 'HIGH':
      return <ArrowUp className="h-3 w-3 text-orange-600" />
    case 'MEDIUM':
      return <Circle className="h-3 w-3 text-blue-600" />
    case 'LOW':
      return <Circle className="h-3 w-3 text-gray-400" />
  }
}

export function TaskCalendar({
  tasks,
  view: initialView = 'month',
  onViewChange,
  requireCompletionPhoto = false,
  filters = {},
  onFilterChange
}: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>(initialView)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(task.status)) return false
    }
    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) return false
    }
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchLower)
      const matchesDescription = task.description?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesDescription) return false
    }
    return true
  })

  const handleViewChange = (newView: 'month' | 'week') => {
    setView(newView)
    onViewChange?.(newView)
  }

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDrawerOpen(true)
  }

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const weekStart = view === 'week' ? startOfWeek(currentDate) : startOfWeek(monthStart)
  const weekEnd = view === 'week' ? endOfWeek(currentDate) : endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Group filtered tasks by date
  const tasksByDate = filteredTasks.reduce((acc, task) => {
    const dateKey = format(startOfDay(new Date(task.dueDate)), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    const dateKey = format(startOfDay(day), 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] sm:min-w-[200px] text-center">
            <h2 className="text-lg sm:text-xl font-bold">
              {view === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(weekStart, 'MMM d, yyyy')}`}
            </h2>
          </div>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => handleViewChange('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => handleViewChange('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className={`grid grid-cols-7 gap-1 sm:gap-2 ${view === 'week' ? 'min-h-[400px] sm:min-h-[600px]' : ''}`}>
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDay(day)
            const isDayToday = isToday(day)
            const isCurrentMonth = view === 'month' ? isSameMonth(day, currentDate) : true
            const hasOverdueTasks = dayTasks.some((t) => isTaskOverdue(t) && t.status === 'PENDING')

            return (
              <div
                key={day.toISOString()}
                className={`${view === 'week' ? 'min-h-[400px] sm:min-h-[600px]' : 'min-h-[100px] sm:min-h-[120px]'} border rounded-md p-1 sm:p-2 ${
                  isDayToday ? 'bg-blue-50 border-blue-300' : 'bg-background'
                } ${!isCurrentMonth ? 'opacity-40' : ''} ${
                  hasOverdueTasks ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isDayToday
                        ? 'bg-[#216093] text-white rounded-full w-6 h-6 flex items-center justify-center'
                        : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1">
                      {dayTasks.length}
                    </Badge>
                  )}
                </div>

                {/* Task List */}
                <div className="space-y-1">
                  {dayTasks.slice(0, view === 'week' ? 20 : 3).map((task) => {
                    const overdue = isTaskOverdue(task) && task.status === 'PENDING'
                    const tooltipText = `${task.title}\nPriority: ${getPriorityLabel(task.priority)}\nStatus: ${getStatusLabel(task.status)}`

                    return (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`w-full text-left text-xs p-1.5 rounded transition-colors ${
                          overdue ? 'bg-red-100 hover:bg-red-200' : 'bg-muted hover:bg-muted/80'
                        }`}
                        title={tooltipText}
                      >
                        <div className="flex items-center gap-1.5">
                          {getPriorityIcon(task.priority)}
                          <span className="truncate">{task.title}</span>
                        </div>
                      </button>
                    )
                  })}
                  {dayTasks.length > (view === 'week' ? 20 : 3) && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayTasks.length - (view === 'week' ? 20 : 3)} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedTask(null)
        }}
        requireCompletionPhoto={requireCompletionPhoto}
      />
    </div>
  )
}
