import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
       request: NextRequest,
       { params }: { params: Promise<{ id: string }> }
) {
       const { id } = await params
       try {
              const bookingId = parseInt(id)

              if (isNaN(bookingId)) {
                     return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
              }

              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: {
                            client: {
                                   select: {
                                          name: true,
                                          phone: true,
                                          email: true
                                   }
                            },
                            court: {
                                   select: {
                                          name: true
                                   }
                            },
                            transactions: {
                                   select: {
                                          amount: true,
                                          method: true,
                                          createdAt: true
                                   }
                            }
                     }
              })

              if (!booking) {
                     return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
              }

              // Don't expose canceled bookings
              if (booking.status === 'CANCELED') {
                     return NextResponse.json({ success: false, error: 'Reserva cancelada' }, { status: 404 })
              }

              return NextResponse.json({
                     success: true,
                     booking: {
                            id: booking.id,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            price: booking.price,
                            status: booking.status,
                            paymentStatus: booking.paymentStatus,
                            client: booking.client,
                            guestName: booking.guestName,
                            guestPhone: booking.guestPhone,
                            court: booking.court,
                            transactions: booking.transactions
                     }
              })
       } catch (error) {
              console.error('Error fetching public booking:', error)
              return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
       }
}
