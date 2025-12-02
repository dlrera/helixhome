# Detailed Implementation Prompt Instructions

Use these prompts sequentially in the "Immediate Action" section of `07_coding_agent_prompt.md`.

## Session 1: Database Schema & Models

```markdown
**Immediate Action**:
Execute **Phase 1: Database Schema & Models** from `06_detailed_implementation_rollout.md`.

1.  **Define `HomeProfile` Model**: Add the model to `prisma/schema.prisma` with fields for address, year built, climate, and systems.
2.  **Define `OnboardingState` Model**: Add the model to track step progress and completion status.
3.  **Update `User` Model**: Add relations to `HomeProfile` and `OnboardingState`.
4.  **Migration**: Run `npx prisma format` and `npx prisma migrate dev --name add_home_profile_and_onboarding`. Verify the migration file is created.
```

## Session 2: Backend API Implementation

```markdown
**Immediate Action**:
Execute **Phase 2: Backend API Implementation** from `06_detailed_implementation_rollout.md`.

1.  **Onboarding Service**: Create `lib/onboarding.ts` with `generateStarterPlan` logic. This function should query `TemplatePacks` and create `RecurringSchedules`.
2.  **Endpoints**: Implement:
    - `POST /api/onboarding/start`
    - `POST /api/onboarding/step`
    - `POST /api/onboarding/complete` (Triggers plan generation)
    - `GET /api/onboarding/status`
```

## Session 3: Frontend UI Components (Steps)

```markdown
**Immediate Action**:
Execute **Phase 3: Frontend UI Components** from `06_detailed_implementation_rollout.md`.

1.  **Layout**: Create `app/(onboarding)/layout.tsx` and `app/(onboarding)/onboarding/page.tsx`.
2.  **Step Components**: Create individual components for:
    - Step 1: Home Details (Address, Year, Size)
    - Step 2: Climate Zone
    - Step 3: Systems (Heating, Cooling, Water Heater)
    - Step 4: Review & Generate
3.  **State Management**: Implement the logic to navigate between steps and save data to the API.
```

## Session 4: Integration & Verification

```markdown
**Immediate Action**:
Execute **Phase 4: Integration & Polish** from `06_detailed_implementation_rollout.md`.

1.  **Dashboard Redirect**: Update `app/(protected)/dashboard/page.tsx` to prompt users who haven't completed onboarding.
2.  **Manual Verification**:
    - Create a new user.
    - Go through the full wizard flow.
    - Verify that `HomeProfile` is saved correctly.
    - Verify that `Tasks` are generated based on the selected packs.
```
