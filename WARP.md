# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a football (soccer) predictions web application built with Next.js 15 and React 19. It's an enterprise-grade platform where admins post predictions via a CMS, and public users view them categorized by date (today, tomorrow, weekend, etc.). The app also includes a football news/articles section.

**Mission Critical**: This is NOT a toy project - it needs to be enterprise-grade from day one.

## Core Tech Stack

- **Frontend**: Next.js 15.5.2 (App Router + Turbopack), React 19.1.0, TypeScript
- **Database**: Prisma ORM + SQLite (dev) / TursoDb (production edge database)
- **API**: tRPC 11.5.0 for type-safe APIs
- **Authentication**: NextAuth.js 5.0 (Google OAuth + Credentials)
- **State Management**: @tanstack/react-query via tRPC
- **Styling**: Tailwind CSS 4.1.12 + Radix UI components + Shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Content**: Rich text editor (Tiptap implied from components)

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build with Turbopack  
npm start               # Start production server
npm run lint            # ESLint code quality check

# Database Management
npx prisma generate     # Generate Prisma client types
npx prisma db push      # Push schema changes to database
npx prisma db pull      # Pull schema changes from database
npx prisma studio       # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create and run migrations
npx prisma db seed      # Run database seeds (if configured)

# Single test commands (when testing is implemented)
# npm test               # Run all tests
# npm test -- --watch    # Run tests in watch mode
# npm test <file-pattern> # Run specific test files
```

## Architecture Overview

### High-Level Structure

This is a **feature-driven architecture** with clear separation between public and admin functionality:

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/(public)/    # Public-facing pages (predictions, articles)
│   ├── (cms)/dashboard/   # Admin CMS interface  
│   ├── api/               # API routes (NextAuth, tRPC)
├── features/              # Domain-specific business logic
│   ├── predictions/       # Core prediction management
│   ├── matches/           # Match data and results
│   ├── articles/          # News/articles CMS
│   ├── auth/              # Authentication logic
│   ├── teams/, leagues/   # Football data models
├── lib/                   # Shared utilities and configurations
│   ├── trpc/              # Type-safe API layer configuration
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Database client
├── components/            # Reusable UI components
│   └── ui/                # Shadcn/ui component library
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Each domain (predictions, matches, articles) has its own folder with router, schemas, and components
2. **Type-Safe API Layer**: tRPC provides end-to-end type safety from database to frontend
3. **Role-Based Access Control**: Three user roles (USER, ADMIN, EDITOR) with proper authorization middleware
4. **Server-Side Rendering**: Next.js App Router with server components for SEO and performance
5. **Progressive Enhancement**: Public pages work without JavaScript, CMS requires it

### Database Architecture

The database uses a comprehensive schema designed for scalability:

- **Core Models**: Users, Teams, Leagues, Matches, Predictions, Articles
- **Business Models**: Subscriptions, Payments (premium features)
- **Rich Relationships**: Proper foreign keys and indexes for performance
- **Audit Trail**: Created/updated timestamps, evaluation tracking
- **Enums**: Strongly-typed status fields (MatchStatus, PredictionResult, etc.)

### Authentication & Authorization

- **Multi-Provider Auth**: Google OAuth + email/password credentials
- **JWT Sessions**: Secure token-based authentication
- **Role-Based Access**: 
  - `publicProcedure`: No auth required (public predictions/articles)
  - `protectedProcedure`: Valid session required  
  - `adminProcedure`: ADMIN/EDITOR role required (CMS functionality)

### tRPC API Structure

```typescript
// Main router structure
appRouter {
  predictions: predictionRouter  // CRUD + public queries + result evaluation
  matches: matchRouter          // Match data + public display
  articles: articleRouter       // News CMS + public display  
  teams: teamRouter            // Team management
  leagues: leagueRouter        // League management
}
```

**Critical tRPC Patterns**:
- All inputs validated with Zod schemas
- Proper error handling with TRPCError
- Separate public/admin procedures for security
- Include relations in queries for performance

## Development Guidelines

### Code Architecture Principles

1. **Production-First Mindset**: Build it right the first time, avoid technical debt
2. **Type Safety Everywhere**: TypeScript + tRPC + Zod for runtime validation
3. **Security by Design**: Input validation, authorization checks, SQL injection prevention
4. **Performance-Oriented**: Proper indexing, caching strategies, optimized queries
5. **Maintainable Code**: Clear separation of concerns, SOLID principles

### Feature Development Workflow

1. **Database First**: Update Prisma schema with new models/fields
2. **API Layer**: Create tRPC procedures with Zod validation
3. **UI Components**: Build reusable components in `components/ui/`
4. **Feature Integration**: Implement in appropriate feature folder
5. **Testing**: Unit tests for business logic, integration tests for APIs

### Common Patterns

**Creating New Features**:
1. Add to `src/features/<feature>/` folder
2. Create `<feature>.router.ts` for tRPC procedures  
3. Create `<feature>.schema.ts` for Zod validation schemas
4. Add router to `src/lib/trpc/root.ts`
5. Build UI components and forms

**Database Changes**:
1. Update `prisma/schema.prisma` 
2. Run `npx prisma db push` (dev) or create migration (production)
3. Run `npx prisma generate` to update types
4. Update tRPC procedures to use new fields

**Adding Public Pages**:
- Place in `src/app/(app)/(public)/` 
- Use server components for SEO
- Call tRPC via server-side caller for data fetching
- Implement proper meta tags and structured data

**Adding Admin Features**:
- Place in `src/app/(cms)/dashboard/`
- Use `adminProcedure` for API calls
- Implement proper loading states and error handling
- Follow existing CMS patterns for consistency

**Datetime Input Handling**:
- Use utility functions from `src/lib/datetime-utils.ts` for datetime-local inputs
- `parseDateTimeLocal()` and `formatDateTimeLocal()` prevent timezone conversion
- Ensures exact date/time storage (e.g., "2025-01-02T14:00" stays exactly that)
- Required for match scheduling and any user-input dates

## Critical Issues & Considerations

### Current Status (Production Readiness: 3/10)

**✅ Implemented**:
- Complete database schema
- Authentication system  
- Admin dashboard with prediction CRUD
- Public prediction pages
- Type-safe API layer
- Form validation

**⚠️ Critical Issues**:
1. **Production Database**: TursoDb not configured for production
2. **Environment Secrets**: Missing production environment variables
3. **Testing**: No test suite implemented
4. **SEO**: Basic meta tags only, missing structured data
5. **Performance**: No caching, image optimization, or bundle analysis
6. **Monitoring**: No error tracking or performance monitoring

### Security Considerations

- All admin operations require proper role authorization
- Input validation with Zod schemas on all API endpoints
- SQL injection prevented by Prisma ORM
- XSS protection needed in content rendering
- Rate limiting not implemented (should be added)

### Performance Optimization

- Database queries include necessary relations to avoid N+1 problems
- Consider implementing React Query caching strategies
- Image optimization needed for team crests and logos
- Bundle splitting and lazy loading not fully implemented

## Senior Engineer Rules Integration

This project follows enterprise-grade standards as defined in `SENIOR_ENGINEER_RULES.md`:

- **Scalable**: Architecture supports growth to millions of users
- **Maintainable**: Clean code with comprehensive TypeScript coverage
- **Secure**: Role-based access control and input validation
- **Fast**: Built for performance with proper database design
- **Production-Ready**: Designed for real users from day one

When making changes, always consider the 10-step-ahead implications for scalability, security, and maintainability.