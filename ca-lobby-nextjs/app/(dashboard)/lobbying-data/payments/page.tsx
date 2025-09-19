import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DownloadIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  CalendarIcon,
} from 'lucide-react'
import { PaymentAnalysisChart } from '@/components/charts/payment-analysis-chart'
import { LobbyingTrendsChart } from '@/components/charts/lobbying-trends-chart'

export const metadata: Metadata = {
  title: 'Payment Tracking | CA Lobby',
  description: 'Track and analyze lobbying payments in California',
}

// Mock payment data
const paymentData = [
  {
    id: "PAY-001",
    organization: "California Healthcare Association",
    amount: 125000,
    quarter: "Q3 2024",
    paymentDate: "2024-09-15",
    paymentType: "Quarterly Fee",
    categories: ["Healthcare Reform", "Medicare Policy"],
    status: "Processed",
    trend: "up",
    trendValue: 15.2,
  },
  {
    id: "PAY-002",
    organization: "Tech Forward Coalition",
    amount: 89000,
    quarter: "Q3 2024",
    paymentDate: "2024-09-12",
    paymentType: "Project Fee",
    categories: ["Data Privacy", "AI Regulation"],
    status: "Processed",
    trend: "down",
    trendValue: -8.5,
  },
  {
    id: "PAY-003",
    organization: "Energy Future Alliance",
    amount: 156000,
    quarter: "Q3 2024",
    paymentDate: "2024-08-28",
    paymentType: "Quarterly Fee",
    categories: ["Clean Energy", "Carbon Credits"],
    status: "Processed",
    trend: "up",
    trendValue: 22.3,
  },
  {
    id: "PAY-004",
    organization: "California Business Council",
    amount: 67000,
    quarter: "Q3 2024",
    paymentDate: "2024-09-10",
    paymentType: "Monthly Fee",
    categories: ["Tax Policy", "Employment Law"],
    status: "Pending",
    trend: "up",
    trendValue: 5.8,
  },
  {
    id: "PAY-005",
    organization: "Education Excellence Fund",
    amount: 98000,
    quarter: "Q3 2024",
    paymentDate: "2024-09-08",
    paymentType: "Project Fee",
    categories: ["Education Funding", "Teacher Standards"],
    status: "Processed",
    trend: "up",
    trendValue: 12.1,
  },
]

const summaryStats = [
  {
    title: "Total Payments",
    value: "$127.5M",
    change: "+12.3%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Payment Count",
    value: "5,892",
    change: "+8.7%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Avg Payment",
    value: "$21,647",
    change: "+3.2%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Pending Review",
    value: "127",
    change: "-15.6%",
    changeType: "negative" as const,
    period: "vs last quarter",
  },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Processed':
      return <Badge className="bg-green-100 text-green-800">Processed</Badge>
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    case 'Failed':
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getTrendIcon = (trend: string, value: number) => {
  if (trend === 'up') {
    return (
      <div className="flex items-center text-green-600">
        <TrendingUpIcon className="h-3 w-3 mr-1" />
        <span className="text-xs">+{value}%</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center text-red-600">
        <TrendingDownIcon className="h-3 w-3 mr-1" />
        <span className="text-xs">{value}%</span>
      </div>
    )
  }
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and analyze lobbying payments and financial trends
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Payments
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Badge
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span>{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LobbyingTrendsChart
          title="Payment Trends"
          description="Payment amounts and frequency over time"
        />
        <PaymentAnalysisChart
          title="Payments by Category"
          description="Distribution of payments across categories"
        />
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Latest lobbying payments processed in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentData.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">
                      {payment.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.organization}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.quarter}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {payment.categories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(payment.paymentDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTrendIcon(payment.trend, payment.trendValue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {paymentData.length} of 5,892 payments
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Analysis Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Payment Categories</CardTitle>
            <CardDescription>Highest spending categories this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: "Healthcare Reform", amount: 45200000, percentage: 35.5 },
                { category: "Technology Policy", amount: 28900000, percentage: 22.7 },
                { category: "Energy & Environment", amount: 19800000, percentage: 15.5 },
                { category: "Financial Services", amount: 16100000, percentage: 12.6 },
                { category: "Education", amount: 9500000, percentage: 7.4 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.category}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status Overview</CardTitle>
            <CardDescription>Current status of all payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Processed</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">5,642</div>
                  <div className="text-xs text-muted-foreground">95.8%</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending Review</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">127</div>
                  <div className="text-xs text-muted-foreground">2.2%</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Processing</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">89</div>
                  <div className="text-xs text-muted-foreground">1.5%</div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Failed/Disputed</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">34</div>
                  <div className="text-xs text-muted-foreground">0.6%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}