'use server'

import prisma from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { fromUTC } from '@/lib/date-utils'
import { getClubPaymentAdapter } from '@/lib/payment'

export async function createPreference(bookingId: number, redirectPath: string = '/reservar', customAmount?: number) {
       try {
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: { club: true, court: true }
              })

              if (!booking) throw new Error("Reserva no encontrada")
              const club = booking.club

              if (!club.mpAccessToken) throw new Error("El club no tiene configurado Mercado Pago")
              const accessToken = decrypt(club.mpAccessToken)

              let amountToPay = customAmount && customAmount > 0 ? customAmount : 0

              if (amountToPay === 0) {
                     const deposit = club.bookingDeposit || 0
                     amountToPay = deposit > 0 ? deposit : booking.price
              }

              if (amountToPay <= 0) throw new Error("El monto a cobrar es inválido")

              const adapter = getClubPaymentAdapter('mercadopago', accessToken)
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

              const isPartial = amountToPay < booking.price
              const title = isPartial ? `Seña Reserva - ${booking.court.name}` : `Reserva Total - ${booking.court.name}`

              const result = await adapter.createBookingCheckout({
                     bookingId: booking.id,
                     title,
                     description: `Fecha: ${fromUTC(booking.startTime).toLocaleDateString('es-AR')}`,
                     amount: amountToPay,
                     currency: club.currency || 'ARS',
                     clubId: club.id,
                     redirectPath,
                     baseUrl
              })

              return { success: true, init_point: result.checkoutUrl, preferenceId: result.id }
       } catch (error: unknown) {
              console.error("Error creating payment preference:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function createSubscriptionPreference(
	clubId: string,
	planName: string,
	price: number,
	payerEmail: string,
	externalRef: string,
	frequency: number = 1,
	frequencyType: string = 'months'
) {
	try {
		const platformAccessToken = process.env.MP_ACCESS_TOKEN
		if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

		const club = await prisma.club.findUnique({ where: { id: clubId } })
		if (!club) throw new Error("Club no encontrado")

		const { MercadoPagoConfig, PreApproval } = await import('mercadopago')
		const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
		const preapproval = new PreApproval(client)

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const backUrl = `${baseUrl}/dashboard/suscripcion/status`

		const billingPeriod = frequencyType === 'years' ? 'anual' : 'mensual'

		const requestBody = {
			reason: `CourtOps ${planName} - ${billingPeriod}`,
			auto_recurring: {
				frequency: frequency,
				frequency_type: frequencyType,
				transaction_amount: Number(price),
				currency_id: 'ARS'
			},
			back_url: backUrl,
			payer_email: payerEmail?.trim(),
			external_reference: externalRef
		}

		const response = await preapproval.create({
			body: requestBody
		})

		return { success: true, init_point: response.init_point, id: response.id }
	} catch (error: unknown) {
		console.error("MP Subscription Error:", error)

		let debugInfo = 'Error interno de Mercado Pago'
		const err = error as { cause?: unknown; message?: string }
		if (err.cause && Array.isArray(err.cause)) {
			debugInfo = err.cause.map((e: { description?: string; code?: string }) => e.description || e.code).join(', ')
		} else if (err.message) {
			debugInfo = err.message
		}

		return { success: false, error: debugInfo }
	}
}

export async function getSubscription(id: string) {
       try {
              const platformAccessToken = process.env.MP_ACCESS_TOKEN
              if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

              const { MercadoPagoConfig, PreApproval } = await import('mercadopago')
              const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
              const preapproval = new PreApproval(client)

              const response = await preapproval.get({ id })
              return response
       } catch (error) {
              console.error("Error fetching subscription:", error)
              return null
       }
}

export async function cancelSubscriptionMP(id: string) {
       try {
              const platformAccessToken = process.env.MP_ACCESS_TOKEN
              if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

              const { MercadoPagoConfig, PreApproval } = await import('mercadopago')
              const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
              const preapproval = new PreApproval(client)

              const response = await preapproval.update({
                     id,
                     body: {
                            status: 'cancelled'
                     }
              })
              return { success: true, data: response }
       } catch (error: unknown) {
              console.error("Error cancelling subscription in MP:", error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}
