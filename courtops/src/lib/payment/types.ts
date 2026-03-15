/**
 * Payment Provider Abstraction Layer
 * Primary: MercadoPago
 * Prepared for future providers (Payway, MODO, etc.)
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

  createSubscriptionCheckout(params: {
    clubId: string
    planName: string
    price: number
    payerEmail: string
    externalRef: string
    frequency: number
    frequencyType: string
    backUrl: string
  }): Promise<SubscriptionCheckoutResult>

  getSubscriptionStatus(id: string): Promise<SubscriptionStatus | null>

  cancelSubscription(id: string): Promise<{ success: boolean; error?: string }>
}

export type PaymentProviderType = 'mercadopago'
// Future: | 'payway' | 'modo'
