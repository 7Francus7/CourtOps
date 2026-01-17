'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'

// IMPORTANT: This route should be protected by a CRON_SECRET header in production
export async function GET(request: Request) {
       try {
              const authHeader = request.headers.get('authorization')
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     // return new NextResponse('Unauthorized', { status: 401 }); 
                     // Commented out for dev testing convenience, uncomment for prod
              }

              // 1. Find bookings for tomorrow that haven't received a reminder
              const tomorrow = addDays(new Date(), 1)
              const start = startOfDay(tomorrow)
              const end = endOfDay(tomorrow)

              const bookings = await prisma.booking.findMany({
                     where: {
                            startTime: { gte: start, lte: end },
                            status: 'CONFIRMED',
                            reminderSent: false,
                            client: {
                                   email: { not: null }
                            }
                     },
                     include: {
                            client: true,
                            court: true,
                            club: true
                     }
              })

              console.log(`[Cron] Found ${bookings.length} bookings to remind for ${format(start, 'yyyy-MM-dd')}`)

              // 2. Loop and "Send"
              const results = await Promise.all(bookings.map(async (booking) => {
                     try {
                            if (!booking.client?.email) return { id: booking.id, status: 'skipped' }

                            // --- MOCK SENDING EMAIL START ---
                            // In real impl: 
                            // await resend.emails.send({ 
                            //    from: 'reservas@courtops.com', 
                            //    to: booking.client.email, 
                            //    subject: `Recordatorio: Tu partido mañana a las ${format(booking.startTime, 'HH:mm')}`
                            // })
                            console.log(`[MockEmail] Sending to ${booking.client.email} for Booking #${booking.id}`)
                            // --- MOCK END ---

                            // 3. Mark as sent
                            await prisma.booking.update({
                                   where: { id: booking.id },
                                   data: { reminderSent: true }
                            })

                            return { id: booking.id, status: 'sent' }
                     } catch (err) {
                            console.error(`Failed to remind booking ${booking.id}`, err)
                            return { id: booking.id, status: 'error' }
                     }
              }))

              return NextResponse.json({ success: true, results })
       } catch (error: any) {
              return NextResponse.json({ success: false, error: error.message }, { status: 500 })
       }
}
