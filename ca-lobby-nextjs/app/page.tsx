"use client"

import React from 'react'
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DatabaseIcon,
  BarChart3Icon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
  CheckCircleIcon,
  EyeIcon,
} from 'lucide-react'

const features = [
  {
    icon: DatabaseIcon,
    title: 'Comprehensive Data Access',
    description: 'Access to California lobbying data with advanced search and filtering capabilities.',
  },
  {
    icon: BarChart3Icon,
    title: 'Advanced Analytics',
    description: 'Powerful analytics tools to identify trends and patterns in lobbying activities.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Payment Tracking',
    description: 'Track lobbying payments and expenditures with detailed financial analysis.',
  },
  {
    icon: UsersIcon,
    title: 'Association Monitoring',
    description: 'Monitor lobbying associations and their activities across different sectors.',
  },
  {
    icon: ShieldIcon,
    title: 'Secure Access',
    description: 'Role-based access control ensures data security and appropriate permissions.',
  },
  {
    icon: EyeIcon,
    title: 'Transparency',
    description: 'Promote government transparency through accessible lobbying data insights.',
  },
]

const roleFeatures = {
  admin: [
    'Full system access and user management',
    'Advanced analytics and reporting',
    'Data upload and management',
    'System configuration and settings',
  ],
  analyst: [
    'Advanced data analysis tools',
    'Custom report creation',
    'Data visualization and charts',
    'Export capabilities',
  ],
  'data manager': [
    'Data upload and transformation',
    'File management and processing',
    'Data quality monitoring',
    'Analytics access',
  ],
  viewer: [
    'Read-only access to dashboards',
    'Basic reporting capabilities',
    'Data viewing and searching',
    'Standard export functions',
  ],
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DatabaseIcon className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading CA Lobby Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DatabaseIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CA Lobby</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {isSignedIn ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">Welcome back!</span>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            California Lobbying
            <span className="text-blue-600"> Data Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access, analyze, and understand California lobbying data with our comprehensive
            analytics platform. Promote transparency and make informed decisions.
          </p>
          <div className="space-x-4">
            {isSignedIn ? (
              <Button asChild size="lg">
                <Link href="/lobbying-data">Explore Data</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Analytics Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for analyzing California lobbying data
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Role-Based Access
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Different access levels to meet your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(roleFeatures).map(([role, features]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="capitalize text-center">
                    {role.replace('_', ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of researchers, journalists, and citizens who rely on our platform
            for California lobbying insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {isSignedIn ? (
              <Button asChild variant="secondary" size="lg">
                <Link href="/lobbying-data">Explore Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/sign-up">Get Started Today</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-gray-600">
          <p>&copy; 2024 CA Lobby Platform. Built for transparency and accountability.</p>
        </div>
      </footer>
    </div>
  )
}