'use client'

import React, { useState, useEffect } from 'react'
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
       History,
       CreditCard,
       Banknote,
       Settings,
       ChevronLeft,
       ChevronRight,
       LogOut,
       User,
       Zap,
       ShieldCheck,
       Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import { UpgradeModal } from './UpgradeModal'

export function Sidebar({ club }: { club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const [isCollapsed, setIsCollapsed] = useState(false)
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { data: session } = useSession()

       // Upgrade Modal State
       const [showUpgradeModal, setShowUpgradeModal] = useState(false)
       const [lockedFeatureName, setLockedFeatureName] = useState('')

       const isBookingsView = searchParams.get('view') === 'bookings'

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
       const roleLabel = activeEmployee ? 'Operador' : 'Administrador'

       // Auto-collapse on tablet/small screens
       useEffect(() => {
              const handleResize = () => {
                     if (window.innerWidth < 1280) { // < xl breakpoint
                            setIsCollapsed(true)
                     } else {
                            setIsCollapsed(false)
                     }
              }

              // Initial check
              handleResize()

              window.addEventListener('resize', handleResize)
              return () => window.removeEventListener('resize', handleResize)
       }, [])

       const handleLockedClick = (featureName: string) => {
              setLockedFeatureName(featureName)
              setShowUpgradeModal(true)
       }

       return (
              <>
                     <aside
                            className={cn(
                                   "flex-shrink-0 bg-card/60 backdrop-blur-3xl border-r border-border/40 flex flex-col hidden md:flex transition-all duration-500 relative z-50",
                                   isCollapsed ? "w-[78px]" : "w-68"
                            )}
                     >
                            <button
                                   onClick={() => setIsCollapsed(!isCollapsed)}
                                   aria-label="Colapsar menú"
                                   aria-expanded={!isCollapsed}
                                   className="absolute -right-3.5 top-12 z-50 bg-background border border-border shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-full p-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all hover:scale-110 active:scale-90"
                            >
                                   {isCollapsed ? <ChevronRight size={14} strokeWidth={4} /> : <ChevronLeft size={14} strokeWidth={4} />}
                            </button>

                            {/* Logo Area */}
                            <div className={cn("px-6 py-8 flex items-center gap-3", isCollapsed && "justify-center px-2 py-6")}>
                                   <div className={cn(
                                          "bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25 overflow-hidden text-primary-foreground relative",
                                          isCollapsed ? "w-11 h-11" : "w-12 h-12"
                                   )}>
                                          {club?.logoUrl ? (
                                                 <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                               src={club.logoUrl}
                                                               alt="Club Logo"
                                                               className="w-full h-full object-cover"
                                                               onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                                                        />
                                                        <span className="text-xl font-black italic hidden">{club?.name?.charAt(0) || 'C'}</span>
                                                 </>
                                          ) : (
                                                 <span className="text-xl font-black italic">{club?.name?.charAt(0) || 'C'}</span>
                                          )}
                                   </div>
                                   {!isCollapsed && (
                                          <div className="flex flex-col min-w-0">
                                                 <h1 className={cn("font-black text-foreground tracking-[0.1em] leading-none truncate", (club?.name?.length || 0) > 12 ? "text-lg" : "text-xl")}>
                                                        {club?.name?.toUpperCase() || 'COURTOPS'}
                                                 </h1>
                                          </div>
                                   )}
                            </div>

                            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">

                                   {/* MANAGEMENT */}
                                   <div className="space-y-1.5">
                                          {!isCollapsed && (
                                                 <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Gestión</p>
                                          )}
                                          <SidebarLink
                                                 href="/"
                                                 icon={LayoutDashboard}
                                                 label="Inicio"
                                                 active={(pathname === '/' || pathname === '/dashboard') && !isBookingsView}
                                                 isCollapsed={isCollapsed}
                                                 variant="primary"
                                          />
                                          <SidebarLink
                                                 href="/reservas"
                                                 icon={CalendarDays}
                                                 label="Reservas"
                                                 active={pathname.startsWith('/reservas') || isBookingsView}
                                                 isCollapsed={isCollapsed}
                                          />
                                          <SidebarLink
                                                 href="/torneos"
                                                 icon={Trophy}
                                                 label="Torneos"
                                                 active={pathname.startsWith('/torneos')}
                                                 isCollapsed={isCollapsed}
                                                 isLocked={!club?.hasTournaments}
                                                 onLockedClick={() => handleLockedClick('Torneos')}
                                          />
                                          <SidebarLink
                                                 href="/clientes"
                                                 icon={Users}
                                                 label="Clientes"
                                                 active={pathname.startsWith('/clientes')}
                                                 isCollapsed={isCollapsed}
                                          />
                                   </div>

                                   {/* FINANCE */}
                                   <div className="space-y-1.5">
                                          {!isCollapsed && (
                                                 <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Finanzas</p>
                                          )}
                                          <SidebarLink
                                                 href="?modal=kiosco"
                                                 icon={ShoppingCart}
                                                 label="Kiosco"
                                                 active={searchParams.get('modal') === 'kiosco'}
                                                 isCollapsed={isCollapsed}
                                                 isLocked={!club?.hasKiosco}
                                                 onLockedClick={() => handleLockedClick('Punto de Venta')}
                                          />
                                          <SidebarLink
                                                 href="/caja"
                                                 icon={Banknote}
                                                 label="Caja"
                                                 active={pathname.startsWith('/caja')}
                                                 isCollapsed={isCollapsed}
                                          />
                                          <SidebarLink
                                                 href="/reportes"
                                                 icon={FileBarChart}
                                                 label="Reportes"
                                                 active={pathname.startsWith('/reportes')}
                                                 isCollapsed={isCollapsed}
                                                 isLocked={!club?.hasAdvancedReports}
                                                 onLockedClick={() => handleLockedClick('Reportes Avanzados')}
                                          />
                                   </div>

                                   {/* ACCOUNT */}
                                   <div className="space-y-1.5">
                                          {!isCollapsed && (
                                                 <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Cuenta</p>
                                          )}
                                          <SidebarLink
                                                 href="/dashboard/suscripcion"
                                                 icon={CreditCard}
                                                 label="Suscripción"
                                                 active={pathname.startsWith('/dashboard/suscripcion')}
                                                 isCollapsed={isCollapsed}
                                          />
                                          <SidebarLink
                                                 href="/auditoria"
                                                 icon={ShieldCheck}
                                                 label="Seguridad"
                                                 active={pathname.startsWith('/auditoria')}
                                                 isCollapsed={isCollapsed}
                                          />
                                          <SidebarLink
                                                 href="/configuracion"
                                                 icon={Settings}
                                                 label="Configuración"
                                                 active={pathname.startsWith('/configuracion')}
                                                 isCollapsed={isCollapsed}
                                          />
                                   </div>
                            </div>

                            {/* USER PROFILE - BOTTOM */}
                            <div className={cn("p-4 mt-auto mb-4", isCollapsed && "items-center flex flex-col p-2")}>
                                   <div className={cn(
                                          "flex items-center gap-3 bg-secondary/30 p-2.5 rounded-2xl border border-border/40 group hover:border-primary/20 hover:bg-secondary/50 transition-colors",
                                          isCollapsed ? "justify-center aspect-square p-0 w-12 h-12" : "w-full"
                                   )}>
                                          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-xs shadow-lg shadow-primary/20 ring-2 ring-background relative">
                                                 {session?.user?.image ? (
                                                        <Image src={session.user.image} alt="User" fill sizes="36px" className="object-cover rounded-[8px]" />
                                                 ) : (
                                                        displayedName.substring(0, 2).toUpperCase()
                                                 )}
                                          </div>
                                          {!isCollapsed && (
                                                 <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{displayedName}</p>
                                                        <p className="text-[10px] text-muted-foreground/60 truncate uppercase font-bold tracking-widest">{roleLabel}</p>
                                                 </div>
                                          )}
                                          {!isCollapsed && (
                                                 <button
                                                        onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                        className="text-muted-foreground hover:text-red-500 transition-all p-1.5 hover:bg-red-500/10 rounded-lg group/logout"
                                                        title="Cerrar Sesión"
                                                 >
                                                        <LogOut size={14} />
                                                 </button>
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

interface SidebarLinkProps {
       href: string
       icon: any
       label: string
       active?: boolean
       isCollapsed: boolean
       variant?: 'default' | 'primary'
       className?: string
       isLocked?: boolean
       onLockedClick?: () => void
}

import { createPortal } from 'react-dom'
import { useRef } from 'react'

function SidebarTooltip({ children, content, isCollapsed }: { children: React.ReactNode, content: string, isCollapsed: boolean }) {
       const [show, setShow] = useState(false)
       const [pos, setPos] = useState({ top: 0, left: 0 })
       const ref = useRef<HTMLDivElement>(null)

       useEffect(() => {
              if (show && ref.current) {
                     const rect = ref.current.getBoundingClientRect()
                     setPos({ top: rect.top + (rect.height / 2), left: rect.right + 12 })
              }
       }, [show])

       return (
              <>
                     <div
                            ref={ref}
                            onMouseEnter={() => setShow(true)}
                            onMouseLeave={() => setShow(false)}
                            className="block"
                     >
                            {children}
                     </div>
                     {show && isCollapsed && typeof window !== 'undefined' && createPortal(
                            <div
                                   style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
                                   className="fixed z-[9999] bg-slate-900 border border-slate-800 text-white dark:bg-white dark:border-white/10 dark:text-black px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl pointer-events-none whitespace-nowrap"
                            >
                                   {content}
                            </div>,
                            document.body
                     )}
              </>
       )
}

function SidebarLink({ href, icon: Icon, label, active, isCollapsed, variant = 'default', className, isLocked, onLockedClick }: SidebarLinkProps) {
       const handleClick = (e: React.MouseEvent) => {
              if (isLocked) {
                     e.preventDefault()
                     onLockedClick?.()
              }
       }

       const content = (
              <div
                     className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group relative text-[13px] tracking-tight cursor-pointer",
                            active
                                   ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary border border-primary/20 shadow-[0_4px_15px_rgba(var(--primary-rgb),0.1)] font-black"
                                   : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-bold hover:-translate-y-[1px]",
                            isLocked && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground hover:translate-y-0",
                            isCollapsed && "justify-center px-1 py-3.5"
                     )}
                     onClick={handleClick}
              >
                     {active && (
                            <motion.div
                                   layoutId="sidebar-active"
                                   className="absolute left-[-1px] top-2 bottom-2 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                            />
                     )}
                     <div className="relative">
                            <Icon size={18} className={cn(active ? "text-primary" : "group-hover:text-primary transition-colors", "flex-shrink-0")} />
                            {isLocked && (
                                   <div className="absolute -top-1.5 -right-1.5 bg-card rounded-full p-0.5 shadow-sm border border-border">
                                          <Lock size={10} className="text-amber-500" />
                                   </div>
                            )}
                     </div>

                     {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between overflow-hidden">
                                   <span className="whitespace-nowrap truncate">{label}</span>
                                   {isLocked && <Lock size={14} className="text-muted-foreground/50 ml-2" />}
                            </div>
                     )}
              </div>
       )

       const wrappedContent = (
              <SidebarTooltip content={label} isCollapsed={isCollapsed}>
                     {content}
              </SidebarTooltip>
       )

       if (isLocked) {
              return <div className="px-2">{wrappedContent}</div>
       }

       return (
              <div className="px-2">
                     <Link href={href}>
                            {wrappedContent}
                     </Link>
              </div>
       )
}
