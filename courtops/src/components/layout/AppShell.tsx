'use client'

import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { usePathname, useSearchParams } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
       const pathname = usePathname()
       const searchParams = useSearchParams()

       // Hide MobileNav on dashboard root because MobileDashboard has its own nav
       const shouldHideMobileNav = pathname === '/dashboard' && !searchParams.get('view')

       return (
              <div className="flex h-screen overflow-hidden bg-[var(--bg-dark)] font-sans">
                     <Sidebar />
                     <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                            {children}
                     </div>
                     {!shouldHideMobileNav && <MobileNav />}
              </div>
       )
}
