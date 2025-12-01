---
name: create-server-action
description: Scaffolds Next.js Server Actions with Zod validation, auth verification, and standardized error handling
---

# Create Server Action

## Description
Scaffolds a new Next.js Server Action with built-in Zod validation, `auth()` session verification, and standardized error return types. This ensures security and performance by default.

## Usage
Use this when implementing a new feature that requires data mutation (e.g., "Update Asset", "Save Template").

## Steps
1.  **Input:** Ask for the action name (e.g., `updateAsset`) and the target file path.
2.  **Template:** Read `action-template.ts` from this skill's directory.
3.  **Replacement:** Replace `{{ActionName}}` and `{{InputType}}` placeholders.
4.  **Creation:** Write the file.
5.  **Validation:**
    *   Ensure `revalidatePath` is used to clear cache.
    *   Ensure `auth()` is called at the very top.
    *   **Performance Rule:** Check that no nested `include` queries are used if they fetch potentially large datasets (e.g., `include: { history: true }`). Suggest separate queries instead.
