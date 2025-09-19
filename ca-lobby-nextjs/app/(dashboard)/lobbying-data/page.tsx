import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ExternalLinkIcon,
  CalendarIcon,
  DollarSignIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Lobbying Data | CA Lobby',
  description: 'Browse and search California lobbying data',
}

// Mock data for lobbying activities
const lobbyingData = [
  {
    id: "1",
    organization: "California Healthcare Association",
    lobbyist: "John Smith",
    client: "General Healthcare Partners",
    amount: 125000,
    period: "Q3 2024",
    issues: ["Healthcare Reform", "Medicare Policy"],
    status: "Active",
    filingDate: "2024-09-15",
    category: "Healthcare",
  },
  {
    id: "2",
    organization: "Tech Forward Coalition",
    lobbyist: "Sarah Johnson",
    client: "Innovation Tech Corp",
    amount: 89000,
    period: "Q3 2024",
    issues: ["Data Privacy", "AI Regulation"],
    status: "Active",
    filingDate: "2024-09-12",
    category: "Technology",
  },
  {
    id: "3",
    organization: "Energy Future Alliance",
    lobbyist: "Michael Brown",
    client: "Green Energy Solutions",
    amount: 156000,
    period: "Q3 2024",
    issues: ["Clean Energy", "Carbon Credits"],
    status: "Completed",
    filingDate: "2024-08-28",
    category: "Energy",
  },
  {
    id: "4",
    organization: "California Business Council",
    lobbyist: "Emily Davis",
    client: "Small Business Network",
    amount: 67000,
    period: "Q3 2024",
    issues: ["Tax Policy", "Employment Law"],
    status: "Active",
    filingDate: "2024-09-10",
    category: "Business",
  },
  {
    id: "5",
    organization: "Education Excellence Fund",
    lobbyist: "Robert Wilson",
    client: "Public Schools Alliance",
    amount: 98000,
    period: "Q3 2024",
    issues: ["Education Funding", "Teacher Standards"],
    status: "Active",
    filingDate: "2024-09-08",
    category: "Education",
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
    case 'Active':
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    case 'Completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'Pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function LobbyingDataPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lobbying Data</h1>
          <p className="text-muted-foreground">
            Browse and search California lobbying activities and payments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,892</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127.5M</div>
            <p className="text-xs text-muted-foreground">
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +5.8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Payment</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,647</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Filter lobbying data by organization, amount, period, and other criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search organizations, lobbyists..."
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
              <label className="text-sm font-medium">Period</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All periods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="q3-2024">Q3 2024</SelectItem>
                  <SelectItem value="q2-2024">Q2 2024</SelectItem>
                  <SelectItem value="q1-2024">Q1 2024</SelectItem>
                  <SelectItem value="q4-2023">Q4 2023</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {lobbyingData.length} of 5,892 records
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

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lobbying Activities</CardTitle>
          <CardDescription>
            Detailed view of lobbying activities and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Lobbyist</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Filing Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lobbyingData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{record.organization}</div>
                        <div className="text-sm text-muted-foreground">
                          {record.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.lobbyist}</TableCell>
                    <TableCell>{record.client}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.period}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {record.issues.map((issue, index) => (
                          <Badge key={index} variant="secondary" className="mr-1 mb-1">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {formatDate(record.filingDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing 1 to {lobbyingData.length} of 5,892 records
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