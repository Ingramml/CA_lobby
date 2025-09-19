import { NextRequest, NextResponse } from 'next/server';
import { clearCache, getCacheStats, cleanupFallbackCache } from '@/lib/cache';
import { clearFeatureFlagCache, getFeatureFlagCacheStats } from '@/lib/feature-flags';

/**
 * Cache cleanup cron job
 * Runs at 4 AM UTC daily to clean up expired cache entries
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request from Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    operations: [],
    errors: [],
    duration: 0,
    metrics: {
      before: {},
      after: {},
    },
  };

  try {
    console.log('🧹 Starting cache cleanup...');

    // Get cache stats before cleanup
    try {
      const cacheStatsBefore = getCacheStats();
      const ffStatsBefore = getFeatureFlagCacheStats();

      results.metrics.before = {
        cache: cacheStatsBefore,
        featureFlags: ffStatsBefore,
      };
    } catch (error) {
      console.warn('⚠️ Could not get cache stats before cleanup:', error);
    }

    // Clean up fallback cache (expired entries)
    try {
      cleanupFallbackCache();

      results.operations.push({
        operation: 'fallback_cache_cleanup',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'fallback_cache_cleanup',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Clear feature flag cache (force refresh)
    try {
      clearFeatureFlagCache();

      results.operations.push({
        operation: 'feature_flag_cache_clear',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'feature_flag_cache_clear',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Clean up old BigQuery cache entries (older than 24 hours)
    try {
      // This would typically involve checking timestamps and clearing old entries
      // For now, we'll clear all cache to ensure fresh data
      await clearCache('ca-lobby');

      results.operations.push({
        operation: 'bigquery_cache_cleanup',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'bigquery_cache_cleanup',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Get cache stats after cleanup
    try {
      const cacheStatsAfter = getCacheStats();
      const ffStatsAfter = getFeatureFlagCacheStats();

      results.metrics.after = {
        cache: cacheStatsAfter,
        featureFlags: ffStatsAfter,
      };
    } catch (error) {
      console.warn('⚠️ Could not get cache stats after cleanup:', error);
    }

    results.duration = Date.now() - startTime;
    results.success = results.errors.length === 0;

    console.log(`✅ Cache cleanup completed in ${results.duration}ms`);
    console.log(`🧹 Operations: ${results.operations.length}, Errors: ${results.errors.length}`);

    // Log cache size reduction
    if (results.metrics.before.cache && results.metrics.after.cache) {
      const sizeBefore = results.metrics.before.cache.fallbackCacheSize || 0;
      const sizeAfter = results.metrics.after.cache.fallbackCacheSize || 0;
      const reduction = sizeBefore - sizeAfter;

      if (reduction > 0) {
        console.log(`📉 Fallback cache size reduced by ${reduction} entries`);
      }
    }

    return NextResponse.json(results, {
      status: results.success ? 200 : 207, // 207 = Multi-Status (partial success)
    });

  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);

    results.success = false;
    results.duration = Date.now() - startTime;
    results.errors.push({
      operation: 'cache_cleanup_general',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(results, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Allow both GET and POST for cron jobs
}