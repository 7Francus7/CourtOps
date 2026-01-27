'use client'

import React, { useEffect, useState } from 'react'
import NotificationsSheet from './NotificationsSheet'
import { MobileBookingTimeline } from './MobileBookingTimeline'
import Link from 'next/link'
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
       X
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
                     <div className="bg-bg-dark font-sans text-white antialiased h-full flex flex-col relative overflow-hidden">

                            {/* TOP BLUR ACCENT */}
                            <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />
                            <div className="absolute top-[20%] left-[-10%] w-[200px] h-[200px] bg-brand-green/10 rounded-full blur-[80px] pointer-events-none" />

                            {/* HEADER */}
                            <header className="px-5 py-4 shrink-0 z-20 flex justify-between items-center safe-area-top">
                                   <div className="flex items-center gap-3">
                                          <div className="bg-white/5 border border-white/10 p-1.5 rounded-xl shadow-sm">
                                                 {logoUrl ? (
                                                        <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
                                                 ) : (
                                                        <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center font-bold text-white">
                                                               {clubName.substring(0, 1)}
                                                        </div>
                                                 )}
                                          </div>
                                          <div className="flex flex-col">
                                                 <h1 className="text-base font-bold leading-none text-white tracking-wide">{clubName}</h1>
                                                 <p className="text-[10px] text-text-grey font-medium mt-0.5 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                                        Online
                                                 </p>
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative active:scale-95 transition-all"
                                          >
                                                 {unreadCount > 0 && (
                                                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
                                                 )}
                                                 <Bell className="w-5 h-5 text-white/80" />
                                          </button>

                                          <Link
                                                 href="/configuracion"
                                                 className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative active:scale-95 transition-all"
                                          >
                                                 <Settings className="w-5 h-5 text-white/80" />
                                          </Link>

                                          <button
                                                 onClick={() => activeEmployee ? (confirm('¿Salir?') && logoutEmployee()) : (confirm('¿Bloquear?') && lockTerminal())}
                                                 className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95", activeEmployee ? "bg-brand-blue/10 border-brand-blue/30 text-brand-blue" : "bg-white/5 border-white/10 text-white/60")}
                                          >
                                                 {activeEmployee ? <UserCog className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                          </button>
                                   </div>
                            </header >

                            <main className="flex-1 px-4 pb-28 overflow-y-auto min-h-0 space-y-5 scroll-smooth hide-scrollbar relative z-10">

                                   {/* HERO STATUS CARD */}
                                   <section className="relative group">
                                          <div className="absolute inset-0 bg-gradient-to-r from-brand-green/10 to-blue-500/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                          <div className="relative glass-card rounded-3xl p-5 overflow-hidden">
                                                 <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                                        <Wifi className="w-32 h-32" />
                                                 </div>

                                                 <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                               <div className="flex items-center gap-2 mb-1">
                                                                      <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)]"></div>
                                                                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Estado del Club</p>
                                                               </div>
                                                               <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tight">
                                                                      {activeCourtsCount} <span className="text-lg font-medium text-white/30">Canchas</span>
                                                               </h2>
                                                        </div>
                                                        <div className="glass-shiny bg-white/[0.03] px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-end">
                                                               <span className="text-[10px] text-white/40 font-bold uppercase">Caja Hoy</span>
                                                               <span className="font-mono font-bold text-lg text-brand-green text-shadow-neon">${(data?.caja?.total ?? 0).toLocaleString()}</span>
                                                        </div>
                                                 </div>

                                                 {/* Mini Progress Bars for Courts */}
                                                 <div className="space-y-2">
                                                        {data?.courts?.slice(0, 3).map((court: any) => (
                                                               <div key={court.id} className="flex items-center gap-3">
                                                                      <div className="w-10 text-[10px] font-bold text-white/30 uppercase truncate">{court.name}</div>
                                                                      <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                                                                             <div
                                                                                    className={cn("h-full rounded-full transition-all duration-1000 relative", court.status === 'En Juego' ? "w-[100%] bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]" : "w-0")}
                                                                             />
                                                                      </div>
                                                                      <div className={cn("text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest min-w-[50px] text-center", court.status === 'En Juego' ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "bg-white/5 text-white/20 border border-white/5")}>
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
                                                 <button onClick={() => onOpenBooking({})} className="glass-shiny bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.06] active:scale-95 transition-all group">
                                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(var(--secondary-rgb),0.2)] transition-all">
                                                               <Plus className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-white/80">Nueva Reserva</span>
                                                 </button>

                                                 <div className="grid grid-rows-2 gap-3">
                                                        <button onClick={onOpenKiosco} className="glass-shiny bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/[0.06] active:scale-95 transition-all group">
                                                               <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:text-purple-300 transition-colors">
                                                                      <Store className="w-4 h-4" />
                                                               </div>
                                                               <span className="text-[10px] font-bold text-white/70">Kiosco</span>
                                                        </button>
                                                        <Link href="/clientes" className="glass-shiny bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/[0.06] active:scale-95 transition-all group">
                                                               <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:text-blue-300 transition-colors">
                                                                      <UsersIcon className="w-4 h-4" />
                                                               </div>
                                                               <span className="text-[10px] font-bold text-white/70">Clientes</span>
                                                        </Link>
                                                 </div>
                                          </div>

                                          {/* PUBLIC LINK BUTTON - More Visible */}
                                          <button
                                                 onClick={handleCopyLink}
                                                 className="w-full glass-shiny bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/[0.06] active:scale-95 transition-all group"
                                          >
                                                 <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue/20 transition-colors">
                                                               <Globe className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col items-start translate-y-[1px]">
                                                               <span className="text-xs font-bold text-white/90">Link de Reservas Público</span>
                                                               <span className="text-[10px] text-white/40 font-medium">Compartir en WhatsApp o Instagram</span>
                                                        </div>
                                                 </div>
                                                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-all">
                                                        <Copy className="w-4 h-4" />
                                                 </div>
                                          </button>
                                   </section>

                                   {/* ALERTS BANNER */}
                                   {alertCount > 0 && (
                                          <div className="glass-card bg-red-500/10 border-red-500/20 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-2 fade-in shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                                 <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 animate-pulse">
                                                        <Zap className="w-5 h-5 text-white" fill="white" />
                                                 </div>
                                                 <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Atención Requerida</h4>
                                                        <p className="text-xs text-white/60 font-medium">{alertCount} reservas necesitan acción inmediata</p>
                                                 </div>
                                                 <ChevronRight className="w-5 h-5 text-white/40" />
                                          </div>
                                   )}

                                   {/* TIMELINE */}
                                   <section>
                                          <div className="flex items-center justify-between mb-4 px-1">
                                                 <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                                                        <CalendarDays className="w-5 h-5 text-brand-green" />
                                                        Próximos Turnos
                                                 </h3>
                                                 <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-1 rounded-lg border border-white/5 uppercase tracking-wider">{format(today, "d MMM", { locale: es })}</span>
                                          </div>
                                          <MobileBookingTimeline bookings={data?.timeline || []} onOpenBooking={onOpenBooking} />
                                   </section>

                            </main>

                            {/* GLASS BOTTOM NAV */}
                            <nav className="absolute bottom-6 left-6 right-6 bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 flex justify-between items-center h-[72px] px-6">
                                   <button
                                          onClick={() => onNavigate?.('dashboard')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                                                 currentView === 'dashboard' ? "text-brand-green bg-brand-green/10 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.2)]" : "text-white/30 hover:text-white"
                                          )}
                                   >
                                          <LayoutDashboard className="w-5 h-5" />
                                          {currentView === 'dashboard' && <div className="absolute -bottom-1 w-1 h-1 bg-brand-green rounded-full" />}
                                   </button>

                                   <button
                                          onClick={() => onNavigate?.('calendar')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                                                 currentView === 'calendar' ? "text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "text-white/30 hover:text-white"
                                          )}
                                   >
                                          <CalendarDays className="w-5 h-5" />
                                          {currentView === 'calendar' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full" />}
                                   </button>

                                   <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />

                                   <Link href="/reportes" className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl text-white/30 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
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
                                                                      className="absolute bottom-16 right-0 min-w-[180px] bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col p-1"
                                                               >
                                                                      <button
                                                                             onClick={() => { setShowQuickActions(false); setIsMovementModalOpen(true); }}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                                                                    <DollarSign className="w-4 h-4" />
                                                                             </div>
                                                                             Registrar Movimiento
                                                                      </button>
                                                                      <button
                                                                             onClick={handleCopyLink}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                                                                                    <Share2 className="w-4 h-4" />
                                                                             </div>
                                                                             Copiar Link
                                                                      </button>
                                                                      <button
                                                                             onClick={handleRefresh}
                                                                             className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-all w-full text-left"
                                                                      >
                                                                             <div className="p-1.5 rounded-md bg-brand-green/10 text-brand-green">
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
                                                        "flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative",
                                                        showQuickActions ? "text-amber-400 bg-amber-500/10 rotate-180" : "text-white/30 hover:text-white hover:bg-white/5 active:rotate-180"
                                                 )}
                                          >
                                                 {showQuickActions ? <X className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
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
