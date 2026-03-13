'use client'

import React, { useEffect, useState } from 'react'
import NotificationsSheet from './NotificationsSheet'
import { WeatherWidget } from './WeatherWidget'
import { MobileBookingTimeline } from './MobileBookingTimeline'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
       Users as UsersIcon,
       Plus,
       Bell,
       Store,
       Zap,
       ChevronRight,
       Globe,
       Copy,
       Lock,
       AlertTriangle,
       MessageCircle,
       TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

import { NotificationItem } from '@/actions/notifications'
import { useEmployee } from '@/contexts/EmployeeContext'

import MovementModal from './dashboard/MovementModal'
import { UpgradeModal } from './layout/UpgradeModal'

interface MobileDashboardProps {
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
       slug,
       onOpenBooking,
       onOpenKiosco,
       notifications,
       unreadCount,
       onMarkAllAsRead,
       notificationsLoading
}: MobileDashboardProps) {
       const [data, setData] = useState<Record<string, unknown> | null>(null)
       const [loading, setLoading] = useState(true)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
       const [refreshKey, setRefreshKey] = useState(0)

       // Upgrade Modal State
       const [showUpgradeModal, setShowUpgradeModal] = useState(false)
       const [lockedFeatureName, setLockedFeatureName] = useState('')

       const handleLockedClick = (featureName: string) => {
              setLockedFeatureName(featureName)
              setShowUpgradeModal(true)
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

       const { activeEmployee } = useEmployee()

       useEffect(() => {
              fetchData()
              const interval = setInterval(fetchData, 10000) // 10s refresh
              return () => clearInterval(interval)
       }, [refreshKey])

       if (loading && !data) {
              return (
                     <div className="bg-background font-sans h-full flex flex-col p-6 space-y-6 pt-12">
                            {/* Header Skeleton */}
                            <div className="flex justify-between items-end mb-4">
                                   <div className="flex flex-col gap-2">
                                          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                                   </div>
                                   <div className="h-12 w-12 bg-muted animate-pulse rounded-2xl" />
                            </div>
                            {/* Weather skeleton */}
                            <div className="h-16 bg-muted/50 animate-pulse rounded-2xl w-full" />
                            {/* Hero skeleton */}
                            <div className="h-48 bg-muted/40 animate-pulse rounded-[2.5rem] w-full mt-4" />
                            {/* Tiles skeleton */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                   <div className="h-32 bg-muted/40 animate-pulse rounded-[2.5rem]" />
                                   <div className="grid grid-rows-2 gap-4">
                                          <div className="h-[60px] bg-muted/40 animate-pulse rounded-[1.5rem]" />
                                          <div className="h-[60px] bg-muted/40 animate-pulse rounded-[1.5rem]" />
                                   </div>
                            </div>
                     </div>
              )
       }

       const today = new Date()
       const totalCourts = data?.courts?.length || 0
       const activeCourtsCount = data?.courts?.filter((c: Record<string, unknown>) => c.status === 'En Juego').length || 0
       const allFree = activeCourtsCount === 0 && totalCourts > 0
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
              toast.success("Datos actualizados")
              setShowQuickActions(false)
       }

       return (
              <>
                     <div className="bg-background font-sans text-foreground antialiased h-full flex flex-col relative overflow-x-hidden">

                            {/* AMBIENT ACCENTS */}
                            <div className="fixed top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                            <div className="fixed bottom-[20%] left-[-20%] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                            {/* PREMIUM HEADER */}
                            <header className="px-6 pt-8 pb-4 shrink-0 z-20 flex justify-between items-end safe-area-top">
                                   <div className="flex flex-col gap-1 min-w-0">
                                          <p className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/60 ml-0.5">Bienvenido</p>
                                          <div className="flex items-center gap-3">
                                                 <h1 className="text-2xl font-black text-foreground tracking-tight truncate max-w-[200px]">{clubName}</h1>
                                                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                                          </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                          <div className="flex flex-col items-end mr-1">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">{activeEmployee ? 'Staff' : 'Admin'}</p>
                                                 <p className="text-[11px] font-bold text-muted-foreground leading-none">{activeEmployee ? activeEmployee.name : 'En línea'}</p>
                                          </div>
                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-12 h-12 rounded-2xl bg-card border border-border/50 flex items-center justify-center relative active:scale-90 transition-all shadow-xl dark:shadow-2xl overflow-hidden"
                                          >
                                                 {unreadCount > 0 && (
                                                        <motion.span
                                                               initial={{ scale: 0 }}
                                                               animate={{ scale: 1 }}
                                                               className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black text-white shadow-lg z-10"
                                                        >
                                                               {unreadCount}
                                                        </motion.span>
                                                 )}
                                                 <Bell className="w-5 h-5 text-muted-foreground" />
                                          </button>
                                   </div>
                            </header>

                            <main className="flex-1 overflow-y-auto px-4 pb-36 space-y-6 no-scrollbar relative z-10">

                                   {/* WEATHER WIDGET */}
                                   <motion.section
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="animate-in slide-in-from-bottom-2 duration-700"
                                   >
                                          <WeatherWidget />
                                   </motion.section>

                                   {/* HERO STATUS WIDGET */}
                                   <motion.section
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.1 }}
                                          className="px-1"
                                   >
                                          <div className="relative glass-card rounded-[2.5rem] p-6 overflow-hidden shadow-2xl transition-all duration-500 border border-border/40">
                                                 <div className="absolute top-0 right-0 p-6 opacity-[0.05] text-primary">
                                                        <Zap className="w-40 h-40" />
                                                 </div>

                                                 <div className="flex justify-between items-center mb-8">
                                                        <div className="min-w-0 flex-1">
                                                               <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mb-1.5">Estado en Tiempo Real</p>
                                                               <h2 className="text-4xl font-black text-foreground tracking-tighter truncate">
                                                                      {allFree ? (
                                                                             <span className="text-emerald-500">100% <span className="text-lg font-bold text-muted-foreground/50">Libre</span></span>
                                                                      ) : (
                                                                             <div className="flex items-baseline gap-1">
                                                                                    <span>{activeCourtsCount}</span>
                                                                                    <span className="text-2xl font-bold text-muted-foreground/20">/</span>
                                                                                    <span className="text-2xl text-muted-foreground/50">{totalCourts}</span>
                                                                                    <span className="text-sm font-bold text-muted-foreground/40 ml-2 uppercase tracking-widest">Ocup</span>
                                                                             </div>
                                                                      )}
                                                               </h2>
                                                        </div>
                                                        <div className="flex flex-col items-end shrink-0">
                                                               <div className="px-4 py-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[1.25rem] border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner">
                                                                      <span className="text-[8px] font-black uppercase tracking-widest block leading-none mb-1 opacity-70">En Caja Hoy</span>
                                                                      <span className="text-xl font-black tracking-tighter">${(data?.caja?.total ?? 0).toLocaleString()}</span>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Courts Layout Miniatures */}
                                                 <div className="grid grid-cols-2 gap-3">
                                                        {data?.courts?.slice(0, 4).map((court: Record<string, unknown>) => (
                                                               <div key={court.id} className={cn(
                                                                      "p-3.5 rounded-2xl border transition-all duration-300 active:scale-95",
                                                                      court.status === 'En Juego'
                                                                             ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-[inset_0_2px_4px_rgba(59,130,246,0.1)]"
                                                                             : "bg-muted/30 border-border/50 text-muted-foreground/50"
                                                               )}>
                                                                      <div className="flex justify-between items-center mb-1">
                                                                             <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[70px] leading-none">{court.name}</span>
                                                                             <div className={cn("w-2 h-2 rounded-full", court.status === 'En Juego' ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-muted-foreground/20")} />
                                                                      </div>
                                                                      <p className="text-[10px] font-black tracking-tight">{court.status === 'En Juego' ? 'EN JUEGO' : 'LIBRE'}</p>
                                                               </div>
                                                        ))}
                                                 </div>
                                          </div>
                                   </motion.section>

                                   {/* HOURLY OCCUPANCY MINI-BAR (#8) */}
                                   {data?.hourlyOccupancy && (data.hourlyOccupancy as { hour: number; pct: number }[]).length > 0 && (
                                          <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                                 <div className="glass-card rounded-[2rem] p-5 border border-border/40 shadow-lg">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Ocupación por Hora</p>
                                                        <div className="flex items-end gap-1 h-16">
                                                               {(data.hourlyOccupancy as { hour: number; pct: number }[]).map((slot) => {
                                                                      const nowHour = new Date().getHours()
                                                                      const isCurrent = slot.hour === nowHour
                                                                      return (
                                                                             <div key={slot.hour} className="flex-1 flex flex-col items-center gap-1">
                                                                                    <div
                                                                                           className={cn(
                                                                                                  "w-full rounded-t-sm transition-all",
                                                                                                  isCurrent ? "bg-primary" : slot.pct > 70 ? "bg-red-400/60" : slot.pct > 30 ? "bg-blue-400/40" : "bg-muted/60"
                                                                                           )}
                                                                                           style={{ height: `${Math.max(slot.pct, 4)}%` }}
                                                                                    />
                                                                                    {isCurrent && <div className="w-1 h-1 rounded-full bg-primary" />}
                                                                             </div>
                                                                      )
                                                               })}
                                                        </div>
                                                        <div className="flex justify-between mt-1.5">
                                                               <span className="text-[8px] text-muted-foreground font-bold">{(data.hourlyOccupancy as { hour: number }[])[0]?.hour}h</span>
                                                               <span className="text-[8px] text-muted-foreground font-bold">{(data.hourlyOccupancy as { hour: number }[])[(data.hourlyOccupancy as { hour: number }[]).length - 1]?.hour}h</span>
                                                        </div>
                                                 </div>
                                          </motion.section>
                                   )}

                                   {/* ACTION TILES */}
                                   <div className="grid grid-cols-2 gap-4">
                                          <button
                                                 onClick={() => onOpenBooking({ isNew: true })}
                                                 className="aspect-square glass-card rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 active:scale-90 transition-all border border-border/40 shadow-xl"
                                          >
                                                 <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                                        <Plus size={32} strokeWidth={3} />
                                                 </div>
                                                 <span className="text-xs font-black uppercase tracking-widest">Nueva Reserva</span>
                                          </button>

                                          <div className="grid grid-rows-2 gap-4">
                                                 <button
                                                        onClick={() => data?.features?.hasKiosco ? onOpenKiosco() : handleLockedClick('Kiosco')}
                                                        className="glass-card rounded-[1.5rem] px-5 flex items-center gap-4 active:scale-95 transition-all border border-border/40 shadow-lg group"
                                                 >
                                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                                                               <Store size={20} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Kiosco</span>
                                                        {!data?.features?.hasKiosco && <Lock size={12} className="ml-auto text-muted-foreground/30" />}
                                                 </button>

                                                 <Link
                                                        href="/clientes"
                                                        className="glass-card rounded-[1.5rem] px-5 flex items-center gap-4 active:scale-95 transition-all border border-border/40 shadow-lg group"
                                                 >
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                                               <UsersIcon size={20} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Clientes</span>
                                                 </Link>
                                          </div>
                                   </div>

                                   {/* PUBLIC LINK TILES - FULL WIDTH */}
                                   <button
                                          onClick={handleCopyLink}
                                          className="w-full glass-card rounded-[2rem] p-5 flex items-center justify-between active:scale-95 transition-all border border-border/40 shadow-xl"
                                   >
                                          <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                                        <Globe size={24} />
                                                 </div>
                                                 <div className="flex flex-col items-start">
                                                        <span className="text-xs font-black uppercase tracking-[0.15em]">Link Público</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Reservas Online</span>
                                                 </div>
                                          </div>
                                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                                 <Copy size={18} />
                                          </div>
                                   </button>

                                   {/* ALERTS SECTION */}
                                   {alertCount > 0 && (
                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.9 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 className="bg-red-500 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-red-500/30 text-white"
                                          >
                                                 <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                                                        <Zap size={24} className="relative z-10" />
                                                 </div>
                                                 <div className="flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Acción Requerida</p>
                                                        <p className="text-sm font-black">{alertCount} reservas críticas</p>
                                                 </div>
                                                 <ChevronRight size={20} className="opacity-50" />
                                          </motion.div>
                                   )}

                                   {/* DEBTS WIDGET - MOBILE */}
                                   {data?.debts && data.debts.totalCount > 0 && (
                                          <motion.section
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.3 }}
                                          >
                                                 <div className="glass-card rounded-[2rem] p-5 border border-red-500/20 bg-red-500/5 shadow-lg">
                                                        <div className="flex items-center justify-between mb-4">
                                                               <div className="flex items-center gap-2">
                                                                      <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                                             <AlertTriangle size={16} className="text-red-500" />
                                                                      </div>
                                                                      <div>
                                                                             <p className="text-[9px] font-black uppercase tracking-widest text-red-500">Deudas Pendientes</p>
                                                                             <p className="text-lg font-black text-foreground tracking-tighter">${(data.debts.totalAmount ?? 0).toLocaleString()}</p>
                                                                      </div>
                                                               </div>
                                                               <span className="text-[10px] font-bold text-muted-foreground">{data.debts.totalCount} sin pagar</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                               {(data.debts.topDebtors || []).slice(0, 3).map((debtor: Record<string, unknown>, i: number) => (
                                                                      <div key={i} className="flex items-center justify-between p-2.5 bg-background/50 rounded-xl border border-border/50">
                                                                             <div className="flex items-center gap-2.5 min-w-0">
                                                                                    <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 text-[10px] font-black shrink-0">
                                                                                           {(debtor.name as string)?.[0]?.toUpperCase() || '?'}
                                                                                    </div>
                                                                                    <span className="text-xs font-bold text-foreground truncate">{debtor.name as string}</span>
                                                                             </div>
                                                                             <div className="flex items-center gap-2 shrink-0">
                                                                                    <span className="text-xs font-black text-red-500">${(debtor.total as number)?.toLocaleString()}</span>
                                                                                    {debtor.phone && (
                                                                                           <a
                                                                                                  href={`https://wa.me/${(debtor.phone as string).replace(/\D/g, '')}`}
                                                                                                  target="_blank"
                                                                                                  rel="noopener noreferrer"
                                                                                                  className="w-7 h-7 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]"
                                                                                           >
                                                                                                  <MessageCircle size={12} />
                                                                                           </a>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </div>
                                          </motion.section>
                                   )}

                                   {/* END-OF-DAY SUMMARY */}
                                   {data?.endOfDay && new Date().getHours() >= 20 && (
                                          <motion.section
                                                 initial={{ opacity: 0, y: 20 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.35 }}
                                          >
                                                 <div className="glass-card rounded-[2rem] p-5 border border-primary/20 bg-primary/5 shadow-lg">
                                                        <div className="flex items-center gap-2 mb-3">
                                                               <TrendingUp size={16} className="text-primary" />
                                                               <p className="text-[9px] font-black uppercase tracking-widest text-primary">Resumen del Día</p>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                               <div className="text-center">
                                                                      <p className="text-xl font-black text-foreground">{data.endOfDay.totalBookings ?? 0}</p>
                                                                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Turnos</p>
                                                               </div>
                                                               <div className="text-center">
                                                                      <p className="text-xl font-black text-emerald-500">${(data.endOfDay.totalRevenue ?? 0).toLocaleString()}</p>
                                                                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Facturado</p>
                                                               </div>
                                                               <div className="text-center">
                                                                      <p className="text-xl font-black text-foreground">{data.endOfDay.occupancy ?? 0}%</p>
                                                                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Ocupación</p>
                                                               </div>
                                                        </div>
                                                        <Link
                                                               href="/caja"
                                                               className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                                                        >
                                                               Ir a Cerrar Caja <ChevronRight size={14} />
                                                        </Link>
                                                 </div>
                                          </motion.section>
                                   )}

                                   {/* TURNERO TIMELINE */}
                                   <section className="space-y-4 pt-2">
                                          <div className="flex items-center justify-between px-2">
                                                 <div className="flex flex-col">
                                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-1">Agenda</p>
                                                        <h3 className="text-xl font-black tracking-tight">Próximos Turnos</h3>
                                                 </div>
                                                 <div className="px-3 py-1.5 bg-muted rounded-full text-[11px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
                                                        {format(today, "d MMMM", { locale: es })}
                                                 </div>
                                          </div>

                                          <div className="px-1">
                                                 <MobileBookingTimeline
                                                        bookings={data?.timeline || []}
                                                        onOpenBooking={onOpenBooking}
                                                 />
                                          </div>
                                   </section>

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
