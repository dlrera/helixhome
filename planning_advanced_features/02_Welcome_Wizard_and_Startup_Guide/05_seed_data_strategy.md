# Seed Data Strategy: Welcome Wizard and Startup Guide

## Overview

The Welcome Wizard primarily _collects_ user data rather than consuming static seed data. However, it relies heavily on the **Template Packs** seeded in Feature 01 to generate the "Starter Plan".

## Dependencies

- **Template Packs**: The wizard logic needs to know which packs exist to recommend them.
- **Asset Categories**: The wizard's "Systems" step (Heating, Cooling) maps to `AssetCategory`.

## Seed Requirements

1.  **Ensure Feature 01 Seeds are Present**: The `TemplatePack` seeds ("Seasonal Essentials", "Safety First") must be loaded.
2.  **Default Rules (Optional)**: If we implement a rule engine for recommendations, we might seed `RecommendationRule` records, but for now, we will hardcode the logic in the API service (e.g., "If Year < 1980, apply Old Home Pack").

## No New Seed Data Needed

For this specific feature, we do not need to create new seed files. We rely on the existing infrastructure.
