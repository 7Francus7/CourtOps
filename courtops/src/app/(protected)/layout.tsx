export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import prisma from '@/lib/db'
import { ThemeRegistry } from '@/components/ThemeRegistry'
import { SystemAlerts } from '@/components/layout/SystemAlerts'
import { GlobalModals } from '@/components/layout/GlobalModals'
import { AiAssistant } from '@/components/ai/AiAssistant'
import { SupportWidget } from "@/components/layout/SupportWidget"
import { TrialBanner } from "@/components/layout/TrialBanner"


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
                            select: {
                                   themeColor: true,
                                   name: true,
                                   logoUrl: true,
                                   subscriptionStatus: true,
                                   nextBillingDate: true,
                                   plan: true,
                                   mpPreapprovalId: true
                            }
                     })
              }
       } catch (e) {
              console.error("[CRITICAL] ProtectedLayout Prisma Error:", e)
              // We intentionally don't throw here to allow the shell to render
              // The individual pages might fail but at least the shell exists
       }

       const serializedClub = club ? {
              themeColor: club.themeColor || null,
              subscriptionStatus: club.subscriptionStatus || 'ACTIVE',
              nextBillingDate: club.nextBillingDate ? club.nextBillingDate.toISOString() : null,
              plan: club.plan || 'BASIC',
              isSubscribed: !!club.mpPreapprovalId
       } : null

       return (
              <AppShell club={serializedClub}>
                     <ThemeRegistry themeColor={serializedClub?.themeColor} />
                     <div className="w-full h-full flex flex-col min-h-0">
                            <TrialBanner
                                   subscriptionStatus={serializedClub?.subscriptionStatus || 'ACTIVE'}
                                   nextBillingDate={serializedClub?.nextBillingDate || null}
                                   plan={serializedClub?.plan || 'PRO'}
                            />
                            <SystemAlerts />
                            {children}
                            <SupportWidget />
                     </div>
                     <GlobalModals />
                     <AiAssistant />
              </AppShell>
       )
}
