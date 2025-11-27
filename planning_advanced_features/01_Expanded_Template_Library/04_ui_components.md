# UI Components: Expanded Template Library

## Overview

New components required to support browsing, viewing, and applying templates.

## 1. Template Marketplace (Page)

**Path**: `/templates` or `/maintenance/library`

**Layout**:

- **Header**: "Maintenance Library" with Search Bar.
- **Filters**: Sidebar or Top Bar (Category, Difficulty, Time).
- **Recommendations Section**: "Recommended for You" carousel.
- **Browse All Section**: Grid of Template Packs.

**Components**:

- `TemplatePackGrid`: Container for cards.
- `TemplatePackCard`:
  - **Props**: `pack: TemplatePack`
  - **Visuals**: Icon/Image, Title, Description, Tag badges.
  - **Actions**: "View Details", "Enable/Disable" (if subscription model).

## 2. Template Pack Detail (Page/Modal)

**Path**: `/templates/packs/:id`

**Layout**:

- **Hero**: Pack Title, Description, "Apply All" button (optional).
- **List**: `TemplateList` showing all templates in the pack.

**Components**:

- `TemplateList`:
  - **Props**: `templates: MaintenanceTemplate[]`
  - **Item**: Row showing Name, Frequency, Duration, Difficulty.
  - **Action**: "Preview" button.

## 3. Template Detail (Modal/Drawer)

**Usage**: When clicking a template from the list.

**Content**:

- **Header**: Title, Category Icon.
- **Metadata**: Frequency, Duration, Difficulty (Visual gauge).
- **Tabs**:
  - **Overview**: Description, Tools Required.
  - **Steps**: Numbered list of steps.
  - **Safety**: Warning alerts.
- **Footer Actions**:
  - "Apply to Asset" (Opens Asset Selector).
  - "Customize" (Opens Clone Form).

## 4. Asset Selector (Component)

**Usage**: When applying a template.

**Logic**:

- Dropdown or Modal listing user's assets.
- **Smart Filter**: Only show assets matching the template's category (e.g., if Template is "HVAC Tune-up", only show HVAC assets).

## 5. Dashboard Recommendation Widget

**Usage**: Main Dashboard.

**Content**:

- "Maintenance Suggestions"
- List of top 3 recommended templates/packs based on logic.
- "Dismiss" action to hide irrelevant suggestions.
