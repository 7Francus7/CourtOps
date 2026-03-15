import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { getPlanFeatures } from '@/lib/plan-features'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  // Verify webhook signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('STRIPE_WEBHOOK_SECRET not configured in production!')
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata || {}

        if (metadata.type === 'booking') {
          await handleBookingPayment(session, metadata)
        } else if (metadata.type === 'subscription') {
          await handleSubscriptionPayment(session, metadata)
        }
        break
      }

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

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        // Unhandled event type
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

/**
 * Handle booking payment from Stripe Checkout
 */
async function handleBookingPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const bookingId = Number(metadata.bookingId)
  const clubId = metadata.clubId

  if (!bookingId || isNaN(bookingId) || !clubId) return

  const transactionAmount = (session.amount_total || 0) / 100 // Stripe uses cents

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { transactions: true, items: true },
  })

  if (!booking) return

  // Idempotency check
  const txDescription = `Pago Stripe #${session.id} - Reserva #${bookingId}`
  const alreadyProcessed = booking.transactions.some(t => t.description === txDescription)

  if (booking.paymentStatus !== 'PAID' && !alreadyProcessed) {
    const totalPaidBefore = booking.transactions.reduce((sum, t) => sum + t.amount, 0)
    const itemsTotal = booking.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
    const totalCost = booking.price + itemsTotal
    const isFullPayment = totalPaidBefore + transactionAmount >= totalCost
    const newPaymentStatus = isFullPayment ? 'PAID' : 'PARTIAL'

    // Find or auto-create open cash register
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
        data: {
          status: 'CONFIRMED',
          paymentStatus: newPaymentStatus,
        },
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
          bookingId: bookingId,
        },
      }),
    ])
  }
}

/**
 * Handle SaaS subscription payment from Stripe Checkout
 */
async function handleSubscriptionPayment(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const externalRef = metadata.externalRef || ''
  if (!externalRef.includes(':')) return

  const [refClubId, refPlanId, cycle] = externalRef.split(':')

  const club = await prisma.club.findUnique({ where: { id: refClubId } })
  const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })

  if (club && plan) {
    const daysToAdd = cycle === 'yearly' ? 365 : 30
    const features = getPlanFeatures(plan.name)

    await prisma.club.update({
      where: { id: refClubId },
      data: {
        platformPlanId: refPlanId,
        subscriptionStatus: 'authorized',
        stripeSubscriptionId: session.subscription
          ? String(session.subscription)
          : session.id,
        stripeCustomerId: session.customer ? String(session.customer) : undefined,
        nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
        ...features,
      },
    })
  }
}

/**
 * Handle subscription status updates from Stripe
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const club = await prisma.club.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!club) return

  const statusMap: Record<string, string> = {
    active: 'authorized',
    past_due: 'pending',
    canceled: 'cancelled',
    unpaid: 'pending',
    trialing: 'TRIAL',
  }

  await prisma.club.update({
    where: { id: club.id },
    data: {
      subscriptionStatus: statusMap[subscription.status] || subscription.status,
      nextBillingDate: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
    },
  })
}

/**
 * Handle subscription cancellation from Stripe
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const club = await prisma.club.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!club) return

  await prisma.club.update({
    where: { id: club.id },
    data: {
      subscriptionStatus: 'cancelled',
    },
  })
}

/**
 * Handle refunds from Stripe
 */
async function handleRefund(charge: Stripe.Charge) {
  // Try to find a booking via the payment intent metadata
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  // Look for a transaction with this Stripe session
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

  // Idempotency check
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
