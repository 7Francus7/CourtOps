import Stripe from 'stripe'
import type { PaymentProviderAdapter, CheckoutResult, SubscriptionCheckoutResult, SubscriptionStatus } from './types'

export class StripeAdapter implements PaymentProviderAdapter {
  private stripe: Stripe

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })
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
            unit_amount: Math.round(params.amount * 100), // Stripe uses cents
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
    // If a Stripe Price ID exists, use it directly (recurring subscription)
    if (params.stripePriceId) {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: params.payerEmail,
        metadata: {
          clubId: params.clubId,
          externalRef: params.externalRef,
          type: 'subscription',
        },
        success_url: `${params.backUrl}?session_id={CHECKOUT_SESSION_ID}&status=authorized`,
        cancel_url: `${params.backUrl}?status=cancelled`,
      })

      return {
        checkoutUrl: session.url!,
        id: session.id,
      }
    }

    // Fallback: create a one-time payment for the subscription amount
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ars',
            product_data: {
              name: `Suscripción ${params.planName} - CourtOps`,
            },
            unit_amount: Math.round(params.price * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: params.payerEmail,
      metadata: {
        clubId: params.clubId,
        externalRef: params.externalRef,
        type: 'subscription',
      },
      success_url: `${params.backUrl}?session_id={CHECKOUT_SESSION_ID}&status=authorized`,
      cancel_url: `${params.backUrl}?status=cancelled`,
    })

    return {
      checkoutUrl: session.url!,
      id: session.id,
    }
  }

  async getSubscriptionStatus(id: string): Promise<SubscriptionStatus | null> {
    try {
      // If it's a checkout session ID, retrieve it
      if (id.startsWith('cs_')) {
        const session = await this.stripe.checkout.sessions.retrieve(id)
        return {
          status: session.payment_status === 'paid' ? 'authorized' : session.payment_status,
          externalReference: (session.metadata?.externalRef) || '',
        }
      }

      // If it's a subscription ID
      if (id.startsWith('sub_')) {
        const subscription = await this.stripe.subscriptions.retrieve(id)
        const statusMap: Record<string, string> = {
          active: 'authorized',
          past_due: 'pending',
          canceled: 'cancelled',
          unpaid: 'pending',
        }
        return {
          status: statusMap[subscription.status] || subscription.status,
          nextPaymentDate: (subscription as any).current_period_end
            ? new Date((subscription as any).current_period_end * 1000).toISOString()
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
}
