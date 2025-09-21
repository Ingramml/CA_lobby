import { NextRequest, NextResponse } from 'next/server'
import { uploadToBigQuery } from '@/lib/bigquery-client'

export const dynamic = 'force-dynamic'
import { withPermissions, createApiResponse, withAuditLog, combineMiddleware } from '../../../../lib/api-auth'
import { PERMISSIONS } from '../../../../lib/auth'
import { csvToJson } from '@/lib/utils'

async function handleUpload(request: NextRequest) {
  try {

    const formData = await request.formData()
    const file = formData.get('file') as File
    const tableName = formData.get('tableName') as string
    const writeDisposition = (formData.get('writeDisposition') as string) || 'WRITE_APPEND'

    // Validate required fields
    if (!file) {
      return createApiResponse(
        false,
        null,
        'File is required',
        'Please provide a file to upload',
        400
      )
    }

    if (!tableName) {
      return createApiResponse(
        false,
        null,
        'Table name is required',
        'Please provide a table name',
        400
      )
    }

    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only CSV and JSON files are supported' },
        { status: 400 }
      )
    }

    // Validate write disposition
    const validDispositions = ['WRITE_TRUNCATE', 'WRITE_APPEND', 'WRITE_EMPTY']
    if (!validDispositions.includes(writeDisposition)) {
      return NextResponse.json(
        { error: 'Invalid write disposition' },
        { status: 400 }
      )
    }

    // Read and parse file content
    const fileContent = await file.text()
    let data: any[]

    try {
      if (file.name.endsWith('.csv')) {
        data = csvToJson(fileContent)
      } else {
        data = JSON.parse(fileContent)
      }

      if (!Array.isArray(data)) {
        return NextResponse.json(
          { error: 'File must contain an array of objects' },
          { status: 400 }
        )
      }

      if (data.length === 0) {
        return NextResponse.json(
          { error: 'File contains no data' },
          { status: 400 }
        )
      }

    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse file content' },
        { status: 400 }
      )
    }

    // Generate schema from first row
    const firstRow = data[0]
    const schema = Object.keys(firstRow).map(key => {
      const value = firstRow[key]
      let type = 'STRING' // default type

      if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'INTEGER' : 'FLOAT'
      } else if (typeof value === 'boolean') {
        type = 'BOOLEAN'
      } else if (value && typeof value === 'string') {
        // Try to detect date/timestamp patterns
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        const timestampRegex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/

        if (timestampRegex.test(value)) {
          type = 'TIMESTAMP'
        } else if (dateRegex.test(value)) {
          type = 'DATE'
        }
      }

      return {
        name: key,
        type,
        mode: 'NULLABLE'
      }
    })

    // Upload to BigQuery
    const result = await uploadToBigQuery({
      tableName,
      data,
      schema,
      writeDisposition: writeDisposition as 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY'
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return createApiResponse(true, {
      message: result.message,
      tableName,
      rowsUploaded: result.rowCount,
      schema,
      uploadedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return createApiResponse(
      false,
      null,
      'Upload failed',
      'An error occurred while uploading data to BigQuery',
      500
    )
  }
}

// Apply authentication and permission checking
const protectedUpload = combineMiddleware(
  withPermissions([PERMISSIONS.UPLOAD_DATA]),
  withAuditLog
)

export const POST = protectedUpload(handleUpload)

// GET method to check upload status or list recent uploads
export async function GET(request: NextRequest) {
  try {
    await requirePermission('bigquery:read')

    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    switch (operation) {
      case 'recent':
        // Return recent upload history (this would typically come from a logging table)
        return NextResponse.json({
          success: true,
          recentUploads: [
            // This would be fetched from a logs table in a real implementation
            {
              id: '1',
              tableName: 'lobbying_activities',
              fileName: 'activities_2024.csv',
              rowCount: 1500,
              uploadedAt: new Date().toISOString(),
              status: 'completed'
            }
          ]
        })

      default:
        return NextResponse.json({
          success: true,
          message: 'Upload API ready',
          supportedFormats: ['CSV', 'JSON'],
          maxFileSize: '10MB',
          writeDispositions: ['WRITE_APPEND', 'WRITE_TRUNCATE', 'WRITE_EMPTY']
        })
    }

  } catch (error) {
    console.error('Upload GET API error:', error)

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