import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicates() {
  console.log('🔍 Starting duplicate removal process...\n');

  try {
    // 1. Remove duplicate templates (keep oldest by createdAt)
    console.log('Removing duplicate templates...');
    const templates = await prisma.maintenanceTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const seenTemplates = new Map<string, string>();
    const templateIdsToDelete: string[] = [];
    
    for (const template of templates) {
      const key = `${template.name}-${template.category}`;
      if (seenTemplates.has(key)) {
        templateIdsToDelete.push(template.id);
      } else {
        seenTemplates.set(key, template.id);
      }
    }
    
    if (templateIdsToDelete.length > 0) {
      await prisma.maintenanceTemplate.deleteMany({
        where: { id: { in: templateIdsToDelete } },
      });
      console.log(`✅ Removed ${templateIdsToDelete.length} duplicate templates\n`);
    } else {
      console.log('✅ No duplicate templates found\n');
    }

    // 2. Remove duplicate homes (keep oldest)
    console.log('Removing duplicate homes...');
    const homes = await prisma.home.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const seenHomes = new Map<string, string>();
    const homeIdsToDelete: string[] = [];
    
    for (const home of homes) {
      const key = `${home.userId}-${home.name}-${home.address}`;
      if (seenHomes.has(key)) {
        homeIdsToDelete.push(home.id);
      } else {
        seenHomes.set(key, home.id);
      }
    }
    
    if (homeIdsToDelete.length > 0) {
      // Delete related records first
      await prisma.activityLog.deleteMany({
        where: { homeId: { in: homeIdsToDelete } },
      });
      await prisma.task.deleteMany({
        where: { homeId: { in: homeIdsToDelete } },
      });
      await prisma.asset.deleteMany({
        where: { homeId: { in: homeIdsToDelete } },
      });
      await prisma.home.deleteMany({
        where: { id: { in: homeIdsToDelete } },
      });
      console.log(`✅ Removed ${homeIdsToDelete.length} duplicate homes\n`);
    } else {
      console.log('✅ No duplicate homes found\n');
    }

    // 3. Remove duplicate assets (keep oldest)
    console.log('Removing duplicate assets...');
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const seenAssets = new Map<string, string>();
    const assetIdsToDelete: string[] = [];
    
    for (const asset of assets) {
      const key = `${asset.homeId}-${asset.name}-${asset.category}`;
      if (seenAssets.has(key)) {
        assetIdsToDelete.push(asset.id);
      } else {
        seenAssets.set(key, asset.id);
      }
    }
    
    if (assetIdsToDelete.length > 0) {
      // Delete related tasks first
      await prisma.task.deleteMany({
        where: { assetId: { in: assetIdsToDelete } },
      });
      await prisma.asset.deleteMany({
        where: { id: { in: assetIdsToDelete } },
      });
      console.log(`✅ Removed ${assetIdsToDelete.length} duplicate assets\n`);
    } else {
      console.log('✅ No duplicate assets found\n');
    }

    // 4. Remove duplicate tasks (keep oldest)
    console.log('Removing duplicate tasks...');
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const seenTasks = new Map<string, string>();
    const taskIdsToDelete: string[] = [];
    
    for (const task of tasks) {
      const key = `${task.homeId}-${task.title}-${task.dueDate?.toISOString()}-${task.assetId}`;
      if (seenTasks.has(key)) {
        taskIdsToDelete.push(task.id);
      } else {
        seenTasks.set(key, task.id);
      }
    }
    
    if (taskIdsToDelete.length > 0) {
      await prisma.task.deleteMany({
        where: { id: { in: taskIdsToDelete } },
      });
      console.log(`✅ Removed ${taskIdsToDelete.length} duplicate tasks\n`);
    } else {
      console.log('✅ No duplicate tasks found\n');
    }

    // 5. Remove duplicate activity logs (keep oldest)
    console.log('Removing duplicate activity logs...');
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    const seenLogs = new Map<string, string>();
    const logIdsToDelete: string[] = [];
    
    for (const log of logs) {
      const key = `${log.homeId}-${log.activityType}-${log.entityType}-${log.entityId}-${log.createdAt.toISOString()}`;
      if (seenLogs.has(key)) {
        logIdsToDelete.push(log.id);
      } else {
        seenLogs.set(key, log.id);
      }
    }
    
    if (logIdsToDelete.length > 0) {
      await prisma.activityLog.deleteMany({
        where: { id: { in: logIdsToDelete } },
      });
      console.log(`✅ Removed ${logIdsToDelete.length} duplicate activity logs\n`);
    } else {
      console.log('✅ No duplicate activity logs found\n');
    }

    console.log('✨ Duplicate removal complete!\n');

    // Show final counts
    const counts = await Promise.all([
      prisma.maintenanceTemplate.count(),
      prisma.home.count(),
      prisma.asset.count(),
      prisma.task.count(),
      prisma.activityLog.count(),
    ]);

    console.log('📊 Final database counts:');
    console.log(`  Templates: ${counts[0]}`);
    console.log(`  Homes: ${counts[1]}`);
    console.log(`  Assets: ${counts[2]}`);
    console.log(`  Tasks: ${counts[3]}`);
    console.log(`  Activity Logs: ${counts[4]}`);

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicates();
