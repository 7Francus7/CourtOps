import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import prisma from '@/lib/db'
import { ThemeRegistry } from '@/components/ThemeRegistry'
import { SystemAlerts } from '@/components/layout/SystemAlerts'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
       const session = await getServerSession(authOptions)

       if (!session) {
              redirect('/login')
       }

       const club = session.user?.clubId ? await prisma.club.findUnique({
              where: { id: session.user.clubId },
              select: { themeColor: true }
       }) : null

       return (
              <AppShell>
                     <ThemeRegistry themeColor={club?.themeColor} />
                     <div className="max-w-[1920px] mx-auto">
                            <SystemAlerts />
                            {children}
                     </div>
              </AppShell>
       )
}

