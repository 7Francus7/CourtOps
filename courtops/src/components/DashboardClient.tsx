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
import { Header } from '@/components/layout/Header'

import BookingModal from '@/components/BookingModal'
import { getCourts } from '@/actions/dashboard'
import { Bell, ExternalLink, Plus, Lock, UserCog, LogOut, ShoppingCart, Users, History, BarChart } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { ROLES, isAdmin, isStaff } from '@/lib/permissions'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'
import { useEmployee } from '@/contexts/EmployeeContext'

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

       const { activeEmployee, lockTerminal, logoutEmployee } = useEmployee()

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

       const displayedName = activeEmployee ? activeEmployee.name : (user?.name || 'Usuario');
       const isEmployeeActive = !!activeEmployee;

       return (
              <>
                     {/* MOBILE LAYOUT */}
                     <div className="lg:hidden flex flex-col min-h-screen bg-[var(--bg-dark)]">
                            {mobileView === 'dashboard' ? (
                                   <MobileDashboard
                                          user={activeEmployee || user}
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
                                          <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border-b border-white/5">
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
                     <div className="hidden lg:flex min-h-screen bg-[var(--bg-dark)] text-white font-sans flex-col w-full">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden min-h-0">

                                   {/* LEFT COLUMN (KPIs + Turnero) */}
                                   <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 min-h-0 h-full">
                                          {/* KPI Cards */}
                                          <div className="flex-shrink-0">
                                                 <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                          </div>

                                          {/* Turnero Container */}
                                          <div className="flex-1 min-h-0">
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                 />
                                          </div>
                                   </div>

                                   {/* RIGHT COLUMN (Sidebar) */}
                                   <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-10">

                                          {/* Quick Actions */}
                                          <div className="flex flex-col gap-4">
                                                 {slug && (
                                                        <button
                                                               onClick={handleCopyLink}
                                                               className="w-full bg-[var(--brand-blue)]/5 hover:bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 p-3 rounded-xl flex items-center justify-between group transition-all"
                                                        >
                                                               <div className="flex items-center gap-3">
                                                                      <span className="material-icons-round text-[var(--brand-blue)]">language</span>
                                                                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-blue)]">Link Público Reserva</span>
                                                               </div>
                                                               <span className="material-icons-round text-sm text-[var(--brand-blue)] group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
                                                        </button>
                                                 )}

                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                               onClick={() => setIsCreateModalOpen(true)}
                                                               className="bg-[var(--brand-blue)] text-white p-4 rounded-2xl flex flex-col items-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[var(--brand-blue)]/20 col-span-2"
                                                        >
                                                               <Plus size={24} />
                                                               <span className="text-[11px] font-bold uppercase">Nueva Reserva</span>
                                                        </button>

                                                        <button
                                                               onClick={() => features.hasKiosco && setIsKioscoOpen(true)}
                                                               className="bg-[var(--bg-card)] p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 border border-white/5"
                                                        >
                                                               <ShoppingCart className="text-slate-400" size={24} />
                                                               <span className="text-[11px] font-bold uppercase">Kiosco</span>
                                                        </button>

                                                        <Link href="/clientes" className="bg-[var(--bg-card)] p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 border border-white/5">
                                                               <Users className="text-slate-400" size={24} />
                                                               <span className="text-[11px] font-bold uppercase">Clientes</span>
                                                        </Link>

                                                        {isStaff(user?.role) && (
                                                               <Link href="/reportes" className="bg-[var(--bg-card)] p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 border border-white/5">
                                                                      <BarChart className="text-slate-400" size={24} />
                                                                      <span className="text-[11px] font-bold uppercase">Reportes</span>
                                                               </Link>
                                                        )}

                                                        {isAdmin(user?.role) && (
                                                               <Link href="/actividad" className="bg-[var(--bg-card)] p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 border border-white/5">
                                                                      <History className="text-slate-400" size={24} />
                                                                      <span className="text-[11px] font-bold uppercase tracking-wider">Actividad</span>
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

                     {isCreateModalOpen && (
                            <BookingModal
                                   isOpen={isCreateModalOpen}
                                   onClose={() => setIsCreateModalOpen(false)}
                                   onSuccess={handleRefresh}
                                   initialDate={createModalProps?.initialDate || selectedDate}
                                   initialCourtId={createModalProps?.initialCourtId}
                                   initialTime={createModalProps?.initialTime}
                                   courts={courts}
                            />
                     )}

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
