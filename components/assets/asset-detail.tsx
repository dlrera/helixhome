'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  AssetCategory,
  TaskStatus,
  Frequency,
  Difficulty,
} from '@prisma/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getCategoryIcon,
  getCategoryColor,
  formatCategory,
} from '@/lib/utils/asset-helpers'
import {
  Edit,
  Trash2,
  Upload,
  Calendar,
  Wrench,
  Plus,
  Clock,
  Sparkles,
  FileText,
  Download,
} from 'lucide-react'
import PhotoUploadDialog from './photo-upload-dialog'
import DeleteAssetDialog from './delete-asset-dialog'
import ApplyTemplateModal from '@/components/templates/apply-template-modal'
import { formatDuration, formatFrequency } from '@/lib/utils/template-helpers'
import ScheduleList from '@/components/schedules/schedule-list'
import Link from 'next/link'

type SuggestedTemplate = {
  id: string
  name: string
  description: string
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
}

type AssetDetailProps = {
  asset: {
    id: string
    name: string
    category: AssetCategory
    modelNumber: string | null
    serialNumber: string | null
    purchaseDate: Date | null
    warrantyExpiryDate: Date | null
    photoUrl: string | null
    manualUrl: string | null
    createdAt: Date
    home: {
      name: string
    }
    tasks: Array<{
      id: string
      title: string
      dueDate: Date
      status: TaskStatus
      priority: string
    }>
    recurringSchedules: Array<{
      id: string
      frequency: string
      nextDueDate: Date
      isActive: boolean
      template: {
        id: string
        name: string
        description?: string
        estimatedDurationMinutes?: number
      }
    }>
  }
  suggestedTemplates?: SuggestedTemplate[]
}

export default function AssetDetail({
  asset,
  suggestedTemplates = [],
}: AssetDetailProps) {
  const router = useRouter()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<SuggestedTemplate | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)

  const Icon = getCategoryIcon(asset.category)
  const categoryColor = getCategoryColor(asset.category)

  const handleEdit = () => {
    router.push(`/assets/${asset.id}/edit`)
  }

  const handleApplyTemplate = (template: SuggestedTemplate) => {
    console.log('Opening modal for template:', template)
    setSelectedTemplate(template)
    setShowApplyModal(true)
  }

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-orange-100 text-orange-800',
    PROFESSIONAL: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Icon className="h-8 w-8 text-gray-600" />
              <h1 className="text-3xl font-bold">{asset.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={categoryColor}>
                {formatCategory(asset.category)}
              </Badge>
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">{asset.home.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`relative bg-gray-100 rounded-md overflow-hidden ${asset.photoUrl ? 'aspect-video' : 'h-32'}`}
            >
              {asset.photoUrl ? (
                <Image
                  src={asset.photoUrl}
                  alt={asset.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowPhotoDialog(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {asset.photoUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </CardContent>
        </Card>

        {/* Manual / Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Manual / Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            {asset.manualUrl ? (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-[#216093]" />
                  <div>
                    <p className="font-medium">Asset Manual</p>
                    <p className="text-sm text-gray-500">
                      View or download the manual
                    </p>
                  </div>
                </div>
                <a
                  href={asset.manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 mb-2">No manual uploaded</p>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Manual
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.modelNumber && (
              <div>
                <p className="text-sm text-gray-500">Model Number</p>
                <p className="font-medium">{asset.modelNumber}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium">{asset.serialNumber}</p>
              </div>
            )}
            {asset.purchaseDate && (
              <div>
                <p className="text-sm text-gray-500">Purchase Date</p>
                <p className="font-medium">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {asset.warrantyExpiryDate && (
              <div>
                <p className="text-sm text-gray-500">Warranty Expiry</p>
                <p className="font-medium">
                  {new Date(asset.warrantyExpiryDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Added</p>
              <p className="font-medium">
                {new Date(asset.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Templates */}
        {suggestedTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#216093]" />
                    Suggested Maintenance Templates
                  </CardTitle>
                  <CardDescription>
                    Recommended maintenance for your{' '}
                    {formatCategory(asset.category).toLowerCase()}
                  </CardDescription>
                </div>
                <Link href="/templates">
                  <Button variant="outline" size="sm">
                    Browse All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {suggestedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {formatFrequency(template.defaultFrequency)}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(template.estimatedDurationMinutes)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={difficultyColors[template.difficulty]}
                        >
                          {template.difficulty.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyTemplate(template)}
                      className="bg-[#216093] hover:bg-[#1a4d75]"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks & Schedules Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">
              <Calendar className="h-4 w-4 mr-2" />
              Tasks ({asset.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="schedules">
              <Wrench className="h-4 w-4 mr-2" />
              Schedules ({asset.recurringSchedules.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Upcoming and recent tasks for this asset
                </CardDescription>
              </CardHeader>
              <CardContent>
                {asset.tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks yet</p>
                ) : (
                  <div className="space-y-3">
                    {asset.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex justify-between items-center p-3 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.status === 'PENDING' ? 'default' : 'secondary'
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="schedules" className="mt-4">
            <ScheduleList
              assetId={asset.id}
              initialSchedules={asset.recurringSchedules}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PhotoUploadDialog
        assetId={asset.id}
        open={showPhotoDialog}
        onOpenChange={setShowPhotoDialog}
      />
      <DeleteAssetDialog
        assetId={asset.id}
        assetName={asset.name}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
      {selectedTemplate && (
        <ApplyTemplateModal
          template={selectedTemplate}
          assetId={asset.id}
          assetName={asset.name}
          open={showApplyModal}
          onOpenChange={(open) => {
            setShowApplyModal(open)
            if (!open) {
              setSelectedTemplate(null)
            }
          }}
        />
      )}
    </>
  )
}
