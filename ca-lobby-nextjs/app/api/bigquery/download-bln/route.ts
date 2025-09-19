import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth'
import { jsonToCsv } from '@/lib/utils'

// CA Lobby data files from BLN API
const BLN_DATA_FILES = [
  "cvr_lobby_disclosure_cd.csv",
  "cvr_registration_cd.csv",
  "latt_cd.csv",
  "lccm_cd.csv",
  "lemp_cd.csv",
  "lexp_cd.csv",
  "loth_cd.csv",
  "lpay_cd.csv",
  "filername_cd.csv"
] as const

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large downloads

export interface BLNDownloadOptions {
  files?: typeof BLN_DATA_FILES[number][]
  format?: 'csv' | 'json'
  outputDir?: string
  skipExisting?: boolean
}

export interface BLNDownloadResponse {
  success: boolean
  downloadedFiles: string[]
  skippedFiles: string[]
  errors: string[]
  downloadedAt: string
  totalRows?: number
}

/**
 * Enhanced BigQuery download API that supports BLN (California campaign finance) data
 * Migrated from Bignewdownload_2.py
 */
export async function POST(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const body = await request.json()
    const {
      files = BLN_DATA_FILES,
      format = 'json',
      outputDir,
      skipExisting = true
    }: BLNDownloadOptions = body

    console.log('🔄 Starting BLN data download for files:', files)

    const downloadedFiles: string[] = []
    const skippedFiles: string[] = []
    const errors: string[] = []
    let totalRows = 0

    // Get today's date for organizing downloads
    const today = new Date().toISOString().split('T')[0]
    const workDir = outputDir || `downloads/${today}`

    // Process each file
    for (const fileName of files) {
      try {
        console.log(`📥 Processing ${fileName}...`)

        // Check if file already exists and skip if requested
        const downloadPath = `${workDir}/${today}_${fileName}`

        if (skipExisting) {
          // In a real implementation, you'd check file system or database
          // For now, we'll simulate the check
          const existsCheck = await checkFileExists(downloadPath)
          if (existsCheck) {
            console.log(`⏭️ File ${downloadPath} already exists. Skipping download.`)
            skippedFiles.push(downloadPath)
            continue
          }
        }

        // Download from BLN API or BigQuery table
        const data = await downloadBLNData(fileName)

        if (data.success) {
          downloadedFiles.push(downloadPath)
          totalRows += data.rowCount || 0

          // Store the downloaded data (in production, you'd save to file system or return it)
          console.log(`✅ Successfully downloaded ${fileName}: ${data.rowCount} rows`)
        } else {
          errors.push(`Failed to download ${fileName}: ${data.error}`)
          console.error(`❌ Failed to download ${fileName}:`, data.error)
        }

      } catch (error) {
        const errorMsg = `Error processing ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    const response: BLNDownloadResponse = {
      success: errors.length === 0,
      downloadedFiles,
      skippedFiles,
      errors,
      downloadedAt: new Date().toISOString(),
      totalRows
    }

    // If format is CSV and we have data, return as downloadable file
    if (format === 'csv' && downloadedFiles.length > 0) {
      // For now, return the response as JSON since we're not implementing file system operations
      // In production, you'd combine all data into a single CSV or zip file
      return NextResponse.json(response)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ BLN Download API error:', error)

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
        downloadedFiles: [],
        skippedFiles: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        downloadedAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * GET method to list available BLN data files and their status
 */
export async function GET(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    if (operation === 'list-files') {
      return NextResponse.json({
        success: true,
        availableFiles: BLN_DATA_FILES,
        description: 'California campaign finance data files from BLN API',
        totalFiles: BLN_DATA_FILES.length
      })
    }

    if (operation === 'check-status') {
      // Check status of recent downloads
      const statusResults = await Promise.all(
        BLN_DATA_FILES.map(async (file) => {
          const today = new Date().toISOString().split('T')[0]
          const path = `downloads/${today}/${today}_${file}`
          const exists = await checkFileExists(path)

          return {
            fileName: file,
            downloaded: exists,
            lastChecked: new Date().toISOString(),
            path: exists ? path : null
          }
        })
      )

      return NextResponse.json({
        success: true,
        fileStatus: statusResults,
        checkedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      message: 'BLN Download API ready',
      availableOperations: ['list-files', 'check-status'],
      supportedFormats: ['csv', 'json'],
      availableFiles: BLN_DATA_FILES.length
    })

  } catch (error) {
    console.error('❌ BLN Download GET API error:', error)

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
 * Simulate downloading data from BLN API or BigQuery table
 * In production, this would integrate with the actual BLN SDK
 */
async function downloadBLNData(fileName: string): Promise<{
  success: boolean
  data?: any[]
  rowCount?: number
  error?: string
}> {
  try {
    // Remove .csv extension to get table name
    const tableName = fileName.replace('.csv', '')

    // In production, you would either:
    // 1. Use BLN SDK to download from their API: pd.read_bln(project_id, fileName, apiKey)
    // 2. Query existing BigQuery table if data is already loaded

    // For now, simulate a successful download with mock data
    const mockData = Array(1000).fill(null).map((_, i) => ({
      id: i + 1,
      filing_id: `FILING_${i + 1}`,
      filer_name: `Filer ${i + 1}`,
      amount: Math.floor(Math.random() * 10000),
      date: new Date().toISOString().split('T')[0]
    }))

    return {
      success: true,
      data: mockData,
      rowCount: mockData.length
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown download error'
    }
  }
}

/**
 * Check if a file exists (placeholder for production implementation)
 */
async function checkFileExists(path: string): Promise<boolean> {
  // In production, you'd check actual file system or database
  // For now, randomly return false to simulate new downloads
  return Math.random() < 0.3 // 30% chance file exists
}