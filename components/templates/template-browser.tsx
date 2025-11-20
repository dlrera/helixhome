'use client'

import React, { useState, useEffect, useRef, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useViewMode } from '@/lib/hooks/use-local-storage'
import { KeyboardShortcutsDialog } from '@/components/ui/keyboard-shortcuts-dialog'

// Lazy load heavy components
const ApplyTemplateModal = dynamic(() => import('./apply-template-modal'), {
  loading: () => <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
})

const TemplateDetailsDrawer = dynamic(() => import('./template-details-drawer'), {
  loading: () => <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>,
  ssr: false
})
import {
  Clock,
  Search,
  Wrench,
  Home,
  Droplets,
  Zap,
  Building,
  Trees,
  Package,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { AssetCategory, Difficulty, Frequency } from '@prisma/client'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'

// Category icons mapping
const categoryIcons = {
  APPLIANCE: Package,
  HVAC: Home,
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  STRUCTURAL: Building,
  OUTDOOR: Trees,
  OTHER: Wrench
}

// Difficulty colors with hover states
const difficultyColors = {
  EASY: 'bg-green-100 text-green-800 hover:bg-green-200 transition-colors',
  MODERATE: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors',
  HARD: 'bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors',
  PROFESSIONAL: 'bg-red-100 text-red-800 hover:bg-red-200 transition-colors'
}

interface Template {
  id: string
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  isSystemTemplate: boolean
  isApplied?: boolean // Track if template is applied to any asset
}

interface TemplateBrowserProps {
  appliedTemplateIds?: string[] // IDs of templates already applied
}

export default function TemplateBrowser({ appliedTemplateIds = [] }: TemplateBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Use custom hook for persistent view mode preference
  const [viewMode, setViewMode] = useViewMode('helix-templates-view-mode', 'grid')

  const [currentPage, setCurrentPage] = useState(1)
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const [isPullToRefresh, setIsPullToRefresh] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const itemsPerPage = 12

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch templates with optimized caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['templates', selectedCategory, debouncedSearchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory)
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery)

      const response = await fetch(`/api/templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch templates')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache retention (was cacheTime in v4)
    refetchOnWindowFocus: false, // Don't refetch on window focus for stable UX
  })

  // Memoize templates with applied status
  const templates: Template[] = useMemo(() =>
    (data?.templates || []).map((t: Template) => ({
      ...t,
      isApplied: appliedTemplateIds.includes(t.id)
    })),
    [data?.templates, appliedTemplateIds]
  )

  // Memoize pagination logic
  const totalPages = useMemo(() => Math.ceil(templates.length / itemsPerPage), [templates.length, itemsPerPage])
  const paginatedTemplates = useMemo(() =>
    templates.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [templates, currentPage, itemsPerPage]
  )

  // Reset page when filters change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as any)
    setCurrentPage(1)
    setSelectedIndex(-1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    setSelectedIndex(-1)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // / for search focus (like GitHub, Reddit, etc.)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }

      // G for grid view
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        setViewMode('grid')
      }

      // L for list view
      if (e.key === 'l' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT') {
        setViewMode('list')
      }

      // Arrow navigation
      if (paginatedTemplates.length > 0 && document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, paginatedTemplates.length - 1))
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
        }
        if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault()
          const template = paginatedTemplates[selectedIndex]
          if (template) {
            setSelectedTemplateId(template.id)
          }
        }
        if (e.key === ' ' && selectedIndex >= 0) {
          e.preventDefault()
          const template = paginatedTemplates[selectedIndex]
          if (template && !template.isApplied) {
            window.location.href = `/assets?applyTemplate=${template.id}`
          }
        }
      }

      // Page navigation
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault()
        setCurrentPage(p => Math.max(1, p - 1))
      }
      if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault()
        setCurrentPage(p => Math.min(totalPages, p + 1))
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [paginatedTemplates, selectedIndex, totalPages])

  // Pull to refresh on mobile
  useEffect(() => {
    let startY = 0
    let isPulling = false

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY
        isPulling = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY

      if (diff > 100 && !isPullToRefresh) {
        setIsPullToRefresh(true)
        navigator.vibrate && navigator.vibrate(10) // Haptic feedback
      }
    }

    const handleTouchEnd = async () => {
      if (isPullToRefresh) {
        await refetch()
        setIsPullToRefresh(false)
      }
      isPulling = false
    }

    // Only add on mobile devices
    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isPullToRefresh, refetch])

  // Define keyboard shortcuts for the dialog
  const keyboardShortcuts = [
    { key: 'Ctrl+K', description: 'Open global search', category: 'Global' },
    { key: '/', description: 'Focus template search', category: 'Search' },
    { key: 'G', description: 'Switch to grid view', category: 'View' },
    { key: 'L', description: 'Switch to list view', category: 'View' },
    { key: '↑', description: 'Navigate up', category: 'Navigation' },
    { key: '↓', description: 'Navigate down', category: 'Navigation' },
    { key: 'Enter', description: 'View template details', category: 'Navigation' },
    { key: 'Space', description: 'Apply selected template', category: 'Actions' },
    { key: 'Alt+←', description: 'Previous page', category: 'Pagination' },
    { key: 'Alt+→', description: 'Next page', category: 'Pagination' },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        shortcuts={keyboardShortcuts}
        title="Template Browser Shortcuts"
        description="Use these keyboard shortcuts to browse templates faster"
      />

      {/* Pull to refresh indicator */}
      {isPullToRefresh && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center py-4 bg-white shadow-md animate-pulse sm:hidden">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing templates...
          </div>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search templates... (Press /)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'grid' | 'list')}>
          <ToggleGroupItem value="grid" aria-label="Grid view" className="min-w-[44px] min-h-[44px]">
            <LayoutGrid className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view" className="min-w-[44px] min-h-[44px]">
            <ListIcon className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        <TabsList className="flex flex-wrap h-auto items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1">
          <TabsTrigger value="ALL" className="px-3">All</TabsTrigger>
          <TabsTrigger value="HVAC" className="px-3">HVAC</TabsTrigger>
          <TabsTrigger value="PLUMBING" className="px-3">Plumbing</TabsTrigger>
          <TabsTrigger value="APPLIANCE" className="px-3">Appliances</TabsTrigger>
          <TabsTrigger value="ELECTRICAL" className="px-3">Electrical</TabsTrigger>
          <TabsTrigger value="STRUCTURAL" className="px-3">Structural</TabsTrigger>
          <TabsTrigger value="OUTDOOR" className="px-3">Outdoor</TabsTrigger>
          <TabsTrigger value="OTHER" className="px-3">Other</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-full min-h-[320px] flex flex-col animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Skeleton className="h-9 flex-1 rounded-md" />
                        <Skeleton className="h-9 flex-1 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-full max-w-md mb-2" />
                          <div className="flex gap-4">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Skeleton className="h-9 w-20 rounded-md" />
                        <Skeleton className="h-9 w-20 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : error ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-red-600">Error loading templates. Please try again.</p>
              </CardContent>
            </Card>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No templates found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Template Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-300">
                  {paginatedTemplates.map((template, index) => {
                    const Icon = categoryIcons[template.category]

                    return (
                      <Card
                        key={template.id}
                        className={`relative h-full min-h-[320px] flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-in fade-in slide-in-from-bottom-2 bg-gradient-to-br from-white to-gray-50/50 ${template.isApplied ? 'border-2 border-green-500 hover:border-green-600' : 'hover:border-[#216093]/30'}`}
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-[#216093]/10 rounded-[8px] group-hover:bg-[#216093]/20 transition-colors duration-300">
                                <Icon className="h-6 w-6 text-[#216093] group-hover:scale-110 transition-transform duration-300" />
                              </div>
                              {template.isApplied && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <Badge
                              className={`${difficultyColors[template.difficulty]} font-medium`}
                              variant="secondary"
                            >
                              {template.difficulty.charAt(0) + template.difficulty.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Frequency:</span>
                              <Badge variant="outline" className="font-medium">
                                {formatFrequency(template.defaultFrequency)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Duration:</span>
                              <span className="font-medium flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                {formatDuration(template.estimatedDurationMinutes)}
                              </span>
                            </div>
                            {template.isApplied && (
                              <Badge
                                variant="outline"
                                className="w-full justify-center text-green-600 border-green-600 bg-green-50"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Applied to asset
                              </Badge>
                            )}
                          </div>
                          <div className="mt-4 space-y-2">
                            <Button
                              size="default"
                              className={`w-full font-semibold transition-all duration-200 min-h-[44px] hover:scale-[1.02] active:scale-[0.98] ${
                                template.isApplied
                                  ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                                  : 'bg-[#216093] hover:bg-[#1a4d75] shadow-lg hover:shadow-xl'
                              }`}
                              onClick={() => {
                                setLoadingTemplateId(template.id + '_apply')
                                window.location.href = `/assets?applyTemplate=${template.id}`
                              }}
                              disabled={loadingTemplateId === template.id + '_apply' || template.isApplied}
                            >
                              {loadingTemplateId === template.id + '_apply' ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : template.isApplied ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Applied to Asset
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Apply Template
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 min-h-[44px] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                              onClick={() => {
                                setSelectedTemplateId(template.id)
                              }}
                            >
                              {loadingTemplateId === template.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  View Details
                                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {paginatedTemplates.map((template, index) => {
                    const Icon = categoryIcons[template.category]

                    return (
                      <Card
                        key={template.id}
                        className={`shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-left-2 ${template.isApplied ? 'border-2 border-green-500 hover:border-green-600' : 'hover:border-[#216093]/30'}`}
                        style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'backwards' }}
                      >
                        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="p-2 bg-[#216093]/10 rounded-lg">
                                <Icon className="h-6 w-6 text-[#216093]" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-base truncate">{template.name}</h3>
                                <Badge
                                  className={`${difficultyColors[template.difficulty]} text-xs font-medium`}
                                  variant="secondary"
                                >
                                  {template.difficulty.charAt(0) + template.difficulty.slice(1).toLowerCase()}
                                </Badge>
                                {template.isApplied && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-green-600 border-green-600 bg-green-50"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Applied
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1 mb-2">{template.description}</p>
                              <div className="flex gap-4 flex-wrap">
                                <Badge variant="outline" className="text-xs font-medium">
                                  {formatFrequency(template.defaultFrequency)}
                                </Badge>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                                  {formatDuration(template.estimatedDurationMinutes)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                              onClick={() => {
                                setSelectedTemplateId(template.id)
                              }}
                            >
                              {loadingTemplateId === template.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  Details
                                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </>
                              )}
                            </Button>
                            <Button
                              size="default"
                              className={`font-semibold min-w-[120px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                template.isApplied
                                  ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                                  : 'bg-[#216093] hover:bg-[#1a4d75] shadow-md hover:shadow-lg'
                              }`}
                              onClick={() => {
                                setLoadingTemplateId(template.id + '_apply')
                                window.location.href = `/assets?applyTemplate=${template.id}`
                              }}
                              disabled={loadingTemplateId === template.id + '_apply' || template.isApplied}
                            >
                              {loadingTemplateId === template.id + '_apply' ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : template.isApplied ? (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="min-w-[120px] min-h-[44px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="default"
                        className={`min-w-[44px] min-h-[44px] p-0 transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${page === currentPage ? 'bg-[#216093]' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="min-w-[120px] min-h-[44px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Details Drawer */}
      {selectedTemplateId && (
        <TemplateDetailsDrawer
          templateId={selectedTemplateId}
          open={!!selectedTemplateId}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedTemplateId(null)
          }}
        />
      )}
    </div>
  )
}