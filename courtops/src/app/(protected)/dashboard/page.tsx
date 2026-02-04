import { redirect } from "next/navigation"
import DashboardClient from "@/components/DashboardClient"
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

              // SUPER ADMIN CHECK
              const isSuperAdmin = session.user.email === 'dellorsif@gmail.com' || session.user.email === 'admin@courtops.com'

              if (!session.user.clubId && !isSuperAdmin) {
                     return (
                            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                                   <div className="text-center space-y-4">
                                          <h1 className="text-2xl font-bold text-red-500">Error: Usuario sin club asignado</h1>
                                          <p className="text-zinc-500">Su cuenta no tiene un club vinculado. Contacte soporte.</p>
                                   </div>
                            </div>
                     )
              }

              // If Super Admin has no club, redirect them to God Mode as they have nothing to see here
              if (!session.user.clubId && isSuperAdmin) {
                     redirect('/god-mode')
              }

              const club = await prisma.club.findUnique({
                     where: { id: session.user.clubId as string },
                     select: {
                            name: true,
                            slug: true,
                            logoUrl: true,
                            themeColor: true,
                            hasKiosco: true
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
                     <DashboardClient
                            user={serializedUser}
                            clubName={clubName}
                            slug={club?.slug}
                            logoUrl={club?.logoUrl}
                            themeColor={club?.themeColor}
                            features={{ hasKiosco: club?.hasKiosco || false }}
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
