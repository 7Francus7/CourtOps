'use client'

import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
       return (
              <div className="flex min-h-screen bg-[var(--bg-dark)] font-sans">
                     <Sidebar />
                     <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                            {/* Header should be included in the specific page or here? 
            If I put Header here, it's global. 
            The Header takes a 'title' prop which varies by page. 
            Option: The Header is part of the shell, but the Title is managed via a Context or just generic 'CourtOps'. 
            Better: Let the pages render the Header if they need specific titles, OR make the Shell generic.
            For now, I will NOT include the Header in the Shell strictly, 
            OR I will allow children to handle the scrollable area.
            
            Actually, the best pattern for this "Unified" request is:
            Shell > Sidebar + Main > (Header + Content).
            
            Let's keep the Shell simple: Sidebar + Slot.
        */}
                            {children}
                     </div>
              </div>
       )
}
