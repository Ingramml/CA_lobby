import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DatabaseIcon,
  DownloadIcon,
  UploadIcon,
  BarChartIcon,
  TrendingUpIcon,
  UsersIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ActivityIcon
} from 'lucide-react'
import { LobbyingTrendsChart } from '@/components/charts/lobbying-trends-chart'
import { PaymentAnalysisChart } from '@/components/charts/payment-analysis-chart'
import { AssociationBreakdownChart } from '@/components/charts/association-breakdown-chart'

export const metadata: Metadata = {
  title: 'Dashboard | CA Lobby',
  description: 'California Lobbying Data Dashboard',
}

// Mock data for the dashboard
const recentActivities = [
  {
    id: 1,
    action: "Data Upload Completed",
    description: "Q3 2024 lobbying data uploaded successfully",
    timestamp: "2 minutes ago",
    status: "success" as const,
  },
  {
    id: 2,
    action: "Report Generated",
    description: "Healthcare lobbying trends report created",
    timestamp: "15 minutes ago",
    status: "success" as const,
  },
  {
    id: 3,
    action: "Data Quality Check",
    description: "Minor inconsistencies found in payment data",
    timestamp: "1 hour ago",
    status: "warning" as const,
  },
  {
    id: 4,
    action: "System Maintenance",
    description: "Scheduled maintenance completed",
    timestamp: "3 hours ago",
    status: "info" as const,
  },
]

const stats = [
  {
    title: "Total Lobbying Amount",
    value: "$127.5M",
    change: "+12.3%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Active Organizations",
    value: "1,247",
    change: "+5.8%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
  {
    title: "Total Activities",
    value: "5,892",
    change: "-2.1%",
    changeType: "negative" as const,
    period: "vs last quarter",
  },
  {
    title: "Average Payment",
    value: "$21,647",
    change: "+8.7%",
    changeType: "positive" as const,
    period: "vs last quarter",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the California Lobbying Data Analysis Platform
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LobbyingTrendsChart />
        <AssociationBreakdownChart />
      </div>

      <div className="grid gap-6">
        <PaymentAnalysisChart />
      </div>

      {/* Action Cards and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common data operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/lobbying-data">
                <DatabaseIcon className="mr-2 h-4 w-4" />
                Browse Lobbying Data
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/reports/create">
                <FileTextIcon className="mr-2 h-4 w-4" />
                Create New Report
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/data/upload">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Data
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/data/analyze">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Analyze Data
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                  <div className="mt-1">
                    {activity.status === 'success' && (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                    )}
                    {activity.status === 'info' && (
                      <ActivityIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/activity">
                  View All Activity
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-bold text-green-600">Connected</div>
                <p className="text-xs text-muted-foreground">
                  BigQuery operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-bold">Up to Date</div>
                <p className="text-xs text-muted-foreground">
                  Last updated 2 mins ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}