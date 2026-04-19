'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import HelpSheet from '@/components/onboarding/HelpSheet'

export function MobileBottomNav({ club }: { club?: any }) {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const { activeEmployee, logoutEmployee } = useEmployee()
  const { data: session } = useSession()

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

  const menuSections = [
    {
      label: 'Gestión',
      items: [
        { href: '/clientes',  icon: Users,       label: 'Clientes',     active: pathname.startsWith('/clientes') },
        { href: '/torneos',   icon: Trophy,      label: 'Torneos',      active: pathname.startsWith('/torneos'),  locked: !club?.hasTournaments },
        { href: '?modal=kiosco', icon: ShoppingCart, label: 'Kiosco',   active: searchParams.get('modal') === 'kiosco', locked: !club?.hasKiosco },
        { href: '/reportes',  icon: FileBarChart, label: 'Reportes',    active: pathname.startsWith('/reportes'), locked: !club?.hasAdvancedReports },
      ],
    },
    {
      label: 'Cuenta',
      items: [
        { href: '/dashboard/suscripcion', icon: CreditCard,  label: 'Suscripción', active: pathname.startsWith('/dashboard/suscripcion') },
        { href: '/auditoria',             icon: ShieldCheck, label: 'Seguridad',   active: pathname.startsWith('/auditoria') },
        { href: '/configuracion',         icon: Settings,    label: 'Configuración', active: pathname.startsWith('/configuracion') },
        { href: '#help',                  icon: HelpCircle,  label: 'Ayuda',        active: isHelpOpen, isHelp: true },
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
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
                </div>

                {/* User row */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden relative">
                    {session?.user?.image
                      ? <Image src={session.user.image} alt="User" fill sizes="40px" className="object-cover rounded-xl" />
                      : displayedName.substring(0, 2).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{displayedName}</p>
                    <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
                  </div>
                  <button
                    onClick={() => { activeEmployee ? logoutEmployee() : signOut() }}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={16} />
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="h-px bg-border mx-5" />

                {/* Nav sections */}
                <div className="px-3 py-3 space-y-4">
                  {menuSections.map(section => (
                    <div key={section.label}>
                      <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        {section.label}
                      </p>
                      <div className="space-y-0.5">
                        {section.items.map(item => (
                          <button
                            key={item.label}
                            onClick={() => {
                              if (item.locked) return
                              setIsMenuOpen(false)
                              if ((item as any).isHelp) setIsHelpOpen(true)
                              else router.push(item.href)
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-colors',
                              item.active
                                ? 'bg-primary/10 text-primary'
                                : item.locked
                                  ? 'text-muted-foreground/30 cursor-not-allowed'
                                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                          >
                            <div className="relative shrink-0">
                              <item.icon size={18} strokeWidth={item.active ? 2.5 : 2} />
                              {item.locked && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-card rounded-full flex items-center justify-center border border-border">
                                  <Lock size={6} className="text-amber-500" />
                                </span>
                              )}
                            </div>
                            <span className={cn('text-sm', item.active ? 'font-semibold' : 'font-medium')}>
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-4" />
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

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[80] md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación principal"
      >
        <div className="bg-card border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="flex justify-around items-center h-[60px] px-2 max-w-lg mx-auto">
            {primaryItems.map(item => {
              if (item.isFab) {
                return (
                  <button
                    key="fab"
                    onClick={() => router.push('/dashboard?action=new_booking')}
                    className="flex items-center justify-center w-12 h-12 -mt-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                    aria-label="Nueva reserva"
                  >
                    <Plus size={22} strokeWidth={2.5} />
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
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors cursor-pointer',
                    isActive ? 'text-primary' : 'text-muted-foreground/60'
                  )}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn('text-[10px] font-semibold', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
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
