import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
} from 'lucide-react'
import { mockData } from '@/lib/demo-data'

export const metadata: Metadata = {
  title: 'Lobbying Associations | CA Lobby',
  description: 'Browse and analyze lobbying associations data',
}

export default function AssociationsPage() {
  const associations = mockData.lobbyAssociations || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lobbying Associations</h1>
        <p className="text-muted-foreground">
          Explore lobbying associations, their activities, and spending patterns
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Associations</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{associations.length}</div>
            <p className="text-xs text-muted-foreground">
              Active associations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${associations.reduce((sum, assoc) => sum + (assoc.total_spending || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined spending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Association</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(associations.reduce((sum, assoc) => sum + (assoc.total_spending || 0), 0) / associations.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Average spending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Lobbyists</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {associations.reduce((sum, assoc) => sum + (assoc.active_lobbyists || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total lobbyists
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search associations by name or focus area..."
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                More Filters
              </Button>
              <Button variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Associations Directory</CardTitle>
          <CardDescription>
            Detailed information about all lobbying associations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Association Name</TableHead>
                <TableHead>Focus Areas</TableHead>
                <TableHead>Active Lobbyists</TableHead>
                <TableHead>Total Spending</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associations.slice(0, 10).map((association, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {association.name || 'California Tech Alliance'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(association.focus_areas || ['Technology', 'Policy']).slice(0, 2).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {(association.focus_areas || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(association.focus_areas || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{association.active_lobbyists || 8}</TableCell>
                  <TableCell>${(association.total_spending || 150000).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}