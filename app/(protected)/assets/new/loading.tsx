import { Skeleton } from '@/components/ui/skeleton'

export default function NewAssetLoading() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Skeleton className="h-10 w-40 mb-4" />

      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />

      {/* Form skeleton */}
      <div className="space-y-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
