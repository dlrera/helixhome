# Task 16: User Registration and Password Reset

## Overview

This task implements user self-registration and password reset functionality for the HelixIntel platform. Currently, users can only be created via the database seed script. The sign-in page already links to a `/auth/signup` page that doesn't exist, and there's a placeholder forgot-password page without actual functionality.

**Current State**:

- Sign-in page exists at `/auth/signin` and links to `/auth/signup` (404)
- Forgot password page exists at `/auth/forgot-password` but is a non-functional placeholder
- `registerSchema` validation already exists in `/lib/validation/auth.ts`
- Resend email package is installed but not configured
- `VerificationToken` model exists in Prisma schema (can be repurposed for password reset)

**Goal**: Enable users to self-register for accounts and reset their passwords via email, completing the authentication flow.

## Core Objectives

- **Implement user registration** with email/password signup form
- **Create registration API** with email uniqueness validation
- **Implement password reset request flow** with email sending
- **Implement password reset completion** with secure token verification
- **Set up email infrastructure** using Resend
- **Create email templates** for password reset emails
- **Add proper validation** and security measures throughout

## Technical Requirements

### 1. Email Infrastructure Setup

**Purpose**: Enable sending transactional emails for password reset

**File**: `/lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email sending will fail.')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'HelixIntel <noreply@helixintel.com>'
```

**Environment Variables** (add to `.env.example`):

```bash
# Email (Resend)
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="HelixIntel <noreply@yourdomain.com>"
```

### 2. Email Templates

**File**: `/lib/email/templates/password-reset.ts`

```typescript
interface PasswordResetEmailProps {
  userName: string | null
  resetUrl: string
  expiresIn: string
}

export function getPasswordResetEmailHtml({
  userName,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #216093; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-weight: 900;">HelixIntel</h1>
  </div>

  <div style="background: #f9fafa; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #001B48; margin-top: 0;">Reset Your Password</h2>

    <p>Hi${userName ? ` ${userName}` : ''},</p>

    <p>We received a request to reset your password. Click the button below to create a new password:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #216093; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p style="color: #666; font-size: 14px;">
      This link will expire in ${expiresIn}. If you didn't request a password reset, you can safely ignore this email.
    </p>

    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:
      <br>
      <a href="${resetUrl}" style="color: #216093; word-break: break-all;">${resetUrl}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      This email was sent by HelixIntel. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
    </p>
  </div>
</body>
</html>
  `
}

export function getPasswordResetEmailText({
  userName,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps): string {
  return `
Reset Your Password

Hi${userName ? ` ${userName}` : ''},

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

This link will expire in ${expiresIn}. If you didn't request a password reset, you can safely ignore this email.

---
This email was sent by HelixIntel.
  `.trim()
}
```

### 3. Validation Schemas

**Update**: `/lib/validation/auth.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
```

### 4. Database Schema Update

**Add to** `prisma/schema.prisma`:

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}
```

**Update User model** to add relation:

```prisma
model User {
  // ... existing fields ...

  passwordResetTokens PasswordResetToken[]

  // ... existing relations ...
}
```

**Migration command**:

```bash
npx prisma migrate dev --name add_password_reset_token
```

### 5. Registration API Endpoint

**File**: `/app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validation/auth'
import {
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    // Create default home for the user
    await prisma.home.create({
      data: {
        userId: user.id,
        name: 'My Home',
      },
    })

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

### 6. Password Reset Request API Endpoint

**File**: `/app/api/auth/forgot-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, EMAIL_FROM } from '@/lib/email/resend'
import { forgotPasswordSchema } from '@/lib/validation/auth'
import {
  getPasswordResetEmailHtml,
  getPasswordResetEmailText,
} from '@/lib/email/templates/password-reset'
import {
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses'
import crypto from 'crypto'

const TOKEN_EXPIRY_HOURS = 1

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { email } = result.data

    // Always return success (security: don't reveal if email exists)
    const successResponse = NextResponse.json({
      message:
        'If an account exists with this email, you will receive password reset instructions.',
    })

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal that email doesn't exist
      return successResponse
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    // Invalidate any existing reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark as used to invalidate
      },
    })

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

    // Send email
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Reset Your HelixIntel Password',
        html: getPasswordResetEmailHtml({
          userName: user.name,
          resetUrl,
          expiresIn: `${TOKEN_EXPIRY_HOURS} hour${TOKEN_EXPIRY_HOURS > 1 ? 's' : ''}`,
        }),
        text: getPasswordResetEmailText({
          userName: user.name,
          resetUrl,
          expiresIn: `${TOKEN_EXPIRY_HOURS} hour${TOKEN_EXPIRY_HOURS > 1 ? 's' : ''}`,
        }),
      })
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Don't expose email sending failures to user
    }

    return successResponse
  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

### 7. Password Reset Completion API Endpoint

**File**: `/app/api/auth/reset-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { resetPasswordSchema } from '@/lib/validation/auth'
import {
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return validationErrorResponse(result.error)
    }

    const { token, password } = result.data

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          error:
            'This reset link has already been used. Please request a new one.',
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and mark token as used (transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      message:
        'Password reset successfully. You can now sign in with your new password.',
    })
  } catch (error) {
    return serverErrorResponse(error)
  }
}

// GET endpoint to verify token validity (for page load)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: 'Invalid reset link' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'This reset link has expired' },
        { status: 400 }
      )
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { valid: false, error: 'This reset link has already been used' },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    return serverErrorResponse(error)
  }
}
```

### 8. Signup Page

**File**: `/app/auth/signup/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth'
import { Eye, EyeOff, Check, X } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Registration failed',
          description: result.error || 'Please try again',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Account created!',
        description: 'Please sign in with your new account.',
      })

      router.push('/auth/signin')
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start managing your home maintenance today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              disabled={isLoading}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                {...register('password')}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}

            {/* Password strength indicators */}
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <PasswordCheck
                  passed={passwordChecks.length}
                  label="At least 8 characters"
                />
                <PasswordCheck
                  passed={passwordChecks.lowercase}
                  label="One lowercase letter"
                />
                <PasswordCheck
                  passed={passwordChecks.uppercase}
                  label="One uppercase letter"
                />
                <PasswordCheck
                  passed={passwordChecks.number}
                  label="One number"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-muted-foreground'}`}
    >
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  )
}
```

### 9. Forgot Password Page Update

**Replace**: `/app/auth/forgot-password/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validation/auth'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setEmailSent(true)
        toast({
          title: 'Email sent',
          description: 'Check your inbox for password reset instructions.',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            {emailSent
              ? 'Check your email for reset instructions'
              : "Enter your email address and we'll send you a reset link"}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center rounded-lg bg-primary/10 p-6">
              <Mail className="h-12 w-12 text-primary mb-4" />
              <p className="text-center text-sm">
                If an account exists for <strong>{getValues('email')}</strong>,
                you will receive an email with password reset instructions.
              </p>
            </div>

            <Button asChild className="w-full" variant="outline">
              <Link href="/auth/signin">Return to sign in</Link>
            </Button>

            <button
              onClick={() => setEmailSent(false)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 10. Reset Password Page

**File**: `/app/auth/reset-password/page.tsx`

```tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validation/auth'
import { Eye, EyeOff, Check, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password = watch('password', '')

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  }

  // Validate token on page load
  useEffect(() => {
    if (!token) {
      setTokenError('No reset token provided')
      setIsValidating(false)
      return
    }

    setValue('token', token)

    async function validateToken() {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const result = await response.json()

        if (!result.valid) {
          setTokenError(result.error || 'Invalid reset link')
        }
      } catch {
        setTokenError('Failed to validate reset link')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token, setValue])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: 'Reset failed',
          description: result.error || 'Please try again',
          variant: 'destructive',
        })
        return
      }

      setResetComplete(true)
      toast({
        title: 'Password reset!',
        description: 'You can now sign in with your new password.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Invalid token error
  if (tokenError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
          <div className="space-y-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Invalid Reset Link
            </h1>
            <p className="text-muted-foreground">{tokenError}</p>
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request new reset link</Link>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/signin" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (resetComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
          <div className="space-y-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Password Reset Complete
            </h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Reset form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Set New Password
          </h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register('token')} />

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                {...register('password')}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}

            {/* Password strength indicators */}
            {password && (
              <div className="mt-2 space-y-1 text-xs">
                <PasswordCheck
                  passed={passwordChecks.length}
                  label="At least 8 characters"
                />
                <PasswordCheck
                  passed={passwordChecks.lowercase}
                  label="One lowercase letter"
                />
                <PasswordCheck
                  passed={passwordChecks.uppercase}
                  label="One uppercase letter"
                />
                <PasswordCheck
                  passed={passwordChecks.number}
                  label="One number"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                {...register('confirmPassword')}
                disabled={isLoading}
                aria-invalid={!!errors.confirmPassword}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting password...' : 'Reset password'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/signin" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div
      className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-muted-foreground'}`}
    >
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-lg">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
```

## Implementation Phases

### Phase 1: Email Infrastructure (2-3 hours)

1. Create `/lib/email/resend.ts` - Email client wrapper
2. Create `/lib/email/templates/password-reset.ts` - Email template
3. Add environment variables to `.env.example`
4. Test email sending with Resend API

### Phase 2: Database Schema (1 hour)

1. Add `PasswordResetToken` model to Prisma schema
2. Add relation to User model
3. Run migration: `npx prisma migrate dev --name add_password_reset_token`
4. Verify schema with `npx prisma studio`

### Phase 3: Validation Updates (30 minutes)

1. Update `/lib/validation/auth.ts` with enhanced schemas
2. Add password strength requirements
3. Add forgot/reset password schemas
4. Export all types

### Phase 4: Registration Feature (2-3 hours)

1. Create `/app/api/auth/register/route.ts` - Registration API
2. Create `/app/auth/signup/page.tsx` - Signup form
3. Implement password visibility toggle
4. Implement password strength indicators
5. Test registration flow end-to-end

### Phase 5: Password Reset Feature (3-4 hours)

1. Create `/app/api/auth/forgot-password/route.ts` - Request API
2. Create `/app/api/auth/reset-password/route.ts` - Reset API (POST + GET)
3. Update `/app/auth/forgot-password/page.tsx` - Request form
4. Create `/app/auth/reset-password/page.tsx` - Reset form
5. Test complete password reset flow

### Phase 6: Testing & Polish (2-3 hours)

1. Write E2E tests for registration
2. Write E2E tests for password reset
3. Test error handling (invalid token, expired token, etc.)
4. Test email delivery
5. Mobile responsiveness testing
6. Accessibility verification

## File Structure

```
app/
  auth/
    signin/page.tsx           # Existing (update links)
    signup/page.tsx           # NEW - Registration form
    forgot-password/page.tsx  # UPDATE - Real implementation
    reset-password/page.tsx   # NEW - Reset form
  api/
    auth/
      [...nextauth]/route.ts  # Existing
      register/route.ts       # NEW - Registration API
      forgot-password/route.ts # NEW - Password reset request
      reset-password/route.ts  # NEW - Password reset completion

lib/
  email/
    resend.ts                 # NEW - Email client
    templates/
      password-reset.ts       # NEW - Email template
  validation/
    auth.ts                   # UPDATE - Add new schemas

prisma/
  schema.prisma               # UPDATE - Add PasswordResetToken
  migrations/
    xxx_add_password_reset_token/ # NEW - Migration
```

## Security Considerations

### Registration

- **Email normalization**: Store emails in lowercase to prevent duplicate accounts
- **Password hashing**: bcrypt with 12 salt rounds (existing pattern)
- **Validation**: Strong password requirements (8+ chars, mixed case, numbers)
- **Rate limiting**: Consider adding rate limiting for registration endpoint (future enhancement)

### Password Reset

- **Token security**: 32-byte cryptographically random tokens
- **Token expiry**: 1 hour expiration
- **Single use**: Tokens invalidated after use
- **No enumeration**: Always return success message regardless of email existence
- **Token invalidation**: Previous tokens invalidated when new one is requested
- **Transaction**: Password update and token invalidation in single transaction

### Email

- **No sensitive data**: Don't include password or full token in logs
- **Plain text fallback**: Both HTML and plain text versions
- **Generic messaging**: "If an account exists..." pattern

## Testing Requirements

### Unit Tests

- [ ] Registration schema validation
- [ ] Password reset schema validation
- [ ] Token generation/validation logic

### E2E Tests

```typescript
// tests/e2e/auth.spec.ts

test.describe('User Registration', () => {
  test('Successfully registers new user', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'Password123')
    await page.fill('input[name="confirmPassword"]', 'Password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/auth/signin')
    await expect(page.getByText('Account created')).toBeVisible()
  })

  test('Shows error for duplicate email', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.fill('input[name="email"]', 'admin@example.com')
    // ... fill other fields
    await page.click('button[type="submit"]')

    await expect(page.getByText('already exists')).toBeVisible()
  })

  test('Shows password strength indicators', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.fill('input[name="password"]', 'weak')

    await expect(page.getByText('At least 8 characters')).toHaveClass(
      /text-muted/
    )

    await page.fill('input[name="password"]', 'StrongPass1')

    await expect(page.getByText('At least 8 characters')).toHaveClass(
      /text-green/
    )
  })
})

test.describe('Password Reset', () => {
  test('Sends reset email for existing user', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Check your inbox')).toBeVisible()
  })

  test('Shows success even for non-existent email', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.click('button[type="submit"]')

    // Should still show success (security - no enumeration)
    await expect(page.getByText('Check your inbox')).toBeVisible()
  })

  test('Shows error for invalid reset token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=invalid')

    await expect(page.getByText('Invalid Reset Link')).toBeVisible()
  })
})
```

## Success Metrics

- [ ] Users can create accounts via self-registration
- [ ] Registration validates email uniqueness
- [ ] Password strength requirements enforced
- [ ] Password reset emails delivered successfully
- [ ] Reset tokens expire after 1 hour
- [ ] Reset tokens can only be used once
- [ ] No email enumeration vulnerability
- [ ] All forms accessible (WCAG 2.1 AA)
- [ ] Mobile responsive design
- [ ] E2E tests pass at 90%+

## Dependencies

### Prerequisites

- Resend account with verified domain
- `RESEND_API_KEY` environment variable
- `NEXTAUTH_URL` set correctly for email links

### NPM Packages (Already Installed)

- `resend` - Email sending
- `bcryptjs` - Password hashing
- `zod` - Validation
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Zod integration

## Environment Variables Update

Add to `.env.example`:

```bash
# Email (Resend)
# Get your API key from https://resend.com
RESEND_API_KEY="re_your_api_key_here"

# From address for emails (must be verified domain in Resend)
EMAIL_FROM="HelixIntel <noreply@yourdomain.com>"
```

## Future Enhancements

- Email verification on registration
- Social login providers (Google, GitHub)
- Two-factor authentication (2FA)
- Rate limiting on auth endpoints
- Password breach detection (HaveIBeenPwned API)
- Account lockout after failed attempts
- Login history and session management
- Magic link login option

---

_Task Created: November 2025_
_Priority: HIGH (Core Feature)_
_Estimated Effort: 10-14 hours_
_Dependencies: Resend API account, verified email domain_
