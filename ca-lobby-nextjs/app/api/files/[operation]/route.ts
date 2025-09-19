import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { executeQuery } from '@/lib/bigquery-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 1 minute for file operations

export interface FileSelectionOptions {
  directory?: string
  filePattern?: string
  excludePatterns?: string[]
  includeMetadata?: boolean
  sortBy?: 'name' | 'date' | 'size'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export interface FileInfo {
  fileName: string
  fullPath: string
  size?: number
  created?: string
  modified?: string
  type: string
  isProcessable: boolean
  excludeReason?: string
}

export interface FileSelectionResponse {
  success: boolean
  operation: string
  files: FileInfo[]
  processableFiles: FileInfo[]
  excludedFiles: FileInfo[]
  totalFiles: number
  processableCount: number
  excludedCount: number
  selectionCriteria: FileSelectionOptions
  selectedAt: string
}

// Default exclude patterns (similar to fileselector.py logic)
const DEFAULT_EXCLUDE_PATTERNS = ['clean', 'project', 'backup', 'temp']

/**
 * File Selector/Management API - Migrated from fileselector.py
 * Handles file discovery, filtering, and selection for processing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { operation: string } }
) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = params.operation

    switch (operation) {
      case 'list':
        return await handleFileList(searchParams)

      case 'select':
        return await handleFileSelection(searchParams)

      case 'scan-tables':
        return await handleTableScan(searchParams)

      case 'check-uploads':
        return await handleUploadCheck(searchParams)

      default:
        return NextResponse.json(
          {
            error: `Invalid operation: ${operation}`,
            availableOperations: ['list', 'select', 'scan-tables', 'check-uploads']
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ File Selector API error:', error)

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
 * POST method for complex file operations
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { operation: string } }
) {
  try {
    await requirePermission('bigquery:read')

    const body = await request.json()
    const operation = params.operation

    switch (operation) {
      case 'batch-select':
        return await handleBatchSelection(body)

      case 'validate-files':
        return await handleFileValidation(body)

      case 'prepare-processing':
        return await handleProcessingPreparation(body)

      default:
        return NextResponse.json(
          {
            error: `Invalid POST operation: ${operation}`,
            availableOperations: ['batch-select', 'validate-files', 'prepare-processing']
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ File Selector POST API error:', error)

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
 * List available files (simulates file system scanning from fileselector.py)
 */
async function handleFileList(searchParams: URLSearchParams): Promise<NextResponse> {
  const directory = searchParams.get('directory') || 'downloads'
  const pattern = searchParams.get('pattern') || '*.csv'
  const includeMetadata = searchParams.get('metadata') === 'true'

  console.log(`📁 Scanning directory: ${directory} for pattern: ${pattern}`)

  // In production, this would scan actual file system or cloud storage
  // For now, we'll simulate with common CA Lobby file patterns
  const simulatedFiles: FileInfo[] = [
    {
      fileName: '2024-01-15_cvr_lobby_disclosure_cd.csv',
      fullPath: `${directory}/2024-01-15/2024-01-15_cvr_lobby_disclosure_cd.csv`,
      size: 1024000,
      created: '2024-01-15T09:00:00Z',
      modified: '2024-01-15T09:00:00Z',
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: '2024-01-15_cvr_registration_cd.csv',
      fullPath: `${directory}/2024-01-15/2024-01-15_cvr_registration_cd.csv`,
      size: 512000,
      created: '2024-01-15T09:01:00Z',
      modified: '2024-01-15T09:01:00Z',
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: '2024-01-15_lpay_cd.csv',
      fullPath: `${directory}/2024-01-15/2024-01-15_lpay_cd.csv`,
      size: 256000,
      created: '2024-01-15T09:02:00Z',
      modified: '2024-01-15T09:02:00Z',
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: 'clean_cvr_lobby_disclosure_cd.csv',
      fullPath: `${directory}/2024-01-15/clean_cvr_lobby_disclosure_cd.csv`,
      size: 1024000,
      created: '2024-01-15T10:00:00Z',
      modified: '2024-01-15T10:00:00Z',
      type: 'csv',
      isProcessable: false,
      excludeReason: 'Starts with "clean" prefix'
    },
    {
      fileName: 'project_metadata.csv',
      fullPath: `${directory}/2024-01-15/project_metadata.csv`,
      size: 64000,
      created: '2024-01-15T11:00:00Z',
      modified: '2024-01-15T11:00:00Z',
      type: 'csv',
      isProcessable: false,
      excludeReason: 'Starts with "project" prefix'
    }
  ]

  const processableFiles = simulatedFiles.filter(file => file.isProcessable)
  const excludedFiles = simulatedFiles.filter(file => !file.isProcessable)

  const response: FileSelectionResponse = {
    success: true,
    operation: 'list',
    files: simulatedFiles,
    processableFiles,
    excludedFiles,
    totalFiles: simulatedFiles.length,
    processableCount: processableFiles.length,
    excludedCount: excludedFiles.length,
    selectionCriteria: {
      directory,
      filePattern: pattern,
      excludePatterns: DEFAULT_EXCLUDE_PATTERNS,
      includeMetadata,
      sortBy: 'name',
      sortOrder: 'desc'
    },
    selectedAt: new Date().toISOString()
  }

  return NextResponse.json(response)
}

/**
 * Select files for processing (similar to fileselector.py main functionality)
 */
async function handleFileSelection(searchParams: URLSearchParams): Promise<NextResponse> {
  const directory = searchParams.get('directory') || 'downloads'
  const excludePatterns = searchParams.get('exclude')?.split(',') || DEFAULT_EXCLUDE_PATTERNS
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

  console.log(`🔍 Selecting files from ${directory}, excluding patterns: ${excludePatterns.join(', ')}`)

  // Simulate the file selection logic from fileselector.py
  // In the original Python: files_to_process = [f for f in all_files if not (os.path.basename(f).startswith("clean") or os.path.basename(f).startswith("project"))]

  const allFiles = await getAvailableFiles(directory)
  const selectedFiles = allFiles.filter(file => {
    const baseName = file.fileName.toLowerCase()
    return !excludePatterns.some(pattern => baseName.startsWith(pattern.toLowerCase()))
  })

  const limitedFiles = limit ? selectedFiles.slice(0, limit) : selectedFiles

  console.log(`📋 Selected ${limitedFiles.length} files for processing:`)
  limitedFiles.forEach(file => {
    console.log(`   - ${file.fileName}`)
  })

  const response: FileSelectionResponse = {
    success: true,
    operation: 'select',
    files: allFiles,
    processableFiles: limitedFiles,
    excludedFiles: allFiles.filter(file => !limitedFiles.includes(file)),
    totalFiles: allFiles.length,
    processableCount: limitedFiles.length,
    excludedCount: allFiles.length - limitedFiles.length,
    selectionCriteria: {
      directory,
      excludePatterns,
      limit,
      sortBy: 'name',
      sortOrder: 'desc'
    },
    selectedAt: new Date().toISOString()
  }

  return NextResponse.json(response)
}

/**
 * Scan BigQuery tables to see what's already uploaded
 */
async function handleTableScan(searchParams: URLSearchParams): Promise<NextResponse> {
  const datasetId = searchParams.get('dataset') || process.env.BIGQUERY_DATASET || 'ca_lobby'
  const projectId = searchParams.get('project') || process.env.GOOGLE_CLOUD_PROJECT_ID

  console.log(`🔍 Scanning BigQuery tables in ${projectId}.${datasetId}`)

  try {
    // Query to get all tables in the dataset
    const query = `
      SELECT
        table_name,
        table_type,
        creation_time,
        last_modified_time,
        row_count,
        size_bytes
      FROM \`${projectId}.${datasetId}.INFORMATION_SCHEMA.TABLES\`
      WHERE table_type = 'BASE TABLE'
      ORDER BY last_modified_time DESC
    `

    const result = await executeQuery({ query })

    if (!result.success) {
      throw new Error(result.error || 'Failed to scan tables')
    }

    const tables = result.data.map((table: any) => ({
      tableName: table.table_name,
      tableType: table.table_type,
      created: table.creation_time,
      lastModified: table.last_modified_time,
      rowCount: table.row_count,
      sizeBytes: table.size_bytes,
      correspondingFile: `${table.table_name}.csv`
    }))

    return NextResponse.json({
      success: true,
      operation: 'scan-tables',
      projectId,
      datasetId,
      tables,
      totalTables: tables.length,
      scannedAt: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        operation: 'scan-tables',
        error: error instanceof Error ? error.message : 'Unknown error',
        tables: [],
        totalTables: 0,
        scannedAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Check upload status for files
 */
async function handleUploadCheck(searchParams: URLSearchParams): Promise<NextResponse> {
  const fileNames = searchParams.get('files')?.split(',') || []

  if (fileNames.length === 0) {
    return NextResponse.json(
      { error: 'No file names provided for upload check' },
      { status: 400 }
    )
  }

  console.log(`🔍 Checking upload status for ${fileNames.length} files`)

  const uploadStatus = await Promise.all(
    fileNames.map(async (fileName) => {
      try {
        // Extract table name from file name (similar to upload_pipeline.py logic)
        const tableExtract = fileName
        const tableName = extractTableNameFromFile(tableExtract)
        const fullTableName = `${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${tableName}`

        // Check if table exists and get row count
        const query = `
          SELECT COUNT(*) as row_count
          FROM \`${fullTableName}\`
        `

        const result = await executeQuery({ query })

        return {
          fileName,
          tableName,
          uploaded: result.success,
          rowCount: result.success ? result.data[0]?.row_count || 0 : 0,
          lastChecked: new Date().toISOString(),
          error: result.success ? null : result.error
        }

      } catch (error) {
        return {
          fileName,
          tableName: extractTableNameFromFile(fileName),
          uploaded: false,
          rowCount: 0,
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })
  )

  return NextResponse.json({
    success: true,
    operation: 'check-uploads',
    uploadStatus,
    totalFiles: fileNames.length,
    uploadedFiles: uploadStatus.filter(status => status.uploaded).length,
    checkedAt: new Date().toISOString()
  })
}

/**
 * Handle batch file selection
 */
async function handleBatchSelection(body: any): Promise<NextResponse> {
  const { directories, criteria, operations } = body

  if (!Array.isArray(directories) || directories.length === 0) {
    return NextResponse.json(
      { error: 'Directories array is required' },
      { status: 400 }
    )
  }

  const batchResults = await Promise.all(
    directories.map(async (directory: string) => {
      const files = await getAvailableFiles(directory)
      const processableFiles = files.filter(file => file.isProcessable)

      return {
        directory,
        totalFiles: files.length,
        processableFiles: processableFiles.length,
        files: processableFiles
      }
    })
  )

  return NextResponse.json({
    success: true,
    operation: 'batch-select',
    batchResults,
    totalDirectories: directories.length,
    totalFiles: batchResults.reduce((sum, result) => sum + result.totalFiles, 0),
    totalProcessableFiles: batchResults.reduce((sum, result) => sum + result.processableFiles, 0),
    selectedAt: new Date().toISOString()
  })
}

/**
 * Handle file validation
 */
async function handleFileValidation(body: any): Promise<NextResponse> {
  const { files, validationRules } = body

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json(
      { error: 'Files array is required' },
      { status: 400 }
    )
  }

  const validationResults = files.map((file: any) => {
    const issues: string[] = []

    // Basic validation rules
    if (!file.fileName || typeof file.fileName !== 'string') {
      issues.push('Invalid or missing file name')
    }

    if (file.fileName && !file.fileName.endsWith('.csv') && !file.fileName.endsWith('.json')) {
      issues.push('Unsupported file format')
    }

    if (file.size && file.size > 100 * 1024 * 1024) { // 100MB limit
      issues.push('File size exceeds limit')
    }

    return {
      fileName: file.fileName,
      isValid: issues.length === 0,
      issues,
      validatedAt: new Date().toISOString()
    }
  })

  return NextResponse.json({
    success: true,
    operation: 'validate-files',
    validationResults,
    totalFiles: files.length,
    validFiles: validationResults.filter(result => result.isValid).length,
    invalidFiles: validationResults.filter(result => !result.isValid).length,
    validatedAt: new Date().toISOString()
  })
}

/**
 * Handle processing preparation
 */
async function handleProcessingPreparation(body: any): Promise<NextResponse> {
  const { files, processingOptions } = body

  const preparationResults = files.map((file: any) => {
    const tableName = extractTableNameFromFile(file.fileName)
    const fullTableName = `${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${tableName}`

    return {
      fileName: file.fileName,
      tableName,
      fullTableName,
      processingOrder: files.indexOf(file) + 1,
      estimatedProcessingTime: Math.ceil(file.size / 1024 / 1024) * 2, // 2 seconds per MB estimate
      ready: true
    }
  })

  return NextResponse.json({
    success: true,
    operation: 'prepare-processing',
    preparationResults,
    totalFiles: files.length,
    estimatedTotalTime: preparationResults.reduce((sum, result) => sum + result.estimatedProcessingTime, 0),
    preparedAt: new Date().toISOString()
  })
}

// Helper functions

/**
 * Get available files (simulates file system scanning)
 */
async function getAvailableFiles(directory: string): Promise<FileInfo[]> {
  // In production, this would scan actual file system or cloud storage
  // For now, return simulated file list based on common CA Lobby patterns
  const simulatedFiles: FileInfo[] = [
    {
      fileName: 'cvr_lobby_disclosure_cd.csv',
      fullPath: `${directory}/cvr_lobby_disclosure_cd.csv`,
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: 'cvr_registration_cd.csv',
      fullPath: `${directory}/cvr_registration_cd.csv`,
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: 'lpay_cd.csv',
      fullPath: `${directory}/lpay_cd.csv`,
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: 'latt_cd.csv',
      fullPath: `${directory}/latt_cd.csv`,
      type: 'csv',
      isProcessable: true
    },
    {
      fileName: 'clean_data.csv',
      fullPath: `${directory}/clean_data.csv`,
      type: 'csv',
      isProcessable: false,
      excludeReason: 'Starts with "clean" prefix'
    },
    {
      fileName: 'project_summary.csv',
      fullPath: `${directory}/project_summary.csv`,
      type: 'csv',
      isProcessable: false,
      excludeReason: 'Starts with "project" prefix'
    }
  ]

  return simulatedFiles
}

/**
 * Extract table name from file name (similar to upload_pipeline.py logic)
 */
function extractTableNameFromFile(fileName: string): string {
  // Remove file extension
  const baseName = fileName.replace(/\.[^/.]+$/, "")

  // Remove date prefix if present (e.g., "2024-01-01_" pattern)
  const datePattern = /^\d{4}-\d{2}-\d{2}_/
  const nameWithoutDate = baseName.replace(datePattern, '')

  // Split by underscore and get everything after the first part if it looks like a prefix
  const parts = nameWithoutDate.split('_')
  if (parts.length > 1) {
    return parts.slice(1).join('_')
  }

  return nameWithoutDate
}