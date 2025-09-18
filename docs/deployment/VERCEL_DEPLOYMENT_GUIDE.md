# CA Lobby Next.js - Comprehensive Vercel Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Vercel Project Setup](#2-vercel-project-setup)
3. [Environment Configuration](#3-environment-configuration)
4. [Build and Deployment Process](#4-build-and-deployment-process)
5. [Performance Optimization](#5-performance-optimization)
6. [Monitoring and Maintenance](#6-monitoring-and-maintenance)
7. [Advanced Vercel Features](#7-advanced-vercel-features)
8. [Troubleshooting Guide](#8-troubleshooting-guide)
9. [Post-Deployment Validation](#9-post-deployment-validation)

---

## 1. Pre-Deployment Checklist

### 1.1 Environment Variables Setup and Validation

**Critical Environment Variables Required:**
```bash
# Verify these are set in your local .env and will be configured in Vercel
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
CLERK_SECRET_KEY=sk_live_your_secret_here
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
BIGQUERY_DATASET=ca_lobby_data
```

**Validation Commands:**
```bash
# Check if all required environment variables are present
cd ca-lobby-nextjs
npm run type-check
npm run build

# Test BigQuery connection locally
node -e "
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
});
bigquery.query('SELECT 1 as test').then(console.log).catch(console.error);
"
```

### 1.2 Build Configuration Verification

**package.json Review:**
- ✅ Node.js version locked to 18.x (engines field)
- ✅ All dependencies properly defined
- ✅ Build scripts configured correctly

**Critical Dependencies:**
- `@google-cloud/bigquery`: BigQuery integration
- `@clerk/nextjs`: Authentication system
- `@vercel/analytics`, `@vercel/speed-insights`: Monitoring
- `@vercel/edge-config`, `@vercel/kv`: Vercel services

### 1.3 Dependencies and Package.json Review

```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "build": "next build",
    "type-check": "tsc --noEmit"
  }
}
```

**Security Check:**
```bash
# Audit dependencies for vulnerabilities
npm audit
npm audit fix

# Check for outdated packages
npm outdated
```

### 1.4 Security and Performance Optimizations

**Pre-deployment Security Checklist:**
- [ ] All API keys use environment variables
- [ ] No hardcoded secrets in code
- [ ] CORS headers properly configured
- [ ] Security headers implemented (see vercel.json)
- [ ] Rate limiting configured for API routes

---

## 2. Vercel Project Setup

### 2.1 Account Setup and Team Configuration

**Step 1: Create/Access Vercel Account**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

**Step 2: Team Setup (if applicable)**
- Navigate to https://vercel.com/teams
- Create or join the appropriate team
- Ensure proper role assignments

### 2.2 Project Import and Git Integration

**Option 1: Deploy via Vercel CLI**
```bash
cd /path/to/ca-lobby-nextjs
vercel

# Follow the prompts:
# ? Set up and deploy "~/ca-lobby-nextjs"? [Y/n] Y
# ? Which scope do you want to deploy to? [Use arrows to move]
# ? Link to existing project? [y/N] N
# ? What's your project's name? ca-lobby-nextjs
# ? In which directory is your code located? ./
```

**Option 2: Deploy via GitHub Integration**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings
4. Deploy

### 2.3 Framework Detection and Build Settings

**Automatic Detection:**
Vercel will automatically detect:
- Framework: Next.js 14.2.3
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Manual Configuration (if needed):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev"
}
```

### 2.4 Custom Domain Configuration

**Step 1: Add Domain in Vercel Dashboard**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `ca-lobby.yourdomain.com`)
3. Configure DNS records as instructed

**Step 2: SSL Certificate**
- Vercel automatically provisions SSL certificates
- No additional configuration needed

---

## 3. Environment Configuration

### 3.1 Production Environment Variables Setup

**In Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development

**Critical Variables:**
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_KEY=your_jwt_key

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# BigQuery Configuration
BIGQUERY_DATASET=ca_lobby_data
BIGQUERY_TABLE_PREFIX=prod_
BIGQUERY_LOCATION=US
BIGQUERY_MAX_RESULTS=10000

# Application URLs
NEXT_PUBLIC_APP_URL=https://ca-lobby.vercel.app
NEXTAUTH_URL=https://ca-lobby.vercel.app

# Vercel Services
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
EDGE_CONFIG=https://edge-config.vercel.com/...

# Security
ENCRYPTION_KEY=your-32-character-key
NEXTAUTH_SECRET=your-jwt-signing-key
```

### 3.2 Staging/Preview Environment Configuration

**Preview Environment Variables:**
```bash
NEXT_PUBLIC_APP_URL=https://ca-lobby-git-preview.vercel.app
BIGQUERY_TABLE_PREFIX=preview_
NODE_ENV=development
LOG_LEVEL=debug
```

### 3.3 Secret Management Best Practices

**Security Guidelines:**
- Use Vercel's encrypted environment variables
- Rotate secrets regularly
- Never commit secrets to version control
- Use different keys for different environments

**Environment Variable Hierarchy:**
1. Production (live traffic)
2. Preview (branch deployments)
3. Development (local development)

---

## 4. Build and Deployment Process

### 4.1 Build Command Optimization

**Current Build Configuration:**
```json
{
  "buildStep": {
    "commands": [
      "echo 'Starting CA Lobby build process...'",
      "npm ci",
      "npm run type-check",
      "npm run build",
      "echo 'Build completed successfully!'"
    ]
  }
}
```

**Build Performance Optimization:**
```bash
# Enable Next.js build caching
export NEXT_TELEMETRY_DISABLED=1

# Use npm ci for faster, reliable builds
npm ci --prefer-offline --no-audit
```

### 4.2 Function Configuration for BigQuery Routes

**Serverless Functions Configuration (vercel.json):**
```json
{
  "functions": {
    "app/api/bigquery/*/route.js": {
      "maxDuration": 30,
      "memory": 1024
    },
    "app/api/health/route.js": {
      "maxDuration": 10,
      "memory": 512
    },
    "app/api/auth/*/route.js": {
      "maxDuration": 15,
      "memory": 512
    }
  }
}
```

**BigQuery Connection Optimization:**
```javascript
// Optimize BigQuery client initialization
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
  maxRetries: 3,
  autoRetry: true,
});
```

### 4.3 Edge Function Setup

**Use Cases for Edge Functions:**
- Authentication middleware
- Feature flag evaluation
- Request routing based on geography
- Rate limiting

**Example Edge Function:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('clerk-session')

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

### 4.4 Deployment Protection Strategies

**Branch Protection:**
```json
{
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  }
}
```

**Deployment Hooks:**
```bash
# Set up deployment notifications
curl -X POST https://api.vercel.com/v1/integrations/webhooks \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"url": "https://your-webhook-endpoint.com/vercel"}'
```

---

## 5. Performance Optimization

### 5.1 Vercel Analytics Setup

**Installation:**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Integration (app/layout.tsx):**
```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 5.2 Speed Insights Configuration

**Core Web Vitals Monitoring:**
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

**Custom Performance Tracking:**
```typescript
import { track } from '@vercel/analytics'

// Track custom performance events
track('page_load', {
  page: '/dashboard',
  loadTime: performance.now()
})
```

### 5.3 Caching Strategies Implementation

**Static Asset Caching:**
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**API Response Caching:**
```typescript
// app/api/bigquery/query/route.ts
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  })
}
```

### 5.4 CDN Optimization

**Image Optimization:**
```typescript
import Image from 'next/image'

// Automatic optimization with next/image
<Image
  src="/dashboard-hero.jpg"
  alt="CA Lobby Dashboard"
  width={1200}
  height={600}
  priority
  placeholder="blur"
/>
```

**Bundle Optimization:**
```bash
# Analyze bundle size
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

---

## 6. Monitoring and Maintenance

### 6.1 Health Check Endpoints Setup

**Health Check Implementation:**
```typescript
// app/api/health/route.ts - Already implemented
// Provides comprehensive health monitoring for:
// - API status
// - BigQuery connection
// - Vercel KV connection
// - Edge Config connection
// - System metrics
```

**Health Check Usage:**
```bash
# Basic health check
curl https://ca-lobby.vercel.app/api/health

# Detailed health check
curl "https://ca-lobby.vercel.app/api/health?detailed=true&metrics=true"

# Quick health check (HEAD request)
curl -I https://ca-lobby.vercel.app/api/health
```

### 6.2 Error Monitoring and Alerting

**Error Tracking Setup:**
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure Sentry
# sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

**Vercel Function Logs:**
```bash
# View function logs
vercel logs https://ca-lobby.vercel.app --follow

# Filter logs by function
vercel logs https://ca-lobby.vercel.app --filter="api/bigquery"
```

### 6.3 Performance Monitoring

**Real User Monitoring:**
- Automatic via Vercel Speed Insights
- Core Web Vitals tracking
- Performance regression alerts

**Custom Metrics:**
```typescript
// Track BigQuery performance
const startTime = Date.now()
const results = await bigquery.query(sql)
const queryTime = Date.now() - startTime

// Log performance metrics
console.log(`BigQuery query took ${queryTime}ms`)
```

### 6.4 Cost Optimization Strategies

**Function Cost Optimization:**
- Use Edge Runtime for simple operations
- Implement connection pooling for BigQuery
- Cache frequently accessed data in Vercel KV
- Optimize bundle sizes to reduce cold starts

**Bandwidth Optimization:**
- Use next/image for automatic optimization
- Implement proper caching headers
- Enable compression (already configured)

---

## 7. Advanced Vercel Features

### 7.1 Edge Config for Feature Flags

**Setup Edge Config:**
```bash
# Create Edge Config via Vercel CLI
vercel edge-config create --name="ca-lobby-config"
```

**Usage in Application:**
```typescript
import { get } from '@vercel/edge-config'

export async function getFeatureFlag(key: string) {
  return await get(key)
}

// Usage in component
const enableNewDashboard = await getFeatureFlag('newDashboard')
```

### 7.2 Vercel KV Setup for Caching

**Setup Vercel KV:**
```bash
# Create KV database via Vercel CLI
vercel kv create --name="ca-lobby-cache"
```

**Implementation:**
```typescript
import { kv } from '@vercel/kv'

// Cache BigQuery results
export async function getCachedQuery(key: string, query: () => Promise<any>) {
  const cached = await kv.get(key)
  if (cached) return cached

  const result = await query()
  await kv.setex(key, 3600, result) // Cache for 1 hour
  return result
}
```

### 7.3 Cron Jobs Configuration

**Scheduled Functions (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/data-sync",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cache-cleanup",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/health-check",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 7.4 Custom Headers and Redirects

**Security Headers (already configured):**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 8. Troubleshooting Guide

### 8.1 Common Deployment Issues and Solutions

**Build Failures:**

*Issue: "Module not found" errors*
```bash
# Solution: Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

*Issue: BigQuery connection fails*
```bash
# Check environment variables
echo $GOOGLE_CLOUD_PROJECT_ID
echo $GOOGLE_SERVICE_ACCOUNT_KEY | jq .

# Test connection locally
node -e "console.log(require('@google-cloud/bigquery'))"
```

**Runtime Errors:**

*Issue: Function timeout*
- Increase `maxDuration` in vercel.json
- Optimize database queries
- Implement caching

*Issue: Memory limit exceeded*
- Increase `memory` allocation in vercel.json
- Optimize data processing
- Use streaming for large datasets

### 8.2 Performance Troubleshooting

**Slow Page Loads:**
1. Check Core Web Vitals in Speed Insights
2. Analyze bundle size with @next/bundle-analyzer
3. Review caching strategies
4. Optimize images and assets

**High Function Costs:**
1. Review function invocation patterns
2. Implement caching with Vercel KV
3. Optimize query efficiency
4. Use Edge Runtime where possible

### 8.3 Security Best Practices Validation

**Security Checklist:**
- [ ] All environment variables properly secured
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all API routes
- [ ] Authentication properly implemented

### 8.4 Rollback Procedures

**Instant Rollback:**
```bash
# Via Vercel CLI
vercel rollback https://ca-lobby.vercel.app --timeout 30s

# Via Vercel Dashboard
# Go to Deployments → Click on previous deployment → Promote to Production
```

**Rollback Best Practices:**
- Always test rollback in preview environment first
- Document rollback procedures
- Have monitoring in place to detect issues quickly
- Maintain deployment history

---

## 9. Post-Deployment Validation

### 9.1 Functionality Testing Checklist

**Core Application Functions:**
- [ ] Homepage loads correctly
- [ ] Authentication (sign in/sign up) works
- [ ] Dashboard displays data from BigQuery
- [ ] API routes respond correctly
- [ ] Health check endpoint returns 200 OK

**Testing Commands:**
```bash
# Test health endpoint
curl https://ca-lobby.vercel.app/api/health

# Test BigQuery integration
curl -H "Authorization: Bearer $CLERK_TOKEN" \
  https://ca-lobby.vercel.app/api/bigquery/query

# Test authentication flow
curl -I https://ca-lobby.vercel.app/dashboard
```

### 9.2 Performance Validation

**Performance Metrics:**
- Page load time < 2s
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

**Validation Tools:**
- Vercel Speed Insights
- Google PageSpeed Insights
- GTmetrix
- Lighthouse CI

### 9.3 Security Audit Steps

**Security Validation:**
```bash
# Check security headers
curl -I https://ca-lobby.vercel.app/api/health

# Verify SSL certificate
curl -vI https://ca-lobby.vercel.app

# Test CORS configuration
curl -H "Origin: https://malicious-site.com" \
  https://ca-lobby.vercel.app/api/bigquery/query
```

### 9.4 User Acceptance Testing Guidance

**UAT Checklist:**
1. **Authentication Flow**
   - Sign up with new account
   - Sign in with existing account
   - Password reset functionality

2. **Dashboard Functionality**
   - Data visualization renders correctly
   - Filters and search work properly
   - Export functionality operates as expected

3. **Data Accuracy**
   - Verify data matches source systems
   - Test real-time updates
   - Confirm calculations are correct

4. **Mobile Responsiveness**
   - Test on various device sizes
   - Verify touch interactions
   - Check mobile-specific features

---

## Quick Deployment Commands

```bash
# Deploy to Vercel
cd ca-lobby-nextjs
vercel --prod

# Deploy with environment variables
vercel --prod --env NEXT_PUBLIC_APP_URL=https://ca-lobby.vercel.app

# Deploy specific branch
vercel --prod --branch main

# Check deployment status
vercel ls

# View deployment logs
vercel logs https://ca-lobby.vercel.app

# Scale functions (if needed)
vercel scale https://ca-lobby.vercel.app --min 1 --max 10
```

---

## Emergency Contacts and Resources

**Support Channels:**
- Vercel Support: https://vercel.com/support
- Next.js Documentation: https://nextjs.org/docs
- BigQuery Documentation: https://cloud.google.com/bigquery/docs
- Clerk Documentation: https://clerk.com/docs

**Emergency Procedures:**
1. Check deployment status: https://www.vercel-status.com/
2. Roll back to last known good deployment
3. Contact Vercel support if platform issues suspected
4. Enable maintenance mode if critical issues persist

---

*This deployment guide is tailored specifically for the CA Lobby Next.js application with BigQuery integration, Clerk authentication, and Vercel's advanced features. Update this document as the application evolves.*