# Task 8: Notification System Implementation Checklist

**Status:** Not Started
**Estimated Time:** 6-8 hours
**Priority:** High (Core MVP Feature)

---

## Phase 1: Email Service Setup (1 hour)

### 1.1 Email Provider Configuration

- [ ] Create Resend account at https://resend.com
- [ ] Verify domain (or use Resend's onboarding domain for testing)
- [ ] Generate API key from Resend dashboard
- [ ] Add `RESEND_API_KEY` to `.env` file
- [ ] Test API key with simple curl request

### 1.2 Package Installation

- [ ] Install Resend SDK: `npm install resend`
- [ ] Verify installation in `package.json`
- [ ] Check TypeScript types are available

### 1.3 Email Client Setup

- [ ] Create `/lib/email/resend.ts` - Email client wrapper
- [ ] Export `sendEmail` function
- [ ] Add error handling and logging
- [ ] Create test function to verify setup
- [ ] Test sending simple email to your address

**Verification:**

```bash
# Test email service
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your@email.com"}'
```

---

## Phase 2: Email Templates (1.5 hours)

### 2.1 Task Reminder Template

- [ ] Create `/lib/email/templates/task-reminder.ts`
- [ ] Build HTML email structure with HelixIntel branding
- [ ] Add responsive CSS (inline styles)
- [ ] Implement task card component
- [ ] Add priority color coding
- [ ] Include header with logo
- [ ] Add footer with links (settings, unsubscribe)
- [ ] Test template rendering in browser

### 2.2 Email Components

- [ ] Create task card HTML component
- [ ] Implement priority badge styling
- [ ] Add due date formatter
- [ ] Create task list iterator
- [ ] Add CTA button (View All Tasks)
- [ ] Include maintenance tip section

### 2.3 Template Testing

- [ ] Send test email with 1 task
- [ ] Send test email with 3 tasks (batched)
- [ ] Send test email with overdue task
- [ ] Verify rendering in Gmail
- [ ] Verify rendering in Outlook
- [ ] Test mobile email rendering
- [ ] Check all links work correctly

**Verification:**

- [ ] Email renders correctly in Gmail web
- [ ] Email renders correctly in Gmail mobile
- [ ] Email renders correctly in Outlook
- [ ] All colors match HelixIntel brand
- [ ] Links navigate to correct pages

---

## Phase 3: Notification Preferences API (1 hour)

### 3.1 Validation Schemas

- [ ] Create `/lib/validation/notification-schemas.ts`
- [ ] Define `notificationPreferencesSchema` with Zod
- [ ] Add validation for reminderDays (1, 3, 7)
- [ ] Add validation for boolean flags
- [ ] Export TypeScript types from schemas

### 3.2 Settings API Endpoint

- [ ] Create `/app/api/notifications/settings/route.ts`
- [ ] Implement GET handler
  - [ ] Require authentication
  - [ ] Fetch user from database
  - [ ] Return preferences (with defaults if null)
- [ ] Implement PUT handler
  - [ ] Require authentication
  - [ ] Validate request body with Zod
  - [ ] Update user.notificationPreferences
  - [ ] Return updated preferences
- [ ] Add error handling (400, 401, 500)
- [ ] Test with Postman/curl

### 3.3 Test Email Endpoint

- [ ] Create `/app/api/notifications/test/route.ts`
- [ ] Implement POST handler
  - [ ] Require authentication
  - [ ] Validate email address
  - [ ] Send test task reminder email
  - [ ] Return success/failure
- [ ] Add rate limiting (max 5 per hour)
- [ ] Test endpoint

**Verification:**

```bash
# Get preferences
curl -H "Cookie: next-auth.session-token=..." \
  http://localhost:3000/api/notifications/settings

# Update preferences
curl -X PUT http://localhost:3000/api/notifications/settings \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"emailEnabled": true, "reminderDays": 3}'

# Send test email
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Phase 4: Notification Cron Job (2 hours)

### 4.1 Cron Endpoint Creation

- [ ] Create `/app/api/cron/send-notifications/route.ts`
- [ ] Implement CRON_SECRET authentication
- [ ] Add POST handler
- [ ] Return 401 if secret invalid

### 4.2 Notification Query Logic

- [ ] Create helper: `getTasksDueForNotification(userId, daysAhead)`
- [ ] Query tasks due within reminder window
- [ ] Filter by task status (PENDING only)
- [ ] Include asset and home data
- [ ] Sort by due date ascending
- [ ] Create helper: `getOverdueTasks(userId)`
- [ ] Query tasks with status OVERDUE
- [ ] Filter out recently notified tasks

### 4.3 User Processing Loop

- [ ] Query all users with `notificationPreferences.emailEnabled = true`
- [ ] For each user:
  - [ ] Get notification preferences
  - [ ] Fetch upcoming tasks based on reminderDays
  - [ ] Fetch overdue tasks (if enabled in prefs)
  - [ ] Filter tasks by excluded categories
  - [ ] Skip if no tasks to notify
  - [ ] Send email with batched tasks
  - [ ] Log notification to database
  - [ ] Handle errors gracefully (don't fail entire job)

### 4.4 Email Sending Integration

- [ ] Call task reminder email template
- [ ] Pass tasks array to template
- [ ] Include user's email and name
- [ ] Generate task URLs with taskId
- [ ] Send email via Resend
- [ ] Capture send result (success/failure)

### 4.5 Notification Logging

- [ ] Create notification record for each email sent
- [ ] Set type to EMAIL
- [ ] Set status to SENT or FAILED
- [ ] Store sentAt timestamp
- [ ] Store metadata (subject, recipient, taskIds)
- [ ] Link to primary task if single task email

### 4.6 Statistics & Response

- [ ] Track total tasks processed
- [ ] Track total emails sent
- [ ] Track total users notified
- [ ] Track errors encountered
- [ ] Return JSON summary
- [ ] Log summary to console

**Verification:**

```bash
# Run cron job manually
curl -X POST http://localhost:3000/api/cron/send-notifications \
  -H "Authorization: Bearer your-cron-secret"

# Expected response:
# {
#   "success": true,
#   "stats": {
#     "tasksProcessed": 12,
#     "emailsSent": 4,
#     "usersNotified": 4,
#     "errors": 0
#   }
# }
```

---

## Phase 5: Settings UI (1.5 hours)

### 5.1 Notification Settings Page

- [ ] Create `/app/(protected)/settings/notifications/page.tsx`
- [ ] Add breadcrumb navigation
- [ ] Create page header and description
- [ ] Add Suspense with loading skeleton

### 5.2 Notification Preferences Form

- [ ] Create `/components/settings/notification-preferences.tsx`
- [ ] Use TanStack Query to fetch preferences
- [ ] Implement React Hook Form with Zod validation
- [ ] Add form fields:
  - [ ] Email notifications enabled (Switch)
  - [ ] Reminder days selector (RadioGroup: 1, 3, 7 days)
  - [ ] Overdue reminders enabled (Switch)
  - [ ] Digest frequency (Select: daily, weekly, never)
  - [ ] Excluded categories (Multi-select checkboxes)
- [ ] Add help text for each field
- [ ] Implement "Send Test Email" button
- [ ] Add save button with loading state
- [ ] Show success/error toast on save

### 5.3 Form Styling

- [ ] Use shadcn/ui components (Switch, Select, Button)
- [ ] Match HelixIntel branding
- [ ] Add proper spacing and layout
- [ ] Make mobile responsive
- [ ] Add icons to sections
- [ ] Highlight important settings

### 5.4 Navigation Integration

- [ ] Add "Notifications" to settings navigation
- [ ] Add link in user dropdown menu
- [ ] Update settings index page

**Verification:**

- [ ] Page loads without errors
- [ ] Form populates with current preferences
- [ ] Changes save successfully
- [ ] Test email button works
- [ ] Toast notifications appear
- [ ] Mobile layout looks good
- [ ] All fields validated correctly

---

## Phase 6: Unsubscribe Flow (0.5 hours)

### 6.1 Unsubscribe Token Generation

- [ ] Create helper: `generateUnsubscribeToken(userId)`
- [ ] Use JWT or encrypted ID
- [ ] Set expiration (30 days)
- [ ] Add to email template footer

### 6.2 Unsubscribe Page

- [ ] Create `/app/unsubscribe/page.tsx`
- [ ] Parse token from URL query parameter
- [ ] Verify token validity
- [ ] Show unsubscribe confirmation form
- [ ] Add "Confirm Unsubscribe" button
- [ ] Show success message after unsubscribe

### 6.3 Unsubscribe API

- [ ] Create `/app/api/notifications/unsubscribe/route.ts`
- [ ] Implement POST handler
- [ ] Verify token
- [ ] Update user preferences (emailEnabled = false)
- [ ] Return success response
- [ ] Handle invalid tokens gracefully

### 6.4 Resubscribe Option

- [ ] Add "Changed your mind?" section
- [ ] Link to notification settings
- [ ] Show benefits of notifications

**Verification:**

```bash
# Generate test token and visit:
http://localhost:3000/unsubscribe?token=xxx

# Verify email notifications disabled
# Verify user can resubscribe via settings
```

---

## Phase 7: Vercel Cron Configuration (0.5 hours)

### 7.1 Update Vercel Config

- [ ] Open `/vercel.json`
- [ ] Add new cron job entry
- [ ] Set path: `/api/cron/send-notifications`
- [ ] Set schedule: `0 8 * * *` (8 AM UTC daily)
- [ ] Verify syntax

### 7.2 Cron Testing

- [ ] Test locally with curl
- [ ] Deploy to Vercel staging
- [ ] Verify cron job appears in Vercel dashboard
- [ ] Monitor first automated run
- [ ] Check logs for errors

**Vercel.json:**

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

---

## Phase 8: Testing & Quality Assurance (1 hour)

### 8.1 Unit Tests

- [ ] Test notification query logic
- [ ] Test preference validation
- [ ] Test token generation/verification
- [ ] Test email template rendering
- [ ] Test task filtering logic

### 8.2 Integration Tests

- [ ] Test API endpoints (GET/PUT settings)
- [ ] Test cron job execution
- [ ] Test email sending flow
- [ ] Test unsubscribe flow
- [ ] Test notification logging

### 8.3 End-to-End Testing

- [ ] Create test user account
- [ ] Enable notifications in settings
- [ ] Create tasks due in 3 days
- [ ] Run cron job manually
- [ ] Verify email received
- [ ] Check notification logged in database
- [ ] Test unsubscribe link
- [ ] Verify no email sent after unsubscribe

### 8.4 Email Client Testing

- [ ] Test in Gmail (web)
- [ ] Test in Gmail (mobile app)
- [ ] Test in Outlook (web)
- [ ] Test in Outlook (desktop)
- [ ] Test in Apple Mail (macOS)
- [ ] Test in Apple Mail (iOS)
- [ ] Verify images load
- [ ] Verify links work
- [ ] Check mobile responsiveness

### 8.5 Edge Case Testing

- [ ] User with no upcoming tasks
- [ ] User with 10+ tasks (batching)
- [ ] User with only overdue tasks
- [ ] User with notifications disabled
- [ ] User with excluded categories
- [ ] Invalid email address
- [ ] Network failure during send
- [ ] Database error during processing

### 8.6 Performance Testing

- [ ] Test with 100 users
- [ ] Measure cron job execution time
- [ ] Check database query performance
- [ ] Monitor email send rate
- [ ] Verify no memory leaks

---

## Verification Checklist

### Functional Requirements ✅

- [ ] Email notifications send daily at 8 AM UTC
- [ ] Users can enable/disable notifications
- [ ] Users can configure reminder timing (1, 3, 7 days)
- [ ] Users can enable/disable overdue reminders
- [ ] Users can exclude categories from notifications
- [ ] Multiple tasks batch into single email
- [ ] Emails include direct links to tasks
- [ ] Test email functionality works
- [ ] Unsubscribe link disables notifications
- [ ] Notifications log to database with status
- [ ] No duplicate notifications within 24 hours

### Technical Requirements ✅

- [ ] All API endpoints require authentication
- [ ] Cron job authenticates with CRON_SECRET
- [ ] Input validation with Zod schemas
- [ ] Error handling on all endpoints
- [ ] TypeScript compilation passes
- [ ] ESLint passes with no warnings
- [ ] No console errors in browser

### User Experience ✅

- [ ] Email design matches HelixIntel branding
- [ ] Email is mobile-responsive
- [ ] Settings UI is clear and intuitive
- [ ] Success/error messages are helpful
- [ ] Forms validate on submit
- [ ] Loading states show during async operations
- [ ] Toast notifications confirm actions

### Performance ✅

- [ ] Email delivery rate >95%
- [ ] Cron job completes in <30 seconds
- [ ] Settings page loads in <1 second
- [ ] Test email sends in <5 seconds
- [ ] No N+1 query problems
- [ ] Database queries use indexes

### Security ✅

- [ ] Email addresses validated
- [ ] User data sanitized in emails
- [ ] Unsubscribe tokens secure (JWT/encrypted)
- [ ] Rate limiting on test email endpoint
- [ ] No email injection vulnerabilities
- [ ] CSRF protection on forms

---

## Post-Implementation Tasks

### Documentation

- [ ] Update CLAUDE.md with notification system details
- [ ] Document email template customization
- [ ] Create troubleshooting guide for email delivery
- [ ] Add notification preferences to user guide
- [ ] Document cron job monitoring

### Monitoring

- [ ] Set up email delivery monitoring
- [ ] Create alerts for high failure rates
- [ ] Track notification engagement metrics
- [ ] Monitor cron job execution logs
- [ ] Set up error tracking (Sentry)

### User Communication

- [ ] Announce notification feature to users
- [ ] Create help article on managing preferences
- [ ] Add notification info to onboarding
- [ ] Create video tutorial (optional)

---

## Estimated Time Breakdown

| Phase     | Task                         | Estimated Time |
| --------- | ---------------------------- | -------------- |
| 1         | Email Service Setup          | 1 hour         |
| 2         | Email Templates              | 1.5 hours      |
| 3         | Notification Preferences API | 1 hour         |
| 4         | Notification Cron Job        | 2 hours        |
| 5         | Settings UI                  | 1.5 hours      |
| 6         | Unsubscribe Flow             | 0.5 hours      |
| 7         | Vercel Cron Configuration    | 0.5 hours      |
| 8         | Testing & QA                 | 1 hour         |
| **Total** |                              | **8-10 hours** |

---

## Dependencies

- [x] Task 1: Database Schema (User, Task models exist)
- [x] Task 6: Task Management System (Task CRUD complete)
- [x] Task 7: Dashboard (User can view tasks)
- [ ] Resend account created
- [ ] Environment variables configured
- [ ] Vercel deployment (for cron jobs)

---

## Success Criteria

**Task 8 is complete when:**

1. ✅ Users receive email reminders for tasks due in 3 days
2. ✅ Users can configure notification preferences
3. ✅ Multiple tasks batch into single email
4. ✅ Emails render correctly in all major email clients
5. ✅ Unsubscribe functionality works
6. ✅ Cron job runs daily without errors
7. ✅ All tests pass
8. ✅ Documentation updated

---

## Next Steps After Completion

1. **Monitor email delivery** - Check Resend dashboard for bounce rates
2. **Gather user feedback** - Are notifications helpful?
3. **Optimize timing** - A/B test different send times
4. **Implement Task 9** - Mobile Optimization (PWA features)

---

**Checklist Created:** October 2025
**Total Items:** 150+
**Status:** Ready to begin implementation

---

_Follow this checklist sequentially for best results. Mark items complete as you finish them._
