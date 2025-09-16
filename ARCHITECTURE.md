# Football Predictions App - Current Architecture

> **Status**: Early development phase with solid foundations established  
> **Last Updated**: September 15, 2025

## 🏗️ Current Tech Stack Implementation

### **Core Framework & Runtime**
- **Next.js 15.5.2**: App Router with Turbopack enabled
- **React 19.1.0**: Latest stable with concurrent features
- **TypeScript**: Full type safety across the codebase
- **Node.js**: Runtime environment

### **Database & ORM**
- **Prisma 6.15.0**: Database ORM with type generation
- **SQLite**: Local development database (`dev.db`)
- **TursoDb Ready**: Edge SQLite database for production (configured but not deployed)
- **@libsql/client**: TursoDb client adapter
- **@prisma/adapter-libsql**: Prisma-TursoDb integration

### **API & Data Layer**
- **tRPC 11.5.0**: End-to-end type-safe APIs
- **@tanstack/react-query**: Server state management and caching
- **Superjson**: JSON serialization for complex data types
- **Zod**: Runtime type validation and schema validation

### **Authentication & Authorization**
- **NextAuth.js 5.0.0-beta.29**: Authentication framework
- **@auth/prisma-adapter**: Database session management
- **bcryptjs**: Password hashing
- **Google OAuth**: Social authentication
- **Credentials Provider**: Email/password authentication

### **UI Components & Styling**
- **Radix UI**: Headless component library
- **Tailwind CSS 4.1.12**: Utility-first styling
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Shadcn/ui**: Pre-built component system

### **Forms & Validation**
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Validation resolver
- **Zod**: Schema validation

### **Development Tools**
- **ESLint**: Code linting
- **Prettier**: Code formatting (implied)
- **PostCSS**: CSS processing

## 📁 Current Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (app)/                     # Public app routes group
│   │   ├── (public)/             # Public pages
│   │   │   ├── article/          # Article pages
│   │   │   └── page.tsx          # Public homepage
│   │   ├── predictions/          # Public predictions
│   │   └── layout.tsx            # App layout
│   ├── (cms)/                     # CMS routes group
│   │   └── dashboard/            # Admin dashboard
│   │       ├── predictions/      # Prediction management
│   │       │   ├── [predictionId]/edit/
│   │       │   └── new/
│   │       └── page.tsx          # Dashboard home
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   └── trpc/[trpc]/          # tRPC API endpoint
│   ├── AuthProvider.tsx          # Auth context provider
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # Reusable UI components
│   ├── ui/                      # Shadcn/ui components
│   └── icons/                   # Icon components
├── features/                    # Domain-specific features
│   ├── auth/                   # Authentication features
│   ├── articles/               # Article management
│   ├── matches/                # Match management
│   ├── predictions/            # Prediction management
│   └── user/                   # User management
├── lib/                        # Utility libraries
│   ├── trpc/                   # tRPC configuration
│   │   ├── Provider.tsx        # Client provider
│   │   ├── client.ts           # Client configuration
│   │   ├── root.ts             # Router definition
│   │   ├── server.ts           # Server procedures
│   │   └── types.ts            # Type definitions
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client
├── styles/                     # Additional styles
└── types/                      # TypeScript type definitions
    └── next-auth.d.ts          # NextAuth type extensions
```

## 🗄️ Database Schema (Current State)

### **Core Entities Implemented**

#### **Users & Authentication**
```sql
User {
  id: String (CUID)
  email: String (unique)
  name: String?
  image: String?
  role: UserRole (USER|ADMIN|EDITOR)
  passwordHash: String?
  // NextAuth fields
  emailVerified: DateTime?
  createdAt: DateTime
  lastSeenAt: DateTime?
}

Account, Session, VerificationToken (NextAuth standard tables)
```

#### **Football Data Models**
```sql
League {
  id: String (CUID)
  name: String
  country: String?
  slug: String (unique)
  externalId: String?
  tier: Int?
}

Team {
  id: String (CUID)
  name: String
  shortName: String?
  slug: String (unique)
  crestUrl: String?
  externalId: String?
  leagueId: String?
}

Match {
  id: String (CUID)
  externalMatchId: String?
  homeTeamId: String
  awayTeamId: String
  leagueId: String?
  kickoffAt: DateTime
  status: String
  scoreHome: Int?
  scoreAway: Int?
  oddsJson: Json?
}
```

#### **Content Models**
```sql
Prediction {
  id: String (CUID)
  title: String
  slug: String (unique)
  authorId: String
  matchId: String
  type: PredictionType (ONE_X_TWO|OVER_UNDER|BTTS|HT_FT|CUSTOM)
  value: String
  confidence: Int (1-10)
  isPremium: Boolean
  publishStatus: PublishStatus (DRAFT|PUBLISHED|ARCHIVED)
  publishedAt: DateTime?
  content: Json
  historicalResult: String?
}

Article {
  id: String (CUID)
  title: String
  slug: String (unique)
  authorId: String
  content: Json
  featuredImageId: String?
  publishStatus: PublishStatus
  publishedAt: DateTime?
}

Tag, Media (supporting models)
```

#### **Business Models**
```sql
Subscription, Payment, AdPlacement, AuditLog
```

## 🔐 Authentication & Authorization

### **Current Implementation**

#### **Providers Configured**
1. **Google OAuth**: Full social authentication
2. **Credentials**: Email/password with bcrypt hashing

#### **Session Management**
- **Strategy**: JWT-based sessions
- **Adapter**: Prisma adapter for database persistence
- **Security**: Proper token handling and user role injection

#### **Role-Based Access Control**
```typescript
enum UserRole {
  USER    // Regular users
  ADMIN   // Full access
  EDITOR  // Content management access
}
```

#### **tRPC Procedures**
- **publicProcedure**: No authentication required
- **protectedProcedure**: Requires valid session
- **adminProcedure**: Requires ADMIN or EDITOR role

## 🚀 API Architecture

### **tRPC Implementation**

#### **Router Structure**
```typescript
appRouter {
  predictions: predictionRouter
  matches: matchRouter
  // More routers will be added
}
```

#### **Prediction Router (Implemented)**
- `create`: Admin-only prediction creation
- `list`: Admin-only prediction listing with relations
- `getById`: Get single prediction with match data
- `update`: Admin-only prediction updates
- `delete`: Admin-only prediction deletion

#### **Security Features**
- **Input Validation**: Zod schemas for all inputs
- **Error Handling**: Structured error responses with Zod integration
- **Authorization**: Role-based middleware protection
- **Type Safety**: End-to-end TypeScript type inference

### **Missing Global Prisma Import**
⚠️ **CRITICAL ISSUE IDENTIFIED**: The prediction router has `prisma?` calls but doesn't import the prisma client. This needs immediate fixing.

## 🎨 UI/UX Implementation

### **Component Architecture**
- **Shadcn/ui**: Production-ready component library
- **Radix UI**: Accessible headless components
- **Tailwind CSS**: Utility-first styling system

### **Current Pages**
1. **Dashboard** (`/dashboard`): Admin prediction management table
2. **Prediction Forms**: Create/edit prediction forms
3. **Public Homepage**: Basic structure in place
4. **Article Pages**: Structure defined but not implemented

### **Missing UI Elements**
- Public prediction display pages
- Article listing and reading interface
- Match display components
- User profile/settings pages

## 🔄 State Management

### **Server State**
- **React Query**: Automatic caching and synchronization via tRPC
- **Optimistic Updates**: Not yet implemented
- **Background Refetching**: Built into React Query

### **Client State**
- **React State**: Local component state
- **Form State**: React Hook Form
- **Global State**: Not yet needed, handled via server state

## 📊 Current Features Status

### ✅ **Implemented**
- [x] Database schema design
- [x] Authentication (Google OAuth + Credentials)
- [x] Admin dashboard with prediction listing
- [x] Prediction CRUD operations (tRPC API)
- [x] Role-based access control
- [x] Basic UI components (Shadcn/ui setup)
- [x] Form validation (Zod schemas)
- [x] TypeScript configuration
- [x] Development environment setup

### 🚧 **Partially Implemented**
- [ ] Public prediction display (structure exists, not implemented)
- [ ] Article management system (schema exists, no CRUD)
- [ ] Match data integration (schema exists, no API)
- [ ] Media management system (schema exists, no implementation)

### ❌ **Not Implemented**
- [ ] Public-facing prediction pages
- [ ] Article/news CMS and display
- [ ] Match data fetching from external APIs
- [ ] Search functionality
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing suite
- [ ] Deployment pipeline
- [ ] Production database (TursoDb) setup
- [ ] Caching strategies
- [ ] Image optimization
- [ ] Progressive Web App features

## 🔧 Configuration Files

### **Key Configurations**
- **Next.js**: `next.config.ts` (basic setup with Turbopack)
- **TypeScript**: `tsconfig.json` (standard configuration)
- **Tailwind**: `tailwind.config.js` (implied, using Tailwind 4)
- **PostCSS**: `postcss.config.mjs` (basic setup)
- **ESLint**: `eslint.config.mjs` (Next.js configuration)
- **Prisma**: `prisma/schema.prisma` (comprehensive schema)

### **Environment Variables**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<needs-secure-random-string>
DATABASE_URL=file:./dev.db
GOOGLE_CLIENT_ID=<needs-google-oauth-setup>
GOOGLE_CLIENT_SECRET=<needs-google-oauth-setup>
```

## 🚨 Critical Issues Identified

### **High Priority**
1. **Missing Prisma Import**: Prediction router doesn't import prisma client
2. **Environment Secrets**: Production secrets need to be generated
3. **TursoDb Connection**: Production database not configured
4. **Public API Endpoints**: No public tRPC procedures for frontend

### **Medium Priority**
1. **Error Boundaries**: No React error boundaries implemented
2. **Loading States**: No loading UI patterns established
3. **SEO Meta Tags**: Basic meta tags only
4. **Mobile Responsiveness**: Not thoroughly tested

### **Low Priority**
1. **Code Splitting**: Basic Next.js splitting only
2. **Bundle Analysis**: No bundle size monitoring
3. **Performance Monitoring**: No performance tracking
4. **Accessibility**: Basic Radix accessibility only

## 🎯 Architecture Strengths

### **What's Done Right**
1. **Type Safety**: Full TypeScript integration with tRPC
2. **Database Design**: Comprehensive, well-structured schema
3. **Authentication**: Robust NextAuth.js setup with multiple providers
4. **Component Architecture**: Clean separation with Shadcn/ui
5. **Development Experience**: Excellent DX with type inference
6. **Scalability Preparation**: Database relationships designed for growth
7. **Security Foundation**: Role-based access control implemented

### **Production Readiness Score: 3/10**
- ✅ Database schema design
- ✅ Authentication system
- ✅ Type safety
- ❌ Public-facing features
- ❌ Performance optimization
- ❌ SEO implementation
- ❌ Testing suite
- ❌ Production deployment ready
- ❌ Comprehensive error handling
- ❌ Monitoring and logging