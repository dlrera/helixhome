import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'

interface PageProps {
  params: Promise<{ id: string }>
}

// Category icons mapping
const categoryIcons = {
  APPLIANCE: '🔌',
  HVAC: '🏠',
  PLUMBING: '💧',
  ELECTRICAL: '⚡',
  STRUCTURAL: '🏗️',
  OUTDOOR: '🌳',
  OTHER: '🔧'
}

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-orange-100 text-orange-800',
  PROFESSIONAL: 'bg-red-100 text-red-800'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const template = await prisma.maintenanceTemplate.findUnique({
    where: { id },
    select: { name: true }
  })

  return {
    title: template ? `${template.name} - HelixIntel` : 'Template Not Found',
    description: 'View maintenance template details',
  }
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  const { id } = await params

  const template = await prisma.maintenanceTemplate.findUnique({
    where: {
      id,
      isActive: true
    }
  })

  if (!template) {
    notFound()
  }

  // Parse JSON fields
  const instructions = template.instructions ? JSON.parse(template.instructions as string) : []
  const requiredTools = template.requiredTools ? JSON.parse(template.requiredTools as string) : []
  const safetyPrecautions = template.safetyPrecautions ? JSON.parse(template.safetyPrecautions as string) : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/templates">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{categoryIcons[template.category]}</span>
              <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
            </div>
            <p className="text-lg text-gray-600">{template.description}</p>
          </div>
          <Badge className={difficultyColors[template.difficulty]} variant="secondary">
            {template.difficulty.toLowerCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{formatFrequency(template.defaultFrequency)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#216093]" />
              {formatDuration(template.estimatedDurationMinutes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{template.category}</p>
          </CardContent>
        </Card>
      </div>

      {instructions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Instructions
            </CardTitle>
            <CardDescription>Step-by-step guide to complete this maintenance task</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {instructions.map((instruction: string, index: number) => (
                <li key={index} className="flex">
                  <span className="font-semibold text-[#216093] mr-3 min-w-[24px]">{index + 1}.</span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {requiredTools.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#216093]" />
              Required Tools & Materials
            </CardTitle>
            <CardDescription>What you'll need to complete this task</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {requiredTools.map((tool: string, index: number) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-[#216093] rounded-full mr-3"></span>
                  <span className="text-gray-700">{tool}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {safetyPrecautions.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Safety Precautions
            </CardTitle>
            <CardDescription>Important safety information for this task</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safetyPrecautions.map((precaution: string, index: number) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{precaution}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Link href={`/assets?applyTemplate=${template.id}`} className="flex-1">
          <Button className="w-full bg-[#216093] hover:bg-[#1a4d75]">
            Apply to Asset
          </Button>
        </Link>
        <Link href="/templates" className="flex-1">
          <Button variant="outline" className="w-full">
            Browse More Templates
          </Button>
        </Link>
      </div>
    </div>
  )
}