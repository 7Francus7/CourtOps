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
       Settings,
       ChevronLeft,
       ChevronRight,
       LogOut,
       User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'

export function Sidebar() {
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
                            "flex-shrink-0 bg-[#09090b] text-slate-300 border-r border-[#27272a] flex flex-col hidden md:flex transition-all duration-300 relative z-50",
                            isCollapsed ? "w-[70px]" : "w-64"
                     )}
              >
                     {/* Toggle Button */}
                     <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-8 z-50 bg-[#18181b] border border-[#27272a] rounded-full p-1 text-slate-400 hover:text-white transition-colors shadow-lg"
                     >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                     </button>

                     {/* Logo Area */}
                     <div className={cn("px-6 py-6 flex items-center gap-3", isCollapsed && "justify-center px-2")}>
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                   <Trophy className="text-white" size={18} />
                            </div>
                            {!isCollapsed && (
                                   <h1 className="text-lg font-bold text-white tracking-wide">
                                          COURTOPS
                                   </h1>
                            )}
                     </div>

                     <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 custom-scrollbar">

                            {/* MANAGEMENT */}
                            <div className="space-y-1">
                                   {!isCollapsed && (
                                          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Management</p>
                                   )}
                                   <SidebarLink
                                          href="/"
                                          icon={LayoutDashboard}
                                          label="Dashboard"
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
                            <div className="space-y-1">
                                   {!isCollapsed && (
                                          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Finance</p>
                                   )}
                                   <SidebarLink
                                          href="?modal=kiosco"
                                          icon={ShoppingCart}
                                          label="Kiosco"
                                          active={searchParams.get('modal') === 'kiosco'}
                                          isCollapsed={isCollapsed}
                                   />
                                   <SidebarLink
                                          href="/reportes"
                                          icon={FileBarChart}
                                          label="Reportes"
                                          active={pathname.startsWith('/reportes')}
                                          isCollapsed={isCollapsed}
                                   />
                                   <SidebarLink
                                          href="/actividad"
                                          icon={History}
                                          label="Actividad"
                                          active={pathname.startsWith('/actividad')}
                                          isCollapsed={isCollapsed}
                                   />
                            </div>

                            {/* ACCOUNT */}
                            <div className="space-y-1">
                                   {!isCollapsed && (
                                          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Account</p>
                                   )}
                                   <SidebarLink
                                          href="/dashboard/suscripcion"
                                          icon={CreditCard}
                                          label="Suscripción"
                                          active={pathname.startsWith('/dashboard/suscripcion')}
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
                     <div className={cn("p-4 border-t border-[#27272a] mt-auto bg-[#09090b]", isCollapsed && "items-center flex flex-col p-2")}>
                            <div className={cn("flex items-center gap-3 bg-[#18181b] p-2 rounded-xl border border-[#27272a]", isCollapsed && "justify-center aspect-square p-0 w-10 h-10 border-0 bg-transparent")}>
                                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-yellow-500 flex items-center justify-center flex-shrink-0 text-amber-900 overflow-hidden">
                                          {session?.user?.image ? (
                                                 <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                          ) : (
                                                 <User size={16} fill="currentColor" />
                                          )}
                                   </div>
                                   {!isCollapsed && (
                                          <div className="flex-1 min-w-0">
                                                 <p className="text-xs font-bold text-white truncate">{displayedName}</p>
                                                 <p className="text-[10px] text-slate-500 truncate uppercase">{roleLabel}</p>
                                          </div>
                                   )}
                                   {!isCollapsed && (
                                          <button
                                                 onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                 className="ml-auto text-slate-500 hover:text-white transition-colors"
                                          >
                                                 <LogOut size={14} />
                                          </button>
                                   )}
                            </div>
                     </div>
              </aside>
       )
}

function SidebarLink({ href, icon: Icon, label, active, isCollapsed, variant = 'default' }: { href: string, icon: any, label: string, active?: boolean, isCollapsed: boolean, variant?: 'default' | 'primary' }) {
       return (
              <div className="px-2">
                     <Link
                            href={href}
                            className={cn(
                                   "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative text-sm",
                                   active
                                          ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_var(--primary)] font-bold shadow-primary/20"
                                          : "text-slate-400 hover:bg-[#18181b] hover:text-white",
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
