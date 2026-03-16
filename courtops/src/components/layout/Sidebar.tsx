'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
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
       LogOut,
       ShieldCheck,
       Lock,
       ScanLine
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import { UpgradeModal } from './UpgradeModal'

const COLLAPSE_DELAY = 150

export function Sidebar({ club }: { club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const [isExpanded, setIsExpanded] = useState(false)
       const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { data: session } = useSession()

       const [showUpgradeModal, setShowUpgradeModal] = useState(false)
       const [lockedFeatureName, setLockedFeatureName] = useState('')

       const isBookingsView = searchParams.get('view') === 'bookings'
       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
       const roleLabel = activeEmployee ? 'Operador' : 'Administrador'

       const handleMouseEnter = useCallback(() => {
              if (collapseTimer.current) {
                     clearTimeout(collapseTimer.current)
                     collapseTimer.current = null
              }
              setIsExpanded(true)
       }, [])

       const handleMouseLeave = useCallback(() => {
              collapseTimer.current = setTimeout(() => {
                     setIsExpanded(false)
              }, COLLAPSE_DELAY)
       }, [])

       useEffect(() => {
              return () => {
                     if (collapseTimer.current) clearTimeout(collapseTimer.current)
              }
       }, [])

       const handleLockedClick = (featureName: string) => {
              setLockedFeatureName(featureName)
              setShowUpgradeModal(true)
       }

       return (
              <>
                     {/* Spacer — always takes collapsed width in flex layout */}
                     <div className="flex-shrink-0 w-[78px] hidden md:block" />

                     <aside
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className={cn(
                                   "fixed inset-y-0 left-0 bg-card/80 backdrop-blur-2xl border-r border-border/40 flex-col hidden md:flex transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-50 overflow-hidden",
                                   isExpanded
                                          ? "w-68 shadow-[8px_0_30px_rgba(0,0,0,0.12)]"
                                          : "w-[78px] shadow-none"
                            )}
                     >
                            {/* Logo */}
                            <div className="px-4 py-7 flex items-center gap-3 overflow-hidden">
                                   <div className={cn(
                                          "bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/25 overflow-hidden text-primary-foreground relative transition-all duration-300",
                                          isExpanded ? "w-12 h-12 ml-1" : "w-11 h-11 mx-auto"
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
                                   <div className={cn(
                                          "flex flex-col min-w-0 transition-all duration-300 delay-75",
                                          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                                   )}>
                                          <h1 className={cn(
                                                 "font-black text-foreground tracking-[0.1em] leading-none truncate whitespace-nowrap",
                                                 (club?.name?.length || 0) > 12 ? "text-lg" : "text-xl"
                                          )}>
                                                 {club?.name?.toUpperCase() || 'COURTOPS'}
                                          </h1>
                                   </div>
                            </div>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 custom-scrollbar">

                                   {/* GESTIÓN */}
                                   <div className="space-y-1">
                                          <SectionLabel label="Gestión" isExpanded={isExpanded} />
                                          <SidebarLink
                                                 href="/"
                                                 icon={LayoutDashboard}
                                                 label="Inicio"
                                                 active={(pathname === '/' || pathname === '/dashboard') && !isBookingsView}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/reservas"
                                                 icon={CalendarDays}
                                                 label="Reservas"
                                                 active={pathname.startsWith('/reservas') || isBookingsView}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/torneos"
                                                 icon={Trophy}
                                                 label="Torneos"
                                                 active={pathname.startsWith('/torneos')}
                                                 isExpanded={isExpanded}
                                                 isLocked={!club?.hasTournaments}
                                                 onLockedClick={() => handleLockedClick('Torneos')}
                                          />
                                          <SidebarLink
                                                 href="/clientes"
                                                 icon={Users}
                                                 label="Clientes"
                                                 active={pathname.startsWith('/clientes')}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/check-in"
                                                 icon={ScanLine}
                                                 label="Check-in"
                                                 active={pathname.startsWith('/check-in')}
                                                 isExpanded={isExpanded}
                                          />
                                   </div>

                                   <SectionDivider isExpanded={isExpanded} />

                                   {/* FINANZAS */}
                                   <div className="space-y-1">
                                          <SectionLabel label="Finanzas" isExpanded={isExpanded} />
                                          <SidebarLink
                                                 href="?modal=kiosco"
                                                 icon={ShoppingCart}
                                                 label="Kiosco"
                                                 active={searchParams.get('modal') === 'kiosco'}
                                                 isExpanded={isExpanded}
                                                 isLocked={!club?.hasKiosco}
                                                 onLockedClick={() => handleLockedClick('Punto de Venta')}
                                          />
                                          <SidebarLink
                                                 href="/caja"
                                                 icon={Banknote}
                                                 label="Caja"
                                                 active={pathname.startsWith('/caja')}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/reportes"
                                                 icon={FileBarChart}
                                                 label="Reportes"
                                                 active={pathname.startsWith('/reportes')}
                                                 isExpanded={isExpanded}
                                                 isLocked={!club?.hasAdvancedReports}
                                                 onLockedClick={() => handleLockedClick('Reportes Avanzados')}
                                          />
                                   </div>

                                   <SectionDivider isExpanded={isExpanded} />

                                   {/* CUENTA */}
                                   <div className="space-y-1">
                                          <SectionLabel label="Cuenta" isExpanded={isExpanded} />
                                          <SidebarLink
                                                 href="/dashboard/suscripcion"
                                                 icon={CreditCard}
                                                 label="Suscripción"
                                                 active={pathname.startsWith('/dashboard/suscripcion')}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/auditoria"
                                                 icon={ShieldCheck}
                                                 label="Seguridad"
                                                 active={pathname.startsWith('/auditoria')}
                                                 isExpanded={isExpanded}
                                          />
                                          <SidebarLink
                                                 href="/configuracion"
                                                 icon={Settings}
                                                 label="Configuración"
                                                 active={pathname.startsWith('/configuracion')}
                                                 isExpanded={isExpanded}
                                          />
                                   </div>
                            </div>

                            {/* User profile */}
                            <div className={cn("p-4 mt-auto mb-2 transition-all duration-300", !isExpanded && "flex flex-col items-center p-2")}>
                                   <div className={cn(
                                          "flex items-center gap-3 bg-secondary/30 rounded-2xl border border-border/40 group hover:border-primary/20 hover:bg-secondary/50 transition-all duration-200 overflow-hidden",
                                          isExpanded ? "p-2.5 w-full" : "justify-center w-12 h-12 p-0"
                                   )}>
                                          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-xs shadow-lg shadow-primary/20 ring-2 ring-background relative">
                                                 {session?.user?.image ? (
                                                        <Image src={session.user.image} alt="User" fill sizes="36px" className="object-cover rounded-[8px]" />
                                                 ) : (
                                                        displayedName.substring(0, 2).toUpperCase()
                                                 )}
                                          </div>
                                          <div className={cn(
                                                 "flex-1 min-w-0 transition-all duration-300 delay-75",
                                                 isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none w-0"
                                          )}>
                                                 <p className="text-xs font-black text-foreground truncate uppercase tracking-tight whitespace-nowrap">{displayedName}</p>
                                                 <p className="text-[10px] text-muted-foreground/60 truncate uppercase font-bold tracking-widest whitespace-nowrap">{roleLabel}</p>
                                          </div>
                                          <button
                                                 onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                 className={cn(
                                                        "text-muted-foreground hover:text-red-500 transition-all p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0",
                                                        isExpanded ? "opacity-100 delay-100" : "opacity-0 pointer-events-none w-0 p-0"
                                                 )}
                                                 title="Cerrar Sesión"
                                          >
                                                 <LogOut size={14} />
                                          </button>
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

/* ─── Subcomponents ─────────────────────────────────────────────── */

function SectionLabel({ label, isExpanded }: { label: string; isExpanded: boolean }) {
       return (
              <div className={cn(
                     "flex items-center overflow-hidden transition-all duration-300",
                     isExpanded ? "h-8 px-4 opacity-100" : "h-0 px-0 opacity-0"
              )}>
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
                            {label}
                     </p>
              </div>
       )
}

function SectionDivider({ isExpanded }: { isExpanded: boolean }) {
       return (
              <div className={cn(
                     "border-t border-border/30 transition-all duration-300",
                     isExpanded ? "mx-4 opacity-60 my-2" : "mx-5 opacity-20 my-1"
              )} />
       )
}

interface SidebarLinkProps {
       href: string
       icon: any
       label: string
       active?: boolean
       isExpanded: boolean
       isLocked?: boolean
       onLockedClick?: () => void
}

function SidebarLink({ href, icon: Icon, label, active, isExpanded, isLocked, onLockedClick }: SidebarLinkProps) {
       const handleClick = (e: React.MouseEvent) => {
              if (isLocked) {
                     e.preventDefault()
                     onLockedClick?.()
              }
       }

       const content = (
              <div
                     className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group relative text-[13px] tracking-tight cursor-pointer overflow-hidden",
                            active
                                   ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary border border-primary/20 shadow-[0_4px_15px_rgba(var(--primary-rgb),0.1)] font-black"
                                   : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground font-bold hover:-translate-y-[1px]",
                            isLocked && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground hover:translate-y-0",
                            !isExpanded && "justify-center px-1 py-3.5"
                     )}
                     onClick={handleClick}
              >
                     {active && (
                            <motion.div
                                   layoutId="sidebar-active"
                                   className="absolute left-[-1px] top-2 bottom-2 w-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                            />
                     )}
                     <div className="relative flex-shrink-0">
                            <Icon size={18} className={cn(active ? "text-primary" : "group-hover:text-primary transition-colors", "flex-shrink-0")} />
                            {isLocked && (
                                   <div className="absolute -top-1.5 -right-1.5 bg-card rounded-full p-0.5 shadow-sm border border-border">
                                          <Lock size={10} className="text-amber-500" />
                                   </div>
                            )}
                     </div>

                     <div className={cn(
                            "flex-1 flex items-center justify-between transition-all duration-300 delay-75",
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                     )}>
                            <span className="whitespace-nowrap truncate">{label}</span>
                            {isLocked && <Lock size={14} className="text-muted-foreground/50 ml-2" />}
                     </div>
              </div>
       )

       if (isLocked) {
              return <div className="px-2">{content}</div>
       }

       return (
              <div className="px-2">
                     <Link href={href}>
                            {content}
                     </Link>
              </div>
       )
}
