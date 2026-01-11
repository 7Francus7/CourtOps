'use client'

import { signOut } from 'next-auth/react'
import TurneroGrid from '@/components/TurneroGrid'
import CajaWidget from '@/components/CajaWidget'
import { useState } from 'react'
import KioscoModal from '@/components/KioscoModal'
import Link from 'next/link'
import AlertsWidget from '@/components/AlertsWidget'
import BookingManagementModal from '@/components/BookingManagementModal'
import { useRouter } from 'next/navigation'

import MobileDashboard from '@/components/MobileDashboard'

// Update prop interface
export default function DashboardClient({
       user,
       clubName,
       logoUrl,
       slug,
       features = { hasKiosco: true } // Default true for legacy/dev safety, but server should pass it
}: {
       user: any,
       clubName: string,
       logoUrl?: string | null,
       slug?: string,
       features?: { hasKiosco: boolean }
}) {
       const [isKioscoOpen, setIsKioscoOpen] = useState(false)
       const [selectedManagementBooking, setSelectedManagementBooking] = useState<any>(null)
       const [refreshKey, setRefreshKey] = useState(0)

       const router = useRouter()

       const handleOpenBooking = (bookingOrId: any) => {
              console.log('🔥 [DashboardClient] handleOpenBooking received:', bookingOrId)
              if (typeof bookingOrId === 'number') {
                     setSelectedManagementBooking({ id: bookingOrId })
              } else {
                     if (!bookingOrId?.id && Object.keys(bookingOrId).length > 0) console.error("⚠️ Recibido objeto SIN ID:", bookingOrId)
                     // If empty object passed (new booking), that's fine
                     setSelectedManagementBooking(bookingOrId)
              }
       }

       return (
              <>
                     {/* MOBILE LAYOUT */}
                     <div className="lg:hidden">
                            <MobileDashboard
                                   user={user}
                                   clubName={clubName}
                                   logoUrl={logoUrl}
                                   onOpenBooking={handleOpenBooking}
                                   onOpenKiosco={() => setIsKioscoOpen(true)}
                            />
                     </div>

                     {/* DESKTOP LAYOUT */}
                     <div className="hidden lg:flex min-h-screen bg-bg-dark text-text-white font-sans flex-col lg:overflow-hidden lg:h-screen">
                            <header className="flex flex-row items-center justify-between gap-4 px-4 py-3 lg:p-6 lg:pb-0 flex-shrink-0 z-20 bg-bg-dark/80 backdrop-blur-md border-b border-white/5 lg:border-none sticky top-0 lg:static">
                                   <div className="flex items-center gap-3 overflow-hidden">
                                          {logoUrl ? (
                                                 <img src={logoUrl} alt={clubName} className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl object-cover shadow-lg border border-white/10 shrink-0" />
                                          ) : (
                                                 <div className="w-9 h-9 lg:w-12 lg:h-12 bg-gradient-to-br from-brand-green to-brand-green-variant rounded-xl shadow-lg shadow-brand-green/20 shrink-0"></div>
                                          )}
                                          <div className="flex flex-col min-w-0">
                                                 <div className="flex items-center gap-2">
                                                        <h1 className="text-lg lg:text-2xl font-bold tracking-tight leading-none text-white truncate">{clubName}</h1>
                                                        <span className="bg-white/10 text-white/60 text-[8px] lg:text-[10px] px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-widest font-bold hidden sm:inline-block">
                                                               CourtOps
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                                          <div className="flex flex-col items-end hidden sm:flex">
                                                 <span className="text-sm font-medium text-white">Hola, {user?.name || 'Admin'}</span>
                                                 <button
                                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                                        className="text-xs text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1"
                                                 >
                                                        Cerrar Sesión
                                                 </button>
                                          </div>
                                          <Link href="/configuracion" className="w-9 h-9 lg:w-10 lg:h-10 bg-bg-surface rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group" title="Configuración">
                                                 <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">⚙️</span>
                                          </Link>

                                          {/* SUPER ADMIN SHORTCUT */}
                                          {(user?.email === 'dellorsif@gmail.com' || user?.email?.includes('admin@courtops.com')) && (
                                                 <Link href="/god-mode" className="w-9 h-9 lg:w-10 lg:h-10 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors group" title="GOD MODE">
                                                        <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">⚡</span>
                                                 </Link>
                                          )}

                                          <button
                                                 onClick={() => signOut({ callbackUrl: '/login' })}
                                                 className="w-9 h-9 lg:w-10 lg:h-10 bg-bg-surface rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group sm:hidden"
                                                 title="Cerrar Sesión"
                                          >
                                                 <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">🚪</span>
                                          </button>
                                   </div>
                            </header>

                            <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 lg:p-8 lg:pt-6 lg:h-[calc(100vh-100px)] min-h-0 overflow-visible lg:overflow-hidden">

                                   {/* Main Calendar Area - Takes up 3 columns */}
                                   {/* On mobile: Order 1 (Top). On Desktop: Col Span 3 */}
                                   <div className="lg:col-span-3 h-[600px] lg:h-full flex flex-col min-h-0 shadow-2xl lg:shadow-none mb-4 lg:mb-0">
                                          <TurneroGrid
                                                 onBookingClick={handleOpenBooking}
                                                 refreshKey={refreshKey}
                                          />
                                   </div>

                                   {/* Sidebar Info - Takes up 1 column */}
                                   {/* On mobile: Order 2 (Bottom). Scrollable naturally */}
                                   <div className="space-y-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar pb-24 lg:pb-0">

                                          {/* Quick Actions Mobile Grid */}
                                          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2">
                                                 {slug && (
                                                        <Link href={`/p/${slug}`} target="_blank" className="col-span-2 bg-gradient-to-r from-brand-blue/20 to-brand-green/20 hover:from-brand-blue/30 hover:to-brand-green/30 text-white p-2 rounded-2xl font-bold text-xs transition-all border border-white/10 flex flex-row gap-2 items-center justify-center h-12 mb-2">
                                                               <span className="text-xl">🌐</span>
                                                               <span className="tracking-wide">Link Público</span>
                                                               <span className="ml-auto text-white/30 text-[10px]">↗</span>
                                                        </Link>
                                                 )}

                                                 <div className="hidden lg:contents">
                                                        <button className="bg-brand-blue hover:bg-brand-blue-secondary text-white p-2 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-brand-blue/20 flex flex-col gap-1 items-center justify-center h-20">
                                                               <span className="text-xl">+</span>
                                                               Reserva
                                                        </button>
                                                 </div>

                                                 {features.hasKiosco ? (
                                                        <button
                                                               onClick={() => setIsKioscoOpen(true)}
                                                               className="bg-bg-surface hover:bg-white/5 text-white p-2 rounded-2xl font-bold text-xs transition-all border border-white/5 flex flex-col gap-1 items-center justify-center h-20"
                                                        >
                                                               <span className="text-xl">🛒</span>
                                                               Kiosco
                                                        </button>
                                                 ) : (
                                                        <div className="relative group cursor-not-allowed opacity-50 grayscale bg-bg-surface border border-white/5 rounded-2xl flex flex-col gap-1 items-center justify-center h-20">
                                                               <span className="hidden group-hover:flex absolute -top-8 bg-black border border-white/20 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                                                                      Requiere Plan PRO
                                                               </span>
                                                               <span className="text-xl">🔒</span>
                                                               <span className="text-[10px] uppercase font-bold text-white/50">Kiosco</span>
                                                        </div>
                                                 )}

                                                 <Link href="/clientes" className="bg-bg-surface hover:bg-white/5 text-white p-2 rounded-2xl font-bold text-xs transition-all border border-white/5 flex flex-col gap-1 items-center justify-center h-20 text-center">
                                                        <span className="text-xl">👥</span>
                                                        Clientes
                                                 </Link>
                                                 <Link href="/reportes" className="bg-bg-surface hover:bg-white/5 text-white p-2 rounded-2xl font-bold text-xs transition-all border border-white/5 flex flex-col gap-1 items-center justify-center h-20 text-center">
                                                        <span className="text-xl">📊</span>
                                                        Reportes
                                                 </Link>
                                          </div>

                                          {/* KPI Cards */}
                                          <CajaWidget />

                                          {/* Notifications/Alerts */}
                                          <AlertsWidget onAlertClick={handleOpenBooking} />

                                   </div>
                            </main>
                     </div>

                     <KioscoModal isOpen={isKioscoOpen} onClose={() => setIsKioscoOpen(false)} />

                     {selectedManagementBooking && (
                            <BookingManagementModal
                                   booking={selectedManagementBooking}
                                   onClose={() => setSelectedManagementBooking(null)}
                                   onUpdate={() => {
                                          router.refresh()
                                          setRefreshKey(prev => prev + 1)
                                          setSelectedManagementBooking(null)
                                   }}
                            />
                     )}
              </>
       )
}
