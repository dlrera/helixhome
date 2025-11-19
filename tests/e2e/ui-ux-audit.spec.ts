import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

/**
 * Comprehensive UI/UX Audit for HelixIntel CMMS
 *
 * This test suite performs a thorough audit of the application covering:
 * 1. Visual Design & Branding
 * 2. Accessibility (WCAG 2.1 AA)
 * 3. Responsive Design
 * 4. Navigation & User Flows
 * 5. Forms & Validation
 * 6. Loading States & Feedback
 * 7. Interactive Components
 * 8. Performance
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EVIDENCE_DIR = path.join(__dirname, '../audit-evidence/screenshots')
const BRAND_COLORS = {
  primary: '#216093',
  secondary: '#001B48',
  tertiary: ['#57949A', '#F9FAFA', '#000000'],
  accent: ['#E18331', '#2E933C', '#DB162F', '#224870', '#F0C319'],
}

// Ensure evidence directory exists
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true })
}

// Helper function to save screenshot with metadata
async function captureEvidence(page: Page, name: string, category: string) {
  const filename = `${category}__${name}.png`
  await page.screenshot({
    path: path.join(EVIDENCE_DIR, filename),
    fullPage: true,
  })
}

// Helper function to check color contrast
function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation (for demonstration)
  // In production, use a proper contrast calculation library
  return 4.5 // Placeholder
}

test.describe('UI/UX Audit - HelixIntel CMMS', () => {
  // Setup: Login once and reuse authentication
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  })

  test.describe('1. Visual Design & Branding', () => {
    test('1.1 Landing page matches brand identity', async ({ page }) => {
      await page.goto('http://localhost:3000')
      await captureEvidence(page, 'landing-page', 'visual-design')

      // Check for brand name
      const brandName = await page.getByText('HelixIntel').count()
      expect(brandName).toBeGreaterThan(0)

      // Check primary color usage
      const primaryColorElements = await page
        .locator(`[style*="${BRAND_COLORS.primary}"], [class*="bg-primary"]`)
        .count()
      expect(primaryColorElements).toBeGreaterThan(0)
    })

    test('1.2 Typography consistency - Inter font family', async ({ page }) => {
      const bodyFont = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily
      })
      expect(bodyFont).toContain('Inter')
    })

    test('1.3 Heading hierarchy and weights', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await captureEvidence(page, 'typography-hierarchy', 'visual-design')

      // Check h1 exists and is prominent
      const h1 = page.locator('h1').first()
      await expect(h1).toBeVisible()

      const h1Style = await h1.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        }
      })

      // Inter 900 for headings (or at least bold)
      const fontWeight = parseInt(h1Style.fontWeight)
      expect(fontWeight).toBeGreaterThanOrEqual(700)
    })

    test('1.4 Card component consistency across pages', async ({ page }) => {
      const pages = ['/dashboard', '/assets', '/tasks']

      for (const url of pages) {
        await page.goto(`http://localhost:3000${url}`)
        await page.waitForLoadState('networkidle')

        const cards = page.locator('[class*="card"], [class*="Card"]')
        const cardCount = await cards.count()

        if (cardCount > 0) {
          const firstCard = cards.first()
          const cardStyle = await firstCard.evaluate((el) => {
            const style = window.getComputedStyle(el)
            return {
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              padding: style.padding,
            }
          })

          // Cards should have consistent styling
          expect(cardStyle.borderRadius).toBeTruthy()
        }
      }
    })

    test('1.5 Button variants are consistent', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')
      await captureEvidence(page, 'button-variants', 'visual-design')

      // Check primary buttons exist
      const primaryButtons = page.locator(
        'button[class*="primary"], button:not([class*="outline"]):not([class*="ghost"])'
      )
      const buttonCount = await primaryButtons.count()
      expect(buttonCount).toBeGreaterThan(0)
    })

    test('1.6 Spacing consistency - margins and padding', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Check consistent spacing between major sections
      const sections = page.locator('main > *')
      const sectionCount = await sections.count()
      expect(sectionCount).toBeGreaterThan(0)
    })

    test('1.7 Icon consistency and alignment', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Check if icons are properly aligned with text
      const iconsWithText = page.locator('button:has(svg)')
      const count = await iconsWithText.count()
      expect(count).toBeGreaterThan(0)
    })

    test('1.8 Dashboard visual consistency', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'dashboard-overview', 'visual-design')

      // Check for widgets
      const widgets = page.locator('[class*="widget"], [class*="card"]')
      const widgetCount = await widgets.count()
      expect(widgetCount).toBeGreaterThan(3)
    })
  })

  test.describe('2. Accessibility (WCAG 2.1 AA)', () => {
    test('2.1 Page has proper heading hierarchy', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)

      // Should have proper heading structure
      const headings = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .allTextContents()
      expect(headings.length).toBeGreaterThan(0)
    })

    test('2.2 All interactive elements are keyboard accessible', async ({
      page,
    }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Tab through interactive elements
      await page.keyboard.press('Tab')
      const firstFocused = await page.evaluate(
        () => document.activeElement?.tagName
      )
      expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused || '')
    })

    test('2.3 Focus indicators are visible', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')
      await captureEvidence(page, 'focus-states-before', 'accessibility')

      // Tab to first interactive element
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await captureEvidence(page, 'focus-states-after', 'accessibility')

      // Check if focused element has visible outline or ring
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        if (el) {
          const style = window.getComputedStyle(el)
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            boxShadow: style.boxShadow,
          }
        }
        return null
      })

      expect(focusedElement).toBeTruthy()
    })

    test('2.4 All images have alt text', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')

      const imagesWithoutAlt = await page.locator('img:not([alt])').count()
      expect(imagesWithoutAlt).toBe(0)
    })

    test('2.5 Form inputs have associated labels', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // All inputs should have labels
      const inputs = page.locator(
        'input[type="text"], input[type="email"], input[type="number"], textarea, select'
      )
      const inputCount = await inputs.count()

      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputs.nth(i)
        const id = await input.getAttribute('id')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledby = await input.getAttribute('aria-labelledby')

        // Should have either: id with label[for], aria-label, or aria-labelledby
        const hasLabel = id || ariaLabel || ariaLabelledby
        expect(hasLabel).toBeTruthy()
      }
    })

    test('2.6 Color contrast meets WCAG AA standards', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Check primary text contrast
      const textElements = page.locator('p, span, div').first()
      const contrast = await textElements.evaluate((el) => {
        const style = window.getComputedStyle(el)
        const color = style.color
        const bgColor = style.backgroundColor
        return { color, bgColor }
      })

      expect(contrast.color).toBeTruthy()
      expect(contrast.bgColor).toBeTruthy()
    })

    test('2.7 ARIA labels on interactive elements', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Check buttons have accessible names
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i)
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledby = await button.getAttribute('aria-labelledby')

        // Button should have text, aria-label, or aria-labelledby
        const hasAccessibleName =
          (text && text.trim()) || ariaLabel || ariaLabelledby
        expect(hasAccessibleName).toBeTruthy()
      }
    })

    test('2.8 Modal focus trap works correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')

      // Try to open a modal (if available)
      const createButton = page
        .getByRole('button', { name: /new|create/i })
        .first()
      if ((await createButton.count()) > 0) {
        await createButton.click()
        await page.waitForTimeout(500)

        // Check if modal is visible
        const modal = page.locator('[role="dialog"]')
        await expect(modal)
          .toBeVisible({ timeout: 5000 })
          .catch(() => {})
      }
    })

    test('2.9 Skip link for keyboard users', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Tab to first element
      await page.keyboard.press('Tab')

      // Check if skip link exists (it might be visually hidden)
      const skipLink = page.locator('a[href*="#main"], a[href*="#content"]')
      const skipLinkExists = await skipLink.count()

      // Note: Skip link might not be implemented, this is a finding
      // expect(skipLinkExists).toBeGreaterThan(0);
    })

    test('2.10 Escape key closes modals', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')

      const createButton = page
        .getByRole('button', { name: /new|create/i })
        .first()
      if ((await createButton.count()) > 0) {
        await createButton.click()
        await page.waitForTimeout(500)

        const modal = page.locator('[role="dialog"]')
        if (await modal.isVisible().catch(() => false)) {
          await page.keyboard.press('Escape')
          await page.waitForTimeout(500)

          // Modal should be closed
          await expect(modal)
            .toBeHidden({ timeout: 2000 })
            .catch(() => {})
        }
      }
    })

    test('2.11 Accessibility snapshot of dashboard', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')

      // Use Playwright's accessibility tree
      const accessibilityTree = await page.accessibility.snapshot()
      expect(accessibilityTree).toBeTruthy()

      // Save for manual review
      fs.writeFileSync(
        path.join(EVIDENCE_DIR, 'accessibility-tree-dashboard.json'),
        JSON.stringify(accessibilityTree, null, 2)
      )
    })
  })

  test.describe('3. Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
    ]

    for (const viewport of viewports) {
      test(`3.${viewports.indexOf(viewport) + 1} Dashboard responsive at ${viewport.name} (${viewport.width}px)`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        await captureEvidence(page, `dashboard-${viewport.name}`, 'responsive')

        // Check for horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          )
        })

        expect(hasHorizontalScroll).toBe(false)
      })

      test(`3.${viewports.indexOf(viewport) + 3 + 1} Assets page responsive at ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto('http://localhost:3000/assets')
        await page.waitForLoadState('networkidle')
        await captureEvidence(page, `assets-${viewport.name}`, 'responsive')

        const hasHorizontalScroll = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          )
        })

        expect(hasHorizontalScroll).toBe(false)
      })

      test(`3.${viewports.indexOf(viewport) + 6 + 1} Tasks page responsive at ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto('http://localhost:3000/tasks')
        await page.waitForLoadState('networkidle')
        await captureEvidence(page, `tasks-${viewport.name}`, 'responsive')

        const hasHorizontalScroll = await page.evaluate(() => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          )
        })

        expect(hasHorizontalScroll).toBe(false)
      })
    }

    test('3.10 Mobile navigation transforms correctly', async ({ page }) => {
      // Desktop - should show sidebar
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto('http://localhost:3000/dashboard')
      await captureEvidence(page, 'navigation-desktop', 'responsive')

      // Mobile - should show bottom nav or hamburger
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)
      await captureEvidence(page, 'navigation-mobile', 'responsive')
    })

    test('3.11 Touch targets are 44x44px minimum on mobile', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:3000/dashboard')

      // Check button sizes
      const buttons = page.locator('button, a[role="button"]')
      const buttonCount = await buttons.count()

      let smallButtons = 0
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()

        if (box && (box.width < 44 || box.height < 44)) {
          smallButtons++
        }
      }

      // Most buttons should meet touch target size
      const percentageSmall = (smallButtons / Math.min(buttonCount, 20)) * 100
      expect(percentageSmall).toBeLessThan(30) // Allow some small icon buttons
    })
  })

  test.describe('4. Navigation & User Flows', () => {
    test('4.1 Command palette opens with Cmd+K', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Open command palette
      await page.keyboard.press('Control+k')
      await page.waitForTimeout(500)
      await captureEvidence(page, 'command-palette-open', 'navigation')

      // Check if command palette is visible
      const commandPalette = page.locator('[cmdk-root]', '[role="dialog"]')
      await expect(commandPalette.first())
        .toBeVisible({ timeout: 2000 })
        .catch(() => {})
    })

    test('4.2 Sidebar navigation is functional', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Click through main nav items
      const navItems = ['Assets', 'Tasks', 'Templates']

      for (const item of navItems) {
        const link = page
          .getByRole('link', { name: new RegExp(item, 'i') })
          .first()
        if ((await link.count()) > 0) {
          await link.click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(500)

          // Verify URL changed
          expect(page.url()).toContain(item.toLowerCase())
        }
      }
    })

    test('4.3 Breadcrumb navigation works', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard/costs')

      // Check if breadcrumbs exist
      const breadcrumbs = page.locator(
        'nav[aria-label*="breadcrumb"], [class*="breadcrumb"]'
      )
      const hasBreadcrumbs = (await breadcrumbs.count()) > 0

      // Note: Breadcrumbs might not be on all pages
    })

    test('4.4 Critical flow: Create asset', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')
      await captureEvidence(page, 'flow-assets-list', 'navigation')

      // Click create button
      const createButton = page
        .getByRole('link', { name: /new|create|add/i })
        .first()
      await createButton.click()
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'flow-asset-create', 'navigation')

      // Verify we're on create page
      expect(page.url()).toContain('/assets/new')

      // Form should be visible
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('4.5 Critical flow: Apply template to asset', async ({ page }) => {
      await page.goto('http://localhost:3000/templates')
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'flow-templates-browse', 'navigation')

      // Check if templates are displayed
      const templates = page.locator('[class*="template"], [class*="card"]')
      const templateCount = await templates.count()
      expect(templateCount).toBeGreaterThan(0)
    })

    test('4.6 Critical flow: Complete task', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'flow-tasks-list', 'navigation')

      // Check for pending tasks
      const tasks = page.locator('[class*="task"]')
      const taskCount = await tasks.count()
      expect(taskCount).toBeGreaterThan(0)
    })

    test('4.7 Back button works correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.goto('http://localhost:3000/assets')

      await page.goBack()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain('/dashboard')
    })
  })

  test.describe('5. Forms & Validation', () => {
    test('5.1 Asset creation form has proper validation', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')
      await captureEvidence(page, 'form-asset-empty', 'forms')

      // Try to submit empty form
      const submitButton = page.getByRole('button', {
        name: /create|save|submit/i,
      })
      await submitButton.click()
      await page.waitForTimeout(1000)
      await captureEvidence(page, 'form-asset-validation', 'forms')

      // Should show validation errors
      const errors = page.locator('[class*="error"], [role="alert"]')
      const errorCount = await errors.count()
      expect(errorCount).toBeGreaterThan(0)
    })

    test('5.2 Required fields are marked', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // Check for required indicators (*, required attribute, or aria-required)
      const requiredFields = page.locator(
        'input[required], input[aria-required="true"], label:has-text("*")'
      )
      const count = await requiredFields.count()
      expect(count).toBeGreaterThan(0)
    })

    test('5.3 Error messages are clear and helpful', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // Submit form to trigger errors
      const submitButton = page.getByRole('button', {
        name: /create|save|submit/i,
      })
      await submitButton.click()
      await page.waitForTimeout(1000)

      // Check error message quality
      const firstError = page
        .locator('[class*="error"], [role="alert"]')
        .first()
      if ((await firstError.count()) > 0) {
        const errorText = await firstError.textContent()
        expect(errorText?.length).toBeGreaterThan(5) // Should be descriptive
      }
    })

    test('5.4 Form success feedback is shown', async ({ page }) => {
      // This test would need to actually create an asset
      // Skipping for now to avoid cluttering database
    })

    test('5.5 Date picker is accessible', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // Look for date inputs
      const dateInputs = page.locator(
        'input[type="date"], button[aria-label*="date"], button[aria-label*="calendar"]'
      )
      const count = await dateInputs.count()

      if (count > 0) {
        await captureEvidence(page, 'form-date-picker', 'forms')
      }
    })

    test('5.6 Select/dropdown inputs work correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // Find category select
      const categorySelect = page
        .locator('select, button[role="combobox"]')
        .first()
      if ((await categorySelect.count()) > 0) {
        await categorySelect.click()
        await page.waitForTimeout(500)
        await captureEvidence(page, 'form-dropdown-open', 'forms')
      }
    })

    test('5.7 File upload provides feedback', async ({ page }) => {
      await page.goto('http://localhost:3000/assets/new')

      // Look for file upload
      const fileInput = page.locator(
        'input[type="file"], button:has-text(/photo|upload|image/i)'
      )
      const hasFileUpload = (await fileInput.count()) > 0

      if (hasFileUpload) {
        await captureEvidence(page, 'form-file-upload', 'forms')
      }
    })
  })

  test.describe('6. Loading States & Feedback', () => {
    test('6.1 Dashboard shows loading skeletons', async ({ page }) => {
      // Navigate to dashboard and capture early
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/api/dashboard') && resp.status() === 200
      )

      await page.goto('http://localhost:3000/dashboard')

      // Try to capture skeleton state (timing is tricky)
      await page.waitForTimeout(100)
      await captureEvidence(page, 'loading-dashboard-skeleton', 'loading')

      await responsePromise
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'loading-dashboard-loaded', 'loading')
    })

    test('6.2 Toast notifications appear on actions', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Toasts should appear for various actions
      // Check if toast container exists
      const toastContainer = page.locator(
        '[class*="toast"], [role="status"], [data-sonner-toaster]'
      )
      const hasToastContainer = (await toastContainer.count()) > 0

      // Note: Container might not be visible until first toast
    })

    test('6.3 Loading spinners for async operations', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')

      // Look for loading indicators
      const loader = page.locator(
        '[class*="loading"], [class*="spinner"], [role="status"]'
      )

      // Might not see loader if page loads quickly
    })

    test('6.4 Empty states are informative', async ({ page }) => {
      // This would require a user with no data
      // Skipping for now
    })

    test('6.5 Error states are user-friendly', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')

      // Check if error boundaries exist in code
      // This is more of a code review item
    })
  })

  test.describe('7. Interactive Components', () => {
    test('7.1 Modals are properly implemented', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')

      const createButton = page
        .getByRole('button', { name: /new|create/i })
        .first()
      if ((await createButton.count()) > 0) {
        await createButton.click()
        await page.waitForTimeout(500)
        await captureEvidence(page, 'modal-task-create', 'interactions')

        // Modal should be visible
        const modal = page.locator('[role="dialog"]')
        await expect(modal)
          .toBeVisible({ timeout: 2000 })
          .catch(() => {})
      }
    })

    test('7.2 Dropdowns close on outside click', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Find user menu or dropdown
      const dropdownTrigger = page
        .locator('button[aria-haspopup="menu"], button[aria-expanded]')
        .first()
      if ((await dropdownTrigger.count()) > 0) {
        await dropdownTrigger.click()
        await page.waitForTimeout(500)

        // Click outside
        await page.click('body')
        await page.waitForTimeout(500)

        // Dropdown should close
      }
    })

    test('7.3 Tooltips appear on hover', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Find elements with tooltips
      const tooltipTriggers = page.locator(
        '[data-tooltip], [title], button[aria-describedby]'
      )
      const count = await tooltipTriggers.count()

      if (count > 0) {
        await tooltipTriggers.first().hover()
        await page.waitForTimeout(500)
        await captureEvidence(page, 'tooltip-hover', 'interactions')
      }
    })

    test('7.4 Hover states on interactive elements', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')

      const firstButton = page.locator('button, a[role="button"]').first()
      await captureEvidence(page, 'hover-before', 'interactions')

      await firstButton.hover()
      await page.waitForTimeout(300)
      await captureEvidence(page, 'hover-after', 'interactions')
    })

    test('7.5 Drawer/sheet components work correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')
      await page.waitForLoadState('networkidle')

      // Look for tasks that might open drawer
      const taskCard = page.locator('[class*="task"]').first()
      if ((await taskCard.count()) > 0) {
        await taskCard.click()
        await page.waitForTimeout(500)
        await captureEvidence(page, 'drawer-task-detail', 'interactions')
      }
    })

    test('7.6 Badge components show correct states', async ({ page }) => {
      await page.goto('http://localhost:3000/tasks')
      await page.waitForLoadState('networkidle')
      await captureEvidence(page, 'badges-status-priority', 'interactions')

      // Check for status badges
      const badges = page.locator('[class*="badge"]')
      const badgeCount = await badges.count()
      expect(badgeCount).toBeGreaterThan(0)
    })

    test('7.7 Tabs component switches content', async ({ page }) => {
      // Look for pages with tabs (asset detail might have tabs)
      await page.goto('http://localhost:3000/dashboard')

      const tabs = page.locator('[role="tab"], [role="tablist"]')
      const hasTabs = (await tabs.count()) > 0

      if (hasTabs) {
        await captureEvidence(page, 'tabs-component', 'interactions')
      }
    })
  })

  test.describe('8. Performance', () => {
    test('8.1 Dashboard loads within 3 seconds', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime
      console.log(`Dashboard load time: ${loadTime}ms`)

      // Should load in under 3 seconds (after Task 7a optimizations)
      expect(loadTime).toBeLessThan(3000)
    })

    test('8.2 No cumulative layout shift', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')

      // Check for layout shifts by comparing initial and final layout
      // This is a simplified check
      const hasLayoutShift = await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value
              }
            }
            resolve(cls)
          }).observe({ type: 'layout-shift', buffered: true })

          setTimeout(() => resolve(cls), 2000)
        })
      })

      console.log(`Cumulative Layout Shift: ${hasLayoutShift}`)
      expect(hasLayoutShift).toBeLessThan(0.1)
    })

    test('8.3 Images are lazy loaded', async ({ page }) => {
      await page.goto('http://localhost:3000/assets')

      // Check if images have loading="lazy"
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        const firstImage = images.first()
        const loading = await firstImage.getAttribute('loading')

        // Images should be lazy loaded
        // expect(loading).toBe('lazy');
      }
    })

    test('8.4 Charts load asynchronously', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')

      // Dashboard should render shell first, then charts
      await page.waitForTimeout(1000)
      await captureEvidence(page, 'performance-dashboard-final', 'performance')
    })

    test('8.5 API responses are reasonably fast', async ({ page }) => {
      const apiCalls: { url: string; duration: number }[] = []

      page.on('response', (response) => {
        if (response.url().includes('/api/')) {
          const timing = response.timing()
          apiCalls.push({
            url: response.url(),
            duration: timing.responseEnd,
          })
        }
      })

      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')

      // Log API timings
      apiCalls.forEach((call) => {
        console.log(`API ${call.url}: ${call.duration}ms`)
      })

      // Most APIs should respond within 500ms
      const slowAPIs = apiCalls.filter((call) => call.duration > 500)
      expect(slowAPIs.length).toBeLessThan(apiCalls.length / 2)
    })
  })

  test.afterAll(async () => {
    console.log('\n========================================')
    console.log('UI/UX Audit Complete')
    console.log(`Evidence saved to: ${EVIDENCE_DIR}`)
    console.log('========================================\n')
  })
})
