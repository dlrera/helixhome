import { prisma } from '@/lib/prisma'
import { ActivityType } from '@prisma/client'

/**
 * Parameters for logging an activity
 */
export interface LogActivityParams {
  userId: string
  homeId: string
  activityType: ActivityType
  entityType: string // "asset", "task", "template", "schedule", etc.
  entityId: string
  entityName: string
  description: string
  metadata?: Record<string, unknown>
}

/**
 * Log an activity to the database
 *
 * This function creates an activity log entry that can be displayed in the activity feed.
 * It includes error handling to ensure that a failed activity log doesn't break the main operation.
 *
 * @param params - The activity parameters
 * @returns The created activity log or null if creation failed
 *
 * @example
 * ```ts
 * await logActivity({
 *   userId: session.user.id,
 *   homeId: asset.homeId,
 *   activityType: ActivityType.ASSET_CREATED,
 *   entityType: 'asset',
 *   entityId: asset.id,
 *   entityName: asset.name,
 *   description: `Added ${asset.name} to home`,
 *   metadata: { category: asset.category }
 * });
 * ```
 */
export async function logActivity(params: LogActivityParams) {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: params.userId,
        homeId: params.homeId,
        activityType: params.activityType,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    })

    return activityLog
  } catch (error) {
    // Log the error but don't throw - activity logging should not break the main operation
    console.error('Failed to log activity:', error)
    return null
  }
}

/**
 * Helper functions for common activity types
 */

export async function logAssetCreated(params: {
  userId: string
  homeId: string
  assetId: string
  assetName: string
  category?: string
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.ASSET_CREATED,
    entityType: 'asset',
    entityId: params.assetId,
    entityName: params.assetName,
    description: `Added ${params.assetName} to home`,
    metadata: params.category ? { category: params.category } : undefined,
  })
}

export async function logAssetUpdated(params: {
  userId: string
  homeId: string
  assetId: string
  assetName: string
  changes?: string[]
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.ASSET_UPDATED,
    entityType: 'asset',
    entityId: params.assetId,
    entityName: params.assetName,
    description: `Updated ${params.assetName}`,
    metadata: params.changes ? { changes: params.changes } : undefined,
  })
}

export async function logAssetDeleted(params: {
  userId: string
  homeId: string
  assetId: string
  assetName: string
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.ASSET_DELETED,
    entityType: 'asset',
    entityId: params.assetId,
    entityName: params.assetName,
    description: `Removed ${params.assetName} from home`,
  })
}

export async function logTaskCreated(params: {
  userId: string
  homeId: string
  taskId: string
  taskTitle: string
  priority?: string
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.TASK_CREATED,
    entityType: 'task',
    entityId: params.taskId,
    entityName: params.taskTitle,
    description: `Created task: ${params.taskTitle}`,
    metadata: params.priority ? { priority: params.priority } : undefined,
  })
}

export async function logTaskCompleted(params: {
  userId: string
  homeId: string
  taskId: string
  taskTitle: string
  cost?: number
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.TASK_COMPLETED,
    entityType: 'task',
    entityId: params.taskId,
    entityName: params.taskTitle,
    description: `Completed task: ${params.taskTitle}`,
    metadata: params.cost ? { cost: params.cost } : undefined,
  })
}

export async function logTaskOverdue(params: {
  userId: string
  homeId: string
  taskId: string
  taskTitle: string
  dueDate: Date
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.TASK_OVERDUE,
    entityType: 'task',
    entityId: params.taskId,
    entityName: params.taskTitle,
    description: `Task became overdue: ${params.taskTitle}`,
    metadata: { dueDate: params.dueDate.toISOString() },
  })
}

export async function logTemplateApplied(params: {
  userId: string
  homeId: string
  templateId: string
  templateName: string
  assetId: string | null
  assetName: string
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.TEMPLATE_APPLIED,
    entityType: 'template',
    entityId: params.templateId,
    entityName: params.templateName,
    description: `Applied ${params.templateName} to ${params.assetName}`,
    metadata: { assetId: params.assetId, assetName: params.assetName },
  })
}

export async function logScheduleCreated(params: {
  userId: string
  homeId: string
  scheduleId: string
  templateName: string
  assetName: string
  frequency: string
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.SCHEDULE_CREATED,
    entityType: 'schedule',
    entityId: params.scheduleId,
    entityName: `${params.templateName} for ${params.assetName}`,
    description: `Created ${params.frequency} schedule: ${params.templateName} for ${params.assetName}`,
    metadata: { frequency: params.frequency },
  })
}

export async function logScheduleUpdated(params: {
  userId: string
  homeId: string
  scheduleId: string
  templateName: string
  assetName: string
  changes?: string[]
}) {
  return logActivity({
    userId: params.userId,
    homeId: params.homeId,
    activityType: ActivityType.SCHEDULE_UPDATED,
    entityType: 'schedule',
    entityId: params.scheduleId,
    entityName: `${params.templateName} for ${params.assetName}`,
    description: `Updated schedule: ${params.templateName} for ${params.assetName}`,
    metadata: params.changes ? { changes: params.changes } : undefined,
  })
}
