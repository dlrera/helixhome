---
description: Convert Product Requirements Documents (PRDs) into actionable development tasks with clear dependencies
applyTo: '**/*.md'
---

# Task Generation from PRD Workflow

## Overview

This workflow converts Product Requirements Documents (PRDs) into actionable, granular development tasks that can be systematically implemented. The output is a structured task list that breaks down complex features into manageable sub-tasks.

## Process

### Step 1: PRD Analysis

1. Read and analyze the complete PRD
2. Identify all functional requirements
3. Map out dependencies between features
4. Consider technical implementation needs

### Step 2: Task Decomposition

Break down the PRD into logical groups:

#### Core Categories

- **Setup & Infrastructure**: Project setup, dependencies, configuration
- **Data Layer**: Database schema, models, data access
- **Business Logic**: Core functionality, algorithms, processing
- **API/Services**: External integrations, service layers
- **User Interface**: Frontend components, user interactions
- **Testing**: Unit tests, integration tests, validation
- **Documentation**: Code docs, user guides, deployment notes

#### Task Granularity

- Each task should be completable in 1-4 hours
- Tasks should have clear, measurable outcomes
- Sub-tasks should be specific and actionable
- Include verification steps for each task

### Step 3: Task List Format

Use this markdown structure for consistency with proper formatting:

#### Basic Structure

1. **Header Section**: Include title, source PRD, target audience, and duration
2. **Task Categories**: Group related tasks logically
3. **Task Dependencies**: Map critical path and parallel opportunities
4. **Relevant Files**: List files to be created or modified
5. **Success Criteria**: Define completion metrics

#### Formatting Requirements

- **Blank Lines**: Always add blank lines before and after lists and headings
- **Heading Hierarchy**: Use proper markdown heading levels (# ## ### ####)
- **Task Format**: Use checkbox format with task IDs and descriptions
- **Dependencies**: Use clear arrow notation (T001 → T002)
- **File Paths**: Use backticks for file names and paths
- **Duration**: Include time estimates for each task

#### Template Structure

The task list should follow this pattern:

- Title with feature name
- Metadata (source, target, duration)
- Task categories with numbered tasks
- Clear dependency mapping
- File organization
- Success criteria

### Step 4: User Confirmation

After generating the task list:

1. Present the complete task breakdown
2. Explain the rationale for task grouping
3. Highlight critical dependencies
4. Ask user to confirm before proceeding: "Does this task breakdown look correct? Should we proceed with implementation?"

## Task Writing Guidelines

### Clarity and Specificity

- Use action verbs: "Create", "Implement", "Configure", "Test"
- Include specific deliverables: "Create login form with email/password fields"
- Define success criteria: "Form validates input and displays error messages"
- Specify file locations: "Add validation to `src/utils/validation.js`"

### Markdown Formatting Requirements

To ensure generated task lists pass markdown linting:

- **Blank Lines**: Always include blank lines before and after lists, headings, and sections
- **Heading Punctuation**: Never end headings with punctuation (colons, periods, etc.)
- **List Spacing**: Add blank lines around all bullet point lists
- **Heading Hierarchy**: Don't skip heading levels (h1 → h2 → h3)
- **Consistent Bullets**: Use consistent bullet points (-) throughout
- **Code Formatting**: Use backticks for file names and inline code

### Technical Considerations

- Account for error handling in each task
- Include logging and monitoring setup
- Consider security implications
- Plan for testing at each stage
- Ensure proper TypeScript typing

### Task Prioritization

1. **Critical Path**: Core functionality that blocks other features
2. **High Priority**: Essential features for MVP
3. **Medium Priority**: Important but not blocking
4. **Low Priority**: Nice-to-have features

## Example Task Template

### Task Structure Guidelines

Each task should follow this pattern:

#### Task Format

- Use checkbox format with bold task ID and description
- Include sub-tasks with specific deliverables
- Add file locations and duration estimates
- Specify success criteria and dependencies

#### Example Structure

Task ID: T005: User Authentication
Sub-tasks:

- Create user registration endpoint with validation
- Create login endpoint with JWT token generation
- Add authentication middleware for protected routes
- Write comprehensive unit tests

#### Task Details

Each task should include:

- **Specific Actions**: Clear action items with measurable outcomes
- **File Locations**: Where code should be implemented
- **Success Criteria**: How to verify task completion
- **Error Handling**: How to handle edge cases
- **Dependencies**: What must be completed first

## Integration with GitHub Copilot

### Prompting Strategies

When working with GitHub Copilot on generated tasks:

1. **Context Setting**: Start with "Based on the PRD and current task T00X..."
2. **Specific Requests**: "Generate the user registration endpoint with input validation"
3. **Code Review**: "Review this implementation against the PRD requirements"
4. **Testing**: "Create unit tests for the authentication logic"

### Best Practices

- Reference specific PRD sections in prompts
- Use task IDs in commit messages
- Keep the task list updated with progress
- Mark dependencies as completed before starting dependent tasks

## Quality Assurance

### Task Validation

- Each task should map to specific PRD requirements
- Verify tasks are appropriately sized (1-4 hours)
- Ensure all edge cases are covered
- Check for proper error handling

### Dependency Management

- Identify all task dependencies
- Order tasks logically
- Flag potential blocking issues
- Plan for parallel development where possible

## File Management

### Task List Storage

- Save as `task-list-[feature-name].md` in `/tasks` directory
- Keep task list version controlled
- Update progress regularly
- Archive completed task lists

### Progress Tracking

- Update task status as work progresses
- Add notes about implementation decisions
- Track time spent on each task
- Document any deviations from original plan

## Common Task Patterns

### Frontend Tasks

- Component creation and styling
- State management implementation
- API integration
- User interaction handling
- Responsive design implementation

### Backend Tasks

- API endpoint creation
- Database operations
- Business logic implementation
- Authentication and authorization
- Error handling and validation

### Testing Tasks

- Unit test creation
- Integration test setup
- End-to-end test scenarios
- Performance testing
- Security testing

### DevOps Tasks

- CI/CD pipeline setup
- Deployment configuration
- Monitoring and logging
- Database migrations
- Environment configuration
