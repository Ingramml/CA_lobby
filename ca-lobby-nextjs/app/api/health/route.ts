import { NextRequest, NextResponse } from 'next/server'
import { checkBigQueryConnection } from '@/lib/bigquery-client'
import { checkKVConnection, getCacheInfo } from '@/lib/cache'
import { checkEdgeConfigConnection, getFeatureFlagCacheStats } from '@/lib/feature-flags'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get query parameters for detailed checks
    const url = new URL(request.url)
    const detailed = url.searchParams.get('detailed') === 'true'
    const includeMetrics = url.searchParams.get('metrics') === 'true'

    // Perform health checks in parallel for better performance
    const [
      bigQueryHealth,
      kvHealth,
      edgeConfigHealth,
      cacheInfo,
      featureFlagStats
    ] = await Promise.allSettled([
      checkBigQueryConnection(),
      checkKVConnection(),
      checkEdgeConfigConnection(),
      getCacheInfo(),
      getFeatureFlagCacheStats()
    ])

    // Extract results with fallbacks
    const bigQueryStatus = bigQueryHealth.status === 'fulfilled' ? bigQueryHealth.value : false
    const kvStatus = kvHealth.status === 'fulfilled' ? kvHealth.value : false
    const edgeConfigStatus = edgeConfigHealth.status === 'fulfilled' ? edgeConfigHealth.value : false
    const cacheMetrics = cacheInfo.status === 'fulfilled' ? cacheInfo.value : null
    const ffMetrics = featureFlagStats.status === 'fulfilled' ? featureFlagStats.value : null

    // Build comprehensive health status
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        api: {
          status: 'up',
          message: 'API is running',
          uptime: process.uptime(),
          pid: process.pid,
        },
        bigquery: {
          status: bigQueryStatus ? 'up' : 'down',
          message: bigQueryStatus ? 'BigQuery connection healthy' : 'BigQuery connection failed',
          lastChecked: new Date().toISOString(),
        },
        vercelKV: {
          status: kvStatus ? 'up' : 'down',
          message: kvStatus ? 'Vercel KV connection healthy' : 'Vercel KV connection failed',
          lastChecked: new Date().toISOString(),
        },
        edgeConfig: {
          status: edgeConfigStatus ? 'up' : 'down',
          message: edgeConfigStatus ? 'Edge Config connection healthy' : 'Edge Config connection failed',
          lastChecked: new Date().toISOString(),
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
        nextVersion: '14.2.3', // From package.json
        region: process.env.VERCEL_REGION || 'local',
        deployment: process.env.VERCEL_ENV || 'development',
      },
    }

    // Add detailed information if requested
    if (detailed) {
      healthStatus.details = {
        memory: {
          usage: process.memoryUsage(),
          heap: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
        },
        cache: cacheMetrics ? {
          kvAvailable: cacheMetrics.kvAvailable,
          fallbackCacheSize: cacheMetrics.fallbackCacheSize,
          stats: cacheMetrics.stats,
        } : null,
        featureFlags: ffMetrics ? {
          cacheSize: ffMetrics.size,
          cachedFlags: ffMetrics.keys,
        } : null,
        environment: {
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID ? '***configured***' : 'not configured',
          bigQueryDataset: process.env.BIGQUERY_DATASET || 'not configured',
          clerkConfigured: process.env.CLERK_SECRET_KEY ? true : false,
          vercelUrlConfigured: process.env.VERCEL_URL ? true : false,
        },
      }
    }

    // Add performance metrics if requested
    if (includeMetrics) {
      healthStatus.metrics = {
        requestHandlingTime: Date.now() - startTime,
        systemLoad: process.cpuUsage(),
        activeHandles: process._getActiveHandles?.()?.length || 0,
        activeRequests: process._getActiveRequests?.()?.length || 0,
        eventLoopDelay: await measureEventLoopDelay(),
      }
    }

    // Add error information for failed checks
    const failedChecks = []
    if (bigQueryHealth.status === 'rejected') {
      failedChecks.push({ service: 'bigquery', error: bigQueryHealth.reason?.message })
    }
    if (kvHealth.status === 'rejected') {
      failedChecks.push({ service: 'vercelKV', error: kvHealth.reason?.message })
    }
    if (edgeConfigHealth.status === 'rejected') {
      failedChecks.push({ service: 'edgeConfig', error: edgeConfigHealth.reason?.message })
    }

    if (failedChecks.length > 0) {
      healthStatus.errors = failedChecks
    }

    // Determine overall status
    const criticalServices = ['api', 'bigquery'] // KV and EdgeConfig are not critical
    const criticalServicesUp = criticalServices.every(
      service => healthStatus.services[service]?.status === 'up'
    )

    const allServicesUp = Object.values(healthStatus.services).every(
      service => service.status === 'up'
    )

    if (!criticalServicesUp) {
      healthStatus.status = 'unhealthy'
    } else if (!allServicesUp) {
      healthStatus.status = 'degraded'
    }

    // Set appropriate HTTP status
    let httpStatus = 200
    if (healthStatus.status === 'unhealthy') {
      httpStatus = 503
    } else if (healthStatus.status === 'degraded') {
      httpStatus = 200 // Still operational, just degraded
    }

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          api: {
            status: 'down',
            message: 'API error occurred during health check',
          },
          bigquery: {
            status: 'unknown',
            message: 'Unable to check BigQuery connection due to API error',
          },
          vercelKV: {
            status: 'unknown',
            message: 'Unable to check Vercel KV connection due to API error',
          },
          edgeConfig: {
            status: 'unknown',
            message: 'Unable to check Edge Config connection due to API error',
          },
        },
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      }
    )
  }
}

/**
 * Measure event loop delay
 */
async function measureEventLoopDelay(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint()
    setImmediate(() => {
      const delay = Number(process.hrtime.bigint() - start) / 1000000 // Convert to milliseconds
      resolve(delay)
    })
  })
}

// Handle HEAD requests for basic health checks
export async function HEAD() {
  const startTime = Date.now()

  try {
    // Quick health check for HEAD requests (no detailed info)
    const bigQueryHealth = await checkBigQueryConnection()

    const responseTime = Date.now() - startTime
    const isHealthy = bigQueryHealth

    return new NextResponse(null, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Status': isHealthy ? 'healthy' : 'unhealthy',
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('HEAD health check error:', error)

    return new NextResponse(null, {
      status: 500,
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'X-Health-Status': 'error',
      },
    })
  }
}