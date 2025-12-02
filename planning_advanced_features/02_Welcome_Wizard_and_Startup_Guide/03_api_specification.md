# API Specification: Welcome Wizard and Startup Guide

## Base URL

`/api/onboarding`

## Endpoints

### 1. Get Onboarding Status

**GET** `/api/onboarding/status`

**Response**:

```json
{
  "isComplete": false,
  "currentStep": 2,
  "totalSteps": 5,
  "skipped": false,
  "homeProfile": {
    "yearBuilt": 1995,
    "postalCode": "90210"
  }
}
```

### 2. Start Onboarding

**POST** `/api/onboarding/start`

**Logic**:

- Creates `OnboardingState` record if not exists.
- Resets `currentStep` to 1 if requested.

**Response**:

```json
{
  "success": true,
  "sessionId": "..."
}
```

### 3. Save Step Data

**POST** `/api/onboarding/step`

**Body**:

```json
{
  "step": 1,
  "data": {
    "yearBuilt": 2000,
    "squareFootage": 2500
  }
}
```

**Logic**:

- Updates `OnboardingState.stepData`.
- Optionally updates `HomeProfile` immediately or waits for completion.
- Increments `currentStep`.

**Response**:

```json
{
  "success": true,
  "nextStep": 2
}
```

### 4. Complete Onboarding (Generate Plan)

**POST** `/api/onboarding/complete`

**Body**:

```json
{
  "selectedPackIds": ["pack_seasonal", "pack_safety"] // Optional overrides
}
```

**Logic**:

1.  Finalize `HomeProfile` data.
2.  Mark `OnboardingState.isComplete = true`.
3.  **Trigger Plan Generation**:
    - Identify relevant `TemplatePacks` (e.g., if `yearBuilt < 1980`, add "Old Home Pack").
    - Apply these packs to the user's account (creating `RecurringSchedules`).
4.  Return summary of actions taken.

**Response**:

```json
{
  "success": true,
  "tasksCreated": 12,
  "packsApplied": ["Seasonal Essentials", "Safety First"]
}
```

### 5. Skip Onboarding

**POST** `/api/onboarding/skip`

**Logic**:

- Sets `OnboardingState.skipped = true`.
- User can be prompted later.
