"use client"

import React from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
  title?: string
  description?: string
  redirectUrl?: string
  requireRole?: 'admin' | 'analyst' | 'data_manager' | 'viewer'
}

/**
 * Wrapper component that handles authentication with Clerk
 */
export function AuthWrapper({
  children,
  fallback,
  loadingComponent,
  title = "Authentication Required",
  description = "Please sign in to access this content.",
  redirectUrl = "/sign-in",
  requireRole,
}: AuthWrapperProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  // Show loading state while auth is loading
  if (!isLoaded) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not signed in, show fallback or sign-in prompt
  if (!isSignedIn) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href={redirectUrl}>Sign In</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Sign up here
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role-based access if required
  if (requireRole && user) {
    const userRole = user.publicMetadata?.role as string
    if (userRole !== requireRole && userRole !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access this content. Required role: {requireRole}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  // User is authenticated and has required role, render children
  return <>{children}</>
}

/**
 * Higher-order component version of AuthWrapper
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  wrapperProps?: Omit<AuthWrapperProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthWrapper {...wrapperProps}>
        <Component {...props} />
      </AuthWrapper>
    )
  }
}