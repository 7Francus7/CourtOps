import Stripe from 'stripe'
import type { PaymentProviderAdapter, CheckoutResult, SubscriptionCheckoutResult, SubscriptionStatus } from './types'

export class StripeAdapter implements PaymentProviderAdapter {
  private stripe: Stripe

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey)
  }

  async createBookingCheckout(params: {
    bookingId: number
    title: string
    description: string
    amount: number
    currency: string
    clubId: string
    redirectPath: string
    baseUrl: string
  }): Promise<CheckoutResult> {
    const successUrl = `${params.baseUrl}${params.redirectPath}?status=approved&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${params.baseUrl}${params.redirectPath}?status=failure`

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.title,
              description: params.description,
            },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: String(params.bookingId),
        clubId: params.clubId,
        type: 'booking',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return {
      checkoutUrl: session.url!,
      id: session.id,
    }
  }

  async createSubscriptionCheckout(params: {
    clubId: string
    planName: string
    price: number
    payerEmail: string
    externalRef: string
    frequency: number
    frequencyType: string
    backUrl: string
    stripePriceId?: string
  }): Promise<SubscriptionCheckoutResult> {
    // Find or create a Stripe customer so payment methods persist
    const customers = await this.stripe.customers.list({
      email: params.payerEmail,
      limit: 1,
    })
    const customer = customers.data[0]
      || await this.stripe.customers.create({
        email: params.payerEmail,
        metadata: { clubId: params.clubId },
      })

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      metadata: {
        clubId: params.clubId,
        externalRef: params.externalRef,
        type: 'subscription',
      },
      success_url: `${params.backUrl}?session_id={CHECKOUT_SESSION_ID}&status=authorized`,
      cancel_url: `${params.backUrl}?status=cancelled`,
    }

    if (params.stripePriceId) {
      // Use pre-created Stripe Price (proper recurring subscription)
      sessionParams.mode = 'subscription'
      sessionParams.line_items = [{ price: params.stripePriceId, quantity: 1 }]
    } else {
      // Auto-create a recurring price on the fly
      sessionParams.mode = 'subscription'
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'ars',
            product_data: {
              name: `CourtOps ${params.planName}`,
              description: `Suscripción ${params.frequency === 12 ? 'anual' : 'mensual'} al plan ${params.planName}`,
            },
            unit_amount: Math.round(params.price * 100),
            recurring: {
              interval: params.frequency === 12 ? 'year' : 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ]
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams)

    return {
      checkoutUrl: session.url!,
      id: session.id,
    }
  }

  async getSubscriptionStatus(id: string): Promise<SubscriptionStatus | null> {
    try {
      // Checkout session — resolve subscription from it
      if (id.startsWith('cs_')) {
        const session = await this.stripe.checkout.sessions.retrieve(id)

        // If the session created a real subscription, return that status
        if (session.subscription) {
          const subId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id
          return this.getSubscriptionStatus(subId)
        }

        return {
          status: session.payment_status === 'paid' ? 'authorized' : session.payment_status,
          externalReference: session.metadata?.externalRef || '',
        }
      }

      // Real Stripe subscription
      if (id.startsWith('sub_')) {
        const subscription = await this.stripe.subscriptions.retrieve(id, {
          expand: ['items.data'],
        })
        const statusMap: Record<string, string> = {
          active: 'authorized',
          past_due: 'pending',
          canceled: 'cancelled',
          unpaid: 'pending',
          trialing: 'TRIAL',
        }

        // In Stripe SDK v20+, current_period_end is on SubscriptionItem
        const firstItem = subscription.items?.data?.[0]
        const periodEnd = firstItem?.current_period_end

        return {
          status: statusMap[subscription.status] || subscription.status,
          externalReference: subscription.metadata?.externalRef || '',
          nextPaymentDate: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error)
      return null
    }
  }

  async cancelSubscription(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (id.startsWith('sub_')) {
        await this.stripe.subscriptions.cancel(id)
      }
      return { success: true }
    } catch (error) {
      console.error('Error cancelling Stripe subscription:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update an existing subscription to a new price (plan change).
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!subscriptionId.startsWith('sub_')) {
        return { success: false, error: 'Invalid subscription ID' }
      }

      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
      const itemId = subscription.items.data[0]?.id

      if (!itemId) {
        return { success: false, error: 'No subscription item found' }
      }

      await this.stripe.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: 'create_prorations',
      })

      return { success: true }
    } catch (error) {
      console.error('Error updating Stripe subscription:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
