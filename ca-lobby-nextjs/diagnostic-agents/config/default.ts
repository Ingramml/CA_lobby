/**
 * Default Configuration for Diagnostic Agents
 * Provides sensible defaults for all diagnostic settings
 */

import { DiagnosticConfig } from '../types'

export const defaultConfig: DiagnosticConfig = {
  enabled: true,
  logLevel: 'info',
  outputDir: './diagnostic-reports',
  autoFix: false,
  realTimeMonitoring: true,

  agents: {
    auth: {
      checkClerkProvider: true,
      checkUserContext: true,
      checkMiddleware: true,
      checkEnvironmentVars: true,
      checkAuthFlows: true,
      devModeBypass: true,
    },

    typescript: {
      strictMode: true,
      checkTypes: true,
      checkImports: true,
      checkExports: true,
      checkInterfaces: true,
      customTsConfig: undefined,
    },

    runtime: {
      monitorConsole: true,
      checkUndefinedVars: true,
      checkAsyncErrors: true,
      checkDOMErrors: true,
      checkModuleErrors: true,
      captureUnhandledRejections: true,
    },

    build: {
      monitorNextBuild: true,
      checkWebpack: true,
      checkDependencies: true,
      checkCSS: true,
      checkHotReload: true,
      buildCommand: 'npm run build',
    },

    network: {
      monitorAPIcalls: true,
      checkCORS: true,
      checkTimeouts: true,
      checkConnectivity: true,
      checkGraphQL: true,
      maxRetries: 3,
      timeoutThreshold: 5000,
    }
  }
}

/**
 * Development environment configuration
 * Optimized for development workflow
 */
export const developmentConfig: Partial<DiagnosticConfig> = {
  logLevel: 'debug',
  autoFix: false,
  realTimeMonitoring: true,

  agents: {
    auth: {
      devModeBypass: true,
    },

    typescript: {
      strictMode: false, // Less strict in development
    },

    runtime: {
      monitorConsole: true,
      captureUnhandledRejections: true,
    },

    build: {
      monitorNextBuild: false, // Don't monitor builds in dev
      checkHotReload: true,
    },

    network: {
      monitorAPIcalls: true,
      checkConnectivity: false, // Don't check external connectivity in dev
      timeoutThreshold: 10000, // Longer timeout for dev
    }
  }
}

/**
 * Production environment configuration
 * Optimized for production monitoring
 */
export const productionConfig: Partial<DiagnosticConfig> = {
  logLevel: 'warn',
  autoFix: false, // Never auto-fix in production
  realTimeMonitoring: true,

  agents: {
    auth: {
      devModeBypass: false,
      checkEnvironmentVars: true,
    },

    typescript: {
      strictMode: true,
    },

    runtime: {
      monitorConsole: false, // Don't monitor console in production
      captureUnhandledRejections: true,
    },

    build: {
      monitorNextBuild: false,
      checkDependencies: true,
    },

    network: {
      monitorAPIcalls: true,
      checkConnectivity: true,
      timeoutThreshold: 5000,
    }
  }
}

/**
 * Testing environment configuration
 * Optimized for automated testing
 */
export const testingConfig: Partial<DiagnosticConfig> = {
  logLevel: 'error',
  autoFix: false,
  realTimeMonitoring: false,
  outputDir: './test-diagnostic-reports',

  agents: {
    auth: {
      devModeBypass: true,
    },

    typescript: {
      strictMode: true,
      checkTypes: true,
    },

    runtime: {
      monitorConsole: false,
      checkDOMErrors: false, // Tests might not run in browser
    },

    build: {
      monitorNextBuild: false,
      checkHotReload: false,
    },

    network: {
      monitorAPIcalls: false,
      checkConnectivity: false,
    }
  }
}

/**
 * CI/CD environment configuration
 * Optimized for continuous integration
 */
export const ciConfig: Partial<DiagnosticConfig> = {
  logLevel: 'info',
  autoFix: false,
  realTimeMonitoring: false,
  outputDir: './ci-diagnostic-reports',

  agents: {
    auth: {
      checkEnvironmentVars: true,
      devModeBypass: false,
    },

    typescript: {
      strictMode: true,
      checkTypes: true,
      checkImports: true,
      checkExports: true,
      checkInterfaces: true,
    },

    runtime: {
      monitorConsole: false,
      checkUndefinedVars: true,
      checkAsyncErrors: true,
      checkDOMErrors: false,
      checkModuleErrors: true,
      captureUnhandledRejections: false,
    },

    build: {
      monitorNextBuild: true,
      checkWebpack: true,
      checkDependencies: true,
      checkCSS: true,
      checkHotReload: false,
      buildCommand: 'npm run build',
    },

    network: {
      monitorAPIcalls: false,
      checkCORS: false,
      checkTimeouts: false,
      checkConnectivity: false,
      checkGraphQL: false,
      maxRetries: 1,
      timeoutThreshold: 30000,
    }
  }
}

/**
 * Get configuration based on environment
 */
export function getEnvironmentConfig(): Partial<DiagnosticConfig> {
  const env = process.env.NODE_ENV || 'development'

  switch (env) {
    case 'production':
      return productionConfig
    case 'test':
      return testingConfig
    case 'development':
    default:
      return developmentConfig
  }
}

/**
 * Merge configurations with proper deep merging
 */
export function mergeConfigs(
  base: DiagnosticConfig,
  override: Partial<DiagnosticConfig>
): DiagnosticConfig {
  const merged = { ...base }

  if (override.enabled !== undefined) merged.enabled = override.enabled
  if (override.logLevel !== undefined) merged.logLevel = override.logLevel
  if (override.outputDir !== undefined) merged.outputDir = override.outputDir
  if (override.autoFix !== undefined) merged.autoFix = override.autoFix
  if (override.realTimeMonitoring !== undefined) merged.realTimeMonitoring = override.realTimeMonitoring

  if (override.agents) {
    merged.agents = {
      auth: { ...merged.agents.auth, ...override.agents.auth },
      typescript: { ...merged.agents.typescript, ...override.agents.typescript },
      runtime: { ...merged.agents.runtime, ...override.agents.runtime },
      build: { ...merged.agents.build, ...override.agents.build },
      network: { ...merged.agents.network, ...override.agents.network },
    }
  }

  return merged
}

/**
 * Load configuration from file if it exists
 */
export async function loadConfigFromFile(configPath?: string): Promise<Partial<DiagnosticConfig> | null> {
  try {
    const fs = require('fs').promises
    const path = require('path')

    const possiblePaths = [
      configPath,
      './diagnostic.config.js',
      './diagnostic.config.json',
      './.diagnosticrc',
      './.diagnosticrc.json'
    ].filter(Boolean)

    for (const filePath of possiblePaths) {
      try {
        const fullPath = path.resolve(filePath)
        const content = await fs.readFile(fullPath, 'utf-8')

        if (filePath.endsWith('.json') || filePath.endsWith('.diagnosticrc')) {
          return JSON.parse(content)
        } else if (filePath.endsWith('.js')) {
          // Simple require for JS files
          delete require.cache[require.resolve(fullPath)]
          const config = require(fullPath)
          return config.default || config
        }
      } catch {
        // Continue to next path
        continue
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Create a configuration with all options
 */
export function createConfig(options?: {
  environment?: 'development' | 'production' | 'test' | 'ci'
  override?: Partial<DiagnosticConfig>
  configFile?: string
}): Promise<DiagnosticConfig> {
  return new Promise(async (resolve) => {
    let config = defaultConfig

    // Apply environment-specific configuration
    if (options?.environment) {
      const envConfig = options.environment === 'development' ? developmentConfig :
                       options.environment === 'production' ? productionConfig :
                       options.environment === 'test' ? testingConfig :
                       options.environment === 'ci' ? ciConfig :
                       developmentConfig

      config = mergeConfigs(config, envConfig)
    } else {
      // Auto-detect environment
      const envConfig = getEnvironmentConfig()
      config = mergeConfigs(config, envConfig)
    }

    // Load from config file
    const fileConfig = await loadConfigFromFile(options?.configFile)
    if (fileConfig) {
      config = mergeConfigs(config, fileConfig)
    }

    // Apply override options
    if (options?.override) {
      config = mergeConfigs(config, options.override)
    }

    resolve(config)
  })
}