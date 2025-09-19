"use client"

import React from 'react'
import { SignInButton as ClerkSignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { LogInIcon, UserPlusIcon, LogOutIcon } from 'lucide-react'

interface SignInButtonProps {
  mode?: 'sign-in' | 'sign-up'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  redirectUrl?: string
  children?: React.ReactNode
}

/**
 * Custom sign-in button component that handles both sign-in and sign-up
 */
export function SignInButton({
  mode = 'sign-in',
  variant = 'default',
  size = 'default',
  redirectUrl,
  children,
}: SignInButtonProps) {
  const { isSignedIn, isLoaded } = useUser()

  // Show loading state
  if (!isLoaded) {
    return (
      <Button variant={variant} size={size} disabled>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-current mr-2" />
        Loading...
      </Button>
    )
  }

  // If user is already signed in, don't show sign-in button
  if (isSignedIn) {
    return null
  }

  if (mode === 'sign-up') {
    return (
      <SignUpButton
        redirectUrl={redirectUrl}
        afterSignUpUrl={redirectUrl || '/dashboard'}
      >
        <Button variant={variant} size={size}>
          {children || (
            <>
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Sign Up
            </>
          )}
        </Button>
      </SignUpButton>
    )
  }

  return (
    <ClerkSignInButton
      redirectUrl={redirectUrl}
      afterSignInUrl={redirectUrl || '/dashboard'}
    >
      <Button variant={variant} size={size}>
        {children || (
          <>
            <LogInIcon className="w-4 h-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </ClerkSignInButton>
  )
}

/**
 * Combined auth buttons component for landing pages
 */
export function AuthButtons({ redirectUrl }: { redirectUrl?: string }) {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex space-x-2">
        <Button disabled>
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-current mr-2" />
          Loading...
        </Button>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <Button asChild>
        <a href="/dashboard">
          Go to Dashboard
        </a>
      </Button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <SignInButton redirectUrl={redirectUrl} />
      <SignInButton mode="sign-up" variant="outline" redirectUrl={redirectUrl} />
    </div>
  )
}