import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

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
              const clubId = session.user.clubId

              // Fetch club
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: {
                            name: true,
                            logoUrl: true,
                            slug: true,
                            openTime: true,
                            closeTime: true,
                            slotDuration: true
                     }
              })

              // Fetch courts
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })

              const clubName = club?.name || 'Club Deportivo'

              // If no courts, show onboarding
              if (courts.length === 0) {
                     return (
                            <div className="min-h-screen bg-background p-8">
                                   <div className="max-w-4xl mx-auto">
                                          <div className="bg-card border-2 border-amber-500 rounded-xl p-8 text-center">
                                                 <h1 className="text-3xl font-bold text-foreground mb-4">
                                                        Bienvenido a {clubName}
                                                 </h1>
                                                 <p className="text-lg text-muted-foreground mb-8">
                                                        Para empezar a usar el sistema, necesitas configurar al menos una cancha.
                                                 </p>
                                                 <a
                                                        href="/configuracion"
                                                        className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                                                 >
                                                        Ir a Configuración →
                                                 </a>
                                          </div>
                                   </div>
                            </div>
                     )
              }

              // Fetch today's bookings for display
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const tomorrow = new Date(today)
              tomorrow.setDate(tomorrow.getDate() + 1)

              const todayBookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: today, lt: tomorrow },
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            client: { select: { name: true } },
                            court: { select: { name: true } }
                     },
                     orderBy: { startTime: 'asc' },
                     take: 10
              })

              return (
                     <div className="min-h-screen bg-background">
                            {/* Header */}
                            <header className="border-b border-border bg-card sticky top-0 z-50">
                                   <div className="flex items-center justify-between px-6 py-4">
                                          <div>
                                                 <h1 className="text-2xl font-bold text-foreground">{clubName}</h1>
                                                 <p className="text-sm text-muted-foreground">{session.user.email}</p>
                                          </div>
                                          <div className="flex gap-3">
                                                 <a
                                                        href="/reservar"
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                                 >
                                                        + NUEVA RESERVA
                                                 </a>
                                          </div>
                                   </div>
                            </header>

                            {/* Main Content */}
                            <main className="p-6 max-w-7xl mx-auto space-y-6">
                                   {/* Quick Stats */}
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="bg-card border border-border rounded-xl p-6">
                                                 <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                        Canchas Activas
                                                 </div>
                                                 <div className="text-4xl font-black text-foreground">
                                                        {courts.length}
                                                 </div>
                                          </div>
                                          <div className="bg-card border border-border rounded-xl p-6">
                                                 <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                        Reservas Hoy
                                                 </div>
                                                 <div className="text-4xl font-black text-emerald-500">
                                                        {todayBookings.length}
                                                 </div>
                                          </div>
                                          <div className="bg-card border border-border rounded-xl p-6">
                                                 <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                                        Horario
                                                 </div>
                                                 <div className="text-2xl font-bold text-foreground">
                                                        {club?.openTime || '09:00'} - {club?.closeTime || '23:00'}
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Courts Grid */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h2 className="text-xl font-bold mb-4 text-foreground">Tus Canchas</h2>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                 {courts.map(court => (
                                                        <div
                                                               key={court.id}
                                                               className="bg-muted/50 hover:bg-muted transition-colors p-5 rounded-lg border border-border"
                                                        >
                                                               <h3 className="font-bold text-lg text-foreground">{court.name}</h3>
                                                               <p className="text-sm text-muted-foreground mt-1">
                                                                      {court.surface || 'Padel'}
                                                               </p>
                                                               <div className="mt-3 flex items-center gap-2">
                                                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                                      <span className="text-xs font-medium text-emerald-500">Activa</span>
                                                               </div>
                                                        </div>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Today's Bookings */}
                                   {todayBookings.length > 0 && (
                                          <div className="bg-card border border-border rounded-xl p-6">
                                                 <h2 className="text-xl font-bold mb-4 text-foreground">Reservas de Hoy</h2>
                                                 <div className="space-y-2">
                                                        {todayBookings.map(booking => (
                                                               <div
                                                                      key={booking.id}
                                                                      className="bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-lg border border-border flex justify-between items-center"
                                                               >
                                                                      <div>
                                                                             <p className="font-bold text-foreground">
                                                                                    {booking.client?.name || 'Cliente'}
                                                                             </p>
                                                                             <p className="text-sm text-muted-foreground">
                                                                                    {booking.court?.name} · {new Date(booking.startTime).toLocaleTimeString('es-AR', {
                                                                                           hour: '2-digit',
                                                                                           minute: '2-digit'
                                                                                    })}
                                                                             </p>
                                                                      </div>
                                                                      <div className="text-right">
                                                                             <p className="font-bold text-emerald-500 text-lg">
                                                                                    ${booking.price}
                                                                             </p>
                                                                             <p className="text-xs text-muted-foreground uppercase">
                                                                                    {booking.status}
                                                                             </p>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   )}

                                   {/* Quick Actions */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h2 className="text-xl font-bold mb-4 text-foreground">Acciones</h2>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                 <a href="/reservas" className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center font-bold transition-colors">
                                                        Reservas
                                                 </a>
                                                 <a href="/clientes" className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center font-bold transition-colors">
                                                        Clientes
                                                 </a>
                                                 <a href="/caja" className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-lg text-center font-bold transition-colors">
                                                        Caja
                                                 </a>
                                                 <a href="/configuracion" className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-lg text-center font-bold transition-colors">
                                                        Configuración
                                                 </a>
                                          </div>
                                   </div>

                                   {/* Note */}
                                   <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                                          <p className="text-blue-400 text-sm">
                                                 🔧 Dashboard temporal simplificado. El turnero completo se restaurará pronto.
                                          </p>
                                   </div>
                            </main>
                     </div>
              )
       } catch (error: any) {
              console.error("Dashboard Error:", error)
              return (
                     <div className="min-h-screen bg-black flex items-center justify-center p-4">
                            <div className="max-w-2xl bg-red-500/10 border-2 border-red-500 rounded-xl p-8">
                                   <h1 className="text-2xl font-bold text-red-500 mb-4">Error al cargar Dashboard</h1>
                                   <pre className="bg-black/50 p-4 rounded-lg text-red-400 overflow-auto text-sm">
                                          {error.message}
                                   </pre>
                            </div>
                     </div>
              )
       }
}
