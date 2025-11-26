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
