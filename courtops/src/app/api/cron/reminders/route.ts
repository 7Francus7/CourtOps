
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { MessagingService } from '@/lib/messaging'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
       try {
              // 1. Auth Check (e.g. Bearer token from CRON job header)
              const authHeader = request.headers.get('authorization')
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     // Allow local dev testing if no secret set
                     if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
                            return new NextResponse('Unauthorized', { status: 401 })
                     }
              }

              // 2. Find bookings for tomorrow
              const tomorrow = addDays(new Date(), 1)
              const start = startOfDay(tomorrow)
              const end = endOfDay(tomorrow)

              const bookings = await prisma.booking.findMany({
                     where: {
                            startTime: {
                                   gte: start,
                                   lte: end
                            },
                            status: 'CONFIRMED'
                     },
                     include: {
                            client: true,
                            court: true
                     }
              })

              const results = []

              // 3. Process each booking
              for (const booking of bookings) {
                     if (!booking.client?.phone) continue

                     // ADAPT booking to structure expected by MessagingService if needed, 
                     // or update MessagingService to handle raw Prisma types.
                     // Current MessagingService expects { schedule: { startTime... }, client: { name... }, pricing: { balance... } }
                     // Let's create a minimal adapter here or update service.

                     const adapter = {
                            schedule: {
                                   startTime: booking.startTime,
                                   courtName: booking.court.name
                            },
                            client: {
                                   name: booking.client.name,
                                   phone: booking.client.phone
                            },
                            pricing: {
                                   // Simplified balance calc for reminder
                                   balance: booking.price - (booking.paymentStatus === 'PAID' ? booking.price : 0) // Basic Approx
                            }
                     }

                     const message = MessagingService.generateBookingMessage(adapter, 'reminder')

                     // MOCK SENDING
                     console.log(`[CRON] Sending WhatsApp to ${booking.client.phone}: ${message}`)

                     results.push({
                            id: booking.id,
                            client: booking.client.name,
                            phone: booking.client.phone,
                            status: 'SENT_MOCK'
                     })
              }

              return NextResponse.json({
                     success: true,
                     processed: results.length,
                     details: results
              })

       } catch (error: any) {
              return NextResponse.json({ success: false, error: error.message }, { status: 500 })
       }
}
