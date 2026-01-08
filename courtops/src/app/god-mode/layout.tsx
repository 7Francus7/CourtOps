
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import GodModeHeader from "@/components/super-admin/GodModeHeader"

export default async function SuperAdminLayout({
       children,
}: {
       children: React.ReactNode
}) {
       try {
              const session = await getServerSession(authOptions)
              const SUPER_ADMINS = ['admin@courtops.com', 'dello@example.com', 'dellorsif@gmail.com']

              if (!session || !session.user || !session.user.email || !SUPER_ADMINS.includes(session.user.email)) {
                     redirect('/')
              }

              return (
                     <div className="min-h-screen bg-black text-white">
                            <GodModeHeader />
                            <div className="max-w-7xl mx-auto p-4 md:p-8">
                                   {children}
                            </div>
                     </div>
              )
       } catch (error) {
              console.error("Layout Error:", error)
              return <div className="p-20 text-center">Error cargando sesión administrativa.</div>
       }
}
