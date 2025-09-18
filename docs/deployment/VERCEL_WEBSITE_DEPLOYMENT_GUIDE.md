# Deploy CA Lobby Next.js to Vercel via Web Interface - Step by Step Guide

This guide covers deploying the CA Lobby Next.js application using Vercel's web interface with mock data for proof of concept demonstration.

## Prerequisites
- GitHub repository with CA Lobby Next.js code
- Vercel account (free tier is sufficient)
- Mock data files properly configured
- Node.js 18+ for Next.js frontend
- Environment variables prepared

## Step-by-Step Deployment Instructions

### Step 1: Pre-Deployment Setup

**1.1 Verify Mock Data Configuration**

Before deploying, ensure your application is configured for mock data demonstration:

**Update `ca-lobby-nextjs/next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing configuration...
  env: {
    MOCK_DATA_MODE: 'true',
    DEMO_MODE: 'true',
  },
  // Enable static export for mock data
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
}

module.exports = nextConfig
```

**1.2 Confirm Mock Data Files**

Ensure all mock data files are present in your project:

```
mock-data/
├── README.md
├── lobbying_payments.json      ✅ 10 sample payment records
├── lobby_associations.json     ✅ 10 lobbying associations
├── quarterly_trends.json       ✅ 8 quarters of trend data
├── dashboard_summary.json      ✅ Real-time dashboard metrics
├── test_users.json            ✅ 6 test user accounts
└── data-generator.js          ✅ Dynamic data generator
```

**1.3 Verify Demo Data API Routes**

Confirm your API routes are configured to serve mock data:

```typescript
// ca-lobby-nextjs/app/api/demo-data/route.ts
import { NextResponse } from 'next/server'
import lobbyingPayments from '../../../../mock-data/lobbying_payments.json'
import dashboardSummary from '../../../../mock-data/dashboard_summary.json'
import quarterlyTrends from '../../../../mock-data/quarterly_trends.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dataType = searchParams.get('type')

  switch (dataType) {
    case 'payments':
      return NextResponse.json(lobbyingPayments)
    case 'dashboard':
      return NextResponse.json(dashboardSummary)
    case 'trends':
      return NextResponse.json(quarterlyTrends)
    default:
      return NextResponse.json({
        payments: lobbyingPayments,
        dashboard: dashboardSummary,
        trends: quarterlyTrends
      })
  }
}
```

### Step 2: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your Vercel account
3. Click the **"New Project"** button (or **"Add New..." → "Project"**)

### Step 3: Import Your GitHub Repository
1. **Connect GitHub Account** (if not already connected):
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

2. **Select Your Repository**:
   - Find your **CA_lobby-1** repository in the list
   - Click **"Import"** next to it

### Step 4: Configure Project Settings
1. **Project Configuration Screen**:
   - **Project Name**: `ca-lobby-nextjs` (or choose your preferred name)
   - **Framework Preset**: Select **"Next.js"** (auto-detected)
   - **Root Directory**: `ca-lobby-nextjs/`
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install`
     - Node.js Version: `18.x` (or latest LTS)

### Step 5: Set Environment Variables
Before deploying, click **"Environment Variables"** and add:

**Required Variables:**
| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_MOCK_DATA_MODE` | `true` | Production |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Production |
| `NEXT_PUBLIC_USE_REAL_BIGQUERY` | `false` | Production |
| `NEXT_PUBLIC_APP_NAME` | `CA Lobby Demo` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Production |

**Authentication Variables (Demo/Test Keys):**
| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_demo_key` | Production |
| `CLERK_SECRET_KEY` | `sk_test_demo_secret` | Production |

**Demo User Configuration:**
| Name | Value | Environment |
|------|-------|-------------|
| `DEMO_ADMIN_EMAIL` | `admin@calobby-demo.gov` | Production |
| `DEMO_ANALYST_EMAIL` | `analyst@calobby-demo.gov` | Production |
| `DEMO_VIEWER_EMAIL` | `viewer@calobby-demo.gov` | Production |

**Optional Variables:**
| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | `your_analytics_id` | Production |

**Environment Variable Setup:**
1. Click **"Add New"** for each variable
2. Enter **Name** and **Value**
3. Select **Environments**: Production ✅ Preview ✅ Development ✅
4. Click **"Save"**

**Bulk Setup Option:**
You can add multiple variables at once by clicking **"Bulk Add"** and pasting:
```
NEXT_PUBLIC_MOCK_DATA_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_USE_REAL_BIGQUERY=false
NEXT_PUBLIC_APP_NAME=CA Lobby Demo
```

### Step 6: Deploy
1. Click **"Deploy"** button
2. Wait for the build process (usually 2-3 minutes)
3. Vercel will show build logs in real-time

### Step 7: Access Your Live Demo
Once deployment is complete:
1. Vercel will provide a live URL like: `https://ca-lobby-nextjs-xxx.vercel.app`
2. Click the URL to view your live demo site
3. Test the functionality:
   - Dashboard should load with demo banner
   - Navigate to all sections with mock data
   - Test different user roles and permissions
   - Verify all features work with mock data

## Expected Results

**Live Application Features:**
- California Lobbying Transparency Dashboard with demo banner
- Advanced search interface with mock data filters
- Pre-built reports and data visualizations
- Mock data export functionality
- Responsive design for all devices
- Role-based authentication with test accounts

**API Endpoints:**
- All `/api/*` routes serving mock data
- Demo data endpoints with realistic content
- Authentication working with test users

## Sharing Your Application

Once deployed, you can share the Vercel URL with:
- Colleagues and stakeholders for feedback
- Potential users for demonstration
- As a portfolio piece showcasing capabilities
- For proof of concept presentations

## Mock Data Integration Details

### Data Provider Configuration

Create a data provider that serves mock data:

```typescript
// ca-lobby-nextjs/lib/data-provider.ts
const useMockData = process.env.NEXT_PUBLIC_MOCK_DATA_MODE === 'true'

export async function fetchLobbyingData(filters = {}) {
  if (useMockData) {
    const response = await fetch('/api/demo-data?type=payments')
    return response.json()
  }

  // Real BigQuery integration (for future use)
  return await fetchFromBigQuery(filters)
}

export async function fetchDashboardData() {
  if (useMockData) {
    const response = await fetch('/api/demo-data?type=dashboard')
    return response.json()
  }

  return await fetchRealDashboardData()
}

export async function fetchQuarterlyTrends() {
  if (useMockData) {
    const response = await fetch('/api/demo-data?type=trends')
    return response.json()
  }

  return await fetchRealTrendsData()
}
```

### Mock Data Banner Component

Add a demo mode indicator:

```typescript
// ca-lobby-nextjs/components/MockDataBanner.tsx
export function MockDataBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <InfoIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> This application is displaying mock data for demonstration purposes.
            All lobbying information shown is fictional and generated for proof of concept.
          </p>
        </div>
      </div>
    </div>
  )
}
```

### Layout Component Integration

```typescript
// ca-lobby-nextjs/app/layout.tsx
import { MockDataBanner } from '@/components/MockDataBanner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MockDataBanner />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Dashboard Configuration

### Dashboard Components with Mock Data

Modify dashboard components to use mock data:

```typescript
// ca-lobby-nextjs/app/(dashboard)/page.tsx
import { fetchDashboardData } from '@/lib/data-provider'

export default async function DashboardPage() {
  const dashboardData = await fetchDashboardData()

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Payments YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.overview.total_payments_ytd.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.overview.growth_rate_yoy}% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Lobbyists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_active_lobbyists}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered and active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_active_clients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.overview.total_associations}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories (Current Quarter)</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentAnalysisChart data={dashboardData.top_categories_current_quarter} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AssociationBreakdownChart data={dashboardData.geographic_distribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Test User Authentication Setup

Set up test user authentication with mock data:

```typescript
// ca-lobby-nextjs/lib/test-auth.ts
import testUsers from '../../mock-data/test_users.json'

export function getTestUserByEmail(email: string) {
  return testUsers.find(user => user.email === email)
}

export const TEST_USERS = {
  ADMIN: 'admin@calobby-demo.gov',
  ANALYST: 'analyst@calobby-demo.gov',
  DATA_MANAGER: 'datamanager@calobby-demo.gov',
  VIEWER: 'viewer@calobby-demo.gov'
}

// Demo login component
export function DemoLoginOptions() {
  return (
    <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Accounts</h3>
      <div className="space-y-2 text-xs">
        <p><strong>Admin:</strong> admin@calobby-demo.gov (Full Access)</p>
        <p><strong>Analyst:</strong> analyst@calobby-demo.gov (Analytics & Reports)</p>
        <p><strong>Data Manager:</strong> datamanager@calobby-demo.gov (Data Operations)</p>
        <p><strong>Viewer:</strong> viewer@calobby-demo.gov (Read Only)</p>
      </div>
    </div>
  )
}
```

## Troubleshooting

### 2025 Vercel Platform Notes
- Functions automatically scale with zero cold start
- Edge runtime available for improved performance
- Automatic HTTPS and CDN distribution
- Built-in analytics and monitoring

**If deployment fails:**
1. Check build logs in Vercel dashboard
2. Ensure all mock data files are present
3. Verify Node.js version compatibility (18+)
4. Check that package.json exists in ca-lobby-nextjs/
5. Confirm all dependencies are properly listed

**If site loads but mock data doesn't work:**
1. Check Function logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Confirm `/api/demo-data/*` routes are accessible
4. Check mock data files are properly imported
5. Validate demo mode environment variables

**Common 2025 Issues:**
- **Mock data not loading**: Check NEXT_PUBLIC_MOCK_DATA_MODE=true
- **Authentication issues**: Verify test user accounts and Clerk config
- **Chart rendering**: Ensure chart data structure matches mock data format
- **Build failures**: Check Next.js and dependencies versions

### Pre-Deployment Testing

Before deploying, test locally:

Before deploying, test locally:

```bash
# Start development server with mock data
cd ca-lobby-nextjs
NEXT_PUBLIC_MOCK_DATA_MODE=true npm run dev

# Test different scenarios
# 1. Visit http://localhost:3000 - Should show demo banner
# 2. Navigate to dashboard - Should display mock data charts
# 3. Test user roles - Should show appropriate permissions
# 4. Try data export - Should export mock data
```

### Deployment Testing Checklist

After deployment, verify:

- [ ] **Homepage loads** with demo banner
- [ ] **Dashboard displays** mock data visualizations
- [ ] **Authentication works** with test accounts
- [ ] **Charts render** with mock data
- [ ] **Data tables** show lobbying payment records
- [ ] **Search and filters** work with mock data
- [ ] **Export functionality** downloads mock data
- [ ] **Responsive design** works on mobile
- [ ] **Performance** meets targets (Speed Insights)
- [ ] **No console errors** in browser

### Demo Flow Testing

Test complete user journeys:

```markdown
**Admin Flow:**
1. Login as admin@calobby-demo.gov
2. View full dashboard with all metrics
3. Access user management section
4. Export data in multiple formats
5. View system health and analytics

**Analyst Flow:**
1. Login as analyst@calobby-demo.gov
2. View analytics dashboard
3. Create custom reports
4. Filter data by date ranges
5. Analyze trends and patterns

**Viewer Flow:**
1. Login as viewer@calobby-demo.gov
2. View read-only dashboard
3. Browse lobbying data tables
4. View public reports
5. Verify restricted access to admin features
```

## Updates and Redeployment

**For future updates:**
1. Make changes to your code locally
2. Test locally with `npm run dev` in ca-lobby-nextjs/
3. Commit and push to GitHub
4. Vercel will automatically redeploy from your mini_js branch
5. Use preview deployments for feature branches
6. Monitor deployment status in Vercel dashboard

**Performance Optimization (2025 Best Practices):**
- Enable Edge Functions for faster API responses
- Use Vercel Analytics for real-time monitoring
- Implement ISR (Incremental Static Regeneration) for dynamic data
- Leverage Vercel's Image Optimization for better performance
- Use Edge Config for global configuration management

## Demo Scenarios

### Stakeholder Demo Script

**Opening (2 minutes):**
- "This is the CA Lobby Dashboard - a comprehensive platform for California lobbying disclosure"
- "We're using realistic mock data covering 2020-2024 with $6.8M in total payments"
- Point out demo banner and explain data authenticity

**Dashboard Overview (3 minutes):**
- Show total payments YTD: $6,824,000
- Highlight 45 active lobbyists across 25 associations
- Demonstrate quarterly growth trends
- Show geographic distribution across California counties

**Data Visualization (4 minutes):**
- Navigate to lobbying data section
- Filter by category (Real Estate & Housing - $375K)
- Show payment trends over time
- Demonstrate search functionality
- Export sample data

**Role-Based Access (3 minutes):**
- Login as different user types
- Show Admin vs Analyst vs Viewer permissions
- Demonstrate restricted access controls
- Show audit trail capabilities

**Technical Features (3 minutes):**
- Show responsive design on mobile
- Demonstrate real-time updates
- Display system health metrics
- Show performance analytics

### Key Demo Data Points

**Impressive Statistics:**
- **$6.8M** total lobbying payments year-to-date
- **18.5%** year-over-year growth rate
- **234** active clients across all sectors
- **Real Estate & Housing** leading at $375K (17.5% of total)
- **Los Angeles County** highest activity ($487K)

**Compelling Stories:**
- Healthcare lobbying increased 15% focusing on Medicare expansion
- Technology sector actively lobbying AI regulation (SB 1001)
- Housing crisis driving 25% increase in real estate lobbying
- Environmental groups showing steady growth in climate advocacy

### Demo Troubleshooting

**Common Issues and Solutions:**

**Mock data not loading:**
```bash
# Check environment variable
echo $NEXT_PUBLIC_MOCK_DATA_MODE  # Should be 'true'

# Verify API endpoint
curl https://your-app.vercel.app/api/demo-data?type=dashboard
```

**Charts not rendering:**
- Check browser console for JavaScript errors
- Verify chart data structure matches expected format
- Ensure mock data files are properly imported

**Authentication issues:**
- Use test accounts from `test_users.json`
- Verify Clerk configuration with test keys
- Check demo mode is enabled

## Quick Deployment Checklist

### Pre-Deployment:
- [ ] Mock data files in place
- [ ] Demo mode environment variables prepared
- [ ] Local testing completed
- [ ] API routes updated for mock data
- [ ] Demo banner component added

### Vercel Dashboard Setup:
- [ ] GitHub repository connected
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Project name and framework selected

### Post-Deployment:
- [ ] Demo banner visible on homepage
- [ ] Dashboard loads with mock data
- [ ] All user roles tested
- [ ] Export functionality verified
- [ ] Mobile responsiveness confirmed
- [ ] Performance metrics acceptable

Your California Lobbying Transparency application will be live with enterprise-grade performance and realistic mock data for effective stakeholder demonstrations!