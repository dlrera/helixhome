import { test, expect } from '@playwright/test'

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should navigate to tasks page', async ({ page }) => {
    // Navigate to tasks page
    await page.click('text=Tasks')
    await page.waitForURL('/tasks')

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Tasks')
  })

  test('should create a new task', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks')

    // Click create task button
    await page.click('button:has-text("Create Task")')

    // Fill in task details
    await page.fill('input[name="title"]', 'Test Task from E2E')
    await page.fill(
      'textarea[name="description"]',
      'This is a test task created by Playwright'
    )

    // Set due date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateString)

    // Select priority
    await page.click('text=Medium')

    // Submit form
    await page.click('button:has-text("Create Task")')

    // Wait for success message or redirect
    await page.waitForTimeout(1000)

    // Verify task appears in list
    await expect(page.locator('text=Test Task from E2E')).toBeVisible()
  })

  test('should filter tasks by status', async ({ page }) => {
    await page.goto('/tasks')

    // Click on a filter chip
    await page.click('button:has-text("Pending")')

    // Wait for filtered results
    await page.waitForTimeout(500)

    // Verify URL or filter state updated
    // This depends on your implementation
  })

  test('should complete a task', async ({ page }) => {
    await page.goto('/tasks')

    // Find a pending task and click it
    const firstTask = page.locator('[data-task-card]').first()
    await firstTask.click()

    // Wait for task detail drawer/page to open
    await page.waitForTimeout(500)

    // Click complete button
    await page.click('button:has-text("Complete Task")')

    // Fill completion notes (if modal appears)
    const notesField = page.locator('textarea[id="completionNotes"]')
    if (await notesField.isVisible()) {
      await notesField.fill('Task completed successfully in E2E test')
      await page.click('button:has-text("Complete Task")')
    }

    // Wait for success message
    await page.waitForTimeout(1000)

    // Verify task is marked as completed
    await expect(page.locator('text=COMPLETED')).toBeVisible()
  })

  test('should view task details', async ({ page }) => {
    await page.goto('/tasks')

    // Click on a task to view details
    const firstTask = page.locator('[data-task-card]').first()
    const taskTitle = await firstTask.locator('text').first().textContent()

    await firstTask.click()

    // Wait for detail view to load
    await page.waitForTimeout(500)

    // Verify task details are visible
    if (taskTitle) {
      await expect(page.locator(`text=${taskTitle}`)).toBeVisible()
    }
    await expect(
      page.locator('text=Due Date').or(page.locator('text=Priority'))
    ).toBeVisible()
  })

  test('should delete a task', async ({ page }) => {
    await page.goto('/tasks')

    // Create a task to delete
    await page.click('button:has-text("Create Task")')
    await page.fill('input[name="title"]', 'Task to Delete')

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    await page.fill('input[type="date"]', dateString)

    await page.click('button:has-text("Create Task")')
    await page.waitForTimeout(1000)

    // Find and click the task
    await page.click('text=Task to Delete')
    await page.waitForTimeout(500)

    // Click delete button
    await page.click('button:has-text("Delete")')

    // Confirm deletion in dialog
    await page.click('button:has-text("Delete"):visible')

    // Wait for deletion
    await page.waitForTimeout(1000)

    // Verify task is no longer visible
    await expect(page.locator('text=Task to Delete')).not.toBeVisible()
  })

  test('should view tasks in calendar', async ({ page }) => {
    // Navigate to tasks calendar
    await page.goto('/tasks/calendar')

    // Verify calendar is visible
    await expect(
      page.locator('text=Sun').or(page.locator('text=Mon'))
    ).toBeVisible()

    // Verify view toggle buttons exist
    await expect(page.locator('button:has-text("Month")')).toBeVisible()
    await expect(page.locator('button:has-text("Week")')).toBeVisible()

    // Switch to week view
    await page.click('button:has-text("Week")')
    await page.waitForTimeout(500)

    // Verify week view is active
    await expect(page.locator('button:has-text("Week")')).toHaveClass(/default/)
  })

  test('should navigate between months in calendar', async ({ page }) => {
    await page.goto('/tasks/calendar')

    // Get current month text
    const currentMonth = await page.locator('h2').textContent()

    // Click next month
    await page.click('button[aria-label="Next"]').catch(() => {
      // Try alternative selector if aria-label not found
      page.locator('button:has(svg)').nth(1).click()
    })

    await page.waitForTimeout(300)

    // Verify month changed
    const newMonth = await page.locator('h2').textContent()
    expect(newMonth).not.toBe(currentMonth)
  })
})

test.describe('Task Statistics on Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display task statistics', async ({ page }) => {
    // Verify stat cards exist
    await expect(page.locator('text=Pending Tasks')).toBeVisible()
    await expect(page.locator('text=Overdue')).toBeVisible()
    await expect(page.locator('text=Completed This Month')).toBeVisible()
  })

  test('should show upcoming maintenance tasks', async ({ page }) => {
    // Look for upcoming maintenance widget
    const upcomingSection = page
      .locator('text=Upcoming Maintenance')
      .or(page.locator('text=This Week'))

    // Widget should exist
    await expect(upcomingSection).toBeVisible()
  })
})
