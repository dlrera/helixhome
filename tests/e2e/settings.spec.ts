import { test, expect } from '@playwright/test'

test.describe('Settings Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should navigate to settings from main navigation', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings')

    // Should redirect to general settings
    await expect(page).toHaveURL('/settings/general')
  })

  test('should display settings sidebar with all navigation items', async ({
    page,
  }) => {
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')

    // Verify sidebar navigation items are visible
    await expect(page.getByText('General')).toBeVisible()
    await expect(page.getByText('My Home')).toBeVisible()
    await expect(page.getByText('Notifications')).toBeVisible()
    await expect(page.getByText('Account')).toBeVisible()
    await expect(page.getByText('Data')).toBeVisible()
  })

  test('should navigate between settings pages via sidebar', async ({
    page,
  }) => {
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')

    // Navigate to Home settings
    await page.click('a:has-text("My Home")')
    await expect(page).toHaveURL('/settings/home')
    await expect(page.getByText('Property Information')).toBeVisible()

    // Navigate to Notifications
    await page.click('a:has-text("Notifications")')
    await expect(page).toHaveURL('/settings/notifications')
    await expect(page.getByText('Notification Channels')).toBeVisible()

    // Navigate back to General
    await page.click('a:has-text("General")')
    await expect(page).toHaveURL('/settings/general')
    await expect(page.getByText('Appearance')).toBeVisible()
  })

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')

    // General should be highlighted (active state)
    const generalLink = page.locator('a[href="/settings/general"]')
    await expect(generalLink).toHaveClass(/bg-\[#216093\]/)

    // Navigate to Home and verify highlight changes
    await page.click('a:has-text("My Home")')
    await page.waitForURL('/settings/home')

    const homeLink = page.locator('a[href="/settings/home"]')
    await expect(homeLink).toHaveClass(/bg-\[#216093\]/)
  })
})

test.describe('General Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')
  })

  test('should display appearance settings form', async ({ page }) => {
    // Verify Appearance section
    await expect(page.getByText('Appearance')).toBeVisible()
    await expect(page.getByText('Customize how HelixIntel looks')).toBeVisible()

    // Verify theme options
    await expect(page.getByText('Light')).toBeVisible()
    await expect(page.getByText('Dark')).toBeVisible()
    await expect(page.getByText('System')).toBeVisible()

    // Verify compact mode toggle
    await expect(page.getByText('Compact Mode')).toBeVisible()
  })

  test('should display regional settings form', async ({ page }) => {
    // Verify Regional section
    await expect(page.getByText('Regional')).toBeVisible()
    await expect(
      page.getByText('Set your currency and date format preferences')
    ).toBeVisible()

    // Verify currency selector exists
    await expect(page.getByLabel('Currency')).toBeVisible()

    // Verify date format selector exists
    await expect(page.getByLabel('Date Format')).toBeVisible()
  })

  test('should change theme selection', async ({ page }) => {
    // Click on Dark theme
    await page.click('button:has-text("Dark")')

    // Verify Dark theme is now selected (has active styling)
    const darkButton = page.locator('button:has-text("Dark")')
    await expect(darkButton).toHaveClass(/border-\[#216093\]/)

    // Click on Light theme
    await page.click('button:has-text("Light")')

    // Verify Light theme is now selected
    const lightButton = page.locator('button:has-text("Light")')
    await expect(lightButton).toHaveClass(/border-\[#216093\]/)
  })

  test('should save general settings and show toast', async ({ page }) => {
    // Make a change
    await page.click('button:has-text("Dark")')

    // Click Save Changes
    await page.click('button:has-text("Save Changes")')

    // Verify success toast appears
    await expect(page.getByText('Settings saved')).toBeVisible()
    await expect(
      page.getByText('Your preferences have been updated')
    ).toBeVisible()
  })

  test('should change currency selection', async ({ page }) => {
    // Open currency dropdown
    await page.click('#currency')

    // Select EUR
    await page.click('text=EUR (€)')

    // Verify selection changed
    await expect(page.locator('#currency')).toContainText('EUR')
  })

  test('should change date format selection', async ({ page }) => {
    // Open date format dropdown
    await page.click('#dateFormat')

    // Select DD/MM/YYYY format
    await page.click('text=DD/MM/YYYY (31/12/2024)')

    // Verify selection changed
    await expect(page.locator('#dateFormat')).toContainText('DD/MM/YYYY')
  })
})

test.describe('Home Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/settings/home')
    await page.waitForLoadState('networkidle')
  })

  test('should display home details form', async ({ page }) => {
    // Verify Property Information section
    await expect(page.getByText('Property Information')).toBeVisible()
    await expect(page.getByText('Basic details about your home')).toBeVisible()

    // Verify form fields
    await expect(page.getByLabel('Home Name *')).toBeVisible()
    await expect(page.getByLabel('Property Type')).toBeVisible()
    await expect(page.getByLabel('Year Built')).toBeVisible()
    await expect(page.getByLabel('Size (sq ft)')).toBeVisible()
    await expect(page.getByLabel('Climate Zone')).toBeVisible()
  })

  test('should display address section', async ({ page }) => {
    // Verify Address section
    await expect(page.getByText('Address')).toBeVisible()
    await expect(page.getByText('Your property location')).toBeVisible()

    // Verify address fields
    await expect(page.getByLabel('Street Address')).toBeVisible()
    await expect(page.getByLabel('City')).toBeVisible()
    await expect(page.getByLabel('State')).toBeVisible()
    await expect(page.getByLabel('ZIP Code')).toBeVisible()
  })

  test('should update home name and save', async ({ page }) => {
    // Get current home name
    const nameInput = page.getByLabel('Home Name *')

    // Clear and enter new name
    await nameInput.clear()
    await nameInput.fill('Updated Test Home')

    // Click Save Changes
    await page.click('button:has-text("Save Changes")')

    // Verify success toast
    await expect(page.getByText('Home details updated')).toBeVisible()
    await expect(
      page.getByText('Your property information has been saved')
    ).toBeVisible()
  })

  test('should show validation error for empty home name', async ({ page }) => {
    const nameInput = page.getByLabel('Home Name *')

    // Clear the home name
    await nameInput.clear()

    // Click Save Changes
    await page.click('button:has-text("Save Changes")')

    // Verify validation error
    await expect(page.getByText('Home name is required')).toBeVisible()
  })

  test('should update property type', async ({ page }) => {
    // Open property type dropdown
    await page.click('#propertyType')

    // Select Condo
    await page.click('text=Condo')

    // Verify selection
    await expect(page.locator('#propertyType')).toContainText('Condo')

    // Save and verify
    await page.click('button:has-text("Save Changes")')
    await expect(page.getByText('Home details updated')).toBeVisible()
  })

  test('should update address fields', async ({ page }) => {
    // Fill in address fields
    await page.getByLabel('Street Address').fill('456 Test Street')
    await page.getByLabel('City').fill('Test City')
    await page.getByLabel('State').fill('TX')
    await page.getByLabel('ZIP Code').fill('75001')

    // Save
    await page.click('button:has-text("Save Changes")')

    // Verify success
    await expect(page.getByText('Home details updated')).toBeVisible()
  })

  test('should select climate zone', async ({ page }) => {
    // Open climate zone dropdown
    await page.click('#climateZone')

    // Select Hot-Humid
    await page.click('text=Hot-Humid')

    // Verify selection
    await expect(page.locator('#climateZone')).toContainText('Hot-Humid')
  })
})

test.describe('Notification Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/settings/notifications')
    await page.waitForLoadState('networkidle')
  })

  test('should display notification channels section', async ({ page }) => {
    await expect(page.getByText('Notification Channels')).toBeVisible()
    await expect(
      page.getByText('Choose how you want to receive notifications')
    ).toBeVisible()

    // Verify channel toggles
    await expect(page.getByText('Email Notifications')).toBeVisible()
    await expect(page.getByText('Push Notifications')).toBeVisible()
  })

  test('should display notification types section', async ({ page }) => {
    await expect(page.getByText('Notification Types')).toBeVisible()
    await expect(
      page.getByText('Select which events trigger notifications')
    ).toBeVisible()

    // Verify notification type toggles
    await expect(page.getByText('Task Reminders')).toBeVisible()
    await expect(page.getByText('Maintenance Alerts')).toBeVisible()
    await expect(page.getByText('Weekly Digest')).toBeVisible()
  })

  test('should toggle email notifications', async ({ page }) => {
    // Find the switch for email notifications
    const emailSection = page.locator('div').filter({
      hasText: /^Email Notifications/,
    })
    const emailSwitch = emailSection.locator('button[role="switch"]')

    // Get current state and toggle
    const isChecked = await emailSwitch.getAttribute('data-state')
    await emailSwitch.click()

    // Verify state changed
    if (isChecked === 'checked') {
      await expect(emailSwitch).toHaveAttribute('data-state', 'unchecked')
    } else {
      await expect(emailSwitch).toHaveAttribute('data-state', 'checked')
    }
  })

  test('should toggle task reminders', async ({ page }) => {
    // Find the switch for task reminders
    const reminderSection = page.locator('div').filter({
      hasText: /^Task Reminders/,
    })
    const reminderSwitch = reminderSection.locator('button[role="switch"]')

    // Toggle and verify
    await reminderSwitch.click()
    await page.waitForTimeout(100)
  })

  test('should save notification preferences', async ({ page }) => {
    // Toggle a setting
    const weeklyDigestSection = page.locator('div').filter({
      hasText: /^Weekly Digest/,
    })
    const weeklySwitch = weeklyDigestSection.locator('button[role="switch"]')
    await weeklySwitch.click()

    // Save
    await page.click('button:has-text("Save Changes")')

    // Verify success toast
    await expect(page.getByText('Notifications updated')).toBeVisible()
    await expect(
      page.getByText('Your notification preferences have been saved')
    ).toBeVisible()
  })
})

test.describe('Mobile Responsiveness - Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/auth/signin')
    await page.fill('#email', 'admin@example.com')
    await page.fill('#password', 'homeportal')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display settings page on mobile', async ({ page }) => {
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')

    // Verify main content is visible
    await expect(page.getByText('Appearance')).toBeVisible()
    await expect(page.getByText('Regional')).toBeVisible()
  })

  test('should display home settings on mobile', async ({ page }) => {
    await page.goto('/settings/home')
    await page.waitForLoadState('networkidle')

    // Verify form is visible
    await expect(page.getByText('Property Information')).toBeVisible()
    await expect(page.getByLabel('Home Name *')).toBeVisible()
  })

  test('should display notification settings on mobile', async ({ page }) => {
    await page.goto('/settings/notifications')
    await page.waitForLoadState('networkidle')

    // Verify notifications form is visible
    await expect(page.getByText('Notification Channels')).toBeVisible()
    await expect(page.getByText('Notification Types')).toBeVisible()
  })

  test('should have touch-friendly targets on mobile', async ({ page }) => {
    await page.goto('/settings/general')
    await page.waitForLoadState('networkidle')

    // Verify Save button has minimum 44px height
    const saveButton = page.locator('button:has-text("Save Changes")')
    const boundingBox = await saveButton.boundingBox()

    expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Settings Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access settings without logging in
    await page.goto('/settings/general')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('should redirect to login for all settings pages', async ({ page }) => {
    // Test home settings
    await page.goto('/settings/home')
    await expect(page).toHaveURL(/\/auth\/signin/)

    // Test notifications settings
    await page.goto('/settings/notifications')
    await expect(page).toHaveURL(/\/auth\/signin/)
  })
})
