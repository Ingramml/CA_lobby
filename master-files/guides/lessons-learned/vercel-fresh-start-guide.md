# Vercel Fresh Start Guide - Apply All Lessons Learned

*Step-by-step guide for deploying a new project to Vercel with all lessons learned applied*

## Pre-Project Setup

### Local Development Environment
```bash
# Configure git for case sensitivity
git config --global core.ignorecase false

# Install Vercel CLI
npm i -g vercel@latest

# Login to Vercel
vercel login
```

### Project Initialization Best Practices
```bash
# Create Next.js project with proper setup
npx create-next-app@latest my-project --typescript --tailwind --eslint --app

cd my-project

# Install essential dependencies
npm install @clerk/nextjs @google-cloud/bigquery

# Configure package.json scripts
```

## File Structure & Configuration

### 1. next.config.js (Production-Ready)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that need Node.js runtime
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/bigquery'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@google-cloud/**/*'],
    },
    // Enable instrumentation for better debugging
    instrumentationHook: true,
  },

  // NEVER ignore errors in production
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Optimize images and performance
  images: {
    domains: ['your-image-domains.com'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. vercel.json (Optimized)
```json
{
  "version": 2,
  "functions": {
    "app/api/*/route.js": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "nodejs18.x"
    },
    "app/api/bigquery/*/route.js": {
      "maxDuration": 60,
      "memory": 3008,
      "runtime": "nodejs18.x"
    }
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true"
    }
  }
}
```

### 3. middleware.ts (Modern Clerk Pattern)
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/api/protected(.*)'
]);

const isPublicApiRoute = createRouteMatcher([
  '/api/health',
  '/api/public(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // Skip auth for public API routes
  if (isPublicApiRoute(req)) return;

  // Protect specified routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

// CRITICAL: Use Node.js runtime for auth middleware
export const runtime = 'nodejs';

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 4. API Route Template (app/api/example/route.ts)
```typescript
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// CRITICAL: Force dynamic rendering
export const dynamic = 'force-dynamic';
// Use Node.js runtime for complex operations
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Direct auth call - no middleware wrapper
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Your API logic here
    const data = { message: 'Success', userId };

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 5. BigQuery Integration Template
```typescript
// app/lib/bigquery.ts
import { BigQuery } from '@google-cloud/bigquery';

let bigQueryClient: BigQuery | null = null;

export function getBigQueryClient() {
  if (!bigQueryClient) {
    // Handle credentials properly for Vercel
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64
      ? JSON.parse(
          Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64, 'base64').toString()
        )
      : undefined;

    bigQueryClient = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials,
    });
  }

  return bigQueryClient;
}
```

## Environment Variables Setup

### Local Development (.env.local)
```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CREDENTIALS_BASE64=base64-encoded-service-account

# Database
DATABASE_URL=postgresql://...

# Other APIs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Environment Variables
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add GOOGLE_CLOUD_PROJECT_ID production
vercel env add GOOGLE_CLOUD_CREDENTIALS_BASE64 production

# Set preview environment variables (same values)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview
vercel env add CLERK_SECRET_KEY preview
vercel env add GOOGLE_CLOUD_PROJECT_ID preview
vercel env add GOOGLE_CLOUD_CREDENTIALS_BASE64 preview
```

## Deployment Process

### Step 1: Local Validation
```bash
# Clean install and build
rm -rf .next node_modules
npm ci
npm run build

# Verify no case sensitivity issues
npm run build 2>&1 | grep -i "module not found"

# Test with Vercel CLI
vercel build
vercel dev --prod
```

### Step 2: First Deployment
```bash
# Initialize Vercel project
vercel

# Deploy to preview first
vercel deploy

# Test thoroughly in preview environment
# Check all functionality works

# Deploy to production only after preview validation
vercel deploy --prod
```

### Step 3: Monitoring Setup
```bash
# Enable Vercel Analytics
npm install @vercel/analytics

# Add to root layout
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Component Architecture Guidelines

### Server Components (Default)
```typescript
// app/dashboard/page.tsx
// No "use client" directive = Server Component

export default async function DashboardPage() {
  // Can use server-side data fetching
  const data = await fetchServerData();

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Static content renders on server */}
    </div>
  );
}
```

### Client Components (When Needed)
```typescript
// app/components/InteractiveChart.tsx
"use client";

import { useState, useEffect } from 'react';

export default function InteractiveChart() {
  const [data, setData] = useState([]);

  // Client-side interactivity
  useEffect(() => {
    // Fetch data on client
  }, []);

  return <div>Interactive content</div>;
}
```

### Mixed Architecture (Server + Client)
```typescript
// app/dashboard/page.tsx (Server Component)
import { InteractiveChart } from '@/components/InteractiveChart';

export default async function DashboardPage() {
  // Server-side data fetching
  const serverData = await fetchData();

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Static content: {serverData.title}</div>
      {/* Client component embedded in server component */}
      <InteractiveChart data={serverData.chartData} />
    </div>
  );
}
```

## Testing Strategy

### Pre-Deployment Testing
```bash
# 1. Unit tests
npm run test

# 2. Type checking
npm run type-check

# 3. Linting
npm run lint

# 4. Build test
npm run build

# 5. Vercel simulation
vercel build

# 6. Preview deployment
vercel deploy
```

### Continuous Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Error Prevention Checklist

### Before Every Commit
- [ ] All imports use exact case matching file names
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All new API routes have proper auth checks
- [ ] Environment variables are properly configured

### Before Every Deployment
- [ ] Preview deployment tested thoroughly
- [ ] All functionality works in preview environment
- [ ] Database connections work in production
- [ ] Authentication flows complete successfully
- [ ] API routes return expected responses

### Monitoring Setup
- [ ] Error tracking configured (Sentry, LogRocket)
- [ ] Performance monitoring enabled (Vercel Analytics)
- [ ] Uptime monitoring configured
- [ ] Alerting set up for deployment failures

## Recovery Procedures

### When Deployment Fails
1. **Check logs immediately**:
   ```bash
   vercel logs --follow
   ```

2. **Roll back if needed**:
   ```bash
   vercel alias set [previous-working-deployment] [domain]
   ```

3. **Debug systematically**:
   - Compare with last working deployment
   - Test specific changes locally
   - Use git bisect to find breaking commit

### When Site is Down
1. **Immediate response**:
   ```bash
   # Check current status
   vercel ls

   # Get latest deployment logs
   vercel logs [deployment-id]

   # Roll back to last working version
   vercel alias set [known-good-deployment] [production-domain]
   ```

2. **Investigation**:
   - Check error tracking dashboard
   - Review recent deployments
   - Validate environment variables
   - Test in preview environment

## Success Metrics

### Performance Targets
- **Build Time**: < 3 minutes
- **Cold Start**: < 2 seconds for Node.js functions
- **Page Load**: < 2 seconds LCP
- **Error Rate**: < 0.1%

### Monitoring Dashboard
- Vercel Analytics for performance metrics
- Error tracking for runtime issues
- Uptime monitoring for availability
- Build status monitoring for CI/CD health

---

## Final Recommendations

1. **Start small**: Deploy minimal working app first, add features incrementally
2. **Test thoroughly**: Always test in preview before production
3. **Monitor actively**: Set up proper monitoring and alerting
4. **Document changes**: Keep deployment notes for troubleshooting
5. **Regular maintenance**: Update dependencies and review performance regularly

This guide incorporates all lessons learned from the CA Lobby project debugging session and provides a proven path to successful Vercel deployments.