import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('displays signup form with all fields', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()
    await expect(page.getByLabel('Full Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Create account' })
    ).toBeVisible()
  })

  test('shows password strength indicators when typing password', async ({
    page,
  }) => {
    const passwordInput = page.getByLabel('Password', { exact: true })
    await passwordInput.fill('weak')

    // Should show password requirements
    await expect(page.getByText('At least 8 characters')).toBeVisible()
    await expect(page.getByText('One lowercase letter')).toBeVisible()
    await expect(page.getByText('One uppercase letter')).toBeVisible()
    await expect(page.getByText('One number')).toBeVisible()
  })

  test('shows validation errors for empty form submission', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Create account' }).click()

    // Form should show validation errors
    await expect(
      page.getByText(/Name must be at least 2 characters/i)
    ).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Password', { exact: true }).fill('Password123')
    await page.getByLabel('Confirm Password').fill('Password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText(/Invalid email/i)).toBeVisible()
  })

  test('shows validation error for weak password', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('weak')
    await page.getByLabel('Confirm Password').fill('weak')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(
      page.getByText(/Password must be at least 8 characters/i)
    ).toBeVisible()
  })

  test('shows validation error for mismatched passwords', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('Password123')
    await page.getByLabel('Confirm Password').fill('DifferentPassword123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByText(/Passwords don't match/i)).toBeVisible()
  })

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true })
    await passwordInput.fill('Password123')

    // Initially password type
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click show password button
    await page.getByRole('button', { name: 'Show password' }).first().click()

    // Should now be text type
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('has link to sign in page', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: 'Sign in' })
    await expect(signInLink).toBeVisible()
    await signInLink.click()
    await expect(page).toHaveURL('/auth/signin')
  })
})

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/forgot-password')
  })

  test('displays forgot password form', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Reset Password' })
    ).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Send reset link' })
    ).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByText(/Invalid email/i)).toBeVisible()
  })

  test('shows success state after submitting valid email', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()

    // Should show success state (API will return success regardless of email existence)
    await expect(page.getByText(/If an account exists/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('has back to sign in link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back to sign in/i })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL('/auth/signin')
  })

  test('allows trying again after email sent', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(page.getByText(/If an account exists/i)).toBeVisible({
      timeout: 10000,
    })

    // Click try again
    await page.getByText(/Didn't receive the email/i).click()

    // Should show form again
    await expect(page.getByLabel('Email')).toBeVisible()
  })
})

test.describe('Reset Password', () => {
  test('shows error for missing token', async ({ page }) => {
    await page.goto('/auth/reset-password')

    await expect(page.getByText(/No reset token provided/i)).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Request new reset link' })
    ).toBeVisible()
  })

  test('shows error for invalid token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=invalid-token')

    await expect(page.getByText(/Invalid/i)).toBeVisible({ timeout: 10000 })
  })

  test('has link to request new reset link on error', async ({ page }) => {
    await page.goto('/auth/reset-password?token=invalid')

    await expect(
      page.getByRole('link', { name: 'Request new reset link' })
    ).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Sign In Page Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin')
  })

  test('has link to signup page', async ({ page }) => {
    const signUpLink = page.getByRole('link', { name: 'Sign up' })
    await expect(signUpLink).toBeVisible()
    await signUpLink.click()
    await expect(page).toHaveURL('/auth/signup')
  })

  test('has link to forgot password page', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /Forgot password/i })
    await expect(forgotLink).toBeVisible()
    await forgotLink.click()
    await expect(page).toHaveURL('/auth/forgot-password')
  })
})

test.describe('Auth Flow Navigation', () => {
  test('can navigate from signin to signup to forgot password', async ({
    page,
  }) => {
    // Start at signin
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible()

    // Go to signup
    await page.getByRole('link', { name: 'Sign up' }).click()
    await expect(page).toHaveURL('/auth/signup')
    await expect(
      page.getByRole('heading', { name: 'Create Account' })
    ).toBeVisible()

    // Go back to signin
    await page.getByRole('link', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/auth/signin')

    // Go to forgot password
    await page.getByRole('link', { name: /Forgot password/i }).click()
    await expect(page).toHaveURL('/auth/forgot-password')
    await expect(
      page.getByRole('heading', { name: 'Reset Password' })
    ).toBeVisible()

    // Go back to signin
    await page.getByRole('link', { name: /Back to sign in/i }).click()
    await expect(page).toHaveURL('/auth/signin')
  })
})
