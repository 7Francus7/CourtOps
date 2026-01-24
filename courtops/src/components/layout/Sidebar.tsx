'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, Users, Settings, FileBarChart, History, CalendarDays, Trophy, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const [isCollapsed, setIsCollapsed] = useState(true)

       const isBookingsView = searchParams.get('view') === 'bookings'

       return (
              <aside
                     className={cn(
                            "flex-shrink-0 bg-white dark:bg-[#0d1016] border-r border-slate-200 dark:border-border-dark flex flex-col hidden md:flex transition-all duration-300 relative",
                            isCollapsed ? "w-20" : "w-64"
                     )}
              >
                     {/* Toggle Button */}
                     <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute -right-3 top-9 z-50 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-full p-1 text-slate-500 hover:text-primary transition-colors shadow-sm"
                     >
                            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                     </button>

                     <div className={cn("p-6 flex items-center gap-3", isCollapsed && "px-2 justify-center")}>
                            <div className="w-10 h-10 bg-primary min-w-[2.5rem] rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]">
                                   <Trophy className="text-white" size={24} />
                            </div>
                            {!isCollapsed && (
                                   <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white glow-text-blue whitespace-nowrap overflow-hidden">
                                          CourtOps
                                   </h1>
                            )}
                     </div>

                     <nav className="flex-1 px-4 space-y-2 mt-4">
                            <SidebarLink
                                   href="/"
                                   icon={LayoutDashboard}
                                   label="Dashboard"
                                   active={(pathname === '/' || pathname === '/dashboard') && !isBookingsView}
                                   isCollapsed={isCollapsed}
                            />
                            <SidebarLink
                                   href="/reservas"
                                   icon={CalendarDays}
                                   label="Reservas"
                                   active={pathname.startsWith('/reservas') || isBookingsView}
                                   isCollapsed={isCollapsed}
                            />
                            <SidebarLink href="/torneos" icon={Trophy} label="Torneos" active={pathname.startsWith('/torneos')} isCollapsed={isCollapsed} />
                            <SidebarLink href="/clientes" icon={Users} label="Clientes" active={pathname.startsWith('/clientes')} isCollapsed={isCollapsed} />
                            <SidebarLink href="/reportes" icon={FileBarChart} label="Reportes" active={pathname.startsWith('/reportes')} isCollapsed={isCollapsed} />
                            <SidebarLink href="/actividad" icon={History} label="Actividad" active={pathname.startsWith('/actividad')} isCollapsed={isCollapsed} />
                     </nav>

                     <div className="p-4 mt-auto space-y-2">
                            <SidebarLink href="/dashboard/suscripcion" icon={CreditCard} label="Suscripción" active={pathname.startsWith('/dashboard/suscripcion')} isCollapsed={isCollapsed} />
                            <SidebarLink href="/configuracion" icon={Settings} label="Configuración" active={pathname.startsWith('/configuracion')} isCollapsed={isCollapsed} />
                     </div>
              </aside>
       )
}

function SidebarLink({ href, icon: Icon, label, active, isCollapsed }: { href: string, icon: any, label: string, active?: boolean, isCollapsed: boolean }) {
       return (
              <Link
                     href={href}
                     className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all group relative",
                            active
                                   ? "bg-primary text-white shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]"
                                   : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark",
                            isCollapsed && "justify-center px-2"
                     )}
                     title={isCollapsed ? label : undefined}
              >
                     <Icon size={20} className={cn(active ? "text-white" : "", "flex-shrink-0")} />
                     {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
              </Link>
       )
}
