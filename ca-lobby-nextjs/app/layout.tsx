import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Suspense } from 'react'
import { AnalyticsProvider } from './components/AnalyticsProvider'
import { PerformanceMonitor } from './components/PerformanceMonitor'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CA Lobby Dashboard',
  description: 'California Lobbying Data Analysis Platform',
  keywords: ['California', 'Lobbying', 'Data', 'Analysis', 'Transparency'],
  authors: [{ name: 'CA Lobby Team' }],
  openGraph: {
    title: 'CA Lobby Dashboard',
    description: 'California Lobbying Data Analysis Platform',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#2563eb',
        },
      }}
    >
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#2563eb" />
        </head>
        <body className={inter.className}>
          <Suspense fallback={null}>
            <PerformanceMonitor />
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}