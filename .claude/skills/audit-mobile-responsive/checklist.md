# Mobile Responsiveness Audit Checklist

Use this checklist to verify that a component or page is "Mobile First" and compliant with the HelixIntel design standards.

## 1. Viewport Constraints (375px Baseline)
- [ ] **No Horizontal Scroll**: Does the layout fit within 375px without triggering a horizontal scrollbar?
- [ ] **Padding**: Is there at least `px-4` (16px) on the main container? Text should never touch the screen edge.
- [ ] **Fixed Widths**: Are there any `w-[350px+]` or `min-w-[350px+]` classes?
    - *Fix*: Change to `w-full` or `max-w-[...]`.

## 2. Grid & Layout Safety
- [ ] **Grid Columns**: Are `grid-cols-2` (or higher) prefixed with `md:` or `lg:`?
    - *Bad*: `grid-cols-2` (breaks on small phones)
    - *Good*: `grid-cols-1 md:grid-cols-2`
- [ ] **Flex Wrapping**: Do flex containers have `flex-wrap` if their children can exceed the width?

## 3. Touch Targets (Accessibility)
- [ ] **Height**: Are all buttons, inputs, and links at least 44px tall?
    - *Check*: `h-11` or `py-3` usually achieves this.
- [ ] **Spacing**: Is there at least 8px (`gap-2`) between interactive elements to prevent mis-taps?

## 4. Complex Components
- [ ] **Tables**: Is the `<Table>` wrapped in a `<div className="overflow-x-auto">`?
- [ ] **Charts**: Is the Recharts `<ResponsiveContainer>` used correctly with a defined parent height?
- [ ] **Modals/Drawers**: Do they take up nearly 100% width on mobile (`w-[95vw]`) instead of a fixed pixel width?
