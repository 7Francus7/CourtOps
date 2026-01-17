'use client'

import { signOut } from 'next-auth/react'
import TurneroGrid from '@/components/TurneroGrid'
import CajaWidget from '@/components/CajaWidget'
import { useState, useEffect } from 'react'
import KioscoModal from '@/components/KioscoModal'
import Link from 'next/link'
import AlertsWidget from '@/components/AlertsWidget'
import BookingManagementModal from '@/components/BookingManagementModal'
import { useRouter, useSearchParams } from 'next/navigation'

import MobileDashboard from '@/components/MobileDashboard'
import NotificationsSheet from '@/components/NotificationsSheet'
import { Header } from '@/components/layout/Header'

import BookingModal from '@/components/BookingModal'
import { getCourts } from '@/actions/dashboard'
import { Bell, ExternalLink, Plus, Lock, UserCog, LogOut, ShoppingCart, Users, History, BarChart, Globe, ChevronRight } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { ROLES, isAdmin, isStaff } from '@/lib/permissions'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'
import { useEmployee } from '@/contexts/EmployeeContext'

import { ThemeRegistry } from './ThemeRegistry'

export default function DashboardClient({
       user,
       clubName,
       logoUrl,
       slug,
       features = { hasKiosco: true },
       themeColor
}: {
       user: any,
       clubName: string,
       logoUrl?: string | null,
       slug?: string,
       features?: { hasKiosco: boolean },
       themeColor?: string | null
}) {
       const [isKioscoOpen, setIsKioscoOpen] = useState(false)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [selectedManagementBooking, setSelectedManagementBooking] = useState<any>(null)

       // Lifted State for Turnero
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())

       const searchParams = useSearchParams()
       const initialView = searchParams.get('view') === 'bookings' ? 'calendar' : 'dashboard'

       // Mobile View State
       const [mobileView, setMobileView] = useState<'dashboard' | 'calendar'>(initialView)

       // Effect to sync URL with state
       useEffect(() => {
              const view = searchParams.get('view')
              if (view === 'bookings') {
                     setMobileView('calendar')
              } else {
                     setMobileView('dashboard')
              }
       }, [searchParams])

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
                     <ThemeRegistry themeColor={themeColor} />
                     {/* MOBILE LAYOUT */}
                     <div className="lg:hidden flex flex-col h-full bg-[var(--bg-dark)]">
                            {mobileView === 'dashboard' ? (
                                   <MobileDashboard
                                          user={activeEmployee || user}
                                          clubName={clubName}
                                          logoUrl={logoUrl}
                                          onOpenBooking={handleOpenBooking}
                                          onOpenKiosco={() => setIsKioscoOpen(true)}
                                          currentView={mobileView}
                                          onNavigate={(view) => {
                                                 if (view === 'calendar') {
                                                        router.push('?view=bookings')
                                                 } else {
                                                        router.push('/dashboard')
                                                 }
                                          }}
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
                                          <div className="flex-1 min-h-0 overflow-y-auto pb-20">
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
                     <div className="hidden lg:flex min-h-screen bg-[var(--background)] text-slate-800 dark:text-white font-sans flex-col w-full overflow-hidden">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden min-h-0">

                                   {/* LEFT COLUMN (KPIs + Turnero) */}
                                   <div className="col-span-12 lg:col-span-9 flex flex-col gap-8 min-h-0 h-full">
                                          {/* KPI Cards */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="flex-shrink-0 animate-in slide-in-from-top-4 fade-in duration-500">
                                                        <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                                 </div>
                                          )}

                                          {/* Turnero Container */}
                                          <div className="flex-1 min-h-0 flex flex-col">
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

                                          {/* Link Público Action */}
                                          {slug && (
                                                 <button
                                                        onClick={handleCopyLink}
                                                        className="group w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl shadow-[0_0_10px_rgba(0,128,255,0.4)] hover:brightness-110 transition-all"
                                                 >
                                                        <div className="flex items-center gap-3">
                                                               <Globe size={20} />
                                                               <span className="text-xs font-black uppercase tracking-widest">Link Público Reserva</span>
                                                        </div>
                                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                 </button>
                                          )}

                                          {/* Quick Actions Grid */}
                                          <div className="grid grid-cols-2 gap-3">
                                                 <button
                                                        onClick={() => features.hasKiosco && setIsKioscoOpen(true)}
                                                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl hover:border-primary transition-all gap-2 group shadow-sm"
                                                 >
                                                        <ShoppingCart className="text-primary w-8 h-8 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-wider dark:text-white">Kiosco</span>
                                                 </button>

                                                 <Link href="/clientes" className="flex flex-col items-center justify-center p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl hover:border-secondary transition-all gap-2 group shadow-sm">
                                                        <Users className="text-secondary w-8 h-8 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-wider dark:text-white">Clientes</span>
                                                 </Link>

                                                 {isStaff(user?.role) && (
                                                        <Link href="/reportes" className="flex flex-col items-center justify-center p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl hover:border-accent transition-all gap-2 group shadow-sm">
                                                               <BarChart className="text-accent w-8 h-8 group-hover:scale-110 transition-transform" />
                                                               <span className="text-[10px] font-black uppercase tracking-wider dark:text-white">Reportes</span>
                                                        </Link>
                                                 )}

                                                 {isAdmin(user?.role) && (
                                                        <Link href="/actividad" className="flex flex-col items-center justify-center p-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl hover:border-danger transition-all gap-2 group shadow-sm">
                                                               <History className="text-danger w-8 h-8 group-hover:scale-110 transition-transform" />
                                                               <span className="text-[10px] font-black uppercase tracking-wider dark:text-white">Actividad</span>
                                                        </Link>
                                                 )}
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
