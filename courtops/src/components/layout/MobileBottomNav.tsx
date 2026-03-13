'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import {
       LayoutDashboard,
       CalendarDays,
       Banknote,
       Users,
       Plus,
       Settings,
       Menu,
       X,
       Trophy,
       ShoppingCart,
       FileBarChart,
       ShieldCheck,
       CreditCard,
       LogOut,
       Zap,
       HelpCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'

export function MobileBottomNav({ club }: { club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const router = useRouter()
       const [isMenuOpen, setIsMenuOpen] = useState(false)
       const { activeEmployee, logoutEmployee } = useEmployee()
       const { data: session } = useSession()

       const isBookingsView = searchParams.get('view') === 'bookings'

       // Primary nav items (always visible)
       const primaryItems = [
              {
                     href: '/dashboard',
                     icon: LayoutDashboard,
                     label: 'Inicio',
                     active: (pathname === '/' || pathname === '/dashboard') && !isBookingsView,
                     color: 'text-primary'
              },
              {
                     href: '/dashboard?view=bookings',
                     icon: CalendarDays,
                     label: 'Turnos',
                     active: isBookingsView || pathname.startsWith('/reservas'),
                     color: 'text-blue-500'
              },
              {
                     href: '#fab',
                     icon: Plus,
                     label: 'Nuevo',
                     isFab: true,
                     active: false,
                     color: ''
              },
              {
                     href: '/caja',
                     icon: Banknote,
                     label: 'Caja',
                     active: pathname.startsWith('/caja'),
                     color: 'text-emerald-500'
              },
              {
                     href: '#more',
                     icon: Menu,
                     label: 'Más',
                     active: isMenuOpen,
                     color: 'text-primary',
                     isMenu: true
              }
       ]

       // Extended menu items
       const menuItems = [
              { href: '/clientes', icon: Users, label: 'Clientes', active: pathname.startsWith('/clientes') },
              { href: '/torneos', icon: Trophy, label: 'Torneos', active: pathname.startsWith('/torneos'), locked: !club?.hasTournaments },
              { href: '?modal=kiosco', icon: ShoppingCart, label: 'Kiosco', active: searchParams.get('modal') === 'kiosco', locked: !club?.hasKiosco },
              { href: '/reportes', icon: FileBarChart, label: 'Reportes', active: pathname.startsWith('/reportes'), locked: !club?.hasAdvancedReports },
              { href: '/auditoria', icon: ShieldCheck, label: 'Seguridad', active: pathname.startsWith('/auditoria') },
              { href: '/dashboard/suscripcion', icon: CreditCard, label: 'Suscripción', active: pathname.startsWith('/dashboard/suscripcion') },
              { href: '/configuracion', icon: Settings, label: 'Configuración', active: pathname.startsWith('/configuracion') },
              { href: '?modal=help', icon: HelpCircle, label: 'Ayuda', active: searchParams.get('modal') === 'help' },
       ]

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')

       const isExpired = (targetDate: string | Date | undefined) => {
              if (!targetDate) return false
              return new Date(targetDate) < new Date()
       }

       return (
              <>
                     {/* Extended Menu Overlay */}
                     <AnimatePresence>
                            {isMenuOpen && (
                                   <div className="fixed inset-0 z-[90]">
                                          {/* Backdrop */}
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                                 onClick={() => setIsMenuOpen(false)}
                                          />

                                          {/* Menu Panel - Bottom Sheet Style */}
                                          <motion.div
                                                 initial={{ y: '100%' }}
                                                 animate={{ y: 0 }}
                                                 exit={{ y: '100%' }}
                                                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                                 className="absolute bottom-0 left-0 right-0 p-4"
                                          >
                                                 <div className="bg-card/95 backdrop-blur-2xl border-t border-x border-border/50 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] max-w-lg mx-auto overflow-hidden pb-[env(safe-area-inset-bottom)]">
                                                        {/* Handle Indicator */}
                                                        <div className="w-full flex justify-center py-3">
                                                               <div className="w-12 h-1.5 bg-muted/40 rounded-full" />
                                                        </div>

                                                        {/* User Section */}
                                                        <div className="px-6 py-4 flex items-center gap-4">
                                                               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg">
                                                                      {session?.user?.image ? (
                                                                             <img src={session.user.image} alt="User" className="w-full h-full object-cover rounded-2xl" />
                                                                      ) : (
                                                                             <span className="text-xl font-black">{displayedName.substring(0, 1).toUpperCase()}</span>
                                                                      )}
                                                               </div>
                                                               <div className="flex-1 min-w-0">
                                                                      <h3 className="text-lg font-black text-foreground truncate leading-tight">{displayedName}</h3>
                                                                      <p className="text-xs text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">{activeEmployee ? 'Operador Autorizado' : 'Administrador del Club'}</p>
                                                               </div>
                                                               <button
                                                                      onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all rounded-full bg-muted/30 active:scale-90"
                                                               >
                                                                      <LogOut size={18} />
                                                               </button>
                                                        </div>

                                                        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-6 mb-4" />

                                                        {/* Menu Grid */}
                                                        <div className="grid grid-cols-3 gap-2 px-4 pb-6">
                                                               {menuItems.map(item => (
                                                                      <button
                                                                             key={item.label}
                                                                             onClick={() => {
                                                                                    if (item.locked) return;
                                                                                    setIsMenuOpen(false);
                                                                                    router.push(item.href);
                                                                             }}
                                                                             className={cn(
                                                                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-[1.5rem] transition-all active:scale-90 relative overflow-hidden",
                                                                                    item.active
                                                                                           ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                                                           : item.locked
                                                                                                  ? "opacity-20 grayscale pointer-events-none"
                                                                                                  : "bg-muted/30 text-muted-foreground active:bg-muted/50"
                                                                             )}
                                                                      >
                                                                             <item.icon size={22} strokeWidth={item.active ? 3 : 2} />
                                                                             <span className="text-[10px] font-black uppercase tracking-wider text-center leading-none">{item.label}</span>
                                                                      </button>
                                                               ))}
                                                        </div>

                                                        {/* Footer Branding */}
                                                        <div className="px-6 py-4 bg-muted/10 flex items-center justify-center gap-3">
                                                               <div className="flex items-center gap-2 opacity-50">
                                                                      <Zap size={14} className="text-primary fill-primary" />
                                                                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                                                                             MATCH POINT
                                                                      </span>
                                                               </div>
                                                        </div>
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>

                     {/* Bottom Navigation Bar - Floating Dock Style */}
                     <nav className="fixed bottom-4 left-4 right-4 z-[80] md:hidden" aria-label="Navegación principal">
                            <div className="bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] safe-area-bottom overflow-hidden">
                                   <div className="flex justify-between items-center h-20 px-4">
                                          {primaryItems.map(item => {
                                                 if (item.isFab) {
                                                        return (
                                                               <button
                                                                      key="fab"
                                                                      onClick={() => router.push('/dashboard?action=new_booking')}
                                                                      className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 active:scale-90 transition-all active:brightness-110"
                                                                      aria-label="Nueva reserva"
                                                               >
                                                                      <Plus className="w-8 h-8" strokeWidth={3} />
                                                               </button>
                                                        )
                                                 }

                                                 const isIconActive = item.isMenu ? isMenuOpen : item.active;

                                                 return (
                                                        <button
                                                               key={item.label}
                                                               aria-label={item.label}
                                                               onClick={() => {
                                                                      if (item.isMenu) setIsMenuOpen(!isMenuOpen)
                                                                      else if (item.href) router.push(item.href)
                                                               }}
                                                               className={cn(
                                                                      "relative flex flex-col items-center justify-center gap-1.5 w-14 py-2 transition-all duration-300",
                                                                      isIconActive ? (item.active ? item.color : "text-primary") : "text-muted-foreground/60 active:text-foreground"
                                                               )}
                                                        >
                                                               <item.icon className={cn("w-6 h-6 transition-all duration-300", isIconActive && "scale-110 -translate-y-0.5")} />
                                                               <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", isIconActive ? "opacity-100" : "opacity-60")}>{item.label}</span>

                                                               {/* Active Pill Indicator */}
                                                               {isIconActive && (
                                                                      <motion.div
                                                                             layoutId="activeTabPill"
                                                                             className="absolute -bottom-1 w-6 h-1 bg-current rounded-full"
                                                                             transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                                      />
                                                               )}
                                                        </button>
                                                 )
                                          })}
                                   </div>
                            </div>
                     </nav>
              </>
       )
}
