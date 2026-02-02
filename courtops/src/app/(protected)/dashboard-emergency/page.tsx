import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const dynamic = 'force-dynamic'

export default async function EmergencyDashboard() {
       const session = await getServerSession(authOptions)

       if (!session || !session.user) {
              redirect('/login')
       }

       if (!session.user.clubId) {
              return <div className="p-8">Error: Usuario sin club asignado</div>
       }

       try {
              const clubId = session.user.clubId

              // Fetch club data
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { name: true }
              })

              // Fetch courts
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })

              // Fetch today's bookings
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const tomorrow = new Date(today)
              tomorrow.setDate(tomorrow.getDate() + 1)

              const bookings = await prisma.booking.findMany({
                     where: {
                            clubId,
                            startTime: { gte: today, lt: tomorrow },
                            status: { not: 'CANCELED' }
                     },
                     include: {
                            client: { select: { name: true, phone: true } },
                            court: { select: { name: true } }
                     },
                     orderBy: { startTime: 'asc' }
              })

              return (
                     <div className="min-h-screen bg-background p-8">
                            <div className="max-w-7xl mx-auto space-y-8">
                                   {/* Header */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h1 className="text-3xl font-bold text-foreground">
                                                 {club?.name || 'Dashboard'}
                                          </h1>
                                          <p className="text-muted-foreground mt-2">
                                                 Usuario: {session.user.email}
                                          </p>
                                   </div>

                                   {/* Courts Status */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h2 className="text-xl font-bold mb-4">Canchas Configuradas</h2>
                                          {courts.length === 0 ? (
                                                 <div className="text-amber-500 bg-amber-500/10 p-4 rounded-lg">
                                                        ⚠️ No hay canchas configuradas. Ve a Configuración para agregar canchas.
                                                 </div>
                                          ) : (
                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {courts.map(court => (
                                                               <div
                                                                      key={court.id}
                                                                      className="bg-muted/50 p-4 rounded-lg border border-border"
                                                               >
                                                                      <h3 className="font-bold text-lg">{court.name}</h3>
                                                                      <p className="text-sm text-muted-foreground">
                                                                             {court.surface || 'Superficie no especificada'}
                                                                      </p>
                                                                      <p className="text-xs text-emerald-500 mt-2">
                                                                             ✓ Activa
                                                                      </p>
                                                               </div>
                                                        ))}
                                                 </div>
                                          )}
                                   </div>

                                   {/* Today's Bookings */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h2 className="text-xl font-bold mb-4">Reservas de Hoy</h2>
                                          {bookings.length === 0 ? (
                                                 <p className="text-muted-foreground">No hay reservas para hoy</p>
                                          ) : (
                                                 <div className="space-y-2">
                                                        {bookings.map(booking => (
                                                               <div
                                                                      key={booking.id}
                                                                      className="bg-muted/30 p-4 rounded-lg border border-border flex justify-between items-center"
                                                               >
                                                                      <div>
                                                                             <p className="font-bold">
                                                                                    {booking.client?.name || 'Cliente sin nombre'}
                                                                             </p>
                                                                             <p className="text-sm text-muted-foreground">
                                                                                    {booking.court?.name} - {new Date(booking.startTime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                                             </p>
                                                                      </div>
                                                                      <div className="text-right">
                                                                             <p className="font-bold text-emerald-500">
                                                                                    ${booking.price}
                                                                             </p>
                                                                             <p className="text-xs text-muted-foreground">
                                                                                    {booking.status}
                                                                             </p>
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          )}
                                   </div>

                                   {/* Quick Actions */}
                                   <div className="bg-card border border-border rounded-xl p-6">
                                          <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                 <a
                                                        href="/reservas"
                                                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-lg text-center font-bold transition-colors"
                                                 >
                                                        Ver Reservas
                                                 </a>
                                                 <a
                                                        href="/clientes"
                                                        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg text-center font-bold transition-colors"
                                                 >
                                                        Clientes
                                                 </a>
                                                 <a
                                                        href="/configuracion"
                                                        className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg text-center font-bold transition-colors"
                                                 >
                                                        Configuración
                                                 </a>
                                                 <a
                                                        href="/caja"
                                                        className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-lg text-center font-bold transition-colors"
                                                 >
                                                        Caja
                                                 </a>
                                          </div>
                                   </div>

                                   {/* Debug Info */}
                                   <details className="bg-muted/20 p-4 rounded-lg border border-border text-xs">
                                          <summary className="cursor-pointer font-bold">Debug Info</summary>
                                          <pre className="mt-4 overflow-auto">
                                                 {JSON.stringify({
                                                        clubId,
                                                        courtsCount: courts.length,
                                                        bookingsCount: bookings.length,
                                                        user: session.user
                                                 }, null, 2)}
                                          </pre>
                                   </details>
                            </div>
                     </div>
              )
       } catch (error: any) {
              return (
                     <div className="min-h-screen bg-background flex items-center justify-center p-8">
                            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-8 max-w-2xl">
                                   <h1 className="text-2xl font-bold text-red-500 mb-4">Error Fatal</h1>
                                   <p className="text-foreground mb-4">
                                          No se pudo cargar el dashboard. Error:
                                   </p>
                                   <pre className="bg-black/50 p-4 rounded-lg text-red-400 overflow-auto text-sm">
                                          {error.message}
                                          {'\n\n'}
                                          {error.stack}
                                   </pre>
                            </div>
                     </div>
              )
       }
}
