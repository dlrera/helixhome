import {
  PrismaClient,
  AssetCategory,
  Priority,
  TaskStatus,
  ActivityType,
} from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedMaintenanceTemplates } from './seeds/maintenance-templates'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const adminPassword = await bcrypt.hash('homeportal', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
    },
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      maintenanceBudget: 500.0, // $500/month budget
      budgetStartDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ), // Start of current month
    },
  })

  const testPassword = await bcrypt.hash('test123', 12)
  await prisma.user.upsert({
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

  // Seed maintenance templates
  await seedMaintenanceTemplates()

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

  // Create sample tasks with cost data
  const task1 = await prisma.task.create({
    data: {
      homeId: home.id,
      assetId: furnace.id,
      title: 'Change HVAC Filter',
      description: 'Monthly filter replacement',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: Priority.HIGH,
      status: TaskStatus.PENDING,
      estimatedCost: 25.0,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      homeId: home.id,
      assetId: waterHeater.id,
      title: 'Flush Water Heater',
      description: 'Annual maintenance',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      priority: Priority.MEDIUM,
      status: TaskStatus.PENDING,
      estimatedCost: 150.0,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      homeId: home.id,
      title: 'Test Smoke Detectors',
      description: 'Monthly safety check',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: Priority.HIGH,
      status: TaskStatus.PENDING,
      estimatedCost: 0, // No cost
    },
  })

  // Create a completed task with actual cost
  const completedTask = await prisma.task.create({
    data: {
      homeId: home.id,
      assetId: refrigerator.id,
      title: 'Clean Refrigerator Coils',
      description: 'Semi-annual maintenance completed',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      priority: Priority.LOW,
      status: TaskStatus.COMPLETED,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Completed 3 days ago
      completedBy: adminUser.id,
      estimatedCost: 50.0,
      actualCost: 35.0,
      costNotes: 'Cleaning supplies',
    },
  })

  console.log('✅ Sample tasks created')

  // Create sample activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.ASSET_CREATED,
        entityType: 'asset',
        entityId: furnace.id,
        entityName: 'Main Furnace',
        description: 'Added Main Furnace to home',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.ASSET_CREATED,
        entityType: 'asset',
        entityId: waterHeater.id,
        entityName: 'Water Heater',
        description: 'Added Water Heater to home',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.ASSET_CREATED,
        entityType: 'asset',
        entityId: refrigerator.id,
        entityName: 'Kitchen Refrigerator',
        description: 'Added Kitchen Refrigerator to home',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.TASK_CREATED,
        entityType: 'task',
        entityId: task1.id,
        entityName: 'Change HVAC Filter',
        description: 'Created task: Change HVAC Filter',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.TASK_COMPLETED,
        entityType: 'task',
        entityId: completedTask.id,
        entityName: 'Clean Refrigerator Coils',
        description: 'Completed task: Clean Refrigerator Coils',
        metadata: JSON.stringify({ cost: 35.0 }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.TASK_CREATED,
        entityType: 'task',
        entityId: task2.id,
        entityName: 'Flush Water Heater',
        description: 'Created task: Flush Water Heater',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        userId: adminUser.id,
        homeId: home.id,
        activityType: ActivityType.TASK_CREATED,
        entityType: 'task',
        entityId: task3.id,
        entityName: 'Test Smoke Detectors',
        description: 'Created task: Test Smoke Detectors',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ],
  })

  console.log('✅ Activity logs created')

  console.log('\n📝 Seed Summary:')
  console.log(
    '   Users: admin@example.com / homeportal, test@example.com / test123'
  )
  console.log('   Home: Main Residence')
  console.log('   Assets: 3 (Furnace, Water Heater, Refrigerator)')
  console.log('   Templates: 20 maintenance templates')
  console.log('   Tasks: 4 tasks (3 pending, 1 completed with cost data)')
  console.log('   Activity Logs: 7 sample activities')
  console.log('   Budget: $500/month set for admin user')
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
