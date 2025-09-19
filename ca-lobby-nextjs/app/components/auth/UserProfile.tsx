"use client"

import React from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { getUserRole, getUserPermissions, UserMetadata } from '../../../lib/auth'
import {
  ShieldIcon,
  UserIcon,
  MailIcon,
  CalendarIcon,
  ActivityIcon,
  SettingsIcon,
} from 'lucide-react'
import { format } from 'date-fns'

interface UserProfileProps {
  showPermissions?: boolean
  showMetadata?: boolean
  compact?: boolean
}

/**
 * User profile component showing user info, role, and permissions
 */
export function UserProfile({
  showPermissions = true,
  showMetadata = true,
  compact = false,
}: UserProfileProps) {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-2" />
            <p>No user information available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const role = getUserRole(user)
  const permissions = getUserPermissions(user)
  const metadata = user.publicMetadata as UserMetadata
  const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)

  const roleColors = {
    admin: 'destructive',
    analyst: 'default',
    data_manager: 'secondary',
    viewer: 'outline',
  } as const

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
          <AvatarFallback>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {user.fullName || 'Anonymous User'}
          </p>
          <Badge variant={roleColors[role]} className="text-xs">
            {role.replace('_', ' ')}
          </Badge>
        </div>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.imageUrl} alt={user.fullName || 'User'} />
            <AvatarFallback className="text-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">
              {user.fullName || 'Anonymous User'}
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <MailIcon className="h-4 w-4" />
              <span>{primaryEmail?.emailAddress}</span>
            </CardDescription>
            <div className="flex items-center space-x-2 mt-2">
              <ShieldIcon className="h-4 w-4" />
              <Badge variant={roleColors[role]}>
                {role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-10 w-10',
                },
              }}
            />
            <Button variant="outline" size="sm">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showMetadata && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Joined</p>
                  <p className="text-muted-foreground">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              {user.lastActiveAt && (
                <div className="flex items-center space-x-2">
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Active</p>
                    <p className="text-muted-foreground">
                      {format(new Date(user.lastActiveAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {metadata?.department && (
              <div>
                <p className="font-medium text-sm">Department</p>
                <p className="text-muted-foreground text-sm">{metadata.department}</p>
              </div>
            )}
          </div>
        )}

        {showPermissions && permissions.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h3 className="font-medium text-sm mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-1">
                {permissions.map((permission, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                    title={permission.description}
                  >
                    {permission.name.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Quick user info component for navigation bars
 */
export function UserInfo() {
  return <UserProfile compact showPermissions={false} showMetadata={false} />
}