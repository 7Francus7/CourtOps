
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ⚠️ MIDDLEWARE TEMPORAL DE DIAGNÓSTICO ⚠️
// El middleware anterior con 'next-auth' causaba error 500 en Vercel.
// Esto pasa a menudo si falta NEXTAUTH_SECRET o por incompatibilidad de Edge Runtime.
// Hemos desactivado la protección momentáneamente para confirmar que el sitio levante.

export function middleware(req: NextRequest) {
       return NextResponse.next()
}

export const config = {
       matcher: [
              "/dashboard/:path*",
              "/clientes/:path*",
              "/configuracion/:path*",
              "/reportes/:path*",
              "/reservas/:path*",
              "/actividad/:path*",
              "/admin/:path*",
       ],
}
