'use client'

import React, { useState } from 'react'
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
       Zap
} from 'lucide-react'
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
       ]

       const displayedName = activeEmployee ? activeEmployee.name : (session?.user?.name || 'Usuario')

       return (
              <>
                     {/* Extended Menu Overlay */}
                     {isMenuOpen && (
                            <div className="fixed inset-0 z-[90] animate-in fade-in duration-200">
                                   {/* Backdrop */}
                                   <div
                                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          onClick={() => setIsMenuOpen(false)}
                                   />

                                   {/* Menu Panel */}
                                   <div className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 animate-in slide-in-from-bottom-4 duration-300">
                                          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto">
                                                 {/* User Section */}
                                                 <div className="p-4 border-b border-border flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
                                                               {session?.user?.image ? (
                                                                      <img src={session.user.image} alt="User" className="w-full h-full object-cover rounded-xl" />
                                                               ) : (
                                                                      displayedName.substring(0, 2).toUpperCase()
                                                               )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                               <p className="text-sm font-bold text-foreground truncate">{displayedName}</p>
                                                               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{activeEmployee ? 'Operador' : 'Administrador'}</p>
                                                        </div>
                                                        <button
                                                               onClick={() => activeEmployee ? logoutEmployee() : signOut()}
                                                               className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                                                        >
                                                               <LogOut size={18} />
                                                        </button>
                                                 </div>

                                                 {/* Menu Grid */}
                                                 <div className="grid grid-cols-4 gap-1 p-3">
                                                        {menuItems.map(item => (
                                                               <Link
                                                                      key={item.href}
                                                                      href={item.locked ? '#' : item.href}
                                                                      onClick={(e) => {
                                                                             if (item.locked) {
                                                                                    e.preventDefault()
                                                                                    return
                                                                             }
                                                                             setIsMenuOpen(false)
                                                                      }}
                                                                      className={cn(
                                                                             "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all active:scale-95",
                                                                             item.active
                                                                                    ? "bg-primary/10 text-primary"
                                                                                    : item.locked
                                                                                           ? "text-muted-foreground/40"
                                                                                           : "text-muted-foreground hover:bg-muted active:bg-muted"
                                                                      )}
                                                               >
                                                                      <item.icon size={22} />
                                                                      <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{item.label}</span>
                                                               </Link>
                                                        ))}
                                                 </div>

                                                 {/* Club Branding */}
                                                 <div className="px-4 py-2.5 border-t border-border flex items-center justify-center gap-2">
                                                        <Zap size={12} className="text-primary" />
                                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                               {club?.name || 'CourtOps'}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     )}

                     {/* Bottom Navigation Bar */}
                     <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-[80] md:hidden safe-area-bottom">
                            <div className="flex justify-around items-center h-16 px-1 max-w-md mx-auto">
                                   {primaryItems.map(item => {
                                          if (item.isFab) {
                                                 return (
                                                        <button
                                                               key="fab"
                                                               onClick={() => router.push('/dashboard?action=new_booking')}
                                                               className="flex items-center justify-center w-13 h-13 -mt-5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-90 transition-all"
                                                        >
                                                               <Plus className="w-6 h-6" strokeWidth={3} />
                                                        </button>
                                                 )
                                          }

                                          if (item.isMenu) {
                                                 return (
                                                        <button
                                                               key="menu"
                                                               onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                               className={cn(
                                                                      "flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-xl transition-all duration-200",
                                                                      isMenuOpen ? "text-primary" : "text-muted-foreground active:text-foreground"
                                                               )}
                                                        >
                                                               {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                                               <span className="text-[9px] font-bold uppercase tracking-wider">{isMenuOpen ? 'Cerrar' : 'Más'}</span>
                                                        </button>
                                                 )
                                          }

                                          return (
                                                 <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-xl transition-all duration-200",
                                                               item.active ? item.color : "text-muted-foreground active:text-foreground"
                                                        )}
                                                 >
                                                        <item.icon className="w-5 h-5" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                                                        {item.active && <div className={cn("w-1 h-1 rounded-full mt-0.5 bg-current")} />}
                                                 </Link>
                                          )
                                   })}
                            </div>
                     </nav>
              </>
       )
}
