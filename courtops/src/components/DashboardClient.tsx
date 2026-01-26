'use client'

import { signOut } from 'next-auth/react'
import TurneroGrid from '@/components/TurneroGrid'
import { useState, useEffect } from 'react'
import BookingManagementModal from '@/components/BookingManagementModal'
import { useRouter, useSearchParams } from 'next/navigation'

import MobileDashboard from '@/components/MobileDashboard'
import MobileTurnero from '@/components/MobileTurnero'
import NotificationsSheet from '@/components/NotificationsSheet'
import { Header } from '@/components/layout/Header'

import BookingModal from '@/components/BookingModal'
import { getCourts } from '@/actions/dashboard'
import { useNotifications } from '@/hooks/useNotifications'
import DashboardStats from '@/components/DashboardStats'
import { toast } from 'sonner'
import { useEmployee } from '@/contexts/EmployeeContext'

import { ThemeRegistry } from './ThemeRegistry'
import { DashboardSkeleton } from './SkeletonDashboard'

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
                     <div className="hidden md:flex h-full bg-[var(--background)] text-slate-800 dark:text-white font-sans flex-col w-full overflow-hidden">
                            {/* NEW HEADER */}
                            <Header title="Dashboard" />

                            {/* MAIN GRID */}
                            <main className="flex-1 flex flex-col min-h-0 bg-[#09090b] md:overflow-y-auto lg:overflow-hidden p-3 gap-3">

                                   {/* FULL WIDTH COLUMN (KPIs + Turnero) */}
                                   <div className="flex-1 flex flex-col gap-3 min-h-0">
                                          {/* KPI Cards & Widgets Row */}
                                          {searchParams.get('view') !== 'bookings' && (
                                                 <div className="w-full">
                                                        <DashboardStats date={selectedDate} refreshKey={refreshKey} />
                                                 </div>
                                          )}

                                          {/* Turnero Header & Grid */}
                                          <div className="flex-1 min-h-0 flex flex-col bg-[#0C0F14] border border-[#27272a] rounded-3xl overflow-hidden shadow-xl relative">
                                                 <TurneroGrid
                                                        onBookingClick={handleOpenBooking}
                                                        refreshKey={refreshKey}
                                                        date={selectedDate}
                                                        onDateChange={setSelectedDate}
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
              </>
       )
}
