/**
 * JavaScript Runtime Diagnostic Agent
 * Detects JavaScript runtime errors and issues
 */

import { BaseDiagnosticAgent } from '../utils/base-agent'
import { DiagnosticIssue, RuntimeDiagnosticConfig } from '../types'

export class RuntimeDiagnosticAgent extends BaseDiagnosticAgent {
  private config: RuntimeDiagnosticConfig = {
    monitorConsole: true,
    checkUndefinedVars: true,
    checkAsyncErrors: true,
    checkDOMErrors: true,
    checkModuleErrors: true,
    captureUnhandledRejections: true,
  }

  private originalConsoleError: typeof console.error
  private originalConsoleWarn: typeof console.warn
  private errorCounts: Map<string, number> = new Map()
  private recentErrors: Set<string> = new Set()

  constructor() {
    super('JavaScript Runtime Diagnostic Agent', '1.0.0', 'runtime')
    this.originalConsoleError = console.error
    this.originalConsoleWarn = console.warn
  }

  async scan(): Promise<DiagnosticIssue[]> {
    this.lastRun = new Date()
    this.log('info', 'Starting JavaScript runtime diagnostic scan')

    const issues: DiagnosticIssue[] = []

    try {
      // Check for common JavaScript runtime issues
      issues.push(...await this.checkCommonRuntimeIssues())

      // Check for memory leaks
      issues.push(...await this.checkMemoryIssues())

      // Check for unhandled promise rejections
      issues.push(...await this.checkUnhandledPromises())

      // Check for DOM-related issues (if in browser)
      if (typeof window !== 'undefined') {
        issues.push(...await this.checkDOMIssues())
      }

      // Check for module loading issues
      issues.push(...await this.checkModuleIssues())

      this.log('info', `JavaScript runtime diagnostic scan completed. Found ${issues.length} issues`)
      return issues

    } catch (error) {
      this.log('error', 'Error during JavaScript runtime diagnostic scan', error)
      return [
        this.createIssue(
          'Runtime Diagnostic Scan Failed',
          `Failed to complete runtime diagnostic scan: ${error}`,
          'high',
          'runtime-agent',
          ['Check agent configuration', 'Verify runtime environment']
        )
      ]
    }
  }

  private async checkCommonRuntimeIssues(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for global error handlers
      if (typeof window !== 'undefined') {
        const hasGlobalErrorHandler = window.onerror !== null ||
                                    window.addEventListener.toString().includes('error')

        if (!hasGlobalErrorHandler) {
          issues.push(
            this.createIssue(
              'No Global Error Handler',
              'No global error handler is set up to catch unhandled errors.',
              'medium',
              'error-handling-check',
              [
                'Add window.onerror handler',
                'Add window.addEventListener("error", handler)',
                'Implement error reporting system'
              ]
            )
          )
        }

        // Check for unhandled promise rejection handler
        const hasUnhandledRejectionHandler = window.onunhandledrejection !== null

        if (!hasUnhandledRejectionHandler) {
          issues.push(
            this.createIssue(
              'No Unhandled Promise Rejection Handler',
              'No handler for unhandled promise rejections is set up.',
              'medium',
              'promise-handling-check',
              [
                'Add window.onunhandledrejection handler',
                'Add window.addEventListener("unhandledrejection", handler)',
                'Handle promise rejections properly'
              ]
            )
          )
        }
      }

      // Check for common variable issues
      issues.push(...this.checkVariableIssues())

      // Check for async/await issues
      issues.push(...this.checkAsyncAwaitIssues())

    } catch (error) {
      this.log('error', 'Failed to check common runtime issues', error)
    }

    return issues
  }

  private checkVariableIssues(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []

    // Check for common undefined variable patterns
    const checkUndefinedVariable = (varName: string): boolean => {
      try {
        return typeof eval(varName) === 'undefined'
      } catch {
        return true // Variable doesn't exist
      }
    }

    // Common variables that should be defined in a Next.js environment
    const expectedGlobals = ['process', 'Buffer', 'global']

    if (typeof window === 'undefined') {
      // Server-side checks
      for (const globalVar of expectedGlobals) {
        if (checkUndefinedVariable(globalVar)) {
          issues.push(
            this.createIssue(
              `Global Variable Not Available: ${globalVar}`,
              `Expected global variable ${globalVar} is not available in the runtime environment.`,
              'medium',
              'variable-check',
              [
                `Check if ${globalVar} polyfill is needed`,
                'Verify Node.js environment setup',
                'Check for proper imports'
              ],
              { variable: globalVar, environment: 'server' }
            )
          )
        }
      }
    } else {
      // Client-side checks
      const expectedBrowserGlobals = ['document', 'window', 'navigator']

      for (const globalVar of expectedBrowserGlobals) {
        if (checkUndefinedVariable(globalVar)) {
          issues.push(
            this.createIssue(
              `Browser Global Not Available: ${globalVar}`,
              `Expected browser global ${globalVar} is not available.`,
              'high',
              'variable-check',
              [
                'Check if running in browser environment',
                'Verify browser compatibility',
                'Add environment checks'
              ],
              { variable: globalVar, environment: 'client' }
            )
          )
        }
      }
    }

    return issues
  }

  private checkAsyncAwaitIssues(): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []

    // Check if there are any unhandled promise rejections in the current context
    const recentRejections = Array.from(this.recentErrors).filter(error =>
      error.includes('Promise') || error.includes('async') || error.includes('await')
    )

    for (const rejection of recentRejections) {
      issues.push(
        this.createIssue(
          'Async/Await Error Detected',
          `Async operation error: ${rejection}`,
          'high',
          'async-check',
          [
            'Add proper error handling with try-catch',
            'Use .catch() for promise chains',
            'Check async function implementations'
          ],
          { error: rejection }
        )
      )
    }

    return issues
  }

  private async checkMemoryIssues(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = (performance as any).memory

        // Check for high memory usage
        const usedMemoryMB = memory.usedJSHeapSize / 1048576 // Convert to MB
        const totalMemoryMB = memory.totalJSHeapSize / 1048576

        if (usedMemoryMB > 100) { // Alert if using more than 100MB
          issues.push(
            this.createIssue(
              'High Memory Usage Detected',
              `JavaScript heap is using ${usedMemoryMB.toFixed(2)}MB of memory.`,
              usedMemoryMB > 200 ? 'high' : 'medium',
              'memory-check',
              [
                'Check for memory leaks',
                'Review large object allocations',
                'Monitor memory usage over time',
                'Use browser dev tools memory profiler'
              ],
              {
                usedMemoryMB: usedMemoryMB.toFixed(2),
                totalMemoryMB: totalMemoryMB.toFixed(2),
                percentage: ((usedMemoryMB / totalMemoryMB) * 100).toFixed(2)
              }
            )
          )
        }

        // Check for memory leaks by monitoring growth
        const memoryGrowthThreshold = 50 // MB
        if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.9) {
          issues.push(
            this.createIssue(
              'Potential Memory Leak',
              'Memory usage is approaching the heap limit, indicating a possible memory leak.',
              'high',
              'memory-leak-check',
              [
                'Use memory profiler to identify leaks',
                'Check for unreleased event listeners',
                'Review closure usage and variable references',
                'Monitor object lifecycle'
              ],
              { memoryPressure: 'high' }
            )
          )
        }
      }

    } catch (error) {
      this.log('debug', 'Memory API not available or error checking memory', error)
    }

    return issues
  }

  private async checkUnhandledPromises(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    // Check if we've recorded any unhandled promise rejections
    const promiseErrors = Array.from(this.recentErrors).filter(error =>
      error.includes('Unhandled promise rejection') || error.includes('UnhandledPromiseRejectionWarning')
    )

    for (const error of promiseErrors) {
      issues.push(
        this.createIssue(
          'Unhandled Promise Rejection',
          `Unhandled promise rejection detected: ${error}`,
          'high',
          'promise-rejection-check',
          [
            'Add .catch() handlers to promises',
            'Use try-catch with async/await',
            'Implement global unhandled rejection handler',
            'Review promise chain implementations'
          ],
          { error }
        )
      )
    }

    return issues
  }

  private async checkDOMIssues(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    if (typeof document === 'undefined') {
      return issues // Not in browser environment
    }

    try {
      // Check for common DOM issues
      const body = document.body
      if (!body) {
        issues.push(
          this.createIssue(
            'Document Body Not Available',
            'document.body is not available, which may indicate DOM isn\'t fully loaded.',
            'medium',
            'dom-check',
            [
              'Wait for DOMContentLoaded event',
              'Use useEffect in React components',
              'Check if script is running too early'
            ]
          )
        )
      }

      // Check for excessive DOM nodes
      const allElements = document.querySelectorAll('*')
      if (allElements.length > 5000) {
        issues.push(
          this.createIssue(
            'Excessive DOM Nodes',
            `Found ${allElements.length} DOM nodes, which may impact performance.`,
            'medium',
            'dom-performance-check',
            [
              'Consider virtualizing long lists',
              'Remove unnecessary DOM elements',
              'Optimize component rendering',
              'Use React.memo for expensive components'
            ],
            { nodeCount: allElements.length }
          )
        )
      }

      // Check for memory leaks in event listeners
      const elementsWithListeners = document.querySelectorAll('[onclick], [onchange], [onsubmit]')
      if (elementsWithListeners.length > 100) {
        issues.push(
          this.createIssue(
            'Many Inline Event Handlers',
            `Found ${elementsWithListeners.length} elements with inline event handlers.`,
            'low',
            'event-handler-check',
            [
              'Use event delegation',
              'Remove event listeners when components unmount',
              'Consider using React event handlers instead',
              'Review event listener lifecycle'
            ],
            { handlerCount: elementsWithListeners.length }
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check DOM issues', error)
    }

    return issues
  }

  private async checkModuleIssues(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for module loading errors
      const moduleErrors = Array.from(this.recentErrors).filter(error =>
        error.includes('Module not found') ||
        error.includes('Cannot resolve module') ||
        error.includes('Failed to import') ||
        error.includes('import') ||
        error.includes('require')
      )

      for (const error of moduleErrors) {
        issues.push(
          this.createIssue(
            'Module Loading Error',
            `Module loading issue detected: ${error}`,
            'high',
            'module-check',
            [
              'Check module path spelling',
              'Verify module is installed',
              'Check import/export syntax',
              'Review module resolution configuration'
            ],
            { error }
          )
        )
      }

      // Check for dynamic import issues
      const dynamicImportErrors = Array.from(this.recentErrors).filter(error =>
        error.includes('dynamic import') || error.includes('import()')
      )

      for (const error of dynamicImportErrors) {
        issues.push(
          this.createIssue(
            'Dynamic Import Error',
            `Dynamic import issue: ${error}`,
            'medium',
            'dynamic-import-check',
            [
              'Check dynamic import syntax',
              'Verify module exists at runtime',
              'Add error handling for dynamic imports',
              'Check webpack configuration'
            ],
            { error }
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check module issues', error)
    }

    return issues
  }

  protected startMonitoring(): void {
    super.startMonitoring()

    if (this.config.monitorConsole) {
      this.setupConsoleMonitoring()
    }

    if (this.config.captureUnhandledRejections) {
      this.setupUnhandledRejectionMonitoring()
    }

    // Monitor for global errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        const issue = this.createIssue(
          'JavaScript Runtime Error',
          event.error?.message || 'Unknown error occurred',
          'high',
          'runtime-monitor',
          [
            'Check browser console for details',
            'Review error stack trace',
            'Add error boundary if using React',
            'Implement proper error handling'
          ],
          {
            error: event.error?.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          },
          event.filename,
          event.lineno,
          event.colno,
          event.error?.stack
        )
        this.notifyMonitors(issue)
      })

      // Monitor for unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const issue = this.createIssue(
          'Unhandled Promise Rejection',
          `Promise rejected: ${event.reason}`,
          'high',
          'promise-monitor',
          [
            'Add .catch() handler to promise',
            'Use try-catch with async/await',
            'Review promise implementation',
            'Check for proper error handling'
          ],
          {
            reason: event.reason,
            promise: event.promise
          }
        )
        this.notifyMonitors(issue)
      })
    }

    // Monitor performance if available
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        if (this.isActive) {
          this.checkPerformanceIssues()
        }
      }, 10000) // Check every 10 seconds
    }

    this.log('info', 'JavaScript runtime monitoring started')
  }

  private setupConsoleMonitoring(): void {
    // Override console.error to capture errors
    console.error = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')

      // Track recent errors
      this.recentErrors.add(message)

      // Keep only recent errors (last 100)
      if (this.recentErrors.size > 100) {
        const firstError = this.recentErrors.values().next().value
        this.recentErrors.delete(firstError)
      }

      // Count error occurrences
      const count = this.errorCounts.get(message) || 0
      this.errorCounts.set(message, count + 1)

      // If error occurs frequently, create an issue
      if (count >= 3) {
        const issue = this.createIssue(
          'Recurring Console Error',
          `Error occurred ${count + 1} times: ${message}`,
          'medium',
          'console-monitor',
          [
            'Fix the underlying cause',
            'Add proper error handling',
            'Review code that generates this error'
          ],
          { message, occurrences: count + 1 }
        )
        this.notifyMonitors(issue)
      }

      // Call original console.error
      this.originalConsoleError.apply(console, args)
    }

    // Override console.warn for warnings
    console.warn = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')

      // Track frequent warnings
      const count = this.errorCounts.get(message) || 0
      this.errorCounts.set(message, count + 1)

      if (count >= 5) {
        const issue = this.createIssue(
          'Recurring Console Warning',
          `Warning occurred ${count + 1} times: ${message}`,
          'low',
          'console-monitor',
          [
            'Review warning and consider fixing',
            'May indicate potential issues',
            'Check for deprecated API usage'
          ],
          { message, occurrences: count + 1 }
        )
        this.notifyMonitors(issue)
      }

      // Call original console.warn
      this.originalConsoleWarn.apply(console, args)
    }
  }

  private setupUnhandledRejectionMonitoring(): void {
    if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason, promise) => {
        const issue = this.createIssue(
          'Unhandled Promise Rejection (Node.js)',
          `Promise rejected: ${reason}`,
          'critical',
          'process-monitor',
          [
            'Add proper promise error handling',
            'Use try-catch with async/await',
            'Review promise chains for missing .catch()',
            'Implement global rejection handler'
          ],
          { reason, promise }
        )
        this.notifyMonitors(issue)
      })

      process.on('uncaughtException', (error) => {
        const issue = this.createIssue(
          'Uncaught Exception',
          `Uncaught exception: ${error.message}`,
          'critical',
          'process-monitor',
          [
            'Add proper error handling',
            'Use try-catch blocks',
            'Review error-prone operations',
            'Consider graceful error recovery'
          ],
          {
            error: error.message,
            stack: error.stack
          },
          undefined,
          undefined,
          undefined,
          error.stack
        )
        this.notifyMonitors(issue)
      })
    }
  }

  private checkPerformanceIssues(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Check for long tasks
        if ('getEntriesByType' in performance) {
          const measures = performance.getEntriesByType('measure')
          const longMeasures = measures.filter(measure => measure.duration > 50) // 50ms threshold

          for (const measure of longMeasures) {
            const issue = this.createIssue(
              'Performance: Long Task Detected',
              `Task "${measure.name}" took ${measure.duration.toFixed(2)}ms to complete.`,
              measure.duration > 100 ? 'medium' : 'low',
              'performance-monitor',
              [
                'Optimize the slow operation',
                'Consider breaking into smaller tasks',
                'Use web workers for heavy computation',
                'Implement code splitting'
              ],
              {
                taskName: measure.name,
                duration: measure.duration,
                startTime: measure.startTime
              }
            )
            this.notifyMonitors(issue)
          }
        }

        // Check memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory
          const usedMemoryMB = memory.usedJSHeapSize / 1048576

          if (usedMemoryMB > 150) { // 150MB threshold
            const issue = this.createIssue(
              'Performance: High Memory Usage',
              `Memory usage is high: ${usedMemoryMB.toFixed(2)}MB`,
              'medium',
              'memory-monitor',
              [
                'Check for memory leaks',
                'Review object lifecycle',
                'Use memory profiler',
                'Optimize data structures'
              ],
              { usedMemoryMB: usedMemoryMB.toFixed(2) }
            )
            this.notifyMonitors(issue)
          }
        }

      } catch (error) {
        this.log('debug', 'Performance monitoring error', error)
      }
    }
  }

  stop(): void {
    super.stop()

    // Restore original console methods
    console.error = this.originalConsoleError
    console.warn = this.originalConsoleWarn

    // Clear tracking data
    this.errorCounts.clear()
    this.recentErrors.clear()

    this.log('info', 'JavaScript runtime monitoring stopped')
  }
}