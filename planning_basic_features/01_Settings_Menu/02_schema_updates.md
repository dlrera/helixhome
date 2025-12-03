# Schema Updates: Settings Menu

## Overview

This document outlines the database schema changes required to support the new Settings Menu, specifically for storing home details and user preferences.

## New Models / Updates

### 1. Update `Home` Model

Add fields to store detailed property information.

```prisma
model Home {
  id          String   @id @default(cuid())
  name        String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // New Fields
  address     String?  // Full address or just street
  city        String?
  state       String?
  zip         String?
  country     String?  @default("US")

  propertyType String? // e.g., "Single Family", "Condo", "Townhouse"
  yearBuilt    Int?
  sizeSqFt     Int?

  // Relations
  assets      Asset[]
  tasks       Task[]
  // ... existing relations
}
```

### 2. New `UserPreference` Model (Optional/Future)

If we need to store per-user settings that are not part of the `User` model (to keep it lightweight for Auth).

```prisma
model UserPreference {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  theme       String   @default("system") // "light", "dark", "system"
  compactMode Boolean  @default(false)

  // Notification Preferences
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(true)

  currency    String   @default("USD")
  dateFormat  String   @default("MM/DD/YYYY")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Migration Strategy

1.  Create a new migration: `npx prisma migrate dev --name add_home_details_and_preferences`.
2.  Update `seed.ts` to include default values for these new fields for existing test users.
