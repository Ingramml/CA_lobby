/**
 * Basic Usage Examples for Diagnostic Agents
 * Demonstrates common use cases and patterns
 */

import {
  runDiagnostic,
  startMonitoring,
  runAgent,
  DiagnosticCoordinator,
  createConfig
} from '../index'

// Example 1: Quick diagnostic scan
async function quickScan() {
  console.log('Running quick diagnostic scan...')

  try {
    const report = await runDiagnostic()

    console.log('Scan Results:')
    console.log(`- Total Issues: ${report.summary.totalIssues}`)
    console.log(`- Critical: ${report.summary.criticalIssues}`)
    console.log(`- High: ${report.summary.highIssues}`)
    console.log(`- Medium: ${report.summary.mediumIssues}`)

    // Show recommendations
    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:')
      report.recommendations.forEach(rec => console.log(`- ${rec}`))
    }

    return report

  } catch (error) {
    console.error('Diagnostic scan failed:', error)
    throw error
  }
}

// Example 2: Environment-specific configuration
async function environmentSpecificScan() {
  console.log('Running environment-specific scan...')

  // Development scan
  const devReport = await runDiagnostic({
    environment: 'development',
    config: {
      logLevel: 'debug',
      realTimeMonitoring: false // Just a one-time scan
    }
  })

  console.log('Development scan:', devReport.summary)

  // Production scan (if running in CI/CD)
  const prodReport = await runDiagnostic({
    environment: 'production',
    config: {
      logLevel: 'warn',
      agents: {
        auth: { devModeBypass: false },
        runtime: { monitorConsole: false }
      }
    }
  })

  console.log('Production scan:', prodReport.summary)
}

// Example 3: Real-time monitoring setup
async function setupRealtimeMonitoring() {
  console.log('Setting up real-time monitoring...')

  const coordinator = await startMonitoring({
    environment: 'development',
    config: {
      realTimeMonitoring: true,
      logLevel: 'info'
    },
    onIssue: (event) => {
      const issue = event.data

      // Handle critical issues immediately
      if (issue.severity === 'critical') {
        console.error(`🚨 CRITICAL ISSUE: ${issue.title}`)
        console.error(`   ${issue.description}`)

        // Could send notifications, create tickets, etc.
        sendCriticalAlert(issue)
      }

      // Log all issues
      console.log(`Issue detected: ${issue.title} (${issue.severity})`)
    },
    onScanComplete: (report) => {
      console.log(`Periodic scan completed: ${report.summary.totalIssues} issues`)

      // Track issue trends
      trackIssueTrends(report)
    }
  })

  console.log('Real-time monitoring started')
  return coordinator
}

// Example 4: Running specific agents
async function runSpecificAgents() {
  console.log('Running specific diagnostic agents...')

  // Run only auth diagnostics
  const authIssues = await runAgent('auth', {
    checkEnvironmentVars: true,
    devModeBypass: false
  })

  console.log(`Auth issues found: ${authIssues.length}`)

  // Run only TypeScript diagnostics
  const tsIssues = await runAgent('typescript', {
    strictMode: true,
    checkTypes: true
  })

  console.log(`TypeScript issues found: ${tsIssues.length}`)

  // Run only network diagnostics
  const networkIssues = await runAgent('network', {
    checkConnectivity: true,
    timeoutThreshold: 3000
  })

  console.log(`Network issues found: ${networkIssues.length}`)

  return {
    auth: authIssues,
    typescript: tsIssues,
    network: networkIssues
  }
}

// Example 5: Custom configuration and coordination
async function customCoordinatorSetup() {
  console.log('Setting up custom coordinator...')

  // Create custom configuration
  const config = await createConfig({
    environment: 'development',
    override: {
      outputDir: './custom-reports',
      logLevel: 'debug',
      autoFix: false, // Never auto-fix in this example
      agents: {
        auth: {
          checkClerkProvider: true,
          checkEnvironmentVars: true,
          devModeBypass: true
        },
        typescript: {
          strictMode: false, // More lenient for development
          checkTypes: true
        },
        runtime: {
          monitorConsole: true,
          captureUnhandledRejections: true
        },
        build: {
          checkDependencies: true,
          monitorNextBuild: false // Skip build monitoring
        },
        network: {
          checkConnectivity: false, // Skip external checks
          monitorAPIcalls: true
        }
      }
    }
  })

  // Create coordinator with custom config
  const coordinator = new DiagnosticCoordinator(config)

  // Set up detailed event handling
  coordinator.on('issue', (event) => {
    logIssueWithDetails(event)
  })

  coordinator.on('agent_started', (event) => {
    console.log(`✅ Agent started: ${event.agentName}`)
  })

  coordinator.on('agent_error', (event) => {
    console.error(`❌ Agent error: ${event.agentName}`, event.data)
  })

  coordinator.on('scan_complete', (report) => {
    generateCustomReport(report)
  })

  // Start monitoring
  await coordinator.startMonitoring()

  // Run initial scan
  const initialReport = await coordinator.runDiagnostic()
  console.log('Initial scan completed:', initialReport.summary)

  return coordinator
}

// Example 6: Batch processing and reporting
async function batchProcessingExample() {
  console.log('Running batch processing example...')

  const results = []

  // Run multiple scans with different configurations
  const configurations = [
    { name: 'strict', config: { agents: { typescript: { strictMode: true } } } },
    { name: 'lenient', config: { agents: { typescript: { strictMode: false } } } },
    { name: 'auth-only', config: { agents: { typescript: { checkTypes: false }, runtime: { monitorConsole: false } } } }
  ]

  for (const { name, config } of configurations) {
    console.log(`Running ${name} configuration...`)

    const report = await runDiagnostic({
      environment: 'development',
      config
    })

    results.push({
      name,
      summary: report.summary,
      timestamp: report.timestamp
    })
  }

  // Compare results
  console.log('\nBatch Results Comparison:')
  results.forEach(result => {
    console.log(`${result.name}: ${result.summary.totalIssues} issues`)
  })

  return results
}

// Example 7: Integration with development workflow
async function developmentWorkflowIntegration() {
  console.log('Setting up development workflow integration...')

  // Check if we're in development mode
  if (process.env.NODE_ENV !== 'development') {
    console.log('Not in development mode, skipping diagnostic setup')
    return
  }

  // Set up lightweight monitoring for development
  const coordinator = await startMonitoring({
    environment: 'development',
    config: {
      logLevel: 'info',
      realTimeMonitoring: true,
      agents: {
        auth: { devModeBypass: true },
        build: { monitorNextBuild: false }, // Don't slow down dev builds
        network: { checkConnectivity: false } // Skip external checks
      }
    },
    onIssue: (event) => {
      const issue = event.data

      // Only show important issues in development
      if (issue.severity === 'critical' || issue.severity === 'high') {
        console.log(`\n🔍 [DIAGNOSTIC] ${issue.title}`)
        console.log(`   ${issue.description}`)

        if (issue.suggestions.length > 0) {
          console.log(`   💡 ${issue.suggestions[0]}`)
        }
        console.log('')
      }
    }
  })

  // Run periodic scans every 5 minutes
  setInterval(async () => {
    const stats = coordinator.getStatistics()
    if (stats.totalIssues > 0) {
      console.log(`🔍 Diagnostic status: ${stats.totalIssues} active issues`)
    }
  }, 5 * 60 * 1000)

  return coordinator
}

// Helper functions
function sendCriticalAlert(issue: any) {
  // In a real implementation, this might:
  // - Send Slack notification
  // - Create GitHub issue
  // - Send email alert
  // - Log to external monitoring service

  console.log(`🚨 CRITICAL ALERT: ${issue.title}`)
  console.log(`   Category: ${issue.category}`)
  console.log(`   File: ${issue.file}:${issue.line}`)
  console.log(`   Suggestions: ${issue.suggestions.join(', ')}`)
}

function trackIssueTrends(report: any) {
  // In a real implementation, this might:
  // - Store metrics in database
  // - Update monitoring dashboard
  // - Generate trend reports

  const timestamp = report.timestamp
  const summary = report.summary

  console.log(`📊 Issue trends at ${timestamp}:`)
  console.log(`   Total: ${summary.totalIssues}`)
  console.log(`   Critical: ${summary.criticalIssues}`)
  console.log(`   High: ${summary.highIssues}`)
}

function logIssueWithDetails(event: any) {
  const issue = event.data
  const timestamp = event.timestamp

  console.log(`\n[${timestamp.toISOString()}] Issue detected:`)
  console.log(`  Title: ${issue.title}`)
  console.log(`  Severity: ${issue.severity}`)
  console.log(`  Category: ${issue.category}`)
  console.log(`  Source: ${issue.source}`)

  if (issue.file) {
    console.log(`  Location: ${issue.file}:${issue.line || 0}`)
  }

  console.log(`  Description: ${issue.description}`)

  if (issue.suggestions.length > 0) {
    console.log(`  Suggestions:`)
    issue.suggestions.forEach((suggestion: string, index: number) => {
      console.log(`    ${index + 1}. ${suggestion}`)
    })
  }

  console.log('')
}

function generateCustomReport(report: any) {
  // Generate custom report format
  const summary = report.summary
  const timestamp = report.timestamp

  console.log(`\n📋 Custom Diagnostic Report - ${timestamp.toISOString()}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Total Issues: ${summary.totalIssues}`)

  if (summary.totalIssues > 0) {
    console.log(`Critical: ${summary.criticalIssues}`)
    console.log(`High: ${summary.highIssues}`)
    console.log(`Medium: ${summary.mediumIssues}`)
    console.log(`Low: ${summary.lowIssues}`)
    console.log(`Info: ${summary.infoIssues}`)
  }

  // Show top issues
  const topIssues = report.issues
    .filter((issue: any) => issue.severity === 'critical' || issue.severity === 'high')
    .slice(0, 5)

  if (topIssues.length > 0) {
    console.log(`\nTop Priority Issues:`)
    topIssues.forEach((issue: any, index: number) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`)
    })
  }

  console.log(`${'='.repeat(60)}\n`)
}

// Export examples for use
export {
  quickScan,
  environmentSpecificScan,
  setupRealtimeMonitoring,
  runSpecificAgents,
  customCoordinatorSetup,
  batchProcessingExample,
  developmentWorkflowIntegration
}

// Example usage in a main function
async function main() {
  try {
    // Run a quick scan
    await quickScan()

    // Set up development monitoring if in development
    if (process.env.NODE_ENV === 'development') {
      await developmentWorkflowIntegration()
    }

  } catch (error) {
    console.error('Example execution failed:', error)
    process.exit(1)
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main()
}