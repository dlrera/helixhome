# Residential CMMS Platform Features Core MVP

## Tranche 1: Core MVP - "The Foundation"

_Without these, the platform has no meaningful value proposition_

### Feature Set

#### Asset Inventory (Simplified)

- Basic asset creation with photos
- Simple categorization (appliances, HVAC, plumbing, etc.)
- Model/serial number storage
- Purchase date and warranty tracking

#### Basic Maintenance Scheduling

- Pre-built templates for top 20 home maintenance tasks
- Simple calendar-based scheduling
- Email/push notifications for due tasks
- Mark complete functionality
- Basic recurring task setup

#### Simple Task Management

- Create one-off tasks
- Due dates and basic priority
- Complete/incomplete status
- Basic notes field

#### Mobile Access

- Responsive web or basic native app
- Photo upload from phone
- View and complete tasks on mobile

### Success Metrics

- User can add 10 assets in <5 minutes
- 80% of users schedule at least 3 maintenance tasks
- 60% task completion rate
- Weekly active usage

### Critical UX Elements

- Dead-simple onboarding (start with 1 asset)
- Pre-populated templates (no starting from scratch)
- Mobile-first design
- Single tap to complete tasks

---

## Detailed Implementation Plan

### Phase 1: Technical Foundation & Architecture

#### 1.1 Technology Stack Selection

**Backend:**

- **API Framework:** Node.js with Express or Python with FastAPI
- **Database:** PostgreSQL for relational data, with JSON fields for flexible asset metadata
- **File Storage:** AWS S3 or similar for photos and documents
- **Authentication:** JWT-based auth with refresh tokens
- **Email Service:** SendGrid or AWS SES for notifications
- **Push Notifications:** Firebase Cloud Messaging (cross-platform)

**Frontend:**

- **Web:** React or Vue.js with responsive design
- **Mobile:** React Native or Flutter for cross-platform development
- **State Management:** Redux/Vuex or Context API
- **UI Framework:** Material-UI or Tailwind CSS for rapid development

#### 1.2 Database Schema Design

```sql
-- Core Tables Structure

Users
- id (UUID)
- email
- password_hash
- first_name
- last_name
- timezone
- notification_preferences (JSON)
- created_at
- updated_at

Homes
- id (UUID)
- user_id (FK)
- name
- address (JSON)
- created_at

Assets
- id (UUID)
- home_id (FK)
- name
- category (ENUM: appliance, hvac, plumbing, electrical, structural, outdoor, other)
- model_number
- serial_number
- purchase_date
- warranty_expiry_date
- photo_url
- metadata (JSON for flexible fields)
- created_at
- updated_at

MaintenanceTemplates
- id (UUID)
- name
- description
- category
- default_frequency (ENUM: weekly, monthly, quarterly, semi-annual, annual)
- estimated_duration_minutes
- difficulty_level (ENUM: easy, moderate, hard)
- instructions (JSON)
- is_system_template (BOOLEAN)
- created_at

Tasks
- id (UUID)
- home_id (FK)
- asset_id (FK, nullable)
- template_id (FK, nullable)
- title
- description
- due_date
- priority (ENUM: low, medium, high)
- status (ENUM: pending, completed, overdue, cancelled)
- completed_at
- notes
- created_at
- updated_at

RecurringTaskSchedules
- id (UUID)
- task_template_id (FK)
- asset_id (FK)
- frequency
- next_due_date
- is_active
- created_at

NotificationLog
- id (UUID)
- user_id (FK)
- task_id (FK)
- type (ENUM: email, push, sms)
- status (ENUM: sent, failed, pending)
- sent_at
- metadata (JSON)
```

#### 1.3 API Endpoints Specification

```yaml
Authentication: POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/refresh
  POST /api/auth/logout

User Management: GET /api/user/profile
  PUT /api/user/profile
  PUT /api/user/notification-settings

Assets: GET /api/assets (list with pagination)
  GET /api/assets/{id}
  POST /api/assets
  PUT /api/assets/{id}
  DELETE /api/assets/{id}
  POST /api/assets/{id}/photo

Maintenance Templates: GET /api/templates (with category filter)
  GET /api/templates/{id}
  POST /api/templates/apply-to-asset

Tasks: GET /api/tasks (with status, date filters)
  GET /api/tasks/{id}
  POST /api/tasks
  PUT /api/tasks/{id}
  POST /api/tasks/{id}/complete
  DELETE /api/tasks/{id}

Recurring Schedules: GET /api/schedules
  POST /api/schedules
  PUT /api/schedules/{id}
  DELETE /api/schedules/{id}

Notifications: GET /api/notifications/settings
  PUT /api/notifications/settings
  POST /api/notifications/test
```

---

### Phase 2: Core Features Implementation

#### 2.1 Asset Inventory Module

**User Stories & Acceptance Criteria:**

**US-001: Quick Asset Creation**
As a homeowner, I want to add an asset to my home inventory quickly so that I can track its maintenance needs.

_Acceptance Criteria:_

- User can create asset with just name and category (2 required fields)
- Photo capture works on mobile devices
- Model/serial numbers are optional
- Purchase date defaults to today but is editable
- Warranty period can be set in months or years
- Save confirms with success message
- Asset appears immediately in asset list

**Implementation Tasks:**

1. Create asset creation form component
2. Implement photo upload with compression (max 2MB)
3. Add client-side validation
4. Create API endpoint for asset creation
5. Implement optimistic UI updates
6. Add success/error toast notifications

**US-002: Asset Categorization**
As a homeowner, I want to categorize my assets so that I can find them easily and apply relevant maintenance templates.

_Acceptance Criteria:_

- Predefined categories with icons (Appliances, HVAC, Plumbing, Electrical, Structural, Outdoor, Other)
- Visual category selector (not dropdown)
- Categories have suggested subcategories (e.g., HVAC → Furnace, AC, Water Heater)
- Can filter asset list by category

**Implementation Tasks:**

1. Design category icon set
2. Create category selector component
3. Implement category filtering on asset list
4. Add category-based color coding
5. Create subcategory suggestion system

#### 2.2 Maintenance Scheduling Module

**US-003: Template Application**
As a homeowner, I want to apply pre-built maintenance templates to my assets so I don't have to create tasks from scratch.

_Acceptance Criteria:_

- Show relevant templates when viewing an asset
- One-click template application
- Can customize frequency before applying
- Shows estimated time and difficulty
- Creates recurring schedule automatically

**Pre-built Template List (Top 20):**

1. Change HVAC filter (Monthly/Quarterly)
2. Test smoke detectors (Monthly)
3. Clean range hood filter (Monthly)
4. Run water in unused drains (Monthly)
5. Check water softener salt (Monthly)
6. Clean garbage disposal (Monthly)
7. Test GFCI outlets (Monthly)
8. Clean dryer vent (Quarterly)
9. Clean refrigerator coils (Semi-annual)
10. Flush water heater (Annual)
11. Clean gutters (Semi-annual)
12. Check roof and attic (Semi-annual)
13. Service HVAC system (Annual)
14. Test sump pump (Quarterly)
15. Inspect fire extinguisher (Annual)
16. Clean chimney (Annual)
17. Winterize outdoor faucets (Annual)
18. Check washing machine hoses (Annual)
19. Seal deck/fence (Annual)
20. Clean window wells (Semi-annual)

**Implementation Tasks:**

1. Create template data seed file
2. Build template selection UI
3. Implement frequency customization modal
4. Create recurring task generation logic
5. Add template-to-asset matching algorithm

**US-004: Notification System**
As a homeowner, I want to receive reminders about upcoming maintenance tasks so I don't forget them.

_Acceptance Criteria:_

- Email notifications 3 days before due date
- Push notification on due date (if app installed)
- Can configure notification preferences per task type
- Includes quick action links (Complete/Snooze)
- Batches multiple tasks due same day

**Implementation Tasks:**

1. Set up email template system
2. Implement notification queue with Redis
3. Create notification preference settings UI
4. Build notification batching logic
5. Implement quick action token system
6. Add push notification registration flow

#### 2.3 Task Management Module

**US-005: Quick Task Creation**
As a homeowner, I want to create one-off tasks quickly for ad-hoc maintenance needs.

_Acceptance Criteria:_

- Create task with just title and due date
- Optional association with asset
- Three priority levels with visual indicators
- Can add notes
- Appears immediately in task list

**Implementation Tasks:**

1. Create quick task modal/form
2. Implement priority level indicators
3. Add task to calendar view
4. Create task list with filters
5. Implement sort options (date, priority, status)

**US-006: Task Completion**
As a homeowner, I want to mark tasks as complete with minimal friction.

_Acceptance Criteria:_

- Single tap/click to complete
- Optional completion notes
- Can add photo of completed work
- Updates recurring schedule automatically
- Shows completion confirmation

**Implementation Tasks:**

1. Create completion gesture/button
2. Build completion notes modal (optional)
3. Implement photo attachment to completion
4. Update recurring task logic
5. Add completion streak tracking

#### 2.4 Mobile Experience Module

**US-007: Mobile-First Interface**
As a homeowner, I want to use the app on my phone while doing maintenance tasks.

_Acceptance Criteria:_

- All features work on mobile browsers
- Touch-optimized buttons (min 44x44px)
- Swipe gestures for common actions
- Works offline with sync when connected
- Fast load times (<3 seconds)

**Implementation Tasks:**

1. Implement responsive grid system
2. Create touch gesture handlers
3. Add offline support with service workers
4. Implement data sync queue
5. Optimize bundle size and lazy loading
6. Add PWA manifest for installation

---

### Phase 3: Onboarding & UX Polish

#### 3.1 Onboarding Flow

**Step-by-Step Onboarding:**

1. **Welcome Screen**
   - Value proposition: "Never miss home maintenance again"
   - Single CTA: "Get Started"

2. **Quick Setup (3 steps max)**
   - Step 1: Add your first asset (guided)
   - Step 2: Schedule its maintenance
   - Step 3: Set notification preferences

3. **Guided First Asset:**
   - Suggest common starting point (HVAC system)
   - Pre-fill with common model
   - Show success animation
   - Immediately suggest relevant maintenance

**Implementation Tasks:**

1. Create onboarding flow component
2. Build progress indicator
3. Implement skip option
4. Add coached marks for UI elements
5. Create success animations
6. Track onboarding completion metrics

#### 3.2 Dashboard Design

**Primary Dashboard Elements:**

- **This Week** section (tasks due in next 7 days)
- **Overdue** tasks (if any) with red indicator
- **Quick Actions** (Add Asset, Create Task)
- **Recent Activity** (last 3 completed tasks)
- **Asset Summary** (count by category with icons)

**Implementation Tasks:**

1. Design dashboard layout (mobile-first)
2. Create dashboard widgets
3. Implement real-time updates
4. Add pull-to-refresh on mobile
5. Create empty states with CTAs

---

### Phase 4: Testing & Quality Assurance

#### 4.1 Testing Strategy

**Unit Tests (80% coverage target):**

- All API endpoints
- Business logic functions
- React components
- Data validation

**Integration Tests:**

- Authentication flow
- Asset creation to task generation
- Notification delivery
- Photo upload pipeline

**E2E Tests (Critical Paths):**

- New user onboarding
- Asset creation and maintenance scheduling
- Task completion flow
- Notification preferences

**Performance Tests:**

- Load time < 3 seconds
- API response time < 200ms
- Photo upload < 5 seconds
- Support 100 concurrent users

#### 4.2 User Acceptance Testing

**Beta Test Plan:**

- Recruit 50 homeowners
- 2-week testing period
- Daily task: Add 1 asset, complete 1 task
- Weekly feedback survey
- In-app feedback widget

**Key Metrics to Track:**

- Time to first asset (target: <2 minutes)
- Assets added per user
- Task completion rate
- Notification engagement rate
- Daily/weekly active users
- Rage clicks and error rates

---

### Phase 5: Launch Preparation

#### 5.1 Infrastructure Setup

**Production Environment:**

- Load balancer with auto-scaling
- Database with read replicas
- CDN for static assets
- Monitoring with alerts (Datadog/New Relic)
- Error tracking (Sentry)
- Analytics (Mixpanel/Amplitude)

#### 5.2 Documentation

**Developer Documentation:**

- API documentation with examples
- Database schema documentation
- Deployment procedures
- Environment configuration guide

**User Documentation:**

- Getting started guide
- FAQ section
- Video tutorials for key features
- Email templates for support

#### 5.3 Launch Checklist

- [ ] All critical path tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] GDPR/Privacy compliance verified
- [ ] SSL certificates configured
- [ ] Backup and recovery tested
- [ ] Support email/system ready
- [ ] Analytics tracking verified
- [ ] App store submissions (if applicable)
- [ ] Marketing website ready

---

### Development Timeline Estimates

**Setup & Foundation**

- Development environment setup
- Database design and creation
- Authentication system
- Basic API structure

**Asset Management**

- Asset CRUD operations
- Photo upload system
- Category system
- Asset list and detail views

**Task Management**

- Task creation and management
- Recurring task logic
- Task list and calendar views
- Completion flow

**Maintenance Templates**

- Template data structure
- Template application logic
- Pre-built template creation
- Template-to-asset matching

**Notifications**

- Email notification system
- Push notification setup
- Notification preferences
- Notification queue and delivery

**Mobile Optimization**

- Responsive design refinement
- Touch interactions
- PWA features
- Offline support

**Onboarding & Polish**

- Onboarding flow
- Dashboard creation
- UX improvements
- Performance optimization

**Testing & Beta**

- Comprehensive testing
- Beta user recruitment
- Beta testing period
- Bug fixes and improvements

**Launch Preparation**

- Production deployment
- Monitoring setup
- Documentation completion
- Launch readiness review

---

## Risk Mitigation

### Technical Risks

**Risk: Photo storage costs escalating**

- Mitigation: Implement photo compression, set limits per user, use progressive pricing

**Risk: Notification delivery failures**

- Mitigation: Use multiple channels, implement retry logic, track delivery rates

**Risk: Poor mobile performance**

- Mitigation: Progressive web app, lazy loading, optimize bundle size

### User Adoption Risks

**Risk: Complex onboarding leading to abandonment**

- Mitigation: Single asset start, guided flow, skip options

**Risk: Forgetting to use the app**

- Mitigation: Strategic notifications, email digests, streak mechanics

**Risk: Template mismatch with user needs**

- Mitigation: User research for template selection, allow custom templates in v2

---

## Success Criteria for MVP Launch

### Quantitative Metrics

- 100 users complete onboarding in first week
- 70% of users add at least 3 assets
- 60% week-1 retention
- <3% crash rate
- <5 second load time on 3G

### Qualitative Metrics

- User feedback rating >4.0/5
- "Would recommend" score >7/10
- Clear value proposition understood
- No critical usability issues

---

_Last Updated: October 2025_

---

## Discrete Implementation Instructions for Coding Agent

### Context for Coding Agent

You are working on the HelixIntel prototype, a Next.js 15 application with existing authentication and UI infrastructure. The goal is to add residential CMMS (Computerized Maintenance Management System) features. The project uses:

- Next.js 15.0.4 with App Router
- Prisma ORM with SQLite
- NextAuth.js for authentication
- TailwindCSS with custom HelixIntel theme
- shadcn/ui components

### Task 1: Database Schema Extension

**Objective:** Add CMMS models to the existing Prisma schema

**Steps:**

1. Open `/prisma/schema.prisma`
2. Add the following models after the existing User model:
   - Home (linked to User)
   - Asset (linked to Home)
   - MaintenanceTemplate
   - Task (linked to Home, Asset, and MaintenanceTemplate)
   - RecurringSchedule (linked to Asset and MaintenanceTemplate)
   - Notification (linked to User and Task)
3. Add required enums: AssetCategory, Frequency, Difficulty, Priority, TaskStatus, NotificationType, NotificationStatus
4. Run migration: `npx prisma migrate dev --name add_cmms_models`
5. Update `/prisma/seed.ts` to include:
   - 20 maintenance templates
   - Sample home for admin@example.com
   - 3-5 sample assets (Furnace, Water Heater, etc.)

**Success Criteria:**

- Migration runs without errors
- `npx prisma studio` shows new tables
- Seed script creates sample data

---

### Task 2: Asset Management API

**Objective:** Create API routes for asset CRUD operations

**Steps:**

1. Create `/app/api/assets/route.ts` with:
   - GET: List user's assets (check session)
   - POST: Create new asset (validate with Zod)
2. Create `/app/api/assets/[id]/route.ts` with:
   - GET: Fetch single asset
   - PUT: Update asset
   - DELETE: Remove asset
3. Use existing auth pattern: `getServerSession(authOptions)`
4. Return appropriate HTTP status codes
5. Validate all inputs with Zod schemas

**Success Criteria:**

- API routes return 401 for unauthenticated requests
- CRUD operations work via Postman/curl
- Data validates correctly

---

### Task 3: Asset UI Pages

**Objective:** Create asset management interface

**Steps:**

1. Create `/app/(protected)/assets/page.tsx` - Asset list page
2. Create `/app/(protected)/assets/new/page.tsx` - Add asset form
3. Create `/app/(protected)/assets/[id]/page.tsx` - Asset detail page
4. Use existing shadcn/ui components (Button, Input, Card, etc.)
5. Implement with TanStack Query for data fetching
6. Add loading and error states

**Key Features:**

- Grid/list view of assets with photos
- Category filter buttons
- Quick add asset button
- Mobile-responsive design

**Success Criteria:**

- Users can view, add, edit, and delete assets
- Forms validate before submission
- UI matches HelixIntel brand colors

---

### Task 4: Global Navigation System

**Objective:** Implement responsive, persistent navigation structure for all platform features

**Steps:**

1. Create `/components/layout/app-layout.tsx` - Main layout wrapper with sidebar and top bar
2. Create `/components/layout/top-bar.tsx` - Top navigation with logo, search, notifications, user menu
3. Create `/components/layout/sidebar.tsx` - Collapsible sidebar for desktop, overlay for mobile
4. Create `/components/layout/floating-action-button.tsx` - Mobile FAB for quick actions
5. Create `/components/layout/command-palette.tsx` - Keyboard-driven search/navigation (Cmd+K)
6. Create `/lib/config/navigation.ts` - Centralized navigation configuration
7. Update `/app/(protected)/layout.tsx` - Wrap all protected pages with AppLayout
8. Create placeholder pages for Tasks, Templates, Reports, Settings, Help, Profile
9. Create `/app/api/notifications/count/route.ts` - Notification badge count endpoint
10. Implement responsive breakpoints and mobile overlay behavior

**Navigation Structure:**

- **Desktop:** Collapsible sidebar (icons/labels), top bar with logo/search/notifications/user menu
- **Mobile:** Overlay sidebar, bottom FAB, hamburger menu
- **Primary Nav:** Dashboard, Assets, Tasks, Templates
- **Secondary Nav:** Reports, Settings, Help (placeholders)
- **User Menu:** Profile, Account Settings, Sign Out

**Success Criteria:**

- Navigation visible and functional on all protected pages
- Sidebar toggles correctly on desktop, slides in on mobile
- Active page highlighted in navigation
- Keyboard shortcuts work (Cmd+K for command palette)
- All placeholder pages accessible
- Mobile FAB visible only on mobile devices
- Smooth transitions and responsive behavior
- Sidebar state persists across sessions (localStorage)

**See detailed implementation plan:** `/tasks/task-4-global-navigation.md`

---

### Task 5: Maintenance Templates

**Objective:** Implement maintenance template system

**Steps:**

1. Create `/app/api/templates/route.ts` - List templates by category
2. Create `/app/api/templates/apply/route.ts` - Apply template to asset
3. Create template browser component at `/components/templates/template-grid.tsx`
4. Add "Apply Template" button to asset detail page
5. Create recurring schedule when template is applied

**Template Categories to Implement:**

- HVAC (filters, service)
- Plumbing (flush water heater, check hoses)
- Appliances (clean coils, filters)
- Seasonal (gutters, winterization)

**Success Criteria:**

- Templates display with icons and descriptions
- Applying template creates recurring task schedule
- User can customize frequency before applying

---

### Task 6: Task Management System

**Objective:** Build task creation and completion flow

**Steps:**

1. Create `/app/api/tasks/route.ts` with:
   - GET: List tasks with filters (status, due date)
   - POST: Create new task
2. Create `/app/api/tasks/[id]/complete/route.ts` - Mark task complete
3. Create `/app/(protected)/tasks/page.tsx` - Task list with filters
4. Add task widgets to existing dashboard
5. Implement one-tap completion

**UI Components Needed:**

- Task card with due date, asset, priority
- Status badges (pending, completed, overdue)
- Filter bar (this week, overdue, all)
- Complete button with success animation

**Success Criteria:**

- Tasks show in chronological order
- Overdue tasks highlighted in red
- Completion updates immediately
- Dashboard shows next 5 tasks

---

### Task 7: Dashboard Enhancement

**Objective:** Transform placeholder dashboard into functional CMMS hub

**Steps:**

1. Update `/app/(protected)/dashboard/page.tsx`
2. Create dashboard widgets:
   - `/components/dashboard/stats-cards.tsx` (asset count, pending tasks)
   - `/components/dashboard/upcoming-tasks.tsx` (next 5 tasks)
   - `/components/dashboard/recent-assets.tsx` (last 3 added)
   - `/components/dashboard/quick-actions.tsx` (add asset, create task)
3. Fetch data server-side using Prisma
4. Add loading skeletons for each widget

**Success Criteria:**

- Dashboard loads in <2 seconds
- Shows real data from database
- Mobile responsive layout
- Updates reflect immediately

---

### Task 8: Basic Notification System

**Objective:** Implement email reminders for due tasks

**Steps:**

1. Install email package: `npm install resend` or `@sendgrid/mail`
2. Create `/lib/email.ts` with task reminder template
3. Create `/app/api/cron/notifications/route.ts` for daily check
4. Add notification preferences to user profile
5. Log notifications sent in database

**Email Template Requirements:**

- HelixIntel branding (logo, colors)
- Task name and due date
- Direct link to task
- Unsubscribe link

**Success Criteria:**

- Test email sends successfully
- Notifications logged in database
- Only sends for tasks due in next 3 days

---

### Task 9: Mobile Optimization

**Objective:** Ensure all features work well on mobile devices

**Steps:**

1. Add PWA manifest at `/public/manifest.json`
2. Create mobile-specific navigation at `/components/mobile/bottom-nav.tsx`
3. Optimize touch targets (minimum 44x44px)
4. Add swipe gestures for task completion
5. Implement pull-to-refresh on list pages
6. Test on real devices (iOS Safari, Android Chrome)

**Success Criteria:**

- All buttons easily tappable
- Forms usable with virtual keyboard
- Photos upload from camera
- Works offline (service worker)

---

### Testing Checklist

After each task, verify:

- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Feature works on mobile
- [ ] Data persists to database
- [ ] Protected routes require login
- [ ] UI matches HelixIntel brand

---

### Development Order

Complete tasks in this sequence for best results:

1. **Database Schema** (foundation for everything)
2. **Asset Management API** (core entity)
3. **Asset UI Pages** (user can start adding assets)
4. **Global Navigation System** (persistent layout and navigation structure)
5. **Maintenance Templates** (automate task creation)
6. **Task Management System** (create tasks for assets)
7. **Dashboard Enhancement** (tie everything together)
8. **Notification System** (engagement feature)
9. **Mobile Optimization** (polish)

---

### Important Notes for Coding Agent

1. **Always check authentication** - Use `getServerSession(authOptions)` in all API routes
2. **Follow existing patterns** - Look at existing code in auth routes for patterns
3. **Use existing components** - Don't recreate what's in `/components/ui/`
4. **Test incrementally** - Verify each feature works before moving on
5. **Seed realistic data** - Make the demo compelling with good sample data
6. **Mobile-first** - Design for mobile, enhance for desktop
7. **Use transactions** - When creating related records (asset + tasks)
8. **Handle errors gracefully** - Show user-friendly error messages

---

### Environment Variables to Add

Add to `.env` file:

```
# Email Service (choose one)
RESEND_API_KEY=your_key_here
# OR
SENDGRID_API_KEY=your_key_here

# File Storage (for production)
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Cron Secret (for Vercel Cron)
CRON_SECRET=random_string_here
```

---

### Completion Definition

The MVP is complete when:

1. User can add/manage home assets
2. User can create and complete maintenance tasks
3. User can apply maintenance templates to assets
4. User receives email reminders for due tasks
5. Dashboard shows current maintenance status
6. All features work on mobile devices
7. Application passes all TypeScript and ESLint checks

Start with Task 1 and proceed sequentially. Each task should take 4-8 hours for an experienced developer. Total implementation time: 40-60 hours.

---

_Instructions prepared for: HelixIntel CMMS MVP Implementation_
_Estimated completion: 40-60 development hours_
_Last updated: October 2025_
