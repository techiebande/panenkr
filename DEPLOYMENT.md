# Production Deployment Guide

## Environment Variables for Vercel

Set these environment variables in your Vercel dashboard:

### Required Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-long-random-secret-here

# Database (Turso)
DATABASE_URL=libsql://your-turso-database-url?authToken=your-turso-token

# Production Environment
NODE_ENV=production

# Authentication (Google OAuth) - SET THESE IN VERCEL DASHBOARD
GOOGLE_CLIENT_ID=your-google-oauth-client-id-here
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret-here

# Football Data API
FD_API_TOKEN=your-football-data-api-token-here
```

### Optional Variables

```bash
# Payment Processing (when ready)
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn-url
REDIS_URL=your-redis-url
```

## Deployment Steps

1. **Push to GitHub** (secrets are now removed from files)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables from the list above
3. **Deploy**: Vercel will automatically build and deploy

## Database Setup

Your Turso database is already configured:
- **URL**: `panenkr-techiebande.aws-eu-west-1.turso.io`
- **Token**: Set in Vercel environment variables

## Security Notes

- ✅ All sensitive data is removed from git repository
- ✅ Environment variables are managed securely in Vercel
- ✅ CSP headers are configured for security
- ✅ NextAuth is configured with secure settings