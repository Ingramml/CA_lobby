/**
 * Diagnostic Agent Types and Interfaces
 * Core types for the diagnostic system
 */

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type ErrorCategory = 'auth' | 'typescript' | 'runtime' | 'build' | 'network' | 'performance' | 'security'
export type DiagnosticStatus = 'active' | 'resolved' | 'investigating' | 'ignored'

export interface DiagnosticIssue {
  id: string
  title: string
  description: string
  severity: ErrorSeverity
  category: ErrorCategory
  status: DiagnosticStatus
  timestamp: Date
  source: string
  file?: string
  line?: number
  column?: number
  stackTrace?: string
  suggestions: string[]
  metadata?: Record<string, any>
  relatedIssues?: string[]
}

export interface DiagnosticAgent {
  name: string
  version: string
  category: ErrorCategory
  isActive: boolean
  lastRun?: Date
  scan(): Promise<DiagnosticIssue[]>
  monitor?(callback: (issue: DiagnosticIssue) => void): void
  stop?(): void
  configure?(config: Record<string, any>): void
}

export interface AuthDiagnosticConfig {
  checkClerkProvider: boolean
  checkUserContext: boolean
  checkMiddleware: boolean
  checkEnvironmentVars: boolean
  checkAuthFlows: boolean
  devModeBypass: boolean
}

export interface TypeScriptDiagnosticConfig {
  strictMode: boolean
  checkTypes: boolean
  checkImports: boolean
  checkExports: boolean
  checkInterfaces: boolean
  customTsConfig?: string
}

export interface RuntimeDiagnosticConfig {
  monitorConsole: boolean
  checkUndefinedVars: boolean
  checkAsyncErrors: boolean
  checkDOMErrors: boolean
  checkModuleErrors: boolean
  captureUnhandledRejections: boolean
}

export interface BuildDiagnosticConfig {
  monitorNextBuild: boolean
  checkWebpack: boolean
  checkDependencies: boolean
  checkCSS: boolean
  checkHotReload: boolean
  buildCommand: string
}

export interface NetworkDiagnosticConfig {
  monitorAPIcalls: boolean
  checkCORS: boolean
  checkTimeouts: boolean
  checkConnectivity: boolean
  checkGraphQL: boolean
  maxRetries: number
  timeoutThreshold: number
}

export interface DiagnosticConfig {
  enabled: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  outputDir: string
  autoFix: boolean
  realTimeMonitoring: boolean
  agents: {
    auth: AuthDiagnosticConfig
    typescript: TypeScriptDiagnosticConfig
    runtime: RuntimeDiagnosticConfig
    build: BuildDiagnosticConfig
    network: NetworkDiagnosticConfig
  }
}

export interface DiagnosticReport {
  id: string
  timestamp: Date
  summary: {
    totalIssues: number
    criticalIssues: number
    highIssues: number
    mediumIssues: number
    lowIssues: number
    infoIssues: number
  }
  issues: DiagnosticIssue[]
  agentResults: {
    [agentName: string]: {
      status: 'success' | 'error' | 'timeout'
      duration: number
      issuesFound: number
      error?: string
    }
  }
  recommendations: string[]
  metadata: {
    environment: string
    nodeVersion: string
    nextVersion: string
    clerkVersion: string
    projectPath: string
  }
}

export interface MonitoringEvent {
  type: 'issue_detected' | 'issue_resolved' | 'agent_error' | 'agent_started' | 'agent_stopped'
  timestamp: Date
  agentName: string
  data: any
}

export interface FixSuggestion {
  id: string
  issueId: string
  title: string
  description: string
  automated: boolean
  riskLevel: 'low' | 'medium' | 'high'
  steps: string[]
  code?: {
    file: string
    changes: Array<{
      line: number
      oldCode: string
      newCode: string
    }>
  }
}