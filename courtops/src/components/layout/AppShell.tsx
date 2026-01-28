'use client'

import { Sidebar } from './Sidebar'
import { usePathname, useSearchParams } from 'next/navigation'

export function AppShell({ children, club }: { children: React.ReactNode, club?: any }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       return (
              <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)] font-sans">
                     <Sidebar club={club} />
                     <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                            {children}
                     </div>
              </div>
       )
}
