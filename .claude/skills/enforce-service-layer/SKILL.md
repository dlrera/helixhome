---
name: enforce-service-layer
description: Ensures business logic resides in lib/services/ rather than Server Actions or Route Handlers
---

# Enforce Service Layer

## Description
Enforces the Service-Oriented Architecture (SOA) by ensuring business logic resides in `lib/services/`, not in Server Actions or Route Handlers. This prevents "Fat Controllers" and promotes reusability.

## Usage
Run this when creating or refactoring backend logic.

## Steps
1.  **Audit:** Check the target Server Action (`app/actions/*.ts`).
2.  **Rule Check:**
    *   Does it contain direct `db.model.create/update/delete` calls? -> **Violation**.
    *   Does it contain complex `if/else` business rules? -> **Violation**.
    *   Does it only validate input and call a Service? -> **Pass**.
3.  **Refactor (if Violation):**
    *   Create `lib/services/[Domain]Service.ts`.
    *   Move the `db` calls and logic there.
    *   Export a function (e.g., `createAssetService`).
    *   Update the Server Action to call this service.
