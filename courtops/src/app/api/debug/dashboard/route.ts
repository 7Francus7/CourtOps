import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
       const results: any = {
              timestamp: new Date().toISOString(),
              tests: {}
       }

       // Test 1: Session
       try {
              const session = await getServerSession(authOptions)
              results.tests.session = {
                     status: 'OK',
                     hasSession: !!session,
                     clubId: session?.user?.clubId || null,
                     email: session?.user?.email || null
              }
       } catch (e: any) {
              results.tests.session = {
                     status: 'ERROR',
                     error: e.message,
                     stack: e.stack
              }
       }

       // Test 2: Database Connection
       try {
              await prisma.$queryRaw`SELECT 1`
              results.tests.database = { status: 'OK' }
       } catch (e: any) {
              results.tests.database = {
                     status: 'ERROR',
                     error: e.message,
                     stack: e.stack
              }
       }

       // Test 3: Get clubId from session
       let clubId = null
       try {
              const session = await getServerSession(authOptions)
              clubId = session?.user?.clubId
              results.tests.clubIdExtraction = {
                     status: 'OK',
                     clubId
              }
       } catch (e: any) {
              results.tests.clubIdExtraction = {
                     status: 'ERROR',
                     error: e.message
              }
       }

       // Test 4: Fetch courts if we have clubId
       if (clubId) {
              try {
                     const courts = await prisma.court.findMany({
                            where: { clubId, isActive: true }
                     })
                     results.tests.courts = {
                            status: 'OK',
                            count: courts.length,
                            courts: courts.map(c => ({ id: c.id, name: c.name }))
                     }
              } catch (e: any) {
                     results.tests.courts = {
                            status: 'ERROR',
                            error: e.message,
                            stack: e.stack
                     }
              }

              // Test 5: Fetch club settings
              try {
                     const club = await prisma.club.findUnique({
                            where: { id: clubId },
                            select: {
                                   openTime: true,
                                   closeTime: true,
                                   slotDuration: true,
                                   timezone: true
                            }
                     })
                     results.tests.clubSettings = {
                            status: 'OK',
                            found: !!club,
                            settings: club
                     }
              } catch (e: any) {
                     results.tests.clubSettings = {
                            status: 'ERROR',
                            error: e.message,
                            stack: e.stack
                     }
              }

              // Test 6: Try getTurneroData logic
              try {
                     const targetDate = new Date()
                     const start = new Date(targetDate)
                     start.setDate(start.getDate() - 1)
                     start.setHours(0, 0, 0, 0)

                     const end = new Date(targetDate)
                     end.setDate(end.getDate() + 1)
                     end.setHours(23, 59, 59, 999)

                     const bookings = await prisma.booking.findMany({
                            where: {
                                   clubId,
                                   startTime: { gte: start, lte: end },
                                   status: { not: 'CANCELED' }
                            },
                            include: {
                                   client: { select: { id: true, name: true, phone: true } },
                                   items: { include: { product: true } },
                                   transactions: true
                            },
                            orderBy: { startTime: 'asc' }
                     })

                     results.tests.turneroData = {
                            status: 'OK',
                            bookingsCount: bookings.length,
                            dateRange: { start: start.toISOString(), end: end.toISOString() }
                     }
              } catch (e: any) {
                     results.tests.turneroData = {
                            status: 'ERROR',
                            error: e.message,
                            stack: e.stack
                     }
              }
       }

       return NextResponse.json(results, { status: 200 })
}
