'use client'

import { Bell, Search, UserCog, Menu } from 'lucide-react'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useNotifications } from '@/hooks/useNotifications'
import { signOut, useSession } from 'next-auth/react'
import NotificationsSheet from '@/components/NotificationsSheet'
import { useState } from 'react'

export function Header({ title }: { title?: string }) {
       const { data: session } = useSession()
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { notifications, unreadCount, markAllAsRead, loading: notificationsLoading } = useNotifications()
       const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')
       const isEmployeeActive = !!activeEmployee

       return (
              <>
                     <header className="h-20 flex items-center justify-between px-8 bg-white/50 dark:bg-[#0a0b0d]/50 backdrop-blur-md border-b border-slate-200 dark:border-border-dark sticky top-0 z-40">
                            {/* Mobile / Title */}
                            <div className="flex items-center gap-4">
                                   <button className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                          <Menu size={24} />
                                   </button>
                                   <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title || 'Dashboard'}</h2>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-6">

                                   {/* Search Bar */}
                                   <div className="hidden lg:block relative">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                          <input
                                                 className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-card-dark border-none rounded-full w-64 text-sm focus:ring-2 focus:ring-primary transition-all outline-none placeholder:text-slate-400 dark:text-white"
                                                 placeholder="Buscar..."
                                                 type="text"
                                          />
                                   </div>

                                   {/* Notifications */}
                                   <button
                                          onClick={() => setIsNotificationsOpen(true)}
                                          className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-full transition-colors"
                                   >
                                          <Bell size={20} />
                                          {unreadCount > 0 && (
                                                 <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-white dark:ring-[#0a0b0d]"></span>
                                          )}
                                   </button>

                                   <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-border-dark">
                                          <div className="text-right hidden sm:block">
                                                 <p className="text-sm font-bold text-slate-700 dark:text-white leading-none flex items-center justify-end gap-1">
                                                        {isEmployeeActive && <UserCog size={12} className="text-primary" />}
                                                        {displayedName}
                                                 </p>
                                                 {isEmployeeActive ? (
                                                        <button onClick={logoutEmployee} className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:text-primary transition-colors">
                                                               Cerrar Turno
                                                        </button>
                                                 ) : (
                                                        <button onClick={() => signOut()} className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:text-primary transition-colors">
                                                               Cerrar Sesión
                                                        </button>
                                                 )}
                                          </div>

                                          <div className={`w-10 h-10 rounded-full border-2 p-0.5 overflow-hidden ${isEmployeeActive ? 'border-primary/20 bg-primary/10' : 'bg-slate-300 dark:bg-card-dark border-primary/20'}`}>
                                                 {session?.user?.image ? (
                                                        <img alt="User avatar" className="rounded-full w-full h-full object-cover" src={session.user.image} />
                                                 ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-zinc-700 dark:to-zinc-600 rounded-full"></div>
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
