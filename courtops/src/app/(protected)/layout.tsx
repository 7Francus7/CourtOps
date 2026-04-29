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
import { TrialBanner } from "@/components/layout/TrialBanner"
import { TrialExpiredGuard } from "@/components/layout/TrialExpiredGuard"
import { CommandPalette } from '@/components/CommandPalette'


export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
       const session = await getServerSession(authOptions)

       if (!session) {
              redirect('/login')
       }

       const isSuperAdmin = session.user?.role === 'SUPER_ADMIN' || session.user?.role === 'GOD'

       if (!session.user?.clubId) {
              if (isSuperAdmin) {
                     redirect('/god-mode')
              }

              redirect('/login')
       }

       let club = null
       try {
              club = await prisma.club.findUnique({
                     where: { id: session.user.clubId },
                     select: {
                            themeColor: true,
                            name: true,
                            logoUrl: true,
                            subscriptionStatus: true,
                            nextBillingDate: true,
                            plan: true,
                            mpPreapprovalId: true,
                            // Feature Flags
                            hasKiosco: true,
                            hasTournaments: true,
                            hasAdvancedReports: true,
                            hasOnlinePayments: true,
                            hasCustomDomain: true,
                            hasWhatsApp: true,
                            hasWaivers: true
                     }
              })
       } catch (e) {
              console.error("[CRITICAL] ProtectedLayout Prisma Error:", e)
              // We intentionally don't throw - allow shell render
       }

       const serializedClub = club ? {
              ...club,
              nextBillingDate: club.nextBillingDate ? club.nextBillingDate.toISOString() : null,
              isSubscribed: !!club.mpPreapprovalId
       } : null

       // Check if trial has expired
       const isTrialExpired = !!(
              club &&
              club.subscriptionStatus === 'TRIAL' &&
              club.nextBillingDate &&
              new Date(club.nextBillingDate) < new Date()
       )

       return (
              <div className="flex flex-col h-screen overflow-hidden">
                     <ThemeRegistry themeColor={serializedClub?.themeColor} />
                     <TrialBanner
                            subscriptionStatus={serializedClub?.subscriptionStatus || 'ACTIVE'}
                            nextBillingDate={serializedClub?.nextBillingDate || null}
                            plan={serializedClub?.plan || 'PRO'}
                     />
                     <AppShell club={serializedClub}>
                            <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pb-28 md:pb-0">
                                   <SystemAlerts />
                                   <TrialExpiredGuard isTrialExpired={isTrialExpired}>
                                          {children}
                                   </TrialExpiredGuard>
                            </div>
                            <GlobalModals />
                            <AiAssistant />
                            <CommandPalette />
                     </AppShell>
              </div>
       )
}
