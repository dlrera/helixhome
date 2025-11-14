# Task Generation Instructions

## Overview

This document provides a standardized workflow for creating detailed implementation plans and checklists for new development tasks in the HelixIntel CMMS project.

## Workflow

When starting a new task from the Core MVP document, follow these steps:

### Step 1: Review Requirements

1. **Read the Core MVP document** (`/instructions/Residential CMMS Platform Features Core MVP.md`)
2. **Identify the specific task** requirements and dependencies
3. **Note any existing completed tasks** that the new task depends on
4. **Extract key features** and success criteria from the MVP document

### Step 2: Create Detailed Task Document

Create a comprehensive task document at `/tasks/task-[number]-[feature-name].md` with the following structure:

#### Required Sections

1. **Overview**
   - Brief description of the feature
   - How it fits into the overall system

2. **Core Objectives**
   - 3-5 bullet points of main goals
   - Clear, measurable objectives

3. **Technical Requirements**
   - Database Schema (if applicable)
   - API Endpoints specification
   - Business logic requirements
   - State management approach

4. **UI Components**
   - Component hierarchy
   - Props interfaces
   - Key interactions
   - Responsive design considerations

5. **Implementation Pages**
   - New pages to create
   - Existing pages to modify
   - Navigation updates

6. **Business Logic**
   - Core algorithms
   - Data flow
   - Validation rules
   - Error handling

7. **Performance Optimizations**
   - Caching strategies
   - Query optimizations
   - Loading states
   - Pagination

8. **Testing Requirements**
   - Unit test coverage
   - Integration test scenarios
   - E2E test flows

9. **Success Metrics**
   - Quantifiable metrics
   - User experience goals
   - Performance targets

10. **Security Considerations**
    - Authentication/authorization
    - Data validation
    - Rate limiting
    - XSS/CSRF protection

11. **Development Checklist**
    - Reference to accompanying checklist file

12. **Dependencies**
    - List prerequisite tasks
    - External libraries needed
    - API integrations

13. **Estimated Time**
    - Breakdown by major component
    - Total estimate in hours

14. **Notes**
    - Important considerations
    - Potential gotchas
    - Future enhancement ideas

### Step 3: Create Implementation Checklist

Create a detailed checklist at `/tasks/task-[number]-checklist.md` with:

#### Structure

1. **Phase Organization**
   - Group related items into phases
   - Order phases by dependency
   - Each phase should be completeable independently

2. **Granular Items**
   - Each item should be a single, verifiable action
   - Use nested checkboxes for sub-tasks
   - Include verification steps

3. **Standard Phases** (adapt as needed):
   - Database Schema Updates
   - API Development
   - UI Components
   - Page Implementation
   - State Management
   - Business Logic
   - Testing
   - Polish and Optimization
   - Documentation

4. **Verification Criteria**
   - Functional requirements checklist
   - Non-functional requirements checklist
   - Sign-off items

#### Checklist Format

```markdown
## Phase X: [Phase Name]

### X.1 [Section Name]

- [ ] Main task
  - [ ] Sub-task 1
  - [ ] Sub-task 2
  - [ ] Verification step
```

### Step 4: Review and Confirm

Before starting implementation:

1. **Cross-reference** with Core MVP document
2. **Verify** all requirements are captured
3. **Ensure** checklist covers all components
4. **Confirm** dependencies are met
5. **Present** the plan for approval

## Template Variables

When creating documents, use these placeholders:

- `[number]` - Sequential task number (e.g., 5, 6, 7)
- `[feature-name]` - Kebab-case feature name (e.g., maintenance-templates)
- `[Feature Name]` - Title case feature name (e.g., Maintenance Templates)

## Quality Checklist

Before considering task documentation complete:

- [ ] All Core MVP requirements addressed
- [ ] Technical approach clearly defined
- [ ] UI/UX considerations documented
- [ ] Performance optimizations identified
- [ ] Security measures specified
- [ ] Testing strategy outlined
- [ ] Time estimates provided
- [ ] Dependencies listed
- [ ] Checklist is comprehensive
- [ ] Both documents are properly formatted

## Best Practices

1. **Be Specific**: Avoid vague requirements; provide concrete specifications
2. **Think Mobile-First**: Always consider mobile UX in designs
3. **Plan for Scale**: Consider performance from the start
4. **Security by Default**: Include auth checks and validation
5. **Test Coverage**: Define what needs testing upfront
6. **Incremental Delivery**: Structure work for continuous deployment
7. **User-Centric**: Focus on user value and experience

## File Naming Convention

- Task document: `task-[number]-[feature-name].md`
- Checklist: `task-[number]-checklist.md`
- Related documents: `task-[number]-[description].md`

## Example Usage

```bash
# For Task 5: Maintenance Templates
/tasks/task-5-maintenance-templates.md    # Detailed specification
/tasks/task-5-checklist.md               # Implementation checklist
```

## Notes

- This process ensures thorough planning before implementation
- Reduces rework by identifying requirements upfront
- Provides clear tracking of progress
- Enables better time estimation and resource planning
- Creates documentation for future reference

---

_Last Updated: October 2025_
_Version: 1.0_
