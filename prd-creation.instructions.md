---
description: Workflow for creating comprehensive Product Requirements Documents (PRDs) for AI-assisted development
applyTo: '**/*.md'
---

# Product Requirements Document (PRD) Creation Workflow

## Overview

This workflow guides you through creating comprehensive Product Requirements Documents (PRDs) that serve as the foundation for AI-assisted development tasks. The PRD should be detailed enough for a junior developer to understand and implement.

## Process

### Step 1: Initial Assessment

When a user provides a feature request or project idea, first ask clarifying questions to understand:

- **Problem/Goal**: What specific problem are we solving?
- **Target User**: Who will use this feature?
- **Core Functionality**: What are the main capabilities needed?
- **User Stories**: How will users interact with this feature?
- **Acceptance Criteria**: What defines "done"?
- **Scope/Boundaries**: What's included and excluded?
- **Data Requirements**: What data needs to be stored/processed?
- **Design/UI**: Any specific design requirements?
- **Edge Cases**: What unusual scenarios should we handle?

### Step 2: PRD Structure

Create a comprehensive PRD with these sections:

#### 1. Introduction/Overview

- Brief description of the feature
- Context and background
- Problem statement

#### 2. Goals

- Primary objectives
- Business value
- User value

#### 3. User Stories

- As a [user type], I want [functionality] so that [benefit]
- Include multiple user personas if applicable

#### 4. Functional Requirements

- Detailed feature specifications
- User interactions and flows
- Data requirements
- Integration points

#### 5. Non-Goals

- Explicitly state what's out of scope
- Future considerations

#### 6. Design Considerations

- UI/UX requirements
- Accessibility considerations
- Mobile/responsive requirements

#### 7. Technical Considerations

- Performance requirements
- Security considerations
- Scalability needs
- Integration requirements

#### 8. Success Metrics

- How will we measure success?
- Key performance indicators
- Acceptance criteria

#### 9. Open Questions

- Unresolved issues
- Items requiring further clarification

### Step 3: File Management

- Save the PRD as `prd-[feature-name].md` in a `/tasks` directory
- Use clear, descriptive filename
- Ensure proper markdown formatting

## Writing Guidelines

### Clarity and Precision

- Write for a junior developer audience
- Be explicit and unambiguous
- Avoid jargon and technical assumptions
- Use concrete examples where possible

### Structure and Format

- Use consistent markdown formatting following MD linting rules
- Include clear headings and subheadings with proper hierarchy
- Add blank lines around all lists (before and after)
- Add blank lines around all headings (before and after)
- Remove trailing punctuation from headings (no colons, periods)
- Use bullet points for lists consistently
- Include code examples where relevant with proper language tags
- Ensure proper nesting of headings (don't skip levels)

### Markdown Formatting Requirements

To ensure generated PRDs pass markdown linting:

- **Blank Lines**: Always include blank lines before and after lists, headings, and code blocks
- **Heading Punctuation**: Never end headings with punctuation (colons, periods, etc.)
- **List Formatting**: Use consistent bullet points (-) and ensure proper spacing
- **Code Blocks**: Use triple backticks with language specification when needed
- **Line Length**: Keep lines under 120 characters when possible for readability

### Completeness

- Address all aspects of the feature
- Include error handling scenarios
- Consider edge cases and boundary conditions
- Specify data validation requirements

## Example PRD Template

The following structure should be used for all PRDs:

### Basic Structure

1. **Title**: PRD: [Feature Name]
2. **Introduction**: Brief description of what we're building and why
3. **Goals**: Primary objectives, business value, user value
4. **User Stories**: As a [user type], I want [action] so that [benefit]
5. **Functional Requirements**: Detailed feature specifications
6. **Non-Goals**: What we're NOT building
7. **Design Considerations**: UI/UX, accessibility, responsive design
8. **Technical Considerations**: Performance, security, integration
9. **Success Metrics**: How we'll measure success
10. **Open Questions**: Unresolved issues needing clarification

### Template Guidelines

- Use proper markdown heading hierarchy (# ## ### ####)
- Include blank lines around all lists for proper markdown formatting
- Use **bold** text for emphasis on key terms
- Structure code blocks with appropriate language tags
- Ensure all headings are followed by blank lines
- Remove trailing punctuation from headings
- Use consistent bullet point formatting throughout

## Best Practices

### For GitHub Copilot Users

- Use this PRD as context when starting development
- Reference specific sections when asking Copilot for implementation help
- Keep the PRD updated as requirements evolve
- Use PRD sections as prompts for generating code

### Quality Assurance

- Review PRD with stakeholders before starting development
- Ensure all requirements are testable
- Validate that success metrics are measurable
- Confirm technical feasibility

### Documentation

- Keep PRDs version controlled
- Link to related documents and resources
- Update PRDs as requirements change
- Archive completed PRDs for reference

## Integration with Development Workflow

This PRD creation process integrates with:

- **Task Generation**: Use the completed PRD to generate specific development tasks
- **Task Execution**: Reference PRD sections during implementation
- **Code Review**: Validate implementations against PRD requirements
- **Testing**: Create test cases based on PRD specifications
