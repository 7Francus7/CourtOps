'use client'

import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppShell({ children }: { children: React.ReactNode }) {
       return (
              <div className="flex min-h-screen bg-[var(--bg-dark)] font-sans">
                     <Sidebar />
                     <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                            {children}
                     </div>
                     <MobileNav />
              </div>
       )
}
