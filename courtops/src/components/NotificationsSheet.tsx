'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, AlertTriangle, Package, Settings, Mail, CalendarDays, DollarSign, Archive, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getNotifications, NotificationItem } from '@/actions/notifications'
import { isToday, isYesterday, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationsSheetProps {
       isOpen: boolean
       onClose: () => void
}

export default function NotificationsSheet({ isOpen, onClose }: NotificationsSheetProps) {
       const [filter, setFilter] = useState<'all' | 'booking' | 'payment' | 'stock'>('all')
       const [notifications, setNotifications] = useState<NotificationItem[]>([])
       const [loading, setLoading] = useState(false)

       // Prevent body scroll when open
       useEffect(() => {
              if (isOpen) {
                     document.body.style.overflow = 'hidden'
                     fetchData()
              } else {
                     document.body.style.overflow = 'auto'
              }
              return () => {
                     document.body.style.overflow = 'auto'
              }
       }, [isOpen])

       const fetchData = async () => {
              setLoading(true)
              try {
                     const data = await getNotifications()
                     setNotifications(data)
              } catch (error) {
                     console.error(error)
              } finally {
                     setLoading(false)
              }
       }

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

       const markAllAsRead = () => {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
       }

       const getIcon = (type: string) => {
              switch (type) {
                     case 'booking': return <CalendarDays className="w-6 h-6 text-[#3B82F6]" />
                     case 'payment': return <DollarSign className="w-6 h-6 text-[#22c55e]" /> // green-500
                     case 'stock': return <Archive className="w-6 h-6 text-[#F97316]" /> // orange-400
                     case 'message': return <Mail className="w-6 h-6 text-[#94A3B8]" /> // slate-400
                     default: return <AlertTriangle className="w-6 h-6 text-[#94A3B8]" />
              }
       }

       const getIconBg = (type: string) => {
              switch (type) {
                     case 'booking': return 'bg-[#3B82F6]/10'
                     case 'payment': return 'bg-[#22c55e]/10'
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
                                          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                          className="fixed inset-y-0 right-0 w-full sm:max-w-[420px] bg-[#F8FAFC]/90 dark:bg-[#0A121E]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[1000] flex flex-col font-sans"
                                   >
                                          {/* Handle */}
                                          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0 lg:hidden" />

                                          {/* Header */}
                                          <div className="px-6 py-4 flex items-center justify-between shrink-0">
                                                 <div className="flex items-center gap-2">
                                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Notificaciones</h2>
                                                        <span className="bg-[#CCFF00] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                                               {notifications.filter(n => !n.isRead).length}
                                                        </span>
                                                 </div>
                                                 <button
                                                        onClick={markAllAsRead}
                                                        className="text-[#CCFF00] text-sm font-medium hover:opacity-80 transition-opacity"
                                                 >
                                                        Marcar todo como leído
                                                 </button>
                                          </div>

                                          {/* Filters */}
                                          <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 mb-2 shrink-0">
                                                 <button
                                                        onClick={() => setFilter('all')}
                                                        className={cn(
                                                               "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors",
                                                               filter === 'all'
                                                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                                      : "bg-slate-100 dark:bg-[#161F2C] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                                                        )}
                                                 >
                                                        Todo
                                                 </button>
                                                 <button
                                                        onClick={() => setFilter('booking')}
                                                        className={cn(
                                                               "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors border",
                                                               filter === 'booking'
                                                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                                                                      : "bg-slate-100 dark:bg-[#161F2C] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5"
                                                        )}
                                                 >
                                                        <CalendarDays className={cn("w-4 h-4", filter === 'booking' ? "text-current" : "text-[#3B82F6]")} />
                                                        Reservas
                                                 </button>
                                                 <button
                                                        onClick={() => setFilter('payment')}
                                                        className={cn(
                                                               "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors border",
                                                               filter === 'payment'
                                                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                                                                      : "bg-slate-100 dark:bg-[#161F2C] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5"
                                                        )}
                                                 >
                                                        <DollarSign className={cn("w-4 h-4", filter === 'payment' ? "text-current" : "text-[#22c55e]")} />
                                                        Pagos
                                                 </button>
                                                 <button
                                                        onClick={() => setFilter('stock')}
                                                        className={cn(
                                                               "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors border",
                                                               filter === 'stock'
                                                                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                                                                      : "bg-slate-100 dark:bg-[#161F2C] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5"
                                                        )}
                                                 >
                                                        <Archive className={cn("w-4 h-4", filter === 'stock' ? "text-current" : "text-[#F97316]")} />
                                                        Stock
                                                 </button>
                                          </div>

                                          {/* Content List */}
                                          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                                                 {loading && (
                                                        <div className="flex items-center justify-center h-20">
                                                               <span className="text-slate-500 text-sm">Cargando notificaciones...</span>
                                                        </div>
                                                 )}

                                                 {!loading && notifications.length === 0 && (
                                                        <div className="flex flex-col items-center justify-center h-32 text-center opacity-50">
                                                               <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-full mb-2">
                                                                      <Settings className="w-6 h-6 text-slate-400" />
                                                               </div>
                                                               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No hay notificaciones</p>
                                                        </div>
                                                 )}

                                                 {/* Today Section */}
                                                 {!loading && today.length > 0 && (
                                                        <>
                                                               <div className="mt-4 mb-2 px-2">
                                                                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hoy</h3>
                                                               </div>
                                                               {today.map(notification => (
                                                                      <div key={notification.id} className="group relative bg-white dark:bg-[#161F2C]/60 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-white/5 transition-all hover:bg-slate-50 dark:hover:bg-[#161F2C]">
                                                                             <div className="flex gap-4">
                                                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getIconBg(notification.type))}>
                                                                                           {getIcon(notification.type)}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                           <div className="flex justify-between items-start mb-1">
                                                                                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{notification.title}</h4>
                                                                                                  <span className="text-[10px] text-slate-400 font-medium">{notification.time}</span>
                                                                                           </div>
                                                                                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                                                                                                  {notification.description}
                                                                                           </p>
                                                                                           {notification.type === 'booking' && (
                                                                                                  <div className="flex gap-2">
                                                                                                         <button className="px-3 py-1.5 bg-[#CCFF00] text-black text-[11px] font-bold rounded-lg hover:brightness-110 transition-all">
                                                                                                                VER DETALLE
                                                                                                         </button>
                                                                                                         <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                                                                                                                ARCHIVAR
                                                                                                         </button>
                                                                                                  </div>
                                                                                           )}
                                                                                    </div>
                                                                                    {!notification.isRead && (
                                                                                           <div className="w-2 h-2 rounded-full bg-[#CCFF00] mt-1.5 shrink-0"></div>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </>
                                                 )}

                                                 {/* Previous Section */}
                                                 {!loading && previous.length > 0 && (
                                                        <>
                                                               <div className="mt-6 mb-2 px-2">
                                                                      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Anteriores</h3>
                                                               </div>
                                                               {previous.map(notification => (
                                                                      <div key={notification.id} className="group relative bg-white/50 dark:bg-[#161F2C]/30 rounded-2xl p-4 mb-3 border border-slate-100 dark:border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                                                                             <div className="flex gap-4">
                                                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getIconBg(notification.type))}>
                                                                                           {getIcon(notification.type)}
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                           <div className="flex justify-between items-start mb-1">
                                                                                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{notification.title}</h4>
                                                                                                  <span className="text-[10px] text-slate-400 font-medium">{notification.time}</span>
                                                                                           </div>
                                                                                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                                                                  {notification.description}
                                                                                           </p>
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </>
                                                 )}
                                          </div>

                                          {/* Footer */}
                                          <div className="p-6 border-t border-slate-100 dark:border-white/10 shrink-0 flex flex-col gap-3">
                                                 <button
                                                        onClick={onClose}
                                                        className="w-full py-4 bg-[#CCFF00] text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#CCFF00]/20"
                                                 >
                                                        <ArrowLeft className="w-5 h-5" />
                                                        Volver al Dashboard
                                                 </button>
                                                 <button className="w-full py-3 bg-transparent border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm">
                                                        Configuración de alertas
                                                        <Settings className="w-4 h-4" />
                                                 </button>
                                          </div>
                                   </motion.div>
                            </>
                     )}
              </AnimatePresence>
       )
}
