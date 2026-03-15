'use client'

import React, { useEffect, useState } from 'react'
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
       Copy,
       Lock,
       AlertTriangle,
       MessageCircle,
       TrendingUp,
       Banknote,
       CircleDot,
       Clock,
       Moon,
       Sun,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

import { getMobileDashboardData } from '@/actions/dashboard_mobile'
import { cn } from '@/lib/utils'

import { NotificationItem } from '@/actions/notifications'
import { useEmployee } from '@/contexts/EmployeeContext'

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
       notifications,
       unreadCount,
       onMarkAllAsRead,
       notificationsLoading
}: MobileDashboardProps) {
       const [data, setData] = useState<MobileDashboardData | null>(null)
       const [loading, setLoading] = useState(true)
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
       const [refreshKey, setRefreshKey] = useState(0)

       const [showUpgradeModal, setShowUpgradeModal] = useState(false)
       const [lockedFeatureName, setLockedFeatureName] = useState('')

       const handleLockedClick = (featureName: string) => {
              setLockedFeatureName(featureName)
              setShowUpgradeModal(true)
       }

       const fetchData = async () => {
              try {
                     const res = await getMobileDashboardData()
                     setData(res as unknown as MobileDashboardData)
              } catch (e) {
                     console.error(e)
              } finally {
                     setLoading(false)
              }
       }

       const { activeEmployee } = useEmployee()
       const { theme, setTheme } = useTheme()

       useEffect(() => {
              fetchData()
              const interval = setInterval(fetchData, 10000)
              return () => clearInterval(interval)
       }, [refreshKey])

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
       const alertCount = data?.alerts?.length || 0
       const pending = data?.receivables || 0

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

       return (
              <>
                     <div className="bg-background text-foreground h-full flex flex-col relative overflow-x-hidden">

                            {/* HEADER */}
                            <header className="px-5 pt-[max(env(safe-area-inset-top),2rem)] pb-3 shrink-0 z-20">
                                   <div className="flex justify-between items-center gap-3">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                                 <div className="w-11 h-11 bg-primary rounded-[0.875rem] flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20 overflow-hidden">
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
                                                        <p className="text-[10px] font-semibold text-muted-foreground capitalize mb-0.5">
                                                               {format(today, "EEEE d 'de' MMMM", { locale: es })}
                                                        </p>
                                                        <h1 className="text-xl font-black text-foreground tracking-tight truncate">{clubName}</h1>
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                                 <button
                                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                        className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                                                 >
                                                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                                 </button>
                                                 <button
                                                        onClick={() => setIsNotificationsOpen(true)}
                                                        className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center relative active:scale-90 transition-transform"
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

                            <main className="flex-1 overflow-y-auto px-5 pb-28 space-y-5 no-scrollbar">

                                    {/* STATS ROW */}
                                    <motion.div
                                           initial={{ opacity: 0, y: 12 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           className="grid grid-cols-3 gap-2.5"
                                    >
                                           {/* Caja */}
                                           <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-3.5 flex flex-col transition-all active:scale-95 shadow-xl hover:bg-card/60 overflow-hidden min-w-0">
                                                  <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                  <div className="flex items-center gap-1.5 mb-2 relative z-10">
                                                         <div className="p-1 rounded-md bg-emerald-500/10 shrink-0">
                                                                <Banknote size={11} className="text-emerald-500" />
                                                         </div>
                                                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider truncate">Caja</span>
                                                  </div>
                                                  <span className="text-[15px] font-black text-foreground leading-none relative z-10 truncate">
                                                         ${(data?.caja?.total ?? 0).toLocaleString()}
                                                  </span>
                                           </div>

                                           {/* Canchas */}
                                           <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-3.5 flex flex-col transition-all active:scale-95 shadow-xl hover:bg-card/60 overflow-hidden min-w-0">
                                                  <div className="absolute inset-0 bg-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                  <div className="flex items-center gap-1.5 mb-2 relative z-10">
                                                         <div className="p-1 rounded-md bg-blue-500/10 shrink-0">
                                                                <CircleDot size={11} className="text-blue-500" />
                                                         </div>
                                                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider truncate">Turnos</span>
                                                  </div>
                                                  <div className="flex items-baseline gap-0.5 relative z-10">
                                                         <span className="text-[15px] font-black text-foreground leading-none">{activeCourtsCount}</span>
                                                         <span className="text-[10px] text-muted-foreground/40 font-black">/{totalCourts}</span>
                                                  </div>
                                           </div>

                                           {/* Pendiente */}
                                           <div className="group relative bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-3.5 flex flex-col transition-all active:scale-95 shadow-xl hover:bg-card/60 overflow-hidden min-w-0">
                                                  <div className="absolute inset-0 bg-amber-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                  <div className="flex items-center gap-1.5 mb-2 relative z-10">
                                                         <div className={cn(
                                                                "p-1 rounded-md shrink-0",
                                                                pending > 0 ? "bg-amber-500/10" : "bg-emerald-500/10"
                                                         )}>
                                                                <Clock size={11} className={pending > 0 ? "text-amber-500" : "text-emerald-500"} />
                                                         </div>
                                                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider truncate">Pend.</span>
                                                  </div>
                                                  <span className={cn("text-[15px] font-black leading-none relative z-10 truncate", pending > 0 ? "text-amber-500" : "text-foreground")}>
                                                         ${pending.toLocaleString()}
                                                  </span>
                                           </div>
                                    </motion.div>

                                    {/* COURTS STATUS */}
                                    {data?.courts && data.courts.length > 0 && (
                                           <motion.div
                                                  initial={{ opacity: 0, y: 12 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{ delay: 0.05 }}
                                                  className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-5 shadow-2xl overflow-hidden relative"
                                           >
                                                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Estado de Canchas</p>
                                                  <div className="flex flex-col gap-2.5">
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
                                                                                     "w-full px-4 py-3 rounded-2xl text-left border transition-all duration-300 flex items-center gap-3 shadow-sm active:scale-[0.98]",
                                                                                     isPlaying
                                                                                            ? "bg-blue-500/10 border-blue-500/20"
                                                                                            : "bg-muted/20 border-white/5 hover:bg-muted/30"
                                                                              )}
                                                                       >
                                                                              <div className={cn(
                                                                                     "w-2 h-2 rounded-full shrink-0",
                                                                                     isPlaying ? "bg-blue-500 animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.5)]" : "bg-emerald-500/40"
                                                                              )} />
                                                                              <div className="flex-1 min-w-0">
                                                                                     <span className={cn(
                                                                                            "text-[12px] font-black block truncate",
                                                                                            isPlaying ? "text-blue-500" : "text-foreground"
                                                                                     )}>
                                                                                            {court.name}
                                                                                     </span>
                                                                                     <span className={cn(
                                                                                            "text-[10px] font-semibold block mt-0.5",
                                                                                            isPlaying ? "text-blue-400/70" : "text-muted-foreground/50"
                                                                                     )}>
                                                                                            {isPlaying ? court.status : 'Disponible'}
                                                                                     </span>
                                                                              </div>
                                                                              {court.timeDisplay && (
                                                                                     <span className={cn(
                                                                                            "text-[10px] font-black px-2.5 py-1 rounded-xl shrink-0",
                                                                                            isPlaying
                                                                                                   ? "bg-blue-500/20 text-blue-400"
                                                                                                   : "bg-emerald-500/10 text-emerald-500"
                                                                                     )}>
                                                                                            {isPlaying ? court.timeDisplay : `Próx ${court.timeDisplay}`}
                                                                                     </span>
                                                                              )}
                                                                              <ChevronRight size={14} className="text-muted-foreground/20 shrink-0" />
                                                                       </button>
                                                                )
                                                         })}
                                                  </div>
                                           </motion.div>
                                    )}

                                   {/* QUICK ACTIONS */}
                                    <motion.div
                                           initial={{ opacity: 0, y: 12 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           transition={{ delay: 0.1 }}
                                           className="grid grid-cols-2 gap-3"
                                    >
                                           <motion.button
                                                  whileHover={{ scale: 1.02 }}
                                                  whileTap={{ scale: 0.98 }}
                                                  onClick={() => onOpenBooking({ isNew: true })}
                                                  className="relative overflow-hidden bg-primary text-primary-foreground rounded-3xl p-5 flex items-center gap-4 shadow-xl shadow-primary/20 group"
                                           >
                                                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                                         <Plus size={24} strokeWidth={3} />
                                                  </div>
                                                  <span className="text-sm font-black tracking-tight leading-tight">Nueva<br/>Reserva</span>
                                           </motion.button>

                                           <motion.button
                                                  whileHover={{ scale: 1.02 }}
                                                  whileTap={{ scale: 0.98 }}
                                                  onClick={() => data?.features?.hasKiosco ? onOpenKiosco() : handleLockedClick('Kiosco')}
                                                  className="relative overflow-hidden bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-xl shadow-black/5 hover:bg-card/60 transition-all group"
                                           >
                                                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                         <Store size={22} className="text-purple-500" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                         <p className="text-sm font-black tracking-tight text-foreground truncate">Kiosco</p>
                                                         {!data?.features?.hasKiosco && <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5 block flex items-center gap-1"><Lock size={8} /> Pro</span>}
                                                  </div>
                                           </motion.button>

                                           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="contents">
                                                  <Link
                                                         href="/clientes"
                                                         className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-xl shadow-black/5 hover:bg-card/60 transition-all"
                                                  >
                                                         <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                                <UsersIcon size={22} className="text-blue-500" />
                                                         </div>
                                                         <span className="text-sm font-black tracking-tight text-foreground truncate">Clientes</span>
                                                  </Link>
                                           </motion.div>

                                           <motion.button
                                                  whileHover={{ scale: 1.02 }}
                                                  whileTap={{ scale: 0.98 }}
                                                  onClick={handleCopyLink}
                                                  className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4 shadow-xl shadow-black/5 hover:bg-card/60 transition-all group"
                                           >
                                                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                         <Globe size={22} className="text-emerald-500" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                         <span className="text-sm font-black tracking-tight text-foreground truncate leading-none">Link Club</span>
                                                  </div>
                                                  <Copy size={12} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                           </motion.button>
                                    </motion.div>

                                    {/* ALERTS — shown inline in stats, removed standalone card */}

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
