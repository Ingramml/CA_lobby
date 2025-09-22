# Vercel Deployment Checklist - Quick Reference

*Use this checklist before every Vercel deployment to avoid common issues*

## Pre-Deployment Validation ✅

### File System & Imports
- [ ] All import statements match exact file name casing
- [ ] No missing files or broken import paths
- [ ] Git configured with `core.ignorecase false`
- [ ] Run local build: `npm run build` succeeds

### Environment Configuration
- [ ] All environment variables set in Vercel dashboard
- [ ] Service account credentials properly encoded (base64 for secrets)
- [ ] Database connection strings configured for production
- [ ] API keys and secrets verified in preview environment

### Runtime Configuration
- [ ] Node.js runtime specified for functions needing Node APIs
- [ ] Edge runtime only used for simple Web API functions
- [ ] Dynamic exports added: `export const dynamic = 'force-dynamic'`
- [ ] Proper middleware runtime: `export const runtime = 'nodejs'`

### Authentication Setup (Clerk/Auth0/etc)
- [ ] Latest auth library version installed
- [ ] Deprecated patterns replaced (authMiddleware → clerkMiddleware)
- [ ] Direct auth calls in API routes (no complex middleware wrappers)
- [ ] Protected routes properly configured

### Next.js Configuration
- [ ] External packages properly configured in `next.config.js`
- [ ] Build output tracing includes necessary dependencies
- [ ] TypeScript errors resolved (no build-time ignoring)
- [ ] ESLint warnings addressed

## Quick Fix Commands

### Local Testing
```bash
# Clean build test
rm -rf .next node_modules
npm ci
npm run build

# Vercel simulation
vercel build
vercel dev --prod
```

### Case Sensitivity Check
```bash
# Check for import casing issues
npm run build 2>&1 | grep -i "module not found"

# Fix git case sensitivity
git config core.ignorecase false
```

### Environment Validation
```bash
# Test environment variables locally
node -e "console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY?.slice(0,10))"
node -e "console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID)"
```

## Deployment Process

### Step 1: Validate Locally
```bash
vercel env pull .env.local  # Get production env vars
npm run build              # Ensure build success
```

### Step 2: Preview Deploy
```bash
vercel deploy             # Deploy to preview
# Test functionality thoroughly
```

### Step 3: Production Deploy
```bash
vercel deploy --prod      # Only after preview validation
```

## Emergency Debugging

### When Deployment Fails
1. **Get logs immediately**:
   ```bash
   vercel logs --follow
   ```

2. **Check specific deployment**:
   ```bash
   vercel inspect [deployment-url]
   ```

3. **Compare local vs production**:
   ```bash
   vercel build  # Should match npm run build output
   ```

### Common Error Patterns

**"Module not found"** → Check import casing and file existence
**"Dynamic server error"** → Add `export const dynamic = 'force-dynamic'`
**"Edge runtime incompatible"** → Switch to Node.js runtime
**"Client reference manifest missing"** → Fix server/client component separation

## Fresh Project Setup

### When Starting New Vercel Project
1. Use this template `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/bigquery'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@google-cloud/**/*'],
    },
  },
  typescript: {
    ignoreBuildErrors: false, // Always keep false for production
  },
  eslint: {
    ignoreDuringBuilds: false, // Always keep false for production
  },
};

module.exports = nextConfig;
```

2. Configure `vercel.json` for your needs:
```json
{
  "version": 2,
  "functions": {
    "app/api/*/route.js": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "nodejs18.x"
    }
  }
}
```

3. Set up proper middleware:
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const runtime = 'nodejs';
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

## Final Tips

- **Always test in preview before production**
- **Monitor deployments for 5-10 minutes after going live**
- **Keep build logs for troubleshooting**
- **Use Vercel Analytics to monitor performance**
- **Set up error tracking (Sentry, LogRocket, etc.)**

Remember: "Works locally" ≠ "Works on Vercel" due to environment differences!