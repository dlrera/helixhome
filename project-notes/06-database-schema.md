# Database Schema Analysis

## Overview
- **ORM**: Prisma 6.16.3
- **Database**: SQLite (development)
- **Location**: `prisma/dev.db`
- **Schema File**: `prisma/schema.prisma`
- **Migration System**: Prisma Migrate

## Schema Organization

### Enums (7 total)

#### AssetCategory
```prisma
enum AssetCategory {
  APPLIANCE
  HVAC
  PLUMBING
  ELECTRICAL
  STRUCTURAL
  OUTDOOR
  OTHER
}
```
**Usage**: Asset.category, MaintenanceTemplate.category

---

#### Frequency
```prisma
enum Frequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  SEMIANNUAL
  ANNUAL
  CUSTOM
}
```
**Usage**: MaintenanceTemplate.defaultFrequency, RecurringSchedule.frequency

---

#### Difficulty
```prisma
enum Difficulty {
  EASY
  MODERATE
  HARD
  PROFESSIONAL
}
```
**Usage**: MaintenanceTemplate.difficulty

---

#### Priority
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```
**Usage**: Task.priority

---

#### TaskStatus
```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
  CANCELLED
}
```
**Usage**: Task.status

---

#### NotificationType
```prisma
enum NotificationType {
  EMAIL
  PUSH
  SMS
}
```
**Usage**: Notification.type

---

#### NotificationStatus
```prisma
enum NotificationStatus {
  SENT
  FAILED
  PENDING
}
```
**Usage**: Notification.status

---

#### ActivityType
```prisma
enum ActivityType {
  ASSET_CREATED
  ASSET_UPDATED
  ASSET_DELETED
  TASK_CREATED
  TASK_COMPLETED
  TASK_OVERDUE
  TEMPLATE_APPLIED
  SCHEDULE_CREATED
  SCHEDULE_UPDATED
}
```
**Usage**: ActivityLog.activityType

---

## Models (11 total)

### NextAuth.js Models (4)

#### User
**Purpose**: User accounts and authentication
**Fields**:
- `id` (String, @id, @default(cuid())) - Primary key
- `name` (String?) - User's display name
- `email` (String, @unique) - Email address (login)
- `emailVerified` (DateTime?) - Email verification timestamp
- `image` (String?) - Profile picture URL
- `password` (String?) - Hashed password (bcryptjs, 12 rounds)
- `requireCompletionPhoto` (Boolean, @default(false)) - User preference
- `dashboardLayout` (String?) - JSON string for widget layout
- `maintenanceBudget` (Float?) - Monthly budget amount
- `budgetStartDate` (DateTime?) - Budget tracking start
- `createdAt` (DateTime, @default(now()))
- `updatedAt` (DateTime, @updatedAt)

**Relations**:
- `accounts` → Account[]
- `sessions` → Session[]
- `homes` → Home[]
- `notifications` → Notification[]
- `activityLogs` → ActivityLog[]

**Indexes**: Email unique index (implicit)

---

#### Account
**Purpose**: OAuth provider accounts (NextAuth.js adapter)
**Fields**:
- `userId` (String, FK)
- `type` (String)
- `provider` (String)
- `providerAccountId` (String)
- `refresh_token` (String?)
- `access_token` (String?)
- `expires_at` (Int?)
- `token_type` (String?)
- `scope` (String?)
- `id_token` (String?)
- `session_state` (String?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Primary Key**: [provider, providerAccountId]
**Relations**: `user` → User (onDelete: Cascade)

---

#### Session
**Purpose**: User sessions (not used with JWT strategy)
**Fields**:
- `sessionToken` (String, @unique)
- `userId` (String, FK)
- `expires` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**: `user` → User (onDelete: Cascade)

---

#### VerificationToken
**Purpose**: Email verification and password reset tokens
**Fields**:
- `identifier` (String)
- `token` (String)
- `expires` (DateTime)

**Primary Key**: [identifier, token]

---

### CMMS Models (7)

#### Home
**Purpose**: User properties (supports multiple homes per user)
**Fields**:
- `id` (String, @id, @default(cuid()))
- `userId` (String, FK)
- `name` (String) - e.g., "Main Residence"
- `address` (String?) - JSON string: {"street": "...", "city": "..."}
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**:
- `user` → User (onDelete: Cascade)
- `assets` → Asset[]
- `tasks` → Task[]
- `activityLogs` → ActivityLog[]

**Indexes**:
- `@@index([userId])`

**Analysis**:
- ✅ Multi-home support built into schema
- ⚠️ UI currently assumes single home
- ⚠️ Address stored as JSON string (consider structured fields)

---

#### Asset
**Purpose**: Home assets (appliances, HVAC, plumbing, etc.)
**Fields**:
- `id` (String, @id, @default(cuid()))
- `homeId` (String, FK)
- `name` (String) - e.g., "Kitchen Refrigerator"
- `category` (AssetCategory)
- `modelNumber` (String?)
- `serialNumber` (String?)
- `purchaseDate` (DateTime?)
- `warrantyExpiryDate` (DateTime?)
- `photoUrl` (String?) - base64 encoded image
- `metadata` (String?) - JSON string for custom fields
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**:
- `home` → Home (onDelete: Cascade)
- `tasks` → Task[]
- `recurringSchedules` → RecurringSchedule[]

**Indexes**:
- `@@index([homeId])`
- `@@index([category])`

**Analysis**:
- ✅ Good structure with category-based organization
- ⚠️ photoUrl as base64 in DB is not scalable
- ⚠️ Consider separate PhotoGallery model for multiple photos
- ✅ Metadata field provides extensibility

**Optimization Opportunities**:
- Move photos to cloud storage (S3, Cloudflare R2)
- Add warranty alert flag (computed from warrantyExpiryDate)
- Consider full-text search index on name + modelNumber + serialNumber

---

#### MaintenanceTemplate
**Purpose**: Pre-built maintenance task templates
**Fields**:
- `id` (String, @id, @default(cuid()))
- `name` (String) - e.g., "HVAC Filter Replacement"
- `description` (String)
- `category` (AssetCategory)
- `defaultFrequency` (Frequency)
- `estimatedDurationMinutes` (Int) - Required field
- `difficulty` (Difficulty)
- `instructions` (String?) - JSON array of steps
- `requiredTools` (String?) - JSON array
- `safetyPrecautions` (String?) - JSON array
- `isSystemTemplate` (Boolean, @default(true)) - Built-in vs user-created
- `isActive` (Boolean, @default(true))
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**:
- `tasks` → Task[]
- `recurringSchedules` → RecurringSchedule[]

**Indexes**:
- `@@index([category])`
- `@@index([isSystemTemplate, isActive])`

**Analysis**:
- ✅ Excellent template system design
- ✅ Supports both system and user-created templates
- ✅ JSON fields for structured data (instructions, tools, safety)
- ⚠️ Currently only 20 system templates (could expand)
- 💡 Consider versioning templates for updates

**Seeded Data**: 20 pre-built templates covering common home maintenance

---

#### Task
**Purpose**: Maintenance tasks (one-time or generated from schedules)
**Fields**:
- `id` (String, @id, @default(cuid()))
- `homeId` (String, FK)
- `assetId` (String?, FK) - Optional (tasks can be unlinked to assets)
- `templateId` (String?, FK) - Optional (tasks can be custom)
- `title` (String)
- `description` (String?)
- `dueDate` (DateTime)
- `priority` (Priority, @default(MEDIUM))
- `status` (TaskStatus, @default(PENDING))
- `completedAt` (DateTime?)
- `completedBy` (String?) - User ID who completed
- `completionNotes` (String?)
- `completionPhotos` (String?) - JSON array of base64 images
- `estimatedCost` (Float?)
- `actualCost` (Float?)
- `costNotes` (String?)
- `notes` (String?)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**:
- `home` → Home (onDelete: Cascade)
- `asset` → Asset? (onDelete: SetNull)
- `template` → MaintenanceTemplate? (onDelete: SetNull)
- `notifications` → Notification[]

**Indexes**:
- `@@index([homeId])`
- `@@index([assetId])`
- `@@index([status])`
- `@@index([dueDate])`
- `@@index([completedAt])` - Added in Task 7a performance optimization
- `@@index([homeId, status])` - Composite index added in Task 7a

**Analysis**:
- ✅ Comprehensive task model with all necessary fields
- ✅ Cost tracking (estimated vs actual)
- ✅ Completion workflow (notes + photos)
- ✅ Well-indexed for common queries
- ⚠️ completionPhotos as base64 JSON (same scalability issue as assets)
- ✅ SetNull on asset/template deletion preserves task history

**Optimization Opportunities**:
- Move completion photos to cloud storage
- Add full-text search on title + description
- Consider separate TaskHistory model for audit trail

---

#### RecurringSchedule
**Purpose**: Automated task generation schedules
**Fields**:
- `id` (String, @id, @default(cuid()))
- `templateId` (String, FK)
- `assetId` (String, FK)
- `frequency` (Frequency)
- `customFrequencyDays` (Int?) - For CUSTOM frequency
- `nextDueDate` (DateTime)
- `lastCompletedDate` (DateTime?) - Updated when task completed
- `isActive` (Boolean, @default(true)) - Can pause schedules
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations**:
- `template` → MaintenanceTemplate (onDelete: Cascade)
- `asset` → Asset (onDelete: Cascade)

**Indexes**:
- `@@unique([assetId, templateId])` - One schedule per asset+template combo
- `@@index([assetId])`
- `@@index([templateId])`
- `@@index([nextDueDate, isActive])` - Composite index added in Task 7a

**Analysis**:
- ✅ Excellent recurring task system
- ✅ Unique constraint prevents duplicate schedules
- ✅ isActive allows pausing without deletion
- ✅ lastCompletedDate enables accurate next due calculation
- ✅ Well-optimized for cron job queries

**Cron Job Usage**:
- `/api/cron/process-schedules` queries schedules where `nextDueDate <= today` and `isActive = true`

---

#### Notification
**Purpose**: User notifications (email, push, SMS)
**Fields**:
- `id` (String, @id, @default(cuid()))
- `userId` (String, FK)
- `taskId` (String, FK)
- `type` (NotificationType)
- `status` (NotificationStatus, @default(PENDING))
- `sentAt` (DateTime?)
- `metadata` (String?) - JSON for delivery details
- `createdAt` (DateTime)

**Relations**:
- `user` → User (onDelete: Cascade)
- `task` → Task (onDelete: Cascade)

**Indexes**:
- `@@index([userId])`
- `@@index([taskId])`
- `@@index([status])`

**Analysis**:
- ✅ Schema ready for notifications
- ⚠️ Implementation incomplete (no email sending)
- ⚠️ Only task-related notifications currently
- 💡 Consider expanding to asset/schedule notifications

**Missing Features**:
- Email sending via Resend (library installed but not wired)
- Push notification infrastructure
- SMS via Twilio/similar
- Notification preferences

---

#### ActivityLog
**Purpose**: Audit trail and activity feed
**Fields**:
- `id` (String, @id, @default(cuid()))
- `userId` (String, FK)
- `homeId` (String, FK)
- `activityType` (ActivityType)
- `entityType` (String) - "asset", "task", "template", etc.
- `entityId` (String) - ID of the entity
- `entityName` (String) - Denormalized for performance
- `description` (String) - Human-readable description
- `metadata` (String?) - JSON for additional context
- `createdAt` (DateTime)

**Relations**:
- `user` → User (onDelete: Cascade)
- `home` → Home (onDelete: Cascade)

**Indexes**:
- `@@index([homeId, createdAt])`
- `@@index([userId, createdAt])`

**Analysis**:
- ✅ Excellent activity logging system
- ✅ Denormalized entityName prevents broken references
- ✅ Composite indexes optimize feed queries
- ✅ 90-day retention via cron cleanup
- ✅ Metadata field for extensibility

**Retention Policy**:
- Deleted after 90 days via `/api/cron/cleanup-activities`

---

## Index Strategy

### Performance Optimizations (Task 7a)

**Added in Migration `20251009145648_add_performance_indexes`**:

1. **Task.completedAt** - For analytics queries
2. **Task(homeId, status)** - Composite for filtered task lists
3. **RecurringSchedule.templateId** - For template lookup optimization
4. **RecurringSchedule(nextDueDate, isActive)** - For cron job efficiency

**Existing Indexes**:
- User.email (unique)
- Home.userId
- Asset.homeId, Asset.category
- MaintenanceTemplate.category, MaintenanceTemplate(isSystemTemplate, isActive)
- Task.homeId, Task.assetId, Task.status, Task.dueDate
- RecurringSchedule.assetId, RecurringSchedule unique(assetId, templateId)
- Notification.userId, Notification.taskId, Notification.status
- ActivityLog(homeId, createdAt), ActivityLog(userId, createdAt)

**Missing Indexes** (Opportunities):
- Asset(homeId, category) composite - for category filtering
- Task(status, dueDate) composite - for overdue queries
- Full-text search indexes (SQLite FTS5) for Asset.name, Task.title

---

## Data Relationships

### Cascade Behaviors

**onDelete: Cascade** (Child deleted when parent deleted):
- User → Account, Session, Home, Notification, ActivityLog
- Home → Asset, Task, ActivityLog
- Asset → Task (via assetId), RecurringSchedule
- Task → Notification
- MaintenanceTemplate → RecurringSchedule

**onDelete: SetNull** (Preserve child, null FK):
- Asset → Task (assetId set to null if asset deleted)
- MaintenanceTemplate → Task (templateId set to null)

**Analysis**:
- ✅ Appropriate cascade rules preserve data integrity
- ✅ SetNull on Task preserves historical records
- ✅ Cascade on schedules cleans up automatically

---

## JSON Field Usage

Several models use JSON strings for flexible data:

1. **User.dashboardLayout** - Widget configuration
2. **Home.address** - Structured address
3. **Asset.metadata** - Custom asset properties
4. **MaintenanceTemplate.instructions** - Step-by-step array
5. **MaintenanceTemplate.requiredTools** - Tool list array
6. **MaintenanceTemplate.safetyPrecautions** - Safety array
7. **Task.completionPhotos** - Photo array
8. **Notification.metadata** - Delivery details
9. **ActivityLog.metadata** - Activity context

**Pros**:
- ✅ Flexibility for custom data
- ✅ No schema changes needed for new fields
- ✅ Works well with TypeScript via Zod validation

**Cons**:
- ⚠️ Cannot query JSON field contents efficiently
- ⚠️ No type safety at database level
- ⚠️ Larger storage footprint

**Recommendations**:
- Keep using JSON for truly dynamic data
- Consider structured models if querying needed (e.g., separate Photo model)

---

## Migration History

Migrations found in `prisma/migrations/`:
- Initial migration with all models
- `20251009145648_add_performance_indexes` - Task 7a optimizations

**Migration Strategy**: Prisma Migrate with SQLite

**Production Considerations**:
- SQLite not recommended for production scale
- Migrate to PostgreSQL or MySQL for production
- All migrations should work on PostgreSQL with minimal changes

---

## Schema Quality Assessment

**Strengths** ⭐⭐⭐⭐⭐:
- Well-normalized structure
- Appropriate use of enums
- Good index coverage
- Thoughtful cascade rules
- Extensibility via JSON fields
- Activity logging for audit trail
- Multi-home support ready

**Weaknesses** ⚠️:
- Photo storage in database (base64)
- Some JSON fields could be normalized (address, photos)
- No full-text search indexes
- SQLite limitations for production

**Optimization Opportunities**:
1. Migrate photos to cloud storage
2. Add PostgreSQL full-text search
3. Consider read replicas for analytics
4. Implement database connection pooling (Prisma Accelerate)
5. Add soft deletes for important entities (User, Asset, Task)

---

## Seed Data

**Location**: `prisma/seed.ts`

**Default User**:
- Email: admin@example.com
- Password: admin123
- Includes one home and 20 maintenance templates

**Templates Seeded**: All 20 system templates across categories

---

## Database Size Estimates

**Current Usage** (development):
- ~50 KB for schema
- ~500 KB with seed data
- ~5-10 MB per year per user (estimated)

**Production Estimates**:
- 1,000 users: ~10 GB/year
- 10,000 users: ~100 GB/year
- Photos would significantly increase (5-10x if stored in DB)

**Recommendation**: Move to PostgreSQL + cloud storage before 500+ users

---

## Backup & Recovery

**Current**: SQLite file-based backups
**Production Needs**:
- Automated daily backups
- Point-in-time recovery
- Replication
- Consider managed database (Supabase, PlanetScale, etc.)

---

## Schema Evolution Path

**Phase 1 (Current)**: SQLite with JSON fields
**Phase 2 (100-500 users)**: PostgreSQL migration
**Phase 3 (500+ users)**: Add read replicas, optimize queries
**Phase 4 (1000+ users)**: Sharding by homeId, separate analytics DB

---

## Summary

The database schema is **well-designed** for an MVP with:
- ✅ Clear domain modeling
- ✅ Good performance via indexes
- ✅ Extensibility for growth
- ✅ Appropriate relationships and constraints

**Critical Path to Production**:
1. Move photos to cloud storage (S3/R2)
2. Migrate to PostgreSQL
3. Implement full-text search
4. Add connection pooling
5. Set up automated backups
