import { test, expect, type Page } from '@playwright/test'

/**
 * Critical Mobile Responsive Tests - Task 10
 *
 * Focused tests for the most critical mobile responsive issues:
 * 1. No horizontal scrolling on 375px viewport
 * 2. Navigation works on mobile
 * 3. Key pages are usable
 */

// Helper to check for horizontal scroll
async function checkNoHorizontalScroll(page: Page, pageName: string) {
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  const clientWidth = await page.evaluate(
    () => document.documentElement.clientWidth
  )

  expect(
    scrollWidth,
    `${pageName} should not have horizontal scroll`
  ).toBeLessThanOrEqual(clientWidth + 1)
}

// Helper to login
async function login(page: Page) {
  await page.goto('/login')
  await page.waitForSelector('input[type="email"]', {
    state: 'visible',
    timeout: 10000,
  })
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'homeportal')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 15000 })
}

test.describe('Critical Mobile Responsive Tests (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Dashboard - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Dashboard')
  })

  test('Assets page - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Assets page')
  })

  test('Tasks page - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Tasks page')
  })

  test('Templates page - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Templates page')
  })

  test('Asset create form - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.goto('/assets/create')
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Asset create form')
  })

  test('Mobile navigation menu works', async ({ page }) => {
    await login(page)

    // Mobile menu button should be visible
    const menuButton = page.locator('button[aria-label*="menu" i]').first()
    await expect(menuButton).toBeVisible({ timeout: 10000 })

    // Click to open menu
    await menuButton.click()
    await page.waitForTimeout(500) // Animation

    // Check navigation items are accessible
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /assets/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /tasks/i })).toBeVisible()
  })

  test('Touch targets are adequate (44x44px)', async ({ page }) => {
    await login(page)

    // Check mobile menu button
    const menuButton = page.locator('button[aria-label*="menu" i]').first()
    const menuButtonBox = await menuButton.boundingBox()

    expect(
      menuButtonBox?.width,
      'Menu button width >= 44px'
    ).toBeGreaterThanOrEqual(44)
    expect(
      menuButtonBox?.height,
      'Menu button height >= 44px'
    ).toBeGreaterThanOrEqual(44)
  })

  test('Charts responsive at 375px', async ({ page }) => {
    await login(page)
    await page.waitForLoadState('networkidle')

    // Wait for charts to load
    await page
      .waitForSelector('.recharts-wrapper', { timeout: 5000 })
      .catch(() => {
        // Charts may not be present, that's okay
      })

    const charts = page.locator('.recharts-wrapper')
    const chartCount = await charts.count()

    if (chartCount > 0) {
      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i)
        const chartBox = await chart.boundingBox()

        if (chartBox) {
          expect(
            chartBox.width,
            `Chart ${i} fits in viewport`
          ).toBeLessThanOrEqual(375)
        }
      }
    }
  })
})

test.describe('Critical Mobile Responsive Tests (320px)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('Dashboard - No horizontal scroll at 320px', async ({ page }) => {
    await login(page)
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Dashboard at 320px')
  })

  test('Assets page - No horizontal scroll at 320px', async ({ page }) => {
    await login(page)
    await page.goto('/assets')
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Assets at 320px')
  })
})

test.describe('Tablet Responsive Tests (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('Dashboard - No horizontal scroll', async ({ page }) => {
    await login(page)
    await page.waitForLoadState('networkidle')
    await checkNoHorizontalScroll(page, 'Dashboard at 768px')
  })

  test('Sidebar navigation visible on tablet', async ({ page }) => {
    await login(page)

    // Sidebar should be visible on larger screens
    const sidebar = page
      .locator('aside, nav[aria-label="Main navigation"]')
      .first()
    await expect(sidebar).toBeVisible({ timeout: 10000 })
  })
})
