/**
 * Auth/Clerk Diagnostic Agent
 * Detects authentication and Clerk-related issues
 */

import { BaseDiagnosticAgent } from '../utils/base-agent'
import { DiagnosticIssue, AuthDiagnosticConfig } from '../types'
import path from 'path'

export class AuthDiagnosticAgent extends BaseDiagnosticAgent {
  private config: AuthDiagnosticConfig = {
    checkClerkProvider: true,
    checkUserContext: true,
    checkMiddleware: true,
    checkEnvironmentVars: true,
    checkAuthFlows: true,
    devModeBypass: true,
  }

  constructor() {
    super('Auth/Clerk Diagnostic Agent', '1.0.0', 'auth')
  }

  async scan(): Promise<DiagnosticIssue[]> {
    this.lastRun = new Date()
    this.log('info', 'Starting Auth/Clerk diagnostic scan')

    const issues: DiagnosticIssue[] = []
    const projectRoot = process.cwd()

    try {
      // Check environment variables
      if (this.config.checkEnvironmentVars) {
        issues.push(...await this.checkEnvironmentVariables())
      }

      // Check Clerk configuration
      if (this.config.checkClerkProvider) {
        issues.push(...await this.checkClerkProvider(projectRoot))
      }

      // Check middleware configuration
      if (this.config.checkMiddleware) {
        issues.push(...await this.checkMiddleware(projectRoot))
      }

      // Check auth utilities
      if (this.config.checkUserContext) {
        issues.push(...await this.checkAuthUtilities(projectRoot))
      }

      // Check auth flows
      if (this.config.checkAuthFlows) {
        issues.push(...await this.checkAuthFlows(projectRoot))
      }

      this.log('info', `Auth diagnostic scan completed. Found ${issues.length} issues`)
      return issues

    } catch (error) {
      this.log('error', 'Error during auth diagnostic scan', error)
      return [
        this.createIssue(
          'Auth Diagnostic Scan Failed',
          `Failed to complete auth diagnostic scan: ${error}`,
          'high',
          'auth-agent',
          ['Check agent configuration', 'Verify file permissions']
        )
      ]
    }
  }

  private async checkEnvironmentVariables(): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    const requiredEnvVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY'
    ]

    const optionalEnvVars = [
      'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
      'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
      'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
    ]

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(
          this.createIssue(
            `Missing Required Environment Variable: ${envVar}`,
            `The environment variable ${envVar} is required for Clerk authentication but is not set.`,
            'critical',
            'environment-check',
            [
              `Add ${envVar} to your .env.local file`,
              'Check your Clerk dashboard for the correct values',
              'Ensure environment variables are loaded correctly'
            ],
            { envVar, type: 'required' }
          )
        )
      } else if (envVar.includes('PUBLISHABLE_KEY') && !process.env[envVar]!.startsWith('pk_')) {
        issues.push(
          this.createIssue(
            `Invalid Clerk Publishable Key Format`,
            `The Clerk publishable key should start with 'pk_' but found: ${process.env[envVar]?.substring(0, 10)}...`,
            'high',
            'environment-check',
            [
              'Verify the publishable key from your Clerk dashboard',
              'Ensure you copied the complete key',
              'Check for any trailing spaces or characters'
            ],
            { envVar, type: 'format' }
          )
        )
      } else if (envVar.includes('SECRET_KEY') && !process.env[envVar]!.startsWith('sk_')) {
        issues.push(
          this.createIssue(
            `Invalid Clerk Secret Key Format`,
            `The Clerk secret key should start with 'sk_' but the current value doesn't match this pattern.`,
            'critical',
            'environment-check',
            [
              'Verify the secret key from your Clerk dashboard',
              'Ensure you copied the complete key',
              'Never expose secret keys in client-side code'
            ],
            { envVar, type: 'format' }
          )
        )
      }
    }

    // Check optional environment variables
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        issues.push(
          this.createIssue(
            `Optional Environment Variable Not Set: ${envVar}`,
            `The optional environment variable ${envVar} is not set. This may affect auth flow customization.`,
            'low',
            'environment-check',
            [
              `Consider setting ${envVar} for custom auth flows`,
              'Check Clerk documentation for URL configuration',
              'Use default values if custom URLs are not needed'
            ],
            { envVar, type: 'optional' }
          )
        )
      }
    }

    // Check for development bypass
    if (process.env.DISABLE_CLERK_AUTH === 'true') {
      const severity = process.env.NODE_ENV === 'production' ? 'critical' : 'info'
      issues.push(
        this.createIssue(
          'Authentication Bypass Enabled',
          'Clerk authentication is disabled via DISABLE_CLERK_AUTH environment variable.',
          severity,
          'environment-check',
          severity === 'critical' ? [
            'Remove DISABLE_CLERK_AUTH from production environment',
            'Ensure proper authentication is enabled in production'
          ] : [
            'This is normal for development',
            'Ensure this is disabled in production'
          ],
          { envVar: 'DISABLE_CLERK_AUTH', environment: process.env.NODE_ENV }
        )
      )
    }

    return issues
  }

  private async checkClerkProvider(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check app layout for ClerkProvider
      const layoutPath = path.join(projectRoot, 'app', 'layout.tsx')
      const rootLayoutPath = path.join(projectRoot, 'app', 'layout.tsx')

      let layoutContent = ''
      let layoutFile = ''

      if (await this.fileExists(layoutPath)) {
        layoutContent = await this.readFile(layoutPath)
        layoutFile = layoutPath
      } else if (await this.fileExists(rootLayoutPath)) {
        layoutContent = await this.readFile(rootLayoutPath)
        layoutFile = rootLayoutPath
      }

      if (!layoutContent) {
        issues.push(
          this.createIssue(
            'No Layout File Found',
            'Could not find app/layout.tsx or root layout file to check ClerkProvider setup.',
            'high',
            'clerk-provider-check',
            [
              'Create app/layout.tsx file',
              'Ensure proper Next.js app directory structure',
              'Check file paths and permissions'
            ]
          )
        )
        return issues
      }

      // Check for ClerkProvider import
      if (!layoutContent.includes('ClerkProvider')) {
        issues.push(
          this.createIssue(
            'ClerkProvider Not Found in Layout',
            'ClerkProvider is not imported or used in the root layout file.',
            'critical',
            'clerk-provider-check',
            [
              'Import ClerkProvider from @clerk/nextjs',
              'Wrap your app with <ClerkProvider>',
              'Follow Clerk Next.js setup documentation'
            ],
            { file: layoutFile }
          )
        )
      }

      // Check for proper ClerkProvider import
      if (!layoutContent.includes("from '@clerk/nextjs'") && layoutContent.includes('ClerkProvider')) {
        issues.push(
          this.createIssue(
            'Incorrect ClerkProvider Import',
            'ClerkProvider is used but not imported from @clerk/nextjs.',
            'high',
            'clerk-provider-check',
            [
              "Import ClerkProvider from '@clerk/nextjs'",
              'Check import statements at the top of the file',
              'Ensure @clerk/nextjs is installed'
            ],
            { file: layoutFile }
          )
        )
      }

      // Check for children wrapping
      if (layoutContent.includes('ClerkProvider') && !layoutContent.includes('{children}')) {
        issues.push(
          this.createIssue(
            'ClerkProvider Missing Children',
            'ClerkProvider is present but may not be properly wrapping the app children.',
            'medium',
            'clerk-provider-check',
            [
              'Ensure ClerkProvider wraps {children}',
              'Check the component structure',
              'Verify proper JSX nesting'
            ],
            { file: layoutFile }
          )
        )
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking ClerkProvider',
          `Failed to check ClerkProvider configuration: ${error}`,
          'medium',
          'clerk-provider-check',
          ['Check file permissions', 'Verify file paths']
        )
      )
    }

    return issues
  }

  private async checkMiddleware(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      const middlewarePath = path.join(projectRoot, 'middleware.ts')

      if (!await this.fileExists(middlewarePath)) {
        issues.push(
          this.createIssue(
            'No Middleware File Found',
            'Middleware.ts file not found. This may affect auth routing and protection.',
            'medium',
            'middleware-check',
            [
              'Create middleware.ts in project root',
              'Configure authMiddleware from @clerk/nextjs',
              'Set up protected routes'
            ]
          )
        )
        return issues
      }

      const middlewareContent = await this.readFile(middlewarePath)

      // Check for authMiddleware import
      if (!middlewareContent.includes('authMiddleware')) {
        issues.push(
          this.createIssue(
            'authMiddleware Not Found',
            'authMiddleware is not imported or used in middleware.ts.',
            'high',
            'middleware-check',
            [
              'Import authMiddleware from @clerk/nextjs',
              'Configure auth middleware properly',
              'Check Clerk middleware documentation'
            ],
            { file: middlewarePath }
          )
        )
      }

      // Check for proper export
      if (!middlewareContent.includes('export default')) {
        issues.push(
          this.createIssue(
            'Middleware Missing Default Export',
            'middleware.ts should export the middleware function as default.',
            'medium',
            'middleware-check',
            [
              'Add export default for your middleware',
              'Ensure proper middleware configuration',
              'Check Next.js middleware documentation'
            ],
            { file: middlewarePath }
          )
        )
      }

      // Check for config export
      if (!middlewareContent.includes('export const config')) {
        issues.push(
          this.createIssue(
            'Middleware Missing Config',
            'middleware.ts should export a config object with matcher.',
            'low',
            'middleware-check',
            [
              'Add export const config with matcher',
              'Configure route matching patterns',
              'Exclude static files from middleware'
            ],
            { file: middlewarePath }
          )
        )
      }

      // Check for development bypass
      if (middlewareContent.includes('DISABLE_CLERK_AUTH') && process.env.NODE_ENV === 'production') {
        issues.push(
          this.createIssue(
            'Auth Bypass in Production Middleware',
            'Middleware contains development auth bypass code that should not be in production.',
            'critical',
            'middleware-check',
            [
              'Remove development bypass logic from production',
              'Use environment-specific configurations',
              'Ensure proper auth enforcement in production'
            ],
            { file: middlewarePath }
          )
        )
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking Middleware',
          `Failed to check middleware configuration: ${error}`,
          'medium',
          'middleware-check',
          ['Check file permissions', 'Verify file paths']
        )
      )
    }

    return issues
  }

  private async checkAuthUtilities(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      const authPath = path.join(projectRoot, 'app', 'lib', 'auth.ts')

      if (!await this.fileExists(authPath)) {
        issues.push(
          this.createIssue(
            'No Auth Utilities Found',
            'app/lib/auth.ts file not found. Auth utility functions may be missing.',
            'low',
            'auth-utilities-check',
            [
              'Create auth utility functions',
              'Implement user role management',
              'Add permission checking functions'
            ]
          )
        )
        return issues
      }

      const authContent = await this.readFile(authPath)

      // Check for auth import
      if (!authContent.includes("from '@clerk/nextjs'")) {
        issues.push(
          this.createIssue(
            'Missing Clerk Auth Import',
            'Auth utilities file does not import auth from @clerk/nextjs.',
            'medium',
            'auth-utilities-check',
            [
              "Import { auth } from '@clerk/nextjs'",
              'Use auth() to get current user session',
              'Follow Clerk authentication patterns'
            ],
            { file: authPath }
          )
        )
      }

      // Check for user role definitions
      if (!authContent.includes('USER_ROLES') && !authContent.includes('roles')) {
        issues.push(
          this.createIssue(
            'No User Roles Defined',
            'Auth utilities file does not define user roles or permissions.',
            'low',
            'auth-utilities-check',
            [
              'Define user roles and permissions',
              'Implement role-based access control',
              'Create permission checking functions'
            ],
            { file: authPath }
          )
        )
      }

      // Check for error handling
      if (authContent.includes('auth()') && !authContent.includes('try') && !authContent.includes('catch')) {
        issues.push(
          this.createIssue(
            'Missing Error Handling in Auth Utils',
            'Auth utility functions lack proper error handling.',
            'medium',
            'auth-utilities-check',
            [
              'Add try-catch blocks to auth functions',
              'Handle authentication failures gracefully',
              'Log auth errors appropriately'
            ],
            { file: authPath }
          )
        )
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking Auth Utilities',
          `Failed to check auth utilities: ${error}`,
          'medium',
          'auth-utilities-check',
          ['Check file permissions', 'Verify file paths']
        )
      )
    }

    return issues
  }

  private async checkAuthFlows(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for sign-in page
      const signInPaths = [
        path.join(projectRoot, 'app', 'sign-in', 'page.tsx'),
        path.join(projectRoot, 'app', 'sign-in', 'index.tsx'),
        path.join(projectRoot, 'pages', 'sign-in.tsx')
      ]

      let signInExists = false
      for (const signInPath of signInPaths) {
        if (await this.fileExists(signInPath)) {
          signInExists = true

          // Check sign-in page implementation
          const signInContent = await this.readFile(signInPath)

          if (!signInContent.includes('SignIn')) {
            issues.push(
              this.createIssue(
                'Sign-In Component Missing',
                'Sign-in page exists but does not use Clerk SignIn component.',
                'medium',
                'auth-flows-check',
                [
                  'Import SignIn component from @clerk/nextjs',
                  'Use <SignIn /> in your sign-in page',
                  'Configure sign-in options if needed'
                ],
                { file: signInPath }
              )
            )
          }
          break
        }
      }

      if (!signInExists) {
        issues.push(
          this.createIssue(
            'No Sign-In Page Found',
            'No sign-in page found. Users may not be able to authenticate.',
            'high',
            'auth-flows-check',
            [
              'Create app/sign-in/page.tsx',
              'Add SignIn component from Clerk',
              'Configure sign-in routing'
            ]
          )
        )
      }

      // Check for sign-up page
      const signUpPaths = [
        path.join(projectRoot, 'app', 'sign-up', 'page.tsx'),
        path.join(projectRoot, 'app', 'sign-up', 'index.tsx'),
        path.join(projectRoot, 'pages', 'sign-up.tsx')
      ]

      let signUpExists = false
      for (const signUpPath of signUpPaths) {
        if (await this.fileExists(signUpPath)) {
          signUpExists = true

          // Check sign-up page implementation
          const signUpContent = await this.readFile(signUpPath)

          if (!signUpContent.includes('SignUp')) {
            issues.push(
              this.createIssue(
                'Sign-Up Component Missing',
                'Sign-up page exists but does not use Clerk SignUp component.',
                'medium',
                'auth-flows-check',
                [
                  'Import SignUp component from @clerk/nextjs',
                  'Use <SignUp /> in your sign-up page',
                  'Configure sign-up options if needed'
                ],
                { file: signUpPath }
              )
            )
          }
          break
        }
      }

      if (!signUpExists) {
        issues.push(
          this.createIssue(
            'No Sign-Up Page Found',
            'No sign-up page found. New users may not be able to register.',
            'medium',
            'auth-flows-check',
            [
              'Create app/sign-up/page.tsx',
              'Add SignUp component from Clerk',
              'Configure sign-up routing'
            ]
          )
        )
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking Auth Flows',
          `Failed to check auth flows: ${error}`,
          'medium',
          'auth-flows-check',
          ['Check file permissions', 'Verify file paths']
        )
      )
    }

    return issues
  }

  protected startMonitoring(): void {
    super.startMonitoring()

    // Monitor for runtime auth errors
    if (typeof window !== 'undefined') {
      // Client-side monitoring
      window.addEventListener('error', (event) => {
        if (event.error?.message?.includes('Clerk') ||
            event.error?.message?.includes('auth') ||
            event.error?.message?.includes('user')) {
          const issue = this.createIssue(
            'Runtime Auth Error',
            `Authentication error detected: ${event.error.message}`,
            'high',
            'runtime-monitor',
            [
              'Check Clerk configuration',
              'Verify user authentication state',
              'Review auth middleware setup'
            ],
            {
              error: event.error.message,
              stack: event.error.stack,
              url: event.filename,
              line: event.lineno
            }
          )
          this.notifyMonitors(issue)
        }
      })

      // Monitor console errors
      const originalError = console.error
      console.error = (...args) => {
        const message = args.join(' ')
        if (message.includes('Clerk') || message.includes('auth')) {
          const issue = this.createIssue(
            'Console Auth Error',
            `Auth-related console error: ${message}`,
            'medium',
            'console-monitor',
            [
              'Check browser console for details',
              'Review auth implementation',
              'Verify Clerk configuration'
            ]
          )
          this.notifyMonitors(issue)
        }
        originalError.apply(console, args)
      }
    }

    this.log('info', 'Auth monitoring started')
  }
}