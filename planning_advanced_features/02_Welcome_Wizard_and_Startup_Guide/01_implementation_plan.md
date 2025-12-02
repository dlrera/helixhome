# Implementation Plan: Welcome Wizard and Startup Guide

## Overview

The **Welcome Wizard and Startup Guide** is a critical onboarding feature designed to reduce friction for new users. Instead of dropping them into an empty dashboard, this wizard collects essential home data and automatically generates a tailored maintenance schedule, providing immediate value.

## Goals

1.  **Data Collection**: Capture key home profile data (Year Built, Climate Zone, Size, HVAC Type) to drive recommendations.
2.  **Automation**: Automatically generate a "Starter Maintenance Plan" based on the collected data.
3.  **Engagement**: Guide users through their first key actions (e.g., adding their first asset).
4.  **Education**: Briefly orient users on how to use the dashboard and handle tasks.

## Phased Implementation

### Phase 1: Data Model & Schema

- Create `HomeProfile` model (if not fully established in Feature 01) to store structural data.
- Create `OnboardingState` model to track wizard progress and prevent drop-off data loss.
- Update `User` model to link to these profiles.

### Phase 2: API Layer

- `POST /api/onboarding/start`: Initialize session.
- `POST /api/onboarding/step`: Save data for a specific step.
- `POST /api/onboarding/complete`: Finalize setup, generate tasks, and mark user as onboarded.
- `GET /api/onboarding/status`: Resume where left off.

### Phase 3: UI Components

- **Wizard Container**: Multi-step layout with progress bar and "Save & Exit" functionality.
- **Step Components**:
  - `Step1_HomeDetails`: Address, Year Built, Size.
  - `Step2_Climate`: Climate Zone (auto-detect or manual).
  - `Step3_Systems`: Heating/Cooling types.
  - `Step4_Review`: Summary and "Generate Plan" action.
- **Empty State Handling**: Dashboard prompts to start wizard if incomplete.

### Phase 4: Logic & Automation

- **Plan Generator**: Service that selects `TemplatePacks` (from Feature 01) based on Wizard answers.
- **Task Creation**: Background job to instantiate `RecurringSchedules` and initial `Tasks`.

## Dependencies

- **Feature 01 (Expanded Template Library)**: The wizard relies on `TemplatePacks` to generate the starter plan.
- **Auth System**: Must be authenticated to start.

## Risks & Mitigations

- **User Drop-off**: Keep the wizard short (max 5 steps). Allow skipping and resuming.
- **Data Accuracy**: Use sensible defaults if users don't know answers (e.g., "I don't know" for HVAC type).
