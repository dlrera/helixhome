import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskCalendarClient } from './task-calendar-client'

export const metadata: Metadata = {
  title: 'Task Calendar | HelixIntel',
  description: 'View your tasks in calendar format'
}

export default async function TaskCalendarPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Fetch user's homes
  const homes = await prisma.home.findMany({
    where: {
      userId: session.user.id
    },
    select: {
      id: true
    }
  })

  const homeIds = homes.map((h) => h.id)

  // Fetch all tasks for the user
  const tasks = await prisma.task.findMany({
    where: {
      homeId: {
        in: homeIds
      },
      status: {
        not: 'CANCELLED'
      }
    },
    include: {
      asset: true,
      template: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  // Fetch user's requireCompletionPhoto setting
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      requireCompletionPhoto: true
    }
  })

  return (
    <TaskCalendarClient
      tasks={tasks}
      requireCompletionPhoto={user?.requireCompletionPhoto || false}
    />
  )
}
