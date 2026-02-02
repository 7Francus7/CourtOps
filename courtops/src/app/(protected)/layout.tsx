
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import prisma from '@/lib/db'
import { ThemeRegistry } from '@/components/ThemeRegistry'
import { SystemAlerts } from '@/components/layout/SystemAlerts'
import { GlobalModals } from '@/components/layout/GlobalModals'


export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
       const session = await getServerSession(authOptions)

       if (!session) {
              redirect('/login')
       }

       let club = null
       try {
              if (session.user?.clubId) {
                     club = await prisma.club.findUnique({
                            where: { id: session.user.clubId },
                            select: { themeColor: true, name: true, logoUrl: true }
                     })
              }
       } catch (e) {
              console.error("[CRITICAL] ProtectedLayout Prisma Error:", e)
              // We intentionally don't throw here to allow the shell to render
              // The individual pages might fail but at least the shell exists
       }

       return (
              <AppShell>
                     <ThemeRegistry themeColor={club?.themeColor} />
                     <div className="w-full h-full flex flex-col min-h-0">
                            <SystemAlerts />
                            {children}
                     </div>
                     <GlobalModals />
              </AppShell>
       )
}
