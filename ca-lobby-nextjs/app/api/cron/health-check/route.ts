import { NextRequest, NextResponse } from 'next/server';
import { checkBigQueryConnection } from '@/lib/bigquery-client';
import { checkKVConnection } from '@/lib/cache';
import { checkEdgeConfigConnection } from '@/lib/feature-flags';

/**
 * Health check cron job
 * Runs every 15 minutes to monitor system health
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
    checks: [],
    alerts: [],
    duration: 0,
    overallStatus: 'healthy',
  };

  try {
    console.log('🔍 Running scheduled health check...');

    // Check BigQuery connection
    try {
      const bigQueryHealthy = await checkBigQueryConnection();

      results.checks.push({
        service: 'bigquery',
        status: bigQueryHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      });

      if (!bigQueryHealthy) {
        results.alerts.push({
          severity: 'critical',
          service: 'bigquery',
          message: 'BigQuery connection failed',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.checks.push({
        service: 'bigquery',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      results.alerts.push({
        severity: 'critical',
        service: 'bigquery',
        message: 'BigQuery health check error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }

    // Check Vercel KV connection
    try {
      const kvHealthy = await checkKVConnection();

      results.checks.push({
        service: 'vercel_kv',
        status: kvHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      });

      if (!kvHealthy) {
        results.alerts.push({
          severity: 'warning',
          service: 'vercel_kv',
          message: 'Vercel KV connection failed - using fallback cache',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.checks.push({
        service: 'vercel_kv',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      results.alerts.push({
        severity: 'warning',
        service: 'vercel_kv',
        message: 'Vercel KV health check error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }

    // Check Edge Config connection
    try {
      const edgeConfigHealthy = await checkEdgeConfigConnection();

      results.checks.push({
        service: 'edge_config',
        status: edgeConfigHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      });

      if (!edgeConfigHealthy) {
        results.alerts.push({
          severity: 'warning',
          service: 'edge_config',
          message: 'Edge Config connection failed - using default feature flags',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.checks.push({
        service: 'edge_config',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      results.alerts.push({
        severity: 'warning',
        service: 'edge_config',
        message: 'Edge Config health check error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }

    // Check memory usage
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

      results.checks.push({
        service: 'memory',
        status: heapUsedMB < 512 ? 'healthy' : 'warning',
        heapUsedMB,
        heapTotalMB,
        timestamp: new Date().toISOString(),
      });

      if (heapUsedMB > 512) {
        results.alerts.push({
          severity: 'warning',
          service: 'memory',
          message: `High memory usage: ${heapUsedMB}MB`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      results.alerts.push({
        severity: 'info',
        service: 'memory',
        message: 'Could not check memory usage',
        timestamp: new Date().toISOString(),
      });
    }

    // Determine overall status
    const criticalAlerts = results.alerts.filter(alert => alert.severity === 'critical');
    const warningAlerts = results.alerts.filter(alert => alert.severity === 'warning');

    if (criticalAlerts.length > 0) {
      results.overallStatus = 'critical';
    } else if (warningAlerts.length > 0) {
      results.overallStatus = 'warning';
    } else {
      results.overallStatus = 'healthy';
    }

    results.duration = Date.now() - startTime;
    results.success = results.overallStatus !== 'critical';

    console.log(`✅ Health check completed in ${results.duration}ms`);
    console.log(`📊 Status: ${results.overallStatus}, Alerts: ${results.alerts.length}`);

    // Log alerts if any
    if (results.alerts.length > 0) {
      console.warn(`⚠️ Health check alerts:`, results.alerts);
    }

    // In production, you might want to send alerts to external monitoring systems
    if (process.env.NODE_ENV === 'production' && results.alerts.length > 0) {
      // Example: Send to Slack, Discord, email, or monitoring service
      // await sendHealthAlerts(results.alerts);
    }

    return NextResponse.json(results, {
      status: results.success ? 200 : 207,
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);

    results.success = false;
    results.overallStatus = 'critical';
    results.duration = Date.now() - startTime;
    results.alerts.push({
      severity: 'critical',
      service: 'health_check',
      message: 'Health check system failure',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(results, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Allow both GET and POST for cron jobs
}