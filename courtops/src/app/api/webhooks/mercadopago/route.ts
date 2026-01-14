
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import prisma from '@/lib/db'

export async function POST(request: Request) {
       // 1. Parsing and validation
       const url = new URL(request.url)
       const clubId = url.searchParams.get('clubId')

       if (!clubId) {
              return NextResponse.json({ error: 'Missing clubId param' }, { status: 400 })
       }

       const body = await request.json().catch(() => null)
       if (!body || !body.data || !body.data.id) {
              return NextResponse.json({ status: 'ignored', reason: 'no data.id' })
       }

       const { type, data } = body
       // Webhooks might send "test" type or others. We care about payment.
       if (type !== 'payment') {
              return NextResponse.json({ status: 'ignored' })
       }

       try {
              // 2. Get Club Settings for MP Token
              const club = await prisma.club.findUnique({ where: { id: clubId } })

              // Use logic similar to action: cast to any to access mp fields
              const clubAny = club as any

              if (!club || !clubAny.mpAccessToken) {
                     console.error(`Webhook Error: Club ${clubId} not found or no MP token`)
                     return NextResponse.json({ error: 'Club config error' }, { status: 400 })
              }

              // 3. Verify Payment with MercadoPago
              const client = new MercadoPagoConfig({ accessToken: clubAny.mpAccessToken })
              const payment = new Payment(client)

              const paymentInfo = await payment.get({ id: data.id })

              if (!paymentInfo) {
                     return NextResponse.json({ error: 'Payment not found in MP' }, { status: 404 })
              }

              // 4. Process Approved Payment
              if (paymentInfo.status === 'approved') {
                     const bookingId = Number(paymentInfo.external_reference)
                     if (!bookingId) {
                            console.error("Webhook: No external_reference (bookingId)")
                            return NextResponse.json({ status: 'ok', msg: 'no booking id' })
                     }

                     const transactionAmount = paymentInfo.transaction_amount || 0

                     // Check if Booking exists
                     const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
                     if (!booking) {
                            return NextResponse.json({ status: 'ok', msg: 'booking not found' })
                     }

                     // Update Booking Only if not already paid (idempotency check basically)
                     if (booking.paymentStatus !== 'PAID') {

                            // Determine status
                            // If deposit covers full price (or partial logic)
                            // For now, if MP payment is approved, we mark as PAID or PARTIAL.
                            // Assuming deposit logic:
                            const isFullPayment = transactionAmount >= booking.price
                            const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL' // PARTIAL is not in standard schema enum usually, let's allow PAID for simplicity or check schema.
                            // Schema uses String for paymentStatus.

                            // Find Open Cash Register
                            const cashRegister = await prisma.cashRegister.findFirst({
                                   where: { clubId, status: 'OPEN' },
                                   orderBy: { openedAt: 'desc' }
                            })

                            const updates: any[] = [
                                   prisma.booking.update({
                                          where: { id: bookingId },
                                          data: {
                                                 status: 'CONFIRMED',
                                                 paymentStatus: newPaymentStatus,
                                          }
                                   })
                            ]

                            if (cashRegister) {
                                   updates.push(
                                          prisma.transaction.create({
                                                 data: {
                                                        cashRegisterId: cashRegister.id,
                                                        type: 'INCOME',
                                                        category: 'BOOKING_DEPOSIT',
                                                        amount: transactionAmount,
                                                        method: 'MERCADOPAGO', // "method" is String in schema
                                                        description: `Pago MP #${data.id} - Reserva #${bookingId}`,
                                                        bookingId: bookingId,
                                                 }
                                          })
                                   )
                            }

                            await prisma.$transaction(updates)
                            console.log(`Webhook: Booking ${bookingId} updated to CONFIRMED/PAID`)
                     }
              }

              return NextResponse.json({ status: 'ok' })

       } catch (error: any) {
              console.error("Webhook Internal Error:", error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
