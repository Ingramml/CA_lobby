import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  BarChartIcon,
  DollarSignIcon,
  UsersIcon,
} from 'lucide-react'
import { mockData } from '@/lib/demo-data'

export const metadata: Metadata = {
  title: 'Lobbying Trends | CA Lobby',
  description: 'Analyze lobbying trends and patterns over time',
}

const trendMetrics = [
  {
    title: "Quarterly Growth",
    value: "+12.3%",
    change: "+2.1%",
    trend: "up" as const,
    description: "Compared to previous quarter",
    icon: TrendingUpIcon,
  },
  {
    title: "Active Lobbyists",
    value: "1,247",
    change: "+5.8%",
    trend: "up" as const,
    description: "Year over year growth",
    icon: UsersIcon,
  },
  {
    title: "Average Payment",
    value: "$21,647",
    change: "-3.2%",
    trend: "down" as const,
    description: "Monthly average decrease",
    icon: DollarSignIcon,
  },
  {
    title: "New Registrations",
    value: "89",
    change: "+15.7%",
    trend: "up" as const,
    description: "This quarter",
    icon: BarChartIcon,
  },
]

const categoryTrends = [
  { category: "Healthcare", current: "$45.2M", change: "+18.5%", trend: "up" },
  { category: "Technology", current: "$38.7M", change: "+25.3%", trend: "up" },
  { category: "Energy", current: "$32.1M", change: "-8.2%", trend: "down" },
  { category: "Finance", current: "$28.9M", change: "+12.1%", trend: "up" },
  { category: "Transportation", current: "$24.6M", change: "+6.7%", trend: "up" },
  { category: "Education", current: "$19.3M", change: "-2.4%", trend: "down" },
]

export default function TrendsPage() {
  const quarterlyTrends = mockData.quarterlyTrends || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lobbying Trends</h1>
        <p className="text-muted-foreground">
          Analyze trends and patterns in California lobbying activities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {trendMetrics.map((metric, index) => {
          const IconComponent = metric.icon
          const TrendIcon = metric.trend === 'up' ? TrendingUpIcon : TrendingDownIcon
          const trendColor = metric.trend === 'up' ? 'text-green-600' : 'text-red-600'

          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`flex items-center ${trendColor}`}>
                    <TrendIcon className="h-3 w-3 mr-1" />
                    {metric.change}
                  </div>
                  <span className="text-muted-foreground">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Time Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Time Period Analysis
          </CardTitle>
          <CardDescription>
            Select time periods to analyze trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="default" size="sm">Last Quarter</Button>
            <Button variant="outline" size="sm">Last 6 Months</Button>
            <Button variant="outline" size="sm">Last Year</Button>
            <Button variant="outline" size="sm">Last 2 Years</Button>
            <Button variant="outline" size="sm">Custom Range</Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Category Trends</CardTitle>
          <CardDescription>
            Spending trends by industry category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryTrends.map((category, index) => {
              const isPositive = category.trend === 'up'
              const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon
              const trendColor = isPositive ? 'text-green-600' : 'text-red-600'

              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{category.category}</h4>
                      <p className="text-sm text-muted-foreground">Current spending</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-bold">{category.current}</div>
                      <div className={`flex items-center text-sm ${trendColor}`}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {category.change}
                      </div>
                    </div>
                    <Badge variant={isPositive ? "default" : "secondary"}>
                      {isPositive ? "Growing" : "Declining"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Overview</CardTitle>
          <CardDescription>
            Historical quarterly performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quarterlyTrends.slice(0, 4).map((quarter, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  {quarter.quarter || `Q${index + 1} 2024`}
                </div>
                <div className="text-2xl font-bold mt-1">
                  ${(quarter.total_amount || (50000000 + index * 5000000)).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {quarter.total_payments || (1200 + index * 100)} payments
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Visualization</CardTitle>
          <CardDescription>
            Interactive charts showing lobbying trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <BarChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Interactive trend charts will be displayed here</p>
              <p className="text-sm text-muted-foreground mt-2">Charts integration coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}