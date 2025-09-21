import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  DatabaseIcon,
  FileTextIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Data Transform | CA Lobby',
  description: 'Transform and process lobbying data',
}

const transformJobs = [
  {
    id: 'job-001',
    name: 'Quarterly Data Cleanup',
    type: 'Data Cleaning',
    status: 'completed',
    progress: 100,
    startTime: '2024-09-19 10:00:00',
    endTime: '2024-09-19 10:45:00',
    recordsProcessed: 15420,
    description: 'Clean and standardize Q3 2024 lobbying data',
  },
  {
    id: 'job-002',
    name: 'Association Data Merge',
    type: 'Data Merge',
    status: 'running',
    progress: 67,
    startTime: '2024-09-19 14:30:00',
    endTime: null,
    recordsProcessed: 8940,
    description: 'Merge association metadata with payment records',
  },
  {
    id: 'job-003',
    name: 'Category Standardization',
    type: 'Data Standardization',
    status: 'pending',
    progress: 0,
    startTime: null,
    endTime: null,
    recordsProcessed: 0,
    description: 'Standardize industry category classifications',
  },
  {
    id: 'job-004',
    name: 'Duplicate Detection',
    type: 'Data Validation',
    status: 'failed',
    progress: 23,
    startTime: '2024-09-19 12:15:00',
    endTime: '2024-09-19 12:22:00',
    recordsProcessed: 3210,
    description: 'Identify and flag potential duplicate records',
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />
    case 'running':
      return <RefreshCwIcon className="h-4 w-4 text-blue-600 animate-spin" />
    case 'failed':
      return <AlertCircleIcon className="h-4 w-4 text-red-600" />
    default:
      return <ClockIcon className="h-4 w-4 text-gray-600" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    case 'running':
      return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
    case 'failed':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
  }
}

export default function DataTransformPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Transform</h1>
        <p className="text-muted-foreground">
          Transform, clean, and process lobbying data for analysis
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27,570</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* New Transform Job */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Transform Job</CardTitle>
          <CardDescription>
            Configure and start a new data transformation job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-name">Job Name</Label>
              <Input id="job-name" placeholder="Enter job name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-type">Transform Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select transform type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Data Cleaning</SelectItem>
                  <SelectItem value="merge">Data Merge</SelectItem>
                  <SelectItem value="standardization">Data Standardization</SelectItem>
                  <SelectItem value="validation">Data Validation</SelectItem>
                  <SelectItem value="aggregation">Data Aggregation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Describe the transformation job" />
          </div>
          <div className="flex gap-2">
            <Button>
              <PlayIcon className="mr-2 h-4 w-4" />
              Start Job
            </Button>
            <Button variant="outline">
              <ClockIcon className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transform Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Transform Jobs</CardTitle>
          <CardDescription>
            Monitor and manage data transformation jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transformJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <h4 className="font-medium">{job.name}</h4>
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>Type: {job.type}</span>
                      <span>•</span>
                      <span>Records: {job.recordsProcessed.toLocaleString()}</span>
                      {job.startTime && (
                        <>
                          <span>•</span>
                          <span>Started: {job.startTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {job.status === 'running' && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.progress}%</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {getStatusBadge(job.status)}
                  <div className="flex gap-1">
                    {job.status === 'running' && (
                      <Button size="sm" variant="outline">
                        <PauseIcon className="h-3 w-3" />
                      </Button>
                    )}
                    {(job.status === 'pending' || job.status === 'failed') && (
                      <Button size="sm" variant="outline">
                        <PlayIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}