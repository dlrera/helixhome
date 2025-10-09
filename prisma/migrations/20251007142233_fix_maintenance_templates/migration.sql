/*
  Warnings:

  - You are about to drop the column `difficultyLevel` on the `MaintenanceTemplate` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `MaintenanceTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MaintenanceTemplate` table without a default value. This is not possible if the table is not empty.
  - Made the column `estimatedDurationMinutes` on table `MaintenanceTemplate` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `RecurringSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaintenanceTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultFrequency" TEXT NOT NULL,
    "estimatedDurationMinutes" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "instructions" TEXT,
    "requiredTools" TEXT,
    "safetyPrecautions" TEXT,
    "isSystemTemplate" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MaintenanceTemplate" ("category", "createdAt", "defaultFrequency", "description", "estimatedDurationMinutes", "id", "instructions", "isSystemTemplate", "name") SELECT "category", "createdAt", "defaultFrequency", "description", "estimatedDurationMinutes", "id", "instructions", "isSystemTemplate", "name" FROM "MaintenanceTemplate";
DROP TABLE "MaintenanceTemplate";
ALTER TABLE "new_MaintenanceTemplate" RENAME TO "MaintenanceTemplate";
CREATE INDEX "MaintenanceTemplate_category_idx" ON "MaintenanceTemplate"("category");
CREATE INDEX "MaintenanceTemplate_isSystemTemplate_isActive_idx" ON "MaintenanceTemplate"("isSystemTemplate", "isActive");
CREATE TABLE "new_RecurringSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "customFrequencyDays" INTEGER,
    "nextDueDate" DATETIME NOT NULL,
    "lastCompletedDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MaintenanceTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecurringSchedule_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecurringSchedule" ("assetId", "createdAt", "frequency", "id", "isActive", "nextDueDate", "templateId") SELECT "assetId", "createdAt", "frequency", "id", "isActive", "nextDueDate", "templateId" FROM "RecurringSchedule";
DROP TABLE "RecurringSchedule";
ALTER TABLE "new_RecurringSchedule" RENAME TO "RecurringSchedule";
CREATE INDEX "RecurringSchedule_assetId_idx" ON "RecurringSchedule"("assetId");
CREATE INDEX "RecurringSchedule_nextDueDate_isActive_idx" ON "RecurringSchedule"("nextDueDate", "isActive");
CREATE UNIQUE INDEX "RecurringSchedule_assetId_templateId_key" ON "RecurringSchedule"("assetId", "templateId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
