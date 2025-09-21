/**
 * Diagnostic Logger Utility
 * Provides structured logging for diagnostic agents
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  source: string
  message: string
  data?: any
  sessionId?: string
}

export class DiagnosticLogger {
  private logLevel: LogLevel = 'info'
  private logs: LogEntry[] = []
  private maxLogs: number = 1000
  private sessionId: string
  private logToConsole: boolean = true
  private logToFile: boolean = false
  private logFilePath?: string

  constructor(options?: {
    logLevel?: LogLevel
    maxLogs?: number
    sessionId?: string
    logToConsole?: boolean
    logToFile?: boolean
    logFilePath?: string
  }) {
    this.logLevel = options?.logLevel || 'info'
    this.maxLogs = options?.maxLogs || 1000
    this.sessionId = options?.sessionId || this.generateSessionId()
    this.logToConsole = options?.logToConsole !== false
    this.logToFile = options?.logToFile || false
    this.logFilePath = options?.logFilePath
  }

  private generateSessionId(): string {
    return `diag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  private createLogEntry(level: LogLevel, source: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date(),
      level,
      source,
      message,
      data,
      sessionId: this.sessionId
    }
  }

  private formatLogMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    const source = entry.source.padEnd(20)

    let message = `[${timestamp}] [${level}] [${source}] ${entry.message}`

    if (entry.data) {
      if (typeof entry.data === 'object') {
        message += ` | ${JSON.stringify(entry.data)}`
      } else {
        message += ` | ${entry.data}`
      }
    }

    return message
  }

  private outputLog(entry: LogEntry): void {
    if (this.logToConsole) {
      const message = this.formatLogMessage(entry)

      switch (entry.level) {
        case 'debug':
          console.debug(message)
          break
        case 'info':
          console.info(message)
          break
        case 'warn':
          console.warn(message)
          break
        case 'error':
          console.error(message)
          break
      }
    }

    if (this.logToFile && this.logFilePath) {
      this.writeToFile(entry)
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const fs = require('fs').promises
      const path = require('path')

      if (!this.logFilePath) return

      // Ensure directory exists
      const dir = path.dirname(this.logFilePath)
      await fs.mkdir(dir, { recursive: true })

      // Format as JSON for structured logging
      const logLine = JSON.stringify(entry) + '\n'

      // Append to file
      await fs.appendFile(this.logFilePath, logLine)

    } catch (error) {
      // Don't throw errors from logging
      console.error('Failed to write log to file:', error)
    }
  }

  log(level: LogLevel, source: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, source, message, data)

    // Store in memory
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Output the log
    this.outputLog(entry)
  }

  debug(source: string, message: string, data?: any): void {
    this.log('debug', source, message, data)
  }

  info(source: string, message: string, data?: any): void {
    this.log('info', source, message, data)
  }

  warn(source: string, message: string, data?: any): void {
    this.log('warn', source, message, data)
  }

  error(source: string, message: string, data?: any): void {
    this.log('error', source, message, data)
  }

  // Get logs for a specific source
  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter(log => log.source === source)
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  // Get logs in time range
  getLogsByTimeRange(start: Date, end: Date): LogEntry[] {
    return this.logs.filter(log =>
      log.timestamp >= start && log.timestamp <= end
    )
  }

  // Get all logs
  getAllLogs(): LogEntry[] {
    return [...this.logs]
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }

  // Get log statistics
  getStatistics(): {
    totalLogs: number
    logsByLevel: Record<LogLevel, number>
    logsBySoure: Record<string, number>
    sessionId: string
    oldestLog?: Date
    newestLog?: Date
  } {
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    }

    const logsBySource: Record<string, number> = {}

    for (const log of this.logs) {
      logsByLevel[log.level]++
      logsBySource[log.source] = (logsBySource[log.source] || 0) + 1
    }

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      logsBySoure: logsBySource,
      sessionId: this.sessionId,
      oldestLog: this.logs.length > 0 ? this.logs[0].timestamp : undefined,
      newestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : undefined
    }
  }

  // Export logs to different formats
  exportLogs(format: 'json' | 'csv' | 'text' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2)

      case 'csv':
        const headers = ['Timestamp', 'Level', 'Source', 'Message', 'Data']
        const rows = [headers.join(',')]

        for (const log of this.logs) {
          const row = [
            log.timestamp.toISOString(),
            log.level,
            log.source,
            `"${log.message.replace(/"/g, '""')}"`,
            log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : ''
          ]
          rows.push(row.join(','))
        }

        return rows.join('\n')

      case 'text':
        return this.logs.map(log => this.formatLogMessage(log)).join('\n')

      default:
        return JSON.stringify(this.logs, null, 2)
    }
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  // Configure file logging
  configureFileLogging(enabled: boolean, filePath?: string): void {
    this.logToFile = enabled
    if (filePath) {
      this.logFilePath = filePath
    }
  }

  // Configure console logging
  configureConsoleLogging(enabled: boolean): void {
    this.logToConsole = enabled
  }
}

// Global logger instance
let globalLogger: DiagnosticLogger | null = null

// Get or create global logger
export function getLogger(options?: {
  logLevel?: LogLevel
  maxLogs?: number
  sessionId?: string
  logToConsole?: boolean
  logToFile?: boolean
  logFilePath?: string
}): DiagnosticLogger {
  if (!globalLogger || options) {
    globalLogger = new DiagnosticLogger(options)
  }
  return globalLogger
}

// Convenience functions using global logger
export function logDebug(source: string, message: string, data?: any): void {
  getLogger().debug(source, message, data)
}

export function logInfo(source: string, message: string, data?: any): void {
  getLogger().info(source, message, data)
}

export function logWarn(source: string, message: string, data?: any): void {
  getLogger().warn(source, message, data)
}

export function logError(source: string, message: string, data?: any): void {
  getLogger().error(source, message, data)
}

// Create logger for specific source
export function createSourceLogger(source: string, options?: {
  logLevel?: LogLevel
  logToConsole?: boolean
  logToFile?: boolean
}): {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, data?: any) => void
} {
  const logger = getLogger(options)

  return {
    debug: (message: string, data?: any) => logger.debug(source, message, data),
    info: (message: string, data?: any) => logger.info(source, message, data),
    warn: (message: string, data?: any) => logger.warn(source, message, data),
    error: (message: string, data?: any) => logger.error(source, message, data)
  }
}