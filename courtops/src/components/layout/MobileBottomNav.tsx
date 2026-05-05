'use client'

import React, { useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Banknote,
  Plus,
  Settings,
  X,
  Trophy,
  ShoppingCart,
  FileBarChart,
  ShieldCheck,
  CreditCard,
  LogOut,
  Users,
  Lock,
  HelpCircle,
  Crown,
  Bell,
  Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import HelpSheet from '@/components/onboarding/HelpSheet'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useNotifications } from '@/hooks/useNotifications'

type MobileBottomNavClub = {
  hasTournaments?: boolean
  hasKiosco?: boolean
  hasAdvancedReports?: boolean
}

export function MobileBottomNav({ club }: { club?: MobileBottomNavClub }) {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { activeEmployee, logoutEmployee } = useEmployee()
  const { data: session } = useSession()
  const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()

  const isBookingsView = searchParams.get('view') === 'bookings'
  const displayedName  = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
  const roleLabel      = activeEmployee ? 'Operador' : 'Administrador'

  const primaryItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Inicio',
      active: (pathname === '/' || pathname === '/dashboard') && !isBookingsView,
    },
    {
      href: '/dashboard?view=bookings',
      icon: CalendarDays,
      label: 'Turnos',
      active: isBookingsView || pathname.startsWith('/reservas'),
    },
    { href: '#fab', icon: Plus, label: 'Nuevo', isFab: true, active: false },
    {
      href: '/caja',
      icon: Banknote,
      label: 'Caja',
      active: pathname.startsWith('/caja'),
    },
    {
      href: '#more',
      icon: Users,
      label: 'Más',
      active: isMenuOpen,
      isMenu: true,
    },
  ]

  // Inline styles so Tailwind purge doesn't strip dynamic color strings
  const IC: Record<string, { bg: string; fg: string }> = {
    blue:    { bg: 'rgba(59,130,246,.15)',   fg: '#60a5fa' },
    amber:   { bg: 'rgba(245,158,11,.15)',   fg: '#fbbf24' },
    emerald: { bg: 'rgba(16,185,129,.15)',   fg: '#34d399' },
    purple:  { bg: 'rgba(168,85,247,.15)',   fg: '#c084fc' },
    orange:  { bg: 'rgba(249,115,22,.15)',   fg: '#fb923c' },
    cyan:    { bg: 'rgba(6,182,212,.15)',    fg: '#22d3ee' },
    red:     { bg: 'rgba(239,68,68,.15)',    fg: '#f87171' },
    slate:   { bg: 'rgba(100,116,139,.15)',  fg: '#94a3b8' },
    violet:  { bg: 'rgba(139,92,246,.15)',   fg: '#a78bfa' },
    primary: { bg: 'hsl(var(--primary)/.15)', fg: 'hsl(var(--primary))' },
  }

  interface MenuItem {
    href: string
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
    label: string
    active: boolean
    locked?: boolean
    isHelp?: boolean
    isNotifications?: boolean
    badge?: number
    color: string
  }

  const menuSections: { label: string; items: MenuItem[] }[] = [
    {
      label: 'Gestión',
      items: [
        { href: '/clientes',             icon: Users,        label: 'Clientes',   active: pathname.startsWith('/clientes'),                                     color: 'blue' },
        { href: '/dashboard/membresias', icon: Crown,        label: 'Membresías', active: pathname.startsWith('/dashboard/membresias'),                         color: 'amber' },
        { href: '/actividad',            icon: Activity,     label: 'Actividad',  active: pathname.startsWith('/actividad'),                                    color: 'emerald' },
        { href: '/torneos',              icon: Trophy,       label: 'Torneos',    active: pathname.startsWith('/torneos'),  locked: !club?.hasTournaments,       color: 'purple' },
        { href: '?modal=kiosco',         icon: ShoppingCart, label: 'Kiosco',     active: searchParams.get('modal') === 'kiosco', locked: !club?.hasKiosco,     color: 'orange' },
        { href: '/reportes',             icon: FileBarChart, label: 'Reportes',   active: pathname.startsWith('/reportes'), locked: !club?.hasAdvancedReports,  color: 'cyan' },
      ],
    },
    {
      label: 'Cuenta',
      items: [
        { href: '#notifications',         icon: Bell,        label: 'Notificaciones', active: isNotificationsOpen, isNotifications: true, badge: unreadCount || undefined, color: unreadCount > 0 ? 'red' : 'slate' },
        { href: '/dashboard/suscripcion', icon: CreditCard,  label: 'Suscripción',   active: pathname.startsWith('/dashboard/suscripcion'),                     color: 'primary' },
        { href: '/auditoria',             icon: ShieldCheck, label: 'Seguridad',     active: pathname.startsWith('/auditoria'),                                 color: 'blue' },
        { href: '/configuracion',         icon: Settings,    label: 'Configuración', active: pathname.startsWith('/configuracion') && !searchParams.get('tab'), color: 'slate' },
        { href: '#help',                  icon: HelpCircle,  label: 'Ayuda',         active: isHelpOpen, isHelp: true,                                          color: 'violet' },
      ],
    },
  ]

  return (
    <>
      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[90]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto"
            >
              <div className="bg-card border-t border-x border-border rounded-t-3xl shadow-2xl overflow-hidden pb-[env(safe-area-inset-bottom)]">
                {/* Handle */}
                <div className="flex justify-center pt-2.5 pb-0">
                  <div className="w-9 h-[3px] bg-muted-foreground/25 rounded-full" />
                </div>

                {/* User row */}
                <div className="flex items-center gap-3 px-4 pt-3 pb-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0 overflow-hidden relative">
                    {session?.user?.image
                      ? <Image src={session.user.image} alt="User" fill sizes="44px" className="object-cover" />
                      : displayedName.substring(0, 2).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{displayedName}</p>
                    <p className="text-[11px] font-medium text-muted-foreground">{roleLabel}</p>
                  </div>
                  <button
                    onClick={() => { if (activeEmployee) logoutEmployee(); else signOut() }}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={15} />
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Nav sections */}
                <div className="px-3 pb-2 space-y-3">
                  {menuSections.map(section => (
                    <div key={section.label}>
                      <p className="px-1 mb-1.5 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.18em]">
                        {section.label}
                      </p>
                      <div className="bg-muted/40 rounded-2xl overflow-hidden divide-y divide-border/40">
                        {section.items.map((item, idx) => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.locked) return
                              setIsMenuOpen(false)
                              if (item.isHelp) setIsHelpOpen(true)
                              else if (item.isNotifications) setIsNotificationsOpen(true)
                              else router.push(item.href)
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 h-12 px-3 transition-colors active:scale-[0.98]',
                              item.active
                                ? 'bg-primary/10'
                                : item.locked
                                  ? 'opacity-35 cursor-not-allowed'
                                  : 'hover:bg-muted/60'
                            )}
                          >
                            {/* Colored icon */}
                            <div
                              className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 relative"
                              style={{ background: item.locked ? undefined : IC[item.color]?.bg }}
                            >
                              <span style={{ color: item.locked ? undefined : item.active ? 'hsl(var(--primary))' : IC[item.color]?.fg }}
                                className={item.locked ? 'text-muted-foreground/30' : ''}>
                                <item.icon size={16} strokeWidth={2} />
                              </span>
                              {item.locked && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-card rounded-full flex items-center justify-center border border-border/60">
                                  <Lock size={7} className="text-amber-500" />
                                </span>
                              )}
                            </div>

                            <span className={cn(
                              'text-[13.5px] flex-1 text-left',
                              item.active ? 'font-semibold text-primary' : item.locked ? 'text-muted-foreground/40 font-medium' : 'font-medium text-foreground'
                            )}>
                              {item.label}
                            </span>

                            {item.badge && item.badge > 0 ? (
                              <span className="text-[10px] font-black bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            ) : item.active ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-3" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HelpSheet
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onRestartTutorial={() => setIsHelpOpen(false)}
      />

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        isLoading={notificationsLoading}
      />

      {/* Bottom bar */}
      <nav
        className="fixed bottom-3 left-0 right-0 z-[80] md:hidden px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pointer-events-none"
        aria-label="Navegación principal"
      >
        <div className="pointer-events-auto relative max-w-lg mx-auto overflow-visible">
          <div className="flex h-[58px] items-center justify-around rounded-[1.65rem] border border-border/70 bg-card/95 px-1.5 text-muted-foreground shadow-[0_10px_28px_rgba(15,23,42,0.14)] backdrop-blur-xl">
            {primaryItems.map(item => {
              if (item.isFab) {
                return (
                  <button
                    key="fab"
                    onClick={() => router.push('/dashboard?action=new_booking')}
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.24)] active:scale-95 transition-transform"
                    aria-label="Nueva reserva"
                  >
                    <Plus size={21} strokeWidth={2.5} />
                  </button>
                )
              }

              const isActive = item.isMenu ? isMenuOpen : item.active

              return (
                <button
                  key={item.label}
                  aria-label={item.label}
                  onClick={() => {
                    if (item.isMenu) setIsMenuOpen(!isMenuOpen)
                    else if (item.href) router.push(item.href)
                  }}
                  className="relative flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-1 rounded-xl bg-primary/10"
                      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                    />
                  )}
                  <div className="relative">
                    <item.icon
                      size={19}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={cn(
                        'transition-colors duration-150',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    {item.isMenu && unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-card" />
                    )}
                  </div>
                  <span className={cn(
                    'relative text-[9px] font-semibold transition-colors duration-150',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
