/**
 * E2E Tests for Maintenance Templates System
 * Tests complete user workflows for browsing, applying, and managing templates
 */

import { test, expect } from '@playwright/test'

test.describe('Maintenance Templates Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'homeportal')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should browse templates by category', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates')
    await expect(page.locator('h1')).toContainText('Maintenance Templates')

    // Check that templates are displayed
    await expect(
      page.locator('[data-testid="template-card"]').first()
    ).toBeVisible()

    // Filter by HVAC category
    await page.click('button[role="tab"]:has-text("HVAC")')
    await page.waitForLoadState('networkidle')

    // Verify HVAC templates are shown
    const hvacTemplates = page.locator('[data-testid="template-card"]')
    const count = await hvacTemplates.count()
    expect(count).toBeGreaterThan(0)

    // Check first template contains HVAC-related content
    const firstTemplate = hvacTemplates.first()
    await expect(firstTemplate).toBeVisible()
  })

  test('should search for templates', async ({ page }) => {
    await page.goto('/templates')

    // Search for "filter" templates
    await page.fill('input[placeholder="Search templates..."]', 'filter')
    await page.waitForLoadState('networkidle')

    // Verify search results
    const templates = page.locator('[data-testid="template-card"]')
    const count = await templates.count()
    expect(count).toBeGreaterThan(0)

    // Check that results contain "filter" in title
    const firstTemplate = await templates.first().textContent()
    expect(firstTemplate?.toLowerCase()).toContain('filter')
  })

  test('should toggle between grid and list views', async ({ page }) => {
    await page.goto('/templates')

    // Default should be grid view
    await expect(page.locator('.grid')).toBeVisible()

    // Switch to list view
    await page.click('button[aria-label="List view"]')
    await expect(page.locator('.space-y-2')).toBeVisible()

    // Switch back to grid view
    await page.click('button[aria-label="Grid view"]')
    await expect(page.locator('.grid')).toBeVisible()
  })

  test('should show template details in drawer', async ({ page }) => {
    await page.goto('/templates')

    // Click on View Details for first template
    await page.click('button:has-text("View Details")', { timeout: 10000 })

    // Wait for drawer to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Check drawer content
    await expect(page.locator('[role="dialog"] h2')).toBeVisible()
    await expect(page.locator('[role="dialog"]')).toContainText('Instructions')

    // Close drawer
    await page.click('button:has-text("Close")')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should apply template to asset', async ({ page }) => {
    // First, ensure we have an asset
    await page.goto('/assets')

    // Check if we have any assets, if not create one
    const assetCards = page.locator('[data-testid="asset-card"]')
    const assetCount = await assetCards.count()

    if (assetCount === 0) {
      // Create an asset first
      await page.click('a:has-text("Add Asset")')
      await page.fill('input[name="name"]', 'Test HVAC System')
      await page.selectOption('select[name="category"]', 'HVAC')
      await page.click('button[type="submit"]')
      await page.waitForURL('/assets')
    }

    // Go to templates page
    await page.goto('/templates')

    // Click Apply on first template
    await page.click('button:has-text("Apply")', { timeout: 10000 })

    // Select asset dialog should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[role="dialog"]')).toContainText('Select Asset')

    // Click on first asset
    await page.locator('[role="dialog"] .cursor-pointer').first().click()

    // Apply template modal should appear
    await expect(page.locator('[role="dialog"]')).toContainText(
      'Apply Template'
    )

    // Select frequency
    await page.click('button[role="radio"][value="MONTHLY"]')

    // Apply template
    await page.click('button:has-text("Apply Template")')

    // Should see success toast
    await expect(page.locator('.toast')).toContainText('successfully')
  })

  test('should show applied state on templates', async ({ page }) => {
    await page.goto('/templates')

    // Look for any applied templates (green indicators)
    const appliedIndicators = page.locator(
      '.text-green-600:has-text("Applied")'
    )

    // If there are applied templates, verify the UI
    if ((await appliedIndicators.count()) > 0) {
      // Check that applied templates have different button state
      const appliedCard = page
        .locator('[data-testid="template-card"]')
        .filter({
          has: page.locator('.text-green-600'),
        })
        .first()

      await expect(
        appliedCard.locator('button:has-text("Applied")')
      ).toBeVisible()
      await expect(
        appliedCard.locator('button:has-text("Applied")')
      ).toHaveClass(/bg-green-600/)
    }
  })

  test('should manage schedules from asset detail', async ({ page }) => {
    // Navigate to first asset with schedules
    await page.goto('/assets')

    const assetWithSchedules = page
      .locator('[data-testid="asset-card"]')
      .first()
    if ((await assetWithSchedules.count()) > 0) {
      await assetWithSchedules.click()

      // Check for schedules section
      const schedulesSection = page.locator('h2:has-text("Schedules")')
      if (await schedulesSection.isVisible()) {
        // Check for schedule cards
        const scheduleCards = page.locator('[data-testid="schedule-card"]')

        if ((await scheduleCards.count()) > 0) {
          // Test pause/resume functionality
          const firstSchedule = scheduleCards.first()
          const pauseButton = firstSchedule.locator('button:has-text("Pause")')

          if (await pauseButton.isVisible()) {
            await pauseButton.click()

            // Confirm dialog
            await page.click('button:has-text("Confirm")')

            // Check for success message
            await expect(page.locator('.toast')).toContainText('paused')
          }
        }
      }
    }
  })

  test('should handle pagination', async ({ page }) => {
    await page.goto('/templates')

    // Check if pagination controls exist
    const paginationControls = page.locator('button:has-text("Next")')

    if (await paginationControls.isVisible()) {
      // Click next page
      await paginationControls.click()

      // Verify page changed
      await expect(
        page.locator('button.bg-[#216093]:has-text("2")')
      ).toBeVisible()

      // Go back to first page
      await page.click('button:has-text("Previous")')
      await expect(
        page.locator('button.bg-[#216093]:has-text("1")')
      ).toBeVisible()
    }
  })

  test('should display upcoming maintenance on dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // Check for upcoming maintenance widget
    const upcomingWidget = page.locator('h2:has-text("Upcoming Maintenance")')

    if (await upcomingWidget.isVisible()) {
      // Check for task cards
      const taskCards = page.locator('[data-testid="upcoming-task-card"]')

      // If there are tasks, verify the UI
      if ((await taskCards.count()) > 0) {
        const firstTask = taskCards.first()
        await expect(firstTask).toContainText(/due/i)

        // Click View All if available
        const viewAllButton = page.locator('a:has-text("View all tasks")')
        if (await viewAllButton.isVisible()) {
          await viewAllButton.click()
          await expect(page).toHaveURL('/tasks')
        }
      }
    }
  })
})
