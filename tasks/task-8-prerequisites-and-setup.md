# Task 8: Prerequisites and Setup Guide

**Task:** Notification System Implementation
**Estimated Time:** 8-10 hours
**Status:** Ready to Begin

---

## 📦 Prerequisites Checklist

### ✅ Already Installed (No Action Needed)

The following dependencies are already in `package.json`:

- ✅ `zod@4.1.11` - Validation schemas
- ✅ `react-hook-form@7.63.0` - Form management
- ✅ `@hookform/resolvers@5.2.2` - Zod integration
- ✅ `date-fns@4.1.0` - Date calculations
- ✅ `@tanstack/react-query@5.90.2` - Data fetching
- ✅ `sonner@2.0.7` - Toast notifications
- ✅ All shadcn/ui components (Switch, Select, Button, etc.)

### ❌ Need to Install

#### 1. Email Service SDK (Resend)

**Install Command:**

```bash
npm install resend
```

**Why Resend?**

- ✅ Modern, developer-friendly API
- ✅ Generous free tier: 3,000 emails/month, 100/day
- ✅ Excellent documentation and TypeScript support
- ✅ Easy to test and debug
- ✅ Good deliverability reputation
- ✅ No complex setup required

**Alternative: SendGrid**

```bash
npm install @sendgrid/mail
```

- Free tier: 100 emails/day (more restrictive)
- More complex setup
- Good for production at scale

**Recommendation:** Start with Resend for MVP.

---

## 🔐 External Account Setup

### 1. Create Resend Account

**Steps:**

1. Go to https://resend.com
2. Click "Get Started" or "Sign Up"
3. Create account with email
4. Verify your email address
5. Complete onboarding wizard

### 2. Get API Key

**Steps:**

1. Log into Resend dashboard
2. Navigate to "API Keys" section
3. Click "Create API Key"
4. Name it: "HelixIntel Development" (or similar)
5. Copy the API key (starts with `re_`)
6. **Important:** Save it immediately - you can't view it again!

### 3. Domain Setup (Optional for MVP)

**For Testing:**

- Use Resend's default "onboarding" domain
- Emails will come from `onboarding@resend.dev`
- Good enough for development and testing

**For Production:**

- Add and verify your custom domain
- Emails will come from `notifications@yourdomain.com`
- Better deliverability and branding
- Requires DNS configuration (5-10 minutes)

---

## 🔧 Environment Configuration

### 1. Update `.env` File

Add the following to your `.env` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Cron Secret (already exists, but verify it's set)
CRON_SECRET=your-secure-cron-secret-here

# Base URL (already exists)
NEXTAUTH_URL=http://localhost:3000
```

### 2. Generate Secure Cron Secret (if needed)

If `CRON_SECRET` is still set to the placeholder value, generate a new one:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use any random string generator
```

Replace `your-secure-cron-secret-here` with the generated value.

---

## 📁 Files to Create

The following files don't exist yet and need to be created:

### 1. Vercel Configuration

**File:** `/vercel.json`

**Purpose:** Configure Vercel Cron jobs for automated notification sending

**Content:**

```json
{
  "crons": [
    {
      "path": "/api/cron/mark-overdue",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup-activities",
      "schedule": "0 2 * * 0"
    },
    {
      "path": "/api/cron/send-notifications",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Note:** This will be created during Phase 7 of implementation.

---

## 🗂️ Project Structure for Task 8

Here's what the project will look like after Task 8:

```
lib/
  email/
    resend.ts                          # ← NEW: Email client wrapper
    templates/
      task-reminder.ts                 # ← NEW: Task reminder email template
  validation/
    notification-schemas.ts            # ← NEW: Zod validation schemas

app/
  api/
    notifications/
      settings/
        route.ts                       # ← NEW: GET/PUT notification preferences
      test/
        route.ts                       # ← NEW: POST send test email
      unsubscribe/
        route.ts                       # ← NEW: POST unsubscribe from emails
    cron/
      send-notifications/
        route.ts                       # ← NEW: Daily notification cron job
      mark-overdue/
        route.ts                       # ← Already exists
      cleanup-activities/
        route.ts                       # ← Already exists
  (protected)/
    settings/
      notifications/
        page.tsx                       # ← NEW: Notification settings page
  unsubscribe/
    page.tsx                           # ← NEW: Unsubscribe confirmation page

components/
  settings/
    notification-preferences.tsx       # ← NEW: Notification settings form

vercel.json                            # ← NEW: Vercel Cron configuration
```

**Total New Files:** 11

---

## ⚙️ Pre-Implementation Setup Steps

Complete these steps **before** starting Task 8 implementation:

### Step 1: Install Resend Package

```bash
npm install resend
```

Expected output:

```
added 1 package, and audited 718 packages in 2s
```

### Step 2: Create Resend Account

1. Visit https://resend.com
2. Sign up with email
3. Verify email address
4. Create API key
5. Copy API key to clipboard

### Step 3: Update Environment Variables

1. Open `.env` file
2. Add `RESEND_API_KEY=re_your_actual_key_here`
3. Verify `CRON_SECRET` is set to a secure value
4. Save file

### Step 4: Verify Environment

Test that environment variables are loaded:

```bash
# Create a quick test file
echo "console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');" > test-env.js
node test-env.js
rm test-env.js
```

Expected output: `RESEND_API_KEY: ✓ Set`

### Step 5: Verify Database Schema

The `Notification` model should already exist in `prisma/schema.prisma`. Verify it:

```bash
# Search for Notification model
grep -A 10 "model Notification" prisma/schema.prisma
```

Expected: Should find the Notification model with all required fields.

---

## 🧪 Quick Smoke Test

Before starting implementation, verify your setup:

### Test 1: Resend API Connection

Create a quick test script:

```typescript
// test-resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'your@email.com', // Replace with your email
      subject: 'Test Email from HelixIntel',
      html: '<p>If you receive this, Resend is working! 🎉</p>',
    })
    console.log('✓ Email sent successfully:', data)
  } catch (error) {
    console.error('✗ Error sending email:', error)
  }
}

testEmail()
```

Run it:

```bash
npx tsx test-resend.ts
```

Expected: Email appears in your inbox within 30 seconds.

### Test 2: Environment Variables

```bash
# Verify all required env vars are set
node -e "console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓' : '✗'); console.log('CRON_SECRET:', process.env.CRON_SECRET ? '✓' : '✗');"
```

Expected output:

```
RESEND_API_KEY: ✓
CRON_SECRET: ✓
```

---

## 📋 Implementation Order (High-Level)

Follow this sequence for optimal results:

1. **Phase 1: Email Service Setup** (1 hour)
   - Install Resend
   - Create email client wrapper
   - Send test email

2. **Phase 2: Email Templates** (1.5 hours)
   - Build HTML email template
   - Create task card component
   - Test rendering

3. **Phase 3: API Endpoints** (1 hour)
   - Notification preferences API
   - Test email API
   - Validation schemas

4. **Phase 4: Cron Job** (2 hours)
   - Daily notification job
   - Query logic
   - Email batching

5. **Phase 5: Settings UI** (1.5 hours)
   - Settings page
   - Preferences form
   - Test email button

6. **Phase 6: Unsubscribe** (0.5 hours)
   - Unsubscribe page
   - Token generation
   - API endpoint

7. **Phase 7: Vercel Config** (0.5 hours)
   - Create vercel.json
   - Deploy and test

8. **Phase 8: Testing** (1 hour)
   - Unit tests
   - Integration tests
   - Email client testing

---

## 🚨 Common Setup Issues and Solutions

### Issue 1: Resend API Key Not Working

**Symptoms:** 401 Unauthorized error when sending email

**Solutions:**

- Verify API key is correct (starts with `re_`)
- Check `.env` file has no extra spaces
- Restart dev server after updating `.env`
- Ensure API key is not revoked in Resend dashboard

### Issue 2: Emails Not Sending

**Symptoms:** No error, but emails don't arrive

**Solutions:**

- Check spam folder
- Verify recipient email is correct
- Check Resend dashboard for delivery logs
- Ensure you're within free tier limits (100/day)

### Issue 3: Environment Variables Not Loading

**Symptoms:** `process.env.RESEND_API_KEY` is undefined

**Solutions:**

- Restart Next.js dev server
- Check `.env` file is in project root
- Verify no syntax errors in `.env`
- Try `.env.local` instead of `.env`

### Issue 4: TypeScript Errors with Resend

**Symptoms:** Type errors when using Resend SDK

**Solutions:**

- Ensure `resend` package is installed
- Restart TypeScript server in VS Code
- Check `node_modules/resend` exists
- Run `npm install` again if needed

---

## 📊 Success Criteria for Setup

Before starting implementation, verify:

- [ ] ✅ `resend` package installed in `node_modules`
- [ ] ✅ Resend account created and verified
- [ ] ✅ API key generated and copied
- [ ] ✅ `RESEND_API_KEY` added to `.env`
- [ ] ✅ `CRON_SECRET` set to secure value
- [ ] ✅ Test email sent successfully via Resend
- [ ] ✅ Environment variables loading correctly
- [ ] ✅ Notification model exists in Prisma schema
- [ ] ✅ Dev server running without errors

---

## 🎯 Next Steps

Once all prerequisites are complete:

1. **Start Phase 1:** Create email client wrapper (`/lib/email/resend.ts`)
2. **Follow the todo list** in sequential order
3. **Test after each phase** to catch issues early
4. **Mark todos as complete** as you finish them
5. **Update checklist** (`task-8-checklist.md`) as you progress

---

## 📚 Helpful Resources

### Resend Documentation

- **API Docs:** https://resend.com/docs/send-with-nodejs
- **Email Templates:** https://resend.com/docs/send-with-react
- **Error Reference:** https://resend.com/docs/api-reference/errors

### Next.js Documentation

- **API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Environment Variables:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

### Vercel Cron

- **Cron Jobs:** https://vercel.com/docs/cron-jobs
- **Testing Cron:** https://vercel.com/docs/cron-jobs/manage-cron-jobs

---

## 🔐 Security Checklist

Before going to production:

- [ ] Generate new, secure `CRON_SECRET`
- [ ] Never commit `.env` file to git
- [ ] Use environment variables in Vercel dashboard (not code)
- [ ] Verify domain ownership in Resend
- [ ] Enable SPF/DKIM records for custom domain
- [ ] Test unsubscribe flow thoroughly
- [ ] Rate limit test email endpoint
- [ ] Sanitize all user data in emails

---

## ⏱️ Time Estimates

| Phase                    | Task                              | Estimated Time     |
| ------------------------ | --------------------------------- | ------------------ |
| Setup                    | Install packages, create accounts | 15 min             |
| Setup                    | Configure environment variables   | 5 min              |
| Setup                    | Send test email                   | 10 min             |
| **Total Setup**          |                                   | **30 min**         |
| Phase 1                  | Email client wrapper              | 1 hour             |
| Phase 2                  | Email templates                   | 1.5 hours          |
| Phase 3                  | API endpoints                     | 1 hour             |
| Phase 4                  | Cron job                          | 2 hours            |
| Phase 5                  | Settings UI                       | 1.5 hours          |
| Phase 6                  | Unsubscribe                       | 0.5 hours          |
| Phase 7                  | Vercel config                     | 0.5 hours          |
| Phase 8                  | Testing                           | 1 hour             |
| **Total Implementation** |                                   | **8-10 hours**     |
| **Grand Total**          |                                   | **8.5-10.5 hours** |

---

**Setup Complete?** You're ready to start Task 8 implementation! 🚀

Proceed to Phase 1 in the todo list and begin with creating the email client wrapper.

---

_Prerequisites Guide Created: October 2025_
_Last Updated: October 2025_
