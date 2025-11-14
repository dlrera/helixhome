# Task 1: Database Schema Extension

## Objective

Extend the existing Prisma schema to support CMMS features: Homes, Assets, Maintenance Templates, Tasks, Recurring Schedules, and Notifications.

## Prerequisites

- Existing schema with User, Account, Session, VerificationToken models
- Prisma 6.16.3 installed
- SQLite database configured

## Implementation Plan

### Step 1: Add Enums

Add to `prisma/schema.prisma` after datasource block:

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

enum Frequency {
  WEEKLY
  MONTHLY
  QUARTERLY
  SEMI_ANNUAL
  ANNUAL
}

enum Difficulty {
  EASY
  MODERATE
  HARD
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  PENDING
  COMPLETED
  OVERDUE
  CANCELLED
}

enum NotificationType {
  EMAIL
  PUSH
  SMS
}

enum NotificationStatus {
  SENT
  FAILED
  PENDING
}
```

### Step 2: Add Home Model

```prisma
model Home {
  id        String   @id @default(cuid())
  userId    String
  name      String
  address   String?  // JSON stored as string
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  assets Asset[]
  tasks  Task[]

  @@index([userId])
}
```

### Step 3: Add Asset Model

```prisma
model Asset {
  id                String        @id @default(cuid())
  homeId            String
  name              String
  category          AssetCategory
  modelNumber       String?
  serialNumber      String?
  purchaseDate      DateTime?
  warrantyExpiryDate DateTime?
  photoUrl          String?
  metadata          String?       // JSON stored as string
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  home              Home               @relation(fields: [homeId], references: [id], onDelete: Cascade)
  tasks             Task[]
  recurringSchedules RecurringSchedule[]

  @@index([homeId])
  @@index([category])
}
```

### Step 4: Add MaintenanceTemplate Model

```prisma
model MaintenanceTemplate {
  id                      String     @id @default(cuid())
  name                    String
  description             String
  category                AssetCategory
  defaultFrequency        Frequency
  estimatedDurationMinutes Int?
  difficultyLevel         Difficulty
  instructions            String?    // JSON stored as string
  isSystemTemplate        Boolean    @default(true)
  createdAt               DateTime   @default(now())

  tasks              Task[]
  recurringSchedules RecurringSchedule[]

  @@index([category])
  @@index([isSystemTemplate])
}
```

### Step 5: Add Task Model

```prisma
model Task {
  id          String     @id @default(cuid())
  homeId      String
  assetId     String?
  templateId  String?
  title       String
  description String?
  dueDate     DateTime
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  completedAt DateTime?
  notes       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  home         Home                  @relation(fields: [homeId], references: [id], onDelete: Cascade)
  asset        Asset?                @relation(fields: [assetId], references: [id], onDelete: SetNull)
  template     MaintenanceTemplate?  @relation(fields: [templateId], references: [id], onDelete: SetNull)
  notifications Notification[]

  @@index([homeId])
  @@index([assetId])
  @@index([status])
  @@index([dueDate])
}
```

### Step 6: Add RecurringSchedule Model

```prisma
model RecurringSchedule {
  id          String    @id @default(cuid())
  templateId  String
  assetId     String
  frequency   Frequency
  nextDueDate DateTime
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  template MaintenanceTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  asset    Asset               @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@index([assetId])
  @@index([nextDueDate])
  @@index([isActive])
}
```

### Step 7: Add Notification Model

```prisma
model Notification {
  id       String             @id @default(cuid())
  userId   String
  taskId   String
  type     NotificationType
  status   NotificationStatus @default(PENDING)
  sentAt   DateTime?
  metadata String?            // JSON stored as string
  createdAt DateTime          @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([taskId])
  @@index([status])
}
```

### Step 8: Update User Model

Add relations to User model:

```prisma
model User {
  // ... existing fields ...

  homes         Home[]
  notifications Notification[]
}
```

### Step 9: Create Migration

```bash
npx prisma migrate dev --name add_cmms_models
```

### Step 10: Update Seed Script

Replace contents of `prisma/seed.ts` with comprehensive seed data:

```typescript
import {
  PrismaClient,
  AssetCategory,
  Frequency,
  Difficulty,
  Priority,
  TaskStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
    },
  })

  const testPassword = await bcrypt.hash('test123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: testPassword,
    },
  })

  console.log('✅ Users created')

  // Create home for admin
  const home = await prisma.home.create({
    data: {
      userId: adminUser.id,
      name: 'Main Residence',
      address: JSON.stringify({
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
      }),
    },
  })

  console.log('✅ Home created')

  // Create maintenance templates (Top 20)
  const templates = await prisma.maintenanceTemplate.createMany({
    data: [
      {
        name: 'Change HVAC Filter',
        description: 'Replace air filter in furnace/AC unit',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 15,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Turn off HVAC system',
          'Remove old filter',
          'Insert new filter with correct airflow direction',
          'Turn system back on',
        ]),
      },
      {
        name: 'Test Smoke Detectors',
        description: 'Test all smoke detectors and replace batteries if needed',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 10,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Press test button on each detector',
          'Replace batteries if alarm is weak',
          'Replace detector if older than 10 years',
        ]),
      },
      {
        name: 'Clean Range Hood Filter',
        description: 'Remove and clean grease filter from kitchen range hood',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 20,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Remove filter from hood',
          'Soak in hot soapy water',
          'Scrub with brush',
          'Rinse and dry completely',
          'Reinstall',
        ]),
      },
      {
        name: 'Flush Water Heater',
        description: 'Drain sediment from water heater tank',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 45,
        difficultyLevel: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Turn off power/gas',
          'Attach hose to drain valve',
          'Open valve and drain 2-3 gallons',
          'Close valve and refill',
          'Turn power/gas back on',
        ]),
      },
      {
        name: 'Clean Refrigerator Coils',
        description: 'Vacuum dust from refrigerator condenser coils',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.SEMI_ANNUAL,
        estimatedDurationMinutes: 30,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Unplug refrigerator',
          'Pull away from wall',
          'Vacuum coils on back or bottom',
          'Push back and plug in',
        ]),
      },
      {
        name: 'Clean Gutters',
        description: 'Remove leaves and debris from gutters and downspouts',
        category: AssetCategory.OUTDOOR,
        defaultFrequency: Frequency.SEMI_ANNUAL,
        estimatedDurationMinutes: 120,
        difficultyLevel: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Use ladder safely',
          'Remove debris by hand or with scoop',
          'Flush gutters with hose',
          'Check downspouts are clear',
        ]),
      },
      {
        name: 'Service HVAC System',
        description: 'Professional HVAC maintenance and inspection',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 90,
        difficultyLevel: Difficulty.HARD,
        instructions: JSON.stringify([
          'Schedule professional service',
          'Clean coils and blower',
          'Check refrigerant levels',
          'Inspect electrical connections',
          'Test thermostat',
        ]),
      },
      {
        name: 'Test GFCI Outlets',
        description: 'Test and reset GFCI outlets in bathrooms and kitchen',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 10,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Press TEST button',
          'Verify power cuts off',
          'Press RESET button',
          'Verify power returns',
        ]),
      },
      {
        name: 'Clean Dryer Vent',
        description: 'Remove lint from dryer vent and ductwork',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 45,
        difficultyLevel: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Disconnect dryer',
          'Remove vent hose',
          'Clean lint with brush or vacuum',
          'Check exterior vent opening',
          'Reconnect everything',
        ]),
      },
      {
        name: 'Test Sump Pump',
        description: 'Verify sump pump operates correctly',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 15,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Pour water into sump pit',
          'Verify pump activates',
          'Check discharge pipe is clear',
          'Listen for unusual noises',
        ]),
      },
      {
        name: 'Inspect Fire Extinguisher',
        description: 'Check fire extinguisher pressure and condition',
        category: AssetCategory.OTHER,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 5,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Check pressure gauge is in green',
          'Inspect for damage or corrosion',
          'Verify seal is intact',
          'Check expiration date',
        ]),
      },
      {
        name: 'Check Roof and Attic',
        description: 'Inspect roof for damage and attic for leaks',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.SEMI_ANNUAL,
        estimatedDurationMinutes: 60,
        difficultyLevel: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Visually inspect roof from ground',
          'Check for missing or damaged shingles',
          'Inspect attic for water stains',
          'Check insulation condition',
        ]),
      },
      {
        name: 'Winterize Outdoor Faucets',
        description: 'Prepare outdoor plumbing for freezing temperatures',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 30,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Shut off interior water valve',
          'Open outdoor faucet to drain',
          'Remove hoses',
          'Install faucet covers',
        ]),
      },
      {
        name: 'Check Washing Machine Hoses',
        description: 'Inspect washer supply hoses for wear and leaks',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 15,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Inspect hoses for cracks or bulges',
          'Check connections are tight',
          'Look for water stains',
          'Replace if over 5 years old',
        ]),
      },
      {
        name: 'Run Water in Unused Drains',
        description: 'Prevent trap seal from drying out',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 5,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Run water in guest bathroom sinks',
          'Run water in basement drains',
          'Run water in any unused showers',
        ]),
      },
      {
        name: 'Check Water Softener Salt',
        description: 'Refill water softener salt as needed',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 10,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Open brine tank',
          'Check salt level',
          'Add salt if below half full',
          'Check for salt bridges',
        ]),
      },
      {
        name: 'Clean Garbage Disposal',
        description: 'Deep clean and deodorize garbage disposal',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 15,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Run ice cubes through disposal',
          'Grind citrus peels',
          'Flush with hot water and dish soap',
          'Scrub splash guard',
        ]),
      },
      {
        name: 'Clean Chimney',
        description: 'Professional chimney cleaning and inspection',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 120,
        difficultyLevel: Difficulty.HARD,
        instructions: JSON.stringify([
          'Schedule professional chimney sweep',
          'Inspect for creosote buildup',
          'Check for cracks or damage',
          'Verify cap is secure',
        ]),
      },
      {
        name: 'Seal Deck/Fence',
        description: 'Apply sealant or stain to wood deck or fence',
        category: AssetCategory.OUTDOOR,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 240,
        difficultyLevel: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Clean surface thoroughly',
          'Let dry completely',
          'Apply sealant with brush or sprayer',
          'Allow to cure per product instructions',
        ]),
      },
      {
        name: 'Clean Window Wells',
        description: 'Remove debris from basement window wells',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.SEMI_ANNUAL,
        estimatedDurationMinutes: 30,
        difficultyLevel: Difficulty.EASY,
        instructions: JSON.stringify([
          'Remove leaves and debris',
          'Check drain is clear',
          'Inspect window well covers',
          'Check for standing water',
        ]),
      },
    ],
  })

  console.log('✅ 20 maintenance templates created')

  // Create sample assets
  const furnace = await prisma.asset.create({
    data: {
      homeId: home.id,
      name: 'Main Furnace',
      category: AssetCategory.HVAC,
      modelNumber: 'XC95M-100',
      serialNumber: 'HV123456789',
      purchaseDate: new Date('2020-01-15'),
      warrantyExpiryDate: new Date('2030-01-15'),
    },
  })

  const waterHeater = await prisma.asset.create({
    data: {
      homeId: home.id,
      name: 'Water Heater',
      category: AssetCategory.PLUMBING,
      modelNumber: 'AO Smith 50G',
      purchaseDate: new Date('2021-06-01'),
      warrantyExpiryDate: new Date('2027-06-01'),
    },
  })

  const refrigerator = await prisma.asset.create({
    data: {
      homeId: home.id,
      name: 'Kitchen Refrigerator',
      category: AssetCategory.APPLIANCE,
      modelNumber: 'LG LFXS26973S',
      serialNumber: 'REF987654321',
      purchaseDate: new Date('2019-03-10'),
    },
  })

  console.log('✅ Sample assets created')

  // Create sample tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        homeId: home.id,
        assetId: furnace.id,
        title: 'Change HVAC Filter',
        description: 'Monthly filter replacement',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: Priority.HIGH,
        status: TaskStatus.PENDING,
      },
      {
        homeId: home.id,
        assetId: waterHeater.id,
        title: 'Flush Water Heater',
        description: 'Annual maintenance',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priority: Priority.MEDIUM,
        status: TaskStatus.PENDING,
      },
      {
        homeId: home.id,
        title: 'Test Smoke Detectors',
        description: 'Monthly safety check',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: Priority.HIGH,
        status: TaskStatus.PENDING,
      },
    ],
  })

  console.log('✅ Sample tasks created')

  console.log('\n📝 Seed Summary:')
  console.log(
    '   Users: admin@example.com / admin123, test@example.com / test123'
  )
  console.log('   Home: Main Residence')
  console.log('   Assets: 3 (Furnace, Water Heater, Refrigerator)')
  console.log('   Templates: 20 maintenance templates')
  console.log('   Tasks: 3 pending tasks')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

### Step 11: Run Seed Script

```bash
npm run db:seed
```

### Step 12: Verify in Prisma Studio

```bash
npx prisma studio
```

Check that all tables exist and contain seeded data.

## Success Criteria

- ✅ Migration runs without errors
- ✅ All 7 new models created (Home, Asset, MaintenanceTemplate, Task, RecurringSchedule, Notification)
- ✅ All 7 enums created
- ✅ Prisma Studio shows new tables with data
- ✅ Seed script creates:
  - 2 users (existing)
  - 1 home
  - 3 assets
  - 20 maintenance templates
  - 3 pending tasks
- ✅ TypeScript types generated (`npx prisma generate` runs successfully)
- ✅ No foreign key constraint errors

## Validation Commands

```bash
# Check for TypeScript errors
npm run typecheck

# Regenerate Prisma Client
npx prisma generate

# View database in GUI
npx prisma studio
```

## Rollback Plan

If migration fails:

```bash
# Reset database and start over
npx prisma migrate reset

# Or revert last migration
npx prisma migrate resolve --rolled-back [migration_name]
```

## Next Steps

After completing Task 1:

- Task 2: Create Asset Management API routes
- Task 3: Build Asset UI pages
- Task 4: Implement Maintenance Templates

## Time Estimate

**4-6 hours** (including testing and verification)

## Dependencies

- None (first task in implementation sequence)

## Notes

- SQLite stores JSON as strings, so use `JSON.stringify()` and `JSON.parse()`
- Indexes added for common query patterns (userId, category, status, dueDate)
- All foreign keys use `onDelete: Cascade` or `SetNull` for data integrity
- Default values set for boolean and enum fields
- Created/updated timestamps added to all models

---

**Status**: Ready to execute
**Assigned to**: AI Coding Agent
**Last Updated**: 2025-10-03
