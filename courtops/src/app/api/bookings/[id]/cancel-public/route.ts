import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(
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
                            transactions: {
                                   select: { amount: true }
                            }
                     }
              })

              if (!booking) {
                     return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
              }

              // Verify publicToken if booking has one
              const body = await request.json().catch(() => ({}))
              const token = body.token

              if (booking.publicToken && token !== booking.publicToken) {
                     return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
              }

              // Already canceled
              if (booking.status === 'CANCELED') {
                     return NextResponse.json({ success: true, message: 'La reserva ya fue cancelada' })
              }

              // Check if already fully paid — cannot self-cancel a paid booking
              const totalPaid = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
              const balance = booking.price - totalPaid

              if (balance <= 0) {
                     return NextResponse.json(
                            { success: false, error: 'No se puede cancelar una reserva ya pagada. Contacte al club.' },
                            { status: 400 }
                     )
              }

              // Cancel the booking
              await prisma.booking.update({
                     where: { id: bookingId },
                     data: { status: 'CANCELED' }
              })

              return NextResponse.json({ success: true, message: 'Reserva cancelada correctamente' })
       } catch {
              return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
       }
}
