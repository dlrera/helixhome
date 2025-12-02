'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import RecommendationsWidget from '@/components/templates/recommendations-widget'
import TemplateBrowser from '@/components/templates/template-browser'

// Lazy load the pack details sheet
const TemplatePackDetailsSheet = dynamic(
  () => import('@/components/templates/template-pack-details'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
    ssr: false,
  }
)

interface TemplatesPageClientProps {
  appliedTemplateIds: string[]
}

export function TemplatesPageClient({
  appliedTemplateIds,
}: TemplatesPageClientProps) {
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null)

  const handleViewPack = (packId: string) => {
    setSelectedPackId(packId)
  }

  return (
    <>
      {/* Recommendations Widget */}
      <RecommendationsWidget onViewPack={handleViewPack} />

      {/* Template Browser */}
      <TemplateBrowser appliedTemplateIds={appliedTemplateIds} />

      {/* Pack Details Sheet (opened from recommendations) */}
      {selectedPackId && (
        <TemplatePackDetailsSheet
          packId={selectedPackId}
          open={!!selectedPackId}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedPackId(null)
          }}
        />
      )}
    </>
  )
}
