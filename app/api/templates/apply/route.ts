import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyTemplateSchema } from '@/lib/validation/template'
import { calculateNextDueDate } from '@/lib/utils/template-helpers'
import { logTemplateApplied, logScheduleCreated } from '@/lib/utils/activity-logger'
import { TaskStatus, Priority } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = applyTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { templateId, assetId, frequency, customFrequencyDays, startDate } = validation.data

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        home: {
          userId: session.user.id
        }
      },
      include: {
        home: true
      }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found or unauthorized' },
        { status: 404 }
      )
    }

    // Fetch template
    const template = await prisma.maintenanceTemplate.findUnique({
      where: {
        id: templateId,
        isActive: true
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Optional: Check if template category matches asset category
    // (You may want to allow cross-category applications in some cases)
    if (template.category !== asset.category && template.category !== 'OTHER') {
      console.warn(
        `Warning: Applying ${template.category} template to ${asset.category} asset. ` +
        `Template: ${template.name}, Asset: ${asset.name}`
      )
      // Not blocking the operation, just logging a warning
    }

    // Check if template is already applied to this asset
    const existingSchedule = await prisma.recurringSchedule.findUnique({
      where: {
        assetId_templateId: {
          assetId,
          templateId
        }
      }
    })

    if (existingSchedule) {
      if (existingSchedule.isActive) {
        return NextResponse.json(
          {
            error: 'Template already applied to this asset',
            message: `The "${template.name}" template is already active for "${asset.name}". You can manage or update it from the asset's Schedules tab.`,
            existingScheduleId: existingSchedule.id
          },
          { status: 409 }
        )
      }
      // If schedule exists but is inactive, we'll reactivate it below
    }

    // Use provided frequency or template default
    const scheduleFrequency = frequency || template.defaultFrequency
    const scheduleStart = startDate ? new Date(startDate) : new Date()
    const nextDue = calculateNextDueDate(scheduleStart, scheduleFrequency, customFrequencyDays)

    // Create schedule and initial task in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update recurring schedule
      const schedule = existingSchedule
        ? await tx.recurringSchedule.update({
            where: { id: existingSchedule.id },
            data: {
              frequency: scheduleFrequency,
              customFrequencyDays,
              nextDueDate: nextDue,
              isActive: true
            }
          })
        : await tx.recurringSchedule.create({
            data: {
              assetId,
              templateId,
              frequency: scheduleFrequency,
              customFrequencyDays,
              nextDueDate: nextDue,
              isActive: true
            }
          })

      // Create the first task
      const task = await tx.task.create({
        data: {
          homeId: asset.homeId,
          assetId,
          templateId,
          title: template.name,
          description: template.description,
          dueDate: nextDue,
          priority: Priority.MEDIUM,
          status: TaskStatus.PENDING,
          notes: `Scheduled maintenance: ${template.name}`
        }
      })

      return { schedule, task }
    })

    // Log activities
    await logTemplateApplied({
      userId: session.user.id,
      homeId: asset.homeId,
      templateId: template.id,
      templateName: template.name,
      assetId: asset.id,
      assetName: asset.name,
    })

    await logScheduleCreated({
      userId: session.user.id,
      homeId: asset.homeId,
      scheduleId: result.schedule.id,
      templateName: template.name,
      assetName: asset.name,
      frequency: scheduleFrequency,
    })

    return NextResponse.json({
      message: 'Template applied successfully',
      schedule: result.schedule,
      task: result.task
    }, { status: 201 })

  } catch (error) {
    console.error('Error applying template:', error)
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    )
  }
}