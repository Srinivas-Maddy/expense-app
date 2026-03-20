# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense Management Application — a Turborepo monorepo with an Express API backend, Next.js web frontend, and React Native (Expo) mobile app. Uses PostgreSQL via Prisma ORM. All validation schemas and TypeScript types are shared via `packages/shared`.

## Commands

### Development
```bash
docker-compose up postgres -d                    # Start PostgreSQL
DATABASE_URL="postgresql://expense_user:expense_pass@localhost:5432/expense_db" npx prisma migrate dev --schema=packages/db/prisma/schema.prisma  # Run migrations
DATABASE_URL="..." npx tsx packages/db/prisma/seed.ts  # Seed default categories
turbo dev                                        # Start API (port 4000) + Web (port 3000)
```

### Build & Typecheck
```bash
turbo build                                      # Build all workspaces
npx tsc --noEmit -p apps/api/tsconfig.json       # Typecheck API only
cd apps/web && npx next build                    # Build web only
```

### Testing
```bash
turbo test                                       # Run all tests
cd apps/api && npx vitest run                    # Run all API tests
cd apps/api && npx vitest run tests/auth.test.ts # Run single test file
cd apps/api && npx vitest --watch                # Watch mode
cd apps/web && npx playwright test               # E2E tests (requires Playwright installed)
```

### Database
```bash
npm run db:migrate                               # Run Prisma migrations
npm run db:seed                                  # Seed data
npm run db:generate                              # Regenerate Prisma client
```

## Architecture

### Monorepo Layout
- **`apps/api`** — Express REST API. Routes mount at `/api/*`. Uses Pino logging, JWT auth (access 15min + refresh 7d rotation), Zod validation middleware, rate limiting.
- **`apps/web`** — Next.js 15 (App Router). Uses TanStack Query for data fetching, Tailwind CSS, Recharts. Auth tokens: access in memory, refresh in localStorage.
- **`apps/mobile`** — React Native (Expo) with React Navigation. Screens mirror web pages.
- **`packages/shared`** — Zod schemas, inferred TypeScript types, constants. Single source of truth for validation on both API and frontend.
- **`packages/db`** — Prisma schema, migrations, seed script, singleton client export.
- **`packages/ui`** — Shared React components (Button, Card, Input, Spinner).

### Request Flow (API)
`Request → CORS → JSON parser → Pino logger → Rate limiter → Route → [authenticate middleware] → [validate(zodSchema) middleware] → Controller logic in route handler → Service layer → Prisma → Response`

Error handling: throw `AppError(statusCode, code, message)` from services; caught by `errorHandler` middleware which returns `{ error: { code, message, details? } }`.

### Data Flow (Web)
Pages are `"use client"` components inside Next.js App Router route groups: `(auth)` for login/signup, `(dashboard)` for authenticated pages. Each page uses TanStack Query hooks from `src/hooks/` which call `apiClient` from `src/lib/api-client.ts`. The API client handles auto-refresh of expired tokens.

### Key Patterns
- **Services return plain objects** with `amount: Number(prismaDecimal)` conversion (Prisma returns Decimal, API returns number).
- **Tags use many-to-many** relations on both Expense and Income. `resolveTags()` in tag.service handles creating new tags inline during expense/income creation.
- **Currency is per-user** (set at signup, changeable in sidebar). `formatCurrency()` reads from localStorage and uses `Intl.NumberFormat` with the user's currency code.
- **Budget alerts** are calculated on-read (not stored), by comparing aggregated expenses against budget amount for the month.
- **Global search** (`/api/search`) searches across expense descriptions, income sources, category names, and tag names using Prisma `contains` with case-insensitive mode.

### Environment Variables
```
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Access token signing key (min 10 chars)
JWT_REFRESH_SECRET    # Refresh token signing key (min 10 chars)
CORS_ORIGIN           # Allowed origin (default: http://localhost:3000)
LOG_LEVEL             # silent|fatal|error|warn|info|debug|trace
PORT                  # API port (default: 4000)
NODE_ENV              # development|production|test
```

### Database Models
User, Expense, Income, Category, RefreshToken, Budget, RecurringExpense, Account, Notification, Tag. Expenses and Incomes have many-to-many with Tags. All monetary fields use `Decimal(12,2)`. UUIDs for all IDs. Composite indexes on `(userId, date)` for query performance.

### Web Route Groups
- `(auth)/` — login, signup, forgot-password (public, no sidebar)
- `(dashboard)/` — all authenticated pages with sidebar layout, top search bar (Ctrl+K), and `TopLoader` progress bar

### API Test Setup
Tests use Vitest with mocked Prisma (`vi.mock("@expense-app/db")`). Test env vars are set in `tests/setup.ts`. Use `createTestToken()` from `tests/helpers.ts` to generate auth tokens for testing protected routes.
