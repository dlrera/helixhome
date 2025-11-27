# Seed Data Strategy: Expanded Template Library

## Overview

To make the feature valuable immediately, we need a robust set of default "System Packs".

## Seed Script Logic

1.  Define data in `prisma/seed-data/template-packs.ts`.
2.  Script should be idempotent (use `upsert` on unique Name or a fixed Slug/ID).
3.  Run as part of `prisma db seed`.

## Proposed Packs

### 1. "Seasonal Essentials" (Pack)

- **Tags**: Seasonal, General
- **Templates**:
  - **Gutter Cleaning**: Frequency: SEMIANNUAL (Spring/Fall).
  - **Outdoor Faucet Winterization**: Frequency: ANNUAL (Fall).
  - **AC Coil Cleaning**: Frequency: ANNUAL (Spring).

### 2. "Safety First" (Pack)

- **Tags**: Safety, Critical
- **Templates**:
  - **Smoke Detector Test**: Frequency: MONTHLY.
  - **Smoke Detector Battery Change**: Frequency: ANNUAL.
  - **Fire Extinguisher Check**: Frequency: ANNUAL.
  - **Dryer Vent Cleaning**: Frequency: ANNUAL.

### 3. "Appliance Care" (Pack)

- **Tags**: Appliance, Efficiency
- **Templates**:
  - **Refrigerator Coil Cleaning**: Frequency: ANNUAL.
  - **Dishwasher Filter Cleaning**: Frequency: MONTHLY.
  - **Washing Machine Descale**: Frequency: QUARTERLY.

## Data Structure Example

```typescript
const packs = [
  {
    name: 'Safety First',
    description: 'Critical safety checks for every home.',
    templates: [
      {
        name: 'Smoke Detector Test',
        frequency: 'MONTHLY',
        duration: 5,
        difficulty: 'EASY',
        steps: ['Press test button', 'Listen for alarm', 'Check all units'],
        tools: ['None'],
        safety: 'Wear ear protection if sensitive.',
      },
    ],
  },
]
```
