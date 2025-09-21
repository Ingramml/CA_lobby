/**
 * Build & Compilation Diagnostic Agent
 * Detects build, compilation, and bundling issues
 */

import { BaseDiagnosticAgent } from '../utils/base-agent'
import { DiagnosticIssue, BuildDiagnosticConfig } from '../types'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'

export class BuildDiagnosticAgent extends BaseDiagnosticAgent {
  private config: BuildDiagnosticConfig = {
    monitorNextBuild: true,
    checkWebpack: true,
    checkDependencies: true,
    checkCSS: true,
    checkHotReload: true,
    buildCommand: 'npm run build',
  }

  private buildProcess?: ChildProcess
  private devProcess?: ChildProcess
  private buildLogs: string[] = []
  private isBuilding: boolean = false

  constructor() {
    super('Build & Compilation Diagnostic Agent', '1.0.0', 'build')
  }

  async scan(): Promise<DiagnosticIssue[]> {
    this.lastRun = new Date()
    this.log('info', 'Starting build & compilation diagnostic scan')

    const issues: DiagnosticIssue[] = []
    const projectRoot = process.cwd()

    try {
      // Check Next.js configuration
      issues.push(...await this.checkNextConfig(projectRoot))

      // Check package.json for build-related issues
      issues.push(...await this.checkPackageJson(projectRoot))

      // Check dependencies
      if (this.config.checkDependencies) {
        issues.push(...await this.checkDependencies(projectRoot))
      }

      // Run build test
      if (this.config.monitorNextBuild) {
        issues.push(...await this.runBuildTest(projectRoot))
      }

      // Check webpack configuration
      if (this.config.checkWebpack) {
        issues.push(...await this.checkWebpackConfig(projectRoot))
      }

      // Check CSS and styling
      if (this.config.checkCSS) {
        issues.push(...await this.checkCSSConfig(projectRoot))
      }

      // Check for common build issues
      issues.push(...await this.checkCommonBuildIssues(projectRoot))

      this.log('info', `Build diagnostic scan completed. Found ${issues.length} issues`)
      return issues

    } catch (error) {
      this.log('error', 'Error during build diagnostic scan', error)
      return [
        this.createIssue(
          'Build Diagnostic Scan Failed',
          `Failed to complete build diagnostic scan: ${error}`,
          'high',
          'build-agent',
          ['Check agent configuration', 'Verify build environment']
        )
      ]
    }
  }

  private async checkNextConfig(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      const nextConfigPath = path.join(projectRoot, 'next.config.js')
      const nextConfigTsPath = path.join(projectRoot, 'next.config.ts')

      let configPath = ''
      let configContent = ''

      if (await this.fileExists(nextConfigPath)) {
        configPath = nextConfigPath
        configContent = await this.readFile(nextConfigPath)
      } else if (await this.fileExists(nextConfigTsPath)) {
        configPath = nextConfigTsPath
        configContent = await this.readFile(nextConfigTsPath)
      }

      if (!configContent) {
        issues.push(
          this.createIssue(
            'No Next.js Configuration Found',
            'No next.config.js or next.config.ts file found. Using default configuration.',
            'low',
            'nextjs-config-check',
            [
              'Create next.config.js for custom configuration',
              'Review Next.js configuration options',
              'Consider adding optimizations'
            ]
          )
        )
        return issues
      }

      // Check for common configuration issues
      if (configContent.includes('experimental') && !configContent.includes('appDir: true')) {
        if (configContent.includes('app/')) {
          issues.push(
            this.createIssue(
              'App Directory Not Enabled',
              'Using app directory structure but appDir experimental feature is not enabled.',
              'high',
              'nextjs-config-check',
              [
                'Add experimental: { appDir: true } to next.config.js',
                'Update to Next.js 13+ app directory features',
                'Check Next.js documentation for app directory'
              ],
              { file: configPath }
            )
          )
        }
      }

      // Check for performance optimizations
      if (!configContent.includes('images') && configContent.includes('next/image')) {
        issues.push(
          this.createIssue(
            'Image Optimization Not Configured',
            'Using next/image but no image configuration found in next.config.js.',
            'low',
            'nextjs-config-check',
            [
              'Configure image domains and optimization',
              'Add images configuration to next.config.js',
              'Review Next.js image optimization docs'
            ],
            { file: configPath }
          )
        )
      }

      // Check for webpack customization issues
      if (configContent.includes('webpack:') && !configContent.includes('return config')) {
        issues.push(
          this.createIssue(
            'Webpack Configuration May Be Invalid',
            'Webpack configuration found but may not be returning the config object properly.',
            'medium',
            'webpack-config-check',
            [
              'Ensure webpack function returns config object',
              'Check webpack customization syntax',
              'Test build with webpack changes'
            ],
            { file: configPath }
          )
        )
      }

      // Check for environment variable configuration
      if (!configContent.includes('env') && !configContent.includes('publicRuntimeConfig')) {
        // Check if there are environment variables that might need configuration
        const envExists = await this.fileExists(path.join(projectRoot, '.env.local'))
        if (envExists) {
          const envContent = await this.readFile(path.join(projectRoot, '.env.local'))
          if (envContent.includes('NEXT_PUBLIC_')) {
            issues.push(
              this.createIssue(
                'Environment Variables Not Configured',
                'Found environment variables but no configuration in next.config.js.',
                'low',
                'env-config-check',
                [
                  'Add env configuration to next.config.js if needed',
                  'Use NEXT_PUBLIC_ prefix for client-side variables',
                  'Review environment variable handling'
                ],
                { file: configPath }
              )
            )
          }
        }
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking Next.js Configuration',
          `Failed to check Next.js configuration: ${error}`,
          'medium',
          'nextjs-config-check',
          ['Check file permissions', 'Verify file syntax']
        )
      )
    }

    return issues
  }

  private async checkPackageJson(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      const packageJsonPath = path.join(projectRoot, 'package.json')

      if (!await this.fileExists(packageJsonPath)) {
        issues.push(
          this.createIssue(
            'No package.json Found',
            'package.json file not found in project root.',
            'critical',
            'package-json-check',
            [
              'Create package.json file',
              'Initialize project with npm init',
              'Check project structure'
            ]
          )
        )
        return issues
      }

      const packageContent = await this.readFile(packageJsonPath)
      let packageJson: any

      try {
        packageJson = JSON.parse(packageContent)
      } catch (parseError) {
        issues.push(
          this.createIssue(
            'Invalid package.json',
            `package.json contains invalid JSON: ${parseError}`,
            'critical',
            'package-json-check',
            [
              'Fix JSON syntax in package.json',
              'Validate JSON structure',
              'Check for trailing commas or syntax errors'
            ],
            { file: packageJsonPath }
          )
        )
        return issues
      }

      // Check build scripts
      const scripts = packageJson.scripts || {}

      if (!scripts.build) {
        issues.push(
          this.createIssue(
            'No Build Script Defined',
            'No "build" script found in package.json.',
            'high',
            'build-script-check',
            [
              'Add "build": "next build" to scripts',
              'Configure build command for your project',
              'Check Next.js documentation'
            ],
            { file: packageJsonPath }
          )
        )
      }

      if (!scripts.dev && !scripts.start) {
        issues.push(
          this.createIssue(
            'No Development Script Defined',
            'No "dev" or "start" script found in package.json.',
            'medium',
            'dev-script-check',
            [
              'Add "dev": "next dev" to scripts',
              'Add "start": "next start" to scripts',
              'Configure development commands'
            ],
            { file: packageJsonPath }
          )
        )
      }

      // Check dependencies
      const dependencies = packageJson.dependencies || {}
      const devDependencies = packageJson.devDependencies || {}

      // Check for Next.js
      if (!dependencies.next && !devDependencies.next) {
        issues.push(
          this.createIssue(
            'Next.js Not Found in Dependencies',
            'Next.js is not listed in dependencies or devDependencies.',
            'critical',
            'dependency-check',
            [
              'Install Next.js: npm install next react react-dom',
              'Add Next.js to dependencies',
              'Check if this is a Next.js project'
            ],
            { file: packageJsonPath }
          )
        )
      }

      // Check for React
      if (!dependencies.react && !devDependencies.react) {
        issues.push(
          this.createIssue(
            'React Not Found in Dependencies',
            'React is not listed in dependencies.',
            'critical',
            'dependency-check',
            [
              'Install React: npm install react react-dom',
              'Add React to dependencies',
              'Check React version compatibility'
            ],
            { file: packageJsonPath }
          )
        )
      }

      // Check for TypeScript setup
      const hasTypeScript = dependencies.typescript || devDependencies.typescript
      const hasTsConfig = await this.fileExists(path.join(projectRoot, 'tsconfig.json'))

      if (hasTypeScript && !hasTsConfig) {
        issues.push(
          this.createIssue(
            'TypeScript Installed But No tsconfig.json',
            'TypeScript is installed but no tsconfig.json file found.',
            'medium',
            'typescript-setup-check',
            [
              'Run npx tsc --init to create tsconfig.json',
              'Configure TypeScript settings',
              'Add TypeScript types for React and Next.js'
            ]
          )
        )
      }

      if (!hasTypeScript && hasTsConfig) {
        issues.push(
          this.createIssue(
            'tsconfig.json Found But TypeScript Not Installed',
            'tsconfig.json exists but TypeScript is not in dependencies.',
            'medium',
            'typescript-setup-check',
            [
              'Install TypeScript: npm install -D typescript',
              'Install @types/react and @types/node',
              'Configure TypeScript properly'
            ]
          )
        )
      }

      // Check for version conflicts
      const nextVersion = dependencies.next || devDependencies.next
      const reactVersion = dependencies.react || devDependencies.react

      if (nextVersion && reactVersion) {
        // Simple version compatibility check
        if (nextVersion.includes('14') && reactVersion.includes('17')) {
          issues.push(
            this.createIssue(
              'Potential Version Compatibility Issue',
              'Next.js 14 with React 17 may have compatibility issues.',
              'medium',
              'version-compatibility-check',
              [
                'Update React to version 18+',
                'Check Next.js compatibility matrix',
                'Test thoroughly after version updates'
              ],
              { nextVersion, reactVersion }
            )
          )
        }
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking package.json',
          `Failed to check package.json: ${error}`,
          'medium',
          'package-json-check',
          ['Check file permissions', 'Verify file syntax']
        )
      )
    }

    return issues
  }

  private async checkDependencies(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(projectRoot, 'node_modules')
      if (!await this.fileExists(nodeModulesPath)) {
        issues.push(
          this.createIssue(
            'Dependencies Not Installed',
            'node_modules directory not found. Dependencies may not be installed.',
            'high',
            'dependency-install-check',
            [
              'Run npm install or yarn install',
              'Check package.json for correct dependencies',
              'Verify package manager is working'
            ]
          )
        )
        return issues
      }

      // Check for outdated dependencies
      const result = await this.runCommand('npm outdated --json', projectRoot)
      if (result.stdout) {
        try {
          const outdated = JSON.parse(result.stdout)
          const outdatedCount = Object.keys(outdated).length

          if (outdatedCount > 0) {
            const criticalOutdated = Object.entries(outdated).filter(([_, info]: [string, any]) =>
              info.type === 'dependencies' && (
                info.current.includes('0.') || // Pre-1.0 versions
                parseInt(info.wanted.split('.')[0]) > parseInt(info.current.split('.')[0]) // Major version behind
              )
            )

            if (criticalOutdated.length > 0) {
              issues.push(
                this.createIssue(
                  'Critical Dependencies Outdated',
                  `${criticalOutdated.length} critical dependencies are significantly outdated.`,
                  'high',
                  'dependency-outdated-check',
                  [
                    'Review and update critical dependencies',
                    'Test thoroughly after updates',
                    'Check for breaking changes',
                    'Consider using npm audit for security issues'
                  ],
                  { outdatedDependencies: criticalOutdated.map(([name]) => name) }
                )
              )
            }

            if (outdatedCount > 10) {
              issues.push(
                this.createIssue(
                  'Many Outdated Dependencies',
                  `${outdatedCount} dependencies are outdated.`,
                  'medium',
                  'dependency-outdated-check',
                  [
                    'Run npm update to update dependencies',
                    'Review release notes for major updates',
                    'Consider automated dependency updates',
                    'Prioritize security updates'
                  ],
                  { outdatedCount }
                )
              )
            }
          }
        } catch {
          // npm outdated output may not be valid JSON if no outdated packages
        }
      }

      // Check for security vulnerabilities
      const auditResult = await this.runCommand('npm audit --json', projectRoot)
      if (auditResult.stdout) {
        try {
          const audit = JSON.parse(auditResult.stdout)
          if (audit.vulnerabilities) {
            const vulnCount = Object.keys(audit.vulnerabilities).length

            if (vulnCount > 0) {
              const criticalVulns = Object.values(audit.vulnerabilities).filter((vuln: any) =>
                vuln.severity === 'critical' || vuln.severity === 'high'
              )

              if (criticalVulns.length > 0) {
                issues.push(
                  this.createIssue(
                    'Critical Security Vulnerabilities',
                    `${criticalVulns.length} critical/high security vulnerabilities found.`,
                    'critical',
                    'security-audit-check',
                    [
                      'Run npm audit fix to fix vulnerabilities',
                      'Update vulnerable dependencies manually if needed',
                      'Review security advisory details',
                      'Consider alternative packages if fixes unavailable'
                    ],
                    { criticalVulns: criticalVulns.length, totalVulns: vulnCount }
                  )
                )
              } else {
                issues.push(
                  this.createIssue(
                    'Security Vulnerabilities Found',
                    `${vulnCount} security vulnerabilities found.`,
                    'medium',
                    'security-audit-check',
                    [
                      'Run npm audit fix to fix vulnerabilities',
                      'Review vulnerability details',
                      'Update dependencies as needed'
                    ],
                    { totalVulns: vulnCount }
                  )
                )
              }
            }
          }
        } catch {
          // npm audit output may not be valid JSON in some cases
        }
      }

      // Check for duplicate dependencies
      const dupeResult = await this.runCommand('npm ls --depth=0', projectRoot)
      if (dupeResult.stderr && dupeResult.stderr.includes('WARN')) {
        const warnings = dupeResult.stderr.split('\n').filter(line => line.includes('WARN'))
        const dupeWarnings = warnings.filter(line => line.includes('duplicate') || line.includes('conflict'))

        if (dupeWarnings.length > 0) {
          issues.push(
            this.createIssue(
              'Duplicate Dependencies Detected',
              `Found ${dupeWarnings.length} dependency conflicts or duplicates.`,
              'medium',
              'dependency-duplicate-check',
              [
                'Review package.json for duplicate dependencies',
                'Use npm dedupe to reduce duplicates',
                'Check for version conflicts',
                'Consider using exact versions'
              ],
              { conflicts: dupeWarnings.length }
            )
          )
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check dependencies', error)
    }

    return issues
  }

  private async runBuildTest(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      this.log('info', 'Running build test...')
      this.isBuilding = true

      // Run a dry build to check for issues
      const buildResult = await this.runCommand(
        'npx next build --no-lint',
        projectRoot,
        { timeout: 120000 } // 2 minute timeout
      )

      this.isBuilding = false

      if (buildResult.exitCode !== 0) {
        // Parse build errors
        const buildErrors = this.parseBuildErrors(buildResult.stderr)

        for (const error of buildErrors) {
          issues.push(
            this.createIssue(
              'Build Error',
              error.message,
              error.severity,
              'build-test',
              error.suggestions,
              {
                file: error.file,
                line: error.line,
                buildPhase: error.phase
              },
              error.file,
              error.line
            )
          )
        }

        if (buildErrors.length === 0) {
          // Generic build failure
          issues.push(
            this.createIssue(
              'Build Failed',
              `Build process failed with exit code ${buildResult.exitCode}`,
              'critical',
              'build-test',
              [
                'Check build logs for details',
                'Review recent code changes',
                'Verify all dependencies are installed',
                'Check for syntax errors'
              ],
              { exitCode: buildResult.exitCode, stderr: buildResult.stderr }
            )
          )
        }
      } else {
        // Build succeeded, check for warnings
        const warnings = this.parseBuildWarnings(buildResult.stdout)

        for (const warning of warnings) {
          issues.push(
            this.createIssue(
              'Build Warning',
              warning.message,
              'low',
              'build-test',
              warning.suggestions,
              {
                file: warning.file,
                line: warning.line,
                buildPhase: warning.phase
              },
              warning.file,
              warning.line
            )
          )
        }
      }

    } catch (error) {
      this.isBuilding = false
      issues.push(
        this.createIssue(
          'Build Test Failed',
          `Failed to run build test: ${error}`,
          'high',
          'build-test',
          [
            'Check if Next.js is properly installed',
            'Verify build command is correct',
            'Check for permission issues'
          ]
        )
      )
    }

    return issues
  }

  private parseBuildErrors(stderr: string): Array<{
    message: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    file?: string
    line?: number
    phase: string
    suggestions: string[]
  }> {
    const errors: Array<{
      message: string
      severity: 'critical' | 'high' | 'medium' | 'low'
      file?: string
      line?: number
      phase: string
      suggestions: string[]
    }> = []

    const lines = stderr.split('\n')

    for (const line of lines) {
      // Parse TypeScript errors
      const tsError = line.match(/(.+?)\((\d+),(\d+)\):\s*error\s+TS(\d+):\s*(.+)/)
      if (tsError) {
        errors.push({
          message: `TypeScript Error TS${tsError[4]}: ${tsError[5]}`,
          severity: 'high',
          file: tsError[1],
          line: parseInt(tsError[2], 10),
          phase: 'typescript',
          suggestions: [
            'Fix TypeScript compilation error',
            'Check type definitions',
            'Review TypeScript configuration'
          ]
        })
        continue
      }

      // Parse module not found errors
      if (line.includes('Module not found') || line.includes('Cannot resolve module')) {
        errors.push({
          message: line.trim(),
          severity: 'high',
          phase: 'webpack',
          suggestions: [
            'Check import path spelling',
            'Verify module is installed',
            'Check file exists at specified path',
            'Review module resolution configuration'
          ]
        })
        continue
      }

      // Parse syntax errors
      if (line.includes('SyntaxError') || line.includes('Unexpected token')) {
        errors.push({
          message: line.trim(),
          severity: 'critical',
          phase: 'parsing',
          suggestions: [
            'Fix syntax error in code',
            'Check for missing brackets or semicolons',
            'Review recent code changes',
            'Use code editor with syntax highlighting'
          ]
        })
        continue
      }

      // Parse memory errors
      if (line.includes('FATAL ERROR') && line.includes('heap out of memory')) {
        errors.push({
          message: 'Build ran out of memory',
          severity: 'critical',
          phase: 'compilation',
          suggestions: [
            'Increase Node.js memory limit: --max-old-space-size=4096',
            'Optimize bundle size',
            'Check for memory leaks in build process',
            'Consider incremental builds'
          ]
        })
        continue
      }

      // Generic error detection
      if (line.includes('Error:') || line.includes('ERROR')) {
        errors.push({
          message: line.trim(),
          severity: 'medium',
          phase: 'general',
          suggestions: [
            'Review error details',
            'Check recent changes',
            'Verify configuration',
            'Check logs for more context'
          ]
        })
      }
    }

    return errors
  }

  private parseBuildWarnings(stdout: string): Array<{
    message: string
    file?: string
    line?: number
    phase: string
    suggestions: string[]
  }> {
    const warnings: Array<{
      message: string
      file?: string
      line?: number
      phase: string
      suggestions: string[]
    }> = []

    const lines = stdout.split('\n')

    for (const line of lines) {
      if (line.includes('warning') || line.includes('Warning')) {
        warnings.push({
          message: line.trim(),
          phase: 'compilation',
          suggestions: [
            'Review warning details',
            'Consider fixing to improve build quality',
            'Check if warning indicates potential issues'
          ]
        })
      }

      // Bundle size warnings
      if (line.includes('Large page data') || line.includes('bundle size')) {
        warnings.push({
          message: line.trim(),
          phase: 'optimization',
          suggestions: [
            'Optimize bundle size',
            'Use dynamic imports for large components',
            'Review page data usage',
            'Consider code splitting'
          ]
        })
      }
    }

    return warnings
  }

  private async checkWebpackConfig(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check if there's a custom webpack config in next.config.js
      const nextConfigPath = path.join(projectRoot, 'next.config.js')

      if (await this.fileExists(nextConfigPath)) {
        const configContent = await this.readFile(nextConfigPath)

        if (configContent.includes('webpack:')) {
          // Check for common webpack issues
          if (!configContent.includes('return config')) {
            issues.push(
              this.createIssue(
                'Webpack Config Not Returning Config',
                'Custom webpack configuration may not be returning the config object.',
                'high',
                'webpack-config-check',
                [
                  'Ensure webpack function returns the config object',
                  'Check webpack customization syntax',
                  'Test build with webpack modifications'
                ],
                { file: nextConfigPath }
              )
            )
          }

          if (configContent.includes('config.module.rules.push') && !configContent.includes('test:')) {
            issues.push(
              this.createIssue(
                'Webpack Rule May Be Invalid',
                'Adding webpack rules but rule may be missing test property.',
                'medium',
                'webpack-config-check',
                [
                  'Ensure webpack rules have test property',
                  'Check webpack rule syntax',
                  'Review webpack documentation'
                ],
                { file: nextConfigPath }
              )
            )
          }
        }
      }

      // Check for webpack-related build issues
      const buildLogPath = path.join(projectRoot, '.next', 'build-manifest.json')
      if (await this.fileExists(buildLogPath)) {
        // Check build manifest for issues
        const buildManifest = JSON.parse(await this.readFile(buildLogPath))

        // Check for excessively large bundles
        const pages = buildManifest.pages || {}
        for (const [page, files] of Object.entries(pages)) {
          const jsFiles = (files as string[]).filter(file => file.endsWith('.js'))
          if (jsFiles.length > 10) {
            issues.push(
              this.createIssue(
                'Page Has Many JavaScript Files',
                `Page "${page}" loads ${jsFiles.length} JavaScript files.`,
                'medium',
                'bundle-optimization-check',
                [
                  'Consider code splitting',
                  'Review component structure',
                  'Optimize imports',
                  'Use dynamic imports for large dependencies'
                ],
                { page, fileCount: jsFiles.length }
              )
            )
          }
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check webpack configuration', error)
    }

    return issues
  }

  private async checkCSSConfig(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for CSS configuration files
      const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.js')
      const tailwindConfigTsPath = path.join(projectRoot, 'tailwind.config.ts')
      const postcssConfigPath = path.join(projectRoot, 'postcss.config.js')

      // Check Tailwind CSS setup
      if (await this.fileExists(tailwindConfigPath) || await this.fileExists(tailwindConfigTsPath)) {
        // Check if Tailwind is properly configured
        const configPath = await this.fileExists(tailwindConfigPath) ? tailwindConfigPath : tailwindConfigTsPath
        const configContent = await this.readFile(configPath)

        if (!configContent.includes('content:') && !configContent.includes('purge:')) {
          issues.push(
            this.createIssue(
              'Tailwind CSS Content Not Configured',
              'Tailwind CSS is configured but content/purge paths are not set.',
              'medium',
              'css-config-check',
              [
                'Add content paths to Tailwind config',
                'Configure purge settings for production',
                'Include all template paths in content array'
              ],
              { file: configPath }
            )
          )
        }

        // Check if PostCSS is configured
        if (!await this.fileExists(postcssConfigPath)) {
          issues.push(
            this.createIssue(
              'PostCSS Configuration Missing',
              'Tailwind CSS is configured but no PostCSS configuration found.',
              'medium',
              'css-config-check',
              [
                'Create postcss.config.js',
                'Add Tailwind CSS to PostCSS plugins',
                'Configure autoprefixer if needed'
              ]
            )
          )
        }
      }

      // Check for CSS imports in the app
      const appPath = path.join(projectRoot, 'app')
      const pagesPath = path.join(projectRoot, 'pages')

      let hasGlobalCSS = false

      // Check for global CSS imports
      if (await this.fileExists(appPath)) {
        const layoutPath = path.join(appPath, 'layout.tsx')
        if (await this.fileExists(layoutPath)) {
          const layoutContent = await this.readFile(layoutPath)
          if (layoutContent.includes('.css')) {
            hasGlobalCSS = true
          }
        }
      }

      if (await this.fileExists(pagesPath)) {
        const appJsPath = path.join(pagesPath, '_app.tsx')
        const appJsJsPath = path.join(pagesPath, '_app.js')

        if (await this.fileExists(appJsPath)) {
          const appContent = await this.readFile(appJsPath)
          if (appContent.includes('.css')) {
            hasGlobalCSS = true
          }
        } else if (await this.fileExists(appJsJsPath)) {
          const appContent = await this.readFile(appJsJsPath)
          if (appContent.includes('.css')) {
            hasGlobalCSS = true
          }
        }
      }

      // Check for CSS modules
      const result = await this.runCommand('find . -name "*.module.css" | head -5', projectRoot)
      if (result.stdout && result.stdout.trim()) {
        const cssModules = result.stdout.trim().split('\n')

        // Check if CSS modules are properly configured
        if (cssModules.length > 0 && !hasGlobalCSS) {
          issues.push(
            this.createIssue(
              'CSS Modules Found But No Global CSS',
              'CSS modules are being used but no global CSS imports found.',
              'low',
              'css-usage-check',
              [
                'Consider adding global CSS reset or normalize',
                'Import Tailwind CSS globals if using Tailwind',
                'Review CSS architecture'
              ],
              { cssModules: cssModules.length }
            )
          )
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check CSS configuration', error)
    }

    return issues
  }

  private async checkCommonBuildIssues(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check .next directory
      const nextDirPath = path.join(projectRoot, '.next')
      if (await this.fileExists(nextDirPath)) {
        // Check for build artifacts
        const buildIdPath = path.join(nextDirPath, 'BUILD_ID')

        if (!await this.fileExists(buildIdPath)) {
          issues.push(
            this.createIssue(
              'Incomplete Build Artifacts',
              '.next directory exists but BUILD_ID not found. Build may be incomplete.',
              'medium',
              'build-artifacts-check',
              [
                'Run a clean build: rm -rf .next && npm run build',
                'Check for build errors',
                'Verify build process completed successfully'
              ]
            )
          )
        }

        // Check for large build directory
        const result = await this.runCommand(`du -sh "${nextDirPath}"`, projectRoot)
        if (result.stdout) {
          const sizeMatch = result.stdout.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?)B?\s/)
          if (sizeMatch) {
            const size = parseFloat(sizeMatch[1])
            const unit = sizeMatch[2]

            let sizeInMB = size
            if (unit === 'G') sizeInMB = size * 1024
            else if (unit === 'K') sizeInMB = size / 1024

            if (sizeInMB > 500) { // Alert if .next is larger than 500MB
              issues.push(
                this.createIssue(
                  'Large Build Directory',
                  `Build directory (.next) is ${result.stdout.trim()}, which is unusually large.`,
                  'medium',
                  'build-size-check',
                  [
                    'Check for unnecessary files in build',
                    'Review bundle optimization',
                    'Consider cleaning build directory periodically',
                    'Check for large assets or dependencies'
                  ],
                  { buildSize: result.stdout.trim() }
                )
              )
            }
          }
        }
      }

      // Check for environment-specific issues
      if (process.env.NODE_ENV === 'production') {
        // Production-specific checks
        if (!process.env.NEXT_PUBLIC_APP_URL) {
          issues.push(
            this.createIssue(
              'Production App URL Not Set',
              'NEXT_PUBLIC_APP_URL is not set in production environment.',
              'medium',
              'env-production-check',
              [
                'Set NEXT_PUBLIC_APP_URL for production',
                'Configure environment variables for production',
                'Review production deployment configuration'
              ]
            )
          )
        }
      }

      // Check for potential circular dependencies
      const circularCheck = await this.runCommand('npx madge --circular .', projectRoot)
      if (circularCheck.stdout && circularCheck.stdout.includes('✖')) {
        issues.push(
          this.createIssue(
            'Circular Dependencies Detected',
            'Circular dependencies found which may cause build or runtime issues.',
            'medium',
            'circular-dependency-check',
            [
              'Refactor code to remove circular dependencies',
              'Use dependency injection patterns',
              'Create shared interfaces or types',
              'Review module structure'
            ]
          )
        )
      }

    } catch (error) {
      this.log('error', 'Failed to check common build issues', error)
    }

    return issues
  }

  protected startMonitoring(): void {
    super.startMonitoring()

    // Monitor build process if running
    if (this.config.monitorNextBuild) {
      this.monitoringInterval = setInterval(() => {
        if (this.isActive && !this.isBuilding) {
          this.checkBuildHealth()
        }
      }, 60000) // Check every minute
    }

    // Monitor for file changes that might affect build
    if (typeof process !== 'undefined') {
      process.on('exit', () => {
        this.stop()
      })
    }

    this.log('info', 'Build monitoring started')
  }

  private async checkBuildHealth(): Promise<void> {
    try {
      const projectRoot = process.cwd()

      // Quick health check
      const nextDirPath = path.join(projectRoot, '.next')
      if (await this.fileExists(nextDirPath)) {
        // Check if build is fresh
        const buildIdPath = path.join(nextDirPath, 'BUILD_ID')
        if (await this.fileExists(buildIdPath)) {
          const buildId = await this.readFile(buildIdPath)

          // Store build ID and check for changes
          if (buildId !== (this as any).lastBuildId) {
            (this as any).lastBuildId = buildId
            this.log('debug', 'Build artifacts updated')
          }
        }
      }

    } catch (error) {
      this.log('debug', 'Build health check error', error)
    }
  }
}