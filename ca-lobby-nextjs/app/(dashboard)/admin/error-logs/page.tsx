'use client'

import { useState, useEffect } from 'react'
import { AuthWrapper } from '@/components/auth/AuthWrapper'

interface ErrorLog {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  source: 'build' | 'runtime' | 'api' | 'client'
  message: string
  details?: string
  stackTrace?: string
  userAgent?: string
  userId?: string
  path?: string
  resolved: boolean
}

// Mock error data based on actual build errors encountered
const mockErrors: ErrorLog[] = [
  {
    id: '1',
    timestamp: '2025-09-21T17:30:35.919Z',
    level: 'error',
    source: 'build',
    message: "Module not found: Can't resolve '../../../../mock-data/lobbying_payments.json'",
    details: 'Build failed during Vercel deployment - incorrect import paths for mock data files',
    stackTrace: 'Import trace for requested module: ./app/(dashboard)/lobbying-data/associations/page.tsx\n./app/lib/demo-data.ts',
    path: '/app/lib/demo-data.ts',
    resolved: true
  },
  {
    id: '2',
    timestamp: '2025-09-21T17:28:32.072Z',
    level: 'error',
    source: 'build',
    message: 'Dynamic server usage: Route /api/admin/users couldn\'t be rendered statically',
    details: 'Route used `headers` function which requires dynamic rendering. Fixed by adding export const dynamic = "force-dynamic"',
    stackTrace: 'Error: `headers` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context',
    path: '/api/admin/users',
    resolved: true
  },
  {
    id: '3',
    timestamp: '2025-09-21T17:28:13.075Z',
    level: 'warning',
    source: 'build',
    message: 'A Node.js API is used (setImmediate) which is not supported in the Edge Runtime',
    details: 'Clerk authentication components using Node.js APIs in Edge Runtime. Fixed by adding export const runtime = "nodejs" to middleware',
    stackTrace: '../node_modules/scheduler/cjs/scheduler.production.min.js\n../node_modules/scheduler/index.js\n./node_modules/@clerk/clerk-react/dist/esm/utils/useCustomElementPortal.js',
    path: '/middleware.ts',
    resolved: true
  },
  {
    id: '4',
    timestamp: '2025-09-21T17:28:13.076Z',
    level: 'warning',
    source: 'build',
    message: 'A Node.js API is used (MessageChannel) which is not supported in the Edge Runtime',
    details: 'Additional Node.js API compatibility issue with Clerk in Edge Runtime',
    stackTrace: '../node_modules/scheduler/cjs/scheduler.production.min.js',
    path: '/middleware.ts',
    resolved: true
  },
  {
    id: '5',
    timestamp: '2025-09-21T15:45:22.123Z',
    level: 'error',
    source: 'runtime',
    message: 'Failed to fetch user data from Clerk',
    details: 'Network timeout when connecting to Clerk API',
    path: '/admin/users',
    resolved: false
  },
  {
    id: '6',
    timestamp: '2025-09-21T14:30:15.456Z',
    level: 'warning',
    source: 'api',
    message: 'BigQuery connection failed',
    details: 'GOOGLE_CLOUD_PROJECT_ID not configured, falling back to demo data',
    path: '/api/bigquery/query',
    resolved: false
  }
]

export default function ErrorLogsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>(mockErrors)
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>(mockErrors)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [resolvedFilter, setResolvedFilter] = useState<string>('all')
  const [expandedError, setExpandedError] = useState<string | null>(null)

  // Filter errors based on search and filters
  useEffect(() => {
    let filtered = errors

    if (searchTerm) {
      filtered = filtered.filter(error =>
        error.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        error.path?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(error => error.level === levelFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(error => error.source === sourceFilter)
    }

    if (resolvedFilter !== 'all') {
      const isResolved = resolvedFilter === 'resolved'
      filtered = filtered.filter(error => error.resolved === isResolved)
    }

    setFilteredErrors(filtered)
  }, [errors, searchTerm, levelFilter, sourceFilter, resolvedFilter])

  const toggleResolved = (errorId: string) => {
    setErrors(prev => prev.map(error =>
      error.id === errorId ? { ...error, resolved: !error.resolved } : error
    ))
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredErrors, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const errorStats = {
    total: errors.length,
    unresolved: errors.filter(e => !e.resolved).length,
    errors: errors.filter(e => e.level === 'error').length,
    warnings: errors.filter(e => e.level === 'warning').length
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'build': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'runtime': return 'bg-green-100 text-green-800 border-green-200'
      case 'api': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'client': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <AuthWrapper requireRole="admin">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
            <p className="text-gray-600">
              Track and manage application errors and warnings
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              📥 Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{errorStats.total}</p>
              </div>
              <div className="text-2xl">🐛</div>
            </div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-red-600">{errorStats.unresolved}</p>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Errors</p>
                <p className="text-2xl font-bold">{errorStats.errors}</p>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
          </div>
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold">{errorStats.warnings}</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="build">Build</option>
                <option value="runtime">Runtime</option>
                <option value="api">API</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={resolvedFilter}
                onChange={(e) => setResolvedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="unresolved">Unresolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error List */}
        <div className="space-y-4">
          {filteredErrors.length === 0 ? (
            <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600">No errors found matching your filters.</p>
            </div>
          ) : (
            filteredErrors.map((error) => (
              <div
                key={error.id}
                className={`bg-white border border-gray-200 rounded-lg ${error.resolved ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getLevelColor(error.level)}`}>
                          {error.level.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getSourceColor(error.source)}`}>
                          {error.source.toUpperCase()}
                        </span>
                        {error.resolved && (
                          <span className="px-2 py-1 text-xs font-medium rounded border bg-green-100 text-green-800 border-green-200">
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{error.message}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(error.timestamp).toLocaleString()}
                        {error.path && ` • ${error.path}`}
                      </p>
                      {error.details && (
                        <p className="text-sm text-gray-700 mb-3">{error.details}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleResolved(error.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          error.resolved
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {error.resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                      </button>
                      {error.stackTrace && (
                        <button
                          onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          {expandedError === error.id ? 'Hide Stack' : 'Show Stack'}
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedError === error.id && error.stackTrace && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border">
                      <h4 className="text-sm font-medium mb-2">Stack Trace:</h4>
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap">{error.stackTrace}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthWrapper>
  )
}