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
import MobileTurnero from '@/components/MobileTurnero'
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
import { DashboardSkeleton } from './SkeletonDashboard'
import RevenueHeatmap from '@/components/RevenueHeatmap'

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
       const [showHeatmap, setShowHeatmap] = useState(false)
       const [showRightSidebar, setShowRightSidebar] = useState(true)

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

       const [initialLoading, setInitialLoading] = useState(true)

       // Load Courts for Global Creation Modal
       useEffect(() => {
              getCourts().then(data => {
                     setCourts(data)
                     setInitialLoading(false)
              }).catch(err => {
                     console.error(err)
                     setInitialLoading(false)
              })
       }, [])

       if (initialLoading) return (
              <div className="h-screen w-full bg-[#09090b] p-6 lg:p-8 overflow-hidden flex flex-col gap-6">
                     <header className="flex justify-between items-center mb-2">
                            <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                            <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                     </header>
                     <DashboardSkeleton />
              </div>
       )

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
                     <div className="md:hidden flex flex-col h-full bg-[var(--bg-dark)]">
                            {mobileView === 'dashboard' ? (
                                   <MobileDashboard
                                          user={activeEmployee || user}
                                          clubName={clubName}
                                          logoUrl={logoUrl}
                                          slug={slug}
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
                                          <MobileTurnero
                                                 date={selectedDate}
                                                 onDateChange={setSelectedDate}
                                                 onBookingClick={handleOpenBooking}
                                                 onBack={() => setMobileView('dashboard')}
                                          />
                                   </div>
                            )}
                     </div>

                     {/* DESKTOP LAYOUT */}
                     <div className="hidden md:flex h-full bg-[var(--background)] text-slate-800 dark:text-white font-sans flex-col w-full overflow-hidden">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 p-3 grid grid-cols-12 gap-3 min-h-0 md:overflow-y-auto lg:overflow-hidden">

                                   {/* LEFT COLUMN (KPIs + Turnero) */}
                                   <div className={`col-span-12 flex flex-col gap-3 min-h-0 md:h-[800px] lg:h-full transition-all duration-300 ${showRightSidebar ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
                                          {/* KPI Cards */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="flex-shrink-0">
                                                        <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                                 </div>
                                          )}

                                          {/* Stats Toggle (Heatmap) & Sidebar Toggle */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="flex justify-end px-1 gap-2">
                                                        <button
                                                               onClick={() => setShowHeatmap(!showHeatmap)}
                                                               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full"
                                                        >
                                                               <BarChart size={12} />
                                                               {showHeatmap ? 'Ocultar Mapa' : 'Ver Mapa'}
                                                        </button>

                                                        <button
                                                               onClick={() => setShowRightSidebar(!showRightSidebar)}
                                                               className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full"
                                                        >
                                                               <ChevronRight size={12} className={showRightSidebar ? "rotate-0 transition-transform" : "rotate-180 transition-transform"} />
                                                               {showRightSidebar ? 'Ocultar Panel' : 'Mostrar Panel'}
                                                        </button>
                                                 </div>
                                          )}

                                          {/* Heatmap Section */}
                                          {showHeatmap && (
                                                 <div className="animate-in fade-in zoom-in-95 duration-200">
                                                        <RevenueHeatmap />
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

                                   {/* RIGHT COLUMN (Sidebar) */}
                                   <aside className={`col-span-12 flex-col gap-3 md:h-auto lg:h-full lg:overflow-y-auto custom-scrollbar pb-1 pr-1 transition-all duration-300 ${showRightSidebar ? 'flex lg:col-span-3' : 'hidden'}`}>

                                          {/* 1. Quick Actions Grid */}
                                          <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                                                 <div className="flex items-center gap-2 px-1">
                                                        <div className="h-1 w-1 rounded-full bg-primary/50"></div>
                                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Acceso Rápido</h3>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                               onClick={() => {
                                                                      if (features.hasKiosco) setIsKioscoOpen(true)
                                                                      else toast.error('Función no habilitada en su plan')
                                                               }}
                                                               className="glass-shiny group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 transition-all duration-300"
                                                        >
                                                               <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:to-emerald-500/10 transition-all rounded-xl" />
                                                               <div className="p-2.5 bg-[#0C1210] rounded-full text-emerald-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                                                                      <ShoppingCart size={20} />
                                                               </div>
                                                               <span className="text-xs font-bold text-white/80 group-hover:text-white">Kiosco</span>
                                                        </button>

                                                        <Link href="/clientes" className="glass-shiny group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                                                               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:to-blue-500/10 transition-all rounded-xl" />
                                                               <div className="p-2.5 bg-[#0C0F14] rounded-full text-blue-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                                                                      <Users size={20} />
                                                               </div>
                                                               <span className="text-xs font-bold text-white/80 group-hover:text-white">Clientes</span>
                                                        </Link>

                                                        <Link href="/reportes" className="glass-shiny group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-all duration-300">
                                                               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:to-amber-500/10 transition-all rounded-xl" />
                                                               <div className="p-2.5 bg-[#14100C] rounded-full text-amber-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                                                                      <BarChart size={20} />
                                                               </div>
                                                               <span className="text-xs font-bold text-white/80 group-hover:text-white">Reportes</span>
                                                        </Link>

                                                        <Link href="/configuracion" className="glass-shiny group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                                                               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:to-purple-500/10 transition-all rounded-xl" />
                                                               <div className="p-2.5 bg-[#120C14] rounded-full text-purple-500 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                                                                      <UserCog size={20} />
                                                               </div>
                                                               <span className="text-xs font-bold text-white/80 group-hover:text-white">Ajustes</span>
                                                        </Link>
                                                 </div>
                                          </div>

                                          {/* 2. Link Card */}
                                          <div
                                                 onClick={handleCopyLink}
                                                 className="glass-card rounded-xl p-4 cursor-pointer hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-2 opacity-50">
                                                        <ExternalLink size={14} className="text-white/30 group-hover:text-white transition-colors" />
                                                 </div>
                                                 <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                               <Globe size={16} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                               <span className="text-xs font-bold uppercase tracking-wider text-white">Link Público</span>
                                                               <span className="text-[10px] text-muted-foreground">Comparte tu club</span>
                                                        </div>
                                                 </div>
                                                 <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 flex items-center justify-between group-hover:border-indigo-500/30 transition-colors">
                                                        <span className="text-xs text-white/60 font-mono truncate">
                                                               courtops.com/{slug || 'club'}
                                                        </span>
                                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">COPY</span>
                                                 </div>
                                          </div>

                                          {/* 3. Widgets */}
                                          <div className="flex-1 flex flex-col gap-4 min-h-0">
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
