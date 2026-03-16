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
       HelpCircle,
       ScanLine
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useEmployee } from '@/contexts/EmployeeContext'
import { useSession, signOut } from 'next-auth/react'
import HelpSheet from '@/components/onboarding/HelpSheet'

export function MobileBottomNav({ club }: { club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()
       const router = useRouter()
       const [isMenuOpen, setIsMenuOpen] = useState(false)
       const [isHelpOpen, setIsHelpOpen] = useState(false)
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
              { href: '/check-in', icon: ScanLine, label: 'Check-in', active: pathname.startsWith('/check-in') },
              { href: '/torneos', icon: Trophy, label: 'Torneos', active: pathname.startsWith('/torneos'), locked: !club?.hasTournaments },
              { href: '?modal=kiosco', icon: ShoppingCart, label: 'Kiosco', active: searchParams.get('modal') === 'kiosco', locked: !club?.hasKiosco },
              { href: '/reportes', icon: FileBarChart, label: 'Reportes', active: pathname.startsWith('/reportes'), locked: !club?.hasAdvancedReports },
              { href: '/auditoria', icon: ShieldCheck, label: 'Seguridad', active: pathname.startsWith('/auditoria') },
              { href: '/dashboard/suscripcion', icon: CreditCard, label: 'Suscripción', active: pathname.startsWith('/dashboard/suscripcion') },
              { href: '/configuracion', icon: Settings, label: 'Configuración', active: pathname.startsWith('/configuracion') },
              { href: '#help', icon: HelpCircle, label: 'Ayuda', active: isHelpOpen, isHelp: true },
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
                                                        </div>                                                         {/* User Section */}
                                                         <div className="px-6 py-6 flex items-center gap-4">
                                                                <div className="relative group">
                                                                       <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
                                                                       <div className="relative w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-2xl border border-white/20">
                                                                              {session?.user?.image ? (
                                                                                     <img src={session.user.image} alt="User" className="w-full h-full object-cover rounded-[1.25rem]" />
                                                                              ) : (
                                                                                     <span className="text-2xl font-black italic">{displayedName.substring(0, 1).toUpperCase()}</span>
                                                                              )}
                                                                       </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                       <h3 className="text-xl font-black text-foreground truncate tracking-tight">{displayedName}</h3>
                                                                       <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1.5 opacity-60">
                                                                              {activeEmployee ? 'Operador Autorizado' : 'Admin del Club'}
                                                                       </p>
                                                                </div>
                                                                <motion.button
                                                                       whileHover={{ scale: 1.1 }}
                                                                       whileTap={{ scale: 0.9 }}
                                                                       onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                                       className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all rounded-2xl bg-muted/30 border border-white/5 shadow-inner"
                                                                >
                                                                       <LogOut size={20} />
                                                                </motion.button>
                                                         </div>

                                                        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mx-6 mb-4" />                                                         {/* Menu Grid */}
                                                         <div className="grid grid-cols-3 gap-3 px-5 pb-8">
                                                                {menuItems.map((item, i) => (
                                                                       <motion.button
                                                                              key={item.label}
                                                                              initial={{ opacity: 0, scale: 0.8 }}
                                                                              animate={{ opacity: 1, scale: 1 }}
                                                                              transition={{ delay: i * 0.05 }}
                                                                              onClick={() => {
                                                                                     if (item.locked) return;
                                                                                     setIsMenuOpen(false);
                                                                                     if ((item as any).isHelp) {
                                                                                            setIsHelpOpen(true);
                                                                                     } else {
                                                                                            router.push(item.href);
                                                                                     }
                                                                              }}
                                                                              className={cn(
                                                                                     "flex flex-col items-center justify-center gap-2.5 p-5 rounded-[2rem] transition-all active:scale-90 relative overflow-hidden group shadow-xl",
                                                                                     item.active
                                                                                            ? "bg-primary text-primary-foreground shadow-primary/20"
                                                                                            : item.locked
                                                                                                   ? "opacity-20 grayscale pointer-events-none"
                                                                                                   : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-white/5 shadow-black/5"
                                                                              )}
                                                                       >
                                                                              {item.active && (
                                                                                     <motion.div layoutId="menuActive" className="absolute inset-0 bg-primary" />
                                                                              )}
                                                                              <div className="relative z-10">
                                                                                     <item.icon size={24} strokeWidth={item.active ? 3 : 2.5} className={cn("transition-transform", item.active && "scale-110")} />
                                                                              </div>
                                                                              <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-center leading-tight">{item.label}</span>
                                                                       </motion.button>
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

                     {/* Help Sheet */}
                     <HelpSheet
                            isOpen={isHelpOpen}
                            onClose={() => setIsHelpOpen(false)}
                            onRestartTutorial={() => setIsHelpOpen(false)}
                     />

                     {/* Bottom Navigation Bar */}
                     <nav className="fixed bottom-0 left-0 right-0 z-[80] md:hidden pb-[env(safe-area-inset-bottom)]" aria-label="Navegación principal">
                            <div className="bg-background/95 backdrop-blur-2xl border-t border-border/10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
                                   <div className="flex justify-around items-center h-[4.5rem] px-2 max-w-lg mx-auto">
                                          {primaryItems.map(item => {
                                                  if (item.isFab) {
                                                         return (
                                                                <button
                                                                       key="fab"
                                                                       onClick={() => router.push('/dashboard?action=new_booking')}
                                                                       className="flex items-center justify-center w-14 h-14 -mt-5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-90 transition-transform"
                                                                       aria-label="Nueva reserva"
                                                                >
                                                                       <Plus className="w-7 h-7" strokeWidth={3} />
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
                                                                       "flex flex-col items-center justify-center gap-1 w-14 h-full transition-colors",
                                                                       isIconActive ? "text-primary" : "text-muted-foreground/50"
                                                                )}
                                                         >
                                                                <item.icon className="w-[22px] h-[22px]" strokeWidth={isIconActive ? 2.5 : 2} />
                                                                <span className={cn(
                                                                       "text-[9px] font-bold uppercase tracking-wide",
                                                                       isIconActive ? "text-primary" : "text-muted-foreground/40"
                                                                )}>
                                                                       {item.label}
                                                                </span>
                                                         </button>
                                                  )
                                           })}
                                    </div>
                             </div>
                      </nav>
              </>
       )
}
