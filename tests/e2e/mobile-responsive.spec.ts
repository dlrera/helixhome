import { test, expect, type Page } from '@playwright/test'

/**
 * Mobile Responsive Design Tests - Task 10
 *
 * Tests responsive behavior across all major viewport sizes
 * to ensure no horizontal scrolling and proper mobile UX.
 *
 * Viewport sizes tested:
 * - 320px: Small mobile (iPhone SE)
 * - 375px: Standard mobile (iPhone 12/13)
 * - 414px: Large mobile (iPhone 12 Pro Max)
 * - 768px: Tablet (iPad)
 * - 1024px: Desktop/Landscape tablet
 */

// Device viewport configurations
const viewports = [
  { name: 'Small Mobile (320px)', width: 320, height: 568 },
  { name: 'Standard Mobile (375px)', width: 375, height: 667 },
  { name: 'Large Mobile (414px)', width: 414, height: 896 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1024px)', width: 1024, height: 768 },
]

// Helper function to check for horizontal scroll
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
  ).toBeLessThanOrEqual(clientWidth + 1) // +1 for rounding tolerance
}

// Helper function to login
async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'admin123')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

test.describe('Mobile Responsive Design - Cross-Device Testing', () => {
  // Test each viewport separately
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } })

      test('Dashboard - No horizontal scroll', async ({ page }) => {
        await login(page)
        await page.waitForLoadState('networkidle')
        await checkNoHorizontalScroll(page, 'Dashboard')
      })

      test('Dashboard - All widgets visible and functional', async ({
        page,
      }) => {
        await login(page)
        await page.waitForLoadState('networkidle')

        // Check statistics cards
        await expect(page.getByText('Total Assets')).toBeVisible()
        await expect(page.getByText('Pending Tasks')).toBeVisible()

        // Check at least one chart/widget is visible
        const chartVisible =
          (await page.locator('.recharts-wrapper').count()) > 0 ||
          (await page.getByText('Activity Timeline').count()) > 0
        expect(
          chartVisible,
          'At least one dashboard widget should be visible'
        ).toBeTruthy()
      })

      test('Assets page - No horizontal scroll', async ({ page }) => {
        await login(page)
        await page.goto('/assets')
        await page.waitForLoadState('networkidle')
        await checkNoHorizontalScroll(page, 'Assets page')
      })

      test('Assets page - Cards/table responsive', async ({ page }) => {
        await login(page)
        await page.goto('/assets')
        await page.waitForLoadState('networkidle')

        // Check if assets are visible (either as cards or table)
        const hasAssets =
          (await page.locator('[data-testid="asset-card"]').count()) > 0 ||
          (await page.locator('table').count()) > 0 ||
          (await page.getByText('No assets').count()) > 0

        expect(
          hasAssets,
          'Assets should be displayed in responsive format'
        ).toBeTruthy()
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

      test('Templates page - Cards stack properly', async ({ page }) => {
        await login(page)
        await page.goto('/templates')
        await page.waitForLoadState('networkidle')

        // Check if templates are visible
        const templateCount = await page
          .locator('[data-testid="template-card"]')
          .count()
        expect(templateCount, 'Templates should be visible').toBeGreaterThan(0)
      })

      if (viewport.width <= 768) {
        // Mobile-specific tests
        test('Mobile navigation menu works', async ({ page }) => {
          await login(page)

          // Mobile menu button should be visible
          const menuButton = page
            .locator('button[aria-label*="menu" i]')
            .first()
          await expect(menuButton).toBeVisible()

          // Click to open menu
          await menuButton.click()

          // Wait for navigation to be visible
          await page.waitForTimeout(300) // Animation delay

          // Check navigation items are accessible
          const navItems = ['Dashboard', 'Assets', 'Tasks', 'Templates']
          for (const item of navItems) {
            const navLink = page.getByRole('link', { name: item, exact: false })
            await expect(navLink).toBeVisible()
          }
        })

        test('Touch targets are adequate (44x44px minimum)', async ({
          page,
        }) => {
          await login(page)

          // Check mobile menu button
          const menuButton = page
            .locator('button[aria-label*="menu" i]')
            .first()
          const menuButtonBox = await menuButton.boundingBox()
          expect(
            menuButtonBox?.width,
            'Mobile menu button width should be at least 44px'
          ).toBeGreaterThanOrEqual(44)
          expect(
            menuButtonBox?.height,
            'Mobile menu button height should be at least 44px'
          ).toBeGreaterThanOrEqual(44)

          // Check primary action buttons
          const buttons = page
            .getByRole('button')
            .filter({ hasText: /add|create/i })
          const buttonCount = await buttons.count()
          if (buttonCount > 0) {
            const firstButton = buttons.first()
            const buttonBox = await firstButton.boundingBox()
            expect(
              buttonBox?.height,
              'Action button height should be at least 44px'
            ).toBeGreaterThanOrEqual(44)
          }
        })

        test('Forms are usable on mobile', async ({ page }) => {
          await login(page)
          await page.goto('/assets/create')
          await page.waitForLoadState('networkidle')

          // Check no horizontal scroll
          await checkNoHorizontalScroll(page, 'Asset create form')

          // Check form inputs are visible and tappable
          const nameInput = page.locator('input[name="name"]')
          await expect(nameInput).toBeVisible()

          const inputBox = await nameInput.boundingBox()
          expect(
            inputBox?.height,
            'Form input height should be at least 44px'
          ).toBeGreaterThanOrEqual(44)

          // Check form can be filled
          await nameInput.fill('Test Asset')
          await expect(nameInput).toHaveValue('Test Asset')
        })
      }

      if (viewport.width >= 768) {
        // Tablet/Desktop-specific tests
        test('Sidebar navigation is visible', async ({ page }) => {
          await login(page)

          // Sidebar should be visible on larger screens
          const sidebar = page
            .locator('aside, nav[aria-label="Main navigation"]')
            .first()
          await expect(sidebar).toBeVisible()

          // Navigation items should be visible
          await expect(
            page.getByRole('link', { name: 'Dashboard' })
          ).toBeVisible()
          await expect(page.getByRole('link', { name: 'Assets' })).toBeVisible()
        })

        test('Dashboard uses grid layout efficiently', async ({ page }) => {
          await login(page)
          await page.waitForLoadState('networkidle')

          // Check that multiple widgets are visible (grid layout)
          const widgets = page.locator('[class*="grid"]').first()
          await expect(widgets).toBeVisible()
        })
      }
    })
  }

  test.describe('Responsive Recharts Tests', () => {
    test('Charts resize properly on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await login(page)
      await page.waitForLoadState('networkidle')

      // Wait for charts to load
      await page.waitForSelector('.recharts-wrapper', { timeout: 5000 })

      const charts = page.locator('.recharts-wrapper')
      const chartCount = await charts.count()

      if (chartCount > 0) {
        for (let i = 0; i < chartCount; i++) {
          const chart = charts.nth(i)
          const chartBox = await chart.boundingBox()

          expect(
            chartBox?.width,
            `Chart ${i} should fit within 375px viewport`
          ).toBeLessThanOrEqual(375)
        }
      }
    })

    test('Charts resize properly on tablet (768px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await login(page)
      await page.waitForLoadState('networkidle')

      // Wait for charts to load
      await page.waitForSelector('.recharts-wrapper', { timeout: 5000 })

      const charts = page.locator('.recharts-wrapper')
      const chartCount = await charts.count()

      if (chartCount > 0) {
        for (let i = 0; i < chartCount; i++) {
          const chart = charts.nth(i)
          const chartBox = await chart.boundingBox()

          expect(
            chartBox?.width,
            `Chart ${i} should fit within 768px viewport`
          ).toBeLessThanOrEqual(768)
        }
      }
    })
  })

  test.describe('Responsive Table Tests', () => {
    test('Tables scroll horizontally on narrow screens with scroll container', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await login(page)
      await page.goto('/assets')
      await page.waitForLoadState('networkidle')

      // Check if table exists
      const table = page.locator('table').first()
      const tableExists = (await table.count()) > 0

      if (tableExists) {
        // Table should be in a scroll container
        const scrollContainer = page
          .locator('.overflow-x-auto, [class*="overflow-x"]')
          .first()
        await expect(scrollContainer).toBeVisible()

        // Page itself should not scroll horizontally
        await checkNoHorizontalScroll(page, 'Assets page with table')
      }
    })

    test('Tables display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 })
      await login(page)
      await page.goto('/tasks')
      await page.waitForLoadState('networkidle')

      const table = page.locator('table').first()
      const tableExists = (await table.count()) > 0

      if (tableExists) {
        // Table should be visible
        await expect(table).toBeVisible()

        // Check for table headers
        const headers = table.locator('thead th')
        const headerCount = await headers.count()
        expect(headerCount, 'Table should have headers').toBeGreaterThan(0)
      }
    })
  })

  test.describe('Critical User Flows - Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('Can navigate between pages on mobile', async ({ page }) => {
      await login(page)

      // Open mobile menu
      const menuButton = page.locator('button[aria-label*="menu" i]').first()
      await menuButton.click()
      await page.waitForTimeout(300)

      // Navigate to Assets
      await page.getByRole('link', { name: 'Assets', exact: false }).click()
      await page.waitForURL('**/assets')
      await checkNoHorizontalScroll(page, 'Assets page after navigation')

      // Navigate to Tasks
      await menuButton.click()
      await page.waitForTimeout(300)
      await page.getByRole('link', { name: 'Tasks', exact: false }).click()
      await page.waitForURL('**/tasks')
      await checkNoHorizontalScroll(page, 'Tasks page after navigation')
    })

    test('Can create asset on mobile', async ({ page }) => {
      await login(page)

      // Navigate to asset creation
      await page.goto('/assets/create')
      await checkNoHorizontalScroll(page, 'Asset create page')

      // Fill form
      await page.fill('input[name="name"]', 'Mobile Test Asset')

      // Select category if dropdown exists
      const categorySelect = page.locator('select[name="category"]')
      if ((await categorySelect.count()) > 0) {
        await categorySelect.selectOption('APPLIANCE')
      }

      // Check form is usable
      const nameInput = page.locator('input[name="name"]')
      await expect(nameInput).toHaveValue('Mobile Test Asset')
    })
  })
})
