# Task 8: Basic Notification System

## Overview

Implement an email-based notification system to remind homeowners about upcoming and overdue maintenance tasks. This feature is critical for user engagement and ensures the platform delivers on its core value proposition: "Never miss home maintenance again."

## Objectives

- Send automated email reminders for tasks due in the next 3 days
- Provide user-configurable notification preferences
- Implement daily cron job to process and send notifications
- Track notification delivery status
- Create professional, branded email templates
- Support unsubscribe functionality

## Current Status

**Status:** Not Started
**Priority:** High (Core MVP Feature)
**Estimated Time:** 6-8 hours

## User Stories

### US-008: Email Reminders for Due Tasks

**As a** homeowner
**I want to** receive email reminders about upcoming maintenance tasks
**So that** I don't forget to complete important home maintenance

**Acceptance Criteria:**

- Email sent 3 days before task due date
- Email includes task name, due date, asset name, and priority
- Direct link to task in email (one-click access)
- Email uses HelixIntel branding (logo, colors)
- Only sends if user has email notifications enabled
- Batches multiple tasks due same day into single email
- Tracks delivery status in database

### US-009: Notification Preferences

**As a** homeowner
**I want to** control when and how I receive notifications
**So that** I'm not overwhelmed with emails

**Acceptance Criteria:**

- Can enable/disable email notifications globally
- Can configure reminder timing (1, 3, or 7 days before due)
- Can disable notifications for specific task types
- Settings save immediately
- Clear labels and help text
- Accessible from user menu and settings page

### US-010: Overdue Task Alerts

**As a** homeowner
**I want to** be reminded about overdue tasks
**So that** I can catch up on missed maintenance

**Acceptance Criteria:**

- Email sent when task becomes overdue
- Highlights urgency in subject line
- Lists all overdue tasks in single email
- Sends weekly reminder for overdue tasks
- Can be disabled in preferences

## Technical Requirements

### Email Service Integration

**Email Provider Options:**

- **Resend** (recommended) - Modern, developer-friendly, generous free tier
- **SendGrid** - Established, reliable, good deliverability
- **AWS SES** - Cost-effective, requires AWS setup

**Selection Criteria:**

- Free tier sufficient for MVP (1,000+ emails/month)
- Good deliverability reputation
- Easy API integration
- Supports HTML templates
- Webhook support for delivery tracking

### Database Schema Extensions

**Notification Table (Already Exists):**

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  taskId    String?
  task      Task?    @relation(fields: [taskId], references: [id], onDelete: SetNull)
  type      NotificationType
  status    NotificationStatus
  sentAt    DateTime?
  metadata  Json?    // Store email details, error messages
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([taskId])
  @@index([status])
}

enum NotificationType {
  EMAIL
  PUSH
  SMS
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}
```

**User Model Extension:**

```prisma
model User {
  // ... existing fields
  notificationPreferences Json? // Store user preferences
}
```

**Notification Preferences JSON Structure:**

```typescript
interface NotificationPreferences {
  emailEnabled: boolean
  pushEnabled: boolean
  reminderDays: number // 1, 3, or 7 days before due
  overdueReminders: boolean
  digestFrequency: 'daily' | 'weekly' | 'never'
  excludedCategories: AssetCategory[] // Don't notify for these categories
}
```

### API Endpoints

#### GET /api/notifications/settings

**Purpose:** Fetch user's notification preferences

**Response:**

```json
{
  "emailEnabled": true,
  "pushEnabled": false,
  "reminderDays": 3,
  "overdueReminders": true,
  "digestFrequency": "daily",
  "excludedCategories": []
}
```

#### PUT /api/notifications/settings

**Purpose:** Update notification preferences

**Request Body:**

```json
{
  "emailEnabled": true,
  "reminderDays": 3,
  "overdueReminders": true
}
```

**Response:**

```json
{
  "success": true,
  "preferences": { ... }
}
```

#### POST /api/notifications/test

**Purpose:** Send test email to verify configuration

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Test email sent successfully"
}
```

#### POST /api/cron/send-notifications

**Purpose:** Daily cron job to process and send notifications

**Authentication:** Requires `CRON_SECRET` header

**Process:**

1. Find all tasks due in configured days (default 3)
2. Group by user
3. Check user preferences
4. Send batched emails
5. Log notifications sent
6. Return summary statistics

**Response:**

```json
{
  "success": true,
  "stats": {
    "tasksProcessed": 45,
    "emailsSent": 12,
    "usersNotified": 12,
    "errors": 0
  }
}
```

### Email Templates

#### Task Reminder Email

**Subject:** `🏠 Maintenance Reminder: {taskCount} task(s) due soon`

**HTML Template:**

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Maintenance Reminder - HelixIntel</title>
  </head>
  <body
    style="font-family: Inter, sans-serif; background-color: #F9FAFA; padding: 20px;"
  >
    <div
      style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;"
    >
      <!-- Header -->
      <div
        style="background-color: #216093; padding: 30px; text-align: center;"
      >
        <h1 style="color: white; margin: 0; font-weight: 900;">HelixIntel</h1>
        <p style="color: #F9FAFA; margin-top: 10px;">
          Home Maintenance Made Simple
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 30px;">
        <h2 style="color: #001B48; margin-top: 0;">
          You have {taskCount} maintenance task(s) due soon
        </h2>

        <!-- Task List -->
        {taskList}

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a
            href="{dashboardUrl}"
            style="background-color: #216093; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;"
          >
            View All Tasks
          </a>
        </div>

        <!-- Tip Section -->
        <div
          style="background-color: #F9FAFA; padding: 20px; border-radius: 6px; margin-top: 20px;"
        >
          <p style="margin: 0; color: #57949A; font-size: 14px;">
            💡 <strong>Tip:</strong> Mark tasks complete in the app to track
            your maintenance history and keep your home in top condition.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        style="background-color: #F9FAFA; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;"
      >
        <p style="color: #6B7280; font-size: 12px; margin: 0;">
          You're receiving this because you have email notifications enabled.
        </p>
        <p style="margin: 10px 0;">
          <a
            href="{settingsUrl}"
            style="color: #216093; text-decoration: none; font-size: 12px;"
            >Notification Settings</a
          >
          <span style="color: #D1D5DB; margin: 0 10px;">|</span>
          <a
            href="{unsubscribeUrl}"
            style="color: #6B7280; text-decoration: none; font-size: 12px;"
            >Unsubscribe</a
          >
        </p>
      </div>
    </div>
  </body>
</html>
```

#### Task Card Component (for email)

```html
<div
  style="border-left: 4px solid {priorityColor}; padding: 15px; background-color: #F9FAFA; margin-bottom: 15px; border-radius: 4px;"
>
  <div
    style="display: flex; justify-content: space-between; align-items: start;"
  >
    <div>
      <h3 style="margin: 0 0 5px 0; color: #001B48; font-size: 16px;">
        {taskTitle}
      </h3>
      <p style="margin: 0; color: #57949A; font-size: 14px;">{assetName}</p>
    </div>
    <span
      style="background-color: {priorityBg}; color: {priorityText}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;"
    >
      {priority}
    </span>
  </div>
  <div
    style="margin-top: 10px; display: flex; gap: 15px; font-size: 13px; color: #6B7280;"
  >
    <span>📅 Due: {dueDate}</span>
    <span>⏱️ {estimatedDuration}</span>
  </div>
  <a
    href="{taskUrl}"
    style="color: #216093; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 10px; display: inline-block;"
  >
    View Task →
  </a>
</div>
```

#### Priority Colors

```typescript
const priorityStyles = {
  HIGH: {
    color: '#DB162F',
    bg: '#FEE2E2',
    text: '#991B1B',
  },
  MEDIUM: {
    color: '#F0C319',
    bg: '#FEF3C7',
    text: '#92400E',
  },
  LOW: {
    color: '#2E933C',
    bg: '#D1FAE5',
    text: '#065F46',
  },
}
```

### Notification Logic

#### Daily Notification Flow

```typescript
// Pseudocode for daily notification cron
async function sendDailyNotifications() {
  // 1. Get all users with email notifications enabled
  const users = await getActiveUsers()

  // 2. For each user, find tasks due within their reminder window
  for (const user of users) {
    const preferences = user.notificationPreferences || DEFAULT_PREFS

    if (!preferences.emailEnabled) continue

    const dueDate = addDays(new Date(), preferences.reminderDays)

    const upcomingTasks = await getUpcomingTasks(user.id, dueDate)
    const overdueTasks = preferences.overdueReminders
      ? await getOverdueTasks(user.id)
      : []

    // 3. Filter out excluded categories
    const filteredTasks = filterTasksByPreferences(
      [...upcomingTasks, ...overdueTasks],
      preferences
    )

    if (filteredTasks.length === 0) continue

    // 4. Send email with batched tasks
    const emailSent = await sendTaskReminderEmail(user.email, filteredTasks)

    // 5. Log notification
    await logNotification(user.id, filteredTasks, emailSent)
  }
}
```

#### Notification Deduplication

- Track last notification sent for each task
- Don't send duplicate reminders within 24 hours
- Skip tasks already completed
- Skip tasks with status CANCELLED

### Vercel Cron Configuration

Add to `/vercel.json`:

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

**Schedule:** `0 8 * * *` = Every day at 8:00 AM UTC

**Local Testing:**

```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/send-notifications
```

## Implementation Checklist

### Phase 1: Email Service Setup

- [ ] Choose email provider (Resend recommended)
- [ ] Create account and get API key
- [ ] Add `RESEND_API_KEY` to `.env`
- [ ] Install package: `npm install resend`
- [ ] Create `/lib/email/resend.ts` - Email client wrapper
- [ ] Test email sending with simple test message

### Phase 2: Email Templates

- [ ] Create `/lib/email/templates/task-reminder.ts`
- [ ] Build HTML email template with HelixIntel branding
- [ ] Create task card component for email
- [ ] Implement priority color coding
- [ ] Add unsubscribe link generation
- [ ] Test rendering in multiple email clients

### Phase 3: Notification Preferences

- [ ] Create `/app/api/notifications/settings/route.ts`
  - [ ] GET - Fetch user preferences
  - [ ] PUT - Update preferences with validation
- [ ] Create `/lib/validation/notification-schemas.ts` - Zod schemas
- [ ] Add default preferences to user signup
- [ ] Create `/components/settings/notification-preferences.tsx`
- [ ] Add notification settings to user menu
- [ ] Test preference updates

### Phase 4: Notification Cron Job

- [ ] Create `/app/api/cron/send-notifications/route.ts`
- [ ] Implement authentication with `CRON_SECRET`
- [ ] Build notification query logic
  - [ ] Get tasks due within reminder window
  - [ ] Get overdue tasks (if enabled)
  - [ ] Filter by user preferences
  - [ ] Group by user and batch
- [ ] Implement email sending loop
- [ ] Add error handling and retry logic
- [ ] Create notification logging
- [ ] Return statistics summary

### Phase 5: Notification Logging

- [ ] Create notification records in database
- [ ] Track sent/failed status
- [ ] Store email metadata (subject, recipient)
- [ ] Add timestamps for delivery tracking
- [ ] Implement deduplication logic
- [ ] Create notification history API endpoint

### Phase 6: Settings UI

- [ ] Create `/app/(protected)/settings/notifications/page.tsx`
- [ ] Build notification preferences form
  - [ ] Email enabled toggle
  - [ ] Reminder days selector (1, 3, 7 days)
  - [ ] Overdue reminders toggle
  - [ ] Digest frequency selector
  - [ ] Category exclusions (multi-select)
- [ ] Add "Send Test Email" button
- [ ] Implement real-time preview
- [ ] Add help text and tooltips
- [ ] Test form validation

### Phase 7: Unsubscribe Flow

- [ ] Create `/app/unsubscribe/page.tsx`
- [ ] Implement token-based unsubscribe links
- [ ] Create `/api/notifications/unsubscribe/route.ts`
- [ ] Disable email notifications on unsubscribe
- [ ] Show confirmation page
- [ ] Add "Resubscribe" option
- [ ] Test unsubscribe flow

### Phase 8: Testing & Verification

- [ ] Unit tests for notification logic
- [ ] Test email delivery to multiple providers (Gmail, Outlook, etc.)
- [ ] Verify cron job runs on schedule (local + Vercel)
- [ ] Test with various task scenarios
  - [ ] Single task due
  - [ ] Multiple tasks same day
  - [ ] Overdue tasks
  - [ ] No tasks due
- [ ] Test preference changes
- [ ] Verify unsubscribe works
- [ ] Check notification deduplication
- [ ] Performance test with 100+ users

## File Structure

```
lib/
  email/
    resend.ts                    # Email client wrapper
    templates/
      task-reminder.ts           # Task reminder email template
      test-email.ts              # Test email template
  validation/
    notification-schemas.ts      # Zod validation schemas

app/
  api/
    notifications/
      settings/
        route.ts                 # GET/PUT notification preferences
      test/
        route.ts                 # POST send test email
      unsubscribe/
        route.ts                 # POST unsubscribe from emails
    cron/
      send-notifications/
        route.ts                 # Daily notification cron job
  (protected)/
    settings/
      notifications/
        page.tsx                 # Notification settings page
  unsubscribe/
    page.tsx                     # Unsubscribe confirmation page

components/
  settings/
    notification-preferences.tsx # Notification settings form
```

## Environment Variables

Add to `.env`:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Cron Secret (already exists)
CRON_SECRET=your-secure-cron-secret-here

# Base URL (for email links)
NEXTAUTH_URL=http://localhost:3000  # Already exists
```

## Success Criteria

### Functional Requirements

- [ ] Users can enable/disable email notifications
- [ ] Users can configure reminder timing (1, 3, or 7 days)
- [ ] Users can exclude specific categories
- [ ] Emails send daily at 8 AM UTC
- [ ] Emails batch multiple tasks into single message
- [ ] Emails include direct links to tasks
- [ ] Users can test email delivery
- [ ] Users can unsubscribe from emails
- [ ] Notifications log to database with status
- [ ] Overdue task reminders work (if enabled)

### Non-Functional Requirements

- [ ] Email delivery rate >95%
- [ ] Cron job completes in <30 seconds
- [ ] Email template renders correctly in Gmail, Outlook, Apple Mail
- [ ] No duplicate notifications sent within 24 hours
- [ ] Notification preferences save instantly
- [ ] Settings page loads in <1 second
- [ ] Test email sends in <5 seconds

### User Experience

- [ ] Email design matches HelixIntel branding
- [ ] Email is mobile-responsive
- [ ] Settings UI is intuitive and clear
- [ ] Error messages are helpful
- [ ] Success confirmations are clear
- [ ] Unsubscribe is one-click
- [ ] No broken email links

## Testing Plan

### Manual Testing

1. **Create test user** with valid email address
2. **Enable email notifications** in settings
3. **Create tasks** due in 3 days
4. **Send test email** via API
5. **Verify email received** with correct content
6. **Test unsubscribe** link
7. **Run cron job manually** and verify emails sent
8. **Test with multiple tasks** (batching)
9. **Test overdue reminders**
10. **Test preference changes**

### Automated Testing

- Unit tests for notification query logic
- Integration tests for API endpoints
- Email template rendering tests
- Cron job execution tests

### Email Client Testing

Test email rendering in:

- Gmail (web + mobile)
- Outlook (web + desktop)
- Apple Mail (macOS + iOS)
- Yahoo Mail
- ProtonMail

## Performance Considerations

### Email Sending

- Batch email sends (avoid rate limits)
- Use async processing for large user base
- Implement exponential backoff on failures
- Monitor email bounce rates

### Database Queries

- Index on `Task.dueDate` and `Task.status`
- Use efficient date range queries
- Limit results with pagination if needed
- Cache user preferences

### Cron Job Optimization

- Process users in batches of 50
- Use connection pooling
- Implement timeout (max 5 minutes)
- Log performance metrics

## Security Considerations

### Email Security

- Validate email addresses before sending
- Sanitize user data in email templates
- Use secure unsubscribe tokens (JWT or encrypted IDs)
- Rate limit email sending per user
- Prevent email injection attacks

### API Security

- Require authentication for all endpoints
- Validate CRON_SECRET for cron jobs
- Rate limit preference updates
- Validate all input with Zod
- Prevent CSRF attacks

### Privacy

- Don't include sensitive data in emails
- Allow users to unsubscribe easily
- Don't log email content (just metadata)
- Comply with CAN-SPAM Act
- Respect user preferences immediately

## Future Enhancements (Post-MVP)

### Phase 2 Features

- Push notifications (web push)
- SMS notifications (Twilio)
- In-app notification center
- Notification digest (weekly summary)
- Task completion reminders
- Maintenance streak notifications

### Advanced Features

- Smart notification timing (learn user behavior)
- Rich email content (images, videos)
- Interactive emails (complete task in email)
- Notification analytics dashboard
- A/B testing email templates
- Multi-language email support

## Dependencies

### NPM Packages

- `resend` (v1.0.0+) - Email sending
- `@react-email/components` (optional) - React email templates
- `zod` (already installed) - Validation

### External Services

- Resend account (free tier: 3,000 emails/month)
- Vercel Cron (included with Vercel deployment)

## Documentation

### User Documentation

- Help article: "Managing Notification Preferences"
- FAQ: "Why am I not receiving emails?"
- Video tutorial: "Setting up reminders"

### Developer Documentation

- Email template customization guide
- Cron job troubleshooting
- Adding new notification types
- Email provider migration guide

## Notes

### Important Considerations

1. **Email deliverability** - Use reputable sender, warm up domain
2. **User experience** - Don't overwhelm with notifications
3. **Testing** - Test thoroughly across email clients
4. **Monitoring** - Track delivery rates and failures
5. **Compliance** - Follow CAN-SPAM Act requirements

### Gotchas

- Email HTML has limited CSS support
- Some email clients block images by default
- Time zones matter for cron scheduling
- Vercel cron has 10-second cold start limit
- Free tier email limits may require upgrade

---

**Estimated Completion Time:** 6-8 hours
**Priority:** High (Core MVP Feature)
**Dependencies:** Tasks 1-7 (Complete)
**Next Task:** Task 9 (Mobile Optimization)

---

_Task Created: October 2025_
_Last Updated: October 2025_
