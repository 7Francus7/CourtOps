import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
       try {
              const bookings = await prisma.booking.findMany({
                     take: 10,
                     orderBy: { createdAt: 'desc' },
                     select: {
                            id: true,
                            clientId: true,
                            startTime: true,
                            status: true,
                            client: {
                                   select: { name: true }
                            }
                     }
              })

              return NextResponse.json({
                     count: bookings.length,
                     sample: bookings,
                     meta: {
                            firstIdType: bookings.length > 0 ? typeof bookings[0].id : 'N/A'
                     }
              })
       } catch (error: any) {
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
