"use client"

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { SignInButton } from './SignInButton'
import { ShieldIcon, LoaderIcon } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
  title?: string
  description?: string
  redirectUrl?: string
}

/**
 * Wrapper component that ensures user is authenticated before rendering children
 */
export function AuthWrapper({
  children,
  fallback,
  loadingComponent,
  title = 'Authentication Required',
  description = 'Please sign in to access this content.',
  redirectUrl,
}: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Show loading state while checking authentication
  if (!isLoaded) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoaderIcon className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <ShieldIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <SignInButton redirectUrl={redirectUrl} />
              <SignInButton mode="sign-up" variant="outline" redirectUrl={redirectUrl} />
            </div>
            <div className="text-center">
              <Button variant="link" asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated, render children
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