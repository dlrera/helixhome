import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskDetailClient } from './task-detail-client'

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TaskDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      title: 'Task Details'
    }
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id },
      select: {
        title: true,
        home: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!task || task.home.userId !== session.user.id) {
      return {
        title: 'Task Not Found'
      }
    }

    return {
      title: `${task.title} | Task Details`,
      description: `Details for task: ${task.title}`
    }
  } catch (error) {
    return {
      title: 'Task Details'
    }
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params

  // Fetch task with all related data
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      asset: true,
      template: true,
      home: {
        select: {
          userId: true
        }
      }
    }
  })

  // Check if task exists
  if (!task) {
    notFound()
  }

  // Verify user owns this task
  if (task.home.userId !== session.user.id) {
    notFound()
  }

  // Fetch user's requireCompletionPhoto setting
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      requireCompletionPhoto: true
    }
  })

  return (
    <TaskDetailClient
      task={task}
      requireCompletionPhoto={user?.requireCompletionPhoto || false}
    />
  )
}
