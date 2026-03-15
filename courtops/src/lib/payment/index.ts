import type { PaymentProviderAdapter, PaymentProviderType } from './types'
import { MercadoPagoAdapter } from './mercadopago-adapter'

export type { PaymentProviderAdapter, PaymentProviderType } from './types'

/**
 * Factory: returns the correct adapter for a club's payment provider.
 */
export function getClubPaymentAdapter(
  provider: PaymentProviderType,
  accessToken: string
): PaymentProviderAdapter {
  switch (provider) {
    case 'mercadopago':
    default:
      return new MercadoPagoAdapter(accessToken)
  }
}

/**
 * Factory: returns the adapter for platform-level operations (SaaS subscriptions).
 * Uses env vars for credentials.
 */
export function getPlatformPaymentAdapter(): { adapter: PaymentProviderAdapter; provider: PaymentProviderType } {
  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN no configurado')
  return { adapter: new MercadoPagoAdapter(accessToken), provider: 'mercadopago' }
}
