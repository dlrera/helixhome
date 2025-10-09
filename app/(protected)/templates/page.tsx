import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TemplateBrowser from '@/components/templates/template-browser'
import { Suspense } from 'react'
import TemplateSkeleton from '@/components/templates/template-skeleton'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export const metadata: Metadata = {
  title: 'Maintenance Templates - HelixIntel',
  description: 'Browse and apply maintenance templates to your assets',
}

async function getAppliedTemplates(userId: string) {
  try {
    const schedules = await prisma.recurringSchedule.findMany({
      where: {
        asset: {
          home: {
            userId
          }
        },
        isActive: true
      },
      select: {
        templateId: true
      }
    })
    return schedules.map(s => s.templateId)
  } catch (error) {
    console.error('Error fetching applied templates:', error)
    return []
  }
}

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch applied template IDs for the current user
  const appliedTemplateIds = await getAppliedTemplates(session.user.id)

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Maintenance Templates' }
        ]}
      />

      <div className="border-b pb-6">
        <h1 className="text-4xl font-black text-gray-900 mb-3">Maintenance Templates</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Browse our library of 20+ pre-built maintenance templates to keep your home in top condition.
          Apply templates to your assets to automatically schedule recurring maintenance tasks.
        </p>
        {appliedTemplateIds.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{appliedTemplateIds.length} template{appliedTemplateIds.length !== 1 ? 's' : ''} currently applied</span>
          </div>
        )}
      </div>

      <Suspense fallback={<TemplateSkeleton />}>
        <TemplateBrowser appliedTemplateIds={appliedTemplateIds} />
      </Suspense>
    </div>
  )
}
