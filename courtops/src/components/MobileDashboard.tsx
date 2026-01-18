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
       Wifi
} from 'lucide-react'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

import { NotificationItem } from '@/actions/notifications'
import { useEmployee } from '@/contexts/EmployeeContext'
import { LogOut, Lock, UserCog, Settings } from 'lucide-react'

interface MobileDashboardProps {
       user: any
       clubName: string
       logoUrl?: string | null
       onOpenBooking: (id: any) => void
       onOpenKiosco: () => void
       currentView?: 'dashboard' | 'calendar'
       onNavigate?: (view: 'dashboard' | 'calendar') => void
       notifications: NotificationItem[]
       unreadCount: number
       onMarkAllAsRead: () => void
       notificationsLoading: boolean
}

export default function MobileDashboard({
       user,
       clubName,
       logoUrl,
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
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

                            <main className="flex-1 px-5 pb-32 overflow-y-auto min-h-0 space-y-6 scroll-smooth hide-scrollbar">

                                   {/* HERO STATUS CARD */}
                                   <section className="relative group">
                                          <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 to-brand-green/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                          <div className="relative bg-bg-card/80 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden">

                                                 {/* Background Pattern */}
                                                 <div className="absolute top-0 right-0 p-4 opacity-5">
                                                        <Wifi className="w-24 h-24" />
                                                 </div>

                                                 <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                               <p className="text-text-grey text-xs font-semibold uppercase tracking-wider mb-1">Estado Actual</p>
                                                               <h2 className="text-3xl font-bold text-white tracking-tight">
                                                                      {activeCourtsCount} <span className="text-lg text-white/50 font-medium">Canchas activas</span>
                                                               </h2>
                                                        </div>
                                                        <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                                               <DollarSign className="w-4 h-4 text-brand-green" />
                                                               <span className="font-mono font-bold text-sm text-white">${(data?.caja?.total ?? 0).toLocaleString()}</span>
                                                        </div>
                                                 </div>

                                                 {/* Mini Progress Bars for Courts */}
                                                 <div className="space-y-3">
                                                        {data?.courts?.slice(0, 3).map((court: any) => (
                                                               <div key={court.id} className="flex items-center gap-3">
                                                                      <div className="w-8 text-[10px] font-bold text-text-grey uppercase">{court.name}</div>
                                                                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                                             <div
                                                                                    className={cn("h-full rounded-full transition-all duration-1000", court.status === 'En Juego' ? "bg-gradient-to-r from-brand-blue to-cyan-400 w-[70%]" : "bg-white/10 w-0")}
                                                                             />
                                                                      </div>
                                                                      <div className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", court.status === 'En Juego' ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-green/10 text-brand-green")}>
                                                                             {court.status === 'En Juego' ? 'OCUPADA' : 'LIBRE'}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   </section>

                                   {/* ACTION STRIP */}
                                   <section className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                          <button onClick={() => onOpenBooking({})} className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                                 <div className="w-16 h-16 bg-brand-green text-bg-dark rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/20 group-active:scale-95 transition-all">
                                                        <Plus className="w-8 h-8" />
                                                 </div>
                                                 <span className="text-[10px] font-semibold text-white/80">Reservar</span>
                                          </button>

                                          <button onClick={onOpenKiosco} className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                                 <div className="w-16 h-16 bg-bg-card border border-white/10 text-white rounded-2xl flex items-center justify-center group-active:scale-95 transition-all">
                                                        <Store className="w-7 h-7 text-purple-400" />
                                                 </div>
                                                 <span className="text-[10px] font-semibold text-white/80">Kiosco</span>
                                          </button>

                                          <Link href="/clientes" className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                                 <div className="w-16 h-16 bg-bg-card border border-white/10 text-white rounded-2xl flex items-center justify-center group-active:scale-95 transition-all">
                                                        <UsersIcon className="w-7 h-7 text-blue-400" />
                                                 </div>
                                                 <span className="text-[10px] font-semibold text-white/80">Clientes</span>
                                          </Link>

                                          <button onClick={() => window.open(`/p/${data?.clubSlug}`, '_blank')} className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                                 <div className="w-16 h-16 bg-bg-card border border-white/10 text-white rounded-2xl flex items-center justify-center group-active:scale-95 transition-all">
                                                        <ExternalLink className="w-7 h-7 text-orange-400" />
                                                 </div>
                                                 <span className="text-[10px] font-semibold text-white/80">Público</span>
                                          </button>
                                   </section>

                                   {/* ALERTS BANNER */}
                                   {alertCount > 0 && (
                                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
                                                 <div className="bg-red-500 p-1.5 rounded-lg">
                                                        <Zap className="w-4 h-4 text-white" fill="white" />
                                                 </div>
                                                 <div className="flex-1">
                                                        <h4 className="text-sm font-bold text-white">Atención Requerida</h4>
                                                        <p className="text-xs text-white/60">{alertCount} reservas sin pagar</p>
                                                 </div>
                                                 <ChevronRight className="w-4 h-4 text-white/40" />
                                          </div>
                                   )}

                                   {/* TIMELINE */}
                                   <section>
                                          <div className="flex items-center justify-between mb-4">
                                                 <h3 className="font-bold text-lg text-white">Próximos Turnos</h3>
                                                 <span className="text-xs text-text-grey">{format(today, "d MMM", { locale: es })}</span>
                                          </div>
                                          <MobileBookingTimeline bookings={data?.timeline || []} onOpenBooking={onOpenBooking} />
                                   </section>

                            </main>

                            {/* GLASS BOTTOM NAV */}
                            <nav className="absolute bottom-6 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-40 flex justify-around items-center h-[70px]">
                                   <button
                                          onClick={() => onNavigate?.('dashboard')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all",
                                                 currentView === 'dashboard' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                          )}
                                   >
                                          <LayoutDashboard className="w-6 h-6" />
                                   </button>

                                   <button
                                          onClick={() => onNavigate?.('calendar')}
                                          className={cn(
                                                 "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all",
                                                 currentView === 'calendar' ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                                          )}
                                   >
                                          <CalendarDays className="w-6 h-6" />
                                   </button>

                                   <div className="w-px h-8 bg-white/10 mx-2" />

                                   <Link href="/reportes" className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-white/40 hover:text-white transition-all">
                                          <BarChart3 className="w-6 h-6" />
                                   </Link>

                                   <button onClick={() => setRefreshKey(prev => prev + 1)} className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-white/40 hover:text-white transition-all">
                                          <Zap className="w-6 h-6" />
                                   </button>
                            </nav>
                     </div >

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkAllAsRead={onMarkAllAsRead}
                            isLoading={notificationsLoading}
                     />
              </>
       )
}
