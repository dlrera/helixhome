'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Monitor, Moon, Sun, Loader2 } from 'lucide-react'
import { THEMES, CURRENCIES, DATE_FORMATS } from '@/lib/validation/settings'
import { notifyPreferencesChanged } from '@/lib/hooks/use-formatters'

// Local schema for form
const generalSettingsSchema = z.object({
  theme: z.enum(THEMES),
  compactMode: z.boolean(),
  currency: z.enum(CURRENCIES),
  dateFormat: z.enum(DATE_FORMATS),
})

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>

const STORAGE_KEY = 'helix-user-preferences'

const defaultValues: GeneralSettingsFormData = {
  theme: 'system',
  compactMode: false,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
}

export default function GeneralSettingsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues,
  })

  // Load preferences from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        form.reset({ ...defaultValues, ...parsed })

        // Apply theme immediately
        if (parsed.theme) {
          applyTheme(parsed.theme)
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [form])

  const onSubmit = async (data: GeneralSettingsFormData) => {
    setIsLoading(true)
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

      // Apply theme change
      applyTheme(data.theme)

      // Notify other components that preferences have changed
      notifyPreferencesChanged()

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (theme: (typeof THEMES)[number]) => {
    const root = document.documentElement
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how HelixIntel looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-24 animate-pulse bg-gray-100 rounded-md" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how HelixIntel looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    form.setValue('theme', value as (typeof THEMES)[number])
                  }
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors min-h-[44px] ${
                    form.watch('theme') === value
                      ? 'border-[#216093] bg-[#216093]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      form.watch('theme') === value
                        ? 'text-[#216093]'
                        : 'text-gray-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      form.watch('theme') === value
                        ? 'text-[#216093]'
                        : 'text-gray-700'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-500">
                Use smaller spacing throughout the interface
              </p>
            </div>
            <Switch
              checked={form.watch('compactMode')}
              onCheckedChange={(checked) =>
                form.setValue('compactMode', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional</CardTitle>
          <CardDescription>
            Set your currency and date format preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={form.watch('currency')}
              onValueChange={(value) =>
                form.setValue('currency', value as (typeof CURRENCIES)[number])
              }
            >
              <SelectTrigger id="currency" className="min-h-[44px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (&euro;)</SelectItem>
                <SelectItem value="GBP">GBP (&pound;)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select
              value={form.watch('dateFormat')}
              onValueChange={(value) =>
                form.setValue(
                  'dateFormat',
                  value as (typeof DATE_FORMATS)[number]
                )
              }
            >
              <SelectTrigger id="dateFormat" className="min-h-[44px]">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">
                  MM/DD/YYYY (12/31/2024)
                </SelectItem>
                <SelectItem value="DD/MM/YYYY">
                  DD/MM/YYYY (31/12/2024)
                </SelectItem>
                <SelectItem value="YYYY-MM-DD">
                  YYYY-MM-DD (2024-12-31)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
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
    </form>
  )
}
