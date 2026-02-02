import { redirect } from "next/navigation"
import DashboardEmergency from "@/components/DashboardEmergency"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
       try {
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

              const club = await prisma.club.findUnique({
                     where: { id: session.user.clubId },
                     select: {
                            name: true
                     }
              })

              const clubName = club?.name || 'Club Deportivo'
              const serializedUser = {
                     id: session.user.id || '',
                     email: session.user.email || '',
                     name: session.user.name || '',
                     clubId: session.user.clubId || '',
                     role: session.user.role || 'USER'
              }

              return (
                     <DashboardEmergency
                            user={serializedUser}
                            clubName={clubName}
                     />
              )
       } catch (error: any) {
              console.error("Dashboard Page Error:", error)
              return (
                     <div className="min-h-screen bg-black flex items-center justify-center p-4">
                            <div className="text-center space-y-4 max-w-2xl">
                                   <h1 className="text-2xl font-bold text-white">Error de Conexión</h1>
                                   <p className="text-zinc-500">No se pudo cargar la información del club.</p>
                                   <pre className="text-xs text-zinc-400 bg-zinc-900 p-4 rounded-lg overflow-auto">
                                          {error.message}
                                   </pre>
                            </div>
                     </div>
              )
       }
}
