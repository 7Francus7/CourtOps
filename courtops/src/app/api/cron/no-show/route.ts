'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { BookingService } from '@/services/booking.service'
import { canAutoMarkNoShow } from '@/lib/booking-status'

/**
 * Auto-marks bookings as NO_SHOW.
 * Criteria:
 *  - Booking status is CONFIRMED (not CANCELED, not already NO_SHOW)
 *  - paymentStatus is UNPAID
 *  - endTime is in the past (buffer: 30 min after endTime)
 * 
 * Run via Vercel Cron every 30 min, or manually via GET request.
 */
export async function GET(request: Request) {
       try {
              const authHeader = request.headers.get('authorization')
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

               const now = new Date()

               // Find all CONFIRMED + UNPAID bookings whose endTime has passed
               const candidates = await prisma.booking.findMany({
                      where: {
                             status: 'CONFIRMED',
                             paymentStatus: 'UNPAID',
                             endTime: { lt: now }
                      },
                      select: {
                             id: true,
                             clubId: true,
                             status: true,
                             paymentStatus: true,
                             endTime: true,
                      }
               })

               const noShowBookings = candidates.filter((booking) =>
                      canAutoMarkNoShow({
                             status: booking.status,
                             paymentStatus: booking.paymentStatus,
                             endTime: booking.endTime,
                             now,
                      })
               )

               if (noShowBookings.length === 0) {
                      return NextResponse.json({ success: true, marked: 0 })
               }

               const ids = noShowBookings.map(b => b.id)

               for (const booking of noShowBookings) {
                      await BookingService.markNoShow(booking.id, booking.clubId, 'AUTO_NO_SHOW')
                }

               return NextResponse.json({
                      success: true,
                     marked: ids.length,
                     bookingIds: ids
              })

       } catch (error: unknown) {
              console.error('[Cron NoShow] Error:', error)
              return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
       }
}
