-- AlterTable
ALTER TABLE "Task" ADD COLUMN "actualCost" REAL;
ALTER TABLE "Task" ADD COLUMN "costNotes" TEXT;
ALTER TABLE "Task" ADD COLUMN "estimatedCost" REAL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "budgetStartDate" DATETIME;
ALTER TABLE "User" ADD COLUMN "dashboardLayout" TEXT;
ALTER TABLE "User" ADD COLUMN "maintenanceBudget" REAL;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ActivityLog_homeId_createdAt_idx" ON "ActivityLog"("homeId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
