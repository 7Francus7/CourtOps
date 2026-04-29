'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import NotificationsSheet from './NotificationsSheet'
import { MobileBookingTimeline } from './MobileBookingTimeline'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       Users as UsersIcon,
       Plus,
       Bell,
       Store,
       ChevronRight,
       Globe,
       Lock,
       AlertTriangle,
       MessageCircle,
       TrendingUp,
       Banknote,
       CircleDot,
       Clock,
       Moon,
       Sun,
       CalendarDays,
       Trophy,
       Activity,
       Radio,
       Zap,
       ArrowUpRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

import { NotificationItem } from '@/actions/notifications'
import MovementModal from './dashboard/MovementModal'
import { UpgradeModal } from './layout/UpgradeModal'

interface TimelineBooking {
       id: number
       time: string
       courtName: string
       title: string
       status: string
       paymentStatus: 'paid' | 'partial' | 'unpaid'
       price: number
       balance: number
}

interface MobileDashboardData {
       caja?: { total?: number }
       receivables?: number
       courts?: { id: number | string; name: string; status: string; statusColor?: string; timeDisplay?: string; isFree?: boolean; currentBookingId?: number; proposal?: { date: string; time: string } }[]
       timeline?: TimelineBooking[]
       alerts?: { type: string; title: string; message: string }[]
       hourlyOccupancy?: { hour: number; pct: number }[]
       debts?: { totalCount: number; totalAmount: number; topDebtors: { name: string; total: number; phone: string }[] } | null
       endOfDay?: { totalBookings: number; totalRevenue: number; occupancy: number }
       userName?: string
       clubSlug?: string
       features?: { hasKiosco?: boolean; hasTournaments?: boolean; hasAdvancedReports?: boolean }
       debugClubId?: string
}

export interface MobileDashboardProps {
       user: Record<string, unknown>
       clubName: string
       logoUrl?: string | null
       slug?: string
       onOpenBooking: (_id: Record<string, unknown> | number) => void
       onOpenKiosco: () => void
       currentView?: 'dashboard' | 'calendar'
       onNavigate?: (_view: 'dashboard' | 'calendar') => void
       notifications: NotificationItem[]
       unreadCount: number
       onMarkAllAsRead: () => void
       notificationsLoading: boolean
}

export default function MobileDashboard({
       clubName,
       logoUrl,
       slug,
       onOpenBooking,
       onOpenKiosco,
       onNavigate,
       notifications,
       unreadCount,
       onMarkAllAsRead,
       notificationsLoading
}: MobileDashboardProps) {
       const [data, setData] = useState<MobileDashboardData | null>(null)
       const [loading, setLoading] = useState(true)
       const [loadError, setLoadError] = useState('')
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
       const [refreshKey, setRefreshKey] = useState(0)

       const [showUpgradeModal, setShowUpgradeModal] = useState(false)
       const [lockedFeatureName, setLockedFeatureName] = useState('')
       const [isMobileViewport, setIsMobileViewport] = useState(false)
       const isFetchingRef = useRef(false)
       const mountedRef = useRef(false)

       const MOBILE_DASHBOARD_TIMEOUT_MS = 20000
       const MOBILE_DASHBOARD_TIMEOUT_ERROR = 'mobile-dashboard-timeout'

       const handleLockedClick = (featureName: string) => {
              setLockedFeatureName(featureName)
              setShowUpgradeModal(true)
       }

       const fetchData = useCallback(async () => {
              if (!mountedRef.current || !isMobileViewport || isFetchingRef.current) {
                     return
              }

              isFetchingRef.current = true
              let timeoutId: ReturnType<typeof setTimeout> | null = null

              try {
                     setLoadError('')
                     const res = await Promise.race([
                            getMobileDashboardData(),
                            new Promise((_, reject) => {
                                   timeoutId = setTimeout(
                                          () => reject(new Error(MOBILE_DASHBOARD_TIMEOUT_ERROR)),
                                          MOBILE_DASHBOARD_TIMEOUT_MS
                                   )
                            }),
                     ])
                     if (mountedRef.current) {
                            setData(res as MobileDashboardData | null)
                     }
              } catch (e) {
                     if (e instanceof Error && e.message !== MOBILE_DASHBOARD_TIMEOUT_ERROR) {
                            console.error(e)
                     }
                     setLoadError('No pudimos actualizar el panel. Revisá la conexión o reintentá.')
              } finally {
                     if (timeoutId) {
                            clearTimeout(timeoutId)
                     }
                     isFetchingRef.current = false
                     if (mountedRef.current) {
                            setLoading(false)
                     }
              }
       }, [isMobileViewport])

       const { theme, setTheme } = useTheme()

       useEffect(() => {
              mountedRef.current = true

              const mediaQuery = window.matchMedia('(max-width: 767px)')
              const syncViewport = () => setIsMobileViewport(mediaQuery.matches)

              syncViewport()
              mediaQuery.addEventListener('change', syncViewport)

              return () => {
                     mountedRef.current = false
                     mediaQuery.removeEventListener('change', syncViewport)
              }
       }, [])

       useEffect(() => {
              if (!isMobileViewport) {
                     return
              }

              fetchData()
              const interval = setInterval(() => {
                     if (!document.hidden) {
                            fetchData()
                     }
              }, 10000)

              return () => clearInterval(interval)
       }, [fetchData, isMobileViewport, refreshKey])

       if (loading && !data) {
              return (
                     <div className="bg-background h-full flex flex-col p-5 pt-12 space-y-5">
                            <div className="flex justify-between items-center">
                                   <div className="space-y-2">
                                          <div className="h-3 w-20 bg-muted animate-pulse rounded-lg" />
                                          <div className="h-7 w-36 bg-muted animate-pulse rounded-lg" />
                                   </div>
                                   <div className="h-11 w-11 bg-muted animate-pulse rounded-2xl" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                   {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-2xl" />)}
                            </div>
                            <div className="h-24 bg-muted/40 animate-pulse rounded-2xl" />
                            <div className="grid grid-cols-2 gap-3">
                                   {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-2xl" />)}
                            </div>
                     </div>
              )
       }

       const today = new Date()
       const totalCourts = data?.courts?.length || 0
       const activeCourtsCount = data?.courts?.filter(c => c.status === 'En Juego').length || 0
       const freeCourtsCount = data?.courts?.filter(c => !c.status.includes('En Juego')).length || 0
       const pending = data?.receivables || 0
       const nextBooking = data?.timeline?.[0]
       const nextFreeCourt = data?.courts?.find(c => c.isFree && c.proposal)
       const occupancy = data?.endOfDay?.occupancy ?? 0
       const liveTone = activeCourtsCount > 0 ? 'En vivo' : freeCourtsCount > 0 ? 'Disponible' : 'Completo'

       const handleCopyLink = () => {
              if (slug) {
                     const url = `${window.location.origin}/p/${slug}`
                     navigator.clipboard.writeText(url)
                     toast.success("Link copiado")
              }
       }

       const handleRefresh = () => {
              setRefreshKey(prev => prev + 1)
       }

       const openCalendar = () => {
              if (onNavigate) {
                     onNavigate('calendar')
              } else {
                     window.location.href = '/dashboard?view=bookings'
              }
       }

       return (
              <>
                     <div className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.35))] text-foreground h-full flex flex-col relative overflow-x-hidden">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-primary/10 to-transparent" />

                            {/* HEADER */}
                            <header className="px-5 pt-[max(env(safe-area-inset-top),1.4rem)] pb-4 shrink-0 z-20">
                                   <div className="flex justify-between items-center gap-3">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                                 <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-400 rounded-[1.15rem] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ring-1 ring-white/20">
                                                        {logoUrl ? (
                                                               <>
                                                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                      <img
                                                                             src={logoUrl}
                                                                             alt={clubName}
                                                                             className="w-full h-full object-cover"
                                                                             onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                                                                      />
                                                                      <span className="text-lg font-black text-primary-foreground italic hidden">{clubName?.charAt(0) || 'C'}</span>
                                                               </>
                                                        ) : (
                                                               <span className="text-lg font-black text-primary-foreground italic">{clubName?.charAt(0) || 'C'}</span>
                                                        )}
                                                 </div>
                                                 <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-muted-foreground capitalize mb-0.5">
                                                               {format(today, "EEEE d 'de' MMMM", { locale: es })}
                                                        </p>
                                                        <h1 className="text-2xl font-black text-foreground tracking-[-0.04em] truncate">{clubName}</h1>
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                                 <button
                                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                        className="w-11 h-11 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/60 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform shadow-sm"
                                                 >
                                                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                                 </button>
                                                 <button
                                                        onClick={() => setIsNotificationsOpen(true)}
                                                        className="w-11 h-11 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/60 flex items-center justify-center relative active:scale-90 transition-transform shadow-sm"
                                                 >
                                                        {unreadCount > 0 && (
                                                               <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold text-white">
                                                                      {unreadCount}
                                                               </span>
                                                        )}
                                                        <Bell size={18} className="text-muted-foreground" />
                                                 </button>
                                          </div>
                                   </div>
                            </header>

                            <main className="flex-1 overflow-y-auto px-5 pb-32 space-y-4 no-scrollbar relative z-10">

                                   <motion.section
                                          initial={{ opacity: 0, y: 12 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="rounded-[2rem] border border-border/60 bg-card/90 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.14)] backdrop-blur-xl"
                                   >
                                          <div className="flex items-start justify-between gap-4">
                                                 <div className="min-w-0 flex-1">
                                                        <div className="mb-3 flex items-center gap-2">
                                                               <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">
                                                                      <Radio size={11} />
                                                                      {liveTone}
                                                               </span>
                                                               <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                                                                      {occupancy}% ocupacion
                                                               </span>
                                                        </div>
                                                        <h2 className="text-3xl font-black leading-[0.96] text-foreground">
                                                               {activeCourtsCount > 0
                                                                      ? `${activeCourtsCount} cancha${activeCourtsCount === 1 ? '' : 's'} jugando`
                                                                      : freeCourtsCount > 0
                                                                             ? `${freeCourtsCount} cancha${freeCourtsCount === 1 ? '' : 's'} libre${freeCourtsCount === 1 ? '' : 's'}`
                                                                             : 'Sin huecos activos'}
                                                        </h2>
                                                        <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
                                                               {nextBooking
                                                                      ? `Proximo: ${nextBooking.time} · ${nextBooking.courtName} · ${nextBooking.title}`
                                                                      : nextFreeCourt
                                                                             ? `Primer hueco sugerido: ${nextFreeCourt.name} ${nextFreeCourt.timeDisplay}`
                                                                             : 'No hay turnos proximos cargados.'}
                                                        </p>
                                                 </div>

                                                 <button
                                                        onClick={openCalendar}
                                                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg active:scale-95"
                                                        aria-label="Abrir turnero"
                                                 >
                                                        <CalendarDays size={22} strokeWidth={2.6} />
                                                 </button>
                                          </div>

                                          <div className="mt-5 grid grid-cols-3 gap-2">
                                                 <button
                                                        onClick={() => onOpenBooking({ isNew: true })}
                                                        className="flex min-h-[78px] flex-col justify-between rounded-2xl bg-primary p-3 text-left text-primary-foreground shadow-sm active:scale-[0.98]"
                                                 >
                                                        <Plus size={19} strokeWidth={3} />
                                                        <span className="text-[11px] font-black uppercase tracking-wide">Reservar</span>
                                                 </button>
                                                 <button
                                                        onClick={openCalendar}
                                                        className="flex min-h-[78px] flex-col justify-between rounded-2xl border border-border bg-background p-3 text-left text-foreground active:scale-[0.98]"
                                                 >
                                                        <Activity size={19} className="text-blue-500" />
                                                        <span className="text-[11px] font-black uppercase tracking-wide">Turnero</span>
                                                 </button>
                                                 <button
                                                        onClick={handleCopyLink}
                                                        className="flex min-h-[78px] flex-col justify-between rounded-2xl border border-border bg-background p-3 text-left text-foreground active:scale-[0.98]"
                                                 >
                                                        <Globe size={19} className="text-teal-500" />
                                                        <span className="text-[11px] font-black uppercase tracking-wide">Link</span>
                                                 </button>
                                          </div>
                                   </motion.section>

                                    {/* STATS ROW */}
                                    <motion.div
                                           initial={{ opacity: 0, y: 12 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           transition={{ delay: 0.03 }}
                                           className="grid grid-cols-3 gap-2"
                                    >
                                           {/* Caja */}
                                           <Link href="/caja" className="group relative bg-card/85 backdrop-blur-xl border border-border/60 rounded-2xl p-3 active:scale-[0.98] transition-transform shadow-sm overflow-hidden">
                                                  <Banknote size={16} className="text-emerald-500" />
                                                  <span className="mt-3 block text-[10px] font-black text-muted-foreground uppercase tracking-wider">Caja</span>
                                                  <span className="mt-1 block truncate text-base font-black text-foreground">
                                                         ${(data?.caja?.total ?? 0).toLocaleString()}
                                                  </span>
                                           </Link>

                                           {/* Canchas */}
                                           <div className="group relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-3 shadow-sm overflow-hidden">
                                                  <CircleDot size={16} className="text-blue-500" />
                                                  <span className="mt-3 block text-[10px] font-black text-muted-foreground uppercase tracking-wider">En juego</span>
                                                  <span className="mt-1 block text-base font-black text-foreground">{activeCourtsCount}/{totalCourts}</span>
                                           </div>

                                           {/* Pendiente */}
                                           <div className="group relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-3 shadow-sm overflow-hidden">
                                                  <Clock size={16} className={pending > 0 ? "text-amber-500" : "text-emerald-500"} />
                                                  <span className="mt-3 block text-[10px] font-black text-muted-foreground uppercase tracking-wider">Pendiente</span>
                                                  <span className={cn("mt-1 block truncate text-base font-black", pending > 0 ? "text-amber-500" : "text-foreground")}>
                                                         ${pending.toLocaleString()}
                                                  </span>
                                           </div>
                                    </motion.div>

                                    {loadError && (
                                           <motion.div
                                                  initial={{ opacity: 0, y: 8 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  className="rounded-[1.35rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-center justify-between gap-3"
                                           >
                                                  <div className="min-w-0">
                                                         <p className="text-xs font-black text-amber-500">Panel sin actualizar</p>
                                                         <p className="text-[11px] text-muted-foreground truncate">{loadError}</p>
                                                  </div>
                                                  <button
                                                         onClick={handleRefresh}
                                                         className="shrink-0 rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white active:scale-95"
                                                  >
                                                         Reintentar
                                                  </button>
                                           </motion.div>
                                    )}

                                    {/* COURTS STATUS */}
                                    {data?.courts && data.courts.length > 0 && (
                                           <motion.div
                                                  initial={{ opacity: 0, y: 12 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.05 }}
                                                  className="bg-card/85 backdrop-blur-xl border border-border/60 rounded-[1.7rem] p-4 shadow-sm overflow-hidden"
                                           >
                                                  <div className="flex items-center justify-between mb-3">
                                                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.18em]">Estado de canchas</p>
                                                         <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">{freeCourtsCount} libres</span>
                                                  </div>
                                                  <div className="flex flex-col gap-2">
                                                         {data.courts.map((court) => {
                                                                const isPlaying = court.status.includes('En Juego')
                                                                return (
                                                                       <button
                                                                              key={String(court.id)}
                                                                              onClick={() => {
                                                                                     if (isPlaying && court.currentBookingId) {
                                                                                            onOpenBooking(court.currentBookingId)
                                                                                     } else if (court.proposal) {
                                                                                            onOpenBooking({ isNew: true, courtId: court.id, date: court.proposal.date, time: court.proposal.time })
                                                                                     } else {
                                                                                            onOpenBooking({ isNew: true, courtId: court.id })
                                                                                     }
                                                                              }}
                                                                              className={cn(
                                                                                     "w-full px-4 py-3.5 rounded-2xl text-left border transition-all flex items-center gap-3 active:scale-[0.98]",
                                                                                     isPlaying
                                                                                            ? "bg-blue-500/10 border-blue-500/20"
                                                                                            : "bg-background/55 border-border/45 hover:bg-muted/50"
                                                                              )}
                                                                       >
                                                                              <div className={cn(
                                                                                     "w-2.5 h-2.5 rounded-full shrink-0",
                                                                                     isPlaying ? "bg-blue-500 animate-pulse" : "bg-emerald-500"
                                                                              )} />
                                                                              <div className="flex-1 min-w-0">
                                                                                     <span className={cn(
                                                                                            "text-sm font-bold block truncate",
                                                                                            isPlaying ? "text-blue-600 dark:text-blue-400" : "text-foreground"
                                                                                     )}>
                                                                                            {court.name}
                                                                                     </span>
                                                                                     <span className="text-[11px] text-muted-foreground block">
                                                                                            {isPlaying ? court.status : 'Disponible'}
                                                                                     </span>
                                                                              </div>
                                                                              {court.timeDisplay && (
                                                                                     <span className={cn(
                                                                                            "text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0",
                                                                                            isPlaying
                                                                                                   ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                                                                   : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                                     )}>
                                                                                            {isPlaying ? court.timeDisplay : `Próx ${court.timeDisplay}`}
                                                                                     </span>
                                                                              )}
                                                                              <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
                                                                       </button>
                                                                )
                                                         })}
                                                  </div>
                                           </motion.div>
                                    )}

                                   {/* QUICK ACTIONS — CourtReserve-style 3-col grid */}
                                    <motion.div
                                           initial={{ opacity: 0, y: 12 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           transition={{ delay: 0.1 }}
                                           className="space-y-3"
                                    >
                                           {/* Primary CTA */}
                                           <motion.button
                                                  whileTap={{ scale: 0.97 }}
                                                  onClick={() => {
                                                         if (nextFreeCourt?.proposal) {
                                                                onOpenBooking({
                                                                       isNew: true,
                                                                       courtId: nextFreeCourt.id,
                                                                       date: nextFreeCourt.proposal.date,
                                                                       time: nextFreeCourt.proposal.time
                                                                })
                                                         } else {
                                                                onOpenBooking({ isNew: true })
                                                         }
                                                  }}
                                                  className="w-full relative overflow-hidden bg-foreground text-background rounded-[1.6rem] p-4 flex items-center gap-4 shadow-sm"
                                           >
                                                  <div className="absolute inset-y-0 right-0 w-28 bg-primary/20 blur-2xl" />
                                                  <div className="w-12 h-12 rounded-2xl bg-background/15 flex items-center justify-center shrink-0 relative z-10 ring-1 ring-background/15">
                                                         <Zap size={24} strokeWidth={3} />
                                                  </div>
                                                  <div className="relative z-10 text-left">
                                                         <span className="text-base font-black tracking-tight block">
                                                                {nextFreeCourt ? `Reservar ${nextFreeCourt.name}` : 'Nueva reserva'}
                                                         </span>
                                                         <span className="text-[11px] opacity-80 font-semibold">Agendá un turno rápidamente</span>
                                                  </div>
                                                  <ArrowUpRight size={18} className="ml-auto relative z-10 opacity-70" />
                                           </motion.button>

                                           {/* Quick actions grid — 3 cols */}
                                           <div className="grid grid-cols-3 gap-2.5">
                                                  {[
                                                         { icon: CalendarDays, label: 'Turnos',    color: 'text-blue-500',   bg: 'bg-blue-500/10',   onClick: openCalendar },
                                                         { icon: Store,        label: 'Kiosco',    color: 'text-purple-500', bg: 'bg-purple-500/10', onClick: () => data?.features?.hasKiosco ? onOpenKiosco() : handleLockedClick('Kiosco'), locked: !data?.features?.hasKiosco },
                                                         { icon: UsersIcon,    label: 'Clientes',  color: 'text-indigo-500', bg: 'bg-indigo-500/10', href: '/clientes' },
                                                         { icon: Trophy,       label: 'Torneos',   color: 'text-amber-500',  bg: 'bg-amber-500/10',  href: '/torneos', locked: !data?.features?.hasTournaments },
                                                         { icon: Globe,        label: 'Link Club', color: 'text-teal-500',   bg: 'bg-teal-500/10',   onClick: handleCopyLink },
                                                         { icon: Banknote,     label: 'Caja',      color: 'text-emerald-500',bg: 'bg-emerald-500/10',href: '/caja' },
                                                  ].map((item) => (
                                                         <motion.button
                                                                key={item.label}
                                                                whileTap={{ scale: 0.94 }}
                                                                onClick={() => {
                                                                       if (item.locked) { handleLockedClick(item.label); return }
                                                                       if (item.onClick) item.onClick()
                                                                       else if (item.href) window.location.href = item.href
                                                                }}
                                                                className={cn(
                                                                       "flex flex-col items-center gap-2.5 py-4 px-2 rounded-[1.35rem] bg-card/80 backdrop-blur-xl border border-border/60 shadow-sm active:scale-95 transition-transform relative",
                                                                       item.locked && "opacity-50"
                                                                )}
                                                         >
                                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg)}>
                                                                       <item.icon size={24} className={item.color} />
                                                                </div>
                                                                <span className="text-[11px] font-black uppercase tracking-wide text-foreground/70">{item.label}</span>
                                                                {item.locked && <Lock size={9} className="absolute top-2 right-2 text-muted-foreground/40" />}
                                                         </motion.button>
                                                  ))}
                                           </div>
                                    </motion.div>

                                    {/* ALERTS / ANNOUNCEMENTS */}
                                    {data?.alerts && data.alerts.length > 0 && (
                                           <motion.div
                                                  initial={{ opacity: 0, y: 12 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.12 }}
                                                  className="space-y-2"
                                           >
                                                  {data.alerts.slice(0, 2).map((alert, i) => (
                                                         <div
                                                                key={i}
                                                                className={cn(
                                                                       "flex items-center gap-3 px-4 py-3 rounded-2xl border",
                                                                       alert.type === 'warning'
                                                                              ? "bg-amber-500/5 border-amber-500/15"
                                                                              : alert.type === 'error'
                                                                                     ? "bg-red-500/5 border-red-500/15"
                                                                                     : "bg-blue-500/5 border-blue-500/15"
                                                                )}
                                                         >
                                                                <AlertTriangle size={14} className={cn(
                                                                       "shrink-0",
                                                                       alert.type === 'warning' ? "text-amber-500" :
                                                                       alert.type === 'error' ? "text-red-500" : "text-blue-500"
                                                                )} />
                                                                <div className="min-w-0 flex-1">
                                                                       <p className="text-[11px] font-bold text-foreground truncate">{alert.title}</p>
                                                                       <p className="text-[10px] text-muted-foreground truncate">{alert.message}</p>
                                                                </div>
                                                         </div>
                                                  ))}
                                           </motion.div>
                                    )}

                                    {/* DEBTS */}
                                    {data?.debts && data.debts.totalCount > 0 && (
                                           <motion.div
                                                  initial={{ opacity: 0, y: 12 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.15 }}
                                                  className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden"
                                           >
                                                  <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />
                                                  <div className="flex items-center justify-between mb-5 relative z-10 gap-2">
                                                         <div className="flex items-center gap-2 min-w-0 shrink-0">
                                                                <div className="p-1.5 rounded-lg bg-red-500/10 shrink-0">
                                                                       <AlertTriangle size={14} className="text-red-500" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Deudas</span>
                                                         </div>
                                                         <div className="flex flex-col items-end min-w-0">
                                                                <span className="text-[8px] font-black text-red-500/40 uppercase tracking-widest mb-0.5">Pendiente</span>
                                                                <span className="text-base font-black text-red-500 tracking-tighter truncate max-w-full">${(data.debts.totalAmount ?? 0).toLocaleString()}</span>
                                                         </div>
                                                  </div>
                                                  <div className="space-y-3 relative z-10">
                                                         {(data.debts.topDebtors || []).slice(0, 3).map((debtor, i) => (
                                                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30 group gap-2">
                                                                       <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/[0.02] border border-red-500/10 flex items-center justify-center text-[11px] font-black text-red-500 shrink-0">
                                                                                     {debtor.name?.[0]?.toUpperCase() || '?'}
                                                                              </div>
                                                                              <span className="text-xs font-black text-foreground truncate">{debtor.name}</span>
                                                                       </div>
                                                                       <div className="flex items-center gap-2 shrink-0">
                                                                              <span className="text-xs font-black text-red-500">${debtor.total?.toLocaleString()}</span>
                                                                              {!!debtor.phone && (
                                                                                     <a
                                                                                            href={`https://wa.me/${debtor.phone.replace(/\D/g, '')}`}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center text-[#25D366] active:scale-90 transition-all border border-[#25D366]/20"
                                                                                     >
                                                                                            <MessageCircle size={14} strokeWidth={2.5} />
                                                                                     </a>
                                                                              )}
                                                                       </div>
                                                                </div>
                                                         ))}
                                                  </div>
                                                  <Link 
                                                         href="/clientes" 
                                                         className="mt-4 w-full py-3 rounded-2xl bg-muted/30 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted/50 transition-all"
                                                  >
                                                         Ver Todos los Clientes <ChevronRight size={12} />
                                                  </Link>
                                           </motion.div>
                                    )}

                                   {/* END-OF-DAY */}
                                   {data?.endOfDay && new Date().getHours() >= 20 && (
                                          <motion.div
                                                 initial={{ opacity: 0, y: 12 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 className="bg-card border border-border rounded-2xl p-4"
                                          >
                                                 <div className="flex items-center gap-2 mb-3">
                                                        <TrendingUp size={14} className="text-primary" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Resumen del Día</span>
                                                 </div>
                                                 <div className="grid grid-cols-3 gap-3 mb-3">
                                                        <div className="text-center">
                                                               <p className="text-xl font-black text-foreground">{data.endOfDay.totalBookings ?? 0}</p>
                                                               <p className="text-[10px] text-muted-foreground font-medium">Turnos</p>
                                                        </div>
                                                        <div className="text-center">
                                                               <p className="text-xl font-black text-emerald-500">${(data.endOfDay.totalRevenue ?? 0).toLocaleString()}</p>
                                                               <p className="text-[10px] text-muted-foreground font-medium">Facturado</p>
                                                        </div>
                                                        <div className="text-center">
                                                               <p className="text-xl font-black text-foreground">{data.endOfDay.occupancy ?? 0}%</p>
                                                               <p className="text-[10px] text-muted-foreground font-medium">Ocupación</p>
                                                        </div>
                                                 </div>
                                                 <Link
                                                        href="/caja"
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold transition-colors active:bg-primary/20"
                                                 >
                                                        Ir a Cerrar Caja <ChevronRight size={14} />
                                                 </Link>
                                          </motion.div>
                                   )}

                                    {/* TIMELINE */}
                                    <motion.section
                                           initial={{ opacity: 0, y: 12 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           transition={{ delay: 0.2 }}
                                           className="pt-4 pb-10"
                                    >
                                           <div className="flex items-center justify-between mb-6 px-1">
                                                  <div className="flex flex-col">
                                                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Agenda</span>
                                                         <h3 className="text-2xl font-black text-foreground tracking-tight">Próximos Turnos</h3>
                                                  </div>
                                                  <div className="px-4 py-2 rounded-2xl bg-muted/30 border border-white/5 flex flex-col items-center">
                                                         <span className="text-xl font-black text-foreground leading-none">{format(today, "d")}</span>
                                                         <span className="text-[10px] font-black uppercase text-muted-foreground/60">{format(today, "MMM", { locale: es })}</span>
                                                  </div>
                                           </div>

                                           <MobileBookingTimeline
                                                  bookings={data?.timeline || []}
                                                  onOpenBooking={onOpenBooking}
                                           />
                                    </motion.section>

                            </main>
                     </div>

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkAllAsRead={onMarkAllAsRead}
                            isLoading={notificationsLoading}
                     />

                     <MovementModal
                            isOpen={isMovementModalOpen}
                            onClose={() => setIsMovementModalOpen(false)}
                            onSuccess={handleRefresh}
                     />

                     <UpgradeModal
                            isOpen={showUpgradeModal}
                            onClose={() => setShowUpgradeModal(false)}
                            featureName={lockedFeatureName}
                     />
              </>
       )
}
