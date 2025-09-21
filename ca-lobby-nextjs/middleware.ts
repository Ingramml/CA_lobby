import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// Check if we should disable authentication (only in specific test environments)
const shouldDisableAuth = process.env.DISABLE_CLERK_AUTH === 'true' && process.env.NODE_ENV === 'test'

/**
 * Add comprehensive security headers to response
 */
function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const isDev = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'

  // Content Security Policy (CSP)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-analytics.com *.vercel-insights.com *.clerk.accounts.dev *.clerk.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob: *.googleusercontent.com *.clerk.com *.clerk.accounts.dev",
    "connect-src 'self' *.vercel-analytics.com *.vercel-insights.com *.clerk.accounts.dev *.clerk.com api.clerk.com *.googleapis.com",
    "frame-src 'self' *.clerk.accounts.dev *.clerk.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isDev ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join('; ')

  // Security Headers
  const securityHeaders = {
    // Content Security Policy
    'Content-Security-Policy': cspHeader,

    // X-Frame-Options (backup for older browsers)
    'X-Frame-Options': 'DENY',

    // X-Content-Type-Options
    'X-Content-Type-Options': 'nosniff',

    // X-XSS-Protection (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),

    // Strict Transport Security (HTTPS only in production)
    ...(isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),

    // Cross-Origin Embedder Policy
    'Cross-Origin-Embedder-Policy': 'credentialless',

    // Cross-Origin Opener Policy
    'Cross-Origin-Opener-Policy': 'same-origin',

    // Cross-Origin Resource Policy
    'Cross-Origin-Resource-Policy': 'same-origin',

    // X-DNS-Prefetch-Control
    'X-DNS-Prefetch-Control': 'on',

    // X-Powered-By removal (Next.js usually handles this)
    'X-Powered-By': 'CA Lobby Dashboard',

    // Server identification
    'Server': 'Vercel',

    // Rate limiting headers (for API routes)
    ...(request.nextUrl.pathname.startsWith('/api') && {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Window': '15m',
    }),
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })

  // Add security-related cache headers for static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-Content-Type-Options', 'nosniff')
  }

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'https://ca-lobby.vercel.app',
      'https://ca-lobby-preview.vercel.app',
    ].filter(Boolean)

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
  }

  return response
}

// Simple middleware that bypasses auth when disabled
function simpleMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  return addSecurityHeaders(response, request)
}

// Export the appropriate middleware based on configuration
export default shouldDisableAuth ? simpleMiddleware : authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    '/',
    '/api/health',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: [
    '/api/health',
  ],
  // If the user is signed in and tries to access a sign in or sign up page,
  // redirect them to the after sign in URL
  afterSignInUrl: '/',
  afterSignUpUrl: '/',

  // Add security headers to all responses
  beforeAuth: (req) => {
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })
      return addSecurityHeaders(response, req)
    }
  },

  // Add security headers after authentication
  afterAuth: (auth, req) => {
    // Create the response
    const response = NextResponse.next()

    // Add security headers
    return addSecurityHeaders(response, req)
  },
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}