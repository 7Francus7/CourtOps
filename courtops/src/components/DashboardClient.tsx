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
import RevenueHeatmap from '@/components/RevenueHeatmap'
import { Header } from '@/components/layout/Header'

import BookingModal from '@/components/BookingModal'
import { getCourts } from '@/actions/dashboard'
import { Bell, ExternalLink, Plus, Lock, UserCog, LogOut, ShoppingCart, Users, History, BarChart, Globe, ChevronRight, ArrowRight } from 'lucide-react'
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
                            <main className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-hidden min-h-0">

                                   {/* BANNER LINK */}
                                   <div className="col-span-12">
                                          <div className="relative overflow-hidden bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-0.5 shadow-lg shadow-primary/20 group cursor-pointer transition-all hover:shadow-primary/40 hover:scale-[1.01]"
                                                 onClick={handleCopyLink}
                                          >
                                                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
                                                 <div className="relative bg-black/10 backdrop-blur-sm p-4 flex items-center justify-between text-white rounded-[14px]">
                                                        <div className="flex items-center gap-4">
                                                               <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                                                                      <Globe size={24} className="text-white" />
                                                               </div>
                                                               <div>
                                                                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Link de Reserva</p>
                                                                      <p className="font-bold text-lg tracking-tight font-display">{`courtops.com/${slug || 'club'}`}</p>
                                                               </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                               <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                                                      Copiar Link
                                                               </span>
                                                               <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                                                      <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                                               </div>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>


                                   {/* LEFT COLUMN (KPIs + Turnero) */}
                                   <div className="col-span-12 lg:col-span-9 flex flex-col gap-6 min-h-0 h-full">
                                          {/* KPI Cards */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="flex-shrink-0 animate-in slide-in-from-top-4 fade-in duration-500">
                                                        <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                                 </div>
                                          )}

                                          {/* Turnero Container */}
                                          <div className="flex-1 min-h-0 flex flex-col bg-card-dark/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                 />
                                          </div>
                                   </div>

                                   {/* RIGHT COLUMN (Sidebar) */}
                                   <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pb-10 pr-2">
                                          {/* Quick Actions Grid */}
                                          <div className="grid grid-cols-2 gap-3">
                                                 <button
                                                        onClick={() => {
                                                               if (features.hasKiosco) setIsKioscoOpen(true)
                                                               else toast.error('Función no habilitada en su plan')
                                                        }}
                                                        className="aspect-square glass-panel hover:bg-primary/10 border-white/5 hover:border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg shadow-black/10 hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden"
                                                 >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                               <ShoppingCart className="text-primary" size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors relative z-10">Kiosco</span>
                                                 </button>

                                                 <Link href="/clientes" className="aspect-square glass-panel hover:bg-blue-500/10 border-white/5 hover:border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg shadow-black/10 hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                               <Users className="text-blue-500" size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors relative z-10">Clientes</span>
                                                 </Link>

                                                 <Link href="/reportes" className="aspect-square glass-panel hover:bg-orange-500/10 border-white/5 hover:border-orange-500/30 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg shadow-black/10 hover:shadow-orange-500/10 hover:-translate-y-1 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                               <BarChart className="text-orange-500" size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-orange-500 transition-colors relative z-10">Reportes</span>
                                                 </Link>

                                                 <Link href="/actividad" className="aspect-square glass-panel hover:bg-purple-500/10 border-white/5 hover:border-purple-500/30 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 group shadow-lg shadow-black/10 hover:shadow-purple-500/10 hover:-translate-y-1 relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                               <History className="text-purple-500" size={24} />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-500 transition-colors relative z-10">Actividad</span>
                                                 </Link>
                                          </div>

                                          {/* Widgets */}
                                          <div className="space-y-6">
                                                 <RevenueHeatmap />
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
