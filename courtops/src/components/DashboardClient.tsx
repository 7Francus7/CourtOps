'use client'

import { signOut } from 'next-auth/react'
import TurneroGrid from '@/components/TurneroGrid'
import { useState, useEffect, useCallback } from 'react'
import BookingManagementModal from '@/components/BookingManagementModal'
import { useRouter, useSearchParams } from 'next/navigation'

import MobileDashboard from '@/components/MobileDashboard'
import MobileTurnero from '@/components/MobileTurnero'
import NotificationsSheet from '@/components/NotificationsSheet'
import { Header } from '@/components/layout/Header'

import dynamic from 'next/dynamic'
import { getCourts } from '@/actions/dashboard'
import { useNotifications } from '@/hooks/useNotifications'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'
import { useEmployee } from '@/contexts/EmployeeContext'

const BookingModal = dynamic(() => import('@/components/BookingModal'), { ssr: false })
const OnboardingWizard = dynamic(() => import('@/components/onboarding/OnboardingWizard'), { ssr: false })

import { ThemeRegistry } from './ThemeRegistry'
import { DashboardSkeleton } from './SkeletonDashboard'
import { addDays, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Store, Plus, Globe } from 'lucide-react'

export default function DashboardClient({
       user,
       clubName,
       logoUrl,
       slug,
       features = { hasKiosco: true },
       themeColor,
       showOnboarding = false
}: {
       user: any,
       clubName: string,
       logoUrl?: string | null,
       slug?: string,
       features?: { hasKiosco: boolean },
       themeColor?: string | null,
       showOnboarding?: boolean
}) {
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [selectedManagementBooking, setSelectedManagementBooking] = useState<any>(null)
       const [showHeatmap, setShowHeatmap] = useState(false)
       const [showRightSidebar, setShowRightSidebar] = useState(true)
       const [showAdvancedStats, setShowAdvancedStats] = useState(false)

       // Lifted State for Turnero
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())

       const searchParams = useSearchParams()
       const initialView = searchParams.get('view') === 'bookings' ? 'calendar' : 'dashboard'

       // Mobile View State
       const [mobileView, setMobileView] = useState<'dashboard' | 'calendar'>(initialView)

       // Effect to sync URL with state
       useEffect(() => {
              const view = searchParams.get('view')
              const modal = searchParams.get('modal')

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

       const handleOpenNewBooking = useCallback((data: { courtId?: number, time?: string, date: Date }) => {
              setCreateModalProps({
                     initialDate: data.date,
                     initialCourtId: data.courtId,
                     initialTime: data.time
              })
              setIsCreateModalOpen(true)
       }, [])

       const handleOpenBooking = useCallback((bookingOrId: any) => {
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
                     if (bookingOrId && Object.keys(bookingOrId).length > 0) {
                            setSelectedManagementBooking(bookingOrId)
                     }
              }
       }, [])

       const handleRefresh = useCallback(() => {
              router.refresh()
              setRefreshKey(prev => prev + 1)
              setSelectedManagementBooking(null)
              setIsCreateModalOpen(false)
              setCreateModalProps(null)
       }, [router])

       const handleCopyLink = useCallback(() => {
              if (slug) {
                     const url = `${window.location.origin}/p/${slug}`
                     navigator.clipboard.writeText(url)
                     toast.success("Link copiado al portapapeles")
              }
       }, [slug])

       if (initialLoading) return (
              <div className="h-screen w-full bg-background p-6 lg:p-8 overflow-hidden flex flex-col gap-6">
                     <header className="flex justify-between items-center mb-2">
                            <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                            <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                     </header>
                     <DashboardSkeleton />
              </div>
       )

       const displayedName = activeEmployee ? activeEmployee.name : (user?.name || 'Usuario');
       const isEmployeeActive = !!activeEmployee;

       return (
              <>
                     <ThemeRegistry themeColor={themeColor} />
                     {/* MOBILE LAYOUT */}
                     <div className="md:hidden flex flex-col h-full bg-background">
                            {mobileView === 'dashboard' ? (
                                   <MobileDashboard
                                          user={activeEmployee || user}
                                          clubName={clubName}
                                          logoUrl={logoUrl}
                                          slug={slug}
                                          onOpenBooking={handleOpenBooking}
                                          onOpenKiosco={() => router.push('?modal=kiosco')}
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
                     <div className="hidden md:flex h-full bg-background text-foreground font-sans flex-col w-full overflow-hidden">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 flex flex-col min-h-0 bg-background md:overflow-y-auto lg:overflow-hidden p-3 gap-3">

                                   {/* FULL WIDTH COLUMN (KPIs + Turnero) */}
                                   <div className="flex-1 flex flex-col gap-3 min-h-0">

                                          {/* TOP STATS BAR */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="w-full shrink-0">
                                                        <DashboardStats
                                                               date={selectedDate}
                                                               refreshKey={refreshKey}
                                                               expanded={showAdvancedStats}
                                                               onToggle={() => setShowAdvancedStats(!showAdvancedStats)}
                                                        />
                                                 </div>
                                          )}

                                          {/* MAIN CONTENT AREA */}
                                          <div className="flex-1 min-h-0 flex flex-col bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] overflow-hidden shadow-2xl relative">

                                                 {/* UNIFIED CONTROL BAR (Date & Actions) - Responsive Wrapper */}
                                                 <div className="shrink-0 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-6 lg:h-20 bg-background/50 backdrop-blur-md z-20 relative gap-4 lg:gap-0">

                                                        {/* LEFT: Date Nav & Title */}
                                                        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-start">
                                                               {/* Date Navigation Pill */}
                                                               <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border shadow-sm">
                                                                      <button onClick={() => setSelectedDate(prev => subDays(prev, 1))} className="p-1.5 hover:bg-[#27272a] rounded-lg text-slate-400 hover:text-white transition-colors">
                                                                             <ChevronLeft size={16} />
                                                                      </button>
                                                                      <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 text-[10px] font-black text-foreground/80 hover:text-foreground transition-colors uppercase tracking-widest">
                                                                             Hoy
                                                                      </button>
                                                                      <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="p-1.5 hover:bg-[#27272a] rounded-lg text-slate-400 hover:text-white transition-colors">
                                                                             <ChevronRight size={16} />
                                                                      </button>
                                                               </div>

                                                               {/* Date Text */}
                                                               <div className="flex flex-col justify-center">
                                                                      <span className="text-lg lg:text-xl font-black text-foreground capitalize leading-none tracking-tight">
                                                                             {selectedDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric' })}
                                                                      </span>
                                                                      <span className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                                                                             {selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                                                                      </span>
                                                               </div>
                                                        </div>

                                                        {/* RIGHT: Actions */}
                                                        <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto pb-0 no-scrollbar w-full lg:w-auto justify-end">
                                                               {/* Advanced Metrics Link - Hidden on Mobile/Tablet to save space, relies on toggle */}
                                                               <button
                                                                      onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                                                                      className="hidden xl:block text-[10px] font-bold text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-slate-500 pb-0.5 uppercase tracking-wider whitespace-nowrap"
                                                               >
                                                                      {showAdvancedStats ? 'Ocultar Métricas' : 'Ver Métricas'}
                                                               </button>

                                                               {/* Public Link Button */}
                                                               <button
                                                                      onClick={handleCopyLink}
                                                                      className="flex items-center gap-2 px-3 py-2 bg-[#111418] hover:bg-[#1A1D21] text-indigo-400 hover:text-indigo-300 rounded-xl border border-indigo-500/10 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm hover:shadow-indigo-500/10 whitespace-nowrap"
                                                               >
                                                                      <Globe size={14} className="shrink-0" />
                                                                      <span className="hidden sm:inline">Link Público</span>
                                                                      <span className="inline sm:hidden">Link</span>
                                                               </button>

                                                               {/* Create Button */}
                                                               <button
                                                                      onClick={() => setIsCreateModalOpen(true)}
                                                                      className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#022c22] px-4 py-2 lg:px-6 lg:py-2.5 rounded-xl font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)] transition-all active:scale-95 whitespace-nowrap"
                                                               >
                                                                      <Plus size={16} strokeWidth={4} />
                                                                      <span className="hidden sm:inline">NUEVA RESERVA</span>
                                                                      <span className="inline sm:hidden">RESERVAR</span>
                                                               </button>
                                                        </div>
                                                 </div>

                                                 {/* GRID */}
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        onNewBooking={handleOpenNewBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
                                                        hideHeader={true}
                                                 />
                                          </div>
                                   </div>
                            </main>
                     </div>

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

                     {showOnboarding && <OnboardingWizard />}
              </>
       )
}
