import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago'
import type { PaymentProviderAdapter, CheckoutResult, SubscriptionCheckoutResult, SubscriptionStatus } from './types'

export class MercadoPagoAdapter implements PaymentProviderAdapter {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
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
    const client = new MercadoPagoConfig({ accessToken: this.accessToken })
    const preference = new Preference(client)

    const successUrl = `${params.baseUrl}${params.redirectPath}`
    const failureUrl = `${params.baseUrl}${params.redirectPath}?status=failure`
    const pendingUrl = `${params.baseUrl}${params.redirectPath}?status=pending`

    const response = await preference.create({
      body: {
        items: [
          {
            id: String(params.bookingId),
            title: params.title,
            description: params.description,
            quantity: 1,
            unit_price: params.amount,
            currency_id: params.currency,
            category_id: 'others'
          }
        ],
        external_reference: String(params.bookingId),
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        },
        notification_url: `${params.baseUrl}/api/webhooks/mercadopago?clubId=${params.clubId}`,
        auto_return: 'approved',
        statement_descriptor: 'COURTOPS',
        shipments: {
          mode: 'not_specified'
        }
      }
    })

    return {
      checkoutUrl: response.init_point!,
      id: response.id!
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
  }): Promise<SubscriptionCheckoutResult> {
    const client = new MercadoPagoConfig({ accessToken: this.accessToken })
    const preapproval = new PreApproval(client)

    const response = await preapproval.create({
      body: {
        reason: `Suscripción ${params.planName} (${params.frequency} ${params.frequencyType}) - CourtOps`,
        auto_recurring: {
          frequency: params.frequency,
          frequency_type: params.frequencyType,
          transaction_amount: Number(params.price),
          currency_id: 'ARS'
        },
        back_url: params.backUrl,
        payer_email: params.payerEmail?.trim(),
        external_reference: params.externalRef
      }
    })

    return {
      checkoutUrl: response.init_point!,
      id: response.id!
    }
  }

  async getSubscriptionStatus(id: string): Promise<SubscriptionStatus | null> {
    try {
      const client = new MercadoPagoConfig({ accessToken: this.accessToken })
      const preapproval = new PreApproval(client)
      const response = await preapproval.get({ id })

      return {
        status: response.status || 'unknown',
        nextPaymentDate: response.next_payment_date || null,
        externalReference: response.external_reference || ''
      }
    } catch (error) {
      console.error('Error fetching MP subscription:', error)
      return null
    }
  }

  async cancelSubscription(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const client = new MercadoPagoConfig({ accessToken: this.accessToken })
      const preapproval = new PreApproval(client)
      await preapproval.update({ id, body: { status: 'cancelled' } })
      return { success: true }
    } catch (error) {
      console.error('Error cancelling MP subscription:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}
