# HelixIntel Project Status & Configuration

## Project Overview

HelixIntel is a modern web application built with Next.js 15, featuring a complete authentication system and branded UI components. The project is configured for AI-assisted development with comprehensive tooling and best practices.

## Current State

### Completed Features

#### Authentication System

- **NextAuth.js v4** with credentials provider (JWT-based sessions)
- **Login portal** at `/auth/signin` with email/password authentication
- **Forgot password page** (UI complete, email functionality placeholder for future)
- **Protected dashboard** at `/dashboard` as post-login landing page
- **Middleware-based route protection** for all `/dashboard` and `/(protected)` routes
- **Admin bypass button** for development (signs in as admin@example.com)
- **Two seeded test accounts**:
  - Admin: `admin@example.com` / `admin123`
  - Test: `test@example.com` / `test123`

#### UI & Branding

- **HelixIntel brand colors** fully implemented in Tailwind CSS
  - Primary: #216093 (brand blue)
  - Secondary: #F9FAFA (light surface)
  - Accent: #57949A (teal)
  - Destructive: #DB162F (red)
  - Success: #2E933C (green)
  - Warning: #F0C319 (yellow)
  - Info: #224870 (dark blue)
- **Inter font** configured (900 weight for headings, 400 for body)
- **shadcn/ui components** installed and configured (Button, Input, Dialog, Toast, etc.)
- **Dark mode support** via class-based toggle (not yet activated in UI)

#### Database

- **Prisma ORM** with SQLite database
- **Schema**: User, Account, Session, VerificationToken (NextAuth.js models)
- **Bcrypt password hashing** (12 salt rounds)
- **Seeded test data** with two user accounts

## Tech Stack

### Core Framework

- **Next.js 15.0.4** (App Router)
- **React 18** with Server Components
- **TypeScript 5**
- **Node.js** (ES6+ target)

### UI Layer

- **TailwindCSS v4** with custom HelixIntel theme
- **shadcn/ui** components (copy-paste, not NPM package)
- **Radix UI** primitives for accessibility
- **Lucide React** icons
- **@tailwindcss/forms** and **@tailwindcss/typography** plugins

### State Management

- **TanStack Query** (React Query v5) for server state
- **NextAuth.js** session management
- **React Hook Form** + **Zod** for form validation

### Database & ORM

- **Prisma 6.16.3** with Prisma Client
- **SQLite** (development database)
- **bcryptjs** for password hashing

### Development Tools

- **ESLint** (Next.js config + Prettier integration)
- **Prettier** with Tailwind class sorting
- **Husky** + **lint-staged** for pre-commit hooks
- **Playwright** for E2E testing (configured, tests not yet written)
- **tsx** for running TypeScript scripts

## Project Structure

```
helix-home-prototype/
├── app/
│   ├── (protected)/
│   │   └── dashboard/          # Protected landing page
│   ├── auth/
│   │   ├── signin/             # Login page
│   │   └── forgot-password/    # Password reset (placeholder)
│   ├── api/auth/[...nextauth]/ # NextAuth.js API routes
│   ├── layout.tsx              # Root layout with Inter font & Toaster
│   ├── providers.tsx           # Client providers (TanStack Query)
│   ├── globals.css             # Tailwind + HelixIntel CSS variables
│   └── page.tsx                # Root redirects to /auth/signin
│
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── sign-out-button.tsx     # Client-side sign out
│
├── lib/
│   ├── auth.ts                 # NextAuth.js configuration
│   ├── prisma.ts               # Prisma Client singleton
│   ├── utils.ts                # cn() utility for class merging
│   └── validation/             # Zod schemas
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeding script
│   └── dev.db                  # SQLite database (gitignored)
│
├── hooks/
│   └── use-toast.ts            # Toast notification hook
│
├── instructions/               # AI assistant guidance
│   ├── general.instructions.md
│   ├── ui.instructions.md
│   ├── prd-creation.instructions.md
│   └── helix_intel_tailwind_configuration_guide_next_js_shadcn_ui_prisma_sqlite.md
│
├── middleware.ts               # Route protection middleware
├── tailwind.config.ts          # Tailwind with HelixIntel theme
├── .env.test                   # Environment variables template
└── CLAUDE.md                   # AI assistant codebase guide
```

## Development Workflow

### Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.test` to `.env`
   - Update `DATABASE_URL` and `NEXTAUTH_SECRET` as needed

3. **Initialize database**:

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   - Server runs at http://localhost:3000
   - Hot reload enabled

### Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking
npm run db:seed      # Seed database
npm run test         # Run Playwright tests
npx prisma studio    # Open database GUI
```

### Code Quality

- **Pre-commit hooks** automatically run ESLint and Prettier on staged files
- **TypeScript strict mode** enabled
- **ESLint** extends `next/core-web-vitals`, `next/typescript`, and `prettier`
- **Path alias**: `@/*` maps to project root

## AI-Assisted Development

### Current Configuration

This project is optimized for AI-assisted development with:

1. **Comprehensive instructions** in `/instructions` folder
   - General conventions (pnpm usage, no unused imports, seed data instead of mocks)
   - UI guidelines (TailwindCSS v4, shadcn/ui, always fetch latest docs)
   - PRD creation workflow for new features

2. **CLAUDE.md** file with codebase overview
   - Essential commands
   - Architecture patterns
   - Development guidelines
   - Branding standards

3. **PRD-first workflow**
   - Create detailed PRDs in `/tasks` directory before implementation
   - Follow structured template (goals, user stories, requirements, acceptance criteria)
   - Write for junior developer audience

### Execution Approach

When implementing new features:

1. **Create PRD** if feature is non-trivial (use `/tasks/prd-[feature-name].md`)
2. **Use TodoWrite** tool to track multi-step tasks
3. **Follow branding standards**:
   - Company name: **HelixIntel** (exact casing)
   - Use brand colors via CSS variables
   - Inter font (900 for headings, 400 for body)
4. **Always seed data** - never mock in UI or API
5. **Fetch latest docs** for TailwindCSS and shadcn/ui (training data is outdated)
6. **Use pnpm** exclusively (though npm is fallback if pnpm unavailable)

## Access & Permissions

### AI Assistant Access

The AI assistant (Claude Code) has full access to:

- **Read/Write**: All project files and directories
- **Execute**: Bash commands (npm, git, etc.)
- **Tools**: File operations, code search, grep, glob patterns
- **MCP tools**: VS Code diagnostics, Jupyter code execution

### Limitations

- Cannot directly interact with browser (use Playwright for testing)
- Cannot access environment secrets (must be provided by user)
- Background processes managed via BashOutput tool
- Git operations allowed (read status, create commits, PRs)

## Next Steps

### Immediate Priorities

1. **Session management improvements**
   - Add session expiry handling
   - Implement "remember me" functionality

2. **Password reset flow**
   - Email service integration (placeholder exists)
   - Token-based reset links
   - Password strength validation

3. **Dashboard features**
   - Replace placeholder cards with actual functionality
   - Add navigation menu
   - Implement user profile page

4. **Testing**
   - Write Playwright E2E tests for auth flow
   - Add unit tests for utilities
   - Test dark mode toggle

### Future Enhancements

- User registration page
- Role-based access control
- Email verification
- OAuth providers (Google, GitHub)
- User management admin panel

## Known Issues

- **Module warning**: `next.config.js` should have `"type": "module"` in package.json (minor performance impact)
- **Dark mode**: Theme toggle not yet added to UI (infrastructure exists)
- **Email functionality**: Forgot password page is UI-only (no email sending)

## Support

For development questions:

- Review `/instructions` folder for guidelines
- Check `CLAUDE.md` for architecture patterns
- See `package.json` for available commands
- Review Prisma schema for database structure

## Project Health

✅ **Build Status**: Passing
✅ **Type Safety**: All TypeScript errors resolved
✅ **Linting**: Clean (with auto-fix on commit)
✅ **Database**: Seeded and functional
✅ **Authentication**: Fully operational
✅ **Dev Server**: Running on http://localhost:3000

Last Updated: 2025-10-03
