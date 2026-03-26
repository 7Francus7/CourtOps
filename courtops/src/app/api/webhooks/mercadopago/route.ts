import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import prisma from '@/lib/db'
import crypto from 'crypto'
import { getPlanFeatures } from '@/lib/plan-features'

/**
 * Verify MercadoPago webhook signature (HMAC-SHA256).
 * Docs: https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
 */
function verifyWebhookSignature(
       xSignature: string | null,
       xRequestId: string | null,
       dataId: string,
       secret: string
): boolean {
       if (!xSignature || !secret) return false

       // Parse ts and v1 from x-signature header: "ts=xxx,v1=yyy"
       const parts: Record<string, string> = {}
       xSignature.split(',').forEach(part => {
              const [key, value] = part.trim().split('=')
              if (key && value) parts[key] = value
       })

       const ts = parts['ts']
       const v1 = parts['v1']
       if (!ts || !v1) return false

       // Build the manifest string as per MP docs
       const manifest = `id:${dataId};request-id:${xRequestId || ''};ts:${ts};`

       // Compute HMAC-SHA256
       const hmac = crypto.createHmac('sha256', secret)
       hmac.update(manifest)
       const computedHash = hmac.digest('hex')

       // Timing-safe comparison
       try {
              return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(computedHash))
       } catch {
              return false
       }
}

export async function POST(request: Request) {
       // 0. Read headers for signature verification
       const xSignature = request.headers.get('x-signature')
       const xRequestId = request.headers.get('x-request-id')
       const isRetry = request.headers.get('x-webhook-retry') === 'true'

       // 1. Parsing and validation
       const url = new URL(request.url)
       const clubId = url.searchParams.get('clubId')

       const bodyText = await request.text().catch(() => '')
       const body = bodyText ? JSON.parse(bodyText) : null
       if (!body || !body.data || !body.data.id) {
              return NextResponse.json({ status: 'ignored', reason: 'no data.id' })
       }

       // 2. Verify webhook signature (skip for retries and dev mode)
       if (!isRetry) {
              const webhookSecret = process.env.MP_WEBHOOK_SECRET
              if (webhookSecret) {
                     const isValid = verifyWebhookSignature(xSignature, xRequestId, String(body.data.id), webhookSecret)
                     if (!isValid) {
                            console.error('Webhook signature verification failed', { dataId: body.data.id })
                            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
                     }
              } else if (process.env.NODE_ENV === 'production') {
                     console.error('MP_WEBHOOK_SECRET no configurado — rechazando webhook en producción')
                     return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
              }
       }

       const { type, data } = body

       // Handle Subscription Preapproval Updates (topic: subscription_preapproval)
       // This handles status changes like cancellation or pausing
       if (type === 'subscription_preapproval') {
              if (!clubId) {
                     // CASE A: Platform (SaaS) subscription status change
                     try {
                            const platformAccessToken = process.env.MP_ACCESS_TOKEN
                            if (!platformAccessToken) return NextResponse.json({ status: 'ignored', reason: 'no platform token' })

                            const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
                            const preapproval = new PreApproval(client)
                            const subscription = await preapproval.get({ id: data.id })

                            if (subscription && subscription.external_reference) {
                                   const parts = subscription.external_reference.split(':')
                                   if (parts.length === 2) {
                                          const [refClubId] = parts
                                          await prisma.club.update({
                                                 where: { id: refClubId },
                                                 data: {
                                                        subscriptionStatus: subscription.status,
                                                        nextBillingDate: subscription.next_payment_date ? new Date(subscription.next_payment_date) : undefined
                                                 }
                                          })
                                   }
                            }
                     } catch (e) {
                            console.error("Error processing platform preapproval webhook:", e)
                     }
              } else {
                     // CASE B: Client membership subscription status change (cancelled/paused)
                     try {
                            const club = await prisma.club.findUnique({ where: { id: clubId } })
                            if (club?.mpAccessToken) {
                                   const { decrypt } = await import('@/lib/encryption')
                                   const token = decrypt(club.mpAccessToken)
                                   const client = new MercadoPagoConfig({ accessToken: token })
                                   const preapproval = new PreApproval(client)
                                   const subscription = await preapproval.get({ id: data.id })

                                   if (subscription && (subscription.status === 'cancelled' || subscription.status === 'paused')) {
                                          // Deactivate membership linked to this MP preapproval
                                          const updated = await prisma.membership.updateMany({
                                                 where: { mpPreapprovalId: String(data.id), status: 'ACTIVE' },
                                                 data: { status: 'CANCELLED' }
                                          })

                                          // Update client status if membership was deactivated
                                          if (updated.count > 0 && subscription.external_reference) {
                                                 const [refClubId, refClientId] = subscription.external_reference.split('___')
                                                 const clientId = Number(refClientId)
                                                 if (clientId && refClubId) {
                                                        await prisma.client.update({
                                                               where: { id_clubId: { id: clientId, clubId: refClubId } },
                                                               data: { membershipStatus: 'INACTIVE' }
                                                        })
                                                 }
                                          }
                                   }
                            }
                     } catch (e) {
                            console.error("Error processing client preapproval webhook:", e)
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

              // 4. Process Payments
              const externalRef = paymentInfo.external_reference || ''

              if (paymentInfo.status === 'approved') {
                     // --- LOGIC FOR SAAS SUBSCRIPTIONS (Platform) ---
                     if (isPlatform) {
                            // Format: clubId:planId
                            if (externalRef.includes(':')) {
                                   const [refClubId, refPlanId, cycle] = externalRef.split(':')

                                   // Verify Club exists
                                   const club = await prisma.club.findUnique({ where: { id: refClubId } })
                                   const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })

                                   if (club && plan) {
                                          const daysToAdd = cycle === 'yearly' ? 365 : 30
                                          const features = getPlanFeatures(plan.name)

                                          // Update Club Subscription + features
                                          await prisma.club.update({
                                                 where: { id: refClubId },
                                                 data: {
                                                        platformPlanId: refPlanId,
                                                        subscriptionStatus: 'authorized',
                                                        mpPreapprovalId: String(paymentInfo.order?.id || club.mpPreapprovalId),
                                                        nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
                                                        ...features
                                                 }
                                          })
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

                            if (clientId && refPlanId && refClubId) {
                                   try {
                                          // Validate plan belongs to this club
                                          const plan = await prisma.membershipPlan.findFirst({ where: { id: refPlanId, clubId: refClubId } })
                                          if (!plan) {
                                                 console.error(`Webhook: plan ${refPlanId} not found for club ${refClubId}`)
                                                 return NextResponse.json({ status: 'error', reason: 'plan not found' }, { status: 400 })
                                          }

                                          // Validate client belongs to this club
                                          const clientRecord = await prisma.client.findFirst({ where: { id: clientId, clubId: refClubId } })
                                          if (!clientRecord) {
                                                 console.error(`Webhook: client ${clientId} not found for club ${refClubId}`)
                                                 return NextResponse.json({ status: 'error', reason: 'client not found' }, { status: 400 })
                                          }

                                          // Idempotency: check if this MP payment was already processed
                                          const existingMembership = await prisma.membership.findFirst({
                                                 where: { mpPreapprovalId: String(paymentInfo.id) }
                                          })
                                          if (existingMembership) {
                                                 return NextResponse.json({ status: 'ok', msg: 'membership already processed' })
                                          }

                                          // Expire old active memberships for this client in this club
                                          await prisma.membership.updateMany({
                                                 where: { clientId, status: 'ACTIVE', plan: { clubId: refClubId } },
                                                 data: { status: 'CANCELLED' }
                                          })

                                          // New Membership
                                          const startDate = new Date()
                                          const endDate = new Date()
                                          endDate.setDate(endDate.getDate() + (plan.durationDays || 30))

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

                                          // Update Client Status (using compound key for tenant safety)
                                          await prisma.client.update({
                                                 where: { id_clubId: { id: clientId, clubId: refClubId } },
                                                 data: {
                                                        membershipStatus: 'ACTIVE',
                                                        membershipExpiresAt: endDate
                                                 }
                                          })

                                          // Register Transaction
                                          let cashRegister = await prisma.cashRegister.findFirst({
                                                 where: { clubId: refClubId, status: 'OPEN' },
                                                 orderBy: { openedAt: 'desc' }
                                          })

                                          if (!cashRegister) {
                                                 cashRegister = await prisma.cashRegister.create({
                                                        data: { clubId: refClubId, status: 'OPEN', startAmount: 0 }
                                                 })
                                          }

                                          if (cashRegister) {
                                                 await prisma.transaction.create({
                                                        data: {
                                                               clubId: refClubId,
                                                               cashRegisterId: cashRegister.id,
                                                               clientId,
                                                               type: 'INCOME',
                                                               category: 'MEMBERSHIP_FEE',
                                                               amount: transactionAmount,
                                                               method: 'MERCADOPAGO_SUB',
                                                               description: `Suscripción MP #${paymentInfo.id} - ${plan.name}`,
                                                        }
                                                 })
                                          }

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
                            const booking = await prisma.booking.findUnique({
                                   where: { id: bookingId },
                                   include: { transactions: true, items: true }
                            })

                            if (!booking) {
                                   return NextResponse.json({ status: 'ok', msg: 'booking not found' })
                            }

                            // Check for Idempotency (avoid processing same MP payment twice)
                            const txDescription = `Pago MP #${data.id} - Reserva #${bookingId}`
                            const alreadyProcessed = booking.transactions.some(t => t.description === txDescription)

                            if (booking.paymentStatus !== 'PAID' && !alreadyProcessed) {

                                   // Determine status correctly accumulating previous payments
                                   const totalPaidBefore = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
                                   const itemsTotal = booking.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                                   const totalCost = booking.price + itemsTotal

                                   const isFullPayment = (totalPaidBefore + transactionAmount) >= totalCost
                                   const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL'

                                   // Find or Auto-Create Open Cash Register
                                   let cashRegister = await prisma.cashRegister.findFirst({
                                          where: { clubId: booking.clubId, status: 'OPEN' },
                                          orderBy: { openedAt: 'desc' }
                                   })

                                   if (!cashRegister) {
                                          cashRegister = await prisma.cashRegister.create({
                                                 data: { clubId: booking.clubId, status: 'OPEN', startAmount: 0 }
                                          })
                                   }

                                   await prisma.$transaction([
                                          prisma.booking.update({
                                                 where: { id: bookingId },
                                                 data: {
                                                        status: 'CONFIRMED',
                                                        paymentStatus: newPaymentStatus,
                                                 }
                                          }),
                                          prisma.transaction.create({
                                                 data: {
                                                        cashRegisterId: cashRegister.id,
                                                        type: 'INCOME',
                                                        category: 'BOOKING_DEPOSIT',
                                                        amount: transactionAmount,
                                                        method: 'MERCADOPAGO',
                                                        description: txDescription,
                                                        bookingId: bookingId,
                                                 }
                                          })
                                   ])
                            }
                     }
              } else if (paymentInfo.status === 'refunded' || paymentInfo.status === 'charged_back') {
                     // HANDLE REFUNDS OR CHARGEBACKS
                     const bookingId = Number(externalRef)
                     if (bookingId && !isNaN(bookingId) && clubId) {
                            const transactionAmount = paymentInfo.transaction_amount || 0

                            const booking = await prisma.booking.findUnique({
                                   where: { id: bookingId },
                                   include: { transactions: true, items: true }
                            })

                            if (booking) {
                                   const refundDescription = `Reembolso/Contracargo MP #${data.id} - Reserva #${bookingId}`
                                   const alreadyRefunded = booking.transactions.some(t => t.description === refundDescription)

                                   if (!alreadyRefunded) {
                                          let cashRegister = await prisma.cashRegister.findFirst({
                                                 where: { clubId: booking.clubId, status: 'OPEN' },
                                                 orderBy: { openedAt: 'desc' }
                                          })

                                          if (!cashRegister) {
                                                 cashRegister = await prisma.cashRegister.create({
                                                        data: { clubId: booking.clubId, status: 'OPEN', startAmount: 0 }
                                                 })
                                          }

                                          const totalPaidBefore = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
                                          const newTotalPaid = totalPaidBefore - transactionAmount
                                          const newPaymentStatus = newTotalPaid > 0 ? 'PARTIAL' : 'UNPAID'

                                          await prisma.$transaction([
                                                 prisma.booking.update({
                                                        where: { id: bookingId },
                                                        data: { paymentStatus: newPaymentStatus }
                                                 }),
                                                 prisma.transaction.create({
                                                        data: {
                                                               cashRegisterId: cashRegister.id,
                                                               type: 'EXPENSE',
                                                               category: 'REFUND',
                                                               amount: transactionAmount,  // Negative ensures totalPaid formulas deduct it
                                                               method: 'MERCADOPAGO',
                                                               description: refundDescription,
                                                               bookingId: bookingId,
                                                        }
                                                 })
                                          ])
                                   }
                            }
                     }
              }

              return NextResponse.json({ status: 'ok' })

       } catch (error: unknown) {
              console.error("Webhook Internal Error:", error)

              // Queue for retry (unless this is already a retry)
              if (!isRetry) {
                     try {
                            await prisma.webhookQueue.create({
                                   data: {
                                          payload: bodyText,
                                          queryParams: clubId ? `?clubId=${clubId}` : null,
                                          lastError: error instanceof Error ? error.message : 'Unknown error',
                                          nextRetryAt: new Date(Date.now() + 30_000), // First retry in 30 seconds
                                   }
                            })
                            console.log(`📋 Webhook queued for retry: ${body?.data?.id}`)
                     } catch (queueError) {
                            console.error("Failed to queue webhook for retry:", queueError)
                     }
              }

              return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
       }
}
