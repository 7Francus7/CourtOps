'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { addDays, startOfDay, endOfDay } from 'date-fns'

// IMPORTANT: This route should be protected by a CRON_SECRET header in production
export async function GET(request: Request) {
       try {
              const authHeader = request.headers.get('authorization')
              if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                     return new NextResponse('Unauthorized', { status: 401 })
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

              // 2. Loop and "Send"
              const { MessagingService } = await import('@/lib/messaging')

              const results = await Promise.all(bookings.map(async (booking) => {
                     try {
                            const clientName = booking.client?.name || 'Jugador'
                            const email = booking.client?.email
                            const phone = booking.client?.phone

                            // --- 2a. Send Email if available ---
                            if (email) {
                                   // TODO: implement email sending via resend
                            }

                            // --- 2b. Send WhatsApp if available ---
                            if (phone) {
                                   const message = MessagingService.generateBookingMessage(
                                          {
                                                 schedule: {
                                                        startTime: booking.startTime,
                                                        courtName: booking.court.name
                                                 },
                                                 pricing: { balance: booking.price }, // Basic pricing for reminder
                                                 client: { name: clientName }
                                          },
                                          'reminder'
                                   )
                                   await MessagingService.sendWhatsApp(phone, message)
                            }

                            // 3. Mark as sent
                            await prisma.booking.update({
                                   where: { id: booking.id },
                                   data: { reminderSent: true }
                            })

                            return { id: booking.id, status: 'sent', methods: { email: !!email, whatsapp: !!phone } }
                     } catch (err) {
                            console.error(`Failed to remind booking ${booking.id}`, err)
                            return { id: booking.id, status: 'error' }
                     }
              }))

              return NextResponse.json({ success: true, results })
       } catch (error: unknown) {
              return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
       }
}
