# Detailed Implementation Rollout: Welcome Wizard and Startup Guide

This document provides a step-by-step execution guide for implementing the Welcome Wizard.

## Phase 1: Database Schema & Models

### Step 1.1: Define `HomeProfile` Model

- [ ] **Cross-Reference**: Open `prisma/schema.prisma`.
- [ ] Add `HomeProfile` model with fields: `address`, `city`, `state`, `postalCode`, `country`, `yearBuilt`, `squareFootage`, `climateZone`, `heatingType`, `coolingType`, `waterHeaterType`, `hasCentralAir`.
- [ ] Add `userId` (unique) and relation to `User`.

### Step 1.2: Define `OnboardingState` Model

- [ ] Add `OnboardingState` model with fields: `currentStep`, `totalSteps`, `isComplete`, `skipped`, `stepData` (Json).
- [ ] Add `userId` (unique) and relation to `User`.

### Step 1.3: Update `User` Model

- [ ] Add relations: `homeProfile HomeProfile?`, `onboardingState OnboardingState?`.

### Step 1.4: Migration

- [ ] Run `npx prisma format`.
- [ ] Run `npx prisma migrate dev --name add_home_profile_and_onboarding`.

---

## Phase 2: Backend API Implementation

### Step 2.1: Onboarding Service/Utils

- [ ] Create `lib/onboarding.ts` (or similar).
- [ ] Implement helper function `getOnboardingStatus(userId)`.
- [ ] Implement helper function `generateStarterPlan(userId, homeProfile)`.
  - **Logic**:
    - Fetch all `TemplatePacks`.
    - If `homeProfile.yearBuilt` exists, check against pack rules.
    - If `homeProfile.heatingType` is present, look for HVAC packs.
    - Create `RecurringSchedule` for applicable templates.

### Step 2.2: API Endpoints

- [ ] Create `app/api/onboarding/start/route.ts`.
- [ ] Create `app/api/onboarding/step/route.ts`.
- [ ] Create `app/api/onboarding/complete/route.ts`.
  - **Critical**: Ensure this endpoint calls `generateStarterPlan`.
- [ ] Create `app/api/onboarding/status/route.ts`.

---

## Phase 3: Frontend UI Components

### Step 3.1: Layout & Container

- [ ] Create `app/(onboarding)/layout.tsx` (New route group to isolate layout).
- [ ] Create `app/(onboarding)/onboarding/page.tsx`.
- [ ] Implement `ProgressBar` component.

### Step 3.2: Step Components

- [ ] Create `components/onboarding/step-1-home-details.tsx`.
  - Use `react-hook-form` and `zod` for validation.
- [ ] Create `components/onboarding/step-2-climate.tsx`.
- [ ] Create `components/onboarding/step-3-systems.tsx`.
- [ ] Create `components/onboarding/step-4-review.tsx`.

### Step 3.3: Wizard Logic

- [ ] Implement state management (local state or URL params) to switch between steps.
- [ ] Connect "Next" buttons to `/api/onboarding/step`.

---

## Phase 4: Integration & Polish

### Step 4.1: Dashboard Redirect

- [ ] Open `app/(protected)/dashboard/page.tsx`.
- [ ] Add check: `if (!user.onboardingState?.isComplete && !user.onboardingState?.skipped)`.
- [ ] Show `OnboardingReminder` widget or redirect (optional).

### Step 4.2: Manual Verification

- [ ] Create a new user account.
- [ ] Verify redirection to Onboarding.
- [ ] Complete the wizard.
- [ ] Verify `HomeProfile` is saved in DB.
- [ ] Verify `Tasks` are generated in DB.
