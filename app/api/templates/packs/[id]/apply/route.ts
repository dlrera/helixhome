import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateNextDueDate } from '@/lib/utils/template-helpers'
import { logTemplateApplied } from '@/lib/utils/activity-logger'
import { TaskStatus, Priority, Frequency } from '@prisma/client'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Validation schema for batch apply
const batchApplySchema = z.object({
  assetId: z.string().optional(),
  isWholeHome: z.boolean().default(false),
})

interface ApplyResult {
  templateId: string
  templateName: string
  success: boolean
  error?: string
  taskId?: string
}

/**
 * POST /api/templates/packs/[id]/apply
 * Apply all templates from a pack to an asset (or whole-home)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: packId } = await params

    // Parse and validate request body
    const body = await request.json()
    const validation = batchApplySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { assetId, isWholeHome } = validation.data

    // Get user's home
    const home = await prisma.home.findFirst({
      where: { userId: session.user.id },
    })

    if (!home) {
      return NextResponse.json(
        { error: 'No home found for user' },
        { status: 404 }
      )
    }

    // Verify asset ownership if applying to specific asset
    let asset: {
      id: string
      name: string
      homeId: string
      category: string
    } | null = null
    if (!isWholeHome && assetId) {
      asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          home: {
            userId: session.user.id,
          },
        },
        select: {
          id: true,
          name: true,
          homeId: true,
          category: true,
        },
      })

      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found or unauthorized' },
          { status: 404 }
        )
      }
    }

    // Fetch pack with all active templates
    const pack = await prisma.templatePack.findUnique({
      where: {
        id: packId,
        isActive: true,
      },
      include: {
        templates: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            defaultFrequency: true,
          },
        },
      },
    })

    if (!pack) {
      return NextResponse.json(
        { error: 'Template pack not found' },
        { status: 404 }
      )
    }

    if (pack.templates.length === 0) {
      return NextResponse.json(
        { error: 'No active templates in this pack' },
        { status: 400 }
      )
    }

    const results: ApplyResult[] = []
    const homeId = asset?.homeId || home.id

    // Process each template
    for (const template of pack.templates) {
      try {
        const scheduleStart = new Date()
        const nextDue = calculateNextDueDate(
          scheduleStart,
          template.defaultFrequency as Frequency,
          undefined
        )

        if (isWholeHome || !assetId) {
          // Create one-time task for whole-home
          const task = await prisma.task.create({
            data: {
              homeId,
              assetId: null,
              templateId: template.id,
              title: template.name,
              description: template.description,
              dueDate: nextDue,
              priority: Priority.MEDIUM,
              status: TaskStatus.PENDING,
              notes: `Whole-home maintenance (Pack: ${pack.name}): ${template.name}`,
            },
          })

          // Log activity
          await logTemplateApplied({
            userId: session.user.id,
            homeId,
            templateId: template.id,
            templateName: template.name,
            assetId: null,
            assetName: 'Whole Home',
          })

          results.push({
            templateId: template.id,
            templateName: template.name,
            success: true,
            taskId: task.id,
          })
        } else {
          // Check for existing active schedule
          const existingSchedule = await prisma.recurringSchedule.findUnique({
            where: {
              assetId_templateId: {
                assetId: assetId!,
                templateId: template.id,
              },
            },
          })

          if (existingSchedule?.isActive) {
            results.push({
              templateId: template.id,
              templateName: template.name,
              success: false,
              error: 'Already applied to this asset',
            })
            continue
          }

          // Create schedule and task in transaction
          const result = await prisma.$transaction(async (tx) => {
            const schedule = existingSchedule
              ? await tx.recurringSchedule.update({
                  where: { id: existingSchedule.id },
                  data: {
                    frequency: template.defaultFrequency as Frequency,
                    nextDueDate: nextDue,
                    isActive: true,
                  },
                })
              : await tx.recurringSchedule.create({
                  data: {
                    assetId: assetId!,
                    templateId: template.id,
                    frequency: template.defaultFrequency as Frequency,
                    nextDueDate: nextDue,
                    isActive: true,
                  },
                })

            const task = await tx.task.create({
              data: {
                homeId,
                assetId,
                templateId: template.id,
                title: template.name,
                description: template.description,
                dueDate: nextDue,
                priority: Priority.MEDIUM,
                status: TaskStatus.PENDING,
                notes: `Scheduled maintenance (Pack: ${pack.name}): ${template.name}`,
              },
            })

            return { schedule, task }
          })

          // Log activity
          await logTemplateApplied({
            userId: session.user.id,
            homeId,
            templateId: template.id,
            templateName: template.name,
            assetId: asset!.id,
            assetName: asset!.name,
          })

          results.push({
            templateId: template.id,
            templateName: template.name,
            success: true,
            taskId: result.task.id,
          })
        }
      } catch (err) {
        console.error(`Error applying template ${template.id}:`, err)
        results.push({
          templateId: template.id,
          templateName: template.name,
          success: false,
          error: 'Failed to apply template',
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json(
      {
        message: `Applied ${successCount} of ${pack.templates.length} templates`,
        packId: pack.id,
        packName: pack.name,
        totalTemplates: pack.templates.length,
        successCount,
        failCount,
        results,
        assetName: isWholeHome ? 'Whole Home' : asset?.name,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error applying template pack:', error)
    return NextResponse.json(
      { error: 'Failed to apply template pack' },
      { status: 500 }
    )
  }
}
