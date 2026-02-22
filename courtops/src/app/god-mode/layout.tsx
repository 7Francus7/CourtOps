
import { getServerSession } from "next-auth/next"
import { authOptions, isSuperAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

import GodModeHeader from "@/components/super-admin/GodModeHeader"

export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
       children,
}: {
       children: React.ReactNode
}) {
       try {
              const session = await getServerSession(authOptions)

              if (!session?.user || !isSuperAdmin(session.user)) {
                     redirect('/login')
              }

              return (
                     <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
                            <GodModeHeader />
                            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
                                   {children}
                            </div>
                     </div>
              )
       } catch (error) {
              console.error("Layout Error:", error)
              return <div className="p-20 text-center">Error cargando sesión administrativa.</div>
       }
}
