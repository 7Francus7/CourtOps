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
                     <div className="hidden lg:flex h-full bg-[var(--background)] text-slate-800 dark:text-white font-sans flex-col w-full overflow-hidden">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden min-h-0">

                                   {/* LEFT COLUMN (KPIs + Turnero) - Expanded to take more focus */}
                                   <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 min-h-0 h-full">
                                          {/* KPI Cards */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="flex-shrink-0">
                                                        <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                                 </div>
                                          )}

                                          {/* Turnero Container */}
                                          <div className="flex-1 min-h-0 flex flex-col bg-card-dark border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                 />
                                          </div>
                                   </div>

                                   {/* RIGHT COLUMN (Sidebar) - Simplified */}
                                   <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pb-2 pr-1">

                                          {/* 1. Quick Actions List */}
                                          <div className="bg-card-dark rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                                                 <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 px-1">Acciones Rápidas</h3>

                                                 <button
                                                        onClick={() => {
                                                               if (features.hasKiosco) setIsKioscoOpen(true)
                                                               else toast.error('Función no habilitada en su plan')
                                                        }}
                                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left"
                                                 >
                                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                               <ShoppingCart size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-white">Abrir Kiosco</span>
                                                               <span className="text-[10px] text-muted-foreground">Vender productos</span>
                                                        </div>
                                                 </button>

                                                 <Link href="/clientes" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left">
                                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                               <Users size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-white">Clientes</span>
                                                               <span className="text-[10px] text-muted-foreground">Gestionar base de datos</span>
                                                        </div>
                                                 </Link>

                                                 <Link href="/reportes" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group text-left">
                                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                                               <BarChart size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-white">Reportes</span>
                                                               <span className="text-[10px] text-muted-foreground">Ver estadísticas</span>
                                                        </div>
                                                 </Link>
                                          </div>

                                          {/* 2. Link Card */}
                                          <div
                                                 onClick={handleCopyLink}
                                                 className="bg-card-dark rounded-xl border border-white/5 p-4 cursor-pointer hover:bg-white/5 transition-all group"
                                          >
                                                 <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2 text-indigo-400">
                                                               <Globe size={16} />
                                                               <span className="text-xs font-bold uppercase tracking-wider">Link Público</span>
                                                        </div>
                                                        <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                                 </div>
                                                 <p className="text-xs text-muted-foreground truncate font-mono bg-black/20 p-2 rounded-lg border border-white/5">
                                                        courtops.com/{slug || 'club'}
                                                 </p>
                                          </div>

                                          {/* 3. Widgets */}
                                          <div className="flex-1 flex flex-col gap-4">
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
