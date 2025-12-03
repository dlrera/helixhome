'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Mail, Bell, Clock, AlertTriangle } from 'lucide-react'

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  taskReminders: boolean
  maintenanceAlerts: boolean
  weeklyDigest: boolean
}

const STORAGE_KEY = 'helix-notification-preferences'

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  taskReminders: true,
  maintenanceAlerts: true,
  weeklyDigest: false,
}

// Helper to load from localStorage
function loadFromStorage(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultPreferences, ...parsed }
    }
  } catch {
    // Ignore parse errors
  }
  return defaultPreferences
}

export default function NotificationPreferencesForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loaded = loadFromStorage()
    setPreferences(loaded)
    setMounted(true)
  }, [])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))

      toast({
        title: 'Notifications updated',
        description: 'Your notification preferences have been saved.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-32 animate-pulse bg-gray-100 rounded-md" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#216093] mt-0.5" />
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive task reminders and alerts via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-[#216093] mt-0.5" />
              <div className="space-y-0.5">
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Get browser notifications for urgent tasks
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-[#57949A] mt-0.5" />
              <div className="space-y-0.5">
                <Label className="text-base">Task Reminders</Label>
                <p className="text-sm text-gray-500">
                  Reminders for upcoming and overdue tasks
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.taskReminders}
              onCheckedChange={() => handleToggle('taskReminders')}
            />
          </div>

          {/* Maintenance Alerts */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[#E18331] mt-0.5" />
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Alerts</Label>
                <p className="text-sm text-gray-500">
                  Alerts for warranty expirations and seasonal tasks
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.maintenanceAlerts}
              onCheckedChange={() => handleToggle('maintenanceAlerts')}
            />
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#224870] mt-0.5" />
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Digest</Label>
                <p className="text-sm text-gray-500">
                  Summary of completed tasks and upcoming maintenance
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.weeklyDigest}
              onCheckedChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="min-h-[44px] min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}
