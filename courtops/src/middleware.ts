
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
       function middleware(req) {
              // Custom logic if needed, e.g. role checks
              return NextResponse.next()
       },
       {
              callbacks: {
                     authorized: ({ token }) => !!token,
              },
              pages: {
                     signIn: "/login",
              },
       }
)

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
