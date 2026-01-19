'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, AlertTriangle, Package, Settings, Mail, CalendarDays, DollarSign, Archive, ArrowLeft } from 'lucide-react'
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
       const today = filteredNotifications.filter(n => isToday(new Date(n.date)))
       const previous = filteredNotifications.filter(n => !isToday(new Date(n.date)))

       const getIcon = (type: string) => {
              switch (type) {
                     case 'booking': return <CalendarDays className="w-6 h-6 text-[#3B82F6]" />
                     case 'payment': return <DollarSign className="w-6 h-6 text-brand-green" />
                     case 'stock': return <Archive className="w-6 h-6 text-[#F97316]" /> // orange-400
                     case 'message': return <Mail className="w-6 h-6 text-[#94A3B8]" /> // slate-400
                     default: return <AlertTriangle className="w-6 h-6 text-[#94A3B8]" />
              }
       }

       const getIconBg = (type: string) => {
              switch (type) {
                     case 'booking': return 'bg-[#3B82F6]/10'
                     case 'payment': return 'bg-brand-green/10'
                     case 'stock': return 'bg-[#F97316]/10'
                     case 'message': return 'bg-[#64748B]/10'
                     default: return 'bg-[#64748B]/10'
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
                                          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999]"
                                   />

                                   {/* Sheet */}
                                   <motion.div
                                          initial={{ x: '100%' }}
                                          animate={{ x: 0 }}
                                          exit={{ x: '100%' }}
                                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                          className="fixed inset-y-0 right-0 w-full sm:max-w-[420px] bg-[#09090b]/80 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[1000] flex flex-col font-sans"
                                   >
                                          {/* Gradient Top Line */}
                                          <div className="h-1 w-full bg-gradient-to-r from-brand-green via-brand-green/80 to-brand-blue" />

                                          {/* Handle */}
                                          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3 mb-1 shrink-0 lg:hidden" />

                                          {/* Header */}
                                          <div className="px-6 py-6 flex items-center justify-between shrink-0 border-b border-white/5 bg-white/[0.02]">
                                                 <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-brand-green/10 rounded-xl text-brand-green">
                                                               <AlertTriangle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                               <h2 className="text-xl font-bold text-white tracking-tight">Centro de Alertas</h2>
                                                               <p className="text-xs text-white/40 font-medium">
                                                                      {notifications.filter(n => !n.isRead).length > 0
                                                                             ? `${notifications.filter(n => !n.isRead).length} nuevas alertas`
                                                                             : 'Todo al día'
                                                                      }
                                                               </p>
                                                        </div>
                                                 </div>
                                                 <button
                                                        onClick={onMarkAllAsRead}
                                                        className="p-2 text-white/40 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all"
                                                        title="Marcar todo como leído"
                                                 >
                                                        <Archive className="w-5 h-5" />
                                                 </button>
                                          </div>

                                          {/* Filters */}
                                          <div className="px-6 py-4 overflow-x-auto no-scrollbar flex gap-2 shrink-0 border-b border-white/5 bg-black/20">
                                                 <button
                                                        onClick={() => setFilter('all')}
                                                        className={cn(
                                                               "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                                                               filter === 'all'
                                                                      ? "bg-white/10 text-white border-white/10"
                                                                      : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                                                        )}
                                                 >
                                                        Todo
                                                 </button>
                                                 <button
                                                        onClick={() => setFilter('booking')}
                                                        className={cn(
                                                               "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                                                               filter === 'booking'
                                                                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                                      : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                                                        )}
                                                 >
                                                        Reservas
                                                 </button>
                                                 <button
                                                        onClick={() => setFilter('payment')}
                                                        className={cn(
                                                               "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2",
                                                               filter === 'payment'
                                                                      ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                                                                      : "bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                                                        )}
                                                 >
                                                        Pagos
                                                 </button>
                                          </div>

                                          {/* Content List */}
                                          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-2">
                                                 {isLoading && (
                                                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                                                               <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-green animate-spin" />
                                                               <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Sincronizando...</span>
                                                        </div>
                                                 )}

                                                 {!isLoading && notifications.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center h-64 text-center">
                                                               <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 text-white/20">
                                                                      <AlertTriangle className="w-8 h-8" />
                                                               </div>
                                                               <h3 className="text-white/60 font-medium mb-1">Sin notificaciones</h3>
                                                               <p className="text-xs text-white/30 max-w-[200px]">Estás al día con todas las actividades del club.</p>
                                                        </div>
                                                 )}

                                                 {/* Today Section */}
                                                 {!isLoading && today.length > 0 && (
                                                        <div className="space-y-2">
                                                               <div className="px-2 py-1 sticky top-0 bg-[#09090b]/95 backdrop-blur-md z-10 border-y border-white/5 -mx-4 px-6 mb-2">
                                                                      <h3 className="text-[10px] font-black text-brand-green uppercase tracking-widest">Hoy</h3>
                                                               </div>
                                                               {today.map(notification => (
                                                                      <div key={notification.id} className="group relative bg-[#121214] hover:bg-[#18181b] rounded-xl p-4 border border-white/[0.06] transition-all hover:border-white/10 hover:shadow-lg hover:shadow-black/50">
                                                                             <div className="flex gap-4">
                                                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner", getIconBg(notification.type))}>
                                                                                           {getIcon(notification.type)}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                           <div className="flex justify-between items-start mb-1">
                                                                                                  <h4 className="text-sm font-bold text-white group-hover:text-brand-green transition-colors truncate">{notification.title}</h4>
                                                                                                  <span className="text-[10px] text-white/30 font-mono">{notification.time}</span>
                                                                                           </div>
                                                                                           <p className="text-xs text-white/50 leading-relaxed mb-3 group-hover:text-white/70 transition-colors">
                                                                                                  {notification.description}
                                                                                           </p>
                                                                                           {notification.type === 'booking' && (
                                                                                                  <div className="flex gap-2">
                                                                                                         <button className="px-3 py-1.5 bg-white/5 hover:bg-brand-green/20 text-white/70 hover:text-brand-green text-[10px] font-bold uppercase tracking-wide rounded border border-white/5 transition-all">
                                                                                                                Ver Reserva
                                                                                                         </button>
                                                                                                  </div>
                                                                                           )}
                                                                                    </div>
                                                                                    {!notification.isRead && (
                                                                                           <div className="w-2 h-2 rounded-full bg-brand-green mt-1.5 shrink-0 shadow-[0_0_10px_rgba(var(--secondary-rgb),0.5)] animate-pulse"></div>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 )}

                                                 {/* Previous Section */}
                                                 {!isLoading && previous.length > 0 && (
                                                        <div className="space-y-2 pt-4">
                                                               <div className="px-2 py-1 sticky top-0 bg-[#09090b]/95 backdrop-blur-md z-10 border-y border-white/5 -mx-4 px-6 mb-2">
                                                                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Anteriores</h3>
                                                               </div>
                                                               {previous.map(notification => (
                                                                      <div key={notification.id} className="group relative bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-4 border border-white/[0.04] transition-all opacity-60 hover:opacity-100">
                                                                             <div className="flex gap-4">
                                                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 grayscale opacity-50", getIconBg(notification.type))}>
                                                                                           {getIcon(notification.type)}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                           <div className="flex justify-between items-start mb-1">
                                                                                                  <h4 className="text-sm font-medium text-white/80 truncate">{notification.title}</h4>
                                                                                                  <span className="text-[10px] text-white/20 font-mono">{notification.time}</span>
                                                                                           </div>
                                                                                           <p className="text-xs text-white/40 leading-relaxed">
                                                                                                  {notification.description}
                                                                                           </p>
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Footer */}
                                          <div className="p-4 border-t border-white/5 bg-[#09090b] shrink-0">
                                                 <button
                                                        onClick={onClose}
                                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-white/10 text-sm"
                                                 >
                                                        <ArrowLeft className="w-4 h-4 text-white/50" />
                                                        Cerrar Panel
                                                 </button>
                                          </div>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}