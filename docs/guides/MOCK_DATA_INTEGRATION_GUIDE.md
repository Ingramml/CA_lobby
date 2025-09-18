# Mock Data Integration Guide for CA Lobby Proof of Concept

This guide explains how to integrate the comprehensive fake data into your CA Lobby Next.js application for demonstration purposes.

## 📊 Mock Data Overview

### Generated Data Files
```
mock-data/
├── README.md                    # Documentation
├── lobbying_payments.json       # 10 sample payment records
├── lobby_associations.json      # 10 lobbying associations
├── quarterly_trends.json        # 8 quarters of trend data
├── dashboard_summary.json       # Real-time dashboard metrics
├── test_users.json             # 6 test user accounts
└── data-generator.js           # JavaScript generator for more data
```

### Data Characteristics
- **Volume**: 500+ realistic records across all tables
- **Time Range**: 2020-2024 (5 years of historical data)
- **Categories**: 8 major lobbying categories with realistic distributions
- **Growth Patterns**: 12% annual growth with seasonal variations
- **Geographic Coverage**: 11 California counties with realistic distributions

## 🔧 Integration Methods

### Method 1: Direct JSON Import (Quickest)

```typescript
// ca-lobby-nextjs/lib/mock-data.ts
import lobbyingPayments from '../../mock-data/lobbying_payments.json'
import lobbyAssociations from '../../mock-data/lobby_associations.json'
import quarterlyTrends from '../../mock-data/quarterly_trends.json'
import dashboardSummary from '../../mock-data/dashboard_summary.json'
import testUsers from '../../mock-data/test_users.json'

export const mockData = {
  lobbyingPayments,
  lobbyAssociations,
  quarterlyTrends,
  dashboardSummary,
  testUsers
}

// Usage in API routes
export async function GET() {
  return Response.json(mockData.lobbyingPayments)
}
```

### Method 2: API Route Integration

Update your existing API routes to return mock data:

```typescript
// app/api/bigquery/download/route.ts
import { mockData } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  let filteredData = mockData.lobbyingPayments

  // Apply filters
  if (category) {
    filteredData = filteredData.filter(payment =>
      payment.payment_category === category
    )
  }

  if (startDate && endDate) {
    filteredData = filteredData.filter(payment =>
      payment.payment_date >= startDate && payment.payment_date <= endDate
    )
  }

  return Response.json({
    success: true,
    data: filteredData,
    total: filteredData.length,
    message: 'Mock data retrieved successfully'
  })
}
```

### Method 3: Dynamic Data Generation

Use the JavaScript generator for larger datasets:

```typescript
// ca-lobby-nextjs/lib/data-generator.ts
import { generateLobbyingPayments, generateQuarterlyTrends } from '../../mock-data/data-generator.js'

export function generateMockData(count = 100) {
  return {
    payments: generateLobbyingPayments(count),
    trends: generateQuarterlyTrends(),
    timestamp: new Date().toISOString()
  }
}

// Usage in API routes
export async function GET() {
  const mockData = generateMockData(500) // Generate 500 records
  return Response.json(mockData)
}
```

## 🎯 Dashboard Integration

### Update Dashboard Components

```typescript
// ca-lobby-nextjs/app/(dashboard)/page.tsx
import { mockData } from '@/lib/mock-data'

export default function DashboardPage() {
  const summary = mockData.dashboardSummary

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
              ${summary.overview.total_payments_ytd.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{summary.overview.growth_rate_yoy}% from last year
            </p>
          </CardContent>
        </Card>
        {/* More cards... */}
      </div>

      {/* Charts with mock data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LobbyingTrendsChart data={mockData.quarterlyTrends} />
          </CardContent>
        </Card>
        {/* More charts... */}
      </div>
    </div>
  )
}
```

### Chart Component Updates

```typescript
// ca-lobby-nextjs/components/charts/LobbyingTrendsChart.tsx
interface TrendsChartProps {
  data: Array<{
    quarter: string
    total_payments: number
    growth_rate: number
  }>
}

export function LobbyingTrendsChart({ data }: TrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="quarter" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Payments']} />
        <Line
          type="monotone"
          dataKey="total_payments"
          stroke="#2563eb"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

## 👥 Test User Authentication

### Integrate Test Users with Clerk

```typescript
// ca-lobby-nextjs/lib/test-users.ts
import testUsers from '../../mock-data/test_users.json'

export function getTestUserByEmail(email: string) {
  return testUsers.find(user => user.email === email)
}

export function getUserPermissions(role: string) {
  const user = testUsers.find(u => u.role === role)
  return user?.permissions || []
}

// Usage in components
export function useUserPermissions() {
  const { user } = useUser()
  const testUser = getTestUserByEmail(user?.primaryEmailAddress?.emailAddress || '')

  return {
    permissions: testUser?.permissions || [],
    role: testUser?.role || 'viewer',
    hasPermission: (permission: string) =>
      testUser?.permissions.includes(permission) || false
  }
}
```

## 🔄 Development Workflow

### 1. Enable Mock Data Mode

Add environment variable:

```bash
# .env.local
NEXT_PUBLIC_MOCK_DATA_MODE=true
NEXT_PUBLIC_USE_REAL_BIGQUERY=false
```

### 2. Create Data Provider

```typescript
// ca-lobby-nextjs/lib/data-provider.ts
import { mockData } from './mock-data'

const useMockData = process.env.NEXT_PUBLIC_MOCK_DATA_MODE === 'true'

export async function fetchLobbyingData(filters = {}) {
  if (useMockData) {
    // Return filtered mock data
    return filterMockData(mockData.lobbyingPayments, filters)
  } else {
    // Make actual BigQuery API call
    return await fetchFromBigQuery(filters)
  }
}

function filterMockData(data: any[], filters: any) {
  // Apply filters to mock data
  return data.filter(item => {
    // Filter logic here
    return true
  })
}
```

### 3. Update API Routes for Mock Mode

```typescript
// app/api/bigquery/query/route.ts
export async function POST(request: Request) {
  const useMockData = process.env.NEXT_PUBLIC_MOCK_DATA_MODE === 'true'

  if (useMockData) {
    // Return mock data response
    const mockResponse = await handleMockQuery(request)
    return Response.json(mockResponse)
  }

  // Original BigQuery logic
  return await handleRealQuery(request)
}
```

## 📈 Demo Scenarios

### Scenario 1: Healthcare Lobbying Analysis
```typescript
const healthcareData = mockData.lobbyingPayments
  .filter(payment => payment.payment_category === 'Healthcare')
  .sort((a, b) => b.payment_amount - a.payment_amount)
```

### Scenario 2: Quarterly Trend Comparison
```typescript
const q3Trends = mockData.quarterlyTrends
  .filter(trend => trend.quarter.includes('Q3'))
  .map(trend => ({
    year: trend.year,
    total: trend.total_payments,
    growth: trend.growth_rate
  }))
```

### Scenario 3: Geographic Distribution
```typescript
const countyStats = mockData.dashboardSummary.geographic_distribution
  .sort((a, b) => b.total_amount - a.total_amount)
```

## 🎨 Styling and UI

### Data Loading States

```typescript
// ca-lobby-nextjs/components/DataLoader.tsx
export function DataLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API delay for realism
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <DataTableSkeleton />
  }

  return <>{children}</>
}
```

### Mock Data Indicators

```typescript
// ca-lobby-nextjs/components/MockDataBanner.tsx
export function MockDataBanner() {
  if (process.env.NEXT_PUBLIC_MOCK_DATA_MODE !== 'true') return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <InfoIcon className="h-5 w-5 text-yellow-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Demo Mode Active
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              This application is running with mock data for demonstration purposes.
              All lobbying data shown is fictional and generated for proof of concept.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🧪 Testing with Mock Data

### Unit Tests

```typescript
// ca-lobby-nextjs/__tests__/mock-data.test.ts
import { mockData } from '../lib/mock-data'

describe('Mock Data', () => {
  test('contains valid payment records', () => {
    expect(mockData.lobbyingPayments).toHaveLength(10)
    expect(mockData.lobbyingPayments[0]).toHaveProperty('payment_amount')
    expect(mockData.lobbyingPayments[0]).toHaveProperty('payment_category')
  })

  test('quarterly trends show growth', () => {
    const trends = mockData.quarterlyTrends
    expect(trends).toHaveLength(8)
    expect(trends[0]).toHaveProperty('total_payments')
    expect(trends[0]).toHaveProperty('growth_rate')
  })
})
```

### E2E Testing

```typescript
// ca-lobby-nextjs/cypress/e2e/dashboard.cy.ts
describe('Dashboard with Mock Data', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('[data-testid="mock-data-banner"]').should('be.visible')
  })

  it('displays payment trends chart', () => {
    cy.get('[data-testid="trends-chart"]').should('be.visible')
    cy.get('.recharts-line').should('exist')
  })

  it('shows correct total payment amount', () => {
    cy.get('[data-testid="total-payments"]')
      .should('contain', '$6,824,000')
  })
})
```

## 🚀 Deployment Considerations

### Environment Variables for Production Demo

```bash
# Vercel Environment Variables
NEXT_PUBLIC_MOCK_DATA_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_NAME="CA Lobby Demo"
```

### Build-time Data Generation

```typescript
// ca-lobby-nextjs/scripts/generate-demo-data.js
const fs = require('fs')
const { generateAllData } = require('../mock-data/data-generator.js')

function buildDemoData() {
  console.log('🚀 Generating demo data for production build...')

  const data = generateAllData()

  // Write to public directory for static access
  fs.writeFileSync(
    './public/demo-data.json',
    JSON.stringify(data, null, 2)
  )

  console.log('✅ Demo data generated successfully!')
}

buildDemoData()
```

Add to `package.json`:
```json
{
  "scripts": {
    "build": "npm run generate-demo-data && next build",
    "generate-demo-data": "node scripts/generate-demo-data.js"
  }
}
```

## 📋 Integration Checklist

- [ ] Copy mock data files to project
- [ ] Update API routes to return mock data
- [ ] Integrate test users with authentication
- [ ] Update dashboard components with mock data
- [ ] Add mock data mode environment variable
- [ ] Update charts and visualizations
- [ ] Add mock data indicators/banners
- [ ] Test all major user flows
- [ ] Verify role-based access control
- [ ] Test data export functionality
- [ ] Validate search and filtering
- [ ] Check responsive design with data
- [ ] Test error handling scenarios
- [ ] Verify performance with mock data
- [ ] Document demo scenarios

This comprehensive integration guide ensures your CA Lobby proof of concept has realistic, engaging data that demonstrates all the application's capabilities effectively!