'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Users,
  ShoppingCart,
  FileBarChart,
  CreditCard,
  Banknote,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import { UpgradeModal } from './UpgradeModal'
import { createPortal } from 'react-dom'

const NAV_SECTIONS = [
  {
    label: 'Gestión',
    items: [
      { href: '/dashboard',  icon: LayoutDashboard, label: 'Inicio'    },
      { href: '/reservas',   icon: CalendarDays,    label: 'Reservas'  },
      { href: '/torneos',    icon: Trophy,           label: 'Torneos',  featureKey: 'hasTournaments' },
      { href: '/clientes',   icon: Users,            label: 'Clientes'  },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { href: '?modal=kiosco', icon: ShoppingCart,  label: 'Kiosco',   featureKey: 'hasKiosco',          isModal: true },
      { href: '/caja',          icon: Banknote,      label: 'Caja'      },
      { href: '/reportes',      icon: FileBarChart,  label: 'Reportes', featureKey: 'hasAdvancedReports'  },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/suscripcion', icon: CreditCard,  label: 'Suscripción'  },
      { href: '/auditoria',             icon: ShieldCheck, label: 'Seguridad'    },
      { href: '/configuracion',         icon: Settings,    label: 'Configuración'},
    ],
  },
]

export function Sidebar({ club }: { club?: any }) {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { activeEmployee, logoutEmployee } = useEmployee()
  const { data: session } = useSession()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [lockedFeatureName, setLockedFeatureName] = useState('')

  const isBookingsView = searchParams.get('view') === 'bookings'
  const displayedName  = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
  const roleLabel      = activeEmployee ? 'Operador' : 'Administrador'

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 1280)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (href: string, featureKey?: string) => {
    if (href === '/dashboard') return (pathname === '/' || pathname === '/dashboard') && !isBookingsView
    if (href === '?modal=kiosco') return searchParams.get('modal') === 'kiosco'
    if (href === '/reservas') return pathname.startsWith('/reservas') || isBookingsView
    return pathname.startsWith(href)
  }

  const isLocked = (featureKey?: string) => {
    if (!featureKey) return false
    return !club?.[featureKey]
  }

  return (
    <>
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 bg-card border-r border-border transition-all duration-300 ease-in-out relative z-30',
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-3 top-8 z-50 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-sm"
        >
          {isCollapsed
            ? <ChevronRight size={12} strokeWidth={2.5} />
            : <ChevronLeft  size={12} strokeWidth={2.5} />
          }
        </button>

        {/* ── Logo ── */}
        <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-border shrink-0', isCollapsed && 'justify-center px-0')}>
          <div className={cn(
            'flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shrink-0 overflow-hidden shadow-sm',
            isCollapsed ? 'w-9 h-9' : 'w-8 h-8'
          )}>
            {club?.logoUrl ? (
              <img src={club.logoUrl} alt="logo" className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                  ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <span className={cn('italic', club?.logoUrl && 'hidden')}>
              {club?.name?.charAt(0) || 'C'}
            </span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-sm text-foreground tracking-tight truncate">
              {club?.name || 'CourtOps'}
            </span>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 no-scrollbar">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest select-none">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active  = isActive(item.href)
                  const locked  = isLocked(item.featureKey)
                  return (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={active}
                      locked={locked}
                      isCollapsed={isCollapsed}
                      onLockedClick={() => {
                        setLockedFeatureName(item.label)
                        setShowUpgradeModal(true)
                      }}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User profile ── */}
        <div className="shrink-0 border-t border-border p-3">
          <div className={cn(
            'flex items-center gap-2.5 rounded-xl p-2 hover:bg-accent transition-colors cursor-default',
            isCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden relative">
              {session?.user?.image
                ? <Image src={session.user.image} alt="User" fill sizes="32px" className="object-cover rounded-lg" />
                : displayedName.substring(0, 2).toUpperCase()
              }
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{displayedName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{roleLabel}</p>
                </div>
                <button
                  onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={lockedFeatureName}
      />
    </>
  )
}

/* ─── NavItem ─────────────────────────────────────────────────── */

interface NavItemProps {
  href: string
  icon: any
  label: string
  active?: boolean
  locked?: boolean
  isCollapsed: boolean
  onLockedClick: () => void
}

function NavItem({ href, icon: Icon, label, active, locked, isCollapsed, onLockedClick }: NavItemProps) {
  const [showTip, setShowTip] = useState(false)
  const [pos, setPos]         = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (isCollapsed && ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.top + r.height / 2, left: r.right + 10 })
    }
    setShowTip(true)
  }

  const inner = (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTip(false)}
      onClick={locked ? (e) => { e.preventDefault(); onLockedClick() } : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg transition-colors duration-150 cursor-pointer select-none',
        isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'h-9 px-3',
        active
          ? 'bg-primary/10 text-primary'
          : locked
            ? 'text-muted-foreground/40 cursor-not-allowed'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {/* Active indicator */}
      {active && !isCollapsed && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
      )}
      <div className="relative shrink-0 flex items-center justify-center">
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
        {locked && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center border border-border">
            <Lock size={6} className="text-amber-500" />
          </span>
        )}
      </div>
      {!isCollapsed && (
        <span className={cn('text-sm truncate', active ? 'font-semibold' : 'font-medium')}>
          {label}
        </span>
      )}
    </div>
  )

  const tooltip = showTip && isCollapsed && typeof window !== 'undefined' && createPortal(
    <div
      style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
      className="fixed z-[9999] bg-foreground text-background px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap"
    >
      {label}
    </div>,
    document.body
  )

  if (locked) return (
    <div className="relative px-1">{inner}{tooltip}</div>
  )

  return (
    <div className="relative px-1">
      <Link href={href}>{inner}</Link>
      {tooltip}
    </div>
  )
}
