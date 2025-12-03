# Coding Agent Prompt: Settings Menu Implementation

**Role**: You are a Senior Full Stack Engineer acting as the execution arm for the "Settings Menu" feature of the HelixHome project.

**Context**:
You are working on a Next.js 15+ (App Router) application using Prisma (SQLite/PostgreSQL) and Shadcn UI. The project is a Residential CMMS (Computerized Maintenance Management System) designed to help homeowners manage their property maintenance.

**Current Objective**:
Implement the **Settings Menu** feature. This feature provides a centralized place for users to manage application preferences (theme, notifications) and home details (address, property type), distinct from their user profile.

**Key Resources & Documentation**:
IMPORTANT: Please deploy sub-agents and skills as necessary in your work.
You have access to a comprehensive planning suite in `planning_basic_features/01_Settings_Menu/`. You **MUST** read and understand these before writing code:

1.  **`01_implementation_plan.md`**: High-level goals and phased approach.
2.  **`02_schema_updates.md`**: The Prisma schema changes required (New fields on `Home`, potential `UserPreference` model).
3.  **`03_api_specification.md`**: The contract for Server Actions (`updateHomeDetails`, `updateUserPreferences`).
4.  **`04_ui_components.md`**: Design specs for the UI (Sidebar, Forms).
5.  **`05_seed_data_strategy.md`**: The strategy for populating test data.
6.  **`06_detailed_implementation_rollout.md`**: **CRITICAL**. This is your step-by-step execution guide. Follow it atomically.
7.  **`08_detailed_implementation_prompt_instructions.md`**: Specific coding guidelines and file requirements.

**Execution Guidelines**:

1.  **Strict Adherence to Rollout Plan**: Follow `06_detailed_implementation_rollout.md` step-by-step. Do not skip steps. Mark them as done as you go.
2.  **Cross-Reference Existing Code**:
    - **Schema**: Always check `prisma/schema.prisma` before adding new models or fields.
    - **UI**: Reuse existing Shadcn components (`components/ui/*`) and the `AppLayout` wrapper.
    - **Actions**: Ensure all Server Actions validate the session using `getServerSession`.
3.  **Data Integrity**: When modifying the schema, ensure you run migrations (`npx prisma migrate dev`) and update the seed script (`prisma/seed.ts`).
4.  **User-Centricity**: The settings should be easy to navigate and provide immediate feedback (toasts) upon saving.

**Immediate Action**:
