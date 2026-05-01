'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { nowInArg } from '@/lib/date-utils'
import { useNotifications } from '@/hooks/useNotifications'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'
import { useEmployee } from '@/contexts/EmployeeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useQueryClient } from '@tanstack/react-query'

const BookingModal = dynamic(() => import('@/components/BookingModal'), { ssr: false })
const OnboardingWizard = dynamic(() => import('@/components/onboarding/OnboardingWizard'), { ssr: false })
const DashboardTutorial = dynamic(() => import('@/components/onboarding/DashboardTutorial'), { ssr: false })
const HelpSheet = dynamic(() => import('@/components/onboarding/HelpSheet'), { ssr: false })
const BookingManagementModal = dynamic(() => import('@/components/BookingManagementModal'), { ssr: false })
const NotificationsSheet = dynamic(() => import('@/components/NotificationsSheet'), { ssr: false })
const TurneroGrid = dynamic(() => import('@/components/TurneroGrid'), { ssr: false })
const MobileDashboard = dynamic(() => import('@/components/MobileDashboard'), { ssr: false })
const MobileTurnero = dynamic(() => import('@/components/MobileTurnero'), { ssr: false })
const FlyerGenerator = dynamic(() => import('@/components/FlyerGenerator'), { ssr: false })
const KioscoModal = dynamic(() => import('@/components/KioscoModal'), { ssr: false })
const PublicBookingGrowthKit = dynamic(() => import('@/components/PublicBookingGrowthKit'), { ssr: false })

import { ThemeRegistry } from './ThemeRegistry'
import { DashboardSkeleton } from './SkeletonDashboard'
import { Info, X, AlertTriangle, Settings } from 'lucide-react'

import { DashboardControlBar } from '@/components/dashboard/DashboardControlBar'

export default function DashboardClient({
	user,
	clubName,
	logoUrl,
	slug,
	features,
	themeColor,
	showOnboarding = false,
	activeNotification,
	alerts
}: {
	user: Record<string, unknown>,
	clubName: string,
	logoUrl?: string | null,
	slug?: string,
	features?: { hasKiosco: boolean },
	themeColor?: string | null,
	showOnboarding?: boolean,
	activeNotification?: Record<string, unknown> | null,
	alerts?: { trialExpiring?: boolean; noCourts?: boolean }
}) {
       useTheme()
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [selectedManagementBooking, setSelectedManagementBooking] = useState<Record<string, unknown> | null>(null)
       const [showAdvancedStats, setShowAdvancedStats] = useState(false)
       const [onboardingDismissed] = useState(() => {
              if (typeof window !== 'undefined') {
                     return localStorage.getItem('courtops_onboarding_complete') === 'true'
              }
              return false
       })

       const [maintenanceDismissed, setMaintenanceDismissed] = useState(false)
       const showMaintenance = !!activeNotification && !maintenanceDismissed && (activeNotification.type === 'WARNING' || activeNotification.type === 'INFO' || activeNotification.type === 'ERROR')

       // Lifted State for Turnero
       const [selectedDate, setSelectedDate] = useState<Date>(() => nowInArg())

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

              const action = searchParams.get('action')
              if (action === 'new_booking') {
                     setIsCreateModalOpen(true)
              }

              const modal = searchParams.get('modal')
              if (modal === 'help') {
                     setIsHelpOpen(true)
              }
              setIsGrowthKitOpen(modal === 'growth')
              setIsKioscoOpen(modal === 'kiosco' && !!features?.hasKiosco)
       }, [searchParams, features?.hasKiosco])

       // Creation State
       const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
       const [createModalProps, setCreateModalProps] = useState<{
              initialDate?: Date
              initialCourtId?: number
              initialTime?: string
              initialClientName?: string
              initialClientPhone?: string
              initialClientEmail?: string
              initialNotes?: string
              initialWaitingListId?: number
       } | null>(null)
       const [courts, setCourts] = useState<{ id: number; name: string; duration?: number }[]>([])

       // Flyer State
       const [isFlyerOpen, setIsFlyerOpen] = useState(false)
       const [flyerProps, setFlyerProps] = useState<{ time: string, courtName: string } | null>(null)

       const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()

       const { activeEmployee } = useEmployee()

       const [refreshKey, setRefreshKey] = useState(0)

       const router = useRouter()
       const queryClient = useQueryClient()

       const [isMounted, setIsMounted] = useState(false)
       const [initialLoading, setInitialLoading] = useState(true)

       useEffect(() => {
              setIsMounted(true)
       }, [])

       // Load Courts for Global Creation Modal via API endpoint (client-side)
       useEffect(() => {
              ; (async () => {
                     const controller = new AbortController()
                     const timeout = setTimeout(() => controller.abort(), 6000)
                     try {
                            setInitialLoading(true)
                            const res = await fetch('/api/dashboard/courts', { signal: controller.signal })
                            if (!res.ok) throw new Error('Failed to load courts')
                            const data = await res.json()
                            setCourts(data || [])
                     } catch (err) {
                            if (!(err instanceof DOMException && err.name === 'AbortError')) {
                                   console.error('Error loading courts:', err)
                            }
                            setCourts([])
                     } finally {
                            clearTimeout(timeout)
                            setInitialLoading(false)
                     }
              })()
       }, [])

       const handleOpenNewBooking = useCallback((data: {
              courtId?: number
              time?: string
              date: Date
              clientName?: string
              clientPhone?: string
              clientEmail?: string
              notes?: string
              waitingListId?: number
       }) => {
              setCreateModalProps({
                     initialDate: data.date,
                     initialCourtId: data.courtId,
                     initialTime: data.time,
                     initialClientName: data.clientName,
                     initialClientPhone: data.clientPhone,
                     initialClientEmail: data.clientEmail,
                     initialNotes: data.notes,
                     initialWaitingListId: data.waitingListId
              })
              setIsCreateModalOpen(true)
       }, [])

       const handleOpenFlyer = useCallback((data: { time: string, courtName: string }) => {
              setFlyerProps(data)
              setIsFlyerOpen(true)
       }, [])

       const handleOpenBooking = useCallback((bookingOrId: Record<string, unknown> | number) => {
              if (typeof bookingOrId === 'object' && bookingOrId !== null && bookingOrId.isNew) {
                     setCreateModalProps({
                            initialDate: bookingOrId.date as Date | undefined,
                            initialCourtId: bookingOrId.courtId as number | undefined,
                            initialTime: bookingOrId.time as string | undefined,
                            initialClientName: bookingOrId.clientName as string | undefined,
                            initialClientPhone: bookingOrId.clientPhone as string | undefined,
                            initialClientEmail: bookingOrId.clientEmail as string | undefined,
                            initialNotes: bookingOrId.notes as string | undefined,
                            initialWaitingListId: bookingOrId.waitingListId as number | undefined
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
              // Invalidate turnero query to refresh the grid immediately
              queryClient.invalidateQueries({ queryKey: ['turnero'] })
       }, [router, queryClient])

       const handleCopyLink = useCallback(() => {
              if (slug) {
                     const url = `${window.location.origin}/p/${slug}`
                     navigator.clipboard.writeText(url)
                     toast.success("Link copiado al portapapeles ✨")
              }
       }, [slug])

       const [isHelpOpen, setIsHelpOpen] = useState(false)
       const [isKioscoOpen, setIsKioscoOpen] = useState(false)
       const [isGrowthKitOpen, setIsGrowthKitOpen] = useState(false)
       const [showManualTutorial, setShowManualTutorial] = useState(false)
       const [showWelcomeTour, setShowWelcomeTour] = useState(false)

       // Detect ?welcome=1 from post-setup redirect and clean the URL
       useEffect(() => {
              if (typeof window === 'undefined') return
              const params = new URLSearchParams(window.location.search)
              if (params.get('welcome') === '1') {
                     setShowWelcomeTour(true)
                     params.delete('welcome')
                     const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
                     window.history.replaceState({}, '', newUrl)
              }
       }, [])

       const handleRestartTutorial = useCallback(() => {
              setShowManualTutorial(true)
       }, [])

       // ⌨️ ULTRA-PRO KEYBOARD SHORTCUTS
       useEffect(() => {
              const handleKeyDown = (e: KeyboardEvent) => {
                     // Ignore if typing in an input or contenteditable
                     const target = e.target as HTMLElement
                     if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
                     if (target.isContentEditable) return;
                     // Ignore if modifier keys are pressed (let browser/OS shortcuts work)
                     if (e.ctrlKey || e.metaKey || e.altKey) return;

                     const key = e.key.toLowerCase();

                     switch (key) {
                            case 't':
                                   e.preventDefault();
                                   setSelectedDate(nowInArg());
                                   toast.info("Volviendo a Hoy");
                                   break;
                            case 'n':
                                   e.preventDefault();
                                   setIsCreateModalOpen(true);
                                   break;
                            case 'k':
                                   e.preventDefault();
                                   router.push('?modal=kiosco');
                                   break;
                            case 'r':
                                   e.preventDefault();
                                   router.push('/reportes');
                                   break;
                            case 'c':
                                   e.preventDefault();
                                   router.push('?view=bookings');
                                   break;
                            case 'i':
                                   e.preventDefault();
                                   router.push('/dashboard');
                                   break;
                            case 'l':
                                   e.preventDefault();
                                   handleCopyLink();
                                   break;
                            case 'h':
                                   e.preventDefault();
                                   setIsHelpOpen(prev => !prev);
                                   break;
                     }
              }
              window.addEventListener('keydown', handleKeyDown)
              return () => window.removeEventListener('keydown', handleKeyDown)
       }, [router, handleCopyLink])

       const shouldShowInitialSkeleton = initialLoading && (!isMounted || window.innerWidth >= 768)

       if (shouldShowInitialSkeleton) return (
              <div className="h-screen w-full bg-background p-6 lg:p-8 overflow-hidden flex flex-col gap-6">
                     <header className="flex justify-between items-center mb-2">
                            <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                            <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                     </header>
                     <DashboardSkeleton />
              </div>
       )

       return (
              <>
                     <ThemeRegistry themeColor={themeColor} />
                     {/* MOBILE LAYOUT */}
                     <div className="md:hidden flex flex-col h-full bg-transparent relative">
                            {/* MOBILE CONTENT */}
                            <div className="flex-1 flex flex-col min-h-0">
                                   {mobileView === 'dashboard' ? (
                                          <MobileDashboard
                                                 user={(activeEmployee || user) as Record<string, unknown>}
                                                 clubName={clubName}
                                                 logoUrl={logoUrl}
                                                 slug={slug}
                                                 onOpenBooking={handleOpenBooking}
                                                 onOpenKiosco={() => router.push('?modal=kiosco')}
                                                 onOpenGrowthKit={() => setIsGrowthKitOpen(true)}
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
                                          <MobileTurnero
                                                 date={selectedDate}
                                                 onDateChange={setSelectedDate}
                                                 onBookingClick={handleOpenBooking}
                                                 onBack={() => { setMobileView('dashboard'); router.push('/dashboard'); }}
                                          />
                                   )}
                            </div>

                     </div>

{/* DESKTOP LAYOUT */}
                      <div className="hidden md:flex h-full bg-background text-foreground font-sans flex-col w-full overflow-hidden">
                             {/* ALERTS BANNER */}
                             {alerts?.noCourts && (
                                    <div className="w-full px-6 py-3 flex items-center gap-3 text-xs bg-amber-950/50 border-b border-amber-900/30 z-50">
                                           <div className="p-1.5 rounded-md bg-amber-500/10">
                                                  <AlertTriangle size={14} className="text-amber-400" />
                                           </div>
                                           <span className="flex items-center gap-2 text-amber-100">
                                                  <Settings size={14} />
                                                  <span className="font-medium">Configura tus canchas para comenzar. <button onClick={() => router.push('/setup')} className="underline hover:text-white">Completar setup</button></span>
                                           </span>
                                    </div>
                             )}

                             {/* MAINTENANCE BANNER */}
                            {showMaintenance && activeNotification && (
                                   <div className={cn(
                                          "w-full px-6 py-3 flex items-center justify-between text-xs backdrop-blur-sm z-50 border-b",
                                          activeNotification.type === 'ERROR' ? "bg-red-950/50 border-red-900/30 text-red-100" :
                                                 activeNotification.type === 'WARNING' ? "bg-yellow-950/50 border-yellow-900/30 text-yellow-100" :
                                                        "bg-[#0B1221] border-blue-900/30 text-blue-100"
                                   )}>
                                          <div className="flex items-center gap-3">
                                                 <div className={cn(
                                                        "p-1.5 rounded-md",
                                                        activeNotification.type === 'ERROR' ? "bg-red-500/10" :
                                                               activeNotification.type === 'WARNING' ? "bg-yellow-500/10" :
                                                                      "bg-blue-500/10"
                                                 )}>
                                                        <Info size={14} className={cn(
                                                               activeNotification.type === 'ERROR' ? "text-red-400" :
                                                                      activeNotification.type === 'WARNING' ? "text-yellow-400" :
                                                                             "text-blue-400"
                                                        )} />
                                                 </div>
                                                 <span className="font-medium tracking-wide flex items-center gap-3">
                                                        <span className="font-black tracking-wider uppercase">{String(activeNotification.title)}</span>
                                                        <span className="h-4 w-[1px] bg-white/10"></span>
                                                        <span className="opacity-80">{String(activeNotification.message)}</span>
                                                 </span>
                                          </div>
                                          <button onClick={() => setMaintenanceDismissed(true)} className="hover:bg-white/5 p-1 rounded-full transition-all opacity-70 hover:opacity-100">
                                                 <X size={14} />
                                          </button>
                                   </div>
                            )}

                            {/* MAIN GRID */}
                            <main className="flex-1 flex flex-col min-h-0 bg-background md:overflow-y-auto lg:overflow-hidden p-3 gap-3 pt-6">

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

                                                 {/* UNIFIED CONTROL BAR (Date & Actions) - Refactored */}
                                                 <DashboardControlBar
                                                        selectedDate={selectedDate}
                                                        setSelectedDate={setSelectedDate}
                                                        handleCopyLink={handleCopyLink}
                                                        onOpenGrowthKit={() => setIsGrowthKitOpen(true)}
                                                        setIsCreateModalOpen={setIsCreateModalOpen}
                                                        onOpenHelp={() => setIsHelpOpen(true)}
                                                 />

                                                 {/* GRID */}
                                                 <ErrorBoundary>
                                                        <TurneroGrid
                                                               onBookingClick={handleOpenBooking}
                                                               onNewBooking={handleOpenNewBooking}
                                                               onGenerateFlyer={handleOpenFlyer}
                                                               refreshKey={refreshKey}
                                                               date={selectedDate}
                                                               onDateChange={setSelectedDate}
                                                               hideHeader={true}
                                                        />
                                                 </ErrorBoundary>
                                          </div>
                                   </div>
                            </main>
                     </div>

                     {/* MODALS */}
                     {isCreateModalOpen && (
                            <BookingModal
                                   isOpen={isCreateModalOpen}
                                   onClose={() => setIsCreateModalOpen(false)}
                                   onSuccess={handleRefresh}
                                   initialDate={createModalProps?.initialDate || selectedDate}
                                   initialCourtId={createModalProps?.initialCourtId}
                                   initialTime={createModalProps?.initialTime}
                                   initialClientName={createModalProps?.initialClientName}
                                   initialClientPhone={createModalProps?.initialClientPhone}
                                   initialClientEmail={createModalProps?.initialClientEmail}
                                   initialNotes={createModalProps?.initialNotes}
                                   initialWaitingListId={createModalProps?.initialWaitingListId}
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

                     {isFlyerOpen && flyerProps && (
                            <FlyerGenerator
                                   isOpen={isFlyerOpen}
                                   onClose={() => { setIsFlyerOpen(false); setFlyerProps(null); }}
                                   slotTime={flyerProps.time}
                                   courtName={flyerProps.courtName}
                                   clubName={clubName}
                                   logoUrl={logoUrl}
                                   clubSlug={slug}
                            />
                     )}

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkAllAsRead={markAllAsRead}
                            isLoading={notificationsLoading}
                     />

                     <HelpSheet
                            isOpen={isHelpOpen}
                            onClose={() => setIsHelpOpen(false)}
                            onRestartTutorial={handleRestartTutorial}
                     />

                     <KioscoModal
                            isOpen={isKioscoOpen}
                            onClose={() => {
                                   setIsKioscoOpen(false)
                                   router.replace('/dashboard')
                            }}
                     />

                     <PublicBookingGrowthKit
                            isOpen={isGrowthKitOpen}
                            onClose={() => setIsGrowthKitOpen(false)}
                            slug={slug}
                     />

                     {(showOnboarding || (!onboardingDismissed && !initialLoading && courts.length === 0)) && (
                            <OnboardingWizard clubName={clubName} slug={slug} />
                     )}
                     <DashboardTutorial
                            manualOpen={showManualTutorial ? true : undefined}
                            onManualClose={() => setShowManualTutorial(false)}
                            forceOpen={showWelcomeTour}
                            onClose={() => setShowWelcomeTour(false)}
                            slug={slug}
                     />

              </>
       )
}
