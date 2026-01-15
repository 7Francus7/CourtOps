'use client'

import { signOut } from 'next-auth/react'
import TurneroGrid from '@/components/TurneroGrid'
import CajaWidget from '@/components/CajaWidget'
import { useState, useEffect } from 'react'
import KioscoModal from '@/components/KioscoModal'
import Link from 'next/link'
import AlertsWidget from '@/components/AlertsWidget'
import BookingManagementModal from '@/components/BookingManagementModal'
import { useRouter } from 'next/navigation'

import MobileDashboard from '@/components/MobileDashboard'
import NotificationsSheet from '@/components/NotificationsSheet'

import BookingModal from '@/components/BookingModal'
import { getCourts } from '@/actions/dashboard'
import { Bell, ExternalLink, Plus } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { ROLES, isAdmin, isStaff } from '@/lib/permissions'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'

export default function DashboardClient({
       user,
       clubName,
       logoUrl,
       slug,
       features = { hasKiosco: true }
}: {
       user: any,
       clubName: string,
       logoUrl?: string | null,
       slug?: string,
       features?: { hasKiosco: boolean }
}) {
       const [isKioscoOpen, setIsKioscoOpen] = useState(false)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [selectedManagementBooking, setSelectedManagementBooking] = useState<any>(null)

       // Lifted State for Turnero
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())

       // Mobile View State
       const [mobileView, setMobileView] = useState<'dashboard' | 'calendar'>('dashboard')

       // Creation State
       const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
       const [createModalProps, setCreateModalProps] = useState<{ initialDate?: Date, initialCourtId?: number, initialTime?: string } | null>(null)
       const [courts, setCourts] = useState<any[]>([])

       const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()

       const [refreshKey, setRefreshKey] = useState(0)

       const router = useRouter()

       // Load Courts for Global Creation Modal
       useEffect(() => {
              getCourts().then(setCourts).catch(console.error)
       }, [])

       const handleOpenBooking = (bookingOrId: any) => {
              if (bookingOrId?.isNew) {
                     setCreateModalProps({
                            initialDate: bookingOrId.date,
                            initialCourtId: bookingOrId.courtId,
                            initialTime: bookingOrId.time
                     })
                     setIsCreateModalOpen(true)
              } else if (typeof bookingOrId === 'number') {
                     setSelectedManagementBooking({ id: bookingOrId })
              } else {
                     if (Object.keys(bookingOrId).length === 0) {
                            setCreateModalProps(null)
                            setIsCreateModalOpen(true)
                     } else {
                            setSelectedManagementBooking(bookingOrId)
                     }
              }
       }

       const handleRefresh = () => {
              router.refresh()
              setRefreshKey(prev => prev + 1)
              setSelectedManagementBooking(null)
              setIsCreateModalOpen(false)
              setCreateModalProps(null)
       }

       const handleCopyLink = () => {
              if (slug) {
                     const url = `${window.location.origin}/p/${slug}`
                     navigator.clipboard.writeText(url)
                     toast.success("Link copiado al portapapeles")
              }
       }

       return (
              <>
                     {/* MOBILE LAYOUT */}
                     <div className="lg:hidden flex flex-col min-h-screen bg-[#0F1115]">
                            {mobileView === 'dashboard' ? (
                                   <MobileDashboard
                                          user={user}
                                          clubName={clubName}
                                          logoUrl={logoUrl}
                                          onOpenBooking={handleOpenBooking}
                                          onOpenKiosco={() => setIsKioscoOpen(true)}
                                          currentView={mobileView}
                                          onNavigate={(view) => setMobileView(view as any)}
                                          notifications={notifications}
                                          unreadCount={unreadCount}
                                          onMarkAllAsRead={markAllAsRead}
                                          notificationsLoading={notificationsLoading}
                                   />
                            ) : (
                                   <div className="flex-1 flex flex-col h-[100dvh]">
                                          <div className="flex items-center justify-between p-4 bg-[#1A1D24] border-b border-white/5">
                                                 <h2 className="text-lg font-bold text-white">Reservas</h2>
                                                 <button
                                                        onClick={() => setMobileView('dashboard')}
                                                        className="text-white/50 hover:text-white px-3 py-1 bg-white/5 rounded-lg text-xs font-bold"
                                                 >
                                                        VOLVER
                                                 </button>
                                          </div>
                                          <div className="flex-1 min-h-0 overflow-y-auto">
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                 />
                                          </div>
                                   </div>
                            )}
                     </div>

                     {/* DESKTOP LAYOUT */}
                     <div className="hidden lg:flex min-h-screen bg-[#0F1115] text-white font-sans flex-col">
                            {/* HEADER */}
                            <nav className="border-b border-white/5 bg-[#0F1115]/50 backdrop-blur-md sticky top-0 z-50">
                                   <div className="px-8 h-16 flex items-center justify-between">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
                                                        <span className="material-icons-round text-slate-900">sports_tennis</span>
                                                 </div>
                                                 <div>
                                                        <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                                                               {clubName} <span className="text-[10px] font-normal text-slate-500 px-2 py-0.5 rounded border border-white/10">COURTOPS</span>
                                                        </h1>
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-6">
                                                 <div className="flex items-center gap-3">
                                                        <button
                                                               onClick={() => setIsNotificationsOpen(true)}
                                                               className="p-2 hover:bg-white/5 rounded-full relative transition-colors"
                                                        >
                                                               <span className="material-icons-round text-slate-500">notifications</span>
                                                               {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0F1115]"></span>}
                                                        </button>
                                                        <Link href="/configuracion" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                                               <span className="material-icons-round text-slate-500">settings</span>
                                                        </Link>
                                                 </div>
                                                 <div className="h-8 w-px bg-white/10"></div>
                                                 <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                               <p className="text-sm font-semibold text-white">{user?.name || 'Usuario'}</p>
                                                               <button onClick={() => signOut()} className="text-[10px] text-red-500 hover:text-red-400 font-medium uppercase tracking-wider">Cerrar Sesión</button>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-[var(--color-primary)] overflow-hidden">
                                                               <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>
                            </nav>

                            {/* MAIN GRID */}
                            <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                                   {/* LEFT COLUMN (KPIs + Turnero) */}
                                   <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 min-h-0 h-full">
                                          {/* KPI Cards */}
                                          <div className="flex-shrink-0">
                                                 <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                          </div>

                                          {/* Turnero Container OR Booking Form */}
                                          <div className="flex-1 min-h-0">
                                                 {isCreateModalOpen ? (
                                                        <div className="h-full w-full">
                                                               <BookingModal
                                                                      isOpen={true}
                                                                      inline={true}
                                                                      onClose={() => setIsCreateModalOpen(false)}
                                                                      onSuccess={handleRefresh}
                                                                      initialDate={createModalProps?.initialDate || selectedDate}
                                                                      initialCourtId={createModalProps?.initialCourtId}
                                                                      initialTime={createModalProps?.initialTime}
                                                                      courts={courts}
                                                               />
                                                        </div>
                                                 ) : (
                                                        <TurneroGrid
                                                               onBookingClick={handleOpenBooking}
                                                               refreshKey={refreshKey}
                                                               date={selectedDate}
                                                               onDateChange={setSelectedDate}
                                                        />
                                                 )}
                                          </div>
                                   </div>

                                   {/* RIGHT COLUMN (Sidebar) */}
                                   <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-10">

                                          {/* Quick Actions */}
                                          <div className="flex flex-col gap-4">
                                                 {slug && (
                                                        <button
                                                               onClick={handleCopyLink}
                                                               className="w-full bg-[var(--color-accent-blue)]/10 hover:bg-[var(--color-accent-blue)]/20 border border-[var(--color-accent-blue)]/30 p-3 rounded-xl flex items-center justify-between group transition-all"
                                                        >
                                                               <div className="flex items-center gap-3">
                                                                      <span className="material-icons-round text-[var(--color-accent-blue)]">language</span>
                                                                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-blue)]">Link Público Reserva</span>
                                                               </div>
                                                               <span className="material-icons-round text-sm text-[var(--color-accent-blue)] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                                                        </button>
                                                 )}

                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                               onClick={() => setIsCreateModalOpen(true)}
                                                               className={cn(
                                                                      "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 shadow-lg",
                                                                      isCreateModalOpen
                                                                             ? "bg-[#1A1D24] border border-white/10 text-white/50 cursor-default"
                                                                             : "bg-[var(--color-accent-blue)] text-white hover:brightness-110 shadow-[var(--color-accent-blue)]/20"
                                                               )}
                                                        >
                                                               <span className="material-icons-round">add_box</span>
                                                               <span className="text-[11px] font-bold uppercase">Reserva</span>
                                                        </button>

                                                        <button
                                                               onClick={() => features.hasKiosco && setIsKioscoOpen(true)}
                                                               className="glass p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                                                        >
                                                               <span className="material-icons-round text-slate-400">shopping_cart</span>
                                                               <span className="text-[11px] font-bold uppercase">Kiosco</span>
                                                        </button>

                                                        <Link href="/clientes" className="glass p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95">
                                                               <span className="material-icons-round text-slate-400">group</span>
                                                               <span className="text-[11px] font-bold uppercase">Clientes</span>
                                                        </Link>

                                                        {isStaff(user?.role) && (
                                                               <Link href="/reportes" className="glass p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95">
                                                                      <span className="material-icons-round text-slate-400">bar_chart</span>
                                                                      <span className="text-[11px] font-bold uppercase">Reportes</span>
                                                               </Link>
                                                        )}

                                                        {isAdmin(user?.role) && (
                                                               <Link href="/actividad" className="glass col-span-2 p-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95">
                                                                      <span className="material-icons-round text-slate-400">history</span>
                                                                      <span className="text-[11px] font-bold uppercase tracking-wider">Actividad Reciente</span>
                                                               </Link>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* Widgets */}
                                          <div className="space-y-6">
                                                 <CajaWidget />
                                                 <AlertsWidget onAlertClick={handleOpenBooking} />
                                          </div>

                                   </aside>
                            </main>
                     </div>

                     <KioscoModal isOpen={isKioscoOpen} onClose={() => setIsKioscoOpen(false)} />

                     {selectedManagementBooking && (
                            <BookingManagementModal
                                   booking={selectedManagementBooking}
                                   onClose={() => setSelectedManagementBooking(null)}
                                   onUpdate={handleRefresh}
                            />
                     )}

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkAllAsRead={markAllAsRead}
                            isLoading={notificationsLoading}
                     />
              </>
       )
}
