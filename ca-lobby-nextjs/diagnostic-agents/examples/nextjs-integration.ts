/**
 * Next.js Integration Examples
 * Shows how to integrate diagnostic agents with Next.js applications
 */

import { DiagnosticCoordinator, createConfig } from '../index'
import { setupDiagnostics, createDiagnosticAPIHandler } from '../utils/dev-integration'

// Example 1: Next.js Middleware Integration
export function createDiagnosticMiddleware() {
  let coordinator: DiagnosticCoordinator | null = null

  return async function middleware(request: Request) {
    // Only run diagnostics in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    // Initialize coordinator on first request
    if (!coordinator) {
      try {
        const config = await createConfig({
          environment: 'development',
          override: {
            realTimeMonitoring: true,
            logLevel: 'info'
          }
        })

        coordinator = new DiagnosticCoordinator(config)
        await coordinator.startMonitoring()

        console.log('🔍 Diagnostic middleware initialized')
      } catch (error) {
        console.error('Failed to initialize diagnostic middleware:', error)
      }
    }

    // Add diagnostic headers to response
    if (coordinator) {
      try {
        const stats = coordinator.getStatistics()
        const response = new Response()

        response.headers.set('X-Diagnostic-Issues', stats.totalIssues.toString())
        response.headers.set('X-Diagnostic-Critical', stats.issuesBySeverity.critical.toString())
        response.headers.set('X-Diagnostic-High', stats.issuesBySeverity.high.toString())

        return response
      } catch (error) {
        console.debug('Failed to add diagnostic headers:', error)
      }
    }
  }
}

// Example 2: API Route Integration (App Router)
export function createDiagnosticAPIRoute() {
  let coordinator: DiagnosticCoordinator | null = null

  async function initCoordinator() {
    if (!coordinator) {
      const config = await createConfig({ environment: 'development' })
      coordinator = new DiagnosticCoordinator(config)
      await coordinator.startMonitoring()
    }
    return coordinator
  }

  return {
    // GET /api/diagnostics - Get current status
    async GET() {
      try {
        const coord = await initCoordinator()
        const stats = coord.getStatistics()
        const issues = coord.getActiveIssues()

        return Response.json({
          status: 'running',
          timestamp: new Date().toISOString(),
          statistics: stats,
          activeIssues: issues.length,
          issues: issues.slice(0, 10).map(issue => ({
            id: issue.id,
            title: issue.title,
            severity: issue.severity,
            category: issue.category,
            timestamp: issue.timestamp
          }))
        })

      } catch (error) {
        return Response.json(
          { error: 'Failed to get diagnostic status' },
          { status: 500 }
        )
      }
    },

    // POST /api/diagnostics - Run diagnostic scan
    async POST() {
      try {
        const coord = await initCoordinator()
        const report = await coord.runDiagnostic()

        return Response.json({
          message: 'Diagnostic scan completed',
          reportId: report.id,
          timestamp: report.timestamp,
          summary: report.summary,
          recommendations: report.recommendations,
          metadata: report.metadata
        })

      } catch (error) {
        return Response.json(
          { error: 'Failed to run diagnostic scan' },
          { status: 500 }
        )
      }
    },

    // DELETE /api/diagnostics - Stop monitoring
    async DELETE() {
      try {
        if (coordinator) {
          await coordinator.stopMonitoring()
          coordinator = null
        }

        return Response.json({
          message: 'Diagnostic monitoring stopped'
        })

      } catch (error) {
        return Response.json(
          { error: 'Failed to stop monitoring' },
          { status: 500 }
        )
      }
    }
  }
}

// Example 3: Pages Router Integration
export class PagesRouterDiagnostics {
  private coordinator: DiagnosticCoordinator | null = null

  async initializeForPagesRouter() {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    try {
      const config = await createConfig({
        environment: 'development',
        override: {
          agents: {
            // Adjust for pages router
            auth: { checkAuthFlows: true },
            typescript: { checkTypes: true },
            runtime: { monitorConsole: true },
            build: { monitorNextBuild: false },
            network: { monitorAPIcalls: true }
          }
        }
      })

      this.coordinator = new DiagnosticCoordinator(config)

      // Set up event handlers
      this.coordinator.on('issue', (event) => {
        const issue = event.data
        if (issue.severity === 'critical' || issue.severity === 'high') {
          console.log(`🔍 [DIAGNOSTIC] ${issue.title}`)
        }
      })

      await this.coordinator.startMonitoring()
      console.log('🔍 Diagnostics initialized for Pages Router')

    } catch (error) {
      console.error('Failed to initialize diagnostics for Pages Router:', error)
    }
  }

  // API handler for pages/api/diagnostics.ts
  async handleAPIRequest(req: any, res: any) {
    if (!this.coordinator) {
      return res.status(503).json({ error: 'Diagnostics not initialized' })
    }

    try {
      switch (req.method) {
        case 'GET':
          const stats = this.coordinator.getStatistics()
          const issues = this.coordinator.getActiveIssues()

          res.json({
            status: 'running',
            statistics: stats,
            activeIssues: issues.length,
            issues: issues.slice(0, 5)
          })
          break

        case 'POST':
          const report = await this.coordinator.runDiagnostic()

          res.json({
            message: 'Scan completed',
            summary: report.summary,
            timestamp: report.timestamp
          })
          break

        default:
          res.status(405).json({ error: 'Method not allowed' })
      }

    } catch (error) {
      console.error('Diagnostic API error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async stop() {
    if (this.coordinator) {
      await this.coordinator.stopMonitoring()
      this.coordinator = null
    }
  }
}

// Example 4: Custom Hook for React Components
export function useDiagnostics() {
  const [issues, setIssues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const fetchDiagnostics = useCallback(async () => {
    try {
      const response = await fetch('/api/diagnostics')
      if (response.ok) {
        const data = await response.json()
        setIssues(data.issues || [])
        setStats(data.statistics || null)
      }
    } catch (error) {
      console.error('Failed to fetch diagnostics:', error)
    }
  }, [])

  const runScan = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/diagnostics', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        await fetchDiagnostics() // Refresh data
        return data
      }
    } catch (error) {
      console.error('Failed to run diagnostic scan:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchDiagnostics])

  useEffect(() => {
    // Fetch initial data
    fetchDiagnostics()

    // Poll for updates in development
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(fetchDiagnostics, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [fetchDiagnostics])

  return {
    issues,
    stats,
    isLoading,
    runScan,
    refresh: fetchDiagnostics
  }
}

// Example 5: Development Dashboard Component
export function DiagnosticDashboard() {
  const { issues, stats, isLoading, runScan, refresh } = useDiagnostics()

  if (process.env.NODE_ENV !== 'development') {
    return null // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 300,
      backgroundColor: '#1f2937',
      color: 'white',
      padding: 16,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'monospace',
      zIndex: 9999,
      maxHeight: 400,
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>🔍 Diagnostics</h3>
        <div>
          <button
            onClick={refresh}
            style={{ marginRight: 8, padding: '4px 8px', fontSize: 12 }}
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            onClick={runScan}
            style={{ padding: '4px 8px', fontSize: 12 }}
            disabled={isLoading}
          >
            {isLoading ? 'Scanning...' : 'Scan'}
          </button>
        </div>
      </div>

      {stats && (
        <div style={{ marginBottom: 12 }}>
          <div>Total Issues: {stats.totalIssues}</div>
          {stats.issuesBySeverity.critical > 0 && (
            <div style={{ color: '#ef4444' }}>🚨 Critical: {stats.issuesBySeverity.critical}</div>
          )}
          {stats.issuesBySeverity.high > 0 && (
            <div style={{ color: '#f59e0b' }}>⚠️ High: {stats.issuesBySeverity.high}</div>
          )}
        </div>
      )}

      {issues.length > 0 ? (
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Recent Issues:</h4>
          {issues.map((issue, index) => (
            <div
              key={issue.id || index}
              style={{
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#374151',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <div style={{
                color: issue.severity === 'critical' ? '#ef4444' :
                      issue.severity === 'high' ? '#f59e0b' :
                      issue.severity === 'medium' ? '#10b981' : '#6b7280'
              }}>
                {issue.severity === 'critical' ? '🚨' :
                 issue.severity === 'high' ? '⚠️' :
                 issue.severity === 'medium' ? '⚡' : 'ℹ️'} {issue.title}
              </div>
              <div style={{ color: '#9ca3af', fontSize: 11 }}>
                {issue.category} • {new Date(issue.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: '#10b981' }}>✅ No active issues</div>
      )}
    </div>
  )
}

// Example 6: Build-time Integration
export function withDiagnostics(nextConfig: any = {}) {
  return {
    ...nextConfig,

    // Add webpack plugin for build-time diagnostics
    webpack: (config: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
      if (dev && !isServer) {
        // Add diagnostic plugin for development client builds
        config.plugins.push(
          new webpack.DefinePlugin({
            'process.env.DIAGNOSTIC_BUILD_ID': JSON.stringify(buildId)
          })
        )
      }

      // Run existing webpack config
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, { buildId, dev, isServer, defaultLoaders, webpack })
      }

      return config
    },

    // Add diagnostic headers
    async headers() {
      const baseHeaders = nextConfig.headers ? await nextConfig.headers() : []

      if (process.env.NODE_ENV === 'development') {
        baseHeaders.push({
          source: '/(.*)',
          headers: [
            {
              key: 'X-Diagnostic-Enabled',
              value: 'true'
            }
          ]
        })
      }

      return baseHeaders
    },

    // Add diagnostic rewrites
    async rewrites() {
      const baseRewrites = nextConfig.rewrites ? await nextConfig.rewrites() : []

      if (process.env.NODE_ENV === 'development') {
        // Add diagnostic dashboard route
        return {
          ...baseRewrites,
          fallback: [
            ...(baseRewrites.fallback || []),
            {
              source: '/_diagnostics',
              destination: '/api/diagnostics'
            }
          ]
        }
      }

      return baseRewrites
    }
  }
}

// Example 7: Environment Detection and Auto-Setup
export async function autoSetupDiagnostics() {
  // Auto-detect environment and setup appropriate diagnostics
  const isNext = typeof window === 'undefined' && process.env.NEXT_RUNTIME
  const isDev = process.env.NODE_ENV === 'development'
  const isPages = typeof window === 'undefined' && require('fs').existsSync('./pages')
  const isApp = typeof window === 'undefined' && require('fs').existsSync('./app')

  if (!isDev) {
    console.log('🔍 Diagnostics: Not in development mode, skipping auto-setup')
    return null
  }

  try {
    console.log('🔍 Auto-setting up diagnostics for Next.js application')

    const config = await createConfig({
      environment: 'development',
      override: {
        logLevel: 'info',
        realTimeMonitoring: true,
        agents: {
          auth: { devModeBypass: true },
          build: { monitorNextBuild: false }, // Skip in auto-setup
          network: { checkConnectivity: false } // Skip external checks
        }
      }
    })

    const coordinator = new DiagnosticCoordinator(config)

    // Setup appropriate monitoring for detected environment
    coordinator.on('issue', (event) => {
      const issue = event.data
      if (issue.severity === 'critical' || issue.severity === 'high') {
        console.log(`\n🔍 [AUTO-DIAGNOSTIC] ${issue.title}`)
        console.log(`   ${issue.description}`)
        if (issue.suggestions.length > 0) {
          console.log(`   💡 ${issue.suggestions[0]}`)
        }
        console.log('')
      }
    })

    await coordinator.startMonitoring()

    // Run initial scan after a delay
    setTimeout(async () => {
      try {
        const report = await coordinator.runDiagnostic()
        if (report.summary.totalIssues > 0) {
          console.log(`\n🔍 Initial diagnostic scan: ${report.summary.totalIssues} issues found`)
          if (report.summary.criticalIssues > 0) {
            console.log(`🚨 ${report.summary.criticalIssues} critical issues need attention`)
          }
        }
      } catch (error) {
        console.debug('Initial diagnostic scan failed:', error)
      }
    }, 3000)

    return coordinator

  } catch (error) {
    console.error('🔍 Failed to auto-setup diagnostics:', error)
    return null
  }
}

// Export all integration examples
export {
  createDiagnosticMiddleware,
  createDiagnosticAPIRoute,
  PagesRouterDiagnostics,
  withDiagnostics,
  autoSetupDiagnostics
}

// Auto-setup if this module is imported
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Auto-setup with a delay to avoid blocking application startup
  setTimeout(() => {
    autoSetupDiagnostics().catch(console.debug)
  }, 1000)
}