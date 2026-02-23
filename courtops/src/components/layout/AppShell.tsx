'use client'

import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'
import { usePathname, useSearchParams } from 'next/navigation'

export function AppShell({ children, club }: { children: React.ReactNode, club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       return (
              <div className="flex h-screen overflow-x-hidden bg-background font-sans transition-colors duration-300">
                     <Sidebar club={club} />
                     <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden relative">
                            {children}
                     </div>
                     <MobileBottomNav club={club} />
              </div>
       )
}
