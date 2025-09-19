import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { executeQuery } from '@/lib/bigquery-client'
import { jsonToCsv } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 180 // 3 minutes for complex queries

// Pre-defined SQL queries from the SQL Queries directory
const PREDEFINED_QUERIES = {
  'payment-to-lobbyist': {
    name: 'Payment to Lobbyist',
    description: 'Payment information to lobbyists with latest amendment filtering',
    sql: `
      with base as (
        -- Payment to lobbyist
        Select
          a."FILING_ID"
          ,a."FILER_NAML"
          ,a."FIRM_NAME"
          ,a."RPT_DATE"
          ,a."FROM_DATE"
          ,a."THRU_DATE"
          ,o."AMEND_ID"
          ,o."LINE_ITEM"
          ,o."EMPLR_NAML"
          ,o."FEES_AMT"
          ,o."REIMB_AMT"
          ,o."ADVAN_AMT"
          ,o."ADVAN_DSCR"
          ,o."PER_TOTAL"
          ,o."CUM_TOTAL"
          ,ROW_NUMBER() OVER (
            PARTITION BY o."FILING_ID", o."LINE_ITEM"
            ORDER BY o."FILING_ID" DESC, o."AMEND_ID" DESC, o."LINE_ITEM" DESC
          ) AS "row_num"
        from \`{project_id}.{dataset_id}.cvr_lobby_disclosure_cd\` a
        left join \`{project_id}.{dataset_id}.lpay_cd\` o on a."FILING_ID"=o."FILING_ID"
        where EXISTS (SELECT
          county FROM \`{project_id}.{dataset_id}.county_City\` AS w
          WHERE
          a."FILER_NAML" ILIKE '%' || upper(w.county) || '%')
        or EXISTS(SELECT
          county FROM \`{project_id}.{dataset_id}.county_City\` AS w
          WHERE
          o."EMPLR_NAML" ILIKE '%' || upper(w.county) || '%')
        AND a."RPT_DATE" = (
          SELECT MAX(a2."RPT_DATE")
          FROM \`{project_id}.{dataset_id}.cvr_lobby_disclosure_cd\` a2)
        and a."AMEND_ID"=Cast(o."AMEND_ID" as STRING)
        order by o."FILING_ID", o."LINE_ITEM",o."AMEND_ID"
      )
      SELECT *
      FROM base
      WHERE row_num = (
        SELECT MAX(b2."row_num")
        FROM base b2
        WHERE base."FILING_ID" = b2."FILING_ID"
        AND base."LINE_ITEM" = b2."LINE_ITEM"
      )
      ORDER BY "FILING_ID", "RPT_DATE" DESC
    `,
    parameters: ['project_id', 'dataset_id'],
    tags: ['payments', 'lobbyist', 'disclosure']
  },

  'payment-to-lobby-associations': {
    name: 'Payment to Lobby Associations',
    description: 'Payment information to lobby associations',
    sql: `
      --Payment to Lobbyist Association
      Select
        a."FILING_ID"
        ,a."FILER_NAML"
        ,a."FIRM_NAME"
        ,a."RPT_DATE"
        ,a."FROM_DATE"
        ,a."THRU_DATE"
        ,a."CUM_BEG_DT"
        ,o."RECIP_NAML"
        ,o."PMT_DATE"
        ,o."AMOUNT"
        ,o."CUM_AMT"
        ,o."AMEND_ID"
        ,o."LINE_ITEM"
        ,ROW_NUMBER() OVER (
          PARTITION BY o."FILING_ID", o."LINE_ITEM"
          ORDER BY o."FILING_ID" DESC, o."AMEND_ID" DESC, o."LINE_ITEM" DESC
        ) AS "row_num"
      from \`{project_id}.{dataset_id}.cvr_lobby_disclosure_cd\` a
      left join \`{project_id}.{dataset_id}.latt_cd\` o on a."FILING_ID"=o."FILING_ID"
      and a."AMEND_ID"=CAST(o."AMEND_ID" AS STRING)
      where EXISTS (SELECT
        county FROM \`{project_id}.{dataset_id}.county_City\` AS w
        WHERE
        a."FILER_NAML" ILIKE '%' || upper(w.county) || '%')
      or EXISTS(SELECT
        county FROM \`{project_id}.{dataset_id}.county_City\` AS w
        WHERE
        o."EMPLR_NAML" ILIKE '%' || upper(w.county) || '%')
      and "AMOUNT" is not null
      order by "FILING_ID","AMEND_ID","LINE_ITEM"
    `,
    parameters: ['project_id', 'dataset_id'],
    tags: ['payments', 'associations', 'lobby']
  }
} as const

export interface QueryRequest {
  parameters?: Record<string, any>
  format?: 'json' | 'csv'
  limit?: number
  useCache?: boolean
  customSql?: string
}

export interface QueryResponse {
  success: boolean
  queryName?: string
  data: any[]
  rowCount: number
  executionTime: number
  executedAt: string
  format: string
  fromCache?: boolean
  error?: string
}

/**
 * Dynamic SQL Query API - Handles predefined queries from SQL Queries directory
 * Supports parameterized queries and multiple output formats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const startTime = Date.now()

  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'json') as 'json' | 'csv'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const useCache = searchParams.get('cache') !== 'false'

    // Get query slug from params
    const querySlug = params.slug

    // Check if it's a predefined query
    if (!(querySlug in PREDEFINED_QUERIES)) {
      return NextResponse.json(
        {
          error: `Query '${querySlug}' not found`,
          availableQueries: Object.keys(PREDEFINED_QUERIES)
        },
        { status: 404 }
      )
    }

    const queryConfig = PREDEFINED_QUERIES[querySlug as keyof typeof PREDEFINED_QUERIES]

    console.log(`🔍 Executing predefined query: ${queryConfig.name}`)

    // Prepare query parameters
    const queryParameters: Record<string, string> = {
      project_id: process.env.GOOGLE_CLOUD_PROJECT_ID || 'ca-lobby',
      dataset_id: process.env.BIGQUERY_DATASET || 'ca_lobby'
    }

    // Add any additional parameters from search params
    for (const [key, value] of searchParams.entries()) {
      if (!['format', 'limit', 'cache'].includes(key)) {
        queryParameters[key] = value
      }
    }

    // Replace parameters in SQL
    let sql = queryConfig.sql
    for (const [param, value] of Object.entries(queryParameters)) {
      sql = sql.replace(new RegExp(`{${param}}`, 'g'), value)
    }

    // Add limit if specified
    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    // Execute query
    const result = await executeQuery({ query: sql })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          queryName: queryConfig.name,
          data: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          executedAt: new Date().toISOString(),
          format,
          error: result.error
        },
        { status: 500 }
      )
    }

    const response: QueryResponse = {
      success: true,
      queryName: queryConfig.name,
      data: result.data,
      rowCount: result.rowCount,
      executionTime: Date.now() - startTime,
      executedAt: new Date().toISOString(),
      format
    }

    // Return data in requested format
    if (format === 'csv') {
      const csvData = jsonToCsv(result.data)
      const fileName = `${querySlug}_${new Date().toISOString().split('T')[0]}.csv`

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': useCache ? 'public, max-age=300' : 'no-cache',
        },
      })
    }

    console.log(`✅ Query executed: ${result.rowCount} rows returned in ${Date.now() - startTime}ms`)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': useCache ? 'public, max-age=300' : 'no-cache',
      }
    })

  } catch (error) {
    console.error('❌ Query API error:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        data: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        executedAt: new Date().toISOString(),
        format: 'json',
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST method for custom SQL queries
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const startTime = Date.now()

  try {
    await requirePermission('bigquery:read')

    const body = await request.json()
    const {
      parameters = {},
      format = 'json',
      limit,
      useCache = true,
      customSql
    }: QueryRequest = body

    const querySlug = params.slug

    let sql: string
    let queryName: string

    if (customSql) {
      // Execute custom SQL
      sql = customSql
      queryName = 'Custom Query'

      // Basic SQL injection protection
      const trimmedQuery = sql.trim().toUpperCase()
      if (!trimmedQuery.startsWith('SELECT') && !trimmedQuery.startsWith('WITH')) {
        return NextResponse.json(
          { error: 'Only SELECT and WITH queries are allowed' },
          { status: 400 }
        )
      }
    } else {
      // Use predefined query
      if (!(querySlug in PREDEFINED_QUERIES)) {
        return NextResponse.json(
          {
            error: `Query '${querySlug}' not found`,
            availableQueries: Object.keys(PREDEFINED_QUERIES)
          },
          { status: 404 }
        )
      }

      const queryConfig = PREDEFINED_QUERIES[querySlug as keyof typeof PREDEFINED_QUERIES]
      sql = queryConfig.sql
      queryName = queryConfig.name

      // Replace parameters in SQL
      const queryParameters = {
        project_id: process.env.GOOGLE_CLOUD_PROJECT_ID || 'ca-lobby',
        dataset_id: process.env.BIGQUERY_DATASET || 'ca_lobby',
        ...parameters
      }

      for (const [param, value] of Object.entries(queryParameters)) {
        sql = sql.replace(new RegExp(`{${param}}`, 'g'), String(value))
      }
    }

    // Add limit if specified
    if (limit) {
      sql += ` LIMIT ${limit}`
    }

    console.log(`🔍 Executing query: ${queryName}`)

    // Execute query
    const result = await executeQuery({ query: sql })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          queryName,
          data: [],
          rowCount: 0,
          executionTime: Date.now() - startTime,
          executedAt: new Date().toISOString(),
          format,
          error: result.error
        },
        { status: 500 }
      )
    }

    const response: QueryResponse = {
      success: true,
      queryName,
      data: result.data,
      rowCount: result.rowCount,
      executionTime: Date.now() - startTime,
      executedAt: new Date().toISOString(),
      format
    }

    // Return data in requested format
    if (format === 'csv') {
      const csvData = jsonToCsv(result.data)
      const fileName = `${querySlug}_${new Date().toISOString().split('T')[0]}.csv`

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': useCache ? 'public, max-age=300' : 'no-cache',
        },
      })
    }

    console.log(`✅ Query executed: ${result.rowCount} rows returned in ${Date.now() - startTime}ms`)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': useCache ? 'public, max-age=300' : 'no-cache',
      }
    })

  } catch (error) {
    console.error('❌ Query POST API error:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        data: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        executedAt: new Date().toISOString(),
        format: 'json',
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}