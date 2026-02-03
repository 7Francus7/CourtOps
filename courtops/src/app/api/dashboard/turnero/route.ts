import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
       try {
              const session = await getServerSession(authOptions)
              if (!session?.user?.id) {
                     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
              }

              const { date } = await req.json()
              const selectedDate = new Date(date)

              // Get user's club from session
              const clubId = (session.user as any)?.clubId
              if (!clubId) {
                     return NextResponse.json({ error: 'Club not found' }, { status: 404 })
              }

              // Get club with courts
              const club = await prisma.club.findUnique({
                     where: { id: clubId },
                     include: { courts: true }
              })

              if (!club) {
                     return NextResponse.json({ error: 'Club not found' }, { status: 404 })
              }

              // Default schedule
              const schedule = { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }

              // Get bookings for the selected date
              const dayStart = new Date(selectedDate)
              dayStart.setHours(0, 0, 0, 0)
              const dayEnd = new Date(selectedDate)
              dayEnd.setHours(23, 59, 59, 999)

              const bookings = await prisma.booking.findMany({
                     where: {
                            courtId: { in: club.courts.map(c => c.id) },
                            startTime: { gte: dayStart, lte: dayEnd }
                     },
                     include: { court: true, client: true }
              })

              return NextResponse.json({
                     courts: club.courts.map(court => ({
                            id: court.id,
                            name: court.name
                     })),
                     bookings: bookings.map(b => ({
                            id: b.id,
                            courtId: b.courtId,
                            startTime: b.startTime.toISOString(),
                            endTime: b.endTime.toISOString(),
                            clientName: b.client?.name || b.guestName || 'Cliente',
                            clientPhone: b.client?.phone || b.guestPhone || '',
                            status: b.status
                     })),
                     config: schedule
              })
       } catch (error: any) {
              console.error('[API] Error:', error)
              return NextResponse.json(
                     { error: error.message || 'Internal error' },
                     { status: 500 }
              )
       }
}
