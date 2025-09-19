import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  CalendarIcon,
  BarChartIcon,
  TrendingUpIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reports | CA Lobby',
  description: 'Generate and manage lobbying reports',
}

// Mock data for reports
const reports = [
  {
    id: "RPT-001",
    title: "Q3 2024 Healthcare Lobbying Summary",
    description: "Comprehensive analysis of healthcare lobbying activities and expenditures",
    type: "Summary Report",
    category: "Healthcare",
    status: "completed",
    createdDate: "2024-09-15",
    lastModified: "2024-09-15",
    author: "System Generated",
    size: "2.4 MB",
    downloads: 145,
    tags: ["Healthcare", "Q3 2024", "Summary"],
  },
  {
    id: "RPT-002",
    title: "Technology Sector Trends Analysis",
    description: "Analysis of lobbying trends in technology sector over past 12 months",
    type: "Trend Analysis",
    category: "Technology",
    status: "completed",
    createdDate: "2024-09-12",
    lastModified: "2024-09-14",
    author: "Jane Smith",
    size: "1.8 MB",
    downloads: 89,
    tags: ["Technology", "Trends", "Annual"],
  },
  {
    id: "RPT-003",
    title: "Energy Policy Lobbying Impact Report",
    description: "Assessment of lobbying impact on energy policy decisions",
    type: "Impact Assessment",
    category: "Energy",
    status: "in_progress",
    createdDate: "2024-09-10",
    lastModified: "2024-09-16",
    author: "Michael Brown",
    size: "3.1 MB",
    downloads: 23,
    tags: ["Energy", "Policy Impact", "Assessment"],
  },
  {
    id: "RPT-004",
    title: "Small Business Lobbying Expenditure Report",
    description: "Analysis of small business lobbying expenditures and effectiveness",
    type: "Expenditure Report",
    category: "Business",
    status: "scheduled",
    createdDate: "2024-09-08",
    lastModified: "2024-09-08",
    author: "Emily Davis",
    size: "1.2 MB",
    downloads: 0,
    tags: ["Small Business", "Expenditures", "Effectiveness"],
  },
  {
    id: "RPT-005",
    title: "Education Funding Lobbying Analysis",
    description: "Detailed analysis of lobbying efforts related to education funding",
    type: "Detailed Analysis",
    category: "Education",
    status: "completed",
    createdDate: "2024-09-05",
    lastModified: "2024-09-11",
    author: "Robert Wilson",
    size: "2.9 MB",
    downloads: 67,
    tags: ["Education", "Funding", "Analysis"],
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    case 'scheduled':
      return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const reportStats = [
  {
    title: "Total Reports",
    value: "127",
    change: "+8",
    changeType: "positive" as const,
    period: "this month",
    icon: FileTextIcon,
  },
  {
    title: "Active Reports",
    value: "23",
    change: "+5",
    changeType: "positive" as const,
    period: "in progress",
    icon: BarChartIcon,
  },
  {
    title: "Downloads",
    value: "2,847",
    change: "+324",
    changeType: "positive" as const,
    period: "this month",
    icon: DownloadIcon,
  },
  {
    title: "Avg. Report Size",
    value: "2.1 MB",
    change: "-0.3 MB",
    changeType: "negative" as const,
    period: "vs last month",
    icon: TrendingUpIcon,
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate, manage, and download lobbying analysis reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/reports/create">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
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
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BarChartIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Trend Analysis</CardTitle>
            <CardDescription>
              Generate reports analyzing lobbying trends over time
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <FileTextIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Summary Reports</CardTitle>
            <CardDescription>
              Create comprehensive summaries by category or period
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <TrendingUpIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Impact Assessment</CardTitle>
            <CardDescription>
              Analyze the impact of lobbying on policy outcomes
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <DownloadIcon className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Custom Reports</CardTitle>
            <CardDescription>
              Build custom reports with specific criteria and metrics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Report Library</CardTitle>
          <CardDescription>
            Search and filter through all available reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Reports</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or category..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="trend">Trend Analysis</SelectItem>
                  <SelectItem value="impact">Impact Assessment</SelectItem>
                  <SelectItem value="expenditure">Expenditure Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {reports.length} of 127 reports
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <FilterIcon className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            Complete list of available reports with details and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {report.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm">{report.author}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(report.createdDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.size}</TableCell>
                    <TableCell className="text-sm">{report.downloads}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/reports/${report.id}`}>
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {reports.length} of 127 reports
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
    </div>
  )
}