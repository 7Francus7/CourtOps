'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Users, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
       const pathname = usePathname()

       const links = [
              { href: '/dashboard', label: 'Inicio', icon: Home },
              { href: '/dashboard?view=bookings', label: 'Reservas', icon: CalendarDays },
              { href: '/clientes', label: 'Clientes', icon: Users },
              { href: '/reportes', label: 'Reportes', icon: BarChart3 },
              { href: '/configuracion', label: 'Ajustes', icon: Settings },
       ]

       return (
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0C0F14]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 z-50 safe-area-bottom">
                     <div className="flex justify-between items-center">
                            {links.map((link) => {
                                   const isActive = pathname === link.href.split('?')[0]
                                   return (
                                          <Link
                                                 key={link.href}
                                                 href={link.href}
                                                 className={cn(
                                                        "flex flex-col items-center gap-1 min-w-[50px]",
                                                        isActive ? "text-[var(--brand-green)]" : "text-zinc-500 hover:text-zinc-300"
                                                 )}
                                          >
                                                 <link.icon size={22} />
                                                 <span className="text-[10px] font-medium">{link.label}</span>
                                          </Link>
                                   )
                            })}
                     </div>
              </div>
       )
}
