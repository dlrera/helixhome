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
  `.trim()
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
