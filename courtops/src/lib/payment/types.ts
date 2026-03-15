/**
 * Payment Provider Abstraction Layer
 * Supports MercadoPago and Stripe as payment processors.
 */

export interface CheckoutResult {
  checkoutUrl: string
  id: string
}

export interface SubscriptionCheckoutResult {
  checkoutUrl: string
  id: string
}

export interface SubscriptionStatus {
  status: string
  nextPaymentDate?: string | null
  externalReference?: string
}

export interface PaymentProviderAdapter {
  /**
   * Create a checkout session for booking deposits/payments.
   */
  createBookingCheckout(params: {
    bookingId: number
    title: string
    description: string
    amount: number
    currency: string
    clubId: string
    redirectPath: string
    baseUrl: string
  }): Promise<CheckoutResult>

  /**
   * Create a checkout session for SaaS subscriptions.
   */
  createSubscriptionCheckout(params: {
    clubId: string
    planName: string
    price: number
    payerEmail: string
    externalRef: string
    frequency: number
    frequencyType: string
    backUrl: string
    stripePriceId?: string
  }): Promise<SubscriptionCheckoutResult>

  /**
   * Get subscription status by ID.
   */
  getSubscriptionStatus(id: string): Promise<SubscriptionStatus | null>

  /**
   * Cancel a subscription.
   */
  cancelSubscription(id: string): Promise<{ success: boolean; error?: string }>
}

export type PaymentProviderType = 'mercadopago' | 'stripe'
