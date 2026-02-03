import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
// Using JSON.parse/JSON.stringify for safe serialization in debug route

export const dynamic = 'force-dynamic'

export async function GET() {
       const logs: string[] = []
       const errors: any[] = []

       try {
              logs.push('1. Getting session...')
              const session = await getServerSession(authOptions)

              if (!session?.user?.clubId) {
                     return NextResponse.json({ error: 'No session or clubId', logs }, { status: 401 })
              }

              logs.push('2. Session OK, clubId: ' + session.user.clubId)

              const clubId = session.user.clubId
              const dateStr = new Date().toISOString()
              const targetDate = new Date(dateStr)

              logs.push('3. Target date: ' + targetDate.toISOString())

              // Date range
              const start = new Date(targetDate)
              start.setDate(start.getDate() - 1)
              start.setHours(0, 0, 0, 0)

              const end = new Date(targetDate)
              end.setDate(end.getDate() + 1)
              end.setHours(23, 59, 59, 999)

              logs.push('4. Date range set')

              // Fetch courts
              logs.push('5. Fetching courts...')
              const courts = await prisma.court.findMany({
                     where: { clubId, isActive: true },
                     orderBy: { sortOrder: 'asc' }
              })
              logs.push('6. Courts fetched: ' + courts.length)

              // Fetch club
              logs.push('7. Fetching club config...')
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     select: { openTime: true, closeTime: true, slotDuration: true, timezone: true }
              })
              logs.push('8. Club config fetched')

              // Fetch bookings
              logs.push('9. Fetching bookings...')
              let bookings: any[] = []
              try {
                     bookings = await prisma.booking.findMany({
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
                     logs.push('10. Bookings fetched: ' + bookings.length)
              } catch (e: any) {
                     errors.push({ step: '10', error: e.message, stack: e.stack })
                     logs.push('10. ERROR fetching bookings: ' + e.message)
              }

              const config = {
                     openTime: club?.openTime || '09:00',
                     closeTime: club?.closeTime || '00:00',
                     slotDuration: club?.slotDuration || 90
              }

              logs.push('11. Preparing response...')

              const response = {
                     bookings,
                     courts,
                     config,
                     clubId,
                     success: true
              }

              logs.push('12. Attempting serialization...')

              try {
                     const serialized = JSON.parse(JSON.stringify(response))
                     logs.push('13. Serialization SUCCESS')

                     return NextResponse.json({
                            success: true,
                            logs,
                            errors,
                            data: serialized,
                            meta: {
                                   courtsCount: courts.length,
                                   bookingsCount: bookings.length,
                                   config
                            }
                     })
              } catch (e: any) {
                     errors.push({ step: '13', error: e.message, stack: e.stack })
                     logs.push('13. SERIALIZATION FAILED: ' + e.message)

                     return NextResponse.json({
                            success: false,
                            logs,
                            errors,
                            error: 'Serialization failed',
                            errorMessage: e.message,
                            errorStack: e.stack
                     }, { status: 500 })
              }

       } catch (error: any) {
              errors.push({ step: 'TOP', error: error.message, stack: error.stack })
              logs.push('FATAL ERROR: ' + error.message)

              return NextResponse.json({
                     success: false,
                     logs,
                     errors,
                     error: error.message,
                     stack: error.stack
              }, { status: 500 })
       }
}
