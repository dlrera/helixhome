import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api/auth';
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { ZodError, z } from 'zod';

const budgetSettingsSchema = z.object({
  maintenanceBudget: z.number().positive('Budget must be a positive number'),
  budgetStartDate: z.string().datetime().optional(),
});

/**
 * GET /api/dashboard/budget
 * Get user's budget settings
 */
export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        maintenanceBudget: true,
        budgetStartDate: true,
      },
    });

    return successResponse({
      maintenanceBudget: user?.maintenanceBudget || null,
      budgetStartDate: user?.budgetStartDate?.toISOString() || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

/**
 * PUT /api/dashboard/budget
 * Update user's budget settings
 * Body: { maintenanceBudget: number, budgetStartDate?: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validation = budgetSettingsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const { maintenanceBudget, budgetStartDate } = validation.data;

    // Update user's budget settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        maintenanceBudget,
        budgetStartDate: budgetStartDate ? new Date(budgetStartDate) : undefined,
      },
      select: {
        maintenanceBudget: true,
        budgetStartDate: true,
      },
    });

    return successResponse({
      message: 'Budget settings updated successfully',
      maintenanceBudget: updatedUser.maintenanceBudget,
      budgetStartDate: updatedUser.budgetStartDate?.toISOString() || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    return serverErrorResponse(error);
  }
}
