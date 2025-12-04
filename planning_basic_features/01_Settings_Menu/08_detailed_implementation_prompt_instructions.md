# Detailed Implementation Prompt Instructions

Use these prompts sequentially in the "Immediate Action" section of `07_coding_agent_prompt.md`.

## Session 1: Foundation & Backend

```markdown
**Immediate Action**:
Execute **Phase 1: Foundation & Backend** from `06_detailed_implementation_rollout.md`.

1.  **Schema Update**: Add `address`, `propertyType`, `yearBuilt`, and `sizeSqFt` to the `Home` model in `prisma/schema.prisma`. Run `npx prisma migrate dev --name add_home_settings`.
2.  **Seed Data**: Update `prisma/seed.ts` to populate these new fields for the default admin home. Run `npm run db:seed`.
3.  **Validation Schemas**: Create `src/lib/validation/settings.ts` and define Zod schemas for `homeDetailsSchema` and `userPreferencesSchema`.
4.  **Server Actions**: Create `src/app/settings/actions.ts`. Implement `updateHomeDetails` (validating session and input) and `updateUserPreferences`.
```

## Session 2: UI Structure & General Settings

```markdown
**Immediate Action**:
Execute **Phase 2: UI Implementation (Part 1)** from `06_detailed_implementation_rollout.md`.

1.  **Routing**: Create `app/(protected)/settings/layout.tsx` and `app/(protected)/settings/page.tsx` (redirect to `/settings/general`).
2.  **Sidebar Component**: Create `src/components/settings/settings-sidebar.tsx` using `shadcn/ui` components. Ensure it highlights the active route.
3.  **General Settings Page**: Create `app/(protected)/settings/general/page.tsx`.
4.  **General Form**: Create `src/components/settings/general-settings-form.tsx` to handle theme toggling and other general preferences.
```

## Session 3: Home Settings Implementation

```markdown
**Immediate Action**:
Execute **Phase 2: UI Implementation (Part 2)** from `06_detailed_implementation_rollout.md`.

1.  **Home Settings Page**: Create `app/(protected)/settings/home/page.tsx`. Fetch the user's home data server-side.
2.  **Home Form**: Create `src/components/settings/home-details-form.tsx` using `react-hook-form` and `zod`.
3.  **Integration**: Connect the form to the `updateHomeDetails` server action. Implement success/error toast notifications.
4.  **Verification**: Verify that changes to home details are persisted to the database.
```

## Session 4: Notifications & Polish

```markdown
**Immediate Action**:
Execute **Phase 3: Notifications & Polish** from `06_detailed_implementation_rollout.md`.

1.  **Notification Page**: Create `app/(protected)/settings/notifications/page.tsx`.
2.  **Notification Form**: Create `src/components/settings/notification-preferences-form.tsx` with toggles for email and push notifications.
3.  **App Navigation**: Add a "Settings" link to the main application sidebar or header to ensure discoverability.
4.  **Manual Verification**: Click through all settings pages, update values, and verify persistence and UI feedback.
```

## Session 5: Application Integration

```markdown
**Immediate Action**:
Execute **Phase 5: Application Integration** from `06_detailed_implementation_rollout.md`.

1.  **Dashboard Integration**: Update `app/(protected)/dashboard/page.tsx` to fetch and display the dynamic "Home Name".
2.  **Formatting Utilities**: Create `src/lib/formatters.ts` with `formatCurrency` and `formatDate` functions.
3.  **Apply Formatting**: Update `app/(protected)/assets/page.tsx` and `app/(protected)/tasks/page.tsx` to use these formatters.
4.  **Theme Verification**: Ensure the theme provider is correctly wrapping the application in `app/layout.tsx` or `app/(protected)/layout.tsx` and that toggling works without FOUC.
```
