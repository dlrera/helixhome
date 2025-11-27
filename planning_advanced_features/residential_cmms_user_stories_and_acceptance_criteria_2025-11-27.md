# Residential CMMS User Stories and Acceptance Criteria

This document defines user stories and acceptance criteria for the prioritized Residential CMMS features. Stories are written from the perspective of end users (homeowners and advanced users), with system level behaviors referencing the conceptual APIs and entities defined in the Technical Supplement.

Each section maps to the corresponding feature number in the Requirements and Technical Supplement documents.

---

## 1. Expanded Template Library

### Epic 1.1: Discover and Apply Maintenance Templates

**User Story 1.1.1**  
As a homeowner, I want to see recommended maintenance templates for each asset so that I can quickly set up an appropriate maintenance schedule without deep technical knowledge.

**Acceptance Criteria**

- Given I am viewing an asset detail page, when I open the "Recommended Templates" panel, then I see a list of templates filtered by that asset’s type.
- Each recommended template displays name, short description, estimated duration, and frequency.
- If no templates match the asset type, the system shows a clear message and suggests browsing all templates instead of showing an empty panel.
- When I click on a template, I can see the full template details including steps, materials, and safety notes.
- When I click "Apply Template", the system creates future tasks based on the defined frequency and links them to the asset.

**User Story 1.1.2**  
As a homeowner, I want template recommendations that consider my home’s climate and asset age so that the schedule feels tailored and not generic.

**Acceptance Criteria**

- Given my HomeProfile contains climate_zone and year_built, when I view recommended templates, then the system uses this context to rank or filter templates.
- Templates that are climate specific are labeled with applicable climate zones.
- If climate_zone is missing, the system falls back to generic templates and prompts me to complete my profile.
- When an asset has age information, templates with age specific variations (for example heavy use or older equipment) are preferred and indicated.

### Epic 1.2: Manage Template Packs

**User Story 1.2.1**  
As a homeowner, I want to enable or disable template packs (for example Old Home Pack, High Efficiency HVAC Pack) so that I can control which types of maintenance suggestions I receive.

**Acceptance Criteria**

- Given I open the Template Packs settings, I see a list of available packs with a short description and tags.
- I can toggle each pack on or off for my home.
- When a pack is enabled, templates from that pack become eligible for recommendations and are included in template search results.
- When a pack is disabled, its templates do not appear in recommendations, but existing tasks created from those templates are not deleted.

### Epic 1.3: Customize Templates

**User Story 1.3.1**  
As an advanced user, I want to customize system templates and save them as my own variations so that I can adapt schedules and steps to my personal preferences.

**Acceptance Criteria**

- When viewing a system template, I can choose "Customize" to create a user specific copy.
- The customized template allows editing of frequency, steps, and materials within defined bounds (for example allowed frequency values).
- The original system template remains unchanged and is still available for reference.
- The customized template is clearly labeled as "My Template" and lists the source system template for traceability.
- When I apply a customized template, tasks are generated based on the customized values.

---

## 2. Welcome Wizard and Startup Guide

### Epic 2.1: Guided Home Setup

**User Story 2.1.1**  
As a new user, I want a simple onboarding wizard that asks key questions about my home so that the system can generate a starter maintenance plan for me.

**Acceptance Criteria**

- After creating an account, I am prompted to start the onboarding wizard, with an option to skip and return later.
- The wizard is limited to a small number of steps (for example 5 to 7), each with clear questions such as home age, climate, heating type, and key appliances.
- I can navigate back and forth between steps without losing my previous answers.
- When I finish the wizard, I see a summary of my HomeProfile data and the number of tasks created for my starter plan.
- If I skip the wizard, a persistent but non intrusive reminder exists in the dashboard to complete onboarding.

**User Story 2.1.2**  
As a returning user, I want to re open and update the onboarding wizard when my home changes (for example after a renovation) so that my plan stays accurate.

**Acceptance Criteria**

- From account or home settings, I can launch the "Home Setup Wizard" at any time.
- If I re run the wizard, existing data is pre filled and editable.
- When I save changes, the system updates my HomeProfile and may propose adjustments to my maintenance plan (for example offering to add or retire certain templates), with clear confirmation screens.

---

## 3. Auto Discovery from Photos

### Epic 3.1: Create Assets from Nameplate Photos

**User Story 3.1.1**  
As a homeowner, I want to add a new asset by taking a picture of its information label so that I do not have to manually type complex model and serial numbers.

**Acceptance Criteria**

- On the "Add Asset" screen, there is an option "Add via Photo".
- When I upload or capture a photo, the system shows a progress indicator while OCR runs.
- If OCR succeeds, fields such as brand, model, and serial number are pre filled.
- If OCR fails or is incomplete, I am prompted to correct or fill remaining fields manually, with the photo still visible for reference.
- The system clearly indicates when values are derived from OCR to help me verify accuracy.

**User Story 3.1.2**  
As a homeowner, I want the system to suggest asset type and templates based on the nameplate photo so that setup is faster.

**Acceptance Criteria**

- After OCR, the system proposes one or more asset type candidates (for example "Gas Furnace", "Heat Pump") with confidence indicators.
- I can choose the correct asset type or override with another type from a list.
- For the chosen asset type, recommended templates appear in the same flow, with the option to apply them immediately.
- If confidence is low for asset classification, the system asks me to confirm type and brand before suggesting templates.

---

## 4. Seasonal Shift Automations

### Epic 4.1: Weather and Season Driven Task Suggestions

**User Story 4.1.1**  
As a homeowner, I want the system to suggest seasonal tasks (for example winterization, spring startup) based on local weather patterns so that I do not have to remember them.

**Acceptance Criteria**

- If I have enabled seasonal automation in settings, the system periodically checks weather or season data for my location.
- When a seasonal rule is triggered (for example first expected freeze), I receive a notification and see suggested tasks (for example "Drain outdoor faucets").
- Suggested tasks are clearly distinguished from my existing scheduled tasks and allow me to accept, postpone, or decline them.
- Declining a suggested task gives me the option to mute similar suggestions for the current season.

**User Story 4.1.2**  
As a homeowner, I want seasonal automation to respect my preferences so that I do not receive irrelevant or excessive alerts.

**Acceptance Criteria**

- I can enable or disable specific seasonal rule categories, such as freeze protection, storm preparation, or pollen driven filter changes.
- I can choose notification channels for seasonal alerts (for example in app only vs email).
- The system does not create tasks automatically unless I have explicitly opted in to automatic creation; otherwise suggestions remain pending until I confirm.

---

## 5. Replacement Planning

### Epic 5.1: Plan for Future Asset Replacement

**User Story 5.1.1**  
As a homeowner, I want to see how much useful life my major assets have left so that I can plan financially for replacements.

**Acceptance Criteria**

- On each asset detail page, I can view an estimated remaining life indicator based on install_date and expected_lifespan_years.
- If install_date is unknown, the system clearly explains that estimates are approximate and allows me to enter or adjust the date.
- The system indicates the basis for the lifespan estimate (for example typical lifespan for that asset type or brand).

**User Story 5.1.2**  
As a homeowner, I want to create a replacement plan for big ticket items so that I can budget over several years.

**Acceptance Criteria**

- For each asset, I can create or edit a ReplacementPlan with a target year and cost estimate range.
- The system shows a consolidated list of upcoming replacements over the next N years, with total estimated costs per year.
- I receive reminders in advance of the target replacement year with the option to update or defer the plan.

---

## 6. Warranty Vault

### Epic 6.1: Track and Use Warranties

**User Story 6.1.1**  
As a homeowner, I want to store warranty information and documents with each asset so that I can quickly access them if something fails.

**Acceptance Criteria**

- On asset creation or edit, I can add a warranty record including provider, purchase date, expiration date, and upload documents.
- I can view all warranties for a home in a consolidated "Warranty Vault" screen filtered by status (active, expiring, expired).
- Uploaded documents are downloadable and tied directly to the asset.

**User Story 6.1.2**  
As a homeowner, I want to receive reminders before my warranties expire so that I can take action if needed.

**Acceptance Criteria**

- When a warranty has an expiration_date, the system automatically schedules reminders at configurable intervals (for example 90 days, 30 days, 7 days before expiration).
- Reminders include the asset name, warranty provider, and key terms (if available), plus a direct link to view the warranty record.
- If I mark a warranty as "no longer relevant" or manually close it, reminders stop.

---

## 7. Visual Home Map

### Epic 7.1: Visualize Assets by Room

**User Story 7.1.1**  
As a homeowner, I want a simple visual map of my home with rooms and assets so that I can quickly see where items are located and where work is needed.

**Acceptance Criteria**

- I can define rooms for my home with basic properties (name, floor).
- For each room, I can place assets on a simple layout canvas (for example top down representation) or select their location from preset positions.
- On the visual map, assets with overdue tasks are visually indicated (for example badge or color) and can be clicked to view details.
- If I move an asset to a different room, the map and any room based filters update accordingly.

---

## 8. Troubleshooting Decision Trees

### Epic 8.1: Guided Troubleshooting

**User Story 8.1.1**  
As a homeowner, I want guided troubleshooting for common issues (for example "furnace not heating") so that I can attempt safe fixes before calling a professional.

**Acceptance Criteria**

- From an asset or an "Issues" menu, I can select a troubleshooting topic.
- The system presents one question or instruction at a time with clear choices (for example yes or no, resolved or not resolved).
- At any step, I can back up to the previous question.
- If the flow ends in an "outcome" that recommends professional service, I can create a work order or view my preferred vendors directly from the outcome screen.
- Flows include safety warnings where relevant and suggest stopping if dangerous conditions are suspected.

---

## 9. Preferred Vendor Rolodex

### Epic 9.1: Manage Contractors and Vendors

**User Story 9.1.1**  
As a homeowner, I want to store my preferred contractors in one place so that I can quickly contact them when I need work done.

**Acceptance Criteria**

- I can add vendors with name, company, services, and contact information.
- I can filter vendors by service type (for example HVAC, plumbing).
- From an asset or task, I can select a vendor to associate with the job and view their contact details.

---

## 10. Auto Shopping List

### Epic 10.1: Generate Maintenance Shopping Lists

**User Story 10.1.1**  
As a homeowner, I want the system to generate a list of supplies needed for upcoming maintenance so that I can buy everything in one trip.

**Acceptance Criteria**

- When I choose to generate a shopping list for a date range, the system reviews all scheduled tasks in that period.
- The generated list groups items by material type and shows required quantities across all tasks.
- For each list item, I can see which tasks require it.
- I can export or share the shopping list as text, email, or printable format.

---

## 11. Annual Home Health Report

### Epic 11.1: Summarize Home Maintenance for a Period

**User Story 11.1.1**  
As a homeowner, I want an annual home health report so that I can understand my home’s maintenance status and share it with insurers or buyers if needed.

**Acceptance Criteria**

- I can request a report for a specific year.
- The report includes key metrics: number of tasks completed, overdue tasks, major asset replacements, and outstanding high priority items.
- The report provides a clear summary section and more detailed sections by asset category or room.
- I can download the report as a PDF file.

---

## 12. Smart Home Integrations

### Epic 12.1: Use Smart Devices for Maintenance Context

**User Story 12.1.1**  
As a homeowner with smart thermostats or detectors, I want the system to use their data to inform maintenance so that my plan reflects real usage.

**Acceptance Criteria**

- I can link a smart home provider account from settings using a secure connection flow.
- Linked devices are shown in a list, and I can map each device to an asset or create a new asset.
- When runtime or fault data is available, the asset detail page displays recent key events (for example fault codes, filter reminders).
- When certain device events occur (for example frequent short cycling, repeated faults), the system can suggest or create maintenance tasks depending on my preferences.

---

## 13. Predictive Failure Estimates

### Epic 13.1: Proactive Risk Alerts

**User Story 13.1.1**  
As a homeowner, I want to see which assets are at higher risk of failure so that I can prioritize maintenance and replacement.

**Acceptance Criteria**

- For each major asset, a risk indicator is displayed (for example low, medium, high) with a last updated date.
- When I click the risk indicator, I can see a simple explanation of the main factors contributing to the risk (for example age, missed tasks, fault history).
- If an asset’s risk status rises above a threshold, I receive a notification suggesting one or more preventive actions.
- I can adjust my sensitivity to risk notifications (for example only notify me for high risk items).

---

This document is intended to be used alongside the Technical Supplement and Requirements documents. Each story and acceptance criterion can be mapped directly to the underlying entities and API surfaces defined there for estimation and implementation planning.
