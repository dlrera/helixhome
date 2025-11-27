# Residential CMMS Requirements Document

This expanded document provides detailed requirements, use cases, features, dependencies, and UX flows for the prioritized features.

## 1. Expanded Template Library

**Priority**: High
**Difficulty**: Medium
**Dependencies**: Manufacturer data APIs, standardized task taxonomy, optional AI model for classification

**Detailed Description**:
The template library needs to become a core differentiating asset. Users should be able to browse templates by category, recommended schedules, brand, season, and asset type. Templates should contain steps, estimated time, required materials, safety warnings, and cross links to troubleshooting guides.

**Key Features**:

- Curated professional template packs
- Climate based variants (humid regions, cold regions, coastal salt exposure)
- Manufacturer specific schedules when available
- Ability to modify templates and save custom variations
- AI assisted template suggestions based on asset age, usage, and condition
- Support for task bundles (for example, seasonal HVAC tune up tasks grouped together)

**Extended UX Flow**:

1. User selects an asset or room.
2. System shows recommended templates with a confidence score.
3. User previews a template, views steps, materials, safety notes.
4. User adds the template, which schedules out tasks.
5. The engine monitors overdue tasks and adjusts future recommendations.

## 2. Welcome Wizard and Startup Guide

**Priority**: High
**Difficulty**: Low
**Dependencies**: None

**Detailed Description**:
The startup wizard collects essential home profile information and uses it to generate a pre populated schedule. It also introduces key features and allows optional guided setup.

**Key Features**:

- Home profile capture (year built, climate zone, home size, heating type)
- Quick asset intake (HVAC, water heater, roof age, appliances)
- Starter template bundle selection
- Optional guided “First Week Setup” checklist

**Extended UX Flow**:

1. User signs up.
2. Wizard asks five to seven structured questions.
3. System auto generates a starter maintenance plan.
4. User reviews and accepts or edits.
5. User receives an orientation on dashboards, alerts, and scheduling.

## 3. Auto Discovery from Photos

**Priority**: Medium
**Difficulty**: High
**Dependencies**: OCR service, model databases

**Detailed Description**:
Allows users to upload or snap photos of appliance information plates. The system extracts brand, model, serial number, efficiency rating, and date codes.

**Key Features**:

- OCR extraction of tags and nameplates
- Error tolerant text recognition
- Automatic matching to manufacturer database
- Auto assignment of the correct template schedules
- Detection of warranty eligible assets

**Extended UX Flow**:

1. User taps “Add Asset by Photo”.
2. App guides user to photograph the label.
3. OCR processes the image and extracts structured fields.
4. System identifies the asset and loads matching schedules.
5. User confirms the match or corrects details.

## 4. Seasonal Shift Automations

**Priority**: Medium
**Difficulty**: Medium
**Dependencies**: Weather API

**Detailed Description**:
The system automatically detects seasonal changes, local weather events, and environmental risk triggers. It suggests relevant maintenance tasks.

**Key Features**:

- Freeze event alerts
- First frost and last frost date triggers
- Storm preparation checklists
- High pollen season filter reminders

**Extended UX Flow**:

1. Weather API provides local data.
2. Rules engine checks for conditions.
3. If a threshold is met, the app suggests or auto schedules tasks.
4. User can accept, delay, or dismiss.

## 5. Replacement Planning

**Priority**: Medium
**Difficulty**: Low
**Dependencies**: Asset lifespan datasets

**Detailed Description**:
This module helps users budget for upcoming replacements and understand long term maintenance implications.

**Key Features**:

- Typical lifespan estimates by brand and model
- Replacement cost ranges
- Optional cost smoothing suggestions
- Savings goal tracker
- Depreciation visualization

**Extended UX Flow**:

1. User views an asset profile.
2. Asset detail page shows remaining useful life.
3. User sets a replacement goal with a target year.
4. System reminds user as replacement approaches.

## 6. Warranty Vault

**Priority**: High
**Difficulty**: Low
**Dependencies**: None

**Detailed Description**:
Collects, stores, and tracks warranties. Enables claim readiness by having receipts, serial numbers, and documentation stored with assets.

**Key Features**:

- Document upload and storage
- Automatic expiration countdown
- Warranty claim checklist
- Receipt and purchase date tracking

**Extended UX Flow**:

1. User adds warranty docs when adding an asset.
2. System extracts expiration dates if visible.
3. Alerts appear ninety, thirty, and seven days before expiration.

## 7. Visual Home Map

**Priority**: Low
**Difficulty**: High
**Dependencies**: Room layout tool

**Detailed Description**:
Provides a spatial view of assets. Users can map rooms and attach assets to physical locations.

**Key Features**:

- Room creation and editing
- Drag and drop asset placement
- Visual indicators of overdue tasks
- Floor by floor navigation

**Extended UX Flow**:

1. User draws or selects a prebuilt layout.
2. User adds rooms and places assets.
3. Task indicators appear on the visual map.

## 8. Troubleshooting Decision Trees

**Priority**: Medium
**Difficulty**: Medium
**Dependencies**: Internal knowledge base

**Detailed Description**:
Interactive guides that walk users through diagnosing common household problems.

**Key Features**:

- Branching yes or no questions
- Quick fix suggestions
- Safety warnings
- Tag to create a work order if unresolved

**Extended UX Flow**:

1. User selects an issue category.
2. System guides user through decision points.
3. Suggested remedy or task produced.

## 9. Preferred Vendor Rolodex

**Priority**: Low
**Difficulty**: Low
**Dependencies**: None

**Detailed Description**:
Users store contractors and service providers, attach them to assets, and reference them when creating work orders.

**Key Features**:

- Vendor categories
- Reviews and notes
- Link to past tasks

**Extended UX Flow**:

1. User adds vendor contact.
2. Vendor becomes selectable on any asset or work order.

## 10. Auto Shopping List

**Priority**: Low
**Difficulty**: Medium
**Dependencies**: Retail APIs (optional)

**Detailed Description**:
Auto builds lists of consumables needed in the coming maintenance window.

**Key Features**:

- Inventory tracking
- Suggestions for filters, batteries, bulbs
- Export to email or store integrations

**Extended UX Flow**:

1. System reviews future tasks.
2. Required materials aggregated.
3. User receives a list with quantities.

## 11. Annual Home Health Report

**Priority**: Medium
**Difficulty**: Medium
**Dependencies**: PDF engine

**Detailed Description**:
A detailed report summarizing home health, deferred maintenance, completed tasks, and risk areas.

**Key Features**:

- Summary dashboard
- Risk scoring
- Recommendations
- Exportable PDF

**Extended UX Flow**:

1. User taps “Generate Report”.
2. System compiles data and creates PDF.
3. User downloads or sends report.

## 12. Smart Home Integrations

**Priority**: Medium
**Difficulty**: High
**Dependencies**: Smart home APIs

**Detailed Description**:
Imports data from smart thermostats, detectors, and appliances.

**Key Features**:

- Runtime data import
- Fault code ingestion
- Filter status
- Event triggered tasks

**Extended UX Flow**:

1. User links account.
2. System syncs data daily.
3. Alerts surface when anomalies detected.

## 13. Predictive Failure Estimates

**Priority**: Low
**Difficulty**: High
**Dependencies**: Machine learning models, training data

**Detailed Description**:
Uses historical tasks, usage patterns, runtime, and asset age to estimate probability of failure.

**Key Features**:

- Probability curves
- Early warning notifications
- Recommendations to schedule preventive tasks

**Extended UX Flow**:

1. System analyzes data weekly.
2. User receives predictive warnings.
3. User can schedule tasks directly from warning.
