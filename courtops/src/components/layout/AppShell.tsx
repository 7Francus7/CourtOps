'use client'

import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { usePathname, useSearchParams } from 'next/navigation'
import { SectionTransition } from './SectionTransition'

export function AppShell({ children, club }: { children: React.ReactNode, club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       return (
              <div className="flex h-screen overflow-hidden bg-background font-sans transition-colors duration-300">
                     <Sidebar club={club} />
                     <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
                            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                                   <SectionTransition>
                                          {children}
                                   </SectionTransition>
                            </div>
                     </div>
                     <MobileBottomNav club={club} />
              </div>
       )
}
