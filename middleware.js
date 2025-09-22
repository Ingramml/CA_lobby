import { NextResponse } from 'next/server'

// Whitelisted IP addresses
const WHITELISTED_IPS = [
  '185.203.218.172', // Your current IP
  '127.0.0.1',       // Localhost
  '::1'              // IPv6 localhost
]

export function middleware(request) {
  // Get client IP from headers
  const clientIP = request.ip ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   'unknown'

  console.log('Client IP:', clientIP)

  // Check if IP is whitelisted
  if (WHITELISTED_IPS.includes(clientIP)) {
    console.log(`IP ${clientIP} is whitelisted - allowing access`)

    // Add header to indicate whitelisted status
    const response = NextResponse.next()
    response.headers.set('x-ip-whitelisted', 'true')
    response.headers.set('x-client-ip', clientIP)
    return response
  }

  // For non-whitelisted IPs, continue normal processing
  console.log(`IP ${clientIP} not whitelisted - normal auth required`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}