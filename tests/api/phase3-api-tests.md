# Phase 3 API Test Plan

Run these tests manually with the dev server running (`pnpm dev`) and database seeded (`pnpm db:seed`).

## Prerequisites

1. Start dev server: `pnpm dev`
2. Seed database: `pnpm db:seed`
3. Login at http://localhost:3000/auth/signin with `admin@example.com` / `homeportal`
4. Get auth cookie from browser DevTools (Application > Cookies > next-auth.session-token)

## Test 1: Template Packs List API

```bash
# GET /api/templates/packs - List all packs
curl -X GET "http://localhost:3000/api/templates/packs" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Array of 6 packs with templateCount
# - Seasonal Essentials (4 templates)
# - Safety First (5 templates)
# - Appliance Care (5 templates)
# - Older Home Care (3 templates)
# - Cold Climate Essentials (3 templates)
# - Humid Climate Care (3 templates)
```

```bash
# GET /api/templates/packs?category=HVAC - Filter by category
curl -X GET "http://localhost:3000/api/templates/packs?category=HVAC" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Packs that have HVAC category or null category
```

## Test 2: Pack Details API

```bash
# GET /api/templates/packs/[id] - Get single pack with templates
curl -X GET "http://localhost:3000/api/templates/packs/pack-seasonal-essentials" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Full pack object with templates array
```

## Test 3: Template Browsing with packId Filter

```bash
# GET /api/templates - List all templates
curl -X GET "http://localhost:3000/api/templates" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Paginated list of templates
```

```bash
# GET /api/templates?packId=pack-safety-first - Filter by pack
curl -X GET "http://localhost:3000/api/templates?packId=pack-safety-first" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Only templates from Safety First pack (5)
```

```bash
# GET /api/templates?packId=pack-appliance-care&category=APPLIANCE
curl -X GET "http://localhost:3000/api/templates?packId=pack-appliance-care&category=APPLIANCE" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Appliance templates from Appliance Care pack
```

## Test 4: Recommendations API

```bash
# GET /api/templates/recommendations - Get personalized recommendations
curl -X GET "http://localhost:3000/api/templates/recommendations" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected (for admin user with Cold climate, 1995 home):
# - Cold Climate Essentials pack should be high-ranked (climate match: +30)
# - Older Home Care pack should be ranked (30-year home matches min age 20: +30)
# - Each recommendation includes reason, pack info, and sample templates
```

```bash
# GET /api/templates/recommendations?limit=3
curl -X GET "http://localhost:3000/api/templates/recommendations?limit=3" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Expected: Top 3 recommendations only
```

## Test 5: Clone Template API

```bash
# POST /api/templates/[id]/clone - Clone a template
# First, get a template ID from the templates list, then:

curl -X POST "http://localhost:3000/api/templates/pack-safety-first-smoke-detector-test/clone" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Custom Smoke Detector Check"}'

# Expected: 201 Created with new template object
# - isSystemTemplate: false
# - originalTemplateId: pack-safety-first-smoke-detector-test
# - userId: [admin user id]
```

```bash
# Clone with frequency override
curl -X POST "http://localhost:3000/api/templates/pack-appliance-care-dishwasher-filter-cleaning/clone" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Weekly Dishwasher Check", "frequency": "WEEKLY"}'

# Expected: Cloned template with WEEKLY frequency instead of MONTHLY
```

## Test 6: Apply Template API

```bash
# POST /api/templates/apply - Apply template to asset
# First, get an asset ID from /api/assets, then:

curl -X POST "http://localhost:3000/api/templates/apply" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "pack-seasonal-essentials-furnace-filter-change",
    "assetId": "YOUR_ASSET_ID",
    "frequency": "MONTHLY"
  }'

# Expected: 201 Created with schedule and task objects
```

## Verification Checklist

- [ ] Template Packs List returns 6 packs
- [ ] Pack Details returns full pack with nested templates
- [ ] Template browsing supports packId filter
- [ ] Recommendations engine scores based on climate/age/assets
- [ ] Clone creates user-owned template with originalTemplateId
- [ ] Apply creates RecurringSchedule and initial Task

## Using Browser DevTools

Alternative to curl, test via browser console:

```javascript
// After logging in, open browser console:

// Test 1: Get packs
fetch('/api/templates/packs')
  .then((r) => r.json())
  .then(console.log)

// Test 2: Get pack details
fetch('/api/templates/packs/pack-seasonal-essentials')
  .then((r) => r.json())
  .then(console.log)

// Test 3: Get templates by pack
fetch('/api/templates?packId=pack-safety-first')
  .then((r) => r.json())
  .then(console.log)

// Test 4: Get recommendations
fetch('/api/templates/recommendations')
  .then((r) => r.json())
  .then(console.log)

// Test 5: Clone template
fetch('/api/templates/pack-safety-first-smoke-detector-test/clone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My Custom Check' }),
})
  .then((r) => r.json())
  .then(console.log)
```
