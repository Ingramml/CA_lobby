import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  SettingsIcon,
  DatabaseIcon,
  ShieldIcon,
  BellIcon,
  UserIcon,
  MailIcon,
  ClockIcon,
  KeyIcon,
  ServerIcon,
  SaveIcon,
  RefreshCwIcon,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Settings | CA Lobby',
  description: 'System administration and configuration settings',
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and administrative options
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Connection</span>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">BigQuery Status</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Health</span>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cache Status</span>
              <Badge className="bg-yellow-100 text-yellow-800">Warming</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backup Status</span>
              <Badge className="bg-green-100 text-green-800">Up to date</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="secondary">Development</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Configure database connections and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="db-host">Database Host</Label>
              <Input id="db-host" value="localhost" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="db-name">Database Name</Label>
              <Input id="db-name" value="ca_lobby_dev" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pool-size">Connection Pool Size</Label>
              <Select defaultValue="10">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 connections</SelectItem>
                  <SelectItem value="10">10 connections</SelectItem>
                  <SelectItem value="20">20 connections</SelectItem>
                  <SelectItem value="50">50 connections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="auto-backup">Enable automatic backups</Label>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5" />
              Security & Authentication
            </CardTitle>
            <CardDescription>
              Manage security policies and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Max Login Attempts</Label>
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="two-factor">Require two-factor authentication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="audit-log">Enable audit logging</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="email-alerts">Email alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="system-alerts">System status alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="data-alerts">Data quality alerts</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input id="admin-email" type="email" placeholder="admin@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-frequency">Alert Frequency</Label>
              <Select defaultValue="immediate">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly digest</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                  <SelectItem value="weekly">Weekly digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Manage API keys and rate limiting settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
              <Select defaultValue="1000">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 requests/min</SelectItem>
                  <SelectItem value="500">500 requests/min</SelectItem>
                  <SelectItem value="1000">1000 requests/min</SelectItem>
                  <SelectItem value="5000">5000 requests/min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-version">API Version</Label>
              <Select defaultValue="v1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">Version 1.0</SelectItem>
                  <SelectItem value="v2">Version 2.0 (Beta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="api-logging">Enable API request logging</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="cors-enabled">Enable CORS</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Configure data retention and processing settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="retention-period">Data Retention Period</Label>
              <Select defaultValue="7years">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 year</SelectItem>
                  <SelectItem value="3years">3 years</SelectItem>
                  <SelectItem value="5years">5 years</SelectItem>
                  <SelectItem value="7years">7 years</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="auto-cleanup">Auto cleanup old data</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Toggle</Button>
              <Label htmlFor="compression">Enable data compression</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <RefreshCwIcon className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button>
          <SaveIcon className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}