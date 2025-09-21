/**
 * Diagnostic Agents Entry Point
 * Main exports for the diagnostic system
 */

// Core coordinator
export { DiagnosticCoordinator } from './coordinator'

// Individual agents
export { AuthDiagnosticAgent } from './agents/auth-agent'
export { TypeScriptDiagnosticAgent } from './agents/typescript-agent'
export { RuntimeDiagnosticAgent } from './agents/runtime-agent'
export { BuildDiagnosticAgent } from './agents/build-agent'
export { NetworkDiagnosticAgent } from './agents/network-agent'

// Base agent class
export { BaseDiagnosticAgent } from './utils/base-agent'

// Types
export * from './types'

// Configuration
export {
  defaultConfig,
  developmentConfig,
  productionConfig,
  testingConfig,
  ciConfig,
  getEnvironmentConfig,
  mergeConfigs,
  loadConfigFromFile,
  createConfig
} from './config/default'

// Quick start functions
import { DiagnosticCoordinator } from './coordinator'
import { createConfig } from './config/default'
import type { DiagnosticConfig, DiagnosticReport } from './types'

/**
 * Quick start: Create and run a diagnostic scan
 */
export async function runDiagnostic(options?: {
  environment?: 'development' | 'production' | 'test' | 'ci'
  config?: Partial<DiagnosticConfig>
  configFile?: string
}): Promise<DiagnosticReport> {
  const config = await createConfig({
    environment: options?.environment,
    override: options?.config,
    configFile: options?.configFile
  })

  const coordinator = new DiagnosticCoordinator(config)
  return await coordinator.runDiagnostic()
}

/**
 * Quick start: Start real-time monitoring
 */
export async function startMonitoring(options?: {
  environment?: 'development' | 'production' | 'test' | 'ci'
  config?: Partial<DiagnosticConfig>
  configFile?: string
  onIssue?: (issue: any) => void
  onScanComplete?: (report: DiagnosticReport) => void
}): Promise<DiagnosticCoordinator> {
  const config = await createConfig({
    environment: options?.environment,
    override: options?.config,
    configFile: options?.configFile
  })

  const coordinator = new DiagnosticCoordinator(config)

  // Set up event listeners
  if (options?.onIssue) {
    coordinator.on('issue', options.onIssue)
  }

  if (options?.onScanComplete) {
    coordinator.on('scan_complete', options.onScanComplete)
  }

  await coordinator.startMonitoring()
  return coordinator
}

/**
 * Quick start: Run specific agent
 */
export async function runAgent(
  agentType: 'auth' | 'typescript' | 'runtime' | 'build' | 'network',
  config?: any
): Promise<import('./types').DiagnosticIssue[]> {
  let agent: any

  switch (agentType) {
    case 'auth':
      const { AuthDiagnosticAgent } = await import('./agents/auth-agent')
      agent = new AuthDiagnosticAgent()
      break
    case 'typescript':
      const { TypeScriptDiagnosticAgent } = await import('./agents/typescript-agent')
      agent = new TypeScriptDiagnosticAgent()
      break
    case 'runtime':
      const { RuntimeDiagnosticAgent } = await import('./agents/runtime-agent')
      agent = new RuntimeDiagnosticAgent()
      break
    case 'build':
      const { BuildDiagnosticAgent } = await import('./agents/build-agent')
      agent = new BuildDiagnosticAgent()
      break
    case 'network':
      const { NetworkDiagnosticAgent } = await import('./agents/network-agent')
      agent = new NetworkDiagnosticAgent()
      break
    default:
      throw new Error(`Unknown agent type: ${agentType}`)
  }

  if (config) {
    agent.configure(config)
  }

  return await agent.scan()
}

/**
 * Utility: Get diagnostic statistics
 */
export function getDiagnosticStats(coordinator: DiagnosticCoordinator) {
  return coordinator.getStatistics()
}

/**
 * Utility: Export diagnostic report
 */
export function exportDiagnosticReport(
  coordinator: DiagnosticCoordinator,
  format: 'json' | 'csv' | 'markdown' = 'json'
): string {
  return coordinator.exportReport(format)
}

// Default export for convenience
export default {
  runDiagnostic,
  startMonitoring,
  runAgent,
  DiagnosticCoordinator,
  createConfig,
  getDiagnosticStats,
  exportDiagnosticReport
}