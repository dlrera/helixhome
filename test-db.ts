import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
  console.log('🔍 Testing Database Schema...\n')

  // Test 1: Get all homes with their assets and tasks
  console.log('📍 Test 1: Fetching homes with related data...')
  const homes = await prisma.home.findMany({
    include: {
      assets: true,
      tasks: {
        include: {
          asset: true
        }
      },
      user: {
        select: {
          email: true,
          name: true
        }
      }
    }
  })

  console.log(`   ✅ Found ${homes.length} home(s)`)
  homes.forEach(home => {
    console.log(`      - ${home.name} (Owner: ${home.user.email})`)
    console.log(`        Assets: ${home.assets.length}, Tasks: ${home.tasks.length}`)
  })

  // Test 2: Get all maintenance templates
  console.log('\n📋 Test 2: Fetching maintenance templates...')
  const templates = await prisma.maintenanceTemplate.findMany({
    select: {
      name: true,
      category: true,
      defaultFrequency: true,
      difficulty: true
    }
  })
  console.log(`   ✅ Found ${templates.length} maintenance templates`)
  console.log('   Sample templates:')
  templates.slice(0, 5).forEach(t => {
    console.log(`      - ${t.name} (${t.category}, ${t.defaultFrequency}, ${t.difficulty})`)
  })

  // Test 3: Get all assets with their home
  console.log('\n🏠 Test 3: Fetching assets...')
  const assets = await prisma.asset.findMany({
    include: {
      home: {
        select: {
          name: true
        }
      }
    }
  })
  console.log(`   ✅ Found ${assets.length} asset(s)`)
  assets.forEach(asset => {
    console.log(`      - ${asset.name} (${asset.category}) in ${asset.home.name}`)
  })

  // Test 4: Get all tasks with details
  console.log('\n📝 Test 4: Fetching tasks...')
  const tasks = await prisma.task.findMany({
    include: {
      asset: {
        select: {
          name: true
        }
      },
      home: {
        select: {
          name: true
        }
      }
    }
  })
  console.log(`   ✅ Found ${tasks.length} task(s)`)
  tasks.forEach(task => {
    const assetName = task.asset ? ` for ${task.asset.name}` : ''
    const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    console.log(`      - ${task.title}${assetName} (${task.priority}, due in ${daysUntilDue} days)`)
  })

  // Test 5: Get users with their homes count
  console.log('\n👤 Test 5: Fetching users...')
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      _count: {
        select: {
          homes: true,
          notifications: true
        }
      }
    }
  })
  console.log(`   ✅ Found ${users.length} user(s)`)
  users.forEach(user => {
    console.log(`      - ${user.email} (${user.name}) - ${user._count.homes} home(s)`)
  })

  // Summary
  console.log('\n📊 Database Summary:')
  console.log(`   - Users: ${users.length}`)
  console.log(`   - Homes: ${homes.length}`)
  console.log(`   - Assets: ${assets.length}`)
  console.log(`   - Tasks: ${tasks.length}`)
  console.log(`   - Maintenance Templates: ${templates.length}`)

  console.log('\n✅ All tests completed successfully!')

  await prisma.$disconnect()
}

test()
  .catch(async (e) => {
    console.error('❌ Error testing database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
