'use client'

import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { usePathname, useSearchParams } from 'next/navigation'
import { SectionTransition } from './SectionTransition'
import { cn } from '@/lib/utils'

export function AppShell({ children, club }: { children: React.ReactNode, club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       const fullHeightPaths = ['/dashboard', '/reportes', '/configuracion', '/actividad', '/clientes'];
       const isFullHeightMobile = fullHeightPaths.some(p => pathname === p || pathname.startsWith(p));

       return (
              <div className="flex flex-1 min-h-0 overflow-hidden bg-background font-sans transition-colors duration-300">
                     <Sidebar club={club} />
                     <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
                            <div className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar", !isFullHeightMobile && "pb-32 md:pb-0")}>
                                   <SectionTransition>
                                          {children}
                                   </SectionTransition>
                            </div>
                     </div>
                     <MobileBottomNav club={club} />
              </div>
       )
}
