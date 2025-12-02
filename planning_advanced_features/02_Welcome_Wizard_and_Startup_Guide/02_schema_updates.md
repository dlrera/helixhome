# Schema Updates: Welcome Wizard and Startup Guide

## Overview

We need to store comprehensive home details (`HomeProfile`) and track the user's progress through the wizard (`OnboardingState`).

## Proposed Changes

### 1. New Model: `HomeProfile`

Stores the physical characteristics of the home. This might have been partially started in Feature 01, but we will fully define it here.

```prisma
model HomeProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Location & Structure
  address       String?
  city          String?
  state         String?
  postalCode    String?
  country       String?  @default("US")

  yearBuilt     Int?
  squareFootage Int?

  // Environmental
  climateZone   String? // e.g., "Hot-Humid", "Cold", "Marine"

  // Systems (Simple booleans or enums for the wizard)
  hasCentralAir Boolean?
  heatingType   String? // "Furnace", "HeatPump", "Boiler", "None"
  waterHeaterType String? // "Tank", "Tankless"

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 2. New Model: `OnboardingState`

Tracks where the user is in the setup process.

```prisma
model OnboardingState {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  currentStep   Int      @default(1)
  totalSteps    Int      @default(5)
  isComplete    Boolean  @default(false)
  skipped       Boolean  @default(false)

  // Store temporary answers if not yet committed to HomeProfile
  stepData      Json?    // e.g., { step1: { year: 1990 }, step2: { ... } }

  updatedAt     DateTime @updatedAt
}
```

### 3. Update Model: `User`

Ensure relations exist.

```prisma
model User {
  // ... existing fields ...
  homeProfile     HomeProfile?
  onboardingState OnboardingState?
}
```

## Migration Steps

1.  Create `HomeProfile` model.
2.  Create `OnboardingState` model.
3.  Add relations to `User`.
4.  Run `npx prisma migrate dev --name add_home_profile_and_onboarding`.
