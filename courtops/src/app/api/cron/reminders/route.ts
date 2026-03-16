import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { sendBookingReminderEmail } from '@/lib/email'

// IMPORTANT: This route is protected by a CRON_SECRET header in production
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
                            clientId: { not: null },
                     },
                     include: {
                            client: true,
                            court: true,
                            club: true,
                            transactions: true
                     }
              })

              // 2. Loop and send reminders
              const { MessagingService } = await import('@/lib/messaging')

              const results = await Promise.all(bookings.map(async (booking) => {
                     try {
                            const clientName = booking.client?.name || 'Jugador'
                            const email = booking.client?.email
                            const phone = booking.client?.phone

                            // Calculate balance
                            const totalPaid = booking.transactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
                            const balance = Number(booking.price) - totalPaid

                            // --- 2a. Send Email if available ---
                            if (email) {
                                   const bookingDate = format(booking.startTime, "EEEE d 'de' MMMM", { locale: es })
                                   const bookingTime = format(booking.startTime, 'HH:mm')

                                   await sendBookingReminderEmail(
                                          email,
                                          clientName,
                                          bookingDate,
                                          bookingTime,
                                          booking.court.name,
                                          booking.club.name,
                                          booking.club.phone,
                                          balance > 0 ? balance : undefined
                                   )
                            }

                            // --- 2b. Send WhatsApp if available ---
                            if (phone) {
                                   const message = MessagingService.generateBookingMessage(
                                          {
                                                 schedule: {
                                                        startTime: booking.startTime,
                                                        courtName: booking.court.name
                                                 },
                                                 pricing: { balance },
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

              return NextResponse.json({ success: true, processed: results.length, results })
       } catch (error: unknown) {
              return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
       }
}
