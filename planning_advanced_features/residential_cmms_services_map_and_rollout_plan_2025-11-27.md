# Residential CMMS Services Map and Rollout Plan

This document provides a services oriented architectural map and a phased rollout plan for the Residential CMMS platform. It identifies the core services required to support the features outlined in the Requirements, Technical Supplement, and User Stories documents. It also defines dependency sequencing, shared infrastructure, recommended release waves, and long term extensibility considerations.

The document is descriptive rather than prescriptive and does not contain implementation code.

---

# 1. Core Services Overview

The Residential CMMS platform is best structured around a modular, service oriented architecture. Each service below represents a logical capability boundary. These services may be implemented as independently deployable microservices or as modules within a modular monolith.

Services are grouped into four categories:

- Foundation Services
- Maintenance Intelligence Services
- User Experience and Workflow Services
- Integrations and External Data Services

---

## 1.1 Foundation Services

### 1.1.1 User Identity and Access Service

Responsible for authentication, authorization, role definition, and session management.

**Key responsibilities**:

- Manage users and credentials
- Support multi device login and session persistence
- Enforce access rules for assets, tasks, and reports

**Shared dependencies**:

- Notification Service
- Home Profile Service

---

### 1.1.2 Home Profile Service

Stores and manages household level metadata.

**Key responsibilities**:

- Store address, climate zone, year built
- Persist onboarding wizard responses
- Provide house context to all other services

**Used by**:

- Template Recommendation Service
- Seasonal Automation Service
- Reporting Service

---

### 1.1.3 Asset Management Service

The central repository and API surface for all household assets.

**Key responsibilities**:

- Asset creation, updating, archival
- Store brand, model, serial, install dates, lifecycle metadata
- Store references to templates applied to assets

**Downstream consumers**:

- Task Scheduler
- Replacement Planning
- Visual Home Map
- Predictive Failure Service

---

### 1.1.4 File Storage Service

Handles user uploaded files such as warranty documents, receipts, and appliance nameplate photos.

**Key responsibilities**:

- Store and retrieve files
- Provide temporary URLs to clients
- Manage basic metadata for each stored object

**Used by**:

- Warranty Vault
- OCR Pipeline
- Reporting Service

---

## 1.2 Maintenance Intelligence Services

### 1.2.1 Template Library Service

Stores curated maintenance templates and template packs.

**Key responsibilities**:

- Manage templates, steps, instructions, safety levels
- Manage template pack definitions
- Provide search, filter, and preview capabilities

**Downstream consumers**:

- Task Scheduler
- Template Recommendation Engine
- Onboarding Wizard

---

### 1.2.2 Template Recommendation Engine

Applies rules and optional AI models to recommend templates.

**Key responsibilities**:

- Rank templates based on climate zone, asset age, usage pattern
- Recommend climate or manufacturer specific schedules
- Provide confidence scoring

**Inputs**:

- HomeProfile
- Asset metadata
- Template library metadata

---

### 1.2.3 Task Scheduling Service

Responsible for generating tasks from templates and tracking completion.

**Key responsibilities**:

- Create tasks on schedule
- Handle overdue logic
- Modify schedules when templates are updated

**Consumers**:

- Auto Shopping List
- Home Health Report
- Predictive Failure Service

---

### 1.2.4 Seasonal Automation Service

Evaluates environmental and seasonal rules to suggest or create tasks.

**Key responsibilities**:

- Run periodic checks against weather and climate data
- Evaluate SeasonalRule definitions
- Generate SuggestedTask records

**Inputs**:

- Weather Integration Service
- HomeProfile
- Asset list
- Seasonal rules configuration

---

### 1.2.5 Replacement Planning Service

Calculates remaining useful life and manages replacement plans.

**Key responsibilities**:

- Estimate remaining life based on AssetLifecycleProfile
- Store user specified replacement plans
- Provide aggregated replacement forecasts

**Consumers**:

- Reporting Service
- Predictive Failure Service

---

### 1.2.6 Predictive Failure Service

Uses historical and contextual data to estimate failure probabilities.

**Key responsibilities**:

- Store and update FailureRiskProfiles
- Use rule based or AI based models for risk scoring
- Provide explainability context for risk factors

**Inputs**:

- Task history
- Asset metadata
- Device events (if available)

---

## 1.3 User Experience and Workflow Services

### 1.3.1 Onboarding Wizard Service

Manages onboarding steps, state, and plan generation.

**Key responsibilities**:

- Track wizard state per user
- Validate user responses
- Trigger starter maintenance plan generation

---

### 1.3.2 Visual Home Map Service

Manages room definitions, layout data, and asset placements.

**Key responsibilities**:

- Persist room definitions
- Persist layout JSON
- Store asset placement coordinates

---

### 1.3.3 Troubleshooting Flow Service

Stores and executes decision trees for guided troubleshooting.

**Key responsibilities**:

- Retrieve starting nodes
- Evaluate next steps based on user input
- Provide recommended actions

---

### 1.3.4 Warranty Vault Service

Stores warranty metadata and sends reminders for expirations.

**Key responsibilities**:

- Manage warranty records
- Schedule and send expiration notifications
- Link warranties to assets

---

### 1.3.5 Vendor Rolodex Service

Stores user specific vendor contacts and associations to assets.

**Key responsibilities**:

- Manage vendor profiles
- Link vendors to assets or tasks
- Provide filtering by service types

---

### 1.3.6 Shopping List Service

Generates material lists for upcoming tasks.

**Key responsibilities**:

- Aggregate task materials
- Group by category and quantity
- Provide export options

---

### 1.3.7 Reporting Service

Generates Home Health Reports and other aggregate outputs.

**Key responsibilities**:

- Compile data across assets, tasks, lifecycle data
- Generate PDF or structured output via PDF engine
- Persist or cache report history

---

## 1.4 Integrations and External Data Services

### 1.4.1 OCR Pipeline Service

Processes uploaded images to extract text.

**Key responsibilities**:

- Accept image input
- Call third party OCR provider
- Parse into structured fields
- Store raw and parsed output

---

### 1.4.2 Weather Integration Service

Provides climate and weather context.

**Key responsibilities**:

- Retrieve weather forecasts
- Retrieve climate zone metadata
- Provide weather data for rule evaluation

---

### 1.4.3 Smart Device Integration Service

Manages connections to third party smart home ecosystems.

**Key responsibilities**:

- OAuth or token based authentication
- Device discovery and mapping
- Periodic event sync and normalization

---

# 2. Shared Infrastructure Components

### 2.1 Notification Service

Handles email, push, and in app notifications.

### 2.2 Background Job Runner

Triggers periodic tasks (OCR completion checks, seasonal evaluations, report generation).

### 2.3 Event Log and Audit Trail

Tracks key events for traceability and analytics.

### 2.4 Configuration Service

Stores rule sets, template pack definitions, and thresholds.

### 2.5 Analytics Warehouse (optional, long term)

Consolidates task history, device events, and lifecycle data for predictive models.

---

# 3. Dependency Graph Overview

The platform has a natural dependency progression:

1. Foundation Services must exist first: User Identity, Home Profile, Asset Management, File Storage.
2. Template Library and Task Scheduling rely on Asset Management and Configuration.
3. Seasonal Automation, Replacement Planning, and Template Recommendation depend on Template Library and Home Profile.
4. Smart Home Integration, OCR Pipeline, and Predictive Failure require Asset Management and optionally the analytics warehouse.
5. Visual Home Map, Warranty Vault, Troubleshooting, Vendor Rolodex, and Shopping Lists depend on Asset and Task data.
6. Reporting depends on Task Scheduling, Replacement Planning, Template Library, and Warranty Vault.

---

# 4. Rollout Strategy and Phased Delivery Plan

Delivery follows a sequence that builds a minimal but complete value path before layering advanced features.

## Phase 1: Foundational MVP

**Objective**: Deliver a usable core residential maintenance system.

Included services:

- User Identity and Access
- Home Profile
- Asset Management
- Template Library (basic)
- Task Scheduling
- File Storage
- Notification Service

Included user features:

- Add assets manually
- Apply templates manually
- View and complete tasks

Rationale: Establishes the baseline the rest of the system builds upon.

---

## Phase 2: Onboarding, Usability, and Template Intelligence

**Objective**: Increase adoption and immediate value for new users.

Included services:

- Onboarding Wizard
- Template Recommendation Engine (rules based first)
- Warranty Vault (baseline)
- Shopping List Service (baseline)

Included user features:

- Guided setup
- Smart template suggestions (context based)
- Warranty storage and reminders
- Consumable list generation

Rationale: Reduces friction and begins showcasing intelligence.

---

## Phase 3: Automation and Environmental Awareness

**Objective**: Shift from static maintenance to proactive guidance.

Included services:

- Seasonal Automation Service
- Weather Integration Service
- Replacement Planning
- Troubleshooting Flow Service

Included user features:

- Seasonal alerts and suggestions
- Lifespan and replacement forecasts
- Troubleshooting decision trees

Rationale: Gives the product a proactive dimension with clear ROI.

---

## Phase 4: Visual and Context Rich Interaction

**Objective**: Add the next level of depth and clarity.

Included services:

- Visual Home Map Service
- Vendor Rolodex Service
- Reporting Service
- Improved Warranty Vault

Included user features:

- Room based visual map
- Preferred vendor storage and linking
- Annual Home Health Report

Rationale: Strengthens usability, household organization, and exportable reporting.

---

## Phase 5: Advanced Intelligence and External Integration

**Objective**: Transform from simple CMMS to intelligent household management.

Included services:

- OCR Pipeline
- Smart Device Integration Service
- Predictive Failure Service
- Analytics Warehouse (optional)

Included user features:

- Add assets from photos
- Device event driven tasks and alerts
- Predictive failure warnings
- Long term analytics and summarization

Rationale: Establishes high differentiation and positions the platform for premium tiers.

---

# 5. Long Term Extensibility Notes

### 5.1 Multihome Support

Allow users to manage multiple properties with the same service layer.

### 5.2 Contractor Mode

Add ACL based access for third party contractors to view selected assets and tasks.

### 5.3 Data Partnerships

Integrate with home warranty companies, insurance carriers, and energy utilities.

### 5.4 Marketplace for Community Templates

Allow user generated templates with moderation mechanisms.

### 5.5 Automation Rules Engine

Unify seasonal rules, template recommendations, and predictive failure alerts under a shared rules framework.

---

# 6. Summary

This Services Map and Rollout Plan provides a structured pathway for delivering the Residential CMMS platform in a manageable, cohesive, and strategically staged manner. It distinguishes foundational capabilities from advanced intelligence and lays out how all features relate to one another architecturally.

This document is intended to be used alongside the Requirements, Technical Supplement, and User Stories documents to guide sequencing, estimation, and long term system design.
