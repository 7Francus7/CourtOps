'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function runDiagnostics() {
       const report: any = {
              timestamp: new Date().toISOString(),
              database: { status: 'unknown', error: null },
              session: { status: 'unknown', data: null },
              club: { status: 'unknown', id: null, raw: null },
              courts: { count: 0, list: [] },
              env: {
                     hasDbUrl: !!process.env.DATABASE_URL,
                     nodeEnv: process.env.NODE_ENV,
                     nextAuthUrl: process.env.NEXTAUTH_URL
              }
       }

       // 1. Test Database
       try {
              await prisma.$queryRaw`SELECT 1`
              report.database.status = 'OK'
       } catch (e: any) {
              report.database.status = 'FAILED'
              report.database.error = e.message
       }

       // 2. Test Session
       try {
              const session = await getServerSession(authOptions)
              report.session.status = session ? 'OK' : 'MISSING'
              report.session.data = session ? {
                     user: session.user?.email,
                     clubId: session.user?.clubId,
                     role: session.user?.role
              } : null
       } catch (e: any) {
              report.session.status = 'ERROR'
              report.session.error = e.message
       }

       // 3. Test Club & Courts
       try {
              const clubId = await getCurrentClubId()
              report.club.id = clubId

              if (clubId) {
                     const club = await prisma.club.findUnique({
                            where: { id: clubId },
                            include: { _count: { select: { courts: true, bookings: true, products: true } } }
                     })
                     report.club.status = club ? 'FOUND' : 'NOT_FOUND_IN_DB'
                     report.club.raw = club

                     const courts = await prisma.court.findMany({
                            where: { clubId, isActive: true }
                     })
                     report.courts.count = courts.length
                     report.courts.list = courts
              }
       } catch (e: any) {
              report.club.status = 'CRASH'
              report.club.error = e.message
       }

       return report
}
