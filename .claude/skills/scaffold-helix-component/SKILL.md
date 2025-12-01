---
name: scaffold-helix-component
description: Creates React UI components following HelixIntel design system with brand colors, Inter font, and shadcn/ui patterns
---

# Scaffold HelixIntel Component

## Description
Creates a new React UI component that adheres strictly to the HelixIntel design system. It ensures the use of the Inter font, brand color variables (e.g., `bg-primary` for #216093), and proper `shadcn/ui` structure (using `cn()` for class merging).

## Usage
Run this skill whenever you need to create a new reusable UI element, widget, or feature component.

## Steps
1.  **Input:** Ask the user for the component name (e.g., `StatusBadge`) and the desired directory (default to `components/ui` for primitives or `components/features` for complex items).
2.  **Template:** Read the `template.tsx` file from this skill's directory.
3.  **Replacement:** Replace `{{ComponentName}}` with the provided name.
4.  **File Creation:** Create the new file at the specified path.
5.  **Verification:** 
    *   Verify that `import { cn } from "@/lib/utils"` is present.
    *   Verify that no hardcoded hex codes are used (use CSS variables).
6.  **Export:** If a `components/index.ts` or similar barrel file exists in that directory, export the new component.
