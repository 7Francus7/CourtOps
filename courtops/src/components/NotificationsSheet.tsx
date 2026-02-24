'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, AlertTriangle, Package, Settings, Mail, CalendarDays, DollarSign, Archive, ArrowLeft, Bell, Trash2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationItem } from '@/actions/notifications'
import { isToday, isYesterday, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationsSheetProps {
       isOpen: boolean
       onClose: () => void
       notifications: NotificationItem[]
       onMarkAllAsRead: () => void
       isLoading: boolean
}

export default function NotificationsSheet({
       isOpen,
       onClose,
       notifications,
       onMarkAllAsRead,
       isLoading
}: NotificationsSheetProps) {
       const [filter, setFilter] = useState<'all' | 'booking' | 'payment' | 'stock'>('all')

       // Prevent body scroll when open
       useEffect(() => {
              if (isOpen) {
                     document.body.style.overflow = 'hidden'
              } else {
                     document.body.style.overflow = 'auto'
              }
              return () => {
                     document.body.style.overflow = 'auto'
              }
       }, [isOpen])

       const filteredNotifications = notifications.filter(n => {
              if (filter === 'all') return true
              if (filter === 'booking') return n.type === 'booking'
              if (filter === 'payment') return n.type === 'payment'
              if (filter === 'stock') return n.type === 'stock'
              return true
       })

       // Group by "Hoy" vs "Anteriores"
       const todayList = filteredNotifications.filter(n => isToday(new Date(n.date)))
       const previousList = filteredNotifications.filter(n => !isToday(new Date(n.date)))

       const getIcon = (type: string) => {
              switch (type) {
                     case 'booking': return <CalendarDays size={20} />
                     case 'payment': return <DollarSign size={20} />
                     case 'stock': return <Archive size={20} />
                     case 'message': return <Mail size={20} />
                     default: return <AlertTriangle size={20} />
              }
       }

       const getIconStyles = (type: string) => {
              switch (type) {
                     case 'booking': return 'bg-blue-500/10 text-blue-500 border-blue-500/10'
                     case 'payment': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                     case 'stock': return 'bg-orange-500/10 text-orange-500 border-orange-500/10'
                     case 'message': return 'bg-slate-500/10 text-slate-500 border-slate-500/10'
                     default: return 'bg-primary/10 text-primary border-primary/10'
              }
       }

       return (
              <AnimatePresence>
                     {isOpen && (
                            <>
                                   {/* Backdrop */}
                                   <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={onClose}
                                          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999]"
                                   />

                                   {/* Premium Notification Drawer */}
                                   <motion.div
                                          initial={{ x: '100%', borderRadius: '3rem 0 0 3rem' }}
                                          animate={{ x: 0, borderRadius: '0' }}
                                          exit={{ x: '100%', borderRadius: '3rem 0 0 3rem' }}
                                          transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                                          className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-background shadow-[0_0_100px_rgba(0,0,0,0.4)] z-[1000] flex flex-col font-sans overflow-hidden"
                                   >
                                          {/* Immersive Header */}
                                          <div className="relative px-8 pt-10 pb-6 shrink-0 border-b border-border/50 bg-gradient-to-br from-card to-background">
                                                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-primary">
                                                        <Bell size={120} />
                                                 </div>

                                                 <div className="relative z-10 flex items-center justify-between">
                                                        <div className="flex flex-col gap-1">
                                                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Notifications</p>
                                                               <h2 className="text-3xl font-black text-foreground tracking-tighter">Centro de Actividad</h2>
                                                        </div>
                                                        <button
                                                               onClick={onClose}
                                                               className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground active:scale-90 transition-all border border-border/40 shadow-inner"
                                                        >
                                                               <X size={24} />
                                                        </button>
                                                 </div>

                                                 <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                                        {(['all', 'booking', 'payment', 'stock'] as const).map((t) => (
                                                               <button
                                                                      key={t}
                                                                      onClick={() => setFilter(t)}
                                                                      className={cn(
                                                                             "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                                             filter === t
                                                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                                                    : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
                                                                      )}
                                                               >
                                                                      {t === 'all' ? 'Todo' : t === 'booking' ? 'Turnos' : t === 'payment' ? 'Pagos' : 'Stock'}
                                                               </button>
                                                        ))}
                                                 </div>
                                          </div>

                                          {/* Scrollable Content */}
                                          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 no-scrollbar bg-background">
                                                 {isLoading ? (
                                                        <div className="h-full flex flex-col items-center justify-center gap-4 py-20 px-10 text-center">
                                                               <div className="relative">
                                                                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse" />
                                                                      <div className="absolute inset-0 flex items-center justify-center">
                                                                             <RefreshCw className="text-primary animate-spin-slow w-6 h-6" />
                                                                      </div>
                                                               </div>
                                                               <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Alertas...</p>
                                                        </div>
                                                 ) : notifications.length === 0 ? (
                                                        <div className="h-full flex flex-col items-center justify-center gap-6 py-20 px-10 text-center opacity-40">
                                                               <div className="w-24 h-24 rounded-[2.5rem] bg-muted flex items-center justify-center">
                                                                      <CheckCircle2 size={48} className="text-muted-foreground" />
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <p className="text-lg font-black tracking-tight text-foreground">Sin novedades</p>
                                                                      <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">Has gestionado todas las alertas de tu club.</p>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <>
                                                               {/* Group: Today */}
                                                               {todayList.length > 0 && (
                                                                      <div className="space-y-4">
                                                                             <div className="flex items-center gap-3">
                                                                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Recientes</span>
                                                                                    <div className="h-px bg-primary/20 flex-1" />
                                                                             </div>
                                                                             {todayList.map(n => (
                                                                                    <motion.div
                                                                                           key={n.id}
                                                                                           initial={{ opacity: 0, y: 10 }}
                                                                                           animate={{ opacity: 1, y: 0 }}
                                                                                           className={cn(
                                                                                                  "group relative rounded-[2rem] p-5 border shadow-xl transition-all active:scale-[0.98]",
                                                                                                  n.isRead ? "bg-card border-border/40" : "bg-card border-primary/20 ring-1 ring-primary/10"
                                                                                           )}
                                                                                    >
                                                                                           <div className="flex gap-4">
                                                                                                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-inner", getIconStyles(n.type))}>
                                                                                                         {getIcon(n.type)}
                                                                                                  </div>
                                                                                                  <div className="flex-1 min-w-0">
                                                                                                         <div className="flex justify-between items-start mb-1">
                                                                                                                <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">{n.title}</h4>
                                                                                                                <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50 uppercase tracking-widest leading-none">{n.time}</span>
                                                                                                         </div>
                                                                                                         <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                                                                                                {n.description}
                                                                                                         </p>
                                                                                                  </div>
                                                                                           </div>
                                                                                           {!n.isRead && (
                                                                                                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                                                           )}
                                                                                    </motion.div>
                                                                             ))}
                                                                      </div>
                                                               )}

                                                               {/* Group: Previous */}
                                                               {previousList.length > 0 && (
                                                                      <div className="space-y-4 opacity-70">
                                                                             <div className="flex items-center gap-3">
                                                                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Anteriores</span>
                                                                                    <div className="h-px bg-border/50 flex-1" />
                                                                             </div>
                                                                             {previousList.map(n => (
                                                                                    <div key={n.id} className="flex gap-4 px-2 py-2">
                                                                                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 opacity-50 bg-muted grayscale", getIconStyles(n.type))}>
                                                                                                  {getIcon(n.type)}
                                                                                           </div>
                                                                                           <div className="flex-1 min-w-0">
                                                                                                  <div className="flex justify-between items-start mb-0.5">
                                                                                                         <h4 className="text-sm font-black text-foreground/80 truncate">{n.title}</h4>
                                                                                                         <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">{n.time}</span>
                                                                                                  </div>
                                                                                                  <p className="text-[11px] font-bold text-muted-foreground/60 leading-tight line-clamp-2">
                                                                                                         {n.description}
                                                                                                  </p>
                                                                                           </div>
                                                                                    </div>
                                                                             ))}
                                                                      </div>
                                                               )}
                                                        </>
                                                 )}
                                          </div>

                                          {/* Footer Actions */}
                                          <div className="p-8 border-t border-border/50 bg-card/50 flex flex-col gap-3 pb-safe">
                                                 <button
                                                        onClick={onMarkAllAsRead}
                                                        disabled={notifications.filter(n => !n.isRead).length === 0}
                                                        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                                 >
                                                        <Trash2 size={16} />
                                                        Marcar todo como leído
                                                 </button>
                                                 <button
                                                        onClick={onClose}
                                                        className="w-full flex items-center justify-center gap-3 py-4 bg-muted/50 text-muted-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all border border-border shadow-inner"
                                                 >
                                                        <ArrowLeft size={16} />
                                                        Volver al Dashboard
                                                 </button>
                                          </div>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}