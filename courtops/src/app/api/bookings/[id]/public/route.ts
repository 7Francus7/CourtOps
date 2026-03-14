import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

function maskPhone(phone: string | null): string | null {
       if (!phone || phone.length < 4) return phone
       return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4)
}

function maskEmail(email: string | null): string | null {
       if (!email) return null
       const [user, domain] = email.split('@')
       if (!domain) return email
       return user.slice(0, 2) + '***@' + domain
}

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

              // Require publicToken for security
              const token = request.nextUrl.searchParams.get('token')

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
                            },
                            club: {
                                   select: {
                                          name: true,
                                          address: true,
                                          phone: true,
                                          mpAlias: true,
                                          mpCvu: true,
                                          bookingDeposit: true
                                   }
                            }
                     }
              })

              if (!booking) {
                     return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
              }

              // Verify publicToken if booking has one
              if (booking.publicToken && token !== booking.publicToken) {
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
                            client: booking.client ? {
                                   name: booking.client.name,
                                   phone: maskPhone(booking.client.phone),
                                   email: maskEmail(booking.client.email)
                            } : null,
                            guestName: booking.guestName,
                            guestPhone: maskPhone(booking.guestPhone),
                            court: booking.court,
                            club: booking.club,
                            transactions: booking.transactions
                     }
              })
       } catch {
              return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
       }
}
