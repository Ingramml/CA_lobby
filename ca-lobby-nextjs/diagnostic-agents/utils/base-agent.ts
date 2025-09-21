/**
 * Base Diagnostic Agent Class
 * Provides common functionality for all diagnostic agents
 */

import { DiagnosticAgent, DiagnosticIssue, ErrorCategory, ErrorSeverity } from '../types'
import { v4 as uuidv4 } from 'uuid'

export abstract class BaseDiagnosticAgent implements DiagnosticAgent {
  public name: string
  public version: string
  public category: ErrorCategory
  public isActive: boolean = false
  public lastRun?: Date

  protected config: Record<string, any> = {}
  protected monitoringCallbacks: Array<(issue: DiagnosticIssue) => void> = []
  protected monitoringInterval?: NodeJS.Timeout

  constructor(name: string, version: string, category: ErrorCategory) {
    this.name = name
    this.version = version
    this.category = category
  }

  abstract scan(): Promise<DiagnosticIssue[]>

  monitor(callback: (issue: DiagnosticIssue) => void): void {
    this.monitoringCallbacks.push(callback)
    if (!this.isActive) {
      this.startMonitoring()
    }
  }

  stop(): void {
    this.isActive = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.monitoringCallbacks = []
  }

  configure(config: Record<string, any>): void {
    this.config = { ...this.config, ...config }
  }

  protected startMonitoring(): void {
    this.isActive = true
    // Override in subclasses for specific monitoring behavior
  }

  protected createIssue(
    title: string,
    description: string,
    severity: ErrorSeverity,
    source: string,
    suggestions: string[] = [],
    metadata?: Record<string, any>,
    file?: string,
    line?: number,
    column?: number,
    stackTrace?: string
  ): DiagnosticIssue {
    return {
      id: uuidv4(),
      title,
      description,
      severity,
      category: this.category,
      status: 'active',
      timestamp: new Date(),
      source,
      file,
      line,
      column,
      stackTrace,
      suggestions,
      metadata,
    }
  }

  protected notifyMonitors(issue: DiagnosticIssue): void {
    this.monitoringCallbacks.forEach(callback => {
      try {
        callback(issue)
      } catch (error) {
        console.error(`Error in monitoring callback for ${this.name}:`, error)
      }
    })
  }

  protected async runCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const { spawn } = require('child_process')

    return new Promise((resolve) => {
      const parts = command.split(' ')
      const cmd = parts[0]
      const args = parts.slice(1)

      const child = spawn(cmd, args, {
        cwd: cwd || process.cwd(),
        shell: true,
        stdio: 'pipe'
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString()
      })

      child.on('close', (code: number) => {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0
        })
      })

      child.on('error', (error: Error) => {
        resolve({
          stdout: '',
          stderr: error.message,
          exitCode: 1
        })
      })
    })
  }

  protected async fileExists(path: string): Promise<boolean> {
    try {
      const fs = require('fs').promises
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  protected async readFile(path: string): Promise<string> {
    try {
      const fs = require('fs').promises
      return await fs.readFile(path, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`)
    }
  }

  protected async writeFile(path: string, content: string): Promise<void> {
    try {
      const fs = require('fs').promises
      await fs.writeFile(path, content, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`)
    }
  }

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`

    switch (level) {
      case 'debug':
        console.debug(logMessage, data || '')
        break
      case 'info':
        console.info(logMessage, data || '')
        break
      case 'warn':
        console.warn(logMessage, data || '')
        break
      case 'error':
        console.error(logMessage, data || '')
        break
    }
  }

  protected getSeverityFromCode(code: string | number): ErrorSeverity {
    // Convert various error codes to severity levels
    if (typeof code === 'string') {
      if (code.includes('ERROR') || code.includes('CRITICAL')) return 'critical'
      if (code.includes('WARN')) return 'medium'
      if (code.includes('INFO')) return 'info'
    }

    if (typeof code === 'number') {
      if (code >= 500) return 'critical'
      if (code >= 400) return 'high'
      if (code >= 300) return 'medium'
      if (code >= 200) return 'low'
    }

    return 'medium'
  }

  protected parseStackTrace(error: Error): { file?: string; line?: number; column?: number } {
    if (!error.stack) return {}

    // Simple stack trace parsing - can be enhanced
    const lines = error.stack.split('\n')
    for (const line of lines) {
      const match = line.match(/at .* \((.+):(\d+):(\d+)\)/)
      if (match) {
        return {
          file: match[1],
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10)
        }
      }
    }

    return {}
  }
}