import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Query registry - mirrors the predefined queries from [slug]/route.ts
const AVAILABLE_QUERIES = {
  'payment-to-lobbyist': {
    name: 'Payment to Lobbyist',
    description: 'Payment information to lobbyists with latest amendment filtering',
    endpoint: '/api/queries/payment-to-lobbyist',
    parameters: ['project_id', 'dataset_id'],
    tags: ['payments', 'lobbyist', 'disclosure'],
    sampleUsage: {
      GET: '/api/queries/payment-to-lobbyist?format=csv&limit=1000',
      POST: {
        parameters: { custom_filter: 'value' },
        format: 'json'
      }
    }
  },

  'payment-to-lobby-associations': {
    name: 'Payment to Lobby Associations',
    description: 'Payment information to lobby associations',
    endpoint: '/api/queries/payment-to-lobby-associations',
    parameters: ['project_id', 'dataset_id'],
    tags: ['payments', 'associations', 'lobby'],
    sampleUsage: {
      GET: '/api/queries/payment-to-lobby-associations?format=json',
      POST: {
        parameters: {},
        format: 'csv'
      }
    }
  }
} as const

export interface QueryListResponse {
  success: boolean
  availableQueries: typeof AVAILABLE_QUERIES
  totalQueries: number
  supportedFormats: string[]
  commonParameters: string[]
  features: string[]
}

/**
 * Main Queries API - Lists all available predefined queries
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const tag = searchParams.get('tag')

    if (operation === 'by-tag' && tag) {
      // Filter queries by tag
      const filteredQueries = Object.entries(AVAILABLE_QUERIES)
        .filter(([key, query]) => query.tags.includes(tag as any))
        .reduce((acc, [key, query]) => ({ ...acc, [key]: query }), {})

      return NextResponse.json({
        success: true,
        filteredQueries,
        filterTag: tag,
        matchCount: Object.keys(filteredQueries).length
      })
    }

    if (operation === 'tags') {
      // Get all available tags
      const allTags = new Set<string>()
      Object.values(AVAILABLE_QUERIES).forEach(query => {
        query.tags.forEach(tag => allTags.add(tag))
      })

      return NextResponse.json({
        success: true,
        availableTags: Array.from(allTags).sort(),
        tagCounts: Array.from(allTags).map(tag => ({
          tag,
          queryCount: Object.values(AVAILABLE_QUERIES).filter(q => q.tags.includes(tag as any)).length
        }))
      })
    }

    if (operation === 'search') {
      const searchTerm = searchParams.get('q')?.toLowerCase()

      if (!searchTerm) {
        return NextResponse.json(
          { error: 'Search term is required when using search operation' },
          { status: 400 }
        )
      }

      // Search queries by name or description
      const searchResults = Object.entries(AVAILABLE_QUERIES)
        .filter(([key, query]) =>
          query.name.toLowerCase().includes(searchTerm) ||
          query.description.toLowerCase().includes(searchTerm) ||
          query.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
        .reduce((acc, [key, query]) => ({ ...acc, [key]: query }), {})

      return NextResponse.json({
        success: true,
        searchResults,
        searchTerm,
        matchCount: Object.keys(searchResults).length
      })
    }

    // Default: return all queries
    const response: QueryListResponse = {
      success: true,
      availableQueries: AVAILABLE_QUERIES,
      totalQueries: Object.keys(AVAILABLE_QUERIES).length,
      supportedFormats: ['json', 'csv'],
      commonParameters: ['project_id', 'dataset_id', 'limit', 'format', 'cache'],
      features: [
        'Predefined SQL queries from CA Lobby data',
        'Parameterized query execution',
        'Multiple output formats (JSON, CSV)',
        'Query caching for performance',
        'Custom SQL query execution',
        'Tag-based query filtering',
        'Search functionality'
      ]
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Queries List API error:', error)

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

/**
 * POST method for bulk query operations
 */
export async function POST(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const body = await request.json()
    const { operation, queries, format = 'json' } = body

    if (operation === 'bulk-execute') {
      // Execute multiple queries in parallel
      if (!Array.isArray(queries) || queries.length === 0) {
        return NextResponse.json(
          { error: 'Queries array is required for bulk execution' },
          { status: 400 }
        )
      }

      const results = await Promise.allSettled(
        queries.map(async (querySlug: string) => {
          try {
            // This would call the individual query endpoints
            // For now, return a placeholder response
            return {
              querySlug,
              status: 'completed',
              rowCount: 0,
              executionTime: 0
            }
          } catch (error) {
            return {
              querySlug,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      return NextResponse.json({
        success: true,
        operation: 'bulk-execute',
        results: results.map(result =>
          result.status === 'fulfilled' ? result.value : {
            status: 'failed',
            error: result.reason
          }
        ),
        totalQueries: queries.length,
        executedAt: new Date().toISOString()
      })
    }

    if (operation === 'validate-queries') {
      // Validate that all provided query slugs exist
      const validationResults = queries.map((querySlug: string) => ({
        querySlug,
        exists: querySlug in AVAILABLE_QUERIES,
        queryInfo: querySlug in AVAILABLE_QUERIES ? AVAILABLE_QUERIES[querySlug as keyof typeof AVAILABLE_QUERIES] : null
      }))

      return NextResponse.json({
        success: true,
        operation: 'validate-queries',
        validationResults,
        validQueries: validationResults.filter(r => r.exists).length,
        invalidQueries: validationResults.filter(r => !r.exists).length
      })
    }

    return NextResponse.json(
      { error: 'Invalid operation. Supported operations: bulk-execute, validate-queries' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Queries POST API error:', error)

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