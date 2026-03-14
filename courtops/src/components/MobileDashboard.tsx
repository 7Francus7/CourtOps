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
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
                            <header className="px-5 pt-8 pb-3 shrink-0 z-20 safe-area-top">
                                   <div className="flex justify-between items-start">
                                          <div className="min-w-0">
                                                 <p className="text-[11px] font-semibold text-muted-foreground capitalize">
                                                        {format(today, "EEEE d 'de' MMMM", { locale: es })}
                                                 </p>
                                                 <h1 className="text-2xl font-black text-foreground tracking-tight truncate">{clubName}</h1>
                                          </div>
                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center relative active:scale-90 transition-transform"
                                          >
                                                 {unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                                                               {unreadCount}
                                                        </span>
                                                 )}
                                                 <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                                          </button>
                                   </div>
                            </header>

                            <main className="flex-1 overflow-y-auto px-5 pb-36 space-y-5 no-scrollbar">

                                   {/* STATS ROW */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 12 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="grid grid-cols-3 gap-3"
                                   >
                                          {/* Caja */}
                                          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col">
                                                 <div className="flex items-center gap-1.5 mb-2">
                                                        <Banknote size={14} className="text-emerald-500" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Caja</span>
                                                 </div>
                                                 <span className="text-lg font-black text-foreground leading-none">
                                                        ${(data?.caja?.total ?? 0).toLocaleString()}
                                                 </span>
                                          </div>

                                          {/* Canchas */}
                                          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col">
                                                 <div className="flex items-center gap-1.5 mb-2">
                                                        <CircleDot size={14} className="text-blue-500" />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">En Juego</span>
                                                 </div>
                                                 <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-foreground leading-none">{activeCourtsCount}</span>
                                                        <span className="text-sm text-muted-foreground/50 font-bold">/{totalCourts}</span>
                                                 </div>
                                          </div>

                                          {/* Pendiente */}
                                          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col">
                                                 <div className="flex items-center gap-1.5 mb-2">
                                                        <Clock size={14} className={pending > 0 ? "text-amber-500" : "text-emerald-500"} />
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Pend.</span>
                                                 </div>
                                                 <span className={cn("text-lg font-black leading-none", pending > 0 ? "text-amber-500" : "text-foreground")}>
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
                                                 className="bg-card border border-border rounded-2xl p-4"
                                          >
                                                 <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Canchas</p>
                                                 <div className="flex flex-wrap gap-2">
                                                        {data.courts.map((court) => (
                                                               <div
                                                                      key={String(court.id)}
                                                                      className={cn(
                                                                             "px-3 py-2 rounded-xl text-xs font-bold border transition-colors",
                                                                             court.status === 'En Juego'
                                                                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                                                                                    : "bg-muted/50 border-border text-muted-foreground"
                                                                      )}
                                                               >
                                                                      <span className="mr-1.5">{court.status === 'En Juego' ? '●' : '○'}</span>
                                                                      {court.name}
                                                               </div>
                                                        ))}
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
                                          <button
                                                 onClick={() => onOpenBooking({ isNew: true })}
                                                 className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                                          >
                                                 <Plus size={22} strokeWidth={2.5} />
                                                 <span className="text-sm font-bold">Nueva Reserva</span>
                                          </button>

                                          <button
                                                 onClick={() => data?.features?.hasKiosco ? onOpenKiosco() : handleLockedClick('Kiosco')}
                                                 className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                                          >
                                                 <Store size={20} className="text-purple-500" />
                                                 <span className="text-sm font-bold text-foreground">Kiosco</span>
                                                 {!data?.features?.hasKiosco && <Lock size={12} className="ml-auto text-muted-foreground/40" />}
                                          </button>

                                          <Link
                                                 href="/clientes"
                                                 className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                                          >
                                                 <UsersIcon size={20} className="text-blue-500" />
                                                 <span className="text-sm font-bold text-foreground">Clientes</span>
                                          </Link>

                                          <button
                                                 onClick={handleCopyLink}
                                                 className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
                                          >
                                                 <Globe size={20} className="text-emerald-500" />
                                                 <span className="text-sm font-bold text-foreground">Link</span>
                                                 <Copy size={14} className="ml-auto text-muted-foreground/40" />
                                          </button>
                                   </motion.div>

                                   {/* ALERTS */}
                                   {alertCount > 0 && (
                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
                                          >
                                                 <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                                        <AlertTriangle size={20} className="text-red-500" />
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-foreground">{alertCount} reservas requieren atención</p>
                                                 </div>
                                                 <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                                          </motion.div>
                                   )}

                                   {/* DEBTS */}
                                   {data?.debts && data.debts.totalCount > 0 && (
                                          <motion.div
                                                 initial={{ opacity: 0, y: 12 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.15 }}
                                                 className="bg-card border border-border rounded-2xl p-4"
                                          >
                                                 <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                               <AlertTriangle size={14} className="text-red-500" />
                                                               <span className="text-[10px] font-bold text-muted-foreground uppercase">Deudas</span>
                                                        </div>
                                                        <span className="text-sm font-black text-red-500">${(data.debts.totalAmount ?? 0).toLocaleString()}</span>
                                                 </div>
                                                 <div className="space-y-2">
                                                        {(data.debts.topDebtors || []).slice(0, 3).map((debtor, i) => (
                                                               <div key={i} className="flex items-center justify-between py-2 border-t border-border first:border-0 first:pt-0">
                                                                      <div className="flex items-center gap-2 min-w-0">
                                                                             <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                                                                    {debtor.name?.[0]?.toUpperCase() || '?'}
                                                                             </div>
                                                                             <span className="text-sm font-medium text-foreground truncate">{debtor.name}</span>
                                                                      </div>
                                                                      <div className="flex items-center gap-2 shrink-0">
                                                                             <span className="text-sm font-bold text-red-500">${debtor.total?.toLocaleString()}</span>
                                                                             {!!debtor.phone && (
                                                                                    <a
                                                                                           href={`https://wa.me/${debtor.phone.replace(/\D/g, '')}`}
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
                                          className="space-y-3"
                                   >
                                          <div className="flex items-center justify-between">
                                                 <h3 className="text-base font-bold text-foreground">Próximos Turnos</h3>
                                                 <span className="text-xs text-muted-foreground font-medium capitalize">
                                                        {format(today, "d MMM", { locale: es })}
                                                 </span>
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
