import { NextRequest, NextResponse } from 'next/server';
import { getBigQueryClient, CALobbyQueries } from '@/lib/bigquery-client';
import { CALobbyCacheUtils } from '@/lib/cache';

/**
 * Daily data synchronization cron job
 * Runs at 2 AM UTC daily to refresh cached data
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
  };

  try {
    console.log('🔄 Starting daily data sync...');

    // Clear old cache data
    await CALobbyCacheUtils.invalidateLegislativeCache();
    await CALobbyCacheUtils.invalidateLobbySpendingCache();
    await CALobbyCacheUtils.invalidateDashboardCache();

    results.operations.push({
      operation: 'cache_invalidation',
      status: 'completed',
      timestamp: new Date().toISOString(),
    });

    // Refresh legislative activity data
    try {
      const legislativeData = await CALobbyQueries.getLegislativeActivity();
      await CALobbyCacheUtils.cacheLegislativeData('legislative_summary', legislativeData, {
        ttl: 86400, // 24 hours
      });

      results.operations.push({
        operation: 'legislative_data_sync',
        status: 'completed',
        recordCount: legislativeData.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'legislative_data_sync',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Refresh lobby spending data
    try {
      const spendingData = await CALobbyQueries.getLobbySpending();
      await CALobbyCacheUtils.cacheLobbySpendingData('spending_summary', spendingData, {
        ttl: 86400, // 24 hours
      });

      results.operations.push({
        operation: 'spending_data_sync',
        status: 'completed',
        recordCount: spendingData.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'spending_data_sync',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    // Pre-warm dashboard data for current year
    try {
      const currentYear = new Date().getFullYear();
      const yearlySpending = await CALobbyQueries.getLobbySpending(currentYear);
      await CALobbyCacheUtils.cacheDashboardData(`yearly_spending_${currentYear}`, yearlySpending, {
        ttl: 43200, // 12 hours
      });

      results.operations.push({
        operation: 'dashboard_prewarming',
        status: 'completed',
        year: currentYear,
        recordCount: yearlySpending.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({
        operation: 'dashboard_prewarming',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });
    }

    results.duration = Date.now() - startTime;
    results.success = results.errors.length === 0;

    console.log(`✅ Daily data sync completed in ${results.duration}ms`);
    console.log(`📊 Operations: ${results.operations.length}, Errors: ${results.errors.length}`);

    return NextResponse.json(results, {
      status: results.success ? 200 : 207, // 207 = Multi-Status (partial success)
    });

  } catch (error) {
    console.error('❌ Data sync failed:', error);

    results.success = false;
    results.duration = Date.now() - startTime;
    results.errors.push({
      operation: 'data_sync_general',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(results, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // Allow both GET and POST for cron jobs
}