# UI Components: Welcome Wizard and Startup Guide

## Overview

A dedicated onboarding flow that sits outside the main dashboard layout.

## 1. Wizard Container (Page/Layout)

**Path**: `/onboarding` (or `/welcome`)

**Layout**:

- **Clean Interface**: No sidebar, no complex navigation.
- **Header**: Logo and "Save & Exit" button.
- **Progress Bar**: Visual indicator of steps (e.g., "Step 2 of 5").
- **Content Area**: Centered form card.
- **Footer**: "Back" and "Next" buttons.

**Components**:

- `OnboardingLayout`: Wrapper component.
- `ProgressBar`: Simple Shadcn Progress component.

## 2. Step Components

Each step should be a distinct component for maintainability.

### Step 1: Home Basics (`OnboardingStepOne`)

- **Fields**:
  - Address (Google Places Autocomplete optional, or simple text fields).
  - Year Built (Number input).
  - Square Footage (Number input).
  - Ownership Status (Select: Owner, Renter, Landlord).

### Step 2: Climate & Environment (`OnboardingStepTwo`)

- **Fields**:
  - Climate Zone (Select with helper text/map).
  - _Nice to have_: Auto-detect based on Zip Code from Step 1.

### Step 3: Key Systems (`OnboardingStepThree`)

- **Fields**:
  - Heating Type (Cards/Radio: Furnace, Heat Pump, Boiler, None).
  - Cooling Type (Cards/Radio: Central Air, Window Units, None).
  - Water Heater (Cards/Radio: Tank, Tankless).
- **Visuals**: Use icons for these choices to make it engaging.

### Step 4: Review & Generate (`OnboardingStepFour`)

- **Content**:
  - Summary of entered data.
  - "Generating your plan..." loader state.
  - "Success" state showing number of tasks created.
- **Action**: "Go to Dashboard".

## 3. Dashboard Integration

**Path**: `/dashboard`

**Components**:

- `OnboardingReminder`: A dismissible alert or card if `OnboardingState.isComplete` is false.
  - "Finish setting up your home profile to get personalized recommendations."
  - Action: Link to `/onboarding`.
