/**
 * TypeScript Diagnostic Agent
 * Detects TypeScript compilation errors and type issues
 */

import { BaseDiagnosticAgent } from '../utils/base-agent'
import { DiagnosticIssue, TypeScriptDiagnosticConfig } from '../types'
import path from 'path'

export class TypeScriptDiagnosticAgent extends BaseDiagnosticAgent {
  private config: TypeScriptDiagnosticConfig = {
    strictMode: true,
    checkTypes: true,
    checkImports: true,
    checkExports: true,
    checkInterfaces: true,
    customTsConfig: undefined,
  }

  constructor() {
    super('TypeScript Diagnostic Agent', '1.0.0', 'typescript')
  }

  async scan(): Promise<DiagnosticIssue[]> {
    this.lastRun = new Date()
    this.log('info', 'Starting TypeScript diagnostic scan')

    const issues: DiagnosticIssue[] = []
    const projectRoot = process.cwd()

    try {
      // Check TypeScript configuration
      issues.push(...await this.checkTsConfig(projectRoot))

      // Run TypeScript compiler check
      issues.push(...await this.runTypeCheck(projectRoot))

      // Check for common TypeScript issues
      issues.push(...await this.checkCommonTypeIssues(projectRoot))

      // Check imports and exports
      if (this.config.checkImports) {
        issues.push(...await this.checkImportExportIssues(projectRoot))
      }

      // Check interface definitions
      if (this.config.checkInterfaces) {
        issues.push(...await this.checkInterfaceIssues(projectRoot))
      }

      this.log('info', `TypeScript diagnostic scan completed. Found ${issues.length} issues`)
      return issues

    } catch (error) {
      this.log('error', 'Error during TypeScript diagnostic scan', error)
      return [
        this.createIssue(
          'TypeScript Diagnostic Scan Failed',
          `Failed to complete TypeScript diagnostic scan: ${error}`,
          'high',
          'typescript-agent',
          ['Check agent configuration', 'Verify TypeScript installation']
        )
      ]
    }
  }

  private async checkTsConfig(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      const tsConfigPath = this.config.customTsConfig || path.join(projectRoot, 'tsconfig.json')

      if (!await this.fileExists(tsConfigPath)) {
        issues.push(
          this.createIssue(
            'No TypeScript Configuration Found',
            'tsconfig.json file not found. TypeScript compilation may not work correctly.',
            'high',
            'tsconfig-check',
            [
              'Create tsconfig.json file',
              'Configure TypeScript compiler options',
              'Use npx tsc --init to generate default config'
            ]
          )
        )
        return issues
      }

      const tsConfigContent = await this.readFile(tsConfigPath)
      let tsConfig: any

      try {
        // Remove comments and parse JSON
        const cleanContent = tsConfigContent.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
        tsConfig = JSON.parse(cleanContent)
      } catch (parseError) {
        issues.push(
          this.createIssue(
            'Invalid TypeScript Configuration',
            `tsconfig.json contains invalid JSON: ${parseError}`,
            'critical',
            'tsconfig-check',
            [
              'Fix JSON syntax in tsconfig.json',
              'Remove invalid comments or formatting',
              'Validate JSON structure'
            ],
            { file: tsConfigPath, parseError: parseError.message }
          )
        )
        return issues
      }

      // Check compiler options
      const compilerOptions = tsConfig.compilerOptions || {}

      // Check for strict mode
      if (this.config.strictMode && !compilerOptions.strict) {
        issues.push(
          this.createIssue(
            'TypeScript Strict Mode Disabled',
            'TypeScript strict mode is not enabled. This may allow type errors to go undetected.',
            'medium',
            'tsconfig-check',
            [
              'Enable "strict": true in compilerOptions',
              'Review and fix strict mode violations',
              'Consider enabling individual strict flags'
            ],
            { file: tsConfigPath, option: 'strict' }
          )
        )
      }

      // Check for noImplicitAny
      if (!compilerOptions.noImplicitAny && !compilerOptions.strict) {
        issues.push(
          this.createIssue(
            'Implicit Any Types Allowed',
            'noImplicitAny is not enabled. Variables without explicit types will default to any.',
            'low',
            'tsconfig-check',
            [
              'Enable "noImplicitAny": true',
              'Add explicit type annotations',
              'Use TypeScript strict mode'
            ],
            { file: tsConfigPath, option: 'noImplicitAny' }
          )
        )
      }

      // Check for noUnusedLocals
      if (!compilerOptions.noUnusedLocals) {
        issues.push(
          this.createIssue(
            'Unused Variables Not Detected',
            'noUnusedLocals is not enabled. Unused variables will not be flagged.',
            'low',
            'tsconfig-check',
            [
              'Enable "noUnusedLocals": true',
              'Remove unused variables',
              'Use ESLint rules for additional checks'
            ],
            { file: tsConfigPath, option: 'noUnusedLocals' }
          )
        )
      }

      // Check target version
      if (!compilerOptions.target || compilerOptions.target.toLowerCase() === 'es5') {
        issues.push(
          this.createIssue(
            'Outdated TypeScript Target',
            'TypeScript target is set to ES5 or not specified. Consider using a more modern target.',
            'low',
            'tsconfig-check',
            [
              'Set target to "ES2020" or higher',
              'Consider browser support requirements',
              'Update target for better performance'
            ],
            { file: tsConfigPath, currentTarget: compilerOptions.target }
          )
        )
      }

      // Check module resolution
      if (!compilerOptions.moduleResolution) {
        issues.push(
          this.createIssue(
            'Module Resolution Not Specified',
            'moduleResolution is not specified in TypeScript config.',
            'low',
            'tsconfig-check',
            [
              'Set "moduleResolution": "node"',
              'Configure for your project structure',
              'Consider bundler-specific settings'
            ],
            { file: tsConfigPath }
          )
        )
      }

      // Check for Next.js specific issues
      if (compilerOptions.jsx && compilerOptions.jsx !== 'preserve') {
        issues.push(
          this.createIssue(
            'Incorrect JSX Configuration for Next.js',
            'JSX should be set to "preserve" for Next.js projects.',
            'medium',
            'tsconfig-check',
            [
              'Set "jsx": "preserve" in compilerOptions',
              'Let Next.js handle JSX transformation',
              'Check Next.js TypeScript documentation'
            ],
            { file: tsConfigPath, currentJsx: compilerOptions.jsx }
          )
        )
      }

    } catch (error) {
      issues.push(
        this.createIssue(
          'Error Checking TypeScript Configuration',
          `Failed to check tsconfig.json: ${error}`,
          'medium',
          'tsconfig-check',
          ['Check file permissions', 'Verify file paths']
        )
      )
    }

    return issues
  }

  private async runTypeCheck(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      this.log('debug', 'Running TypeScript compiler check')

      // Run tsc --noEmit to check types without emitting files
      const result = await this.runCommand('npx tsc --noEmit --pretty false', projectRoot)

      if (result.exitCode !== 0 && result.stderr) {
        // Parse TypeScript compiler errors
        const errors = this.parseTypeScriptErrors(result.stderr)

        for (const error of errors) {
          issues.push(
            this.createIssue(
              `TypeScript Compilation Error`,
              error.message,
              this.getTypeScriptErrorSeverity(error.code),
              'typescript-compiler',
              this.getTypeScriptErrorSuggestions(error.code, error.message),
              {
                errorCode: error.code,
                file: error.file,
                line: error.line,
                column: error.column
              },
              error.file,
              error.line,
              error.column
            )
          )
        }
      }

      // Also check for successful compilation with warnings
      if (result.exitCode === 0 && result.stdout) {
        const warnings = this.parseTypeScriptWarnings(result.stdout)
        for (const warning of warnings) {
          issues.push(
            this.createIssue(
              `TypeScript Warning`,
              warning.message,
              'low',
              'typescript-compiler',
              ['Review warning and consider fixing', 'Check TypeScript documentation'],
              {
                file: warning.file,
                line: warning.line,
                column: warning.column
              },
              warning.file,
              warning.line,
              warning.column
            )
          )
        }
      }

    } catch (error) {
      this.log('error', 'Failed to run TypeScript check', error)
      issues.push(
        this.createIssue(
          'TypeScript Check Failed',
          `Failed to run TypeScript compiler: ${error}`,
          'medium',
          'typescript-compiler',
          [
            'Ensure TypeScript is installed',
            'Check npm/yarn configuration',
            'Verify tsconfig.json is valid'
          ]
        )
      )
    }

    return issues
  }

  private parseTypeScriptErrors(stderr: string): Array<{
    file: string
    line: number
    column: number
    code: string
    message: string
  }> {
    const errors: Array<{
      file: string
      line: number
      column: number
      code: string
      message: string
    }> = []

    // Parse TypeScript error format: file.ts(line,column): error TS####: message
    const errorPattern = /(.+?)\((\d+),(\d+)\):\s*(error|warning)\s+TS(\d+):\s*(.+)/g
    let match

    while ((match = errorPattern.exec(stderr)) !== null) {
      errors.push({
        file: match[1].trim(),
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: `TS${match[5]}`,
        message: match[6].trim()
      })
    }

    return errors
  }

  private parseTypeScriptWarnings(stdout: string): Array<{
    file: string
    line: number
    column: number
    message: string
  }> {
    // Similar to errors but for warnings
    const warnings: Array<{
      file: string
      line: number
      column: number
      message: string
    }> = []

    const warningPattern = /(.+?)\((\d+),(\d+)\):\s*warning\s*:\s*(.+)/g
    let match

    while ((match = warningPattern.exec(stdout)) !== null) {
      warnings.push({
        file: match[1].trim(),
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        message: match[4].trim()
      })
    }

    return warnings
  }

  private getTypeScriptErrorSeverity(code: string): 'critical' | 'high' | 'medium' | 'low' {
    // Map TypeScript error codes to severity levels
    const criticalCodes = ['TS2322', 'TS2339', 'TS2345', 'TS2304'] // Type assignment, property access, argument errors
    const highCodes = ['TS2551', 'TS2552', 'TS2556', 'TS2558'] // Property access and method call errors
    const mediumCodes = ['TS2794', 'TS2795', 'TS2796'] // Import/export issues

    if (criticalCodes.includes(code)) return 'critical'
    if (highCodes.includes(code)) return 'high'
    if (mediumCodes.includes(code)) return 'medium'

    return 'medium' // Default to medium for unknown codes
  }

  private getTypeScriptErrorSuggestions(code: string, message: string): string[] {
    const suggestions: string[] = []

    switch (code) {
      case 'TS2322':
        suggestions.push(
          'Check type compatibility',
          'Add type assertion if needed',
          'Review variable assignment'
        )
        break
      case 'TS2339':
        suggestions.push(
          'Check property name spelling',
          'Verify object type definition',
          'Add property to interface if needed'
        )
        break
      case 'TS2304':
        suggestions.push(
          'Check import statements',
          'Verify module is installed',
          'Add type declarations if needed'
        )
        break
      case 'TS2345':
        suggestions.push(
          'Check function parameter types',
          'Verify argument count and types',
          'Review function signature'
        )
        break
      default:
        suggestions.push(
          'Review TypeScript documentation',
          'Check type definitions',
          'Consider type assertion if appropriate'
        )
    }

    return suggestions
  }

  private async checkCommonTypeIssues(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Find all TypeScript files
      const result = await this.runCommand(
        'find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | head -50',
        projectRoot
      )

      if (result.exitCode === 0 && result.stdout) {
        const files = result.stdout.split('\n').filter(f => f.trim())

        for (const file of files) {
          const filePath = path.join(projectRoot, file.replace('./', ''))

          if (await this.fileExists(filePath)) {
            const content = await this.readFile(filePath)
            issues.push(...this.checkFileForCommonIssues(content, filePath))
          }
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check common type issues', error)
    }

    return issues
  }

  private checkFileForCommonIssues(content: string, filePath: string): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Check for any type usage
      if (line.includes(': any') && !line.includes('// eslint-disable')) {
        issues.push(
          this.createIssue(
            'Explicit Any Type Usage',
            'Using explicit "any" type reduces type safety.',
            'low',
            'type-check',
            [
              'Replace any with specific type',
              'Use unknown if type is truly unknown',
              'Add proper type definitions'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }

      // Check for @ts-ignore usage
      if (line.includes('@ts-ignore')) {
        issues.push(
          this.createIssue(
            'TypeScript Error Suppression',
            'Using @ts-ignore suppresses TypeScript errors without fixing them.',
            'medium',
            'type-check',
            [
              'Fix the underlying TypeScript error',
              'Use @ts-expect-error with explanation',
              'Add proper type definitions'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }

      // Check for non-null assertion operator
      if (line.includes('!') && line.match(/\w+!/)) {
        issues.push(
          this.createIssue(
            'Non-null Assertion Usage',
            'Using non-null assertion operator (!) can lead to runtime errors.',
            'medium',
            'type-check',
            [
              'Add proper null checks',
              'Use optional chaining (?.) instead',
              'Ensure value is never null/undefined'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }

      // Check for function without return type
      if (line.includes('function ') && !line.includes(': ') && line.includes('{')) {
        issues.push(
          this.createIssue(
            'Function Missing Return Type',
            'Function declaration without explicit return type.',
            'low',
            'type-check',
            [
              'Add explicit return type annotation',
              'Use void for functions that don\'t return',
              'Enable noImplicitReturns in tsconfig'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }
    }

    return issues
  }

  private async checkImportExportIssues(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Check for circular dependencies
      const result = await this.runCommand(
        'npx madge --circular --extensions ts,tsx .',
        projectRoot
      )

      if (result.stdout && result.stdout.includes('✖')) {
        issues.push(
          this.createIssue(
            'Circular Dependencies Detected',
            'Circular dependencies can cause runtime issues and make code harder to maintain.',
            'high',
            'import-export-check',
            [
              'Refactor to remove circular dependencies',
              'Use dependency injection',
              'Create shared interfaces/types'
            ],
            { details: result.stdout }
          )
        )
      }

    } catch (error) {
      // Madge might not be installed, that's okay
      this.log('debug', 'Could not check circular dependencies (madge not available)')
    }

    return issues
  }

  private async checkInterfaceIssues(projectRoot: string): Promise<DiagnosticIssue[]> {
    const issues: DiagnosticIssue[] = []

    try {
      // Look for common interface issues in type files
      const typeFiles = await this.runCommand(
        'find . -name "*.d.ts" -o -name "*types*.ts" | grep -v node_modules',
        projectRoot
      )

      if (typeFiles.stdout) {
        const files = typeFiles.stdout.split('\n').filter(f => f.trim())

        for (const file of files) {
          const filePath = path.join(projectRoot, file.replace('./', ''))

          if (await this.fileExists(filePath)) {
            const content = await this.readFile(filePath)
            issues.push(...this.checkInterfaceDefinitions(content, filePath))
          }
        }
      }

    } catch (error) {
      this.log('error', 'Failed to check interface issues', error)
    }

    return issues
  }

  private checkInterfaceDefinitions(content: string, filePath: string): DiagnosticIssue[] {
    const issues: DiagnosticIssue[] = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNumber = i + 1

      // Check for empty interfaces
      if (line.includes('interface ') && lines[i + 1]?.trim() === '}') {
        issues.push(
          this.createIssue(
            'Empty Interface Definition',
            'Empty interface provides no type safety benefits.',
            'low',
            'interface-check',
            [
              'Add properties to interface',
              'Remove if not needed',
              'Consider using type alias instead'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }

      // Check for interface naming conventions
      if (line.includes('interface ') && !line.match(/interface [A-Z]/)) {
        issues.push(
          this.createIssue(
            'Interface Naming Convention',
            'Interfaces should start with a capital letter.',
            'low',
            'interface-check',
            [
              'Rename interface to start with capital letter',
              'Follow TypeScript naming conventions',
              'Consider using PascalCase'
            ],
            { file: filePath, line: lineNumber },
            filePath,
            lineNumber
          )
        )
      }
    }

    return issues
  }

  protected startMonitoring(): void {
    super.startMonitoring()

    // Set up file watching for TypeScript files
    this.monitoringInterval = setInterval(async () => {
      if (this.isActive) {
        try {
          const quickScan = await this.runCommand('npx tsc --noEmit --listFiles | wc -l')
          // If the count of files changes significantly, trigger a scan
          this.log('debug', 'TypeScript monitoring check completed')
        } catch (error) {
          this.log('error', 'TypeScript monitoring error', error)
        }
      }
    }, 30000) // Check every 30 seconds

    this.log('info', 'TypeScript monitoring started')
  }
}