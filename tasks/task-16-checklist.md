# Task 16: User Registration and Password Reset - Implementation Checklist

## Phase 1: Email Infrastructure

- [x] Create `/lib/email/resend.ts` - Email client wrapper
- [x] Create `/lib/email/templates/` directory
- [x] Create `/lib/email/templates/password-reset.ts` - HTML and text templates
- [x] Add `RESEND_API_KEY` to `.env.example`
- [x] Add `EMAIL_FROM` to `.env.example`
- [ ] Test email sending with local environment
- [ ] Verify Resend API connection works

## Phase 2: Database Schema

- [x] Add `PasswordResetToken` model to `prisma/schema.prisma`
- [x] Add `passwordResetTokens` relation to `User` model
- [ ] Run migration: `npx prisma migrate dev --name add_password_reset_token`
- [ ] Verify migration succeeded
- [ ] Check schema with `npx prisma studio`
- [x] Generate Prisma client: `npx prisma generate`

## Phase 3: Validation Updates

- [x] Update `/lib/validation/auth.ts`:
  - [x] Enhance `registerSchema` with password strength requirements
  - [x] Add `forgotPasswordSchema`
  - [x] Add `resetPasswordSchema`
  - [x] Export new types
- [ ] Verify TypeScript compilation: `pnpm typecheck`

## Phase 4: Registration Feature

### API Endpoint

- [x] Create `/app/api/auth/register/route.ts`
- [x] Implement POST handler with:
  - [x] Input validation using `registerSchema`
  - [x] Email uniqueness check (case-insensitive)
  - [x] Password hashing with bcrypt (12 rounds)
  - [x] User creation in database
  - [x] Auto-create default Home for user
  - [x] Proper error responses

### Signup Page

- [x] Create `/app/auth/signup/page.tsx`
- [x] Implement form with React Hook Form + Zod
- [x] Add password visibility toggle
- [x] Add real-time password strength indicators
- [x] Add confirm password field
- [x] Implement form submission
- [x] Handle success (redirect to signin)
- [x] Handle errors (toast notifications)
- [ ] Verify mobile responsiveness
- [x] Verify accessibility (ARIA labels, focus states)

## Phase 5: Password Reset Feature

### Forgot Password API

- [x] Create `/app/api/auth/forgot-password/route.ts`
- [x] Implement POST handler with:
  - [x] Input validation using `forgotPasswordSchema`
  - [x] User lookup (case-insensitive email)
  - [x] Secure token generation (32 bytes)
  - [x] Token storage with expiration (1 hour)
  - [x] Invalidate previous tokens for user
  - [x] Send email via Resend
  - [x] Generic success response (no enumeration)

### Reset Password API

- [x] Create `/app/api/auth/reset-password/route.ts`
- [x] Implement GET handler (token validation):
  - [x] Check token exists
  - [x] Check token not expired
  - [x] Check token not used
  - [x] Return validity status
- [x] Implement POST handler (password reset):
  - [x] Input validation using `resetPasswordSchema`
  - [x] Token validation
  - [x] Password hashing
  - [x] Transaction: update password + mark token used
  - [x] Success response

### Forgot Password Page Update

- [x] Update `/app/auth/forgot-password/page.tsx`
- [x] Replace placeholder with real implementation
- [x] Use React Hook Form + Zod validation
- [x] Handle API response
- [x] Show success state with instructions
- [x] Add "Try again" functionality
- [x] Remove placeholder warning banner

### Reset Password Page

- [x] Create `/app/auth/reset-password/page.tsx`
- [x] Validate token on page load
- [x] Show loading state during validation
- [x] Handle invalid/expired token
- [x] Implement password reset form
- [x] Add password visibility toggle
- [x] Add password strength indicators
- [x] Handle form submission
- [x] Show success state
- [x] Use Suspense for searchParams

## Phase 6: Testing & Polish

### E2E Tests

- [x] Create/update `tests/e2e/auth.spec.ts`
- [x] Test: Successful user registration
- [x] Test: Registration with duplicate email
- [x] Test: Registration validation errors
- [x] Test: Password strength indicators
- [x] Test: Forgot password request
- [x] Test: Forgot password for non-existent email (no enumeration)
- [x] Test: Invalid reset token handling
- [ ] Test: Expired reset token handling
- [ ] Test: Successful password reset
- [x] Test: Navigation between auth pages

### Manual Testing

- [ ] Test complete registration flow
- [ ] Test signin with new account
- [ ] Test complete password reset flow (with actual email)
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test error states

### Final Verification

- [ ] Run `pnpm lint` - No errors
- [ ] Run `pnpm typecheck` - No type errors
- [ ] Run `pnpm build` - Build succeeds
- [ ] Run `pnpm test` - E2E tests pass
- [ ] Verify mobile responsiveness
- [ ] Verify accessibility compliance

## Files Created/Modified

### New Files

- [x] `/lib/email/resend.ts`
- [x] `/lib/email/templates/password-reset.ts`
- [x] `/app/api/auth/register/route.ts`
- [x] `/app/api/auth/forgot-password/route.ts`
- [x] `/app/api/auth/reset-password/route.ts`
- [x] `/app/auth/signup/page.tsx`
- [x] `/app/auth/reset-password/page.tsx`
- [ ] `prisma/migrations/xxx_add_password_reset_token/`

### Modified Files

- [x] `prisma/schema.prisma` - Add PasswordResetToken model
- [x] `/lib/validation/auth.ts` - Add new schemas
- [x] `/app/auth/forgot-password/page.tsx` - Real implementation
- [x] `.env.example` - Add email config

## Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] Email addresses normalized (lowercase)
- [x] Reset tokens cryptographically secure (32 bytes)
- [x] Tokens expire after 1 hour
- [x] Tokens single-use only
- [x] No email enumeration (generic responses)
- [x] Previous tokens invalidated on new request
- [x] Password and token update in transaction
- [x] No sensitive data in error messages
- [x] No sensitive data logged

## Deployment Notes

- [ ] Set `RESEND_API_KEY` in production environment
- [ ] Set `EMAIL_FROM` with verified domain
- [ ] Verify `NEXTAUTH_URL` is correct for email links
- [ ] Run database migration in production
- [ ] Test email delivery in production

---

_Checklist Created: November 2025_
_Reference: task-16-user-registration-password-reset.md_
