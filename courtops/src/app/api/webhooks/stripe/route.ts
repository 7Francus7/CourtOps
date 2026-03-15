import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { getPlanFeatures } from '@/lib/plan-features'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured')
  return new Stripe(key)
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  if (webhookSecret && sig) {
    try {
      const stripe = getStripe()
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  } else {
    // Dev mode — parse event without verification
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
  }

  try {
    switch (event.type) {
      // --- CHECKOUT COMPLETED ---
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}

        if (metadata.type === 'booking') {
          await handleBookingPayment(session, metadata)
        } else if (metadata.type === 'subscription') {
          await handleSubscriptionCheckoutCompleted(session, metadata)
        }
        break
      }

      // --- SUBSCRIPTION LIFECYCLE ---
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
        break
      }

      // --- PAYMENT FAILURES ---
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      // --- REFUNDS ---
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        break
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ─── BOOKING PAYMENT ─────────────────────────────────────────

async function handleBookingPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const bookingId = Number(metadata.bookingId)
  const clubId = metadata.clubId
  if (!bookingId || isNaN(bookingId) || !clubId) return

  const transactionAmount = (session.amount_total || 0) / 100

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { transactions: true, items: true },
  })
  if (!booking) return

  // Idempotency
  const txDescription = `Pago Stripe #${session.id} - Reserva #${bookingId}`
  const alreadyProcessed = booking.transactions.some(t => t.description === txDescription)
  if (booking.paymentStatus === 'PAID' || alreadyProcessed) return

  const totalPaidBefore = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
  const itemsTotal = booking.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const totalCost = booking.price + itemsTotal
  const isFullPayment = totalPaidBefore + transactionAmount >= totalCost
  const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL'

  let cashRegister = await prisma.cashRegister.findFirst({
    where: { clubId: booking.clubId, status: 'OPEN' },
    orderBy: { openedAt: 'desc' },
  })
  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({
      data: { clubId: booking.clubId, status: 'OPEN', startAmount: 0 },
    })
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', paymentStatus: newPaymentStatus },
    }),
    prisma.transaction.create({
      data: {
        cashRegisterId: cashRegister.id,
        clubId: booking.clubId,
        type: 'INCOME',
        category: 'BOOKING_DEPOSIT',
        amount: transactionAmount,
        method: 'STRIPE',
        description: txDescription,
        bookingId,
      },
    }),
  ])
}

// ─── SUBSCRIPTION CHECKOUT COMPLETED ─────────────────────────

async function handleSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const externalRef = metadata.externalRef || ''
  const parts = externalRef.split(':')
  if (parts.length < 2) return

  const [refClubId, refPlanId, cycle] = parts

  const club = await prisma.club.findUnique({ where: { id: refClubId } })
  const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
  if (!club || !plan) return

  // Extract real subscription ID from session
  const stripeSubId = session.subscription
    ? (typeof session.subscription === 'string' ? session.subscription : session.subscription.id)
    : null

  // Extract customer ID
  const stripeCustomerId = session.customer
    ? (typeof session.customer === 'string' ? session.customer : session.customer.id)
    : null

  const features = getPlanFeatures(plan.name)

  await prisma.club.update({
    where: { id: refClubId },
    data: {
      platformPlanId: refPlanId,
      subscriptionStatus: 'authorized',
      stripeSubscriptionId: stripeSubId,
      stripeCustomerId,
      ...features,
    },
  })
}

// ─── SUBSCRIPTION UPDATED (renewal, status change) ───────────

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  // Find club by subscription ID
  let club = await prisma.club.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  // Also try by customer ID (for newly created subscriptions not yet linked)
  if (!club && subscription.customer) {
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id
    club = await prisma.club.findFirst({
      where: { stripeCustomerId: customerId },
    })
  }

  if (!club) return

  const statusMap: Record<string, string> = {
    active: 'authorized',
    past_due: 'pending',
    canceled: 'cancelled',
    unpaid: 'pending',
    trialing: 'TRIAL',
    incomplete: 'pending',
    incomplete_expired: 'cancelled',
    paused: 'paused',
  }

  // Get next billing date from subscription item
  const firstItem = subscription.items?.data?.[0]
  const periodEnd = firstItem?.current_period_end

  await prisma.club.update({
    where: { id: club.id },
    data: {
      subscriptionStatus: statusMap[subscription.status] || subscription.status,
      stripeSubscriptionId: subscription.id,
      nextBillingDate: periodEnd ? new Date(periodEnd * 1000) : undefined,
    },
  })
}

// ─── SUBSCRIPTION CANCELLED ──────────────────────────────────

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const club = await prisma.club.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })
  if (!club) return

  await prisma.club.update({
    where: { id: club.id },
    data: {
      subscriptionStatus: 'cancelled',
      stripeSubscriptionId: null,
    },
  })
}

// ─── PAYMENT FAILED (invoice) ────────────────────────────────

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const sub = invoice.parent?.subscription_details?.subscription
  const subId = sub
    ? (typeof sub === 'string' ? sub : sub.id)
    : null

  if (!subId) return

  const club = await prisma.club.findFirst({
    where: { stripeSubscriptionId: subId },
  })
  if (!club) return

  await prisma.club.update({
    where: { id: club.id },
    data: { subscriptionStatus: 'pending' },
  })

  // TODO: send email notification via Resend about failed payment
  console.warn(`[Stripe] Payment failed for club ${club.id} (sub: ${subId})`)
}

// ─── REFUND ──────────────────────────────────────────────────

async function handleRefund(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  const existingTx = await prisma.transaction.findFirst({
    where: {
      method: 'STRIPE',
      description: { contains: paymentIntentId },
    },
    include: { booking: true },
  })

  if (!existingTx || !existingTx.bookingId) return

  const refundAmount = (charge.amount_refunded || 0) / 100
  const refundDescription = `Reembolso Stripe #${charge.id} - Reserva #${existingTx.bookingId}`

  // Idempotency
  const alreadyRefunded = await prisma.transaction.findFirst({
    where: { description: refundDescription },
  })
  if (alreadyRefunded) return

  const booking = await prisma.booking.findUnique({
    where: { id: existingTx.bookingId },
    include: { transactions: true },
  })
  if (!booking) return

  let cashRegister = await prisma.cashRegister.findFirst({
    where: { clubId: booking.clubId, status: 'OPEN' },
    orderBy: { openedAt: 'desc' },
  })
  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({
      data: { clubId: booking.clubId, status: 'OPEN', startAmount: 0 },
    })
  }

  const totalPaidBefore = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
  const newTotalPaid = totalPaidBefore - refundAmount
  const newPaymentStatus = newTotalPaid > 0 ? 'PARTIAL' : 'UNPAID'

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: newPaymentStatus },
    }),
    prisma.transaction.create({
      data: {
        cashRegisterId: cashRegister.id,
        clubId: booking.clubId,
        type: 'EXPENSE',
        category: 'REFUND',
        amount: refundAmount,
        method: 'STRIPE',
        description: refundDescription,
        bookingId: booking.id,
      },
    }),
  ])
}
