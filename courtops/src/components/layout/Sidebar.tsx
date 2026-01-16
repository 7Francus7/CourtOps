'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, FileBarChart, History, CalendarDays, LogOut, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

export function Sidebar() {
       const pathname = usePathname()

       return (
              <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-[var(--bg-surface)] text-white hidden md:flex transition-all duration-300">
                     <div className="p-6">
                            <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-[var(--brand-blue)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--brand-blue)]/20">
                                          <Trophy className="text-white" size={24} />
                                   </div>
                                   <span className="font-bold text-xl tracking-tight text-white">CourtOps</span>
                            </div>
                     </div>

                     <nav className="flex-1 px-4 space-y-2 py-4">
                            <SidebarLink href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === '/' || pathname === '/dashboard'} />
                            <SidebarLink href="/reservas" icon={CalendarDays} label="Reservas" active={pathname.startsWith('/reservas')} />
                            <SidebarLink href="/clientes" icon={Users} label="Clientes" active={pathname.startsWith('/clientes')} />
                            <SidebarLink href="/reportes" icon={FileBarChart} label="Reportes" active={pathname.startsWith('/reportes')} />
                            <SidebarLink href="/actividad" icon={History} label="Actividad" active={pathname.startsWith('/actividad')} />

                            <div className="pt-4 mt-4 border-t border-white/5">
                                   <SidebarLink href="/configuracion" icon={Settings} label="Configuración" active={pathname.startsWith('/configuracion')} />
                            </div>
                     </nav>

                     <div className="p-6 mt-auto">
                            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-4">
                                   <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--brand-blue)] to-indigo-600"></div>
                                          <div className="overflow-hidden">
                                                 <p className="text-xs font-bold text-white truncate">CourtOps Pro</p>
                                                 <p className="text-[10px] text-zinc-400">v1.2.0 Stable</p>
                                          </div>
                                   </div>
                            </div>
                     </div>
              </aside>
       )
}

function SidebarLink({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
       return (
              <Link
                     href={href}
                     className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                            active
                                   ? "bg-[var(--brand-blue)] text-white shadow-lg shadow-[var(--brand-blue)]/20 font-medium"
                                   : "text-zinc-400 hover:text-white hover:bg-white/5"
                     )}
              >
                     <Icon size={20} className={cn("transition-colors", active ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                     <span className="text-sm">{label}</span>
              </Link>
       )
}
