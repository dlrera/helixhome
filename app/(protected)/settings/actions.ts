'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateHomeDetailsSchema,
  updateUserPreferencesSchema,
  type UpdateHomeDetailsInput,
  type UpdateUserPreferencesInput,
} from '@/lib/validation/settings'

// Standard result type for server actions
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; details?: Record<string, string[]> }

/**
 * Update home details (name, address, property type, etc.)
 */
export async function updateHomeDetails(
  input: UpdateHomeDetailsInput
): Promise<ActionResult<{ id: string }>> {
  // 1. Authentication Check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Input Validation
  const result = updateHomeDetailsSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const {
    homeId,
    name,
    address,
    propertyType,
    yearBuilt,
    sizeSqFt,
    climateZone,
  } = result.data

  try {
    // 3. Verify ownership
    const existingHome = await prisma.home.findUnique({
      where: { id: homeId },
      select: { userId: true },
    })

    if (!existingHome) {
      return { success: false, error: 'Home not found' }
    }

    if (existingHome.userId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to update this home',
      }
    }

    // 4. Update home
    const updatedHome = await prisma.home.update({
      where: { id: homeId },
      data: {
        name,
        address: address ? JSON.stringify(address) : null,
        propertyType,
        yearBuilt,
        sizeSqFt,
        climateZone,
      },
    })

    // 5. Revalidate
    revalidatePath('/settings')
    revalidatePath('/settings/home')
    revalidatePath('/dashboard')

    return { success: true, data: { id: updatedHome.id } }
  } catch (error) {
    console.error('updateHomeDetails Error:', error)
    return { success: false, error: 'Failed to update home details' }
  }
}

/**
 * Get user's home for settings page
 */
export async function getUserHome() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  try {
    const home = await prisma.home.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        address: true,
        propertyType: true,
        yearBuilt: true,
        sizeSqFt: true,
        climateZone: true,
      },
    })

    if (!home) {
      return null
    }

    // Parse address JSON if present
    let parsedAddress = null
    if (home.address) {
      try {
        parsedAddress = JSON.parse(home.address)
      } catch {
        // If parsing fails, treat as simple string
        parsedAddress = { street: home.address }
      }
    }

    return {
      ...home,
      address: parsedAddress,
    }
  } catch (error) {
    console.error('getUserHome Error:', error)
    return null
  }
}

/**
 * Update user preferences (theme, notifications, etc.)
 * Note: These are stored on the User model for now.
 * Could be extended to a separate UserPreference model later.
 */
export async function updateUserPreferences(
  input: UpdateUserPreferencesInput
): Promise<ActionResult> {
  // 1. Authentication Check
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Input Validation
  const result = updateUserPreferencesSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: 'Invalid input',
      details: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  // Note: User preferences are currently stored client-side (localStorage/cookies)
  // or can be extended to the User model. For now, this action is a placeholder
  // that can be expanded when a UserPreference model is added.

  try {
    // For theme and display preferences, we'll use client-side storage
    // This action is reserved for server-side preference storage if needed

    revalidatePath('/settings')
    revalidatePath('/settings/general')

    return { success: true }
  } catch (error) {
    console.error('updateUserPreferences Error:', error)
    return { success: false, error: 'Failed to update preferences' }
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        requireCompletionPhoto: true,
        dashboardLayout: true,
        maintenanceBudget: true,
      },
    })

    return user
  } catch (error) {
    console.error('getUserPreferences Error:', error)
    return null
  }
}
