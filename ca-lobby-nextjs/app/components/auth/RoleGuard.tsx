"use client"

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { Permission, hasPermission, hasAnyPermission, getUserRole } from '../../../lib/auth'
import { Card, CardContent } from '../ui/card'
import { ShieldOffIcon, AlertTriangleIcon } from 'lucide-react'

interface RoleGuardProps {
  children: React.ReactNode
  permissions?: Permission[]
  roles?: Array<'admin' | 'analyst' | 'viewer' | 'data_manager'>
  requireAll?: boolean
  fallback?: React.ReactNode
  showError?: boolean
}

/**
 * Component that conditionally renders children based on user permissions or roles
 */
export function RoleGuard({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  showError = true,
}: RoleGuardProps) {
  const { user, isLoaded } = useUser()

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no user is logged in, show fallback or error
  if (!user) {
    if (fallback) return <>{fallback}</>

    if (showError) {
      return (
        <Card className="m-4">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-muted-foreground">
              <ShieldOffIcon className="h-5 w-5" />
              <div>
                <p className="font-medium">Authentication Required</p>
                <p className="text-sm">Please sign in to access this content.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  const userRole = getUserRole(user)

  // Check role-based access
  if (roles.length > 0) {
    const hasRequiredRole = roles.includes(userRole)
    if (!hasRequiredRole) {
      if (fallback) return <>{fallback}</>

      if (showError) {
        return (
          <Card className="m-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <AlertTriangleIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium">Access Restricted</p>
                  <p className="text-sm">
                    This content requires {roles.join(' or ')} role. Your current role: {userRole}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      return null
    }
  }

  // Check permission-based access
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(permission => hasPermission(user, permission))
      : hasAnyPermission(user, permissions)

    if (!hasAccess) {
      if (fallback) return <>{fallback}</>

      if (showError) {
        return (
          <Card className="m-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <AlertTriangleIcon className="h-5 w-5" />
                <div>
                  <p className="font-medium">Insufficient Permissions</p>
                  <p className="text-sm">
                    You don't have the required permissions to access this content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      }

      return null
    }
  }

  // User has access, render children
  return <>{children}</>
}

/**
 * Higher-order component version of RoleGuard
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard {...guardProps}>
        <Component {...props} />
      </RoleGuard>
    )
  }
}

/**
 * Hook for checking permissions in components
 */
export function usePermissions() {
  const { user, isLoaded } = useUser()

  return React.useMemo(() => {
    if (!isLoaded || !user) {
      return {
        isLoaded,
        user: null,
        role: 'viewer' as const,
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasRole: () => false,
      }
    }

    const role = getUserRole(user)

    return {
      isLoaded,
      user,
      role,
      hasPermission: (permission: Permission) => hasPermission(user, permission),
      hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(user, permissions),
      hasRole: (targetRole: string) => role === targetRole,
    }
  }, [user, isLoaded])
}