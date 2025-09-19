import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChartIcon,
  TrendingUpIcon,
  PieChartIcon,
  LineChartIcon,
  TargetIcon,
  ActivityIcon,
} from 'lucide-react'
import { LobbyingTrendsChart } from '@/components/charts/lobbying-trends-chart'
import { PaymentAnalysisChart } from '@/components/charts/payment-analysis-chart'
import { AssociationBreakdownChart } from '@/components/charts/association-breakdown-chart'

export const metadata: Metadata = {
  title: 'Data Analysis | CA Lobby',
  description: 'Advanced data analysis and insights',
}

// Mock analysis results
const analysisResults = [
  {
    title: "Top Growing Sectors",
    description: "Sectors with highest growth in lobbying activity",
    insights: [
      { sector: "Healthcare Technology", growth: 45.2, amount: "$12.5M" },
      { sector: "Clean Energy", growth: 38.7, amount: "$8.9M" },
      { sector: "AI & Data Privacy", growth: 32.1, amount: "$7.2M" },
      { sector: "Financial Services", growth: 28.4, amount: "$15.1M" },
    ],
  },
  {
    title: "Emerging Trends",
    description: "New lobbying topics and their momentum",
    insights: [
      { topic: "AI Regulation", mentions: 234, change: "+156%" },
      { topic: "Climate Policy", mentions: 189, change: "+92%" },
      { topic: "Data Privacy", mentions: 167, change: "+78%" },
      { topic: "Remote Work Laws", mentions: 143, change: "+203%" },
    ],
  },
  {
    title: "Payment Patterns",
    description: "Analysis of payment timing and amounts",
    insights: [
      { pattern: "Quarterly Surge", description: "65% of payments occur in quarter-end" },
      { pattern: "Seasonal Variation", description: "Q4 shows 23% higher activity" },
      { pattern: "Category Concentration", description: "Top 5 categories represent 78% of spending" },
      { pattern: "Organization Size", description: "Large orgs spend 4x more on average" },
    ],
  },
]

const keyMetrics = [
  {
    title: "Data Quality Score",
    value: "94.2%",
    change: "+2.1%",
    description: "Overall data completeness and accuracy",
    icon: TargetIcon,
    color: "text-green-600",
  },
  {
    title: "Processing Speed",
    value: "1.2s",
    change: "-0.3s",
    description: "Average query response time",
    icon: ActivityIcon,
    color: "text-blue-600",
  },
  {
    title: "Coverage Rate",
    value: "97.8%",
    change: "+1.5%",
    description: "Percentage of lobbying activities captured",
    icon: BarChartIcon,
    color: "text-purple-600",
  },
  {
    title: "Anomaly Detection",
    value: "12",
    change: "+3",
    description: "Potential data anomalies identified",
    icon: TrendingUpIcon,
    color: "text-orange-600",
  },
]

export default function DataAnalyzePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
          <p className="text-muted-foreground">
            Advanced analytics and insights from California lobbying data
          </p>
        </div>
        <div className="flex space-x-2">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="q3-2024">Q3 2024</SelectItem>
              <SelectItem value="q2-2024">Q2 2024</SelectItem>
              <SelectItem value="q1-2024">Q1 2024</SelectItem>
              <SelectItem value="2024">Full Year 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <Badge
                    variant={metric.change.startsWith('+') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analysis Tools */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <TrendingUpIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Trend Analysis</CardTitle>
            <CardDescription>
              Analyze trends and patterns over time
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <PieChartIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Sector Analysis</CardTitle>
            <CardDescription>
              Break down data by industry sectors
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BarChartIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Comparative Analysis</CardTitle>
            <CardDescription>
              Compare different time periods and categories
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <LineChartIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Predictive Analysis</CardTitle>
            <CardDescription>
              Forecast future trends and patterns
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LobbyingTrendsChart
          title="Activity Trends Analysis"
          description="Detailed analysis of lobbying activity patterns"
        />
        <AssociationBreakdownChart
          title="Organizational Analysis"
          description="Analysis of lobbying by organization type"
        />
      </div>

      <div className="grid gap-6">
        <PaymentAnalysisChart
          title="Financial Impact Analysis"
          description="Comprehensive analysis of lobbying expenditures"
        />
      </div>

      {/* Analysis Results */}
      <div className="grid gap-6 lg:grid-cols-3">
        {analysisResults.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{result.title}</CardTitle>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.insights.map((insight, insightIndex) => (
                  <div key={insightIndex} className="border-b pb-3 last:border-b-0">
                    {('sector' in insight) ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{insight.sector}</div>
                          <div className="text-xs text-muted-foreground">
                            {insight.amount}
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          +{insight.growth}%
                        </Badge>
                      </div>
                    ) : ('topic' in insight) ? (
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">{insight.topic}</div>
                          <div className="text-xs text-muted-foreground">
                            {insight.mentions} mentions
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {insight.change}
                        </Badge>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-sm">{insight.pattern}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics Dashboard</CardTitle>
          <CardDescription>
            Deep insights and statistical analysis of lobbying data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Statistical Summary</h3>
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Total Organizations</span>
                  <span className="font-mono font-bold">1,247</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Average Payment</span>
                  <span className="font-mono font-bold">$21,647</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Median Payment</span>
                  <span className="font-mono font-bold">$15,230</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Standard Deviation</span>
                  <span className="font-mono font-bold">$34,521</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Correlation Analysis</h3>
              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Payment Size vs Duration</span>
                  <Badge variant="secondary">0.73</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Industry vs Payment Pattern</span>
                  <Badge variant="secondary">0.65</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Organization Size vs Frequency</span>
                  <Badge variant="secondary">0.58</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <span className="text-sm">Quarterly vs Annual Patterns</span>
                  <Badge variant="secondary">0.42</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analysis Updated</h4>
                <p className="text-sm text-muted-foreground">
                  Last updated: September 16, 2024 at 2:30 PM
                </p>
              </div>
              <Button variant="outline">
                Export Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}