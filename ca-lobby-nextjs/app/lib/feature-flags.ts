/**
 * Edge Config Feature Flags for CA Lobby Next.js Application
 *
 * This module provides a comprehensive feature flag system using Vercel Edge Config,
 * with fallback mechanisms, type safety, and performance optimization.
 */

import { get } from '@vercel/edge-config';

// Feature flag types and interfaces
export interface FeatureFlag {
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  userSegments?: string[];
  startDate?: string;
  endDate?: string;
  metadata?: Record<string, any>;
}

export interface FeatureFlagContext {
  userId?: string;
  userRole?: string;
  environment?: string;
  region?: string;
  version?: string;
}

// Default feature flags (fallback configuration)
const DEFAULT_FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Analytics and Monitoring
  enableAnalytics: {
    enabled: true,
    description: 'Enable Vercel Analytics tracking',
    rolloutPercentage: 100,
  },
  enableSpeedInsights: {
    enabled: true,
    description: 'Enable Vercel Speed Insights',
    rolloutPercentage: 100,
  },
  enablePerformanceMonitoring: {
    enabled: true,
    description: 'Enable comprehensive performance monitoring',
    rolloutPercentage: 100,
  },

  // BigQuery and Data Features
  enableBigQueryCaching: {
    enabled: true,
    description: 'Enable BigQuery result caching',
    rolloutPercentage: 100,
  },
  enableParallelQueries: {
    enabled: true,
    description: 'Enable parallel BigQuery execution',
    rolloutPercentage: 100,
  },
  enableQueryOptimization: {
    enabled: true,
    description: 'Enable query optimization features',
    rolloutPercentage: 100,
  },

  // Dashboard Features
  enableAdvancedFilters: {
    enabled: false,
    description: 'Enable advanced filtering options',
    rolloutPercentage: 25,
    userSegments: ['admin', 'premium'],
  },
  enableRealTimeUpdates: {
    enabled: false,
    description: 'Enable real-time data updates',
    rolloutPercentage: 10,
    userSegments: ['admin'],
  },
  enableDataExport: {
    enabled: true,
    description: 'Enable data export functionality',
    rolloutPercentage: 100,
  },

  // UI/UX Features
  enableDarkMode: {
    enabled: true,
    description: 'Enable dark mode toggle',
    rolloutPercentage: 100,
  },
  enableNewDashboardLayout: {
    enabled: false,
    description: 'Enable new dashboard layout',
    rolloutPercentage: 50,
  },
  enableMobileOptimizations: {
    enabled: true,
    description: 'Enable mobile-specific optimizations',
    rolloutPercentage: 100,
  },

  // Security Features
  enableAdvancedAuth: {
    enabled: true,
    description: 'Enable advanced authentication features',
    rolloutPercentage: 100,
  },
  enableSecurityHeaders: {
    enabled: true,
    description: 'Enable comprehensive security headers',
    rolloutPercentage: 100,
  },
  enableRateLimiting: {
    enabled: true,
    description: 'Enable API rate limiting',
    rolloutPercentage: 100,
  },

  // Performance Features
  enableEdgeSSR: {
    enabled: false,
    description: 'Enable Edge Runtime for SSR',
    rolloutPercentage: 0,
  },
  enableImageOptimization: {
    enabled: true,
    description: 'Enable advanced image optimization',
    rolloutPercentage: 100,
  },
  enableServiceWorker: {
    enabled: false,
    description: 'Enable service worker for offline support',
    rolloutPercentage: 0,
  },

  // Experimental Features
  enableAIInsights: {
    enabled: false,
    description: 'Enable AI-powered insights (experimental)',
    rolloutPercentage: 5,
    userSegments: ['admin', 'beta'],
  },
  enableVoiceCommands: {
    enabled: false,
    description: 'Enable voice command interface (experimental)',
    rolloutPercentage: 0,
    userSegments: ['beta'],
  },
  enablePredictiveAnalytics: {
    enabled: false,
    description: 'Enable predictive analytics features (experimental)',
    rolloutPercentage: 0,
    userSegments: ['admin'],
  },
};

// Cache for feature flags to avoid repeated Edge Config calls
const featureFlagCache = new Map<string, { flag: FeatureFlag; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if Edge Config is available
 */
async function isEdgeConfigAvailable(): Promise<boolean> {
  try {
    // Test if we can access Edge Config
    await get('_health_check');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a feature flag value with context-aware evaluation
 * @param flagName Name of the feature flag
 * @param context Optional context for evaluation (user, environment, etc.)
 * @param defaultValue Default value if flag is not found
 */
export async function getFeatureFlag(
  flagName: string,
  context?: FeatureFlagContext,
  defaultValue: boolean = false
): Promise<boolean> {
  try {
    // Check cache first
    const cached = featureFlagCache.get(flagName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return evaluateFeatureFlag(cached.flag, context);
    }

    let flag: FeatureFlag | null = null;

    // Try to get from Edge Config
    if (await isEdgeConfigAvailable()) {
      flag = await get(flagName);
    }

    // Fallback to default configuration
    if (!flag) {
      flag = DEFAULT_FEATURE_FLAGS[flagName];
    }

    // If still no flag found, return default value
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found, using default: ${defaultValue}`);
      return defaultValue;
    }

    // Cache the flag
    featureFlagCache.set(flagName, {
      flag,
      timestamp: Date.now(),
    });

    return evaluateFeatureFlag(flag, context);
  } catch (error) {
    console.error(`Error getting feature flag '${flagName}':`, error);
    return defaultValue;
  }
}

/**
 * Get multiple feature flags at once
 * @param flagNames Array of feature flag names
 * @param context Optional context for evaluation
 */
export async function getFeatureFlags(
  flagNames: string[],
  context?: FeatureFlagContext
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  // Process flags in parallel
  const promises = flagNames.map(async (flagName) => {
    const value = await getFeatureFlag(flagName, context);
    return { flagName, value };
  });

  const flagResults = await Promise.all(promises);

  // Build results object
  for (const { flagName, value } of flagResults) {
    results[flagName] = value;
  }

  return results;
}

/**
 * Get a feature flag configuration (not just boolean value)
 * @param flagName Name of the feature flag
 */
export async function getFeatureFlagConfig(flagName: string): Promise<FeatureFlag | null> {
  try {
    // Check cache first
    const cached = featureFlagCache.get(flagName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.flag;
    }

    let flag: FeatureFlag | null = null;

    // Try to get from Edge Config
    if (await isEdgeConfigAvailable()) {
      flag = await get(flagName);
    }

    // Fallback to default configuration
    if (!flag) {
      flag = DEFAULT_FEATURE_FLAGS[flagName] || null;
    }

    if (flag) {
      // Cache the flag
      featureFlagCache.set(flagName, {
        flag,
        timestamp: Date.now(),
      });
    }

    return flag;
  } catch (error) {
    console.error(`Error getting feature flag config '${flagName}':`, error);
    return null;
  }
}

/**
 * Evaluate a feature flag based on context and configuration
 * @param flag Feature flag configuration
 * @param context Optional context for evaluation
 */
function evaluateFeatureFlag(flag: FeatureFlag, context?: FeatureFlagContext): boolean {
  // If flag is disabled, return false immediately
  if (!flag.enabled) {
    return false;
  }

  // Check date constraints
  if (flag.startDate && new Date() < new Date(flag.startDate)) {
    return false;
  }

  if (flag.endDate && new Date() > new Date(flag.endDate)) {
    return false;
  }

  // Check user segment constraints
  if (flag.userSegments && flag.userSegments.length > 0 && context?.userRole) {
    if (!flag.userSegments.includes(context.userRole)) {
      return false;
    }
  }

  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    // Use userId or fallback to random for consistent rollout
    const identifier = context?.userId || Math.random().toString();
    const hash = simpleHash(identifier);
    const percentage = hash % 100;

    if (percentage >= flag.rolloutPercentage) {
      return false;
    }
  }

  return true;
}

/**
 * Simple hash function for consistent percentage rollouts
 * @param str String to hash
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Clear feature flag cache
 */
export function clearFeatureFlagCache(): void {
  featureFlagCache.clear();
  console.log('🗑️ Feature flag cache cleared');
}

/**
 * Get feature flag cache statistics
 */
export function getFeatureFlagCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: featureFlagCache.size,
    keys: Array.from(featureFlagCache.keys()),
  };
}

/**
 * Check Edge Config connection health
 */
export async function checkEdgeConfigConnection(): Promise<boolean> {
  try {
    await get('_health_check');
    console.log('✅ Edge Config connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Edge Config connection failed:', error);
    return false;
  }
}

/**
 * Preload critical feature flags for better performance
 * @param flagNames Array of critical feature flag names
 * @param context Optional context for evaluation
 */
export async function preloadFeatureFlags(
  flagNames: string[],
  context?: FeatureFlagContext
): Promise<void> {
  console.log(`🚀 Preloading ${flagNames.length} critical feature flags`);

  // Load flags in parallel
  const promises = flagNames.map(flagName => getFeatureFlag(flagName, context));

  try {
    await Promise.all(promises);
    console.log('✅ Critical feature flags preloaded successfully');
  } catch (error) {
    console.error('❌ Error preloading feature flags:', error);
  }
}

// Feature flag utilities for specific CA Lobby features
export const CALobbyFeatureFlags = {
  /**
   * Check if advanced analytics are enabled
   */
  async isAdvancedAnalyticsEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return await getFeatureFlag('enableAnalytics', context) &&
           await getFeatureFlag('enableSpeedInsights', context) &&
           await getFeatureFlag('enablePerformanceMonitoring', context);
  },

  /**
   * Check if BigQuery optimizations are enabled
   */
  async isBigQueryOptimizationEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return await getFeatureFlag('enableBigQueryCaching', context) &&
           await getFeatureFlag('enableParallelQueries', context) &&
           await getFeatureFlag('enableQueryOptimization', context);
  },

  /**
   * Check if premium features are enabled for user
   */
  async isPremiumFeaturesEnabled(context?: FeatureFlagContext): Promise<boolean> {
    const premiumFlags = [
      'enableAdvancedFilters',
      'enableRealTimeUpdates',
      'enableAIInsights',
    ];

    const flags = await getFeatureFlags(premiumFlags, context);
    return Object.values(flags).some(enabled => enabled);
  },

  /**
   * Check if experimental features are enabled
   */
  async isExperimentalFeaturesEnabled(context?: FeatureFlagContext): Promise<boolean> {
    const experimentalFlags = [
      'enableAIInsights',
      'enableVoiceCommands',
      'enablePredictiveAnalytics',
    ];

    const flags = await getFeatureFlags(experimentalFlags, context);
    return Object.values(flags).some(enabled => enabled);
  },

  /**
   * Get all dashboard-related feature flags
   */
  async getDashboardFeatureFlags(context?: FeatureFlagContext): Promise<Record<string, boolean>> {
    const dashboardFlags = [
      'enableAdvancedFilters',
      'enableRealTimeUpdates',
      'enableDataExport',
      'enableDarkMode',
      'enableNewDashboardLayout',
      'enableMobileOptimizations',
    ];

    return await getFeatureFlags(dashboardFlags, context);
  },
};

// Critical feature flags to preload on application start
export const CRITICAL_FEATURE_FLAGS = [
  'enableAnalytics',
  'enableSpeedInsights',
  'enableBigQueryCaching',
  'enableSecurityHeaders',
  'enableRateLimiting',
];

// Export types for external use
export type { FeatureFlagContext };