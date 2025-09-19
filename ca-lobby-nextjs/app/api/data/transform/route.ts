import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { executeQuery, getBigQueryClient } from '@/lib/bigquery-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 180 // 3 minutes for data transformation

export interface TransformOptions {
  sourceTable: string
  targetTable?: string
  transformationType: 'column_rename' | 'column_mapping' | 'data_cleaning' | 'schema_update'
  transformationRules: TransformationRule[]
  validateSchema?: boolean
  createBackup?: boolean
}

export interface TransformationRule {
  type: 'rename' | 'cast' | 'clean' | 'remove' | 'add'
  sourceColumn?: string
  targetColumn?: string
  dataType?: string
  cleaningPattern?: string
  defaultValue?: any
  expression?: string
}

export interface TransformResponse {
  success: boolean
  sourceTable: string
  targetTable: string
  transformationsApplied: AppliedTransformation[]
  rowsAffected: number
  columnsModified: number
  backupTable?: string
  executionTime: number
  startedAt: string
  completedAt: string
  errors: string[]
}

export interface AppliedTransformation {
  rule: TransformationRule
  status: 'success' | 'failed' | 'skipped'
  errorMessage?: string
  rowsAffected?: number
}

/**
 * Data Transformation API - Migrated from Column_rename.py
 * Handles column renaming, data cleaning, and schema transformations
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const startedAt = new Date().toISOString()

  try {
    await requirePermission('bigquery:write')

    const body = await request.json()
    const {
      sourceTable,
      targetTable,
      transformationType = 'column_rename',
      transformationRules,
      validateSchema = true,
      createBackup = true
    }: TransformOptions = body

    // Validate required fields
    if (!sourceTable) {
      return NextResponse.json(
        { error: 'Source table is required' },
        { status: 400 }
      )
    }

    if (!transformationRules || !Array.isArray(transformationRules) || transformationRules.length === 0) {
      return NextResponse.json(
        { error: 'Transformation rules are required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Starting data transformation for table: ${sourceTable}`)

    const client = getBigQueryClient()
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID
    const datasetId = process.env.BIGQUERY_DATASET || 'ca_lobby'

    const fullSourceTable = `${projectId}.${datasetId}.${sourceTable}`
    const fullTargetTable = targetTable
      ? `${projectId}.${datasetId}.${targetTable}`
      : `${projectId}.${datasetId}.${sourceTable}`

    const transformationsApplied: AppliedTransformation[] = []
    const errors: string[] = []
    let rowsAffected = 0
    let columnsModified = 0
    let backupTable: string | undefined

    try {
      // Step 1: Validate source table exists
      const tableExists = await checkTableExists(fullSourceTable)
      if (!tableExists) {
        throw new Error(`Source table ${fullSourceTable} does not exist`)
      }

      // Step 2: Get source table schema
      const sourceSchema = await getTableSchema(fullSourceTable)
      console.log(`📋 Retrieved schema for ${sourceTable}: ${sourceSchema.length} columns`)

      // Step 3: Create backup if requested
      if (createBackup) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '_')
        backupTable = `${fullSourceTable}_backup_${timestamp}`

        const backupQuery = `
          CREATE TABLE \`${backupTable}\` AS
          SELECT * FROM \`${fullSourceTable}\`
        `

        await executeQuery({ query: backupQuery })
        console.log(`💾 Created backup table: ${backupTable}`)
      }

      // Step 4: Generate transformation SQL based on rules
      const { selectClause, columnMappings } = generateTransformationSQL(
        transformationRules,
        sourceSchema
      )

      // Step 5: Execute transformation
      let transformationQuery: string

      if (transformationType === 'column_rename') {
        // Handle column renaming (similar to Column_rename.py logic)
        transformationQuery = `
          CREATE OR REPLACE TABLE \`${fullTargetTable}\` AS
          SELECT
            ${selectClause}
          FROM \`${fullSourceTable}\`
        `
      } else {
        // Handle other transformation types
        transformationQuery = `
          CREATE OR REPLACE TABLE \`${fullTargetTable}\` AS
          SELECT
            ${selectClause}
          FROM \`${fullSourceTable}\`
        `
      }

      console.log('🔍 Executing transformation query...')
      const result = await executeQuery({ query: transformationQuery })

      if (!result.success) {
        throw new Error(`Transformation query failed: ${result.error}`)
      }

      // Step 6: Get row count from result
      const countQuery = `SELECT COUNT(*) as row_count FROM \`${fullTargetTable}\``
      const countResult = await executeQuery({ query: countQuery })

      if (countResult.success && countResult.data.length > 0) {
        rowsAffected = countResult.data[0].row_count || 0
      }

      // Step 7: Record successful transformations
      transformationRules.forEach(rule => {
        transformationsApplied.push({
          rule,
          status: 'success',
          rowsAffected
        })
        columnsModified++
      })

      console.log(`✅ Data transformation completed: ${rowsAffected} rows affected`)

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown transformation error'
      errors.push(errorMsg)
      console.error(`❌ Transformation failed: ${errorMsg}`)

      // Record failed transformations
      transformationRules.forEach(rule => {
        transformationsApplied.push({
          rule,
          status: 'failed',
          errorMessage: errorMsg
        })
      })
    }

    const completedAt = new Date().toISOString()
    const executionTime = Date.now() - startTime

    const response: TransformResponse = {
      success: errors.length === 0,
      sourceTable: fullSourceTable,
      targetTable: fullTargetTable,
      transformationsApplied,
      rowsAffected,
      columnsModified,
      backupTable,
      executionTime,
      startedAt,
      completedAt,
      errors
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Data Transform API error:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        sourceTable: '',
        targetTable: '',
        transformationsApplied: [],
        rowsAffected: 0,
        columnsModified: 0,
        executionTime: Date.now() - startTime,
        startedAt,
        completedAt: new Date().toISOString(),
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    )
  }
}

/**
 * GET method to list available transformations and table information
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')
    const tableName = searchParams.get('table')

    if (operation === 'list-tables') {
      // List available tables for transformation
      const query = `
        SELECT table_name, table_type, creation_time
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.INFORMATION_SCHEMA.TABLES\`
        ORDER BY creation_time DESC
      `

      const result = await executeQuery({ query })

      return NextResponse.json({
        success: true,
        tables: result.data || [],
        totalTables: result.rowCount || 0
      })
    }

    if (operation === 'get-schema' && tableName) {
      // Get detailed schema information for a table
      const fullTableName = `${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${tableName}`
      const schema = await getTableSchema(fullTableName)

      return NextResponse.json({
        success: true,
        tableName,
        schema,
        columnCount: schema.length
      })
    }

    if (operation === 'transformation-templates') {
      // Return common transformation templates
      return NextResponse.json({
        success: true,
        templates: {
          columnRename: {
            type: 'column_rename',
            description: 'Rename columns and remove text suffixes',
            sampleRules: [
              {
                type: 'rename',
                sourceColumn: 'column_name text',
                targetColumn: 'column_name'
              }
            ]
          },
          dataTypeCasting: {
            type: 'schema_update',
            description: 'Convert column data types',
            sampleRules: [
              {
                type: 'cast',
                sourceColumn: 'amount',
                dataType: 'FLOAT64'
              }
            ]
          },
          dataCleaning: {
            type: 'data_cleaning',
            description: 'Clean and standardize data values',
            sampleRules: [
              {
                type: 'clean',
                sourceColumn: 'phone_number',
                cleaningPattern: 'REGEXP_REPLACE({column}, r"[^0-9]", "")'
              }
            ]
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Data Transform API ready',
      availableOperations: ['list-tables', 'get-schema', 'transformation-templates'],
      supportedTransformations: [
        'column_rename',
        'column_mapping',
        'data_cleaning',
        'schema_update'
      ],
      features: [
        'Column renaming with pattern matching',
        'Data type casting',
        'Data cleaning and validation',
        'Backup creation',
        'Schema validation'
      ]
    })

  } catch (error) {
    console.error('❌ Data Transform GET API error:', error)

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
 * Check if a BigQuery table exists
 */
async function checkTableExists(fullTableName: string): Promise<boolean> {
  try {
    const client = getBigQueryClient()
    const [projectId, datasetId, tableName] = fullTableName.split('.')

    const dataset = client.dataset(datasetId.replace(/`/g, ''))
    const table = dataset.table(tableName.replace(/`/g, ''))

    const [exists] = await table.exists()
    return exists
  } catch (error) {
    console.error('Error checking table existence:', error)
    return false
  }
}

/**
 * Get table schema information
 */
async function getTableSchema(fullTableName: string): Promise<any[]> {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM \`${fullTableName.replace(/`/g, '')}.INFORMATION_SCHEMA.COLUMNS\`
      ORDER BY ordinal_position
    `

    const result = await executeQuery({ query })
    return result.data || []
  } catch (error) {
    console.error('Error getting table schema:', error)
    return []
  }
}

/**
 * Generate SQL for transformations (similar to Column_rename.py logic)
 */
function generateTransformationSQL(
  rules: TransformationRule[],
  sourceSchema: any[]
): { selectClause: string; columnMappings: Map<string, string> } {
  const columnMappings = new Map<string, string>()
  const selectExpressions: string[] = []

  // Process each column in the source schema
  for (const column of sourceSchema) {
    const columnName = column.column_name
    let finalExpression = `\`${columnName}\``
    let finalAlias = columnName

    // Apply transformation rules
    for (const rule of rules) {
      if (rule.type === 'rename' && rule.sourceColumn === columnName) {
        finalAlias = rule.targetColumn || columnName
        columnMappings.set(columnName, finalAlias)
      } else if (rule.type === 'cast' && rule.sourceColumn === columnName) {
        finalExpression = `CAST(\`${columnName}\` AS ${rule.dataType})`
      } else if (rule.type === 'clean' && rule.sourceColumn === columnName) {
        if (rule.cleaningPattern) {
          finalExpression = rule.cleaningPattern.replace('{column}', `\`${columnName}\``)
        } else {
          // Default cleaning - remove " text" suffix (like Column_rename.py)
          finalAlias = columnName.replace(' text', '')
        }
      }
    }

    // Handle automatic " text" suffix removal (Column_rename.py behavior)
    if (columnName.includes(' text')) {
      finalAlias = columnName.replace(' text', '')
      columnMappings.set(columnName, finalAlias)
    }

    // Add to select expressions
    if (finalAlias !== columnName) {
      selectExpressions.push(`${finalExpression} AS \`${finalAlias}\``)
    } else {
      selectExpressions.push(finalExpression)
    }
  }

  // Handle add column rules
  for (const rule of rules) {
    if (rule.type === 'add' && rule.targetColumn) {
      const expression = rule.expression || `'${rule.defaultValue || ''}' AS \`${rule.targetColumn}\``
      selectExpressions.push(expression)
    }
  }

  const selectClause = selectExpressions.join(',\n  ')

  return { selectClause, columnMappings }
}