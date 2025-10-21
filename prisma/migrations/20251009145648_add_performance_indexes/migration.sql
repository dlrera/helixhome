-- CreateIndex
CREATE INDEX "RecurringSchedule_templateId_idx" ON "RecurringSchedule"("templateId");

-- CreateIndex
CREATE INDEX "Task_completedAt_idx" ON "Task"("completedAt");

-- CreateIndex
CREATE INDEX "Task_homeId_status_idx" ON "Task"("homeId", "status");
