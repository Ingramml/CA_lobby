/**
 * Network & API Diagnostic Agent
 * Detects network connectivity, API failures, and related issues
 */

import { BaseDiagnosticAgent } from '../utils/base-agent'
import { DiagnosticIssue, NetworkDiagnosticConfig } from '../types'
import path from 'path'

interface NetworkRequest {
  url: string
  method: string
  status?: number
  duration?: number
  timestamp: Date
  error?: string
}

export class NetworkDiagnosticAgent extends BaseDiagnosticAgent {
  private config: NetworkDiagnosticConfig = {
    monitorAPIcalls: true,
    checkCORS: true,
    checkTimeouts: true,
    checkConnectivity: true,
    checkGraphQL: true,
    maxRetries: 3,
    timeoutThreshold: 5000, // 5 seconds
  }

  private requestHistory: NetworkRequest[] = []
  private failedRequests: Map<string, number> = new Map()
  private originalFetch?: typeof fetch
  private originalXHROpen?: XMLHttpRequest['open']

  constructor() {
    super('Network & API Diagnostic Agent', '1.0.0', 'network')
    this.setupNetworkInterception()
  }

  async scan(): Promise<DiagnosticIssue[]> {
    this.lastRun = new Date()
    this.log('info', 'Starting network & API diagnostic scan')

    const issues: DiagnosticIssue[] = []
    const projectRoot = process.cwd()

    try {
      // Check API routes
      issues.push(...await this.checkAPIRoutes(projectRoot))

      // Check environment variables for API configuration
      issues.push(...await this.checkAPIConfiguration())

      // Analyze recent network requests
      issues.push(...await this.analyzeNetworkRequests())

      // Check for common API issues
      issues.push(...await this.checkCommonAPIIssues(projectRoot))

      // Test external API connectivity
      if (this.config.checkConnectivity) {
        issues.push(...await this.testExternalConnectivity())
      }

      // Check CORS configuration
      if (this.config.checkCORS) {
        issues.push(...await this.checkCORSConfiguration(projectRoot))
      }

      this.log('info', `Network diagnostic scan completed. Found ${issues.length} issues`)
      return issues

    } catch (error) {
      this.log('error', 'Error during network diagnostic scan', error)
      return [
        this.createIssue(
          'Network Diagnostic Scan Failed',
          `Failed to complete network diagnostic scan: ${error}`,
          'high',
          'network-agent',
          ['Check agent configuration', 'Verify network connectivity']
        )
      ]
    }
  }

  private async checkAPIRoutes(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Find all API route files
      const apiRoutesResult = await this.runCommand(
        'find app/api -name "route.ts" -o -name "route.js" 2>/dev/null || find pages/api -name "*.ts" -o -name "*.js" 2>/dev/null',
        projectRoot
      )

      if (apiRoutesResult.stdout) {
        const routeFiles = apiRoutesResult.stdout.split('\n').filter(f => f.trim())

        if (routeFiles.length === 0) {
          issues.push(
            this.createIssue(
              'No API Routes Found',
              'No API routes found in the project. This may be expected if using external APIs only.',
              'info',
              'api-routes-check',
              [
                'Create API routes in app/api/ (App Router) or pages/api/ (Pages Router)',
                'Verify API directory structure',
                'Check if external APIs are properly configured'
              ]
            )
          )
          return issues
        }

        // Check each API route file
        for (const routeFile of routeFiles) {
          const fullPath = path.join(projectRoot, routeFile)

          if (await this.fileExists(fullPath)) {
            const content = await this.readFile(fullPath)
            issues.push(...this.analyzeAPIRouteFile(content, fullPath))
          }
        }

        // Test API routes if server is running
        issues.push(...await this.testAPIRoutes(routeFiles))

      } else {
        issues.push(
          this.createIssue(
            'Could Not Find API Routes',
            'Unable to locate API routes directory. Check project structure.',
            'low',
            'api-routes-check',
            [
              'Verify project uses Next.js API routes',
              'Check app/api/ or pages/api/ directory exists',
              'Review project structure'
            ]
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check API routes', error)
    }

    return issues
  }

  private analyzeAPIRouteFile(content: string, filePath: string): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const lines = content.split('\n')

    // Check for proper HTTP method exports (App Router)
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']
    const exportedMethods = httpMethods.filter(method =>
      content.includes(`export async function ${method}`) ||
      content.includes(`export function ${method}`)
    )

    if (exportedMethods.length === 0 && !content.includes('export default')) {
      issues.push(
        this.createIssue(
          'No HTTP Methods Exported',
          'API route file does not export any HTTP method handlers.',
          'high',
          'api-route-analysis',
          [
            'Export HTTP method functions (GET, POST, etc.)',
            'Check Next.js API routes documentation',
            'Verify correct API route syntax'
          ],
          { file: filePath }
        )
      )
    }

    // Check for error handling
    let hasErrorHandling = false
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.includes('try') && line.includes('{')) {
        // Look for corresponding catch block
        let braceCount = 0
        let foundCatch = false

        for (let j = i; j < lines.length; j++) {
          const checkLine = lines[j]
          braceCount += (checkLine.match(/\{/g) || []).length
          braceCount -= (checkLine.match(/\}/g) || []).length

          if (checkLine.includes('catch') && braceCount > 0) {
            foundCatch = true
            break
          }

          if (braceCount === 0) break
        }

        if (foundCatch) {
          hasErrorHandling = true
          break
        }
      }
    }

    if (!hasErrorHandling && content.includes('export')) {
      issues.push(
        this.createIssue(
          'No Error Handling in API Route',
          'API route lacks proper error handling with try-catch blocks.',
          'medium',
          'api-route-analysis',
          [
            'Add try-catch blocks to API route handlers',
            'Return appropriate error responses',
            'Log errors for debugging',
            'Handle different error types appropriately'
          ],
          { file: filePath }
        )
      )
    }

    // Check for request validation
    const hasValidation = content.includes('zod') ||
                         content.includes('joi') ||
                         content.includes('yup') ||
                         content.includes('validate') ||
                         content.includes('schema')

    if (!hasValidation && (content.includes('POST') || content.includes('PUT') || content.includes('PATCH'))) {
      issues.push(
        this.createIssue(
          'No Request Validation',
          'API route handles data modification but lacks input validation.',
          'medium',
          'api-route-analysis',
          [
            'Add request body validation',
            'Use validation libraries like Zod or Joi',
            'Validate query parameters',
            'Return 400 for invalid requests'
          ],
          { file: filePath }
        )
      )
    }

    // Check for rate limiting
    const hasRateLimit = content.includes('rate') &&
                        (content.includes('limit') || content.includes('throttle'))

    if (!hasRateLimit && content.includes('export')) {
      issues.push(
        this.createIssue(
          'No Rate Limiting',
          'API route lacks rate limiting protection.',
          'low',
          'api-route-analysis',
          [
            'Implement rate limiting middleware',
            'Use libraries like express-rate-limit',
            'Configure appropriate rate limits',
            'Consider API key-based limiting'
          ],
          { file: filePath }
        )
      )
    }

    // Check for CORS headers
    const hasCORS = content.includes('Access-Control-Allow-Origin') ||
                   content.includes('cors') ||
                   content.includes('CORS')

    if (!hasCORS && content.includes('export')) {
      issues.push(
        this.createIssue(
          'No CORS Configuration',
          'API route may not handle CORS properly for cross-origin requests.',
          'low',
          'api-route-analysis',
          [
            'Add CORS headers if needed',
            'Configure Next.js CORS middleware',
            'Handle OPTIONS requests',
            'Review cross-origin requirements'
          ],
          { file: filePath }
        )
      )
    }

    // Check for authentication
    const hasAuth = content.includes('auth') ||
                   content.includes('token') ||
                   content.includes('session') ||
                   content.includes('authorization') ||
                   content.includes('Bearer')

    if (!hasAuth && !filePath.includes('health') && !filePath.includes('public')) {
      issues.push(
        this.createIssue(
          'No Authentication Check',
          'API route may lack authentication verification.',
          'medium',
          'api-route-analysis',
          [
            'Add authentication middleware',
            'Verify user tokens or sessions',
            'Return 401 for unauthorized requests',
            'Consider public vs protected routes'
          ],
          { file: filePath }
        )
      )
    }

    return issues
  }

  private async testAPIRoutes(routeFiles: string[]): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check if development server is running
      const healthCheck = await this.testConnection('http://localhost:3000/api/health', 'GET', 2000)

      if (!healthCheck.success) {
        issues.push(
          this.createIssue(
            'Development Server Not Accessible',
            'Cannot connect to development server to test API routes.',
            'info',
            'api-testing',
            [
              'Start development server with npm run dev',
              'Check server is running on correct port',
              'Verify no port conflicts'
            ]
          )
        )
        return issues
      }

      // Test a few API routes
      const testRoutes = routeFiles.slice(0, 5) // Test first 5 routes

      for (const routeFile of testRoutes) {
        // Convert file path to URL path
        let urlPath = routeFile
          .replace(/^(app\/api|pages\/api)/, '/api')
          .replace(/\/route\.(ts|js)$/, '')
          .replace(/\.(ts|js)$/, '')

        if (urlPath === '/api') continue // Skip root API directory

        const testUrl = `http://localhost:3000${urlPath}`
        const result = await this.testConnection(testUrl, 'GET', 5000)

        if (!result.success && result.status !== 404 && result.status !== 405) {
          // 404 and 405 are acceptable (route might not handle GET or might not exist)
          issues.push(
            this.createIssue(
              `API Route Error: ${urlPath}`,
              `API route returned error: ${result.error || `Status ${result.status}`}`,
              result.status && result.status >= 500 ? 'high' : 'medium',
              'api-testing',
              [
                'Check API route implementation',
                'Review server logs for errors',
                'Test route manually',
                'Verify route handles HTTP methods correctly'
              ],
              {
                route: urlPath,
                status: result.status,
                error: result.error
              }
            )
          )
        }
      }

    } catch (error) {
      this.log('debug', 'API route testing error', error)
    }

    return issues
  }

  private async checkAPIConfiguration(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for API-related environment variables
      const apiEnvVars = [
        'DATABASE_URL',
        'API_KEY',
        'API_SECRET',
        'EXTERNAL_API_URL',
        'GOOGLE_CLOUD_PROJECT_ID',
        'BIGQUERY_PROJECT_ID'
      ]

      for (const envVar of apiEnvVars) {
        if (process.env[envVar]) {
          // Check if the value looks like a placeholder
          const value = process.env[envVar]!

          if (value.includes('your-') ||
              value.includes('YOUR_') ||
              value.includes('example') ||
              value.includes('EXAMPLE') ||
              value === 'change-me') {
            issues.push(
              this.createIssue(
                `Placeholder Value in ${envVar}`,
                `Environment variable ${envVar} appears to have a placeholder value.`,
                'medium',
                'api-config-check',
                [
                  `Set actual value for ${envVar}`,
                  'Check environment variable documentation',
                  'Verify API credentials are configured'
                ],
                { envVar }
              )
            )
          }

          // Check for common misconfigurations
          if (envVar.includes('URL') && !value.startsWith('http') && !value.startsWith('/')) {
            issues.push(
              this.createIssue(
                `Invalid URL Format in ${envVar}`,
                `Environment variable ${envVar} doesn't appear to be a valid URL.`,
                'medium',
                'api-config-check',
                [
                  'Ensure URL includes protocol (http:// or https://)',
                  'Check URL format and spelling',
                  'Verify API endpoint URL'
                ],
                { envVar }
              )
            )
          }
        }
      }

      // Check for missing critical API configuration
      if (!process.env.DATABASE_URL && !process.env.MONGODB_URI && !process.env.POSTGRES_URL) {
        issues.push(
          this.createIssue(
            'No Database Configuration Found',
            'No database connection string found in environment variables.',
            'info',
            'api-config-check',
            [
              'Add DATABASE_URL if using a database',
              'Configure database connection',
              'Check if external database service is needed'
            ]
          )
        )
      }

      // Check for Google Cloud/BigQuery configuration (specific to this project)
      if (process.env.GOOGLE_CLOUD_PROJECT_ID && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        issues.push(
          this.createIssue(
            'Google Cloud Credentials Not Configured',
            'Google Cloud project ID is set but credentials are not configured.',
            'medium',
            'api-config-check',
            [
              'Set GOOGLE_APPLICATION_CREDENTIALS environment variable',
              'Configure service account key file',
              'Check Google Cloud authentication setup'
            ]
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check API configuration', error)
    }

    return issues
  }

  private async analyzeNetworkRequests(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Analyze recent requests from history
      const recentRequests = this.requestHistory.slice(-100) // Last 100 requests

      if (recentRequests.length === 0) {
        return issues
      }

      // Check for high failure rates
      const failedRequests = recentRequests.filter(req =>
        req.status && (req.status >= 400 || req.error)
      )

      const failureRate = failedRequests.length / recentRequests.length

      if (failureRate > 0.3) { // More than 30% failure rate
        issues.push(
          this.createIssue(
            'High API Failure Rate',
            `${(failureRate * 100).toFixed(1)}% of recent API requests failed.`,
            failureRate > 0.5 ? 'critical' : 'high',
            'network-analysis',
            [
              'Check API server status',
              'Review error logs',
              'Verify network connectivity',
              'Check for rate limiting'
            ],
            {
              failureRate: failureRate.toFixed(3),
              totalRequests: recentRequests.length,
              failedRequests: failedRequests.length
            }
          )
        )
      }

      // Check for slow requests
      const slowRequests = recentRequests.filter(req =>
        req.duration && req.duration > this.config.timeoutThreshold
      )

      if (slowRequests.length > 0) {
        const avgSlowDuration = slowRequests.reduce((sum, req) => sum + (req.duration || 0), 0) / slowRequests.length

        issues.push(
          this.createIssue(
            'Slow API Requests Detected',
            `${slowRequests.length} requests took longer than ${this.config.timeoutThreshold}ms (avg: ${avgSlowDuration.toFixed(0)}ms).`,
            avgSlowDuration > this.config.timeoutThreshold * 2 ? 'high' : 'medium',
            'performance-analysis',
            [
              'Optimize API performance',
              'Check database query performance',
              'Review network latency',
              'Consider caching strategies'
            ],
            {
              slowRequestsCount: slowRequests.length,
              averageDuration: avgSlowDuration.toFixed(0),
              threshold: this.config.timeoutThreshold
            }
          )
        )
      }

      // Check for frequent failures to same endpoints
      const endpointFailures = new Map<string, number>()

      for (const req of failedRequests) {
        const count = endpointFailures.get(req.url) || 0
        endpointFailures.set(req.url, count + 1)
      }

      for (const [url, count] of endpointFailures) {
        if (count >= 3) {
          issues.push(
            this.createIssue(
              'Repeated Failures to Endpoint',
              `Endpoint ${url} failed ${count} times recently.`,
              'high',
              'endpoint-analysis',
              [
                'Check endpoint implementation',
                'Verify endpoint URL is correct',
                'Review authentication requirements',
                'Check for server-side errors'
              ],
              { url, failureCount: count }
            )
          )
        }
      }

      // Check for CORS errors
      const corsErrors = recentRequests.filter(req =>
        req.error && req.error.toLowerCase().includes('cors')
      )

      if (corsErrors.length > 0) {
        issues.push(
          this.createIssue(
            'CORS Errors Detected',
            `${corsErrors.length} requests failed due to CORS issues.`,
            'medium',
            'cors-analysis',
            [
              'Configure CORS headers on server',
              'Add allowed origins to CORS configuration',
              'Check preflight request handling',
              'Verify API route CORS setup'
            ],
            { corsErrorCount: corsErrors.length }
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to analyze network requests', error)
    }

    return issues
  }

  private async checkCommonAPIIssues(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for common fetch patterns in the codebase
      const fetchUsageResult = await this.runCommand(
        'grep -r "fetch(" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | head -20',
        projectRoot
      )

      if (fetchUsageResult.stdout) {
        const fetchLines = fetchUsageResult.stdout.split('\n').filter(line => line.trim())

        // Check for fetch without error handling
        const fetchWithoutCatch = fetchLines.filter(line =>
          !line.includes('.catch') && !line.includes('try')
        )

        if (fetchWithoutCatch.length > 0) {
          issues.push(
            this.createIssue(
              'Fetch Requests Without Error Handling',
              `Found ${fetchWithoutCatch.length} fetch requests that may lack proper error handling.`,
              'medium',
              'fetch-analysis',
              [
                'Add .catch() handlers to fetch calls',
                'Use try-catch blocks with async/await',
                'Implement proper error handling',
                'Add user feedback for failed requests'
              ],
              { count: fetchWithoutCatch.length }
            )
          )
        }

        // Check for fetch without await
        const fetchWithoutAwait = fetchLines.filter(line =>
          !line.includes('await') && line.includes('fetch(')
        )

        if (fetchWithoutAwait.length > 0) {
          issues.push(
            this.createIssue(
              'Fetch Requests Without Await',
              `Found ${fetchWithoutAwait.length} fetch requests that may not be awaited.`,
              'low',
              'fetch-analysis',
              [
                'Add await keyword to fetch calls',
                'Handle promises properly',
                'Use async function context',
                'Check for floating promises'
              ],
              { count: fetchWithoutAwait.length }
            )
          )
        }
      }

      // Check for hardcoded API URLs
      const hardcodedURLResult = await this.runCommand(
        'grep -r "http://" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | head -10',
        projectRoot
      )

      if (hardcodedURLResult.stdout) {
        const hardcodedLines = hardcodedURLResult.stdout.split('\n').filter(line => line.trim())

        if (hardcodedLines.length > 0) {
          issues.push(
            this.createIssue(
              'Hardcoded HTTP URLs Found',
              `Found ${hardcodedLines.length} hardcoded HTTP URLs in code.`,
              'low',
              'url-analysis',
              [
                'Use environment variables for API URLs',
                'Consider using HTTPS instead of HTTP',
                'Create API configuration constants',
                'Use relative URLs for same-origin requests'
              ],
              { count: hardcodedLines.length }
            )
          )
        }
      }

      // Check for missing API documentation
      const apiDocPaths = [
        'api-docs',
        'docs/api',
        'swagger',
        'openapi'
      ]

      let hasApiDocs = false
      for (const docPath of apiDocPaths) {
        if (await this.fileExists(path.join(projectRoot, docPath))) {
          hasApiDocs = true
          break
        }
      }

      // Check for README or documentation files
      if (!hasApiDocs) {
        const readmeFiles = ['README.md', 'README.txt', 'API.md']
        for (const readme of readmeFiles) {
          if (await this.fileExists(path.join(projectRoot, readme))) {
            const content = await this.readFile(path.join(projectRoot, readme))
            if (content.toLowerCase().includes('api')) {
              hasApiDocs = true
              break
            }
          }
        }
      }

      if (!hasApiDocs) {
        issues.push(
          this.createIssue(
            'No API Documentation Found',
            'No API documentation found in the project.',
            'low',
            'documentation-check',
            [
              'Create API documentation',
              'Document API endpoints and parameters',
              'Consider using OpenAPI/Swagger',
              'Add examples and usage instructions'
            ]
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check common API issues', error)
    }

    return issues
  }

  private async testExternalConnectivity(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Test common external services
      const externalServices = [
        { name: 'Google APIs', url: 'https://www.googleapis.com', timeout: 5000 },
        { name: 'GitHub API', url: 'https://api.github.com', timeout: 5000 },
      ]

      // Add project-specific APIs from environment
      if (process.env.EXTERNAL_API_URL) {
        externalServices.push({
          name: 'External API',
          url: process.env.EXTERNAL_API_URL,
          timeout: 10000
        })
      }

      for (const service of externalServices) {
        const result = await this.testConnection(service.url, 'GET', service.timeout)

        if (!result.success) {
          const severity = service.name === 'External API' ? 'high' : 'medium'

          issues.push(
            this.createIssue(
              `Cannot Connect to ${service.name}`,
              `Failed to connect to ${service.name}: ${result.error || `Status ${result.status}`}`,
              severity,
              'connectivity-test',
              [
                'Check internet connectivity',
                'Verify service URL is correct',
                'Check for firewall or proxy issues',
                'Test connection manually'
              ],
              {
                service: service.name,
                url: service.url,
                error: result.error,
                status: result.status
              }
            )
          )
        }
      }

    } catch (error) {
      this.log('error', 'Failed to test external connectivity', error)
    }

    return issues
  }

  private async checkCORSConfiguration(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check middleware for CORS configuration
      const middlewarePath = path.join(projectRoot, 'middleware.ts')

      if (await this.fileExists(middlewarePath)) {
        const middlewareContent = await this.readFile(middlewarePath)

        if (!middlewareContent.includes('Access-Control-Allow-Origin') &&
            !middlewareContent.includes('cors')) {
          issues.push(
            this.createIssue(
              'No CORS Configuration in Middleware',
              'Middleware exists but doesn\'t configure CORS headers.',
              'low',
              'cors-config-check',
              [
                'Add CORS headers to middleware if needed',
                'Configure allowed origins',
                'Handle preflight requests',
                'Check if CORS is needed for your use case'
              ],
              { file: middlewarePath }
            )
          )
        }

        // Check for overly permissive CORS
        if (middlewareContent.includes('Access-Control-Allow-Origin: *')) {
          issues.push(
            this.createIssue(
              'Overly Permissive CORS Configuration',
              'CORS is configured to allow all origins (*), which may be a security risk.',
              'medium',
              'cors-security-check',
              [
                'Specify allowed origins explicitly',
                'Use environment variables for allowed origins',
                'Review CORS security implications',
                'Restrict to necessary domains only'
              ],
              { file: middlewarePath }
            )
          )
        }
      }

      // Check Next.js configuration for CORS
      const nextConfigPath = path.join(projectRoot, 'next.config.js')

      if (await this.fileExists(nextConfigPath)) {
        const nextConfigContent = await this.readFile(nextConfigPath)

        if (nextConfigContent.includes('headers') && nextConfigContent.includes('Access-Control')) {
          // CORS is configured in Next.js config
          if (nextConfigContent.includes('*')) {
            issues.push(
              this.createIssue(
                'Permissive CORS in Next.js Config',
                'CORS headers in Next.js config allow all origins.',
                'medium',
                'cors-config-check',
                [
                  'Restrict CORS origins in next.config.js',
                  'Use specific domains instead of wildcards',
                  'Review security requirements'
                ],
                { file: nextConfigPath }
              )
            )
          }
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check CORS configuration', error)
    }

    return issues
  }

  private async testConnection(url: string, method: string = 'GET', timeout: number = 5000): Promise<{
    success: boolean
    status?: number
    error?: string
    duration?: number
  }> {
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          'User-Agent': 'CA-Lobby-Diagnostic-Agent/1.0'
        }
      })

      clearTimeout(timeoutId)
      const duration = Date.now() - startTime

      return {
        success: response.ok,
        status: response.status,
        duration
      }

    } catch (error: any) {
      const duration = Date.now() - startTime

      return {
        success: false,
        error: error.message,
        duration
      }
    }
  }

  private setupNetworkInterception(): void {
    // Intercept fetch requests if available
    if (typeof fetch !== 'undefined') {
      this.originalFetch = fetch

      // @ts-ignore
      global.fetch = async (...args: Parameters<typeof fetch>) => {
        const startTime = Date.now()
        const url = typeof args[0] === 'string' ? args[0] : args[0].url
        const method = args[1]?.method || 'GET'

        try {
          const response = await this.originalFetch!(...args)
          const duration = Date.now() - startTime

          this.recordRequest({
            url,
            method,
            status: response.status,
            duration,
            timestamp: new Date()
          })

          return response

        } catch (error: any) {
          const duration = Date.now() - startTime

          this.recordRequest({
            url,
            method,
            duration,
            timestamp: new Date(),
            error: error.message
          })

          throw error
        }
      }
    }

    // Intercept XMLHttpRequest if in browser
    if (typeof XMLHttpRequest !== 'undefined') {
      const originalOpen = XMLHttpRequest.prototype.open
      this.originalXHROpen = originalOpen

      XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
        const startTime = Date.now()
        const urlString = typeof url === 'string' ? url : url.toString()

        // Set up event handlers
        this.addEventListener('loadend', () => {
          const duration = Date.now() - startTime

          // Record the request through the agent instance
          if ((global as any).networkAgent) {
            (global as any).networkAgent.recordRequest({
              url: urlString,
              method: method.toUpperCase(),
              status: this.status,
              duration,
              timestamp: new Date(),
              error: this.status >= 400 ? `HTTP ${this.status}` : undefined
            })
          }
        })

        return originalOpen.call(this, method, url, ...args)
      }
    }

    // Store reference for XHR interception
    (global as any).networkAgent = this
  }

  private recordRequest(request: NetworkRequest): void {
    this.requestHistory.push(request)

    // Keep only last 1000 requests
    if (this.requestHistory.length > 1000) {
      this.requestHistory.shift()
    }

    // Track failed requests
    if (request.status && request.status >= 400 || request.error) {
      const key = `${request.method} ${request.url}`
      const count = this.failedRequests.get(key) || 0
      this.failedRequests.set(key, count + 1)
    }

    // Monitor for issues in real-time
    if (this.isActive) {
      this.checkRequestForIssues(request)
    }
  }

  private checkRequestForIssues(request: NetworkRequest): void {
    // Check for slow requests
    if (request.duration && request.duration > this.config.timeoutThreshold) {
      const issue = this.createIssue(
        'Slow Network Request',
        `Request to ${request.url} took ${request.duration}ms`,
        request.duration > this.config.timeoutThreshold * 2 ? 'high' : 'medium',
        'real-time-monitor',
        [
          'Optimize API performance',
          'Check network connectivity',
          'Review server response time',
          'Consider caching'
        ],
        {
          url: request.url,
          method: request.method,
          duration: request.duration
        }
      )
      this.notifyMonitors(issue)
    }

    // Check for errors
    if (request.error || (request.status && request.status >= 500)) {
      const issue = this.createIssue(
        'Network Request Error',
        `Request to ${request.url} failed: ${request.error || `Status ${request.status}`}`,
        'high',
        'real-time-monitor',
        [
          'Check API server status',
          'Verify request URL and parameters',
          'Review error logs',
          'Check authentication'
        ],
        {
          url: request.url,
          method: request.method,
          status: request.status,
          error: request.error
        }
      )
      this.notifyMonitors(issue)
    }
  }

  protected startMonitoring(): void {
    super.startMonitoring()

    // Set up periodic network health checks
    this.monitoringInterval = setInterval(async () => {
      if (this.isActive) {
        await this.performHealthChecks()
      }
    }, 30000) // Check every 30 seconds

    this.log('info', 'Network monitoring started')
  }

  private async performHealthChecks(): Promise<void> {
    try {
      // Check localhost connectivity (development server)
      const localhostCheck = await this.testConnection('http://localhost:3000', 'HEAD', 3000)

      if (!localhostCheck.success && this.config.monitorAPIcalls) {
        const issue = this.createIssue(
          'Development Server Unreachable',
          'Cannot connect to local development server',
          'medium',
          'health-check',
          [
            'Start development server with npm run dev',
            'Check if port 3000 is available',
            'Verify server is running correctly'
          ]
        )
        this.notifyMonitors(issue)
      }

      // Check external connectivity
      if (this.config.checkConnectivity) {
        const externalCheck = await this.testConnection('https://www.google.com', 'HEAD', 5000)

        if (!externalCheck.success) {
          const issue = this.createIssue(
            'No Internet Connectivity',
            'Cannot connect to external services',
            'high',
            'connectivity-check',
            [
              'Check internet connection',
              'Verify DNS resolution',
              'Check firewall settings',
              'Test network connectivity'
            ]
          )
          this.notifyMonitors(issue)
        }
      }

    } catch (error) {
      this.log('debug', 'Health check error', error)
    }
  }

  stop(): void {
    super.stop()

    // Restore original fetch
    if (this.originalFetch && typeof global !== 'undefined') {
      (global as any).fetch = this.originalFetch
    }

    // Restore original XMLHttpRequest.open
    if (this.originalXHROpen && typeof XMLHttpRequest !== 'undefined') {
      XMLHttpRequest.prototype.open = this.originalXHROpen
    }

    // Clear tracking data
    this.requestHistory = []
    this.failedRequests.clear()

    // Remove global reference
    if ((global as any).networkAgent === this) {
      delete (global as any).networkAgent
    }

    this.log('info', 'Network monitoring stopped')
  }
}