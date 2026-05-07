'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  DollarSign,
  Mail,
  Package,
  RefreshCw,
  X,
} from 'lucide-react'
import { isToday } from 'date-fns'

import { NotificationItem } from '@/actions/notifications'
import { cn } from '@/lib/utils'

interface NotificationsSheetProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAllAsRead: () => void
  isLoading: boolean
}

const TYPE_STYLE: Record<string, { bg: string; fg: string; accent: string }> = {
  booking: { bg: 'rgba(59,130,246,.12)', fg: '#60a5fa', accent: '#3b82f6' },
  payment: { bg: 'rgba(16,185,129,.12)', fg: '#34d399', accent: '#10b981' },
  stock: { bg: 'rgba(249,115,22,.12)', fg: '#fb923c', accent: '#f97316' },
  message: { bg: 'rgba(100,116,139,.12)', fg: '#94a3b8', accent: '#64748b' },
  default: {
    bg: 'rgba(var(--primary-rgb,16,185,129),.12)',
    fg: 'hsl(var(--primary))',
    accent: 'hsl(var(--primary))',
  },
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

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'booking') return notification.type === 'booking'
    if (filter === 'payment') return notification.type === 'payment'
    if (filter === 'stock') return notification.type === 'stock'
    return true
  })

  const todayList = filteredNotifications.filter(notification => isToday(new Date(notification.date)))
  const previousList = filteredNotifications.filter(notification => !isToday(new Date(notification.date)))
  const unreadCount = notifications.filter(notification => !notification.isRead).length
  const hasVisibleNotifications = filteredNotifications.length > 0

  const getStyle = (type: string) => TYPE_STYLE[type] ?? TYPE_STYLE.default

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CalendarDays size={16} />
      case 'payment':
        return <DollarSign size={16} />
      case 'stock':
        return <Package size={16} />
      case 'message':
        return <Mail size={16} />
      default:
        return <AlertTriangle size={16} />
    }
  }

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'booking', label: 'Turnos' },
    { key: 'payment', label: 'Pagos' },
    { key: 'stock', label: 'Stock' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 350 }}
            className="fixed inset-y-0 right-0 z-[1000] flex w-full flex-col overflow-hidden bg-background shadow-2xl sm:max-w-md"
          >
            <div className="shrink-0 border-b border-border/40 bg-background/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Bell size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-black leading-none tracking-tight text-foreground">
                        Notificaciones
                      </h2>
                      {unreadCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-bold text-primary">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {unreadCount > 0 ? 'Alertas pendientes' : 'Todo al dia'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-transform active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {filters.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={cn(
                      'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all',
                      filter === item.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted/70 text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-24">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-muted-foreground">Cargando...</p>
                </div>
              ) : !hasVisibleNotifications ? (
                <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/70">
                    <CheckCircle2 size={28} className="text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {notifications.length === 0 ? 'Sin novedades' : 'Nada para este filtro'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notifications.length === 0
                        ? 'Has gestionado todas las alertas.'
                        : 'Proba con otra categoria para ver mas actividad.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 px-3 py-3.5">
                  {todayList.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                          Recientes
                        </p>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {todayList.length}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/55">
                        {todayList.map((notification, index) => {
                          const style = getStyle(notification.type)

                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                'flex gap-3 px-3 py-3 transition-colors',
                                index > 0 && 'border-t border-border/40',
                                notification.isRead ? 'bg-transparent' : 'bg-primary/[0.035]'
                              )}
                            >
                              <div
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: style.bg, color: style.fg }}
                              >
                                {getIcon(notification.type)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      {!notification.isRead && (
                                        <span
                                          className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                                          style={{ background: style.accent }}
                                        />
                                      )}
                                      <p
                                        className={cn(
                                          'truncate text-[13px] leading-tight',
                                          notification.isRead
                                            ? 'font-semibold text-foreground/80'
                                            : 'font-bold text-foreground'
                                        )}
                                      >
                                        {notification.title}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="mt-0.5 shrink-0 text-[10px] text-muted-foreground">
                                    {notification.time}
                                  </span>
                                </div>

                                <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
                                  {notification.description}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {previousList.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/65">
                          Anteriores
                        </p>
                        <div className="h-px flex-1 bg-border/50" />
                        <span className="text-[10px] text-muted-foreground/70">
                          {previousList.length}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {previousList.map(notification => {
                          const style = getStyle(notification.type)

                          return (
                            <div key={notification.id} className="flex gap-3 rounded-xl px-2 py-2.5">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-60"
                                style={{ background: style.bg, color: style.fg }}
                              >
                                {getIcon(notification.type)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-[12px] font-medium text-foreground/65">
                                    {notification.title}
                                  </p>
                                  <span className="shrink-0 text-[10px] text-muted-foreground/55">
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/60">
                                  {notification.description}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/40 bg-background/95 px-4 py-2.5 pb-[max(env(safe-area-inset-bottom),0.85rem)] backdrop-blur">
              <button
                onClick={onClose}
                className="text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Cerrar
              </button>
              <button
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-[12px] font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={14} />
                Marcar leidas
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
