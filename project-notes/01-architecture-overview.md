# Architecture Overview

## Project Information

**Project Name:** HelixIntel CMMS
**Version:** 0.1.0 (MVP)
**Type:** Residential Computerized Maintenance Management System
**Status:** Core MVP Complete (October 2025)

## Technology Stack

### Frontend Framework
- **Next.js 15.0.4** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety

### Styling & UI Components
- **TailwindCSS v3.4.1** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Accessible component primitives (15+ packages)
- **Lucide React 0.544.0** - Icon library
- **TailwindCSS Animate** - Animation utilities
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional class management

### State Management & Data Fetching
- **TanStack Query (React Query) 5.90.2** - Server state management
- Client-side caching with configurable stale times
- Optimistic updates and automatic refetching

### Authentication & Authorization
- **NextAuth.js v4.24.11** - Authentication framework
- **@auth/prisma-adapter** - Database adapter
- **bcryptjs** - Password hashing
- JWT-based session strategy
- Credentials provider (email/password)

### Database & ORM
- **Prisma 6.16.3** - Type-safe ORM
- **SQLite** - Development database
- Migration system for schema changes
- Connection pooling with global singleton pattern

### Forms & Validation
- **React Hook Form 7.63.0** - Form state management
- **Zod 4.1.11** - Schema validation
- **@hookform/resolvers** - Integration layer

### Data Visualization
- **Recharts 3.2.1** - Chart library for analytics
- **date-fns 4.1.0** - Date manipulation
- **numeral 2.0.6** - Number formatting

### Additional Libraries
- **sonner 2.0.7** - Toast notifications
- **cmdk 1.1.1** - Command palette
- **react-day-picker 9.11.1** - Date picker
- **react-window 2.2.0** - Virtualization for large lists (installed but may not be actively used)
- **resend 6.1.2** - Email service (installed but notifications not fully implemented)

### Development Tools
- **ESLint** - Code linting
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks
- **lint-staged 16.2.3** - Pre-commit linting
- **@next/bundle-analyzer** - Bundle size analysis
- **tsx 4.20.6** - TypeScript execution

### Testing
- **Playwright 1.55.1** - E2E testing
- Configured for Chromium, Firefox, and WebKit
- Test suites: E2E (dashboard, templates, homepage), API tests, Unit tests

## Directory Structure

```
helix-home-prototype/
├── app/                          # Next.js App Router
│   ├── (protected)/              # Protected route group
│   │   ├── assets/               # Asset management pages
│   │   ├── tasks/                # Task management pages
│   │   ├── templates/            # Template browsing pages
│   │   ├── dashboard/            # Analytics dashboard
│   │   ├── reports/              # Placeholder - Coming Soon
│   │   ├── settings/             # Placeholder - Coming Soon
│   │   ├── help/                 # Placeholder - Coming Soon
│   │   ├── profile/              # User profile (view-only)
│   │   ├── notifications/        # Placeholder - Coming Soon
│   │   └── layout.tsx            # Protected layout with app shell
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth.js handler
│   │   ├── assets/               # Asset CRUD endpoints
│   │   ├── tasks/                # Task CRUD endpoints
│   │   ├── templates/            # Template endpoints
│   │   ├── schedules/            # Recurring schedule endpoints
│   │   ├── dashboard/            # Dashboard analytics endpoints
│   │   ├── homes/                # Home management
│   │   ├── notifications/        # Notification endpoints
│   │   └── cron/                 # Automated jobs
│   ├── auth/                     # Auth pages
│   │   ├── signin/               # Sign-in page
│   │   └── forgot-password/      # Forgot password (placeholder)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── providers.tsx             # Client-side providers
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (30+)
│   ├── assets/                   # Asset-specific components
│   ├── tasks/                    # Task-specific components
│   ├── templates/                # Template-specific components
│   ├── dashboard/                # Dashboard widgets
│   ├── schedules/                # Schedule management components
│   └── layout/                   # Layout components (sidebar, topbar, etc.)
├── lib/                          # Shared libraries
│   ├── validation/               # Zod schemas
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   ├── api/                      # API utilities
│   ├── config/                   # Configuration files
│   ├── auth.ts                   # NextAuth.js config
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # General utilities
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   ├── migrations/               # Migration history
│   └── dev.db                    # SQLite database (gitignored)
├── tests/                        # Test suites
│   ├── e2e/                      # End-to-end tests
│   ├── api/                      # API tests
│   └── unit/                     # Unit tests
├── docs/                         # Documentation
├── instructions/                 # AI assistant instructions
├── tasks/                        # Project management
├── styles/                       # Global styles
├── types/                        # TypeScript type definitions
├── hooks/                        # Global hooks (may overlap with lib/hooks)
└── ux-scripts/                   # UX session recordings

```

## Architectural Patterns

### Authentication Flow
1. **NextAuth.js** configured in `lib/auth.ts`
2. **Credentials Provider** for email/password authentication
3. **JWT Sessions** (no database sessions)
4. **Password Hashing** with bcryptjs (12 salt rounds)
5. **Session Extension** via callbacks (user ID added to token/session)
6. **Middleware Protection** via `middleware.ts` protecting `/dashboard/*` and `/(protected)/*`

### Database Access Pattern
- **Global Prisma Client Singleton** in `lib/prisma.ts`
- Prevents connection exhaustion in development
- Attached to `globalThis` for hot reloading
- All API routes use this singleton

### API Route Pattern
```typescript
// Standard pattern in API routes:
1. Import requireAuth from lib/api/auth
2. Call requireAuth() to get session and userId
3. Perform business logic with Prisma
4. Return formatted JSON via lib/api/responses
5. Handle errors with try/catch
```

### Client State Management
- **TanStack Query** for server state
- Custom hooks per feature (use-tasks, use-templates, use-dashboard)
- Query invalidation on mutations
- Optimistic updates for better UX
- Toast notifications via sonner

### Component Architecture
- **shadcn/ui components** are owned code (not NPM package)
- Components installed via CLI and customized
- Consistent use of Radix UI primitives
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance

### Performance Optimizations (Task 7a - October 2025)
1. **Database Indexing** - Added composite indexes on frequently queried fields
2. **API Query Optimization** - Reduced sequential queries to single aggregate queries
3. **Code Splitting** - Dynamic imports for Recharts and heavy components
4. **Server-Side Caching** - 5-minute TTL for dashboard data
5. **Client-Side Caching** - Aligned TanStack Query stale times with server cache
6. **Bundle Optimization** - Package import optimization, SWC minification

## Environment Configuration

Required environment variables:
- `DATABASE_URL` - SQLite database path
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for JWT signing
- `CRON_SECRET` - Secret for authenticating cron jobs

## Build & Deployment

### Development
```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm db:seed      # Seed database with admin user
```

### Production
```bash
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm analyze      # Analyze bundle size
```

### Code Quality
```bash
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix issues
pnpm format       # Format with Prettier
pnpm typecheck    # TypeScript type checking
```

### Testing
```bash
pnpm test         # Run Playwright tests
pnpm test:ui      # Run tests with UI mode
```

## Key Design Decisions

1. **SQLite for Development** - Simple setup, easy to seed, portable
2. **JWT Sessions** - Stateless authentication, no session table overhead
3. **shadcn/ui** - Owned components for full customization
4. **TanStack Query** - Superior DX for server state management
5. **App Router** - Next.js 15 modern routing with Server Components
6. **Monolithic Architecture** - Single codebase for rapid MVP development
7. **Mobile-First** - Responsive design prioritizing mobile experience
8. **Accessibility First** - WCAG 2.1 AA compliance from the start

## Security Considerations

- Password hashing with bcryptjs (12 rounds)
- JWT secret protection
- Middleware-based route protection
- CSRF protection via NextAuth.js
- Input validation via Zod schemas
- SQL injection prevention via Prisma parameterized queries
- XSS protection via React's JSX escaping

## Known Limitations

1. **Single Home Per User** - Currently assumes one home per user
2. **No OAuth Providers** - Only email/password auth
3. **No Email Verification** - Email verification not implemented
4. **SQLite Database** - Not suitable for production scale
5. **No Real-time Updates** - Relies on polling, no WebSockets
6. **Limited Photo Storage** - Photos stored in database as base64
7. **No Multi-tenancy** - Single-tenant architecture
