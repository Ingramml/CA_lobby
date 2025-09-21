"use client"

import React from 'react'
import { AuthWrapper } from '@/components/auth/AuthWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  UserIcon,
  SearchIcon,
  RefreshCwIcon,
  CrownIcon,
  ShieldIcon,
  EyeIcon,
  BarChart3Icon,
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  firstName: string
  lastName: string
  emailAddresses: Array<{ emailAddress: string }>
  imageUrl: string
  lastActiveAt: Date | null
  createdAt: Date
  role: 'admin' | 'analyst' | 'viewer' | 'data_manager'
  metadata: {
    role: string
    department?: string
    lastActive?: string
  }
}

const roleIcons = {
  admin: CrownIcon,
  analyst: BarChart3Icon,
  data_manager: ShieldIcon,
  viewer: EyeIcon,
}

const roleColors = {
  admin: 'destructive',
  analyst: 'default',
  data_manager: 'secondary',
  viewer: 'outline',
} as const

export default function UserManagementPage() {
  // Mock current user for development
  const currentUser = { role: 'admin' }
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedRole, setSelectedRole] = React.useState<string>('all')
  const [updatingUser, setUpdatingUser] = React.useState<string | null>(null)

  // Fetch users from API
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update user role
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUpdatingUser(userId)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setUsers(prev =>
          prev.map(user =>
            user.id === userId
              ? { ...user, role: newRole as any, metadata: { ...user.metadata, role: newRole } }
              : user
          )
        )
      } else {
        console.error('Failed to update user role:', data.error)
        alert('Failed to update user role: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role')
    } finally {
      setUpdatingUser(null)
    }
  }

  // Filter users based on search and role
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.emailAddresses[0]?.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = selectedRole === 'all' || user.role === selectedRole

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRole])

  // Load users on component mount
  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <AuthWrapper
      title="Admin Access Required"
      description="You need admin privileges to access user management."
      requireRole="admin"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions for the CA Lobby platform
            </p>
          </div>
          <Button onClick={fetchUsers} disabled={loading}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(
            users.reduce((acc, user) => {
              acc[user.role] = (acc[user.role] || 0) + 1
              return acc
            }, {} as Record<string, number>)
          ).map(([role, count]) => {
            const IconComponent = roleIcons[role as keyof typeof roleIcons] || UserIcon
            return (
              <Card key={role}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {role.replace('_', ' ')}s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Search and filter users, update roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="data_manager">Data Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="text-center py-8">
                <RefreshCwIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const IconComponent = roleIcons[user.role] || UserIcon
                    const isCurrentUser = user.id === currentUser?.id

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
                              <AvatarFallback>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                                {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.emailAddresses[0]?.emailAddress}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <Badge variant={roleColors[user.role]}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.metadata.department || 'Not specified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.lastActiveAt
                              ? format(new Date(user.lastActiveAt), 'MMM d, yyyy')
                              : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={user.role}
                              onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                              disabled={isCurrentUser || updatingUser === user.id}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="data_manager">Data Manager</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            {updatingUser === user.id && (
                              <RefreshCwIcon className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-muted-foreground">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users have been added to the system yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthWrapper>
  )
}