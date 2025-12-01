---
name: seed-prisma-model
description: Generates TypeScript seed functions for Prisma models using faker.js for realistic test data
---

# Seed Prisma Model

## Description
Generates a TypeScript function to seed a specific Prisma model with realistic, randomized data using `@faker-js/faker`. This ensures the UI always has "real" data to display during development.

## Usage
Run this after creating or modifying a model in `schema.prisma`.

## Steps
1.  **Analyze:** Read `prisma/schema.prisma` to understand the model's fields and types.
2.  **Create:** Create a new file in `prisma/seeds/` named `seed-[model-name].ts`.
3.  **Generate:** Write a function `seed[ModelName](count: number)` that:
    *   Uses `faker` to generate data (e.g., `faker.commerce.productName()` for asset names).
    *   Handles relations (e.g., creating a User first if the model requires a `userId`).
4.  **Register:** Append the new seed function call to the main `prisma/seed.ts` file.
