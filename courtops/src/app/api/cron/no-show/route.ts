'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { logAction } from '@/lib/logger'

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
              if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     return new NextResponse('Unauthorized', { status: 401 })
              }

              const now = new Date()
              const cutoff = new Date(now.getTime() - 30 * 60 * 1000) // 30 min buffer

              // Find all CONFIRMED + UNPAID bookings whose endTime has passed
              const noShowBookings = await prisma.booking.findMany({
                     where: {
                            status: 'CONFIRMED',
                            paymentStatus: 'UNPAID',
                            endTime: { lt: cutoff }
                     },
                     include: {
                            client: { select: { name: true } },
                            court: { select: { name: true } },
                            club: { select: { id: true } },
                            items: true
                     }
              })

              if (noShowBookings.length === 0) {
                     return NextResponse.json({ success: true, marked: 0 })
              }

              const ids = noShowBookings.map(b => b.id)

              // Process each booking: Return stock and Log
              for (const booking of noShowBookings) {
                     // Return Stock
                     for (const item of booking.items) {
                            if (item.productId) {
                                   await prisma.product.update({
                                          where: { id: item.productId },
                                          data: { stock: { increment: item.quantity } }
                                   })
                            }
                     }

                     await logAction({
                            clubId: booking.clubId,
                            action: 'UPDATE',
                            entity: 'BOOKING',
                            entityId: booking.id.toString(),
                            details: {
                                   type: 'AUTO_NO_SHOW',
                                   clientName: booking.client?.name || 'N/A',
                                   courtName: booking.court?.name || 'N/A'
                            }
                     }).catch(console.error)
              }

              // Batch Update Status
              await prisma.booking.updateMany({
                     where: { id: { in: ids } },
                     data: { status: 'NO_SHOW' }
              })

              console.log(`[Cron NoShow] Marked ${ids.length} bookings as NO_SHOW`)

              return NextResponse.json({
                     success: true,
                     marked: ids.length,
                     bookingIds: ids
              })

       } catch (error: any) {
              console.error('[Cron NoShow] Error:', error)
              return NextResponse.json({ success: false, error: error.message }, { status: 500 })
       }
}
