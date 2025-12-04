import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Header */}
      <div className="border-b pb-6">
        <Skeleton className="h-10 w-80 mb-3" />
        <Skeleton className="h-5 w-full max-w-2xl mb-2" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
        <Skeleton className="h-8 w-48 mt-4 rounded-full" />
      </div>

      {/* Browse Mode Toggle */}
      <div className="flex items-center justify-center sm:justify-start">
        <Skeleton className="h-12 w-64 rounded-lg" />
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-24 rounded-lg" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-full min-h-[320px] flex flex-col">
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
              <div className="mt-4 space-y-2">
                <Skeleton className="h-11 w-full rounded-md" />
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-11 w-28" />
        <Skeleton className="h-11 w-11" />
        <Skeleton className="h-11 w-11" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  )
}
