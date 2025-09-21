/**
 * Diagnostic Coordinator
 * Orchestrates all diagnostic agents and provides unified reporting
 */

import { DiagnosticAgent, DiagnosticIssue, DiagnosticReport, DiagnosticConfig, MonitoringEvent, ErrorSeverity } from './types'
import { AuthDiagnosticAgent } from './agents/auth-agent'
import { TypeScriptDiagnosticAgent } from './agents/typescript-agent'
import { RuntimeDiagnosticAgent } from './agents/runtime-agent'
import { BuildDiagnosticAgent } from './agents/build-agent'
import { NetworkDiagnosticAgent } from './agents/network-agent'
import { EventEmitter } from 'events'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

export class DiagnosticCoordinator extends EventEmitter {
  private agents: Map<string, DiagnosticAgent> = new Map()
  private config: DiagnosticConfig
  private isRunning: boolean = false
  private monitoringInterval?: NodeJS.Timeout
  private reportHistory: DiagnosticReport[] = []
  private activeIssues: Map<string, DiagnosticIssue> = new Map()

  constructor(config?: Partial<DiagnosticConfig>) {
    super()

    this.config = {
      enabled: true,
      logLevel: 'info',
      outputDir: './diagnostic-reports',
      autoFix: false,
      realTimeMonitoring: true,
      agents: {
        auth: {
          checkClerkProvider: true,
          checkUserContext: true,
          checkMiddleware: true,
          checkEnvironmentVars: true,
          checkAuthFlows: true,
          devModeBypass: true,
        },
        typescript: {
          strictMode: true,
          checkTypes: true,
          checkImports: true,
          checkExports: true,
          checkInterfaces: true,
        },
        runtime: {
          monitorConsole: true,
          checkUndefinedVars: true,
          checkAsyncErrors: true,
          checkDOMErrors: true,
          checkModuleErrors: true,
          captureUnhandledRejections: true,
        },
        build: {
          monitorNextBuild: true,
          checkWebpack: true,
          checkDependencies: true,
          checkCSS: true,
          checkHotReload: true,
          buildCommand: 'npm run build',
        },
        network: {
          monitorAPIcalls: true,
          checkCORS: true,
          checkTimeouts: true,
          checkConnectivity: true,
          checkGraphQL: true,
          maxRetries: 3,
          timeoutThreshold: 5000,
        }
      },
      ...config
    }

    this.initializeAgents()
  }

  private initializeAgents(): void {
    // Initialize all diagnostic agents
    const authAgent = new AuthDiagnosticAgent()
    const typescriptAgent = new TypeScriptDiagnosticAgent()
    const runtimeAgent = new RuntimeDiagnosticAgent()
    const buildAgent = new BuildDiagnosticAgent()
    const networkAgent = new NetworkDiagnosticAgent()

    // Configure agents
    authAgent.configure(this.config.agents.auth)
    typescriptAgent.configure(this.config.agents.typescript)
    runtimeAgent.configure(this.config.agents.runtime)
    buildAgent.configure(this.config.agents.build)
    networkAgent.configure(this.config.agents.network)

    // Register agents
    this.agents.set('auth', authAgent)
    this.agents.set('typescript', typescriptAgent)
    this.agents.set('runtime', runtimeAgent)
    this.agents.set('build', buildAgent)
    this.agents.set('network', networkAgent)

    // Set up event listeners for real-time monitoring
    if (this.config.realTimeMonitoring) {
      this.setupAgentMonitoring()
    }

    this.log('info', `Initialized ${this.agents.size} diagnostic agents`)
  }

  private setupAgentMonitoring(): void {
    for (const [agentName, agent] of this.agents) {
      if (agent.monitor) {
        agent.monitor((issue: DiagnosticIssue) => {
          this.handleRealTimeIssue(agentName, issue)
        })
      }
    }
  }

  private handleRealTimeIssue(agentName: string, issue: DiagnosticIssue): void {
    // Store the issue
    this.activeIssues.set(issue.id, issue)

    // Emit monitoring event
    const event: MonitoringEvent = {
      type: 'issue_detected',
      timestamp: new Date(),
      agentName,
      data: issue
    }

    this.emit('issue', event)
    this.log('warn', `Real-time issue detected by ${agentName}: ${issue.title}`)

    // Auto-fix if enabled and suggestions are available
    if (this.config.autoFix && issue.suggestions.length > 0) {
      this.attemptAutoFix(issue)
    }
  }

  private async attemptAutoFix(issue: DiagnosticIssue): Promise<void> {
    try {
      this.log('info', `Attempting auto-fix for issue: ${issue.title}`)

      // Basic auto-fix logic based on issue category and suggestions
      let fixed = false

      switch (issue.category) {
        case 'auth':
          fixed = await this.autoFixAuthIssue(issue)
          break
        case 'typescript':
          fixed = await this.autoFixTypeScriptIssue(issue)
          break
        case 'build':
          fixed = await this.autoFixBuildIssue(issue)
          break
        // Add more auto-fix categories as needed
      }

      if (fixed) {
        issue.status = 'resolved'
        this.log('info', `Auto-fixed issue: ${issue.title}`)

        const event: MonitoringEvent = {
          type: 'issue_resolved',
          timestamp: new Date(),
          agentName: 'coordinator',
          data: { issueId: issue.id, autoFixed: true }
        }

        this.emit('resolved', event)
      }

    } catch (error) {
      this.log('error', `Auto-fix failed for issue ${issue.id}:`, error)
    }
  }

  private async autoFixAuthIssue(issue: DiagnosticIssue): Promise<boolean> {
    // Implement basic auth auto-fixes
    if (issue.title.includes('Missing Required Environment Variable')) {
      // Can't auto-fix missing env vars, but can provide guidance
      this.log('info', 'Cannot auto-fix missing environment variables - manual intervention required')
      return false
    }

    return false
  }

  private async autoFixTypeScriptIssue(issue: DiagnosticIssue): Promise<boolean> {
    // Implement basic TypeScript auto-fixes
    if (issue.title.includes('TypeScript Strict Mode Disabled')) {
      // Could potentially modify tsconfig.json, but risky
      this.log('info', 'TypeScript configuration changes require manual review')
      return false
    }

    return false
  }

  private async autoFixBuildIssue(issue: DiagnosticIssue): Promise<boolean> {
    // Implement basic build auto-fixes
    if (issue.title.includes('Dependencies Not Installed')) {
      try {
        this.log('info', 'Attempting to install dependencies...')
        const { spawn } = require('child_process')

        return new Promise((resolve) => {
          const child = spawn('npm', ['install'], { stdio: 'pipe' })

          child.on('close', (code: number) => {
            resolve(code === 0)
          })
        })
      } catch {
        return false
      }
    }

    return false
  }

  /**
   * Run a complete diagnostic scan across all agents
   */
  async runDiagnostic(): Promise<DiagnosticReport> {
    this.log('info', 'Starting comprehensive diagnostic scan')

    const reportId = uuidv4()
    const startTime = Date.now()
    const agentResults: DiagnosticReport['agentResults'] = {}
    const allIssues: DiagnosticIssue[] = []

    // Run each agent
    for (const [agentName, agent] of this.agents) {
      const agentStartTime = Date.now()

      try {
        this.log('debug', `Running ${agentName} agent`)

        const issues = await agent.scan()
        const duration = Date.now() - agentStartTime

        agentResults[agentName] = {
          status: 'success',
          duration,
          issuesFound: issues.length
        }

        allIssues.push(...issues)

        this.log('debug', `${agentName} agent completed: ${issues.length} issues found in ${duration}ms`)

      } catch (error: any) {
        const duration = Date.now() - agentStartTime

        agentResults[agentName] = {
          status: 'error',
          duration,
          issuesFound: 0,
          error: error.message
        }

        this.log('error', `${agentName} agent failed:`, error)
      }
    }

    // Create comprehensive report
    const report: DiagnosticReport = {
      id: reportId,
      timestamp: new Date(),
      summary: this.createIssueSummary(allIssues),
      issues: allIssues,
      agentResults,
      recommendations: this.generateRecommendations(allIssues),
      metadata: await this.collectMetadata()
    }

    // Store report
    this.reportHistory.push(report)
    if (this.reportHistory.length > 50) {
      this.reportHistory.shift() // Keep only last 50 reports
    }

    // Save report to file
    await this.saveReport(report)

    const totalTime = Date.now() - startTime
    this.log('info', `Diagnostic scan completed in ${totalTime}ms: ${allIssues.length} total issues found`)

    // Emit completion event
    this.emit('scan_complete', report)

    return report
  }

  private createIssueSummary(issues: DiagnosticIssue[]): DiagnosticReport['summary'] {
    const summary = {
      totalIssues: issues.length,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      infoIssues: 0
    }

    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical':
          summary.criticalIssues++
          break
        case 'high':
          summary.highIssues++
          break
        case 'medium':
          summary.mediumIssues++
          break
        case 'low':
          summary.lowIssues++
          break
        case 'info':
          summary.infoIssues++
          break
      }
    }

    return summary
  }

  private generateRecommendations(issues: DiagnosticIssue[]): string[] {
    const recommendations: string[] = []

    // Priority recommendations based on issue patterns
    const criticalIssues = issues.filter(i => i.severity === 'critical')
    const highIssues = issues.filter(i => i.severity === 'high')

    if (criticalIssues.length > 0) {
      recommendations.push(`🚨 Address ${criticalIssues.length} critical issues immediately`)
    }

    if (highIssues.length > 0) {
      recommendations.push(`⚠️ Review ${highIssues.length} high-priority issues`)
    }

    // Category-specific recommendations
    const categoryCount = new Map<string, number>()
    for (const issue of issues) {
      categoryCount.set(issue.category, (categoryCount.get(issue.category) || 0) + 1)
    }

    for (const [category, count] of categoryCount) {
      if (count > 5) {
        switch (category) {
          case 'auth':
            recommendations.push(`🔐 Authentication system needs attention (${count} issues)`)
            break
          case 'typescript':
            recommendations.push(`📝 TypeScript configuration and types need review (${count} issues)`)
            break
          case 'runtime':
            recommendations.push(`⚡ Runtime stability concerns detected (${count} issues)`)
            break
          case 'build':
            recommendations.push(`🔨 Build process needs optimization (${count} issues)`)
            break
          case 'network':
            recommendations.push(`🌐 Network and API issues require attention (${count} issues)`)
            break
        }
      }
    }

    // General recommendations
    if (issues.length > 20) {
      recommendations.push('📊 Consider implementing automated testing to catch issues earlier')
    }

    if (issues.filter(i => i.category === 'security').length > 0) {
      recommendations.push('🔒 Security issues detected - prioritize these fixes')
    }

    return recommendations
  }

  private async collectMetadata(): Promise<DiagnosticReport['metadata']> {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      let packageInfo: any = {}

      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8')
        packageInfo = JSON.parse(packageContent)
      } catch {
        // Package.json not found or invalid
      }

      return {
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        nextVersion: packageInfo.dependencies?.next || 'unknown',
        clerkVersion: packageInfo.dependencies?.['@clerk/nextjs'] || 'unknown',
        projectPath: process.cwd()
      }

    } catch {
      return {
        environment: 'unknown',
        nodeVersion: process.version,
        nextVersion: 'unknown',
        clerkVersion: 'unknown',
        projectPath: process.cwd()
      }
    }
  }

  private async saveReport(report: DiagnosticReport): Promise<void> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.config.outputDir, { recursive: true })

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `diagnostic-report-${timestamp}.json`
      const filepath = path.join(this.config.outputDir, filename)

      // Save detailed JSON report
      await fs.writeFile(filepath, JSON.stringify(report, null, 2))

      // Generate human-readable summary
      const summaryFilename = `diagnostic-summary-${timestamp}.md`
      const summaryPath = path.join(this.config.outputDir, summaryFilename)
      const summaryContent = this.generateMarkdownSummary(report)

      await fs.writeFile(summaryPath, summaryContent)

      this.log('info', `Reports saved: ${filepath} and ${summaryPath}`)

    } catch (error) {
      this.log('error', 'Failed to save diagnostic report:', error)
    }
  }

  private generateMarkdownSummary(report: DiagnosticReport): string {
    const { summary, issues, recommendations, metadata } = report

    let markdown = `# Diagnostic Report\n\n`
    markdown += `**Generated:** ${report.timestamp.toISOString()}\n`
    markdown += `**Report ID:** ${report.id}\n\n`

    // Environment info
    markdown += `## Environment\n\n`
    markdown += `- **Environment:** ${metadata.environment}\n`
    markdown += `- **Node.js:** ${metadata.nodeVersion}\n`
    markdown += `- **Next.js:** ${metadata.nextVersion}\n`
    markdown += `- **Clerk:** ${metadata.clerkVersion}\n`
    markdown += `- **Project Path:** ${metadata.projectPath}\n\n`

    // Summary
    markdown += `## Summary\n\n`
    markdown += `- **Total Issues:** ${summary.totalIssues}\n`
    if (summary.criticalIssues > 0) markdown += `- **🚨 Critical:** ${summary.criticalIssues}\n`
    if (summary.highIssues > 0) markdown += `- **⚠️ High:** ${summary.highIssues}\n`
    if (summary.mediumIssues > 0) markdown += `- **⚡ Medium:** ${summary.mediumIssues}\n`
    if (summary.lowIssues > 0) markdown += `- **ℹ️ Low:** ${summary.lowIssues}\n`
    if (summary.infoIssues > 0) markdown += `- **📝 Info:** ${summary.infoIssues}\n`
    markdown += `\n`

    // Recommendations
    if (recommendations.length > 0) {
      markdown += `## Recommendations\n\n`
      for (const rec of recommendations) {
        markdown += `- ${rec}\n`
      }
      markdown += `\n`
    }

    // Issues by category
    const issuesByCategory = new Map<string, DiagnosticIssue[]>()
    for (const issue of issues) {
      if (!issuesByCategory.has(issue.category)) {
        issuesByCategory.set(issue.category, [])
      }
      issuesByCategory.get(issue.category)!.push(issue)
    }

    for (const [category, categoryIssues] of issuesByCategory) {
      const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
      markdown += `## ${categoryTitle} Issues (${categoryIssues.length})\n\n`

      for (const issue of categoryIssues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })) {
        const severityIcon = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: 'ℹ️',
          info: '📝'
        }[issue.severity]

        markdown += `### ${severityIcon} ${issue.title}\n\n`
        markdown += `**Severity:** ${issue.severity}\n`
        markdown += `**Source:** ${issue.source}\n`
        if (issue.file) markdown += `**File:** ${issue.file}\n`
        if (issue.line) markdown += `**Line:** ${issue.line}\n`
        markdown += `\n${issue.description}\n\n`

        if (issue.suggestions.length > 0) {
          markdown += `**Suggestions:**\n`
          for (const suggestion of issue.suggestions) {
            markdown += `- ${suggestion}\n`
          }
          markdown += `\n`
        }
      }
    }

    return markdown
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      this.log('warn', 'Monitoring is already running')
      return
    }

    this.isRunning = true

    // Start all agent monitoring
    for (const [agentName, agent] of this.agents) {
      try {
        if (agent.monitor) {
          agent.monitor((issue: DiagnosticIssue) => {
            this.handleRealTimeIssue(agentName, issue)
          })
        }

        this.log('debug', `Started monitoring for ${agentName} agent`)

        const event: MonitoringEvent = {
          type: 'agent_started',
          timestamp: new Date(),
          agentName,
          data: {}
        }

        this.emit('agent_started', event)

      } catch (error) {
        this.log('error', `Failed to start monitoring for ${agentName}:`, error)

        const event: MonitoringEvent = {
          type: 'agent_error',
          timestamp: new Date(),
          agentName,
          data: { error: error.message }
        }

        this.emit('agent_error', event)
      }
    }

    // Set up periodic health checks
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck()
    }, 60000) // Every minute

    this.log('info', 'Real-time monitoring started for all agents')
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false

    // Stop all agents
    for (const [agentName, agent] of this.agents) {
      try {
        if (agent.stop) {
          agent.stop()
        }

        const event: MonitoringEvent = {
          type: 'agent_stopped',
          timestamp: new Date(),
          agentName,
          data: {}
        }

        this.emit('agent_stopped', event)

      } catch (error) {
        this.log('error', `Error stopping ${agentName} agent:`, error)
      }
    }

    // Clear monitoring interval
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    this.log('info', 'Monitoring stopped')
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check agent health
      for (const [agentName, agent] of this.agents) {
        if (!agent.isActive && this.config.realTimeMonitoring) {
          this.log('warn', `Agent ${agentName} is not active`)
        }
      }

      // Clean up old issues
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000) // 24 hours
      for (const [issueId, issue] of this.activeIssues) {
        if (issue.timestamp.getTime() < cutoffTime) {
          this.activeIssues.delete(issueId)
        }
      }

    } catch (error) {
      this.log('error', 'Health check error:', error)
    }
  }

  /**
   * Get current active issues
   */
  getActiveIssues(): DiagnosticIssue[] {
    return Array.from(this.activeIssues.values())
  }

  /**
   * Get issue statistics
   */
  getStatistics(): {
    totalIssues: number
    issuesBySeverity: Record<ErrorSeverity, number>
    issuesByCategory: Record<string, number>
    agentStatus: Record<string, boolean>
  } {
    const activeIssues = this.getActiveIssues()

    const issuesBySeverity: Record<ErrorSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    }

    const issuesByCategory: Record<string, number> = {}
    const agentStatus: Record<string, boolean> = {}

    for (const issue of activeIssues) {
      issuesBySeverity[issue.severity]++
      issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1
    }

    for (const [agentName, agent] of this.agents) {
      agentStatus[agentName] = agent.isActive
    }

    return {
      totalIssues: activeIssues.length,
      issuesBySeverity,
      issuesByCategory,
      agentStatus
    }
  }

  /**
   * Export report data
   */
  exportReport(format: 'json' | 'csv' | 'markdown' = 'json'): string {
    const latestReport = this.reportHistory[this.reportHistory.length - 1]

    if (!latestReport) {
      return format === 'json' ? '{}' : ''
    }

    switch (format) {
      case 'json':
        return JSON.stringify(latestReport, null, 2)

      case 'markdown':
        return this.generateMarkdownSummary(latestReport)

      case 'csv':
        return this.generateCSVReport(latestReport)

      default:
        return JSON.stringify(latestReport, null, 2)
    }
  }

  private generateCSVReport(report: DiagnosticReport): string {
    const headers = ['Title', 'Severity', 'Category', 'Source', 'File', 'Line', 'Description']
    const rows = [headers.join(',')]

    for (const issue of report.issues) {
      const row = [
        `"${issue.title.replace(/"/g, '""')}"`,
        issue.severity,
        issue.category,
        issue.source,
        issue.file || '',
        issue.line?.toString() || '',
        `"${issue.description.replace(/"/g, '""')}"`
      ]
      rows.push(row.join(','))
    }

    return rows.join('\n')
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [DiagnosticCoordinator] [${level.toUpperCase()}] ${message}`

    if (data) {
      console[level](logMessage, data)
    } else {
      console[level](logMessage)
    }
  }
}