"use client"

import React from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthButtons } from '@/components/auth/SignInButton'
import { UserProfile } from '@/components/auth/UserProfile'
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
  data_manager: [
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
  const { isSignedIn, isLoaded, user } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back to CA Lobby
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Continue your analysis of California lobbying data
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* User Profile */}
            <div className="lg:col-span-1">
              <UserProfile showPermissions showMetadata />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Jump to your most frequently used features
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <Button asChild className="h-auto p-4 flex-col items-start">
                    <Link href="/dashboard">
                      <BarChart3Icon className="h-6 w-6 mb-2" />
                      <span className="font-medium">View Dashboard</span>
                      <span className="text-xs text-muted-foreground">
                        Access your main analytics dashboard
                      </span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
                    <Link href="/lobbying-data">
                      <DatabaseIcon className="h-6 w-6 mb-2" />
                      <span className="font-medium">Browse Data</span>
                      <span className="text-xs text-muted-foreground">
                        Search and explore lobbying records
                      </span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
                    <Link href="/reports">
                      <TrendingUpIcon className="h-6 w-6 mb-2" />
                      <span className="font-medium">View Reports</span>
                      <span className="text-xs text-muted-foreground">
                        Access generated reports and insights
                      </span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex-col items-start">
                    <Link href="/data/analyze">
                      <UsersIcon className="h-6 w-6 mb-2" />
                      <span className="font-medium">Data Analysis</span>
                      <span className="text-xs text-muted-foreground">
                        Perform custom data analysis
                      </span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Role-based Features */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Access Level</CardTitle>
                    <CardDescription>
                      Features available to your role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {roleFeatures[user.publicMetadata?.role as keyof typeof roleFeatures]?.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DatabaseIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CA Lobby</span>
          </div>
          <AuthButtons />
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
            <AuthButtons />
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
          <AuthButtons />
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