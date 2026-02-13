'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
       ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'

export function Sidebar({ club }: { club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const [isCollapsed, setIsCollapsed] = useState(false)
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { data: session } = useSession()

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

       return (
              <aside
                     className={cn(
                            "flex-shrink-0 bg-card border-r border-border flex flex-col hidden md:flex transition-all duration-300 relative z-50",
                            isCollapsed ? "w-[70px]" : "w-64"
                     )}
              >
                     {/* Toggle Button */}
                     <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-8 z-50 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors shadow-lg"
                     >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                     </button>

                     {/* Logo Area */}
                     <div className={cn("px-6 py-8 flex items-center gap-3", isCollapsed && "justify-center px-2")}>
                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] overflow-hidden text-primary-foreground">
                                   {club?.logoUrl ? (
                                          <img src={club.logoUrl} alt="Club Logo" className="w-full h-full object-cover" />
                                   ) : (
                                          <Zap className="fill-current" size={20} />
                                   )}
                            </div>
                            {!isCollapsed && (
                                   <div className="flex flex-col">
                                          <h1 className={cn("font-black text-foreground tracking-[0.1em] leading-none", (club?.name?.length || 0) > 12 ? "text-lg" : "text-xl")}>
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

                     {/* USER PROFILE - BOTTOM - Refactored for Image match */}
                     <div className={cn("p-4 mt-auto", isCollapsed && "items-center flex flex-col p-2")}>
                            <div className={cn("flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50", isCollapsed && "justify-center aspect-square p-0 w-12 h-12 border-0 bg-transparent")}>
                                   <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-black text-sm">
                                          {session?.user?.image ? (
                                                 <img src={session.user.image} alt="User" className="w-full h-full object-cover rounded-lg" />
                                          ) : (
                                                 displayedName.substring(0, 2).toUpperCase()
                                          )}
                                   </div>
                                   {!isCollapsed && (
                                          <div className="flex-1 min-w-0">
                                                 <p className="text-sm font-bold text-foreground truncate">{displayedName}</p>
                                                 <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">{roleLabel}</p>
                                          </div>
                                   )}
                                   {!isCollapsed && (
                                          <button
                                                 onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                 className="ml-auto text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                                          >
                                                 <LogOut size={16} />
                                          </button>
                                   )}
                            </div>
                     </div>
              </aside>
       )
}

function SidebarLink({ href, icon: Icon, label, active, isCollapsed, variant = 'default', className }: { href: string, icon: any, label: string, active?: boolean, isCollapsed: boolean, variant?: 'default' | 'primary', className?: string }) {
       return (
              <div className="px-2">
                     <Link
                            href={href}
                            className={cn(
                                   "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative text-sm",
                                   active
                                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] font-bold"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                   isCollapsed && "justify-center px-2 py-3"
                            )}
                            title={isCollapsed ? label : undefined}
                     >
                            <Icon size={18} className={cn(active ? "text-primary" : "group-hover:text-primary transition-colors", "flex-shrink-0")} />
                            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
                     </Link>
              </div>
       )
}
