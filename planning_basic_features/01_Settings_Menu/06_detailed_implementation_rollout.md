# Detailed Implementation Rollout: Settings Menu

## Phase 1: Foundation & Backend (Day 1)

1.  **Schema Update**:
    - Add fields to `Home` model.
    - Create `UserPreference` model (if decided).
    - Run migration.
2.  **Seed Data**:
    - Update `seed.ts` to populate new fields.
    - Run seed script.
3.  **Server Actions**:
    - Create `src/app/settings/actions.ts`.
    - Implement `updateHomeDetails` and `updateUserPreferences`.
    - Add Zod schemas in `src/lib/validation/settings.ts`.

## Phase 2: UI Implementation (Day 1-2)

1.  **Routing**:
    - Create `app/(protected)/settings/layout.tsx`.
    - Create `app/(protected)/settings/page.tsx` (redirects to `/settings/general`).
2.  **Navigation**:
    - Build `SettingsSidebar` component.
    - Integrate into `SettingsLayout`.
3.  **General Settings**:
    - Create `app/(protected)/settings/general/page.tsx`.
    - Build `GeneralSettingsForm`.
    - Wire up theme toggle (using `next-themes` or custom context).
4.  **Home Settings**:
    - Create `app/(protected)/settings/home/page.tsx`.
    - Build `HomeDetailsForm`.
    - Connect to `updateHomeDetails` action.

## Phase 3: Notifications & Polish (Day 2)

1.  **Notification Settings**:
    - Create `app/(protected)/settings/notifications/page.tsx`.
    - Build `NotificationPreferencesForm`.
2.  **Integration**:
    - Add "Settings" link to main app sidebar/header.
3.  **Verification**:
    - Manual testing of all forms.
    - Verify persistence of settings.
    - Check responsive design (mobile drawer for settings nav).

## Phase 4: Testing (Day 3) ✅ COMPLETED

1.  **E2E Tests**: ✅
    - Write Playwright tests for navigating to settings and updating a value.
    - Created `tests/e2e/settings.spec.ts` with 28 comprehensive tests covering:
      - Settings navigation and sidebar
      - General settings (theme, currency, date format)
      - Home settings (property info, address)
      - Notification settings (channels, types)
      - Mobile responsiveness
      - Authentication guards
2.  **Unit Tests**: ✅
    - Test Zod validation schemas.
    - Created `tests/unit/settings-validation.test.ts` with 33 tests covering:
      - addressSchema validation
      - updateHomeDetailsSchema validation (homeId, name, propertyType, yearBuilt, sizeSqFt, climateZone)
      - updateUserPreferencesSchema validation (theme, currency, dateFormat, notification toggles)
      - Constants validation (PROPERTY_TYPES, CLIMATE_ZONES, THEMES, CURRENCIES, DATE_FORMATS)
    - Run with: `npm run test:unit`

## Phase 5: Application Integration (Day 3-4) ✅ COMPLETED

1.  **Dashboard Integration**: ✅
    - Updated `app/(protected)/dashboard/page.tsx` to display dynamic "Home Name" in a branded badge
    - Home name appears in header section alongside welcome message
2.  **Formatting Utilities**: ✅
    - Created `lib/formatters.ts` with:
      - `formatCurrency(amount, currency)` - Formats currency based on user preferences (USD, EUR, GBP, CAD, AUD)
      - `formatDate(date, format)` - Formats dates per user preference (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
      - `formatDateTime(date, format)` - Formats date with time
      - `formatRelativeDate(date, format)` - Shows relative dates (Today, Tomorrow, etc.) with fallback
    - Created `lib/hooks/use-formatters.ts` React hook for reactive preference updates
    - Added `notifyPreferencesChanged()` to trigger re-renders when preferences are saved
3.  **Apply Formatting**: ✅
    - Updated `components/assets/asset-detail.tsx` - Uses `formatDate` for purchase date, warranty, created date, task due dates
    - Updated `app/(protected)/tasks/[id]/task-detail-client.tsx` - Uses `formatDate`, `formatDateTime`, and `formatCurrency` for dates and costs
    - Updated `components/dashboard/cost-summary.tsx` - Uses user-preference-aware `formatCurrency`
4.  **Theme Verification**: ✅
    - Added blocking script in `app/layout.tsx` to apply theme before page renders (prevents FOUC)
    - Script reads `helix-user-preferences` from localStorage and applies `dark` class synchronously
    - Added `suppressHydrationWarning` to handle server/client class differences
    - Verified dark mode CSS variables already defined in `globals.css`
