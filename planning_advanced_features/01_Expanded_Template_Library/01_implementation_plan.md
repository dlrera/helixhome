# Implementation Plan: Expanded Template Library

## Overview

The **Expanded Template Library** is a core differentiator for the Residential CMMS. It moves the system from a basic "add task" model to a "curated maintenance" model. Users will be able to browse professional template packs, receive recommendations based on their home profile, and customize templates to their needs.

## Goals

1.  **Structure**: Introduce `TemplatePack` to group related templates (e.g., "Seasonal Maintenance", "Safety Checks").
2.  **Discovery**: Enable users to browse and filter templates by category, difficulty, and tags.
3.  **Intelligence**: Implement a recommendation engine (initially rule-based) to suggest templates based on Home Profile (Climate, Age) and Asset Metadata.
4.  **Customization**: Allow users to "clone" system templates into custom versions.

## Phased Implementation

### Phase 1: Data Model & Schema

- Create `TemplatePack` entity.
- Update `MaintenanceTemplate` to support packs, tags, and better frequency definitions.
- Update `Asset` to support richer metadata for recommendations (though `HomeProfile` is the primary driver).

### Phase 2: Seed Data & Admin Tools

- Create a seeding script to populate the database with initial "Professional Packs".
- (Optional) Simple Admin UI to manage system templates without direct DB access.

### Phase 3: API Layer

- `GET /api/templates/packs`: List available packs.
- `GET /api/templates/browse`: Search/Filter templates.
- `GET /api/templates/recommendations`: Logic-heavy endpoint returning ranked templates.
- `POST /api/templates/:id/apply`: Apply a template to an asset (generating tasks).
- `POST /api/templates/:id/clone`: Create a user-custom copy.

### Phase 4: User Interface

- **Template Marketplace/Library Page**: Browse packs and templates.
- **Template Detail Modal**: View steps, tools, safety info before applying.
- **Recommendation Widget**: "Recommended for your 1980s Home" on the dashboard.

## Dependencies

- **Prisma Schema**: Needs migration.
- **Home Profile**: Needs to exist (even if basic) to drive recommendations.
- **Asset Management**: Existing asset system must be stable.

## Risks & Mitigations

- **Complexity of Recommendations**: Start with simple rules (e.g., "If HVAC exists, show HVAC pack"). Don't over-engineer the AI part yet.
- **Data Volume**: If we have hundreds of templates, we need pagination. Start with ~20 high-quality templates.
