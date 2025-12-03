# Seed Data Strategy: Settings Menu

## Overview

This document outlines the strategy for seeding data to support the development and testing of the Settings Menu.

## Requirements

- Existing users (`admin@example.com`, `test@example.com`) need to have associated `Home` records with populated details to test the "Home Settings" form.
- If `UserPreference` model is implemented, default preferences should be seeded for these users.

## Changes to `prisma/seed.ts`

### 1. Update Home Creation

Ensure the default home created for the admin user has some initial data.

```typescript
const home = await prisma.home.upsert({
  where: {
    /* ... */
  },
  update: {},
  create: {
    name: 'Admin Residence',
    userId: adminUser.id,
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '90210',
    propertyType: 'Single Family',
    yearBuilt: 2015,
    sizeSqFt: 2500,
  },
})
```

### 2. Seed User Preferences (If Model Added)

```typescript
await prisma.userPreference.create({
  data: {
    userId: adminUser.id,
    theme: 'dark',
    compactMode: false,
    emailNotifications: true,
  },
})
```

## Verification

- Run `npm run db:seed`.
- Verify in Prisma Studio (`npx prisma studio`) that the `Home` record has the new fields populated.
