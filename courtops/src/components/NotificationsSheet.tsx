'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Mail, CalendarDays, DollarSign, Archive, Bell, CheckCheck, RefreshCw, CheckCircle2, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationItem } from '@/actions/notifications'
import { isToday } from 'date-fns'

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
  isLoading,
}: NotificationsSheetProps) {
  const [filter, setFilter] = useState<'all' | 'booking' | 'payment' | 'stock'>('all')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('notifications-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('notifications-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('notifications-open')
    }
  }, [isOpen])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'booking') return n.type === 'booking'
    if (filter === 'payment') return n.type === 'payment'
    if (filter === 'stock') return n.type === 'stock'
    return true
  })

  const todayList     = filteredNotifications.filter(n => isToday(new Date(n.date)))
  const previousList  = filteredNotifications.filter(n => !isToday(new Date(n.date)))
  const unreadCount   = notifications.filter(n => !n.isRead).length

  // Inline colour map — avoids Tailwind purge issues
  const TYPE_STYLE: Record<string, { bg: string; fg: string; accent: string }> = {
    booking: { bg: 'rgba(59,130,246,.12)',   fg: '#60a5fa', accent: '#3b82f6' },
    payment: { bg: 'rgba(16,185,129,.12)',   fg: '#34d399', accent: '#10b981' },
    stock:   { bg: 'rgba(249,115,22,.12)',   fg: '#fb923c', accent: '#f97316' },
    message: { bg: 'rgba(100,116,139,.12)',  fg: '#94a3b8', accent: '#64748b' },
    default: { bg: 'rgba(var(--primary-rgb,16,185,129),.12)', fg: 'hsl(var(--primary))', accent: 'hsl(var(--primary))' },
  }

  const getStyle = (type: string) => TYPE_STYLE[type] ?? TYPE_STYLE.default

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarDays size={16} />
      case 'payment': return <DollarSign size={16} />
      case 'stock':   return <Package size={16} />
      case 'message': return <Mail size={16} />
      default:        return <AlertTriangle size={16} />
    }
  }

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: 'all',     label: 'Todo' },
    { key: 'booking', label: 'Turnos' },
    { key: 'payment', label: 'Pagos' },
    { key: 'stock',   label: 'Stock' },
  ]

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-background shadow-2xl z-[1000] flex flex-col overflow-hidden"
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="px-5 pb-4 pt-[max(env(safe-area-inset-top),1.25rem)] border-b border-border/50 bg-card shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bell size={15} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground tracking-tight leading-none">Notificaciones</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0',
                      filter === f.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Content ────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24">
                  <RefreshCw className="text-primary animate-spin w-6 h-6" />
                  <p className="text-xs font-semibold text-muted-foreground">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Sin novedades</p>
                    <p className="text-xs text-muted-foreground mt-1">Has gestionado todas las alertas.</p>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-4 space-y-5">

                  {/* Recientes (hoy) */}
                  {todayList.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-1">Recientes</p>
                      {todayList.map(n => {
                        const s = getStyle(n.type)
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              'relative flex gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.99]',
                              n.isRead
                                ? 'bg-card border-border/40'
                                : 'bg-card border-border/60'
                            )}
                          >
                            {/* Unread accent bar */}
                            {!n.isRead && (
                              <div
                                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                                style={{ background: s.accent }}
                              />
                            )}

                            {/* Icon */}
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: s.bg, color: s.fg }}
                            >
                              {getIcon(n.type)}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn('text-[13px] font-bold leading-tight', n.isRead ? 'text-foreground/80' : 'text-foreground')}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                                {n.description}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}

                  {/* Anteriores */}
                  {previousList.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Anteriores</p>
                      {previousList.map(n => {
                        const s = getStyle(n.type)
                        return (
                          <div
                            key={n.id}
                            className="flex gap-3 px-1 py-2.5 rounded-xl"
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-60"
                              style={{ background: s.bg, color: s.fg }}
                            >
                              {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[12px] font-semibold text-foreground/60 truncate">{n.title}</p>
                                <span className="text-[10px] text-muted-foreground/50 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground/50 mt-0.5 line-clamp-1">{n.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* ── Footer ─────────────────────────────────── */}
            <div
              className="px-4 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)] border-t border-border/50 bg-card/80 flex flex-col gap-2 shrink-0"
            >
              <button
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-[12px] bg-primary text-white active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <CheckCheck size={15} />
                Marcar todo como leído
              </button>
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center py-3 rounded-2xl font-bold text-[12px] text-muted-foreground bg-muted/50 active:scale-[0.98] transition-all"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
