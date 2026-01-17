import { redirect } from "next/navigation"
import DashboardClient from "@/components/DashboardClient"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
       const session = await getServerSession(authOptions)

       if (!session || !session.user) {
              redirect('/login')
       }

       // SUPER ADMIN REDIRECT
       if (session.user.email === 'dellorsif@gmail.com' || session.user.email === 'admin@courtops.com') {
              redirect('/god-mode')
       }

       if (!session.user.clubId) {
              return (
                     <div className="min-h-screen bg-black flex items-center justify-center p-4">
                            <div className="text-center space-y-4">
                                   <h1 className="text-2xl font-bold text-red-500">Error: Usuario sin club asignado</h1>
                                   <p className="text-zinc-500">Su cuenta no tiene un club vinculado. Contacte soporte.</p>
                            </div>
                     </div>
              )
       }

       try {
              const club = await prisma.club.findUnique({
                     where: { id: session.user.clubId },
                     select: {
                            name: true,
                            logoUrl: true,
                            slug: true,
                            hasKiosco: true,
                            hasAdvancedReports: true,
                            themeColor: true
                     }
              })

              const clubName = club?.name || 'Club Deportivo'
              const features = {
                     hasKiosco: club?.hasKiosco ?? true,
                     hasAdvancedReports: club?.hasAdvancedReports ?? true
              }

              return <DashboardClient user={session.user} clubName={clubName} logoUrl={club?.logoUrl} slug={club?.slug} features={features} themeColor={club?.themeColor} />
       } catch (error) {
              console.error("Dashboard Page Error:", error)
              return (
                     <div className="min-h-screen bg-black flex items-center justify-center p-4">
                            <div className="text-center space-y-4">
                                   <h1 className="text-2xl font-bold text-white">Error de Conexión</h1>
                                   <p className="text-zinc-500">No se pudo cargar la información del club. Verifique la base de datos.</p>
                            </div>
                     </div>
              )
       }
}
