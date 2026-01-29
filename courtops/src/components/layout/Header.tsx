'use client'

import { Bell, Search, UserPlus, Menu, ArrowLeft, Zap, Moon, Sun, LogOut } from 'lucide-react'
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
                     <header className="h-20 flex items-center justify-between px-8 bg-background border-b border-border sticky top-0 z-40">
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
                                                 <Link href={backHref} className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-[#111114] text-slate-400 hover:text-white hover:bg-[#27272a] transition-all">
                                                        <ArrowLeft size={16} />
                                                 </Link>
                                          )}
                                          <h2 className="text-xl font-bold text-white tracking-tight">{title || 'Dashboard'}</h2>
                                   </div>
                            </div>

                            {/* Center Search - Dashboard Style */}
                            <div className="hidden lg:flex flex-1 max-w-sm mx-6">
                                   <div className="relative w-full group">
                                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-[var(--primary)] transition-colors" size={15} />
                                          <input
                                                 className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-all outline-none"
                                                 placeholder="Buscar algo..."
                                                 type="text"
                                          />
                                   </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-4">

                                   <div className="flex items-center gap-2">
                                          <button
                                                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                 className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                          >
                                                 {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                          </button>

                                          <button
                                                 onClick={() => setIsNotificationsOpen(true)}
                                                 className="w-10 h-10 relative flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                                          >
                                                 <Bell size={18} />
                                                 {unreadCount > 0 && (
                                                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--primary)] rounded-full"></span>
                                                 )}
                                          </button>
                                   </div>

                                   <div className="h-8 w-px bg-border mx-1"></div>

                                   {/* Action Buttons */}
                                   <div className="flex items-center gap-2">


                                          <Link
                                                 href="/clientes"
                                                 className="w-10 h-10 flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-all outline-none"
                                                 title="Nuevo Cliente"
                                          >
                                                 <UserPlus size={18} />
                                          </Link>

                                          <Link
                                                 href="?modal=kiosco"
                                                 className="w-10 h-10 flex items-center justify-center bg-[var(--primary)] hover:brightness-110 text-black rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.5)] outline-none"
                                                 title="Venta Rápida"
                                          >
                                                 <Zap size={18} className="fill-current" />
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
