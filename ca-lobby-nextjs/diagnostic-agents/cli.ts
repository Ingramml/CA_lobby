#!/usr/bin/env node

/**
 * Diagnostic Agents CLI
 * Command-line interface for running diagnostic scans
 */

import { Command } from 'commander'
import { DiagnosticCoordinator } from './coordinator'
import { createConfig } from './config/default'
import { runAgent } from './index'
import type { DiagnosticConfig } from './types'

const program = new Command()

program
  .name('diagnostic-agents')
  .description('CA Lobby Diagnostic Agents - Comprehensive website issue detection')
  .version('1.0.0')

// Main scan command
program
  .command('scan')
  .description('Run a comprehensive diagnostic scan')
  .option('-e, --env <environment>', 'Environment (development, production, test, ci)', 'development')
  .option('-c, --config <file>', 'Configuration file path')
  .option('-o, --output <dir>', 'Output directory for reports', './diagnostic-reports')
  .option('-f, --format <format>', 'Report format (json, markdown, csv)', 'markdown')
  .option('--no-save', 'Don\'t save reports to files')
  .option('--auto-fix', 'Enable automatic fixes')
  .option('--quiet', 'Reduce output verbosity')
  .action(async (options) => {
    try {
      console.log('🔍 Starting diagnostic scan...\n')

      const config = await createConfig({
        environment: options.env,
        configFile: options.config,
        override: {
          outputDir: options.output,
          autoFix: options.autoFix,
          logLevel: options.quiet ? 'error' : 'info'
        }
      })

      const coordinator = new DiagnosticCoordinator(config)
      const report = await coordinator.runDiagnostic()

      // Display summary
      console.log('📊 Diagnostic Summary:')
      console.log(`   Total Issues: ${report.summary.totalIssues}`)
      if (report.summary.criticalIssues > 0) {
        console.log(`   🚨 Critical: ${report.summary.criticalIssues}`)
      }
      if (report.summary.highIssues > 0) {
        console.log(`   ⚠️  High: ${report.summary.highIssues}`)
      }
      if (report.summary.mediumIssues > 0) {
        console.log(`   ⚡ Medium: ${report.summary.mediumIssues}`)
      }
      if (report.summary.lowIssues > 0) {
        console.log(`   ℹ️  Low: ${report.summary.lowIssues}`)
      }

      // Display recommendations
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:')
        report.recommendations.forEach(rec => console.log(`   ${rec}`))
      }

      // Export in requested format
      if (options.format !== 'json') {
        const output = coordinator.exportReport(options.format)
        console.log(`\n📝 Report (${options.format.toUpperCase()}):\n`)
        console.log(output)
      }

      // Exit with appropriate code
      const exitCode = report.summary.criticalIssues > 0 ? 2 :
                      report.summary.highIssues > 0 ? 1 : 0

      if (exitCode > 0) {
        console.log(`\n❌ Exiting with code ${exitCode} due to critical/high issues`)
      } else {
        console.log('\n✅ Scan completed successfully')
      }

      process.exit(exitCode)

    } catch (error) {
      console.error('❌ Diagnostic scan failed:', error)
      process.exit(1)
    }
  })

// Individual agent commands
program
  .command('auth')
  .description('Run only the Auth/Clerk diagnostic agent')
  .option('--dev-bypass', 'Enable development mode bypass')
  .action(async (options) => {
    try {
      console.log('🔐 Running Auth/Clerk diagnostic...\n')

      const issues = await runAgent('auth', {
        devModeBypass: options.devBypass
      })

      displayAgentResults('Auth/Clerk', issues)

    } catch (error) {
      console.error('❌ Auth diagnostic failed:', error)
      process.exit(1)
    }
  })

program
  .command('typescript')
  .description('Run only the TypeScript diagnostic agent')
  .option('--strict', 'Enable strict mode checks')
  .option('--config <file>', 'Custom tsconfig.json path')
  .action(async (options) => {
    try {
      console.log('📝 Running TypeScript diagnostic...\n')

      const issues = await runAgent('typescript', {
        strictMode: options.strict,
        customTsConfig: options.config
      })

      displayAgentResults('TypeScript', issues)

    } catch (error) {
      console.error('❌ TypeScript diagnostic failed:', error)
      process.exit(1)
    }
  })

program
  .command('runtime')
  .description('Run only the JavaScript Runtime diagnostic agent')
  .option('--no-console', 'Disable console monitoring')
  .action(async (options) => {
    try {
      console.log('⚡ Running Runtime diagnostic...\n')

      const issues = await runAgent('runtime', {
        monitorConsole: options.console
      })

      displayAgentResults('JavaScript Runtime', issues)

    } catch (error) {
      console.error('❌ Runtime diagnostic failed:', error)
      process.exit(1)
    }
  })

program
  .command('build')
  .description('Run only the Build & Compilation diagnostic agent')
  .option('--command <cmd>', 'Build command to test', 'npm run build')
  .action(async (options) => {
    try {
      console.log('🔨 Running Build diagnostic...\n')

      const issues = await runAgent('build', {
        buildCommand: options.command
      })

      displayAgentResults('Build & Compilation', issues)

    } catch (error) {
      console.error('❌ Build diagnostic failed:', error)
      process.exit(1)
    }
  })

program
  .command('network')
  .description('Run only the Network & API diagnostic agent')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '5000')
  .option('--no-connectivity', 'Skip external connectivity checks')
  .action(async (options) => {
    try {
      console.log('🌐 Running Network & API diagnostic...\n')

      const issues = await runAgent('network', {
        timeoutThreshold: parseInt(options.timeout),
        checkConnectivity: options.connectivity
      })

      displayAgentResults('Network & API', issues)

    } catch (error) {
      console.error('❌ Network diagnostic failed:', error)
      process.exit(1)
    }
  })

// Monitor command
program
  .command('monitor')
  .description('Start real-time monitoring')
  .option('-e, --env <environment>', 'Environment', 'development')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--interval <seconds>', 'Scan interval in seconds', '60')
  .action(async (options) => {
    try {
      console.log('👁️  Starting real-time monitoring...\n')

      const config = await createConfig({
        environment: options.env,
        configFile: options.config,
        override: {
          realTimeMonitoring: true
        }
      })

      const coordinator = new DiagnosticCoordinator(config)

      // Set up event listeners
      coordinator.on('issue', (event) => {
        const issue = event.data
        const timestamp = new Date().toLocaleTimeString()
        const severityIcon = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: 'ℹ️',
          info: '📝'
        }[issue.severity]

        console.log(`[${timestamp}] ${severityIcon} ${issue.title}`)
        console.log(`   Source: ${issue.source}`)
        if (issue.file) console.log(`   File: ${issue.file}:${issue.line || 0}`)
        console.log(`   ${issue.description}\n`)
      })

      coordinator.on('scan_complete', (report) => {
        const timestamp = new Date().toLocaleTimeString()
        console.log(`[${timestamp}] 📊 Periodic scan completed: ${report.summary.totalIssues} issues found`)
      })

      await coordinator.startMonitoring()

      // Run periodic scans
      const scanInterval = parseInt(options.interval) * 1000
      setInterval(async () => {
        await coordinator.runDiagnostic()
      }, scanInterval)

      console.log('Monitoring started. Press Ctrl+C to stop.\n')

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping monitoring...')
        await coordinator.stopMonitoring()
        process.exit(0)
      })

    } catch (error) {
      console.error('❌ Monitoring failed:', error)
      process.exit(1)
    }
  })

// Configuration commands
program
  .command('config')
  .description('Configuration management')
  .command('init')
  .description('Initialize diagnostic configuration')
  .option('-e, --env <environment>', 'Environment template', 'development')
  .action(async (options) => {
    try {
      const fs = require('fs').promises
      const path = require('path')

      const configTemplate = await createConfig({
        environment: options.env
      })

      const configPath = path.join(process.cwd(), 'diagnostic.config.json')

      await fs.writeFile(
        configPath,
        JSON.stringify(configTemplate, null, 2)
      )

      console.log(`✅ Configuration file created: ${configPath}`)
      console.log('Edit this file to customize diagnostic settings.')

    } catch (error) {
      console.error('❌ Failed to create configuration:', error)
      process.exit(1)
    }
  })

// Helper function to display agent results
function displayAgentResults(agentName: string, issues: any[]) {
  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  }

  issues.forEach(issue => {
    severityCounts[issue.severity]++
  })

  console.log(`📊 ${agentName} Results:`)
  console.log(`   Total Issues: ${issues.length}`)

  Object.entries(severityCounts).forEach(([severity, count]) => {
    if (count > 0) {
      const icon = {
        critical: '🚨',
        high: '⚠️',
        medium: '⚡',
        low: 'ℹ️',
        info: '📝'
      }[severity]

      console.log(`   ${icon} ${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`)
    }
  })

  if (issues.length > 0) {
    console.log('\n📋 Issues Found:')

    issues
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      })
      .slice(0, 10) // Show first 10 issues
      .forEach((issue, index) => {
        const severityIcon = {
          critical: '🚨',
          high: '⚠️',
          medium: '⚡',
          low: 'ℹ️',
          info: '📝'
        }[issue.severity]

        console.log(`\n${index + 1}. ${severityIcon} ${issue.title}`)
        console.log(`   ${issue.description}`)

        if (issue.file) {
          console.log(`   📍 ${issue.file}:${issue.line || 0}`)
        }

        if (issue.suggestions.length > 0) {
          console.log(`   💡 Suggestion: ${issue.suggestions[0]}`)
        }
      })

    if (issues.length > 10) {
      console.log(`\n... and ${issues.length - 10} more issues`)
    }
  }

  // Exit code based on severity
  const exitCode = severityCounts.critical > 0 ? 2 :
                  severityCounts.high > 0 ? 1 : 0

  if (exitCode > 0) {
    console.log(`\n❌ Exiting with code ${exitCode}`)
  } else {
    console.log('\n✅ No critical issues found')
  }

  process.exit(exitCode)
}

// Error handling
program.on('command:*', () => {
  console.error('❌ Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

if (process.argv.length === 2) {
  program.help()
}

program.parse()