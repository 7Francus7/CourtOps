'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, Users, Settings, FileBarChart, History, CalendarDays, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       const isBookingsView = searchParams.get('view') === 'bookings'

       return (
              <aside className="w-64 flex-shrink-0 bg-white dark:bg-[#0d1016] border-r border-slate-200 dark:border-border-dark flex flex-col hidden md:flex">
                     <div className="p-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(0,128,255,0.4)]">
                                   <Trophy className="text-white" size={24} />
                            </div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white glow-text-blue">CourtOps</h1>
                     </div>

                     <nav className="flex-1 px-4 space-y-2 mt-4">
                            <SidebarLink
                                   href="/"
                                   icon={LayoutDashboard}
                                   label="Dashboard"
                                   active={(pathname === '/' || pathname === '/dashboard') && !isBookingsView}
                            />
                            <SidebarLink
                                   href="/reservas"
                                   icon={CalendarDays}
                                   label="Reservas"
                                   active={pathname.startsWith('/reservas') || isBookingsView}
                            />
                            <SidebarLink href="/clientes" icon={Users} label="Clientes" active={pathname.startsWith('/clientes')} />
                            <SidebarLink href="/reportes" icon={FileBarChart} label="Reportes" active={pathname.startsWith('/reportes')} />
                            <SidebarLink href="/actividad" icon={History} label="Actividad" active={pathname.startsWith('/actividad')} />
                     </nav>

                     <div className="p-4 mt-auto">
                            <SidebarLink href="/configuracion" icon={Settings} label="Configuración" active={pathname.startsWith('/configuracion')} />
                     </div>
              </aside>
       )
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
       return (
              <Link
                     href={href}
                     className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all",
                            active
                                   ? "bg-primary text-white shadow-[0_0_10px_rgba(0,128,255,0.4)]"
                                   : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark"
                     )}
              >
                     <Icon size={20} className={cn(active ? "text-white" : "")} />
                     <span>{label}</span>
              </Link>
       )
}
