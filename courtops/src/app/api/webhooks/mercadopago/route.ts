import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import prisma from '@/lib/db'

export async function POST(request: Request) {
       // 1. Parsing and validation
       const url = new URL(request.url)
       const clubId = url.searchParams.get('clubId')

       const body = await request.json().catch(() => null)
       if (!body || !body.data || !body.data.id) {
              return NextResponse.json({ status: 'ignored', reason: 'no data.id' })
       }

       const { type, data } = body

       // Handle Subscription Preapproval Updates (topic: subscription_preapproval)
       // This handles status changes like cancellation or pausing
       if (type === 'subscription_preapproval') {
              // Only relevant for Platform (SaaS) subscriptions usually
              if (!clubId) {
                     try {
                            const platformAccessToken = process.env.MP_ACCESS_TOKEN
                            if (!platformAccessToken) return NextResponse.json({ status: 'ignored', reason: 'no platform token' })

                            const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
                            const preapproval = new PreApproval(client)
                            const subscription = await preapproval.get({ id: data.id })

                            if (subscription && subscription.external_reference) {
                                   const parts = subscription.external_reference.split(':')
                                   if (parts.length === 2) {
                                          const [refClubId, refPlanId] = parts
                                          await prisma.club.update({
                                                 where: { id: refClubId },
                                                 data: {
                                                        subscriptionStatus: subscription.status,
                                                        nextBillingDate: subscription.next_payment_date ? new Date(subscription.next_payment_date) : undefined
                                                 }
                                          })
                                          console.log(`Webhook: Updated Club ${refClubId} status to ${subscription.status}`)
                                   }
                            }
                     } catch (e) {
                            console.error("Error processing preapproval webhook:", e)
                     }
              }
              return NextResponse.json({ status: 'ok' })
       }

       // Handle Payments
       if (type !== 'payment') {
              return NextResponse.json({ status: 'ignored' })
       }

       try {
              let accessToken = ''
              let isPlatform = false

              // CASE A: Tenant Webhook (Memeberships / Bookings)
              if (clubId) {
                     const club = await prisma.club.findUnique({ where: { id: clubId } })
                     if (!club || !club.mpAccessToken) {
                            console.error(`Webhook Error: Club ${clubId} not found or no MP token`)
                            return NextResponse.json({ error: 'Club config error' }, { status: 400 })
                     }

                     const { decrypt } = await import('@/lib/encryption')
                     accessToken = decrypt(club.mpAccessToken)
              }
              // CASE B: Platform Webhook (SaaS Subscriptions)
              else {
                     accessToken = process.env.MP_ACCESS_TOKEN || ''
                     isPlatform = true
                     if (!accessToken) {
                            console.error("Webhook Error: No Platform MP Token")
                            return NextResponse.json({ error: 'Platform config error' }, { status: 500 })
                     }
              }

              // 3. Verify Payment with MercadoPago
              const client = new MercadoPagoConfig({ accessToken })
              const payment = new Payment(client)

              const paymentInfo = await payment.get({ id: data.id })

              if (!paymentInfo) {
                     return NextResponse.json({ error: 'Payment not found in MP' }, { status: 404 })
              }

              // 4. Process Approved Payment
              if (paymentInfo.status === 'approved') {
                     const externalRef = paymentInfo.external_reference || ''

                     // --- LOGIC FOR SAAS SUBSCRIPTIONS (Platform) ---
                     if (isPlatform) {
                            // Format: clubId:planId
                            if (externalRef.includes(':')) {
                                   const [refClubId, refPlanId] = externalRef.split(':')

                                   // Verify Club exists
                                   const club = await prisma.club.findUnique({ where: { id: refClubId } })
                                   const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })

                                   if (club && plan) {
                                          // Update Club Subscription
                                          await prisma.club.update({
                                                 where: { id: refClubId },
                                                 data: {
                                                        platformPlanId: refPlanId,
                                                        subscriptionStatus: 'authorized',
                                                        mpPreapprovalId: String(paymentInfo.order?.id || club.mpPreapprovalId), // order.id is usually preapproval_id in subscriptions
                                                        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Fallback approx if no date from MP
                                                 }
                                          })
                                          console.log(`Webhook: SaaS Subscription processed for Club ${refClubId}`)
                                          return NextResponse.json({ status: 'ok', msg: 'saas subscription processed' })
                                   }
                            }
                            return NextResponse.json({ status: 'ignored', reason: 'unknown platform payment ref' })
                     }

                     // --- LOGIC FOR TENANT PAYMENTS (Club) ---

                     // CHECK IF IS MEMBERSHIP PAYMENT (Format: clubId___clientId___planId)
                     if (externalRef.includes('___')) {
                            const [refClubId, refClientId, refPlanId] = externalRef.split('___')
                            const clientId = Number(refClientId)
                            const transactionAmount = paymentInfo.transaction_amount || 0

                            if (clientId && refPlanId) {
                                   try {
                                          const plan = await prisma.membershipPlan.findUnique({ where: { id: refPlanId } })
                                          // Update/Create Membership
                                          // Expire old ones
                                          await prisma.membership.updateMany({
                                                 where: { clientId, status: 'ACTIVE' },
                                                 data: { status: 'CANCELLED' }
                                          })

                                          // New Membership
                                          const startDate = new Date()
                                          const endDate = new Date()
                                          endDate.setDate(endDate.getDate() + (plan?.durationDays || 30))

                                          await prisma.membership.create({
                                                 data: {
                                                        clientId,
                                                        planId: refPlanId,
                                                        pricePaid: transactionAmount,
                                                        startDate,
                                                        endDate,
                                                        status: 'ACTIVE',
                                                        mpPreapprovalId: String(paymentInfo.id)
                                                 }
                                          })

                                          // Update Client Status
                                          await prisma.client.update({
                                                 where: { id: clientId },
                                                 data: {
                                                        membershipStatus: 'ACTIVE',
                                                        membershipExpiresAt: endDate
                                                 }
                                          })

                                          // Register Transaction
                                          const cashRegister = await prisma.cashRegister.findFirst({
                                                 where: { clubId: refClubId, status: 'OPEN' },
                                                 orderBy: { openedAt: 'desc' }
                                          })

                                          if (cashRegister) {
                                                 await prisma.transaction.create({
                                                        data: {
                                                               cashRegisterId: cashRegister.id,
                                                               clientId,
                                                               type: 'INCOME',
                                                               category: 'MEMBERSHIP_FEE',
                                                               amount: transactionAmount,
                                                               method: 'MERCADOPAGO_SUB',
                                                               description: `Suscripción MP - ${plan?.name || 'Membresía'}`,
                                                        }
                                                 })
                                          }

                                          console.log(`Webhook: Subscription processed for Client ${clientId}`)
                                          return NextResponse.json({ status: 'ok', msg: 'subscription processed' })

                                   } catch (err) {
                                          console.error("Error processing subscription webhook:", err)
                                   }
                            }
                     }

                     // NORMAL BOOKING PAYMENT
                     const bookingId = Number(externalRef)
                     if (bookingId && !isNaN(bookingId)) {

                            const transactionAmount = paymentInfo.transaction_amount || 0

                            // Check if Booking exists
                            const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
                            if (!booking) {
                                   return NextResponse.json({ status: 'ok', msg: 'booking not found' })
                            }

                            // Update Booking Only if not already paid (idempotency check basically)
                            if (booking.paymentStatus !== 'PAID') {

                                   // Determine status
                                   const isFullPayment = transactionAmount >= booking.price
                                   const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL'

                                   // Find Open Cash Register
                                   const cashRegister = await prisma.cashRegister.findFirst({
                                          where: { clubId: booking.clubId, status: 'OPEN' },
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
                                                               method: 'MERCADOPAGO',
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
              }

              return NextResponse.json({ status: 'ok' })

       } catch (error: any) {
              console.error("Webhook Internal Error:", error)
              return NextResponse.json({ error: error.message }, { status: 500 })
       }
}
