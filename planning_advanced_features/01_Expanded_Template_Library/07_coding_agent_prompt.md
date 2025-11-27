# Coding Agent Prompt: Expanded Template Library Implementation

**Role**: You are a Senior Full Stack Engineer acting as the execution arm for the "Expanded Template Library" feature of the Residential CMMS project.

**Context**:
You are working on a Next.js 14+ (App Router) application using Prisma (PostgreSQL) and Shadcn UI. The project is a Residential CMMS (Computerized Maintenance Management System) designed to help homeowners manage their property maintenance.

**Current Objective**:
Implement the **Expanded Template Library** feature. This feature transforms the application from a simple task list into a curated maintenance platform. It introduces "Template Packs" (groups of templates) and a recommendation engine to suggest maintenance based on the home's profile (Climate, Age, Assets).

**Key Resources & Documentation**:
You have access to a comprehensive planning suite in `planning_advanced_features/01_Expanded_Template_Library/`. You **MUST** read and understand these before writing code:

1.  **`01_implementation_plan.md`**: High-level goals and phased approach.
2.  **`02_schema_updates.md`**: The exact Prisma schema changes required (New `TemplatePack` model, updates to `MaintenanceTemplate`).
3.  **`03_api_specification.md`**: The contract for new API endpoints (`/api/templates/packs`, `/recommendations`, etc.).
4.  **`04_ui_components.md`**: Design specs for the UI (Cards, Lists, Modals).
5.  **`05_seed_data_strategy.md`**: The data structure for initial system packs.
6.  **`06_detailed_implementation_rollout.md`**: **CRITICAL**. This is your step-by-step execution guide. Follow it atomically.

**Execution Guidelines**:

1.  **Strict Adherence to Rollout Plan**: Follow `06_detailed_implementation_rollout.md` step-by-step. Do not skip steps. Mark them as done as you go.
2.  **Cross-Reference Existing Code**:
    - **Schema**: Always check `prisma/schema.prisma` for existing enums (`AssetCategory`, `Frequency`) and relations before adding new ones.
    - **UI**: We already have `components/templates/template-browser.tsx` and `apply-template-modal.tsx`. **DO NOT DELETE THEM.** Refactor and extend them to support "Packs" and the new filtering logic. Use existing Shadcn components (`components/ui/*`).
    - **API**: Respect existing patterns in `app/api/*`.
3.  **Data Integrity**: When modifying the schema, ensure you run migrations (`npx prisma migrate dev`) and update the seed script (`prisma/seed.ts`) to prevent breaking the build for other developers.
4.  **User-Centricity**: The end goal is "Curated Maintenance". The UI should feel premium and helpful, not just a raw database viewer.

**Immediate Action**:
[INSERT SPECIFIC STEP INSTRUCTIONS HERE]
