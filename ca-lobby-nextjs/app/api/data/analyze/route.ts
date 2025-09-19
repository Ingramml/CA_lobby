import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { executeQuery } from '@/lib/bigquery-client'
import { csvToJson } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120 // 2 minutes for data analysis

export interface AnalysisOptions {
  dataSource: DataSource
  analysisType: AnalysisType[]
  includeStatistics?: boolean
  includeQualityCheck?: boolean
  sampleSize?: number
  customQueries?: string[]
}

export interface DataSource {
  type: 'table' | 'query' | 'file' | 'url'
  source: string // table name, SQL query, file content, or URL
  format?: 'csv' | 'json'
}

export type AnalysisType =
  | 'basic_stats'
  | 'data_quality'
  | 'schema_analysis'
  | 'null_analysis'
  | 'duplicate_analysis'
  | 'value_distribution'
  | 'data_profiling'
  | 'trend_analysis'

export interface AnalysisResponse {
  success: boolean
  dataSource: DataSource
  analysisResults: AnalysisResult[]
  summary: AnalysisSummary
  recommendations: string[]
  executionTime: number
  analyzedAt: string
  errors: string[]
}

export interface AnalysisResult {
  type: AnalysisType
  results: any
  status: 'completed' | 'failed' | 'skipped'
  executionTime: number
  errorMessage?: string
}

export interface AnalysisSummary {
  totalRows: number
  totalColumns: number
  nullPercentage: number
  duplicateRows: number
  dataQualityScore: number
  schemaConsistency: boolean
  memoryUsage?: string
}

/**
 * Data Analysis API - Migrated from determine_df.py
 * Ensures data is in DataFrame format and performs comprehensive analysis
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const analyzedAt = new Date().toISOString()

  try {
    await requirePermission('bigquery:read')

    const body = await request.json()
    const {
      dataSource,
      analysisType = ['basic_stats', 'data_quality', 'schema_analysis'],
      includeStatistics = true,
      includeQualityCheck = true,
      sampleSize = 10000,
      customQueries = []
    }: AnalysisOptions = body

    // Validate required fields
    if (!dataSource || !dataSource.source) {
      return NextResponse.json(
        { error: 'Data source is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting data analysis for source: ${dataSource.source}`)

    // Step 1: Ensure data is accessible (similar to ensure_dataframe function)
    const dataFrame = await ensureDataFrame(dataSource)

    if (!dataFrame.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to access data source: ${dataFrame.error}`,
          dataSource,
          analysisResults: [],
          summary: getEmptySummary(),
          recommendations: [],
          executionTime: Date.now() - startTime,
          analyzedAt,
          errors: [dataFrame.error || 'Unknown data access error']
        },
        { status: 400 }
      )
    }

    const data = dataFrame.data
    const analysisResults: AnalysisResult[] = []
    const errors: string[] = []

    // Step 2: Perform requested analyses
    for (const type of analysisType) {
      const analysisStartTime = Date.now()

      try {
        console.log(`📊 Performing ${type} analysis...`)

        let result: any
        let status: 'completed' | 'failed' | 'skipped' = 'completed'

        switch (type) {
          case 'basic_stats':
            result = await performBasicStats(data, sampleSize)
            break

          case 'data_quality':
            result = await performDataQuality(data)
            break

          case 'schema_analysis':
            result = await performSchemaAnalysis(data)
            break

          case 'null_analysis':
            result = await performNullAnalysis(data)
            break

          case 'duplicate_analysis':
            result = await performDuplicateAnalysis(data)
            break

          case 'value_distribution':
            result = await performValueDistribution(data, sampleSize)
            break

          case 'data_profiling':
            result = await performDataProfiling(data)
            break

          case 'trend_analysis':
            result = await performTrendAnalysis(data)
            break

          default:
            result = { message: `Analysis type ${type} not implemented` }
            status = 'skipped'
        }

        analysisResults.push({
          type,
          results: result,
          status,
          executionTime: Date.now() - analysisStartTime
        })

        console.log(`✅ Completed ${type} analysis in ${Date.now() - analysisStartTime}ms`)

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : `Unknown error in ${type} analysis`
        errors.push(errorMsg)

        analysisResults.push({
          type,
          results: {},
          status: 'failed',
          executionTime: Date.now() - analysisStartTime,
          errorMessage: errorMsg
        })

        console.error(`❌ Failed ${type} analysis: ${errorMsg}`)
      }
    }

    // Step 3: Execute custom queries if provided
    for (const customQuery of customQueries) {
      const queryStartTime = Date.now()

      try {
        const result = await executeQuery({ query: customQuery })

        analysisResults.push({
          type: 'basic_stats', // Use basic_stats as default type for custom queries
          results: {
            queryType: 'custom',
            query: customQuery,
            data: result.data,
            rowCount: result.rowCount
          },
          status: result.success ? 'completed' : 'failed',
          executionTime: Date.now() - queryStartTime,
          errorMessage: result.success ? undefined : result.error
        })

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Custom query execution failed'
        errors.push(errorMsg)

        analysisResults.push({
          type: 'basic_stats',
          results: { queryType: 'custom', query: customQuery },
          status: 'failed',
          executionTime: Date.now() - queryStartTime,
          errorMessage: errorMsg
        })
      }
    }

    // Step 4: Generate summary and recommendations
    const summary = generateAnalysisSummary(analysisResults, data)
    const recommendations = generateRecommendations(analysisResults, summary)

    const response: AnalysisResponse = {
      success: errors.length === 0,
      dataSource,
      analysisResults,
      summary,
      recommendations,
      executionTime: Date.now() - startTime,
      analyzedAt,
      errors
    }

    console.log(`🏁 Data analysis completed: ${analysisResults.length} analyses performed`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Data Analysis API error:', error)

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
        dataSource: { type: 'table', source: '' },
        analysisResults: [],
        summary: getEmptySummary(),
        recommendations: [],
        executionTime: Date.now() - startTime,
        analyzedAt,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    )
  }
}

/**
 * GET method to list available analysis types and data sources
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    if (operation === 'analysis-types') {
      return NextResponse.json({
        success: true,
        analysisTypes: {
          basic_stats: 'Basic statistical analysis (count, mean, median, etc.)',
          data_quality: 'Data quality assessment and scoring',
          schema_analysis: 'Column types and schema validation',
          null_analysis: 'Missing values analysis',
          duplicate_analysis: 'Duplicate records detection',
          value_distribution: 'Value frequency and distribution analysis',
          data_profiling: 'Comprehensive data profiling',
          trend_analysis: 'Time-based trend analysis'
        }
      })
    }

    if (operation === 'data-sources') {
      return NextResponse.json({
        success: true,
        supportedSources: {
          table: 'BigQuery table name',
          query: 'Custom SQL query',
          file: 'CSV or JSON file content',
          url: 'HTTP URL to data file'
        },
        supportedFormats: ['csv', 'json']
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Data Analysis API ready',
      availableOperations: ['analysis-types', 'data-sources'],
      features: [
        'Multiple data source support',
        'Comprehensive data quality assessment',
        'Schema validation and analysis',
        'Statistical analysis and profiling',
        'Custom query execution',
        'Automated recommendations'
      ]
    })

  } catch (error) {
    console.error('❌ Data Analysis GET API error:', error)

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
 * Ensure data is accessible (migrated from ensure_dataframe function)
 */
async function ensureDataFrame(dataSource: DataSource): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    let data: any[]

    switch (dataSource.type) {
      case 'table':
        // Query BigQuery table
        const tableName = dataSource.source
        const query = `SELECT * FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${tableName}\` LIMIT 10000`
        const result = await executeQuery({ query })

        if (!result.success) {
          throw new Error(result.error || 'Failed to query table')
        }

        data = result.data
        break

      case 'query':
        // Execute custom SQL query
        const queryResult = await executeQuery({ query: dataSource.source })

        if (!queryResult.success) {
          throw new Error(queryResult.error || 'Failed to execute query')
        }

        data = queryResult.data
        break

      case 'file':
        // Parse file content
        if (dataSource.format === 'csv') {
          data = csvToJson(dataSource.source)
        } else if (dataSource.format === 'json') {
          data = JSON.parse(dataSource.source)
        } else {
          throw new Error('Unsupported file format. Use csv or json.')
        }
        break

      case 'url':
        // Fetch data from URL (placeholder - would need actual HTTP client)
        throw new Error('URL data source not yet implemented')

      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`)
    }

    if (!Array.isArray(data)) {
      throw new Error('Data must be an array of objects')
    }

    if (data.length === 0) {
      throw new Error('Data source contains no records')
    }

    return { success: true, data }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown data access error'
    }
  }
}

/**
 * Perform basic statistical analysis
 */
async function performBasicStats(data: any[], sampleSize: number): Promise<any> {
  const sample = data.slice(0, Math.min(sampleSize, data.length))
  const totalRows = data.length

  if (sample.length === 0) {
    return { error: 'No data to analyze' }
  }

  const firstRow = sample[0]
  const columns = Object.keys(firstRow)

  const columnStats: any = {}

  for (const column of columns) {
    const values = sample.map(row => row[column]).filter(val => val !== null && val !== undefined)
    const nullCount = sample.length - values.length

    const stats: any = {
      totalValues: sample.length,
      nonNullValues: values.length,
      nullValues: nullCount,
      nullPercentage: (nullCount / sample.length) * 100
    }

    // Type-specific statistics
    const numericValues = values.filter(val => typeof val === 'number' && !isNaN(val))

    if (numericValues.length > 0) {
      const sorted = numericValues.sort((a, b) => a - b)
      stats.dataType = 'numeric'
      stats.min = Math.min(...numericValues)
      stats.max = Math.max(...numericValues)
      stats.mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length
      stats.median = sorted[Math.floor(sorted.length / 2)]
      stats.standardDeviation = Math.sqrt(
        numericValues.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / numericValues.length
      )
    } else {
      stats.dataType = 'string'
      stats.uniqueValues = new Set(values).size
      stats.mostCommon = getMostCommonValue(values)
    }

    columnStats[column] = stats
  }

  return {
    totalRows,
    sampleSize: sample.length,
    columnCount: columns.length,
    columns: columnStats,
    memoryEstimate: JSON.stringify(sample).length
  }
}

/**
 * Perform data quality analysis
 */
async function performDataQuality(data: any[]): Promise<any> {
  if (data.length === 0) {
    return { qualityScore: 0, issues: ['No data to analyze'] }
  }

  const issues: string[] = []
  let qualityScore = 100

  const firstRow = data[0]
  const columns = Object.keys(firstRow)

  // Check for missing values
  const totalCells = data.length * columns.length
  let missingCells = 0

  for (const row of data) {
    for (const column of columns) {
      if (row[column] === null || row[column] === undefined || row[column] === '') {
        missingCells++
      }
    }
  }

  const missingPercentage = (missingCells / totalCells) * 100

  if (missingPercentage > 10) {
    qualityScore -= 20
    issues.push(`High missing data: ${missingPercentage.toFixed(1)}% of cells are empty`)
  }

  // Check for duplicates
  const uniqueRows = new Set(data.map(row => JSON.stringify(row)))
  const duplicatePercentage = ((data.length - uniqueRows.size) / data.length) * 100

  if (duplicatePercentage > 5) {
    qualityScore -= 15
    issues.push(`Duplicate records detected: ${duplicatePercentage.toFixed(1)}% of rows`)
  }

  // Check data consistency
  for (const column of columns) {
    const types = new Set(data.map(row => typeof row[column]))
    if (types.size > 2) { // Allow for null/undefined + one data type
      qualityScore -= 10
      issues.push(`Inconsistent data types in column: ${column}`)
    }
  }

  return {
    qualityScore: Math.max(0, qualityScore),
    missingDataPercentage: missingPercentage,
    duplicatePercentage,
    issues,
    recommendations: generateQualityRecommendations(missingPercentage, duplicatePercentage, issues)
  }
}

/**
 * Perform schema analysis
 */
async function performSchemaAnalysis(data: any[]): Promise<any> {
  if (data.length === 0) {
    return { error: 'No data to analyze' }
  }

  const firstRow = data[0]
  const columns = Object.keys(firstRow)

  const schema = columns.map(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined)
    const types = new Set(values.map(val => typeof val))

    let inferredType = 'string'
    if (types.has('number')) {
      inferredType = 'number'
    } else if (types.has('boolean')) {
      inferredType = 'boolean'
    }

    return {
      columnName: column,
      inferredType,
      hasNulls: data.some(row => row[column] === null || row[column] === undefined),
      uniqueValues: new Set(values).size,
      sampleValues: values.slice(0, 5)
    }
  })

  return {
    totalColumns: columns.length,
    schema,
    isConsistent: schema.every(col => col.inferredType !== 'mixed')
  }
}

/**
 * Perform null value analysis
 */
async function performNullAnalysis(data: any[]): Promise<any> {
  if (data.length === 0) {
    return { error: 'No data to analyze' }
  }

  const firstRow = data[0]
  const columns = Object.keys(firstRow)

  const nullAnalysis = columns.map(column => {
    const nullCount = data.filter(row =>
      row[column] === null || row[column] === undefined || row[column] === ''
    ).length

    return {
      column,
      nullCount,
      nullPercentage: (nullCount / data.length) * 100,
      hasPattern: checkNullPattern(data.map(row => row[column]))
    }
  })

  return {
    columnAnalysis: nullAnalysis,
    overallNullPercentage: nullAnalysis.reduce((sum, col) => sum + col.nullPercentage, 0) / columns.length,
    columnsWithHighNulls: nullAnalysis.filter(col => col.nullPercentage > 20)
  }
}

/**
 * Perform duplicate analysis
 */
async function performDuplicateAnalysis(data: any[]): Promise<any> {
  if (data.length === 0) {
    return { error: 'No data to analyze' }
  }

  const rowHashes = new Map<string, number>()

  for (const row of data) {
    const hash = JSON.stringify(row)
    rowHashes.set(hash, (rowHashes.get(hash) || 0) + 1)
  }

  const duplicates = Array.from(rowHashes.entries())
    .filter(([hash, count]) => count > 1)
    .map(([hash, count]) => ({ row: JSON.parse(hash), occurrences: count }))

  return {
    totalRows: data.length,
    uniqueRows: rowHashes.size,
    duplicateRows: data.length - rowHashes.size,
    duplicatePercentage: ((data.length - rowHashes.size) / data.length) * 100,
    duplicateExamples: duplicates.slice(0, 5)
  }
}

/**
 * Perform value distribution analysis
 */
async function performValueDistribution(data: any[], sampleSize: number): Promise<any> {
  const sample = data.slice(0, Math.min(sampleSize, data.length))

  if (sample.length === 0) {
    return { error: 'No data to analyze' }
  }

  const firstRow = sample[0]
  const columns = Object.keys(firstRow)

  const distributions: any = {}

  for (const column of columns) {
    const values = sample.map(row => row[column])
    const valueFrequency = new Map<any, number>()

    for (const value of values) {
      valueFrequency.set(value, (valueFrequency.get(value) || 0) + 1)
    }

    const sortedFrequency = Array.from(valueFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 most frequent values

    distributions[column] = {
      uniqueValues: valueFrequency.size,
      mostFrequent: sortedFrequency,
      entropy: calculateEntropy(Array.from(valueFrequency.values()))
    }
  }

  return {
    sampleSize: sample.length,
    distributions
  }
}

/**
 * Perform data profiling
 */
async function performDataProfiling(data: any[]): Promise<any> {
  // Combine multiple analysis types for comprehensive profiling
  const basicStats = await performBasicStats(data, data.length)
  const qualityAnalysis = await performDataQuality(data)
  const schemaAnalysis = await performSchemaAnalysis(data)

  return {
    overview: {
      totalRows: data.length,
      totalColumns: Object.keys(data[0] || {}).length,
      dataQualityScore: qualityAnalysis.qualityScore,
      schemaConsistency: schemaAnalysis.isConsistent
    },
    basicStatistics: basicStats,
    qualityAssessment: qualityAnalysis,
    schemaInfo: schemaAnalysis
  }
}

/**
 * Perform trend analysis (placeholder for time-series analysis)
 */
async function performTrendAnalysis(data: any[]): Promise<any> {
  // Look for date/time columns and perform basic trend analysis
  const firstRow = data[0] || {}
  const columns = Object.keys(firstRow)

  const dateColumns = columns.filter(column => {
    const sampleValue = firstRow[column]
    return typeof sampleValue === 'string' &&
      (sampleValue.match(/^\d{4}-\d{2}-\d{2}/) || sampleValue.includes('T'))
  })

  if (dateColumns.length === 0) {
    return {
      message: 'No date/time columns found for trend analysis',
      availableColumns: columns
    }
  }

  // Basic trend analysis for the first date column
  const dateColumn = dateColumns[0]
  const sortedData = data.sort((a, b) => new Date(a[dateColumn]).getTime() - new Date(b[dateColumn]).getTime())

  return {
    dateColumn,
    totalRecords: data.length,
    dateRange: {
      earliest: sortedData[0]?.[dateColumn],
      latest: sortedData[sortedData.length - 1]?.[dateColumn]
    },
    recordsOverTime: groupByTimeInterval(sortedData, dateColumn)
  }
}

// Helper functions

function getMostCommonValue(values: any[]): { value: any; count: number } {
  const frequency = new Map<any, number>()

  for (const value of values) {
    frequency.set(value, (frequency.get(value) || 0) + 1)
  }

  let mostCommon = { value: null, count: 0 }
  for (const [value, count] of frequency.entries()) {
    if (count > mostCommon.count) {
      mostCommon = { value, count }
    }
  }

  return mostCommon
}

function checkNullPattern(values: any[]): boolean {
  // Simple pattern detection - checks if nulls occur in clusters
  let consecutiveNulls = 0
  let maxConsecutiveNulls = 0

  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      consecutiveNulls++
      maxConsecutiveNulls = Math.max(maxConsecutiveNulls, consecutiveNulls)
    } else {
      consecutiveNulls = 0
    }
  }

  return maxConsecutiveNulls > 3 // Pattern if more than 3 consecutive nulls
}

function calculateEntropy(frequencies: number[]): number {
  const total = frequencies.reduce((sum, freq) => sum + freq, 0)
  const probabilities = frequencies.map(freq => freq / total)

  return -probabilities.reduce((entropy, prob) => {
    return entropy + (prob > 0 ? prob * Math.log2(prob) : 0)
  }, 0)
}

function groupByTimeInterval(data: any[], dateColumn: string): any {
  // Group records by month for basic trend analysis
  const groups = new Map<string, number>()

  for (const row of data) {
    const date = new Date(row[dateColumn])
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    groups.set(monthKey, (groups.get(monthKey) || 0) + 1)
  }

  return Array.from(groups.entries()).map(([month, count]) => ({ month, count }))
}

function generateAnalysisSummary(analysisResults: AnalysisResult[], data: any[]): AnalysisSummary {
  const basicStatsResult = analysisResults.find(r => r.type === 'basic_stats')
  const qualityResult = analysisResults.find(r => r.type === 'data_quality')
  const duplicateResult = analysisResults.find(r => r.type === 'duplicate_analysis')
  const nullResult = analysisResults.find(r => r.type === 'null_analysis')
  const schemaResult = analysisResults.find(r => r.type === 'schema_analysis')

  return {
    totalRows: basicStatsResult?.results?.totalRows || data.length,
    totalColumns: basicStatsResult?.results?.columnCount || 0,
    nullPercentage: nullResult?.results?.overallNullPercentage || 0,
    duplicateRows: duplicateResult?.results?.duplicateRows || 0,
    dataQualityScore: qualityResult?.results?.qualityScore || 0,
    schemaConsistency: schemaResult?.results?.isConsistent || false,
    memoryUsage: basicStatsResult?.results?.memoryEstimate || '0 bytes'
  }
}

function generateRecommendations(analysisResults: AnalysisResult[], summary: AnalysisSummary): string[] {
  const recommendations: string[] = []

  if (summary.dataQualityScore < 70) {
    recommendations.push('Data quality is below acceptable threshold. Consider data cleaning.')
  }

  if (summary.nullPercentage > 20) {
    recommendations.push('High percentage of missing values detected. Consider imputation strategies.')
  }

  if (summary.duplicateRows > summary.totalRows * 0.05) {
    recommendations.push('Significant duplicate records found. Consider deduplication.')
  }

  if (!summary.schemaConsistency) {
    recommendations.push('Schema inconsistencies detected. Review data types and formats.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Data appears to be in good condition. No major issues detected.')
  }

  return recommendations
}

function generateQualityRecommendations(missingPercentage: number, duplicatePercentage: number, issues: string[]): string[] {
  const recommendations: string[] = []

  if (missingPercentage > 10) {
    recommendations.push('Consider implementing data validation at the source')
    recommendations.push('Use imputation techniques for missing numerical values')
  }

  if (duplicatePercentage > 5) {
    recommendations.push('Implement unique constraints or deduplication logic')
    recommendations.push('Review data collection processes to prevent duplicates')
  }

  if (issues.length > 0) {
    recommendations.push('Establish data quality monitoring and alerting')
    recommendations.push('Create data validation rules and automated testing')
  }

  return recommendations
}

function getEmptySummary(): AnalysisSummary {
  return {
    totalRows: 0,
    totalColumns: 0,
    nullPercentage: 0,
    duplicateRows: 0,
    dataQualityScore: 0,
    schemaConsistency: false
  }
}