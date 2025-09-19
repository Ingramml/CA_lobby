import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/bigquery-client'
import { requireBigQueryAccess } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Require authentication and BigQuery access
    await requireBigQueryAccess()

    const body = await request.json()
    const { query, parameters, maxResults, timeoutMs } = body

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Basic SQL injection protection - check for dangerous keywords
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'UPDATE', 'INSERT']
    const upperQuery = query.toUpperCase()

    for (const keyword of dangerousKeywords) {
      if (upperQuery.includes(keyword)) {
        return NextResponse.json(
          { error: `Query contains potentially dangerous keyword: ${keyword}` },
          { status: 400 }
        )
      }
    }

    // Execute the query
    const result = await executeQuery({
      query,
      parameters,
      maxResults: maxResults || 1000,
      timeoutMs: timeoutMs || 60000,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      rowCount: result.rowCount,
      executedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Query API error:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for predefined queries
export async function GET(request: NextRequest) {
  try {
    await requireBigQueryAccess()

    const { searchParams } = new URL(request.url)
    const queryType = searchParams.get('type')
    const limit = searchParams.get('limit') || '100'

    let query = ''

    switch (queryType) {
      case 'recent_activities':
        query = `
          SELECT *
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lobbying_activities\`
          ORDER BY created_date DESC
          LIMIT ${limit}
        `
        break

      case 'top_lobbyists':
        query = `
          SELECT
            lobbyist_name,
            COUNT(*) as activity_count,
            SUM(compensation_amount) as total_compensation
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lobbying_activities\`
          GROUP BY lobbyist_name
          ORDER BY total_compensation DESC
          LIMIT ${limit}
        `
        break

      case 'summary_stats':
        query = `
          SELECT
            COUNT(*) as total_activities,
            COUNT(DISTINCT lobbyist_name) as unique_lobbyists,
            COUNT(DISTINCT client_name) as unique_clients,
            SUM(compensation_amount) as total_compensation,
            AVG(compensation_amount) as avg_compensation
          FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.lobbying_activities\`
        `
        break

      default:
        return NextResponse.json(
          { error: 'Invalid query type. Available types: recent_activities, top_lobbyists, summary_stats' },
          { status: 400 }
        )
    }

    const result = await executeQuery({ query })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      queryType,
      data: result.data,
      rowCount: result.rowCount,
      executedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Predefined query API error:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}