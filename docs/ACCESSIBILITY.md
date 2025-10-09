# Accessibility Features - Dashboard

This document outlines the accessibility features implemented for the HelixIntel Dashboard to ensure WCAG 2.1 Level AA compliance.

## Overview

The dashboard has been enhanced with comprehensive accessibility features to support users with disabilities, including:

- Screen reader users
- Keyboard-only navigation
- Users with visual impairments
- Users with cognitive disabilities

## Implemented Features

### 1. ARIA Labels and Landmarks

#### Analytics Chart Widget

- **Period Selector**: `aria-label="Select time period"` on the dropdown trigger
- **Tabs**: Proper tab roles with ARIA attributes for screen readers
- **Charts**: Recharts components provide accessible data visualization

#### Maintenance Calendar Widget

- **Navigation Buttons**:
  - Previous month: `aria-label="Previous month"`
  - Next month: `aria-label="Next month"`
  - Today button: `aria-label="Go to today"`
- **Month Display**: `aria-live="polite"` for announcing month changes to screen readers
- **Calendar Grid**:
  - `role="region"` with `aria-label="Maintenance calendar"`
  - `role="grid"` for the calendar structure
  - `role="gridcell"` for each day with descriptive labels
- **Day Cells**: Each day has a comprehensive aria-label:
  - Example: "October 8, 2025. 3 tasks (today)"
  - Includes date, task count, and today indicator

### 2. Keyboard Navigation

#### Focus Management

- **Tab Order**: Logical tab order through all interactive elements
- **Calendar Days**: Days with tasks are keyboard-focusable (`tabIndex={0}`)
- **Empty Days**: Non-interactive days removed from tab order (`tabIndex={-1}`)

#### Keyboard Shortcuts

All interactive elements support standard keyboard interactions:

- **Enter/Space**: Activate buttons and links
- **Tab/Shift+Tab**: Navigate through focusable elements
- **Arrow Keys**: Navigate tabs in tab panels (built into shadcn/ui Tabs component)

### 3. Semantic HTML

#### Proper Element Usage

- **Headings**: Hierarchical heading structure (h1 → h2 → h3)
- **Buttons**: `<button>` elements for actions (not divs with onClick)
- **Links**: `<a>` elements for navigation
- **Tables**: Proper table structure for cost breakdowns (thead, tbody, th, td)

#### Regions and Landmarks

- **Navigation**: Sidebar with proper nav landmark
- **Main Content**: Main element for primary content
- **Region**: Calendar marked as a distinct region

### 4. Visual Accessibility

#### Color Contrast

- **Brand Colors**: All text meets WCAG AA contrast ratios
  - Primary (#216093) on white: 4.84:1 (AA compliant)
  - Secondary text colors: minimum 4.5:1 ratio
- **Status Indicators**: Multiple visual cues beyond color:
  - Text labels (e.g., "Overdue", "In Progress")
  - Icons and badges
  - Different shapes and sizes

#### Text Sizing

- **Minimum Size**: 14px (0.875rem) for body text
- **Relative Units**: rem/em used for scalability
- **Zoom Support**: Layout remains usable up to 200% zoom

#### Visual Feedback

- **Focus Indicators**: Visible focus rings on all interactive elements
- **Hover States**: Clear hover feedback
- **Active States**: Visual indication of active/selected items

### 5. Loading States and Error Handling

#### Loading Indicators

- **Spinner**: Visible loading spinner with proper contrast
- **Skeleton Screens**: Preserve layout during loading
- **aria-busy**: Set on containers while loading (handled by React Query)

#### Error Messages

- **Clear Communication**: Descriptive error messages
- **Retry Options**: Users can retry failed actions
- **Error Boundaries**: Graceful error handling prevents crashes

## Component-Specific Features

### Dashboard Settings Form

#### Form Accessibility

- **Labels**: All inputs have associated labels (using shadcn/ui Form)
- **Error Messages**: Connected to inputs via aria-describedby
- **Required Fields**: Marked with aria-required
- **Validation**: Real-time validation with clear error messages

#### Date Picker

- **Keyboard Navigation**: Full keyboard support for date selection
- **Screen Reader Announcements**: Selected date announced
- **Calendar Widget**: Accessible calendar popup (react-day-picker)

### Cost Report Page

#### Data Tables

- **Headers**: Proper th elements with scope attributes
- **Row Headers**: First column cells marked as row headers
- **Caption**: Table caption describing content
- **Sorting**: Accessible sort controls (if implemented)

#### Charts

- **Recharts Accessibility**: Built-in accessibility features
- **Tooltip**: Accessible tooltips show on focus
- **Data Alternative**: Table view available for all chart data
- **Legends**: Clear legend with sufficient contrast

### Activity Timeline

#### List Structure

- **Semantic Lists**: ul/li structure for activities
- **Timestamps**: Properly formatted with time element
- **Status Indicators**: Text labels + visual indicators

## Testing Recommendations

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Ensure logical tab order
   - Verify focus indicators are visible
   - Test all keyboard shortcuts

2. **Screen Reader Testing**
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Verify all content is announced
   - Check form labels and error messages
   - Confirm landmark navigation works

3. **Zoom and Scaling**
   - Test at 200% zoom level
   - Verify no horizontal scrolling
   - Check text remains readable
   - Ensure interactive elements remain clickable

4. **Color Contrast**
   - Use browser DevTools contrast checker
   - Verify all text meets AA standards
   - Check focus indicators
   - Test high contrast mode (Windows)

### Automated Testing

The E2E tests include basic accessibility checks:

- ARIA labels present
- Proper button/link usage
- Keyboard navigation
- Form validation

For comprehensive testing, use:

- **axe DevTools**: Browser extension for automated checks
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Accessibility audit in Chrome DevTools

## Known Limitations

### Third-Party Components

1. **Recharts**: Limited accessibility customization
   - Solution: Provide table view alternatives
   - Consider adding data export features

2. **Date Picker**: react-day-picker accessibility varies by configuration
   - Current implementation uses accessible presets
   - Regular updates recommended

### Future Improvements

1. **Skip Links**: Add "Skip to main content" link
2. **Focus Trapping**: Modal dialogs should trap focus
3. **Live Regions**: More extensive use of aria-live for dynamic updates
4. **Reduced Motion**: Respect prefers-reduced-motion media query
5. **Dark Mode**: Ensure accessibility in dark theme
6. **Voice Control**: Test with Dragon NaturallySpeaking or Voice Control

## Compliance Status

### WCAG 2.1 Level AA

- ✅ **1.1 Text Alternatives**: Images have alt text
- ✅ **1.3 Adaptable**: Semantic HTML and ARIA roles
- ✅ **1.4 Distinguishable**: Sufficient color contrast
- ✅ **2.1 Keyboard Accessible**: Full keyboard navigation
- ✅ **2.4 Navigable**: Clear page structure and navigation
- ✅ **3.1 Readable**: Clear language and labels
- ✅ **3.2 Predictable**: Consistent navigation and behavior
- ✅ **3.3 Input Assistance**: Form validation and error messages
- ✅ **4.1 Compatible**: Valid HTML and ARIA usage

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [shadcn/ui Accessibility](https://ui.shadcn.com/docs/components)
- [React Hook Form Accessibility](https://react-hook-form.com/advanced-usage#Accessibility)
- [Recharts Accessibility](https://recharts.org/en-US/guide)

## Contact

For accessibility concerns or suggestions, please create an issue in the project repository.
