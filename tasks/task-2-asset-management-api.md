# Task 2: Asset Management API

## Objective

Create comprehensive API routes for asset CRUD (Create, Read, Update, Delete) operations with authentication, validation, and proper error handling to enable users to manage their home assets.

## Prerequisites

- Task 1 completed (Database schema extended with Asset model)
- Prisma Client generated and up to date
- NextAuth.js authentication configured in `lib/auth.ts`
- Existing auth pattern: `getServerSession(authOptions)`
- Zod validation library available

## Implementation Plan

### Step 1: Create Asset Validation Schemas

Create `lib/validation/asset.ts` with Zod schemas:

```typescript
import { z } from 'zod'
import { AssetCategory } from '@prisma/client'

export const createAssetSchema = z.object({
  homeId: z.string().cuid(),
  name: z.string().min(1, 'Asset name is required').max(100),
  category: z.nativeEnum(AssetCategory),
  modelNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiryDate: z.coerce.date().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  metadata: z.string().optional().nullable(), // JSON string
})

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  modelNumber: z.string().max(100).optional().nullable(),
  serialNumber: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  warrantyExpiryDate: z.coerce.date().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  metadata: z.string().optional().nullable(),
})

export const assetQuerySchema = z.object({
  category: z.nativeEnum(AssetCategory).optional(),
  search: z.string().optional(),
  homeId: z.string().cuid().optional(),
})

// Export types
export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type AssetQueryInput = z.infer<typeof assetQuerySchema>
```

### Step 2: Create API Response Utilities

Create `lib/api/responses.ts` for consistent error handling:

```typescript
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFoundResponse(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 }
  )
}

export function serverErrorResponse(error: unknown) {
  console.error('Server error:', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}
```

### Step 3: Create Authentication Helpers

Create `lib/api/auth.ts` to simplify auth checks:

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function getUserHome(userId: string) {
  const home = await prisma.home.findFirst({
    where: { userId },
  })

  if (!home) {
    throw new Error('No home found for user')
  }

  return home
}

export async function verifyAssetOwnership(assetId: string, userId: string) {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      home: {
        select: { userId: true },
      },
    },
  })

  if (!asset) {
    return { authorized: false, asset: null, reason: 'not_found' }
  }

  if (asset.home.userId !== userId) {
    return { authorized: false, asset: null, reason: 'forbidden' }
  }

  return { authorized: true, asset, reason: null }
}
```

### Step 4: Create Assets List/Create Route

Create `app/api/assets/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, getUserHome } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
} from '@/lib/api/responses'
import { createAssetSchema, assetQuerySchema } from '@/lib/validation/asset'
import { ZodError } from 'zod'

// GET /api/assets - List user's assets
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      homeId: searchParams.get('homeId') || undefined,
    }

    const query = assetQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {}

    // Filter by user's homes
    const userHomes = await prisma.home.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })

    where.homeId = { in: userHomes.map((h) => h.id) }

    // Apply filters
    if (query.homeId) {
      where.homeId = query.homeId
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { modelNumber: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        home: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            recurringSchedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ assets })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error)
  }
}

// POST /api/assets - Create new asset
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // Validate input
    const data = createAssetSchema.parse(body)

    // Verify user owns the home
    const home = await prisma.home.findUnique({
      where: { id: data.homeId },
      select: { userId: true },
    })

    if (!home || home.userId !== session.user.id) {
      return forbiddenResponse('You do not own this home')
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        homeId: data.homeId,
        name: data.name,
        category: data.category,
        modelNumber: data.modelNumber,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate,
        warrantyExpiryDate: data.warrantyExpiryDate,
        photoUrl: data.photoUrl,
        metadata: data.metadata,
      },
      include: {
        home: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return successResponse(asset, 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error)
  }
}
```

### Step 5: Create Single Asset Route (GET)

Create `app/api/assets/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, verifyAssetOwnership } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/responses'
import { updateAssetSchema } from '@/lib/validation/asset'
import { ZodError } from 'zod'

// GET /api/assets/[id] - Get single asset
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const { id } = params

    const { authorized, asset, reason } = await verifyAssetOwnership(
      id,
      session.user.id
    )

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Fetch with full details
    const assetWithDetails = await prisma.asset.findUnique({
      where: { id },
      include: {
        home: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            recurringSchedules: true,
          },
        },
      },
    })

    return successResponse(assetWithDetails)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const { id } = params
    const body = await request.json()

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(
      id,
      session.user.id
    )

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Validate input
    const data = updateAssetSchema.parse(body)

    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        home: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return successResponse(updatedAsset)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    if (error instanceof ZodError) {
      return validationErrorResponse(error)
    }
    return serverErrorResponse(error)
  }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const { id } = params

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(
      id,
      session.user.id
    )

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Delete asset (cascades to tasks and recurring schedules)
    await prisma.asset.delete({
      where: { id },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}
```

### Step 6: Create Photo Upload Route

Create `app/api/assets/[id]/photo/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import prisma from '@/lib/prisma'
import { requireAuth, verifyAssetOwnership } from '@/lib/api/auth'
import {
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/responses'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'assets')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// POST /api/assets/[id]/photo - Upload asset photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const { id } = params

    // Verify ownership
    const { authorized, reason } = await verifyAssetOwnership(
      id,
      session.user.id
    )

    if (!authorized) {
      if (reason === 'not_found') {
        return notFoundResponse('Asset')
      }
      return forbiddenResponse('You do not own this asset')
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${id}-${timestamp}.${extension}`
    const filepath = join(UPLOAD_DIR, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Generate public URL
    const photoUrl = `/uploads/assets/${filename}`

    // Update asset with photo URL
    await prisma.asset.update({
      where: { id },
      data: { photoUrl },
    })

    return successResponse({ photoUrl })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return serverErrorResponse(error)
  }
}
```

### Step 7: Create .gitignore Entry for Uploads

Add to `.gitignore`:

```
# User uploads
/public/uploads/
```

### Step 8: Test API Endpoints

Create test file (optional): `tests/api/assets.http`

```http
### Get all assets
GET http://localhost:3000/api/assets
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Get assets by category
GET http://localhost:3000/api/assets?category=HVAC
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Search assets
GET http://localhost:3000/api/assets?search=furnace
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Create new asset
POST http://localhost:3000/api/assets
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

{
  "homeId": "YOUR_HOME_ID",
  "name": "Test Dishwasher",
  "category": "APPLIANCE",
  "modelNumber": "Samsung DW80R5061US",
  "purchaseDate": "2024-01-15"
}

### Get single asset
GET http://localhost:3000/api/assets/ASSET_ID
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Update asset
PUT http://localhost:3000/api/assets/ASSET_ID
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

{
  "name": "Updated Name",
  "modelNumber": "New Model"
}

### Delete asset
DELETE http://localhost:3000/api/assets/ASSET_ID
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

### Upload photo
POST http://localhost:3000/api/assets/ASSET_ID/photo
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Cookie: next-auth.session-token=YOUR_SESSION_TOKEN

------WebKitFormBoundary
Content-Disposition: form-data; name="photo"; filename="asset.jpg"
Content-Type: image/jpeg

< ./path/to/photo.jpg
------WebKitFormBoundary--
```

## Success Criteria

- ✅ All API routes return appropriate HTTP status codes
- ✅ Unauthenticated requests return 401
- ✅ Users cannot access other users' assets (returns 403)
- ✅ Invalid data returns 400 with validation error details
- ✅ Asset CRUD operations work via API client
- ✅ Photo upload saves files and updates database
- ✅ All routes properly typed with TypeScript
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Filtering and searching work correctly

## Validation Commands

```bash
# Check for TypeScript errors
npm run typecheck

# Run linter
npm run lint

# Test API routes (use Thunder Client, Postman, or Insomnia)
# Or use the .http file with REST Client extension in VS Code
```

## File Structure After Completion

```
app/
  api/
    assets/
      route.ts                    # GET (list), POST (create)
      [id]/
        route.ts                  # GET, PUT, DELETE
        photo/
          route.ts                # POST (upload photo)

lib/
  validation/
    asset.ts                      # Zod schemas
  api/
    responses.ts                  # Error response utilities
    auth.ts                       # Auth helper functions

public/
  uploads/
    assets/                       # Asset photos (gitignored)

tests/
  api/
    assets.http                   # API test file (optional)
```

## Next Steps

After completing Task 2:

- Task 3: Build Asset UI Pages (frontend interface)
- Task 4: Implement Maintenance Templates
- Task 5: Task Management System

## Time Estimate

**6-8 hours** (including testing and debugging)

## Dependencies

No new dependencies required. Uses existing:

- `zod` (validation)
- `@prisma/client` (database)
- `next-auth` (authentication)
- Node.js built-in `fs/promises` (file uploads)

## Notes

- Photo storage in `/public/uploads/` is a temporary MVP solution
- For production, migrate to cloud storage (AWS S3, Cloudinary, Vercel Blob)
- Consider implementing image optimization/compression
- Asset deletion cascades to related tasks and recurring schedules
- Metadata field allows flexible JSON storage for future extensions
- SQLite `contains` mode 'insensitive' works for case-insensitive search

---

**Status**: Ready to execute
**Assigned to**: AI Coding Agent
**Last Updated**: 2025-10-03
