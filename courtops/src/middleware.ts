import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number, windowMs: number = 60_000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  entry.count++
  return entry.count <= limit
}

// Cleanup stale entries periodically (every 1000 checks)
let checkCount = 0
function maybeCleanup() {
  checkCount++
  if (checkCount % 1000 === 0) {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetTime) rateLimitMap.delete(key)
    }
  }
}

// Route-specific rate limits
function getRateLimit(pathname: string): number {
  if (pathname.startsWith('/api/auth')) return 10        // Login: 10/min
  if (pathname.startsWith('/api/webhooks')) return 60    // Webhooks: 60/min
  if (pathname.startsWith('/api/public')) return 20      // Public APIs: 20/min
  if (pathname.startsWith('/api/bookings/create-payment-link')) return 10 // Payment: 10/min
  return 100 // General: 100/min
}

// Security headers applied to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  maybeCleanup()

  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const limit = getRateLimit(pathname)
    const allowed = checkRateLimit(`${ip}:${pathname.split('/').slice(0, 3).join('/')}`, limit)

    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          ...securityHeaders,
        },
      })
    }
  }

  // Apply security headers to all responses
  const response = NextResponse.next()

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.pusher.com https://cdn.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://api.mercadopago.com https://www.google-analytics.com https://*.vercel-insights.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://www.googletagmanager.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.json|sw.js|workbox-.*\\.js|sounds/.*|robots.txt|sitemap.xml).*)',
  ],
}
