import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { rateLimiter } from "@/lib/ratelimit"

export default async function proxy(req: NextRequest) {
       // @ts-ignore
       const ip = req.ip || '127.0.0.1' // Vercel provides req.ip

       // 1. Rate Limit for Role "Guest" on Public APIs
       // Only apply to public booking APIs to prevent spam
       if (req.nextUrl.pathname.startsWith('/api/public')) {
              const { success, headers } = rateLimiter.check(ip, 20) // 20 req/min for public

              if (!success) {
                     return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
                            status: 429,
                            headers: {
                                   'Content-Type': 'application/json',
                                   ...headers
                            }
                     })
              }
       }

       // 2. Auth Protection (Placeholder until NEXTAUTH_SECRET is confirmed)
       // For now, we pass-through but we have the structure ready.
       // const token = await getToken({ req })
       // if (!token && isPrivatePath) return NextResponse.redirect(new URL('/login', req.url))

       return NextResponse.next()
}

export const config = {
       matcher: [
              // Private Routes
              "/dashboard/:path*",
              "/clientes/:path*",
              "/configuracion/:path*",

              // Public APIs (we catch them here to apply Rate Limit)
              "/api/public/:path*",
       ],
}
