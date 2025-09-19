import { auth } from '@clerk/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRole, hasPermission, Permission, UserRole, getCurrentUser } from './auth'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success,
      data: data as T,
      error,
      message,
    },
    { status }
  )
}

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth<T = any>(
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest, context: any) => {
    try {
      const { userId } = auth()

      if (!userId) {
        return createApiResponse(
          false,
          null,
          'Authentication required',
          'Please sign in to access this resource',
          401
        )
      }

      // Add user ID to context for the handler
      const enhancedContext = {
        ...context,
        userId,
      }

      return await handler(req, enhancedContext)
    } catch (error) {
      console.error('API Authentication Error:', error)
      return createApiResponse(
        false,
        null,
        'Authentication failed',
        'An error occurred while verifying authentication',
        500
      )
    }
  }
}

/**
 * Wrapper for API routes that require specific permissions
 */
export function withPermissions<T = any>(
  requiredPermissions: Permission[],
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>,
  requireAll: boolean = false
) {
  return withAuth(async (req: NextRequest, context: any) => {
    try {
      const user = await getCurrentUser()

      if (!user) {
        return createApiResponse(
          false,
          null,
          'User not found',
          'Unable to verify user permissions',
          403
        )
      }

      // Check permissions
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every(permission => hasPermission(user, permission))
        : requiredPermissions.some(permission => hasPermission(user, permission))

      if (!hasRequiredPermissions) {
        const userRole = getUserRole(user)
        return createApiResponse(
          false,
          null,
          'Insufficient permissions',
          `Your role (${userRole}) does not have the required permissions to access this resource`,
          403
        )
      }

      // Add user to context for the handler
      const enhancedContext = {
        ...context,
        user,
        userId: user.id,
      }

      return await handler(req, enhancedContext)
    } catch (error) {
      console.error('API Permission Check Error:', error)
      return createApiResponse(
        false,
        null,
        'Permission check failed',
        'An error occurred while verifying permissions',
        500
      )
    }
  })
}

/**
 * Wrapper for API routes that require specific roles
 */
export function withRoles<T = any>(
  requiredRoles: UserRole[],
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withAuth(async (req: NextRequest, context: any) => {
    try {
      const user = await getCurrentUser()

      if (!user) {
        return createApiResponse(
          false,
          null,
          'User not found',
          'Unable to verify user role',
          403
        )
      }

      const userRole = getUserRole(user)

      if (!requiredRoles.includes(userRole)) {
        return createApiResponse(
          false,
          null,
          'Insufficient role',
          `Your role (${userRole}) is not authorized to access this resource. Required: ${requiredRoles.join(' or ')}`,
          403
        )
      }

      // Add user to context for the handler
      const enhancedContext = {
        ...context,
        user,
        userId: user.id,
        userRole,
      }

      return await handler(req, enhancedContext)
    } catch (error) {
      console.error('API Role Check Error:', error)
      return createApiResponse(
        false,
        null,
        'Role check failed',
        'An error occurred while verifying role',
        500
      )
    }
  })
}

/**
 * Admin-only API route wrapper
 */
export function withAdminOnly<T = any>(
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withRoles(['admin'], handler)
}

/**
 * Data manager or admin API route wrapper
 */
export function withDataManagerOrAdmin<T = any>(
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withRoles(['admin', 'data_manager'], handler)
}

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit<T = any>(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest, context: any) => {
    try {
      const { userId } = auth()
      const identifier = userId || req.ip || 'anonymous'

      const now = Date.now()
      const userRateLimit = rateLimitMap.get(identifier)

      if (userRateLimit) {
        if (now < userRateLimit.resetTime) {
          if (userRateLimit.count >= maxRequests) {
            return createApiResponse(
              false,
              null,
              'Rate limit exceeded',
              'Too many requests. Please try again later.',
              429
            )
          }
          userRateLimit.count++
        } else {
          // Reset the counter
          rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
        }
      } else {
        // First request from this identifier
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
      }

      return await handler(req, context)
    } catch (error) {
      console.error('Rate Limit Error:', error)
      return createApiResponse(
        false,
        null,
        'Rate limit check failed',
        'An error occurred while checking rate limits',
        500
      )
    }
  }
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware<T = any>(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>) => {
    return middlewares.reduce((wrappedHandler, middleware) => {
      return middleware(wrappedHandler)
    }, handler)
  }
}

/**
 * Log API requests for audit purposes
 */
export function withAuditLog<T = any>(
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest, context: any) => {
    const start = Date.now()

    try {
      const { userId } = auth()
      const user = userId ? await getCurrentUser() : null
      const userRole = user ? getUserRole(user) : 'anonymous'

      console.log(`[API Request] ${req.method} ${req.url}`, {
        userId,
        userRole,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        ip: req.ip,
      })

      const response = await handler(req, context)
      const duration = Date.now() - start

      console.log(`[API Response] ${req.method} ${req.url}`, {
        userId,
        userRole,
        status: response.status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })

      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`[API Error] ${req.method} ${req.url}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
      throw error
    }
  }
}

/**
 * Validate request method
 */
export function withMethodValidation<T = any>(
  allowedMethods: string[],
  handler: (req: NextRequest, context: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: NextRequest, context: any) => {
    if (!allowedMethods.includes(req.method)) {
      return createApiResponse(
        false,
        null,
        'Method not allowed',
        `Method ${req.method} is not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        405
      )
    }

    return await handler(req, context)
  }
}