# Residential CMMS Technical Supplement

This document supplements the primary requirements document with dependencies, conceptual API schemas, and architectural notes for each feature. It is intended for product and engineering planning. It is descriptive and avoids specific implementation code.

---

## 1. Expanded Template Library

### 1.1 Dependencies

- Internal asset taxonomy and category hierarchy
- Shared "Task Template" and "Task" domain models
- Optional manufacturer data integrations (for example brand and model level maintenance schedules)
- Optional AI or rules engine for template recommendations

### 1.2 Data Model and Domain Concepts

- **TemplatePack**
  - id, name, description
  - tags (for example "Old Home", "High Efficiency HVAC")
  - applicable_climate_zones
  - default_enabled (boolean)

- **MaintenanceTemplate**
  - id, name, description
  - asset_type_id (link to AssetType)
  - frequency_type (time based, usage based, seasonal)
  - frequency_value (for example every 90 days)
  - estimated_duration_minutes
  - materials_required (list of MaterialRef)
  - safety_level (info, caution, warning)
  - steps (ordered list of step objects)
  - manufacturer_id and model_reference (optional)
  - is_system_template (boolean) vs user_created_by

- **TemplateRecommendationContext**
  - asset_id
  - climate_zone
  - age_in_years
  - usage_profile (light, normal, heavy)
  - past_completion_pattern

### 1.3 Conceptual API Surfaces

- Template pack management
  - List template packs for a given user
  - Enable or disable a template pack for a home

- Template search and recommendation
  - Fetch templates for a given asset_type and context
  - Get recommended templates for a specific asset instance
  - Clone a system template into a user custom template

- Template application
  - Apply template to an asset which generates scheduled tasks
  - Preview generated schedule without committing

Payloads should use resource identifiers and simple JSON friendly scalar types. Use enums for frequency_type, safety_level, and usage_profile.

### 1.4 Architectural Notes

- The template library should be treated as a core shared service, not bound to a single front end.
- Recommendation logic should be encapsulated in a dedicated component or service that can be improved over time without altering consumers.
- Store system templates as immutable records and allow user overrides as separate objects linked back to the original template for analytics.
- Consider feature flags for AI based recommendations vs simple rules so the platform can degrade gracefully.

---

## 2. Welcome Wizard and Startup Guide

### 2.1 Dependencies

- User account and profile service
- Home profile entity (may be one to one or one to many with user)
- Asset creation APIs
- Template library service

### 2.2 Data Model and Domain Concepts

- **HomeProfile**
  - id, user_id
  - address, postal_code, country
  - climate_zone
  - year_built
  - square_footage
  - heating_type, cooling_type
  - ownership_status (owner, landlord, property manager)

- **OnboardingState**
  - user_id
  - current_step
  - completed_steps
  - suggested_template_pack_ids

### 2.3 Conceptual API Surfaces

- Onboarding
  - Start onboarding for a user and create a HomeProfile shell
  - Save onboarding answers for each step
  - Generate initial maintenance plan from answers

- Wizard control
  - Get onboarding progress for a user
  - Mark onboarding as complete, with ability to reopen

### 2.4 Architectural Notes

- The wizard should be stateless on the client side beyond local UI, with all state tracked server side to allow resumption from any device.
- Ensure the onboarding pipeline can be recalculated if the user edits key attributes later, while preserving past tasks.
- Keep question definitions in configuration, not in compiled code, so content can evolve without deployment.

---

## 3. Auto Discovery from Photos

### 3.1 Dependencies

- File storage service for images
- OCR provider (hosted or third party)
- Asset recognition logic or lookup service
- Asset entity and template library

### 3.2 Data Model and Domain Concepts

- **AssetImage**
  - id, asset_id (optional during initial upload)
  - file_url or storage_key
  - type (nameplate, context photo)
  - ocr_status, ocr_result_payload

- **OcrResult**
  - raw_text
  - parsed_fields: brand, model, serial, voltage, amperage, manufacturing_date

- **AssetMatchCandidate**
  - asset_type_id
  - manufacturer_id
  - confidence_score

### 3.3 Conceptual API Surfaces

- Image upload and OCR pipeline
  - Upload asset image and assign to user and optional asset
  - Trigger OCR processing and return an asynchronous job id
  - Retrieve OCR results and candidate matches

- Asset creation from OCR
  - Create new Asset from parsed fields
  - Attach recommended templates for matched asset type

### 3.4 Architectural Notes

- Use an asynchronous workflow for OCR to avoid blocking the UI; expose polling or webhooks.
- Keep raw OCR text for future reprocessing as recognition improves.
- Design the matching logic as a pluggable component that can include fuzzy brand and model matching.

---

## 4. Seasonal Shift Automations

### 4.1 Dependencies

- Weather API integration
- Rules engine or scheduled job service
- Task scheduling APIs

### 4.2 Data Model and Domain Concepts

- **SeasonalRule**
  - id, name, description
  - trigger_type (date, temperature, precipitation, pollen_index)
  - trigger_threshold
  - applicable_climate_zones
  - actions (for example create tasks, send reminders)

- **UserSeasonalPreferences**
  - user_id
  - enabled_rules
  - notification_channel_preferences

### 4.3 Conceptual API Surfaces

- Seasonal rules
  - List active rules for a region
  - Enable or disable rules per home

- Weather driven automation
  - Scheduled job calls an internal endpoint to evaluate rules for all homes based on current data
  - Endpoint returns actions like "create task", "send notification"

### 4.4 Architectural Notes

- Run seasonal evaluations on a scheduled cadence, for example daily or hourly, rather than per request.
- Keep rules data driven and configurable by non engineers where possible.
- Distinguish between one time event triggers and recurring seasonal triggers to avoid duplicate task creation.

---

## 5. Replacement Planning

### 5.1 Dependencies

- Asset entity and lifecycle metadata
- Optional external lifespan datasets
- Notification service

### 5.2 Data Model and Domain Concepts

- **AssetLifecycleProfile**
  - asset_id
  - expected_lifespan_years
  - install_date
  - remaining_life_years (calculated)

- **ReplacementPlan**
  - id, asset_id
  - target_replacement_year
  - estimated_cost_range
  - savings_goal_amount

### 5.3 Conceptual API Surfaces

- Lifecycle profiles
  - Get lifecycle profile for asset
  - Update assumed lifespan based on user override

- Replacement plans
  - Create or update replacement plan for an asset
  - List all upcoming replacement plans for a home

### 5.4 Architectural Notes

- Calculations can be done on the fly or precomputed and cached for dashboards.
- Consider a centralized configuration service that maps asset types to default lifespan ranges and cost ranges.

---

## 6. Warranty Vault

### 6.1 Dependencies

- File storage service
- Notification service
- Asset entity

### 6.2 Data Model and Domain Concepts

- **WarrantyRecord**
  - id, asset_id
  - provider_name
  - coverage_description
  - purchase_date
  - expiration_date
  - policy_number
  - document_url

### 6.3 Conceptual API Surfaces

- Warranty management
  - Create, update, and delete warranty records
  - Link warranty to one or more assets
  - Retrieve expiring warranties for a time window

### 6.4 Architectural Notes

- Implement background jobs that scan for upcoming expirations and send notifications.
- Provide one to many relationships between warranties and assets to support bundle coverage.

---

## 7. Visual Home Map

### 7.1 Dependencies

- Layout and diagram rendering in the client
- Asset and room entities

### 7.2 Data Model and Domain Concepts

- **Room**
  - id, home_id
  - name, floor_number
  - dimensions (optional)

- **RoomLayout**
  - room_id
  - layout_data (serialized schema for shapes and positions)

- **AssetPlacement**
  - asset_id
  - room_id
  - x_position, y_position

### 7.3 Conceptual API Surfaces

- Room and layout management
  - Create and edit rooms for a home
  - Save and load layout data for a room

- Asset placement
  - Place or move asset in a room
  - Read back all assets with coordinates to render indicators

### 7.4 Architectural Notes

- Layout data can be stored as a lightweight JSON structure rather than a complex CAD format.
- Keep rendering logic primarily on the client to avoid heavy server processing.

---

## 8. Troubleshooting Decision Trees

### 8.1 Dependencies

- Knowledge base content store
- Optional rules or decision engine

### 8.2 Data Model and Domain Concepts

- **TroubleshootingFlow**
  - id, name, related_asset_type
  - starting_node_id

- **TroubleshootingNode**
  - id, flow_id
  - prompt_text
  - node_type (question, action, outcome)

- **NodeTransition**
  - from_node_id
  - user_response_value
  - to_node_id

### 8.3 Conceptual API Surfaces

- Flow delivery
  - Fetch starting node for a given flow
  - Given a node and user response, return the next node

- Content management
  - Administrative endpoints to create and edit flows and nodes

### 8.4 Architectural Notes

- Represent flows in a graph friendly way to simplify maintenance.
- Optionally store flows as structured JSON with validation.

---

## 9. Preferred Vendor Rolodex

### 9.1 Dependencies

- User profile service
- Asset and task entities

### 9.2 Data Model and Domain Concepts

- **VendorContact**
  - id, user_id
  - name, company_name
  - services_offered (for example HVAC, plumbing)
  - phone, email, website
  - rating or notes

- **VendorAssociation**
  - vendor_id
  - asset_id or home_id

### 9.3 Conceptual API Surfaces

- Vendor management
  - Create, update, delete vendor contacts
  - List vendors filtered by service type

- Associations
  - Link vendor to asset or home
  - Retrieve vendors associated with given asset

### 9.4 Architectural Notes

- Keep vendor data private per user unless multi property management is introduced later.

---

## 10. Auto Shopping List

### 10.1 Dependencies

- Task and template system with material requirements
- Optional commerce integrations

### 10.2 Data Model and Domain Concepts

- **MaterialRef**
  - id, name, category
  - unit_of_measure
  - sku_reference (optional)

- **ShoppingList**
  - id, user_id, home_id
  - period_start, period_end
  - items (list of ShoppingListItem)

- **ShoppingListItem**
  - material_ref_id
  - quantity_needed
  - linked_task_ids

### 10.3 Conceptual API Surfaces

- List generation
  - Generate a shopping list for a given date range
  - Regenerate list if tasks change

- Export
  - Export shopping list in structured or human readable formats

### 10.4 Architectural Notes

- The list generation logic should pull from upcoming tasks taking into account already completed tasks and user inventory overrides.
- Commerce integrations, if added, should be adapter based so that providers can be swapped.

---

## 11. Annual Home Health Report

### 11.1 Dependencies

- Reporting and aggregation layer over assets, tasks, warranties, and replacement plans
- PDF rendering service

### 11.2 Data Model and Domain Concepts

- **HomeHealthSnapshot**
  - home_id
  - period_start, period_end
  - metrics (task completion rates, overdue counts, risk score)

- **HomeHealthReport**
  - id, home_id, snapshot_reference
  - storage_url

### 11.3 Conceptual API Surfaces

- Snapshot generation
  - Create a snapshot for a given home and time window

- Report generation
  - Generate a report and return a download link

### 11.4 Architectural Notes

- Separate the concepts of snapshot generation and PDF rendering to allow reuse of metrics in other channels.
- Consider precomputing yearly snapshots to reduce on demand load.

---

## 12. Smart Home Integrations

### 12.1 Dependencies

- OAuth or token based authentication with third party providers
- Background sync jobs
- Asset and event entities

### 12.2 Data Model and Domain Concepts

- **IntegrationAccount**
  - user_id
  - provider_name
  - access_token_metadata

- **DeviceMapping**
  - provider_device_id
  - asset_id or new asset creation rule

- **DeviceEvent**
  - provider_device_id
  - event_type (fault, runtime_update, status_change)
  - payload

### 12.3 Conceptual API Surfaces

- Integration management
  - Start and complete OAuth flow
  - List linked devices

- Sync
  - Scheduled job pulls data from provider and posts to internal device event endpoint

### 12.4 Architectural Notes

- Use provider specific adapters that translate external schemas into internal normalized events.
- Store raw event payloads to support future analytics.

---

## 13. Predictive Failure Estimates

### 13.1 Dependencies

- Historical task and event data
- Asset lifecycle data
- Analytics and machine learning platform

### 13.2 Data Model and Domain Concepts

- **FailureRiskProfile**
  - asset_id
  - risk_score (0 to 1 or 0 to 100)
  - confidence_level
  - last_evaluated_at
  - factors (structured explanation data)

### 13.3 Conceptual API Surfaces

- Risk evaluation
  - Trigger recalculation of risk scores for a given asset or home
  - Retrieve risk scores and explanatory factors

### 13.4 Architectural Notes

- Separate the model training process from the inference process to keep runtime evaluation predictable.
- Provide a minimal rule based fallback if model inference is unavailable.
- Design the profile to support explainability so that the user sees reasons behind a high risk score.
