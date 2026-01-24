'use client'

import { Bell, Search, UserPlus, Menu, ArrowLeft, Zap, Moon, Sun } from 'lucide-react'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useNotifications } from '@/hooks/useNotifications'
import { signOut, useSession } from 'next-auth/react'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

export function Header({ title, backHref }: { title?: string, backHref?: string }) {
       const { data: session } = useSession()
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
       const { theme, setTheme } = useTheme()

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
       const isEmployeeActive = !!activeEmployee

       return (
              <>
                     <header className="h-20 flex items-center justify-between px-6 bg-[#09090b] border-b border-[#27272a] sticky top-0 z-40">
                            {/* Mobile / Title */}
                            <div className="flex items-center gap-4">
                                   {backHref ? (
                                          <Link href={backHref} className="md:hidden p-2 text-slate-400 hover:text-white">
                                                 <ArrowLeft size={24} />
                                          </Link>
                                   ) : (
                                          <button className="md:hidden p-2 text-slate-400 hover:text-white">
                                                 <Menu size={24} />
                                          </button>
                                   )}
                                   <div className="flex items-center gap-3">
                                          {backHref && (
                                                 <Link href={backHref} className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-[#18181b] text-slate-400 hover:text-white hover:bg-[#27272a] transition-all">
                                                        <ArrowLeft size={16} />
                                                 </Link>
                                          )}
                                          <h2 className="text-xl font-bold text-white">{title || 'Dashboard'}</h2>
                                   </div>
                            </div>

                            {/* Center Search - Dashboard Style */}
                            <div className="hidden lg:flex flex-1 max-w-md mx-6">
                                   <div className="relative w-full group">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                          <input
                                                 className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
                                                 placeholder="Buscar..."
                                                 type="text"
                                          />
                                   </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-3">

                                   <div className="flex items-center gap-2 mr-2">
                                          <button
                                                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                 className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#18181b] rounded-full transition-colors"
                                          >
                                                 {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                          </button>

                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-9 h-9 relative flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#18181b] rounded-full transition-colors"
                                          >
                                                 <Bell size={18} />
                                                 {unreadCount > 0 && (
                                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                                 )}
                                          </button>
                                   </div>

                                   <div className="h-6 w-px bg-[#27272a] mx-1"></div>

                                   {/* Action Buttons */}
                                   <div className="flex items-center gap-3">
                                          <Link
                                                 href="/clientes"
                                                 className="flex items-center gap-2 px-3 py-2 bg-[#18181b] hover:bg-[#27272a] text-slate-300 hover:text-white rounded-lg border border-[#27272a] transition-all text-xs font-bold uppercase tracking-wide"
                                          >
                                                 <UserPlus size={14} />
                                                 <span className="hidden sm:inline">Nuevo Cliente</span>
                                          </Link>

                                          <Link
                                                 href="?modal=kiosco"
                                                 className="flex items-center gap-2 px-3 py-2 bg-[#064e3b] hover:bg-[#065f46] text-emerald-400 hover:text-emerald-300 rounded-lg border border-emerald-900/50 transition-all text-xs font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                          >
                                                 <Zap size={14} className="fill-emerald-400/20" />
                                                 <span className="hidden sm:inline">Venta Rápida</span>
                                          </Link>
                                   </div>
                            </div>
                     </header>

                     <NotificationsSheet
                            isOpen={isNotificationsOpen}
                            onClose={() => setIsNotificationsOpen(false)}
                            notifications={notifications}
                            onMarkAllAsRead={markAllAsRead}
                            isLoading={notificationsLoading}
                     />
              </>
       )
}
