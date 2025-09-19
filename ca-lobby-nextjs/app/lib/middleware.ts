/**
 * API Middleware Utilities for CA Lobby Next.js Application
 *
 * This module provides middleware functions for error handling,
 * logging, validation, and request processing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { APIError, ErrorResponseFormatter, RateLimiter } from './validation'

export type MiddlewareHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse | null>

export interface RequestContext {
  startTime: number
  requestId: string
  userAgent?: string
  ipAddress?: string
  userId?: string
  permissions?: string[]
}

export interface LogEntry {
  timestamp: string
  requestId: string
  method: string
  url: string
  statusCode: number
  duration: number
  userAgent?: string
  ipAddress?: string
  userId?: string
  error?: string
  responseSize?: number
}

/**
 * Request logging middleware
 */
export class RequestLogger {
  private static logs: LogEntry[] = []
  private static readonly MAX_LOGS = 1000

  static createMiddleware(): MiddlewareHandler {
    return async (request: NextRequest) => {
      const startTime = Date.now()
      const requestId = generateRequestId()

      // Add request context
      const context: RequestContext = {
        startTime,
        requestId,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: getClientIP(request)
      }

      // Store context in request headers for downstream handlers
      const headers = new Headers(request.headers)
      headers.set('x-request-id', requestId)
      headers.set('x-start-time', startTime.toString())

      // Create new request with context
      const modifiedRequest = new NextRequest(request.url, {
        method: request.method,
        headers,
        body: request.body
      })

      // Log request start
      console.log(`🚀 ${request.method} ${request.url} [${requestId}] started`)

      return null // Continue to next middleware
    }
  }

  static logResponse(
    request: NextRequest,
    response: NextResponse,
    error?: Error
  ): void {
    const requestId = request.headers.get('x-request-id') || 'unknown'
    const startTime = parseInt(request.headers.get('x-start-time') || '0')
    const duration = Date.now() - startTime

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: request.method,
      url: request.url,
      statusCode: response.status,
      duration,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: getClientIP(request),
      error: error?.message,
      responseSize: getResponseSize(response)
    }

    // Add to in-memory logs (in production, send to logging service)
    this.logs.push(logEntry)
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift() // Remove oldest log
    }

    // Console logging
    const statusColor = response.status >= 400 ? '❌' : response.status >= 300 ? '⚠️' : '✅'
    console.log(
      `${statusColor} ${request.method} ${request.url} [${requestId}] - ${response.status} (${duration}ms)`
    )

    if (error) {
      console.error(`🚨 Error in ${request.method} ${request.url} [${requestId}]:`, error)
    }
  }

  static getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit)
  }

  static getErrorLogs(limit: number = 50): LogEntry[] {
    return this.logs
      .filter(log => log.statusCode >= 400 || log.error)
      .slice(-limit)
  }
}

/**
 * Rate limiting middleware
 */
export class RateLimitMiddleware {
  static createMiddleware(options: {
    maxRequests?: number
    windowMs?: number
    skipSuccessfulRequests?: boolean
    keyGenerator?: (request: NextRequest) => string
  } = {}): MiddlewareHandler {
    const {
      maxRequests = 100,
      windowMs = 60000,
      skipSuccessfulRequests = false,
      keyGenerator = (req) => getClientIP(req) || 'unknown'
    } = options

    return async (request: NextRequest) => {
      const identifier = keyGenerator(request)
      const rateLimit = RateLimiter.checkRateLimit(identifier, maxRequests, windowMs)

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': rateLimit.remaining.toString(),
              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
            }
          }
        )
      }

      // Add rate limit headers to the response
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
      response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString())

      return null // Continue to next middleware
    }
  }
}

/**
 * Error handling middleware
 */
export class ErrorHandler {
  static createMiddleware(): MiddlewareHandler {
    return async (request: NextRequest) => {
      // This middleware doesn't process the request directly
      // Instead, it provides error handling utilities
      return null
    }
  }

  static handleError(error: unknown, request: NextRequest): NextResponse {
    console.error('🚨 Unhandled API error:', error)

    if (error instanceof APIError) {
      const response = ErrorResponseFormatter.formatAPIError(error)
      return NextResponse.json(response, { status: error.statusCode })
    }

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('permission')) {
        return NextResponse.json(
          {
            error: 'Insufficient permissions',
            code: 'PERMISSION_DENIED',
            timestamp: new Date().toISOString()
          },
          { status: 403 }
        )
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'Resource not found',
            code: 'NOT_FOUND',
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        )
      }

      if (error.message.includes('timeout')) {
        return NextResponse.json(
          {
            error: 'Request timeout',
            code: 'TIMEOUT',
            timestamp: new Date().toISOString()
          },
          { status: 408 }
        )
      }
    }

    // Generic error response
    const response = ErrorResponseFormatter.formatGenericError(error)
    return NextResponse.json(response, { status: 500 })
  }
}

/**
 * CORS middleware
 */
export class CORSMiddleware {
  static createMiddleware(options: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}): MiddlewareHandler {
    const {
      origin = '*',
      methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials = false
    } = options

    return async (request: NextRequest) => {
      const response = NextResponse.next()

      // Set CORS headers
      if (Array.isArray(origin)) {
        const requestOrigin = request.headers.get('origin')
        if (requestOrigin && origin.includes(requestOrigin)) {
          response.headers.set('Access-Control-Allow-Origin', requestOrigin)
        }
      } else {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }

      response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
      response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))

      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200, headers: response.headers })
      }

      return null // Continue to next middleware
    }
  }
}

/**
 * Request validation middleware
 */
export class ValidationMiddleware {
  static createBodySizeMiddleware(maxSize: number = 10 * 1024 * 1024): MiddlewareHandler {
    return async (request: NextRequest) => {
      const contentLength = request.headers.get('content-length')

      if (contentLength && parseInt(contentLength) > maxSize) {
        return NextResponse.json(
          {
            error: 'Request body too large',
            code: 'BODY_TOO_LARGE',
            maxSize: `${Math.floor(maxSize / 1024 / 1024)}MB`,
            timestamp: new Date().toISOString()
          },
          { status: 413 }
        )
      }

      return null // Continue to next middleware
    }
  }

  static createContentTypeMiddleware(allowedTypes: string[] = ['application/json']): MiddlewareHandler {
    return async (request: NextRequest) => {
      if (request.method === 'GET' || request.method === 'DELETE') {
        return null // Skip content type validation for GET and DELETE
      }

      const contentType = request.headers.get('content-type')

      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        return NextResponse.json(
          {
            error: 'Invalid content type',
            code: 'INVALID_CONTENT_TYPE',
            allowedTypes,
            timestamp: new Date().toISOString()
          },
          { status: 415 }
        )
      }

      return null // Continue to next middleware
    }
  }
}

/**
 * Security middleware
 */
export class SecurityMiddleware {
  static createSecurityHeadersMiddleware(): MiddlewareHandler {
    return async (request: NextRequest) => {
      const response = NextResponse.next()

      // Security headers
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      )

      return null // Continue to next middleware
    }
  }

  static createAPIKeyValidationMiddleware(requiredHeader: string = 'x-api-key'): MiddlewareHandler {
    return async (request: NextRequest) => {
      const apiKey = request.headers.get(requiredHeader)

      if (!apiKey) {
        return NextResponse.json(
          {
            error: 'API key required',
            code: 'API_KEY_REQUIRED',
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        )
      }

      // In production, validate against stored API keys
      const validApiKeys = process.env.VALID_API_KEYS?.split(',') || []

      if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
        return NextResponse.json(
          {
            error: 'Invalid API key',
            code: 'INVALID_API_KEY',
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        )
      }

      return null // Continue to next middleware
    }
  }
}

/**
 * Middleware composer for chaining multiple middleware functions
 */
export class MiddlewareComposer {
  private middlewares: MiddlewareHandler[] = []

  add(middleware: MiddlewareHandler): this {
    this.middlewares.push(middleware)
    return this
  }

  async execute(request: NextRequest, context?: any): Promise<NextResponse> {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware(request, context)
        if (result) {
          // Middleware returned a response, stop processing
          return result
        }
      } catch (error) {
        // Handle middleware errors
        return ErrorHandler.handleError(error, request)
      }
    }

    // All middleware passed, continue to the actual handler
    return NextResponse.next()
  }
}

// Utility functions

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = request.headers.get('cf-connecting-ip') // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (clientIP) {
    return clientIP
  }

  return request.ip || 'unknown'
}

function getResponseSize(response: NextResponse): number | undefined {
  const contentLength = response.headers.get('content-length')
  return contentLength ? parseInt(contentLength) : undefined
}

// Pre-configured middleware combinations for common use cases

export const createStandardAPIMiddleware = () =>
  new MiddlewareComposer()
    .add(RequestLogger.createMiddleware())
    .add(SecurityMiddleware.createSecurityHeadersMiddleware())
    .add(CORSMiddleware.createMiddleware())
    .add(RateLimitMiddleware.createMiddleware())
    .add(ValidationMiddleware.createBodySizeMiddleware())

export const createSecureAPIMiddleware = () =>
  new MiddlewareComposer()
    .add(RequestLogger.createMiddleware())
    .add(SecurityMiddleware.createSecurityHeadersMiddleware())
    .add(SecurityMiddleware.createAPIKeyValidationMiddleware())
    .add(CORSMiddleware.createMiddleware({ origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'] }))
    .add(RateLimitMiddleware.createMiddleware({ maxRequests: 50, windowMs: 60000 }))
    .add(ValidationMiddleware.createBodySizeMiddleware())

export const createPublicAPIMiddleware = () =>
  new MiddlewareComposer()
    .add(RequestLogger.createMiddleware())
    .add(SecurityMiddleware.createSecurityHeadersMiddleware())
    .add(CORSMiddleware.createMiddleware())
    .add(RateLimitMiddleware.createMiddleware({ maxRequests: 200, windowMs: 60000 }))
    .add(ValidationMiddleware.createBodySizeMiddleware(50 * 1024 * 1024)) // 50MB for file uploads