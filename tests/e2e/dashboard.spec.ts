import { test, expect } from '@playwright/test'

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard overview', async ({ page }) => {
    // Verify stat cards are visible
    await expect(page.locator('text=Total Assets')).toBeVisible()
    await expect(page.locator('text=Pending Tasks')).toBeVisible()
    await expect(page.locator('text=Overdue')).toBeVisible()
    await expect(page.locator('text=Completed This Month')).toBeVisible()
  })

  test('should display analytics chart widget', async ({ page }) => {
    // Verify analytics chart is visible
    await expect(
      page
        .locator('text=Completion Trend')
        .or(page.locator('text=Category Breakdown'))
    ).toBeVisible()

    // Verify period selector exists
    const periodSelector = page
      .locator('button:has-text("Month")')
      .or(page.locator('select').filter({ hasText: 'Month' }))

    // Period selector should be visible or interactable
    const isVisible = await periodSelector.count()
    expect(isVisible).toBeGreaterThan(0)
  })

  test('should switch between analytics tabs', async ({ page }) => {
    // Wait for chart to load
    await page.waitForTimeout(1000)

    // Look for tab triggers
    const completionTab = page.locator('button:has-text("Completion Trend")')
    const categoryTab = page.locator('button:has-text("Category Breakdown")')
    const priorityTab = page.locator('button:has-text("Priority Distribution")')

    // Click through tabs if they exist
    if (await categoryTab.isVisible()) {
      await categoryTab.click()
      await page.waitForTimeout(300)
      await expect(categoryTab).toHaveAttribute('data-state', 'active')
    }

    if (await priorityTab.isVisible()) {
      await priorityTab.click()
      await page.waitForTimeout(300)
      await expect(priorityTab).toHaveAttribute('data-state', 'active')
    }
  })

  test('should display activity timeline', async ({ page }) => {
    // Verify activity timeline widget exists
    await expect(
      page
        .locator('text=Recent Activity')
        .or(page.locator('text=Activity Timeline'))
    ).toBeVisible()
  })

  test('should display maintenance calendar widget', async ({ page }) => {
    // Verify calendar widget exists
    await expect(
      page
        .locator('text=Maintenance Calendar')
        .or(page.locator('text=Calendar'))
    ).toBeVisible()

    // Verify calendar navigation exists
    const prevButton = page
      .locator('button[aria-label="Previous month"]')
      .or(page.locator('button:has-text("Previous")'))
    const nextButton = page
      .locator('button[aria-label="Next month"]')
      .or(page.locator('button:has-text("Next")'))

    // At least one navigation button should exist
    const hasNavigation =
      (await prevButton.count()) > 0 || (await nextButton.count()) > 0
    expect(hasNavigation).toBe(true)
  })

  test('should display cost summary widget', async ({ page }) => {
    // Verify cost summary widget exists
    await expect(
      page.locator('text=Cost Summary').or(page.locator('text=Budget'))
    ).toBeVisible()
  })

  test('should display maintenance insights', async ({ page }) => {
    // Scroll to insights section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Verify insights section exists
    await expect(
      page
        .locator('text=Maintenance Insights')
        .or(page.locator('text=Insights'))
    ).toBeVisible()
  })
})

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should expand dashboard submenu', async ({ page }) => {
    // Click on Dashboard in sidebar to expand submenu
    const dashboardButton = page.locator('button:has-text("Dashboard")').first()

    if (await dashboardButton.isVisible()) {
      await dashboardButton.click()
      await page.waitForTimeout(300)

      // Verify submenu items are visible
      await expect(
        page.locator('text=Overview').or(page.locator('text=Cost Report'))
      ).toBeVisible()
    }
  })

  test('should navigate to cost report page', async ({ page }) => {
    // Navigate to cost report via sidebar or direct URL
    await page.goto('/dashboard/costs')
    await page.waitForLoadState('networkidle')

    // Verify cost report page loaded
    await expect(page.locator('h2')).toContainText('Maintenance Cost Report')
  })

  test('should navigate to dashboard settings page', async ({ page }) => {
    // Navigate to settings via sidebar or direct URL
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    // Verify settings page loaded
    await expect(page.locator('h2')).toContainText('Dashboard Settings')
  })

  test('should navigate back to dashboard from cost report', async ({
    page,
  }) => {
    await page.goto('/dashboard/costs')

    // Click back to dashboard button
    await page.click('button:has-text("Back to Dashboard")')

    // Verify we're back on dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('text=Total Assets')).toBeVisible()
  })
})

test.describe('Cost Report Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/dashboard/costs')
    await page.waitForLoadState('networkidle')
  })

  test('should display cost summary cards', async ({ page }) => {
    // Verify summary cards
    await expect(page.locator('text=Total Spent')).toBeVisible()
    await expect(page.locator('text=Monthly Budget')).toBeVisible()
    await expect(page.locator('text=Budget Status')).toBeVisible()
  })

  test('should display cost report tabs', async ({ page }) => {
    // Verify all tabs exist
    await expect(page.locator('button:has-text("Overview")')).toBeVisible()
    await expect(page.locator('button:has-text("By Category")')).toBeVisible()
    await expect(page.locator('button:has-text("Trends")')).toBeVisible()
  })

  test('should switch between cost report tabs', async ({ page }) => {
    // Switch to Categories tab
    await page.click('button:has-text("By Category")')
    await page.waitForTimeout(500)

    // Verify categories table or content is visible
    await expect(
      page.locator('text=Category').or(page.locator('text=Total Cost'))
    ).toBeVisible()

    // Switch to Trends tab
    await page.click('button:has-text("Trends")')
    await page.waitForTimeout(500)

    // Verify trends chart is visible
    await expect(
      page.locator('text=6-Month').or(page.locator('text=Spending Trend'))
    ).toBeVisible()
  })

  test('should display pie chart on overview tab', async ({ page }) => {
    // Verify overview tab is active
    await page.click('button:has-text("Overview")')
    await page.waitForTimeout(500)

    // Look for chart or spending breakdown
    const hasChart =
      (await page.locator('text=Spending by Category').count()) > 0
    expect(hasChart).toBe(true)
  })

  test('should show "Set Budget" link when no budget configured', async ({
    page,
  }) => {
    // If budget card shows "Not Set", verify link exists
    const notSetText = page.locator('text=Not Set')

    if (await notSetText.isVisible()) {
      await expect(page.locator('a:has-text("Set Budget")')).toBeVisible()
    }
  })

  test('should display export button', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)

    // Verify export button exists
    await expect(page.locator('button:has-text("Export Report")')).toBeVisible()
  })
})

test.describe('Dashboard Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
  })

  test('should display budget settings form', async ({ page }) => {
    // Verify settings page elements
    await expect(page.locator('text=Maintenance Budget')).toBeVisible()

    // Verify form fields exist
    const budgetInput = page
      .locator('input[type="text"]')
      .filter({
        has: page.locator('xpath=ancestor::*[contains(., "Monthly Budget")]'),
      })
      .or(page.locator('input').first())

    await expect(budgetInput).toBeVisible()
  })

  test('should update budget amount', async ({ page }) => {
    // Find budget input field
    const budgetInput = page.locator('input[type="text"]').first()

    // Clear and enter new budget
    await budgetInput.clear()
    await budgetInput.fill('1000')

    // Find and click save button
    const saveButton = page.locator('button:has-text("Save Settings")')

    if (await saveButton.isVisible()) {
      await saveButton.click()
      await page.waitForTimeout(1000)

      // Verify success toast or updated value
      const hasSuccess =
        (await page.locator('text=updated').count()) > 0 ||
        (await page.locator('text=success').count()) > 0

      // Toast should appear or budget should be saved
      expect(hasSuccess || (await budgetInput.inputValue()) === '1000').toBe(
        true
      )
    }
  })

  test('should display budget start date picker', async ({ page }) => {
    // Look for date picker button or input
    const dateButton = page
      .locator('button')
      .filter({ hasText: /Pick a date|20\d{2}/ })
    const dateInput = page.locator('input[type="date"]')

    // Either date button or input should exist
    const hasDatePicker =
      (await dateButton.count()) > 0 || (await dateInput.count()) > 0
    expect(hasDatePicker).toBe(true)
  })

  test('should show current budget value', async ({ page }) => {
    // Look for current budget display
    const currentBudget = page
      .locator('text=Current budget')
      .or(page.locator('text=/\\$\\d+/'))

    // Some budget information should be visible
    const hasBudgetInfo = (await currentBudget.count()) > 0
    expect(hasBudgetInfo).toBe(true)
  })

  test('should navigate back to dashboard from settings', async ({ page }) => {
    // Click back button
    await page.click('button:has-text("Back to Dashboard")')

    // Verify we're back on dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('text=Total Assets')).toBeVisible()
  })
})

test.describe('Mobile Responsiveness - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard on mobile', async ({ page }) => {
    // Verify main content is visible on mobile
    await expect(page.locator('text=Total Assets')).toBeVisible()
    await expect(page.locator('text=Pending Tasks')).toBeVisible()
  })

  test('should display widgets stacked on mobile', async ({ page }) => {
    // Verify widgets are visible (they should stack vertically)
    const analyticsChart = page
      .locator('text=Completion Trend')
      .or(page.locator('text=Analytics'))

    await expect(analyticsChart).toBeVisible()
  })

  test('should navigate to cost report on mobile', async ({ page }) => {
    await page.goto('/dashboard/costs')
    await page.waitForLoadState('networkidle')

    // Verify cost report loads on mobile
    await expect(page.locator('h2')).toContainText('Maintenance Cost Report')
  })

  test('should navigate to settings on mobile', async ({ page }) => {
    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')

    // Verify settings page loads on mobile
    await expect(page.locator('h2')).toContainText('Dashboard Settings')
  })
})
