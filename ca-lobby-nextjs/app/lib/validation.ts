/**
 * Comprehensive Validation and Error Handling for CA Lobby API
 *
 * This module provides validation schemas, error handling utilities,
 * and input sanitization for all API endpoints.
 */

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ValidationResult<T = any> {
  isValid: boolean
  data?: T
  errors: ValidationError[]
  warnings?: string[]
}

export class APIError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: string

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  timestamp: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  filename: /^[a-zA-Z0-9._-]+$/,
  tableName: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  projectId: /^[a-z][a-z0-9-]*[a-z0-9]$/,
  sqlQuery: /^\s*(SELECT|WITH)\s+/i
} as const

/**
 * Base validator class
 */
export abstract class BaseValidator<T> {
  abstract validate(data: any): ValidationResult<T>

  protected createError(field: string, message: string, code: string, value?: any): ValidationError {
    return { field, message, code, value }
  }

  protected isRequired(value: any, field: string): ValidationError | null {
    if (value === undefined || value === null || value === '') {
      return this.createError(field, `${field} is required`, 'REQUIRED_FIELD', value)
    }
    return null
  }

  protected isString(value: any, field: string, options?: { minLength?: number; maxLength?: number; pattern?: RegExp }): ValidationError | null {
    if (typeof value !== 'string') {
      return this.createError(field, `${field} must be a string`, 'INVALID_TYPE', value)
    }

    if (options?.minLength && value.length < options.minLength) {
      return this.createError(field, `${field} must be at least ${options.minLength} characters`, 'MIN_LENGTH', value)
    }

    if (options?.maxLength && value.length > options.maxLength) {
      return this.createError(field, `${field} must be at most ${options.maxLength} characters`, 'MAX_LENGTH', value)
    }

    if (options?.pattern && !options.pattern.test(value)) {
      return this.createError(field, `${field} format is invalid`, 'INVALID_FORMAT', value)
    }

    return null
  }

  protected isNumber(value: any, field: string, options?: { min?: number; max?: number; integer?: boolean }): ValidationError | null {
    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError(field, `${field} must be a number`, 'INVALID_TYPE', value)
    }

    if (options?.integer && !Number.isInteger(value)) {
      return this.createError(field, `${field} must be an integer`, 'INVALID_TYPE', value)
    }

    if (options?.min !== undefined && value < options.min) {
      return this.createError(field, `${field} must be at least ${options.min}`, 'MIN_VALUE', value)
    }

    if (options?.max !== undefined && value > options.max) {
      return this.createError(field, `${field} must be at most ${options.max}`, 'MAX_VALUE', value)
    }

    return null
  }

  protected isArray(value: any, field: string, options?: { minLength?: number; maxLength?: number; itemValidator?: (item: any, index: number) => ValidationError | null }): ValidationError[] {
    const errors: ValidationError[] = []

    if (!Array.isArray(value)) {
      errors.push(this.createError(field, `${field} must be an array`, 'INVALID_TYPE', value))
      return errors
    }

    if (options?.minLength && value.length < options.minLength) {
      errors.push(this.createError(field, `${field} must have at least ${options.minLength} items`, 'MIN_LENGTH', value))
    }

    if (options?.maxLength && value.length > options.maxLength) {
      errors.push(this.createError(field, `${field} must have at most ${options.maxLength} items`, 'MAX_LENGTH', value))
    }

    if (options?.itemValidator) {
      value.forEach((item, index) => {
        const itemError = options.itemValidator!(item, index)
        if (itemError) {
          errors.push({
            ...itemError,
            field: `${field}[${index}].${itemError.field}`
          })
        }
      })
    }

    return errors
  }

  protected isEnum<T extends string>(value: any, field: string, enumValues: readonly T[]): ValidationError | null {
    if (!enumValues.includes(value)) {
      return this.createError(field, `${field} must be one of: ${enumValues.join(', ')}`, 'INVALID_ENUM', value)
    }
    return null
  }
}

/**
 * File validation
 */
export class FileValidator extends BaseValidator<File> {
  validate(data: any): ValidationResult<File> {
    const errors: ValidationError[] = []

    // Check if it's a File object
    if (!(data instanceof File)) {
      errors.push(this.createError('file', 'Must be a valid file', 'INVALID_TYPE', data))
      return { isValid: false, errors }
    }

    // File name validation
    const nameError = this.isString(data.name, 'fileName', {
      minLength: 1,
      maxLength: 255,
      pattern: ValidationPatterns.filename
    })
    if (nameError) errors.push(nameError)

    // File size validation (100MB limit)
    const sizeError = this.isNumber(data.size, 'fileSize', { min: 1, max: 100 * 1024 * 1024 })
    if (sizeError) errors.push(sizeError)

    // File type validation
    const allowedTypes = ['text/csv', 'application/json', 'text/plain']
    if (!allowedTypes.includes(data.type) && !data.name.endsWith('.csv') && !data.name.endsWith('.json')) {
      errors.push(this.createError('fileType', 'File must be CSV or JSON format', 'INVALID_FILE_TYPE', data.type))
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? data : undefined,
      errors
    }
  }
}

/**
 * Query validation
 */
export class QueryValidator extends BaseValidator<{ query: string; parameters?: Record<string, any> }> {
  validate(data: any): ValidationResult<{ query: string; parameters?: Record<string, any> }> {
    const errors: ValidationError[] = []

    // Query validation
    const queryError = this.isRequired(data.query, 'query')
    if (queryError) {
      errors.push(queryError)
    } else {
      const queryStringError = this.isString(data.query, 'query', {
        minLength: 10,
        maxLength: 10000,
        pattern: ValidationPatterns.sqlQuery
      })
      if (queryStringError) errors.push(queryStringError)

      // SQL injection protection
      const dangerousPatterns = [
        /\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE)\b/i,
        /--/,
        /\/\*/,
        /\*\//,
        /;.*$/m
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(data.query)) {
          errors.push(this.createError('query', 'Query contains potentially dangerous SQL operations', 'DANGEROUS_SQL', data.query))
          break
        }
      }
    }

    // Parameters validation (optional)
    if (data.parameters !== undefined) {
      if (typeof data.parameters !== 'object' || Array.isArray(data.parameters)) {
        errors.push(this.createError('parameters', 'Parameters must be an object', 'INVALID_TYPE', data.parameters))
      }
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? { query: data.query, parameters: data.parameters } : undefined,
      errors
    }
  }
}

/**
 * Table validation
 */
export class TableValidator extends BaseValidator<{ tableName: string; projectId?: string; datasetId?: string }> {
  validate(data: any): ValidationResult<{ tableName: string; projectId?: string; datasetId?: string }> {
    const errors: ValidationError[] = []

    // Table name validation
    const tableNameError = this.isRequired(data.tableName, 'tableName')
    if (tableNameError) {
      errors.push(tableNameError)
    } else {
      const tableNameStringError = this.isString(data.tableName, 'tableName', {
        minLength: 1,
        maxLength: 64,
        pattern: ValidationPatterns.tableName
      })
      if (tableNameStringError) errors.push(tableNameStringError)
    }

    // Project ID validation (optional)
    if (data.projectId !== undefined) {
      const projectIdError = this.isString(data.projectId, 'projectId', {
        minLength: 1,
        maxLength: 64,
        pattern: ValidationPatterns.projectId
      })
      if (projectIdError) errors.push(projectIdError)
    }

    // Dataset ID validation (optional)
    if (data.datasetId !== undefined) {
      const datasetIdError = this.isString(data.datasetId, 'datasetId', {
        minLength: 1,
        maxLength: 64,
        pattern: ValidationPatterns.tableName
      })
      if (datasetIdError) errors.push(datasetIdError)
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? {
        tableName: data.tableName,
        projectId: data.projectId,
        datasetId: data.datasetId
      } : undefined,
      errors
    }
  }
}

/**
 * Upload options validation
 */
export class UploadOptionsValidator extends BaseValidator<{
  writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY'
  batchSize?: number
  validateData?: boolean
}> {
  validate(data: any): ValidationResult<{
    writeDisposition?: 'WRITE_TRUNCATE' | 'WRITE_APPEND' | 'WRITE_EMPTY'
    batchSize?: number
    validateData?: boolean
  }> {
    const errors: ValidationError[] = []

    // Write disposition validation (optional)
    if (data.writeDisposition !== undefined) {
      const dispositionError = this.isEnum(data.writeDisposition, 'writeDisposition',
        ['WRITE_TRUNCATE', 'WRITE_APPEND', 'WRITE_EMPTY'] as const)
      if (dispositionError) errors.push(dispositionError)
    }

    // Batch size validation (optional)
    if (data.batchSize !== undefined) {
      const batchSizeError = this.isNumber(data.batchSize, 'batchSize', {
        min: 1,
        max: 10000,
        integer: true
      })
      if (batchSizeError) errors.push(batchSizeError)
    }

    // Validate data flag (optional)
    if (data.validateData !== undefined && typeof data.validateData !== 'boolean') {
      errors.push(this.createError('validateData', 'validateData must be a boolean', 'INVALID_TYPE', data.validateData))
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? {
        writeDisposition: data.writeDisposition,
        batchSize: data.batchSize,
        validateData: data.validateData
      } : undefined,
      errors
    }
  }
}

/**
 * Pagination validation
 */
export class PaginationValidator extends BaseValidator<{ page?: number; limit?: number; offset?: number }> {
  validate(data: any): ValidationResult<{ page?: number; limit?: number; offset?: number }> {
    const errors: ValidationError[] = []

    // Page validation (optional)
    if (data.page !== undefined) {
      const pageError = this.isNumber(data.page, 'page', { min: 1, max: 10000, integer: true })
      if (pageError) errors.push(pageError)
    }

    // Limit validation (optional)
    if (data.limit !== undefined) {
      const limitError = this.isNumber(data.limit, 'limit', { min: 1, max: 10000, integer: true })
      if (limitError) errors.push(limitError)
    }

    // Offset validation (optional)
    if (data.offset !== undefined) {
      const offsetError = this.isNumber(data.offset, 'offset', { min: 0, max: 100000, integer: true })
      if (offsetError) errors.push(offsetError)
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? {
        page: data.page,
        limit: data.limit,
        offset: data.offset
      } : undefined,
      errors
    }
  }
}

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .substring(0, 1000) // Limit length
  }

  /**
   * Sanitize SQL query
   */
  static sanitizeQuery(query: string): string {
    return query
      .trim()
      .replace(/--.*$/gm, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/;\s*$/g, '') // Remove trailing semicolon
      .substring(0, 10000) // Limit length
  }

  /**
   * Sanitize file name
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
      .substring(0, 255) // Limit length
  }

  /**
   * Sanitize table name
   */
  static sanitizeTableName(tableName: string): string {
    return tableName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_') // Only allow alphanumeric and underscore
      .replace(/^[^a-z_]/, '_') // Ensure starts with letter or underscore
      .substring(0, 64) // Limit length
  }
}

/**
 * Error response formatter
 */
export class ErrorResponseFormatter {
  static formatValidationErrors(errors: ValidationError[]): {
    error: string
    code: string
    details: {
      invalidFields: ValidationError[]
      totalErrors: number
    }
  } {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: {
        invalidFields: errors,
        totalErrors: errors.length
      }
    }
  }

  static formatAPIError(error: APIError): {
    error: string
    code: string
    statusCode: number
    timestamp: string
    details?: any
  } {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      ...(error.details && { details: error.details })
    }
  }

  static formatGenericError(error: Error | unknown): {
    error: string
    code: string
    timestamp: string
  } {
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime <= now) {
        this.requests.delete(key)
      }
    }

    const current = this.requests.get(identifier)

    if (!current || current.resetTime <= now) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    current.count++
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
}

// Export validator instances for convenience
export const fileValidator = new FileValidator()
export const queryValidator = new QueryValidator()
export const tableValidator = new TableValidator()
export const uploadOptionsValidator = new UploadOptionsValidator()
export const paginationValidator = new PaginationValidator()