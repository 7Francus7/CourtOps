import type { PaymentProviderAdapter, PaymentProviderType } from './types'
import { MercadoPagoAdapter } from './mercadopago-adapter'
import { StripeAdapter } from './stripe-adapter'

export type { PaymentProviderAdapter, PaymentProviderType } from './types'

/**
 * Factory: returns the correct adapter for a club's payment provider.
 */
export function getClubPaymentAdapter(
  provider: PaymentProviderType,
  accessToken: string
): PaymentProviderAdapter {
  switch (provider) {
    case 'stripe':
      return new StripeAdapter(accessToken)
    case 'mercadopago':
    default:
      return new MercadoPagoAdapter(accessToken)
  }
}

/**
 * Factory: returns the adapter for platform-level operations (SaaS subscriptions).
 * Uses env vars to determine provider and credentials.
 */
export function getPlatformPaymentAdapter(): { adapter: PaymentProviderAdapter; provider: PaymentProviderType } {
  const provider = (process.env.PLATFORM_PAYMENT_PROVIDER || 'mercadopago') as PaymentProviderType

  if (provider === 'stripe') {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) throw new Error('STRIPE_SECRET_KEY no configurada')
    return { adapter: new StripeAdapter(secretKey), provider }
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado')
  return { adapter: new MercadoPagoAdapter(accessToken), provider }
}
