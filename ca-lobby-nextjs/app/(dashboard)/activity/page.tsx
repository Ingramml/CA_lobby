import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ActivityIcon,
  UserIcon,
  FileTextIcon,
  DatabaseIcon,
  UploadIcon,
  DownloadIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Activity Log | CA Lobby',
  description: 'View all system activities and user actions',
}

const activities = [
  {
    id: 1,
    action: "Data Upload Completed",
    description: "Q3 2024 lobbying data uploaded successfully",
    user: "System",
    timestamp: "2024-09-19 14:30:00",
    status: "success" as const,
    icon: UploadIcon,
  },
  {
    id: 2,
    action: "Report Generated",
    description: "Healthcare lobbying trends report created by John Smith",
    user: "John Smith",
    timestamp: "2024-09-19 14:15:00",
    status: "success" as const,
    icon: FileTextIcon,
  },
  {
    id: 3,
    action: "Data Quality Check",
    description: "Minor inconsistencies found in payment data",
    user: "System",
    timestamp: "2024-09-19 13:45:00",
    status: "warning" as const,
    icon: AlertCircleIcon,
  },
  {
    id: 4,
    action: "User Login",
    description: "Sarah Johnson logged into the system",
    user: "Sarah Johnson",
    timestamp: "2024-09-19 13:30:00",
    status: "info" as const,
    icon: UserIcon,
  },
  {
    id: 5,
    action: "System Maintenance",
    description: "Scheduled maintenance completed successfully",
    user: "System",
    timestamp: "2024-09-19 13:00:00",
    status: "success" as const,
    icon: ActivityIcon,
  },
  {
    id: 6,
    action: "Data Export",
    description: "Association data exported to CSV by Michael Davis",
    user: "Michael Davis",
    timestamp: "2024-09-19 12:45:00",
    status: "success" as const,
    icon: DownloadIcon,
  },
  {
    id: 7,
    action: "Query Executed",
    description: "Complex query on lobbying payments table",
    user: "System",
    timestamp: "2024-09-19 12:30:00",
    status: "success" as const,
    icon: DatabaseIcon,
  },
  {
    id: 8,
    action: "Failed Login Attempt",
    description: "Multiple failed login attempts detected",
    user: "Unknown",
    timestamp: "2024-09-19 12:15:00",
    status: "error" as const,
    icon: AlertCircleIcon,
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case 'success':
      return 'text-green-600'
    case 'warning':
      return 'text-yellow-600'
    case 'error':
      return 'text-red-600'
    default:
      return 'text-blue-600'
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
      return <Badge className="bg-green-100 text-green-800">Success</Badge>
    case 'warning':
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="secondary">Info</Badge>
  }
}

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Track all system activities, user actions, and important events
        </p>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-b-0">
                  <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.action}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>User: {activity.user}</span>
                      <span>•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Actions</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">231</div>
            <p className="text-xs text-muted-foreground">
              93.5% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}