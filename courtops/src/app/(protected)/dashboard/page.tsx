import { redirect } from "next/navigation"
import DashboardClient from "@/components/DashboardClient"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ultraSafeSerialize } from "@/lib/serializer"

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'
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
                            themeColor: true,
                            _count: {
                                   select: { courts: true }
                            }
                     }
              })

              // Safely fetch notification without causing serialization issues
              let activeNotification = null
              try {
                     const notification = await prisma.systemNotification.findFirst({
                            where: { isActive: true },
                            orderBy: { createdAt: 'desc' },
                            select: {
                                   id: true,
                                   title: true,
                                   message: true,
                                   type: true
                            }
                     })
                     // Serialize with robust serializer
                     if (notification) {
                            const { ultraSafeSerialize } = await import('@/lib/serializer')
                            activeNotification = ultraSafeSerialize(notification)
                     }
              } catch (e) {
                     console.error('Notification fetch failed, continuing...', e)
              }

              const showOnboarding = (club?._count?.courts || 0) === 0
              const clubName = club?.name || 'Club Deportivo'
              const features = {
                     hasKiosco: club?.hasKiosco ?? true,
                     hasAdvancedReports: club?.hasAdvancedReports ?? true
              }

              // Serialize user data to avoid serialization issues
              const serializedUser = ultraSafeSerialize({
                     id: session.user.id,
                     email: session.user.email,
                     name: session.user.name,
                     clubId: session.user.clubId,
                     role: session.user.role
              })

              return (
                     <DashboardClient
                            user={serializedUser}
                            clubName={clubName}
                            logoUrl={club?.logoUrl}
                            slug={club?.slug}
                            features={features}
                            themeColor={club?.themeColor}
                            showOnboarding={showOnboarding}
                            activeNotification={activeNotification}
                     />
              )
       } catch (error: any) {
              console.error("Dashboard Page Error:", error)
              return (
                     <div className="min-h-screen bg-black flex items-center justify-center p-4">
                            <div className="text-center space-y-4 max-w-2xl">
                                   <h1 className="text-2xl font-bold text-white">Error de Conexión</h1>
                                   <p className="text-zinc-500">No se pudo cargar la información del club.</p>
                                   <details className="text-left bg-zinc-900 p-4 rounded-lg">
                                          <summary className="cursor-pointer text-red-500 font-mono text-sm">
                                                 Ver detalles del error
                                          </summary>
                                          <pre className="mt-4 text-xs text-zinc-400 overflow-auto">
                                                 {error.message}
                                                 {'\n\n'}
                                                 {error.stack}
                                          </pre>
                                   </details>
                            </div>
                     </div>
              )
       }
}
