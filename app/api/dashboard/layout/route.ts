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

// Dashboard layout schema - validates the structure of the layout JSON
const dashboardLayoutSchema = z.object({
  widgets: z.array(
    z.object({
      id: z.string(),
      type: z.enum([
        'analytics-chart',
        'activity-timeline',
        'maintenance-calendar',
        'cost-summary',
        'maintenance-insights',
        'upcoming-tasks',
        'quick-stats',
      ]),
      position: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
        w: z.number().min(1).max(12), // 12-column grid
        h: z.number().min(1),
      }),
      visible: z.boolean(),
      settings: z.record(z.string(), z.any()).optional(), // Widget-specific settings
    })
  ),
});

/**
 * GET /api/dashboard/layout
 * Get user's dashboard layout configuration
 */
export async function GET() {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        dashboardLayout: true,
      },
    });

    // Parse JSON string to object, or return default layout
    let layout = null;
    if (user?.dashboardLayout) {
      try {
        layout = JSON.parse(user.dashboardLayout);
      } catch (error) {
        console.error('Failed to parse dashboard layout JSON:', error);
        // Return null if JSON is corrupted
        layout = null;
      }
    }

    // If no layout exists, return default layout
    if (!layout) {
      layout = {
        widgets: [
          {
            id: 'quick-stats',
            type: 'quick-stats',
            position: { x: 0, y: 0, w: 12, h: 2 },
            visible: true,
          },
          {
            id: 'analytics-chart',
            type: 'analytics-chart',
            position: { x: 0, y: 2, w: 8, h: 4 },
            visible: true,
          },
          {
            id: 'cost-summary',
            type: 'cost-summary',
            position: { x: 8, y: 2, w: 4, h: 4 },
            visible: true,
          },
          {
            id: 'maintenance-calendar',
            type: 'maintenance-calendar',
            position: { x: 0, y: 6, w: 6, h: 5 },
            visible: true,
          },
          {
            id: 'activity-timeline',
            type: 'activity-timeline',
            position: { x: 6, y: 6, w: 6, h: 5 },
            visible: true,
          },
          {
            id: 'maintenance-insights',
            type: 'maintenance-insights',
            position: { x: 0, y: 11, w: 12, h: 3 },
            visible: true,
          },
        ],
      };
    }

    return successResponse({ layout });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    return serverErrorResponse(error);
  }
}

/**
 * PUT /api/dashboard/layout
 * Update user's dashboard layout configuration
 * Body: { layout: DashboardLayout }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const validation = dashboardLayoutSchema.safeParse(body.layout);

    if (!validation.success) {
      return validationErrorResponse(validation.error);
    }

    const layout = validation.data;

    // Update user's dashboard layout (store as JSON string)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        dashboardLayout: JSON.stringify(layout),
      },
      select: {
        dashboardLayout: true,
      },
    });

    return successResponse({
      message: 'Dashboard layout updated successfully',
      layout: JSON.parse(updatedUser.dashboardLayout!),
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
