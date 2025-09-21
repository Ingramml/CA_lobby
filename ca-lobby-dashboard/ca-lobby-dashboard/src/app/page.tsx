'use client'

import { useAuth } from '@clerk/nextjs'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirecting to dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              CA Lobby Dashboard
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to CA Lobby Dashboard
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            A secure dashboard application built with Next.js and Clerk authentication.
            Sign in to access your personalized dashboard.
          </p>

          {/* Authentication Buttons */}
          <div className="mt-10 flex gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-600">Protected by Clerk&apos;s robust authentication system</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Modern Stack</h3>
              <p className="text-gray-600">Built with Next.js 14, TypeScript, and Tailwind CSS</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vercel Ready</h3>
              <p className="text-gray-600">Optimized for deployment on Vercel platform</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
