'use client'

import { Bell, Search, UserCog, LogOut, Lock, Menu } from 'lucide-react'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useNotifications } from '@/hooks/useNotifications'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useState } from 'react'

export function Header({ title }: { title?: string }) {
       const { data: session } = useSession()
       const { activeEmployee, lockTerminal, logoutEmployee } = useEmployee()
       const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
       const isEmployeeActive = !!activeEmployee

       return (
              <>
                     <header className="h-20 border-b border-white/5 bg-[var(--bg-dark)]/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                            {/* Mobile Menu Trigger (Visible on mobile only) */}
                            <button className="md:hidden p-2 text-zinc-400 hover:text-white">
                                   <Menu size={24} />
                            </button>

                            {/* Title / Breadcrumbs */}
                            <div className="flex flex-col justify-center">
                                   {title && <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>}
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-6">

                                   {/* Search Bar (Optional, can be hidden on mobile) */}
                                   <div className="hidden lg:flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/5 focus-within:ring-2 ring-[var(--brand-blue)]/50 transition-all w-64">
                                          <Search size={16} className="text-zinc-500" />
                                          <input
                                                 placeholder="Buscar..."
                                                 className="bg-transparent border-none outline-none text-sm text-white ml-2 w-full placeholder:text-zinc-600"
                                          />
                                   </div>

                                   <div className="h-8 w-px bg-white/10 hidden lg:block"></div>

                                   {/* Notifications */}
                                   <button
                                          onClick={() => setIsNotificationsOpen(true)}
                                          className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                                   >
                                          <Bell size={20} />
                                          {unreadCount > 0 && (
                                                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-dark)]"></span>
                                          )}
                                   </button>

                                   {/* User Profile */}
                                   <div className="flex items-center gap-3 pl-2">
                                          <div className="text-right hidden sm:block">
                                                 <p className="text-sm font-semibold text-white flex items-center justify-end gap-2">
                                                        {isEmployeeActive && <UserCog size={14} className="text-[var(--brand-blue)]" />}
                                                        {displayedName}
                                                 </p>
                                                 <div className="flex items-center justify-end gap-2 mt-0.5">
                                                        {isEmployeeActive ? (
                                                               <button onClick={logoutEmployee} className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-wider font-medium flex items-center">
                                                                      Cerrar Turno
                                                               </button>
                                                        ) : (
                                                               <button onClick={() => signOut()} className="text-[10px] text-zinc-500 hover:text-red-400 uppercase tracking-wider font-medium flex items-center">
                                                                      Cerrar Sesión
                                                               </button>
                                                        )}
                                                 </div>
                                          </div>

                                          <div className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${isEmployeeActive ? 'border-[var(--brand-blue)] bg-[var(--brand-blue)]/10' : 'border-zinc-700 bg-zinc-800'}`}>
                                                 {isEmployeeActive ? (
                                                        <UserCog className="text-[var(--brand-blue)]" size={20} />
                                                 ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-600"></div>
                                                 )}
                                          </div>
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
