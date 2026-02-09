'use client'

import React, { useEffect, useState, useRef } from 'react'
import NotificationsSheet from './NotificationsSheet'
import { WeatherWidget } from './WeatherWidget'
import { MobileBookingTimeline } from './MobileBookingTimeline'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       LayoutDashboard,
       CalendarDays,
       Users as UsersIcon,
       BarChart3,
       Plus,
       Bell,
       Store,
       ExternalLink,
       Zap,
       ChevronRight,
       DollarSign,
       Wifi,
       Globe,
       RefreshCw,
       Copy,
       Share2,
       X,
       Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

import { NotificationItem } from '@/actions/notifications'
import { useEmployee } from '@/contexts/EmployeeContext'
import { LogOut, Lock, UserCog, Settings } from 'lucide-react'

interface MobileDashboardProps {
       user: any
       clubName: string
       logoUrl?: string | null
       slug?: string
       onOpenBooking: (id: any) => void
       onOpenKiosco: () => void
       currentView?: 'dashboard' | 'calendar'
       onNavigate?: (view: 'dashboard' | 'calendar') => void
       notifications: NotificationItem[]
       unreadCount: number
       onMarkAllAsRead: () => void
       notificationsLoading: boolean
}

import MovementModal from './dashboard/MovementModal'

export default function MobileDashboard({
       user,
       clubName,
       logoUrl,
       slug,
       onOpenBooking,
       onOpenKiosco,
       currentView = 'dashboard',
       onNavigate,
       notifications,
       unreadCount,
       onMarkAllAsRead,
       notificationsLoading
}: MobileDashboardProps) {
       const [data, setData] = useState<any>(null)
       const [loading, setLoading] = useState(true)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [showQuickActions, setShowQuickActions] = useState(false)
       const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
       const [refreshKey, setRefreshKey] = useState(0)

       // Pull to refresh state
       const [isRefreshing, setIsRefreshing] = useState(false)
       const pullY = useMotionValue(0)
       const refreshThreshold = 100
       const maxPull = 160
       const isDragging = useRef(false)
       const containerRef = useRef<HTMLDivElement>(null)

       const opacity = useTransform(pullY, [0, refreshThreshold], [0, 1])
       const rotate = useTransform(pullY, [0, refreshThreshold], [0, 180])

       const handleTouchStart = (e: React.TouchEvent) => {
              if (containerRef.current && containerRef.current.scrollTop === 0) {
                     isDragging.current = true
              }
       }

       const handleTouchMove = (e: React.TouchEvent) => {
              if (!isDragging.current) return

              // We'd need to track start Y to calculate delta, 
              // simplify by assuming top of scroll for this demo or use a library.
              // A simple way without extra state for startY is tricky in pure React event handlers 
              // without preventing default scroll.
              // Let's rely on a simplified approach or just a button if touch is too complex to impl correctly from scratch in one go.
              // Actually, let's implement a proper "PullToRefresh" logic if possible.
       }
       // ... Implementing raw touch handlers for pull-to-refresh can be buggy without a library.
       // Let's use a simpler approach: A wrapper component or just standard scroll behavior.
       // Since I cannot easily add libraries, I will stick to a visual "Pull down" hint or just the manual refresh button for now, 
       // but wait, I can implement a simple version with framer-motion drag.

       const onDragEnd = async () => {
              if (pullY.get() > refreshThreshold) {
                     setIsRefreshing(true)
                     // Trigger refresh
                     await fetchData()
                     toast.success("Actualizado")
                     setIsRefreshing(false)
              }
              pullY.set(0)
       }

       const fetchData = async () => {
              try {
                     const res = await getMobileDashboardData()
                     setData(res)
              } catch (e) {
                     console.error(e)
              } finally {
                     setLoading(false)
              }
       }

       const { activeEmployee, lockTerminal, logoutEmployee } = useEmployee()

       useEffect(() => {
              fetchData()
              const interval = setInterval(fetchData, 10000) // 10s refresh
              return () => clearInterval(interval)
       }, [refreshKey])

       if (loading && !data) {
              return <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4 gap-4">
                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green" />
                     <p className="text-white/50 text-xs animate-pulse">Cargando tu club...</p>
              </div>
       }

       const today = new Date()
       const activeCourtsCount = data?.courts?.filter((c: any) => c.status === 'En Juego').length || 0
       const alertCount = data?.alerts?.length || 0

       const handleCopyLink = () => {
              if (slug) {
                     const url = `${window.location.origin}/p/${slug}`
                     navigator.clipboard.writeText(url)
                     toast.success("Link copiado al portapapeles")
                     setShowQuickActions(false)
              } else {
                     toast.error("No hay link configurado")
              }
       }

       const handleRefresh = () => {
              setRefreshKey(prev => prev + 1)
              toast.success("Actualizando datos...")
              setShowQuickActions(false)
       }

       return (
              <>
                     <div className="bg-background font-sans text-foreground antialiased h-full flex flex-col relative overflow-hidden transition-colors duration-300">

                            {/* TOP BLUR ACCENT */}
                            <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute top-[20%] left-[-10%] w-[200px] h-[200px] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

                            {/* HEADER */}
                            <header className="px-5 py-4 shrink-0 z-20 flex justify-between items-center safe-area-top">
                                   <div className="flex items-center gap-3">
                                          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-xl shadow-sm">
                                                 {logoUrl ? (
                                                        <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                                                 ) : (
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">
                                                               {clubName.substring(0, 1)}
                                                        </div>
                                                 )}
                                          </div>
                                          <div className="flex flex-col">
                                                 <h1 className="text-base font-black leading-none text-foreground tracking-wide">{clubName}</h1>
                                                 <p className="text-[10px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Online
                                                 </p>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center relative active:scale-95 transition-all shadow-sm"
                                          >
                                                 {unreadCount > 0 && (
                                                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
                                                 )}
                                                 <Bell className="w-5 h-5 text-slate-600 dark:text-white/80" />
                                          </button>

                                          <Link
                                                 href="/configuracion"
                                                 className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center relative active:scale-95 transition-all shadow-sm"
                                          >
                                                 <Settings className="w-5 h-5 text-slate-600 dark:text-white/80" />
                                          </Link>

                                          <button
                                                 onClick={() => confirm('¿Cerrar sesión?') && signOut()}
                                                 className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center relative active:scale-95 transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm"
                                          >
                                                 <LogOut className="w-5 h-5" />
                                          </button>

                                          <button
                                                 onClick={() => activeEmployee ? (confirm('¿Salir?') && logoutEmployee()) : (confirm('¿Bloquear?') && lockTerminal())}
                                                 className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 shadow-sm", activeEmployee ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60")}
                                          >
                                                 {activeEmployee ? <UserCog className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                          </button>
                                   </div>
                            </header >

                            <main
                                   ref={containerRef}
                                   className="flex-1 overflow-hidden relative z-10 bg-transparent flex flex-col"
                            >
                                   {/* PULL TO REFRESH INDICATOR */}
                                   <motion.div
                                          style={{ opacity, height: pullY }}
                                          className="flex items-center justify-center overflow-hidden w-full bg-slate-50 dark:bg-white/5"
                                   >
                                          <motion.div style={{ rotate }} className="p-2">
                                                 {isRefreshing ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                                                 ) : (
                                                        <RefreshCw className="w-5 h-5 text-slate-400" />
                                                 )}
                                          </motion.div>
                                   </motion.div>

                                   <motion.div
                                          drag="y"
                                          dragConstraints={{ top: 0, bottom: 0 }}
                                          dragElastic={{ top: 0.2, bottom: 0 }}
                                          onDragEnd={onDragEnd}
                                          style={{ y: pullY }}
                                          className="flex-1 overflow-y-auto px-4 pb-32 space-y-5 scroll-smooth hide-scrollbar bg-background"
                                   >

                                          {/* WEATHER WIDGET */}
                                          <section className="mb-6 animate-in slide-in-from-bottom-2 duration-700 delay-100">
                                                 <WeatherWidget />
                                          </section>

                                          {/* HERO STATUS CARD */}
                                          <section className="relative group">
                                                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                                 <div className="relative bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl p-5 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-foreground">
                                                               <Wifi className="w-32 h-32" />
                                                        </div>

                                                        <div className="flex justify-between items-start mb-6">
                                                               <div>
                                                                      <div className="flex items-center gap-2 mb-1">
                                                                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                                             <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Estado del Club</p>
                                                                      </div>
                                                                      <h2 className="text-3xl font-black text-foreground tracking-tight">
                                                                             {activeCourtsCount} <span className="text-lg font-medium text-muted-foreground">Canchas</span>
                                                                      </h2>
                                                               </div>
                                                               <div className="bg-slate-100 dark:bg-white/[0.03] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col items-end shadow-sm">
                                                                      <span className="text-[10px] text-muted-foreground font-black uppercase">Caja Hoy</span>
                                                                      <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">${(data?.caja?.total ?? 0).toLocaleString()}</span>
                                                               </div>
                                                        </div>

                                                        {/* Mini Progress Bars for Courts */}
                                                        <div className="space-y-3">
                                                               {data?.courts?.slice(0, 3).map((court: any) => (
                                                                      <div key={court.id} className="flex items-center gap-3">
                                                                             <div className="w-12 text-[10px] font-bold text-muted-foreground uppercase truncate">{court.name}</div>
                                                                             <div className="flex-1 h-2.5 bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-slate-200 dark:border-white/5 relative">
                                                                                    <div
                                                                                           className={cn("h-full rounded-full transition-all duration-1000 relative", court.status === 'En Juego' ? "w-[100%] bg-gradient-to-r from-blue-500 to-cyan-400" : "w-0")}
                                                                                    />
                                                                             </div>
                                                                             <div className={cn("text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest min-w-[55px] text-center", court.status === 'En Juego' ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20")}>
                                                                                    {court.status === 'En Juego' ? 'OCUPADA' : 'LIBRE'}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </section>

                                          {/* ACTION GRID */}
                                          <section className="space-y-3">
                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button onClick={() => onOpenBooking({})} className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/[0.06] active:scale-95 transition-all group shadow-sm">
                                                               <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 group-hover:scale-110 transition-transform">
                                                                      <Plus className="w-6 h-6" />
                                                               </div>
                                                               <span className="text-xs font-bold text-foreground">Nueva Reserva</span>
                                                        </button>

                                                        <div className="grid grid-rows-2 gap-3">
                                                               <button onClick={onOpenKiosco} className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.06] active:scale-95 transition-all group shadow-sm">
                                                                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                                             <Store className="w-4 h-4" />
                                                                      </div>
                                                                      <span className="text-[10px] font-bold text-foreground">Kiosco</span>
                                                               </button>
                                                               <Link href="/clientes" className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.06] active:scale-95 transition-all group shadow-sm">
                                                                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                                             <UsersIcon className="w-4 h-4" />
                                                                      </div>
                                                                      <span className="text-[10px] font-bold text-foreground">Clientes</span>
                                                               </Link>
                                                        </div>
                                                 </div>

                                                 {/* PUBLIC LINK BUTTON */}
                                                 <button
                                                        onClick={handleCopyLink}
                                                        className="w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.06] active:scale-95 transition-all group shadow-sm"
                                                 >
                                                        <div className="flex items-center gap-3">
                                                               <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                                      <Globe className="w-5 h-5" />
                                                               </div>
                                                               <div className="flex flex-col items-start translate-y-[1px]">
                                                                      <span className="text-xs font-black text-foreground uppercase tracking-wide">Link Público</span>
                                                                      <span className="text-[9px] text-muted-foreground font-medium">Compartir reserva online</span>
                                                               </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 group-hover:text-foreground transition-all">
                                                               <Copy className="w-4 h-4" />
                                                        </div>
                                                 </button>
                                          </section>

                                          {/* ALERTS BANNER */}
                                          {alertCount > 0 && (
                                                 <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in shadow-sm">
                                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse text-red-600 dark:text-white">
                                                               <Zap className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                               <h4 className="text-sm font-bold text-red-900 dark:text-red-100">Atención Requerida</h4>
                                                               <p className="text-xs text-red-700 dark:text-red-200/80 font-medium">{alertCount} reservas necesitan acción</p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-red-400" />
                                                 </div>
                                          )}

                                          {/* TIMELINE */}
                                          <section>
                                                 <div className="flex items-center justify-between mb-4 px-1">
                                                        <h3 className="font-black text-lg text-foreground tracking-tight flex items-center gap-2">
                                                               <CalendarDays className="w-5 h-5 text-emerald-500" />
                                                               Próximos Turnos
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5 uppercase tracking-wider">{format(today, "d MMM", { locale: es })}</span>
                                                 </div>
                                                 <MobileBookingTimeline bookings={data?.timeline || []} onOpenBooking={onOpenBooking} />
                                          </section>
                                   </motion.div>
                            </main>

                            {/* GLASS BOTTOM NAV */}
                            <nav className="absolute bottom-6 left-5 right-5 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 flex justify-between items-center h-[72px] px-6">
                                   <button
                                          onClick={() => onNavigate?.('dashboard')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                                                 currentView === 'dashboard' ? "text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10" : "text-slate-400 dark:text-white/30 hover:text-foreground"
                                          )}
                                   >
                                          <LayoutDashboard className="w-5 h-5" />
                                          {currentView === 'dashboard' && <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />}
                                   </button>

                                   <button
                                          onClick={() => onNavigate?.('calendar')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                                                 currentView === 'calendar' ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10" : "text-slate-400 dark:text-white/30 hover:text-foreground"
                                          )}
                                   >
                                          <CalendarDays className="w-5 h-5" />
                                          {currentView === 'calendar' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full" />}
                                   </button>

                                   <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />

                                   <Link href="/reportes" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-slate-400 dark:text-white/30 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all">
                                          <BarChart3 className="w-5 h-5" />
                                   </Link>

                                   <div className="relative">
                                          <AnimatePresence>
                                                 {showQuickActions && (
                                                        <>
                                                               <motion.div
                                                                      initial={{ opacity: 0 }}
                                                                      animate={{ opacity: 1 }}
                                                                      exit={{ opacity: 0 }}
                                                                      onClick={() => setShowQuickActions(false)}
                                                                      className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                                                               />
                                                               <motion.div
                                                                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                      className="absolute bottom-16 right-0 min-w-[200px] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-1.5"
                                                               >
                                                                      <button
                                                                             onClick={() => { setShowQuickActions(false); setIsMovementModalOpen(true); }}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-foreground rounded-xl transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500">
                                                                                    <DollarSign className="w-4 h-4" />
                                                                             </div>
                                                                             Registrar Movimiento
                                                                      </button>
                                                                      <button
                                                                             onClick={handleCopyLink}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-foreground rounded-xl transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                                                    <Share2 className="w-4 h-4" />
                                                                             </div>
                                                                             Copiar Link
                                                                      </button>
                                                                      <button
                                                                             onClick={handleRefresh}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-foreground rounded-xl transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-100/10 text-emerald-600 dark:text-emerald-500">
                                                                                    <RefreshCw className="w-4 h-4" />
                                                                             </div>
                                                                             Actualizar
                                                                      </button>
                                                               </motion.div>
                                                        </>
                                                 )}
                                          </AnimatePresence>
                                          <button
                                                 onClick={() => setShowQuickActions(!showQuickActions)}
                                                 className={cn(
                                                        "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative text-white shadow-lg",
                                                        showQuickActions ? "bg-amber-500 rotate-180" : "bg-foreground hover:bg-foreground/90 active:rotate-180"
                                                 )}
                                          >
                                                 {showQuickActions ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" fill="currentColor" />}
                                          </button>
                                   </div>
                            </nav>
                     </div >

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
              </>
       )
}
