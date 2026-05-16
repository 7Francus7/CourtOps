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
  Moon,
  Sun,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import { UpgradeModal } from './UpgradeModal'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'

const NAV_SECTIONS = [
  {
    label: 'Gestión',
    items: [
      { href: '/dashboard',              icon: LayoutDashboard, label: 'Inicio',     dataTour: 'nav-dashboard'  },
      { href: '/reservas',               icon: CalendarDays,    label: 'Reservas',   dataTour: 'nav-reservas'   },
      { href: '/torneos',                icon: Trophy,          label: 'Torneos',    featureKey: 'hasTournaments' },
      { href: '/clientes',               icon: Users,           label: 'Clientes',   dataTour: 'nav-clientes'   },
      { href: '/dashboard/membresias',   icon: Crown,           label: 'Membresías'  },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { href: '?modal=kiosco', icon: ShoppingCart,  label: 'Kiosco',        featureKey: 'hasKiosco', isModal: true, dataTour: 'nav-kiosco'        },
      { href: '/caja',          icon: Banknote,      label: 'Caja',         dataTour: 'nav-caja'         },
      { href: '/reportes',      icon: FileBarChart,  label: 'Reportes',     featureKey: 'hasAdvancedReports', dataTour: 'nav-reportes'  },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/suscripcion', icon: CreditCard,  label: 'Suscripción'  },
      { href: '/auditoria',             icon: ShieldCheck, label: 'Seguridad'    },
      { href: '/configuracion',         icon: Settings,    label: 'Configuración', dataTour: 'nav-configuracion' },
    ],
  },
]

type SidebarIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

export function Sidebar({ club }: { club?: any }) {
  const pathname      = usePathname()
  const searchParams  = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { activeEmployee, logoutEmployee } = useEmployee()
  const { data: session } = useSession()
  const { theme, resolvedTheme, setTheme } = useTheme()
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isActive = (href: string) => {
    if (href === '/dashboard') return (pathname === '/' || pathname === '/dashboard') && !isBookingsView
    if (href === '?modal=kiosco') return searchParams.get('modal') === 'kiosco'
    if (href === '/reservas') return pathname.startsWith('/reservas') || isBookingsView
    return pathname.startsWith(href)
  }

  const isLocked = (featureKey?: string) => {
    if (!featureKey) return false
    return !club?.[featureKey]
  }

  const activeTheme = isMounted ? (resolvedTheme ?? theme ?? 'dark') : 'dark'
  const themeLabel = activeTheme === 'dark' ? 'Modo claro' : 'Modo oscuro'
  const ThemeIcon = activeTheme === 'dark' ? Moon : Sun

  return (
    <>
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 bg-card/95 backdrop-blur-xl border-r border-border/60 transition-[width] duration-200 ease-out relative z-30',
          isCollapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="absolute -right-[13px] top-[72px] z-50 w-[26px] h-[26px] bg-card border border-border/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/60 hover:bg-background transition-all duration-150 shadow-md"
        >
          {isCollapsed
            ? <ChevronRight size={11} strokeWidth={2.5} />
            : <ChevronLeft  size={11} strokeWidth={2.5} />
          }
        </button>

        {/* ── Logo ── */}
        <div className={cn(
          'flex items-center gap-3 px-4 h-16 border-b border-border/50 shrink-0',
          isCollapsed && 'justify-center px-0'
        )}>
          <div className={cn(
            'flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm shrink-0 overflow-hidden shadow-sm ring-1 ring-primary/20',
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
            <span className="font-bold text-[13px] text-foreground tracking-tight truncate">
              {club?.name || 'CourtOps'}
            </span>
          )}
        </div>

        {/* ── Nav ── */}
        <nav data-tour="sidebar-nav" className="flex-1 overflow-y-auto py-3 px-2 space-y-5 no-scrollbar">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              {!isCollapsed ? (
                <p className="px-3 mb-1 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.14em] select-none">
                  {section.label}
                </p>
              ) : (
                <div className="w-5 mx-auto mb-1 h-px bg-border/40" />
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
                      dataTour={(item as { dataTour?: string }).dataTour}
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
        <div className="shrink-0 border-t border-border/50 p-2.5 space-y-1">
          <SidebarActionButton
            icon={ThemeIcon}
            label={themeLabel}
            isCollapsed={isCollapsed}
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
          />

          <div className={cn(
            'flex items-center gap-2.5 rounded-xl p-2 hover:bg-muted/60 transition-colors duration-150 cursor-default group',
            isCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden relative ring-1 ring-primary/10">
              {session?.user?.image
                ? <Image src={session.user.image} alt="User" fill sizes="32px" className="object-cover rounded-lg" />
                : displayedName.substring(0, 2).toUpperCase()
              }
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate leading-tight">{displayedName}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{roleLabel}</p>
                </div>
                <button
                  onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
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
  icon: SidebarIcon
  label: string
  active?: boolean
  locked?: boolean
  isCollapsed: boolean
  dataTour?: string
  onLockedClick: () => void
}

function NavItem({ href, icon: Icon, label, active, locked, isCollapsed, dataTour, onLockedClick }: NavItemProps) {
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
      data-tour={dataTour}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTip(false)}
      onClick={locked ? (e) => { e.preventDefault(); onLockedClick() } : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer select-none',
        isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'h-9 px-3',
        active
          ? 'bg-primary/10 text-primary'
          : locked
            ? 'text-muted-foreground/30 cursor-not-allowed'
            : 'text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground',
      )}
    >
      {/* Active bar — expanded */}
      {active && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full -ml-1" />
      )}
      {/* Active dot — collapsed */}
      {active && isCollapsed && (
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full" />
      )}
      <div className="relative shrink-0 flex items-center justify-center">
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
        {locked && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-background rounded-full flex items-center justify-center border border-border/60">
            <Lock size={6} className="text-amber-500" />
          </span>
        )}
      </div>
      {!isCollapsed && (
        <span className={cn('text-[13px] truncate tracking-[-0.01em]', active ? 'font-semibold' : 'font-medium')}>
          {label}
        </span>
      )}
    </div>
  )

  const tooltip = showTip && isCollapsed && typeof window !== 'undefined' && createPortal(
    <div
      style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
      className="fixed z-[9999] bg-foreground text-background px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xl pointer-events-none whitespace-nowrap"
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

interface SidebarActionButtonProps {
  icon: SidebarIcon
  label: string
  isCollapsed: boolean
  onClick: () => void
}

function SidebarActionButton({ icon: Icon, label, isCollapsed, onClick }: SidebarActionButtonProps) {
  const [showTip, setShowTip] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLButtonElement>(null)

  const handleMouseEnter = () => {
    if (isCollapsed && ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.top + r.height / 2, left: r.right + 10 })
    }
    setShowTip(true)
  }

  const tooltip = showTip && isCollapsed && typeof window !== 'undefined' && createPortal(
    <div
      style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
      className="fixed z-[9999] bg-foreground text-background px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-lg pointer-events-none whitespace-nowrap"
    >
      {label}
    </div>,
    document.body
  )

  return (
    <div className="relative px-1">
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTip(false)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground',
          isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'h-9 px-3'
        )}
        aria-label={label}
        title={label}
      >
        <Icon size={16} strokeWidth={2} />
        {!isCollapsed && <span className="text-sm font-medium truncate">{label}</span>}
      </button>
      {tooltip}
    </div>
  )
}
