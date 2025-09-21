/**
 * Development Server Integration
 * Integrates diagnostic agents with Next.js development workflow
 */

import { DiagnosticCoordinator } from '../coordinator'
import { createConfig } from '../config/default'
import type { DiagnosticConfig, DiagnosticIssue, MonitoringEvent } from '../types'
import { createSourceLogger } from './logger'

const logger = createSourceLogger('dev-integration')

export interface DevIntegrationOptions {
  enabled?: boolean
  port?: number
  autostart?: boolean
  config?: Partial<DiagnosticConfig>
  onIssue?: (issue: DiagnosticIssue) => void
  onReport?: (report: any) => void
  periodicScan?: boolean
  scanInterval?: number
}

export class DevServerIntegration {
  private coordinator?: DiagnosticCoordinator
  private isRunning: boolean = false
  private scanInterval?: NodeJS.Timeout
  private options: DevIntegrationOptions

  constructor(options: DevIntegrationOptions = {}) {
    this.options = {
      enabled: true,
      port: 3000,
      autostart: true,
      periodicScan: true,
      scanInterval: 60000, // 1 minute
      ...options
    }
  }

  /**
   * Initialize diagnostic monitoring for development
   */
  async initialize(): Promise<void> {
    if (!this.options.enabled) {
      logger.info('Diagnostic integration disabled')
      return
    }

    logger.info('Initializing diagnostic integration for development')

    try {
      // Create development-optimized configuration
      const config = await createConfig({
        environment: 'development',
        override: {
          realTimeMonitoring: true,
          logLevel: 'info',
          ...this.options.config
        }
      })

      this.coordinator = new DiagnosticCoordinator(config)

      // Set up event listeners
      this.setupEventListeners()

      if (this.options.autostart) {
        await this.start()
      }

      logger.info('Diagnostic integration initialized')

    } catch (error) {
      logger.error('Failed to initialize diagnostic integration', error)
      throw error
    }
  }

  /**
   * Start monitoring
   */
  async start(): Promise<void> {
    if (!this.coordinator) {
      throw new Error('Integration not initialized. Call initialize() first.')
    }

    if (this.isRunning) {
      logger.warn('Diagnostic monitoring is already running')
      return
    }

    logger.info('Starting diagnostic monitoring')

    try {
      // Start real-time monitoring
      await this.coordinator.startMonitoring()

      // Start periodic scans if enabled
      if (this.options.periodicScan) {
        this.startPeriodicScans()
      }

      this.isRunning = true
      logger.info('Diagnostic monitoring started')

    } catch (error) {
      logger.error('Failed to start diagnostic monitoring', error)
      throw error
    }
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    logger.info('Stopping diagnostic monitoring')

    try {
      if (this.coordinator) {
        await this.coordinator.stopMonitoring()
      }

      if (this.scanInterval) {
        clearInterval(this.scanInterval)
        this.scanInterval = undefined
      }

      this.isRunning = false
      logger.info('Diagnostic monitoring stopped')

    } catch (error) {
      logger.error('Error stopping diagnostic monitoring', error)
    }
  }

  /**
   * Run a one-time diagnostic scan
   */
  async runScan(): Promise<any> {
    if (!this.coordinator) {
      throw new Error('Integration not initialized')
    }

    logger.info('Running diagnostic scan')

    try {
      const report = await this.coordinator.runDiagnostic()

      if (this.options.onReport) {
        this.options.onReport(report)
      }

      logger.info(`Scan completed: ${report.summary.totalIssues} issues found`)
      return report

    } catch (error) {
      logger.error('Diagnostic scan failed', error)
      throw error
    }
  }

  /**
   * Get current statistics
   */
  getStatistics(): any {
    if (!this.coordinator) {
      return null
    }

    return this.coordinator.getStatistics()
  }

  /**
   * Get active issues
   */
  getActiveIssues(): DiagnosticIssue[] {
    if (!this.coordinator) {
      return []
    }

    return this.coordinator.getActiveIssues()
  }

  private setupEventListeners(): void {
    if (!this.coordinator) return

    // Handle real-time issues
    this.coordinator.on('issue', (event: MonitoringEvent) => {
      const issue = event.data as DiagnosticIssue

      // Log to console with appropriate level
      const logLevel = issue.severity === 'critical' || issue.severity === 'high' ? 'error' :
                      issue.severity === 'medium' ? 'warn' : 'info'

      logger[logLevel](`${issue.title} (${issue.category})`, {
        source: issue.source,
        file: issue.file,
        line: issue.line,
        suggestions: issue.suggestions
      })

      // Call custom handler
      if (this.options.onIssue) {
        this.options.onIssue(issue)
      }

      // Display user-friendly notification
      this.displayIssueNotification(issue)
    })

    // Handle scan completion
    this.coordinator.on('scan_complete', (report) => {
      logger.info(`Periodic scan completed: ${report.summary.totalIssues} issues`)

      if (this.options.onReport) {
        this.options.onReport(report)
      }
    })

    // Handle agent errors
    this.coordinator.on('agent_error', (event: MonitoringEvent) => {
      logger.error(`Agent error: ${event.agentName}`, event.data)
    })
  }

  private startPeriodicScans(): void {
    if (!this.options.scanInterval) return

    this.scanInterval = setInterval(async () => {
      try {
        await this.runScan()
      } catch (error) {
        logger.error('Periodic scan failed', error)
      }
    }, this.options.scanInterval)

    logger.info(`Periodic scans enabled (interval: ${this.options.scanInterval}ms)`)
  }

  private displayIssueNotification(issue: DiagnosticIssue): void {
    const severityColors = {
      critical: '\x1b[41m\x1b[37m', // Red background, white text
      high: '\x1b[31m',             // Red text
      medium: '\x1b[33m',           // Yellow text
      low: '\x1b[36m',              // Cyan text
      info: '\x1b[37m'              // White text
    }

    const resetColor = '\x1b[0m'
    const color = severityColors[issue.severity]

    const icon = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
      info: '📝'
    }[issue.severity]

    console.log(`\n${color}${icon} [DIAGNOSTIC] ${issue.title}${resetColor}`)
    console.log(`   Category: ${issue.category}`)
    if (issue.file) {
      console.log(`   Location: ${issue.file}:${issue.line || 0}`)
    }
    console.log(`   ${issue.description}`)

    if (issue.suggestions.length > 0) {
      console.log(`   💡 Suggestion: ${issue.suggestions[0]}`)
    }
    console.log('')
  }
}

/**
 * Quick setup function for Next.js development
 */
export async function setupDiagnostics(options: DevIntegrationOptions = {}): Promise<DevServerIntegration> {
  const integration = new DevServerIntegration(options)
  await integration.initialize()
  return integration
}

/**
 * Middleware factory for Next.js
 */
export function createDiagnosticMiddleware(options: DevIntegrationOptions = {}) {
  let integration: DevServerIntegration | null = null

  return async function diagnosticMiddleware(req: any, res: any, next: any) {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return next()
    }

    // Initialize on first request
    if (!integration && options.enabled !== false) {
      try {
        integration = await setupDiagnostics({
          autostart: true,
          ...options
        })

        logger.info('Diagnostic middleware initialized')
      } catch (error) {
        logger.error('Failed to initialize diagnostic middleware', error)
      }
    }

    // Add diagnostic info to response headers (if enabled)
    if (integration && options.enabled !== false) {
      try {
        const stats = integration.getStatistics()
        if (stats) {
          res.setHeader('X-Diagnostic-Issues', stats.totalIssues.toString())
          res.setHeader('X-Diagnostic-Session', integration.coordinator?.sessionId || 'unknown')
        }
      } catch (error) {
        // Don't fail the request if diagnostics fail
        logger.debug('Failed to add diagnostic headers', error)
      }
    }

    next()
  }
}

/**
 * Express/Connect middleware
 */
export function expressMiddleware(options: DevIntegrationOptions = {}) {
  return createDiagnosticMiddleware(options)
}

/**
 * Next.js API route handler
 */
export function createDiagnosticAPIHandler(integration?: DevServerIntegration) {
  return async function handler(req: any, res: any) {
    if (!integration) {
      return res.status(503).json({ error: 'Diagnostic integration not initialized' })
    }

    try {
      switch (req.method) {
        case 'GET':
          // Get current status
          const stats = integration.getStatistics()
          const issues = integration.getActiveIssues()

          res.json({
            status: 'running',
            statistics: stats,
            activeIssues: issues.length,
            issues: issues.slice(0, 10) // Limit to 10 most recent
          })
          break

        case 'POST':
          // Run scan
          const report = await integration.runScan()
          res.json({
            message: 'Scan completed',
            report: {
              summary: report.summary,
              timestamp: report.timestamp,
              issueCount: report.issues.length
            }
          })
          break

        default:
          res.status(405).json({ error: 'Method not allowed' })
      }

    } catch (error) {
      logger.error('Diagnostic API handler error', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Development server startup hook
 */
export async function onDevServerStart(options: DevIntegrationOptions = {}): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  try {
    const integration = await setupDiagnostics({
      autostart: true,
      periodicScan: true,
      ...options
    })

    // Welcome message
    console.log('\n🔍 CA Lobby Diagnostic Agents Started')
    console.log('   Real-time monitoring enabled')
    console.log('   Periodic scans every 60 seconds')
    console.log('   Check diagnostic status at /api/diagnostics\n')

    // Run initial scan
    setTimeout(async () => {
      try {
        const report = await integration.runScan()
        if (report.summary.totalIssues > 0) {
          console.log(`📊 Initial diagnostic scan: ${report.summary.totalIssues} issues found`)
          if (report.summary.criticalIssues > 0) {
            console.log(`🚨 ${report.summary.criticalIssues} critical issues require immediate attention`)
          }
        } else {
          console.log('✅ Initial diagnostic scan: No issues found')
        }
      } catch (error) {
        logger.error('Initial diagnostic scan failed', error)
      }
    }, 2000) // Wait 2 seconds for server to fully start

  } catch (error) {
    logger.error('Failed to start diagnostic monitoring', error)
  }
}

/**
 * Development server shutdown hook
 */
export async function onDevServerShutdown(): Promise<void> {
  // This would be called when the dev server shuts down
  logger.info('Development server shutting down - stopping diagnostics')
}