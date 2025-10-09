import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateScheduleSchema } from '@/lib/validation/template'
import { calculateNextDueDate } from '@/lib/utils/template-helpers'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validation = updateScheduleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { frequency, customFrequencyDays, isActive } = validation.data

    // Verify schedule ownership
    const schedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        asset: {
          home: {
            userId: session.user.id
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or unauthorized' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (isActive !== undefined) {
      updateData.isActive = isActive
    }

    if (frequency) {
      updateData.frequency = frequency
      updateData.customFrequencyDays = customFrequencyDays || null

      // Recalculate next due date if frequency changed
      const baseDate = schedule.lastCompletedDate || new Date()
      updateData.nextDueDate = calculateNextDueDate(baseDate, frequency, customFrequencyDays)
    }

    // Update the schedule
    const updatedSchedule = await prisma.recurringSchedule.update({
      where: { id },
      data: updateData,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        asset: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify schedule ownership
    const schedule = await prisma.recurringSchedule.findFirst({
      where: {
        id,
        asset: {
          home: {
            userId: session.user.id
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or unauthorized' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.recurringSchedule.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Schedule deactivated successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}