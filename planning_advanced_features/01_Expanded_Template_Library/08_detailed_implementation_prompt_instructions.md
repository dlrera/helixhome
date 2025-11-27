# Detailed Implementation Prompt Instructions

Use these prompts sequentially in the "Immediate Action" section of `07_coding_agent_prompt.md`.

## Session 1: Database Schema & Models

```markdown
**Immediate Action**:
Execute **Phase 1: Database Schema & Models** from `06_detailed_implementation_rollout.md`.

1.  **Define `TemplatePack` Model**: Add the model to `prisma/schema.prisma` with all specified fields. Cross-reference `AssetCategory` enum.
2.  **Update `Home` Model**: Add `climateZone` (String?) and `yearBuilt` (Int?) to support recommendations.
3.  **Update `MaintenanceTemplate` Model**: Add `packId`, `tags`, `season`, `originalTemplateId`, and `userId` fields. Add necessary relations.
4.  **Migration**: Run `npx prisma format` and `npx prisma migrate dev --name add_template_packs_and_home_fields`. Verify the migration file is created.
```

## Session 2: Seed Data Implementation

```markdown
**Immediate Action**:
Execute **Phase 2: Seed Data Implementation** from `06_detailed_implementation_rollout.md`.

1.  **Create Seed Data**: Create `prisma/seed-data/template-packs.ts` and define `SYSTEM_PACKS` (Seasonal Essentials, Safety First, Appliance Care) matching the `AssetCategory` enum.
2.  **Update Seed Script**: Import `SYSTEM_PACKS` in `prisma/seed.ts` and implement upsert logic for Packs and nested Templates.
3.  **Execute**: Run `npx prisma db seed` and verify data integrity using `npx prisma studio` or by querying the database.
```

## Session 3: Backend API Implementation

```markdown
**Immediate Action**:
Execute **Phase 3: Backend API Implementation** from `06_detailed_implementation_rollout.md`.

1.  **Template Packs List**: Create `app/api/templates/packs/route.ts` (GET) with filters.
2.  **Update Template Browsing**: Update `app/api/templates/route.ts` to support `packId` filtering while maintaining backward compatibility.
3.  **Recommendations**: Create `app/api/templates/recommendations/route.ts`. Implement scoring logic based on Home Profile (Climate, Age) and Asset Category match.
4.  **Apply Template**: Verify or create `app/api/templates/[id]/apply/route.ts` to handle applying templates (and packs if needed).
```

## Session 4: Frontend UI Components (Refactor)

```markdown
**Immediate Action**:
Execute **Phase 4: Frontend UI Components (Refactor & Extend)** from `06_detailed_implementation_rollout.md`.

1.  **Create Types**: Create `types/templates.ts` and define `TemplatePack` and updated `Template` interfaces.
2.  **Pack Card**: Create `components/templates/template-pack-card.tsx` using Shadcn UI components.
3.  **Refactor Browser**: Update `components/templates/template-browser.tsx` to include a "Packs" view mode/tab. Implement fetching from the new API.
4.  **Pack Details**: Create `components/templates/template-pack-details.tsx` (or equivalent view) to list templates within a pack.
```

## Session 5: Page Implementation & Integration

```markdown
**Immediate Action**:
Execute **Phase 5: Page Implementation** from `06_detailed_implementation_rollout.md`.

1.  **Library Page**: Update `app/(protected)/templates/page.tsx` to use the refactored `TemplateBrowser` and include a "Recommendations" widget.
2.  **Integration**: Ensure the "Apply" flow works for both individual templates and templates within packs. Verify custom template cloning if implemented.
```

## Session 6: Verification & Polish

```markdown
**Immediate Action**:
Execute **Phase 6: Verification** from `06_detailed_implementation_rollout.md`.

1.  **Manual Verification**: Run the app and verify the end-to-end flow: Browse Packs -> View Details -> Apply Template -> Verify Task Creation.
2.  **Polish**: Check for empty states, loading states, and mobile responsiveness.
```
