'use server'

import prisma from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { fromUTC } from '@/lib/date-utils'
import { getClubPaymentAdapter } from '@/lib/payment'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createPreference(bookingId: number, redirectPath: string = '/reservar', customAmount?: number) {
       try {
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: { club: true, court: true }
              })

              if (!booking) throw new Error("Reserva no encontrada")

              // If there is an active session, enforce that the booking belongs to the caller's club.
              // Public pages (no session) are allowed but the booking must be in a payable state.
              const session = await getServerSession(authOptions)
              if (session?.user?.clubId) {
                     if (booking.clubId !== session.user.clubId) {
                            throw new Error("No autorizado")
                     }
              } else {
                     // Public context: only allow payment for non-cancelled bookings
                     if (booking.status === 'CANCELED' || booking.status === 'CANCELLED') {
                            throw new Error("La reserva fue cancelada y no puede procesarse")
                     }
              }

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

              const localStart = fromUTC(booking.startTime)
              const day = String(localStart.getUTCDate()).padStart(2, '0')
              const month = String(localStart.getUTCMonth() + 1).padStart(2, '0')
              const year = localStart.getUTCFullYear()
              const hours = String(localStart.getUTCHours()).padStart(2, '0')
              const minutes = String(localStart.getUTCMinutes()).padStart(2, '0')
              const dateStr = `${day}/${month}/${year} ${hours}:${minutes}hs`

              const isPartial = amountToPay < booking.price
              const typeLabel = isPartial ? 'Seña' : 'Pago total'
              const title = `${club.name} - ${typeLabel}`
              const description = `${booking.court.name} · ${dateStr}`

              const result = await adapter.createBookingCheckout({
                     bookingId: booking.id,
                     title,
                     description,
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
	frequencyType: string = 'months',
	startDate?: Date
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

		const billingPeriod = frequency === 12 ? 'anual' : 'mensual'

		const requestBody = {
			reason: `CourtOps ${planName} - ${billingPeriod}`,
			auto_recurring: {
				frequency: frequency,
				frequency_type: frequencyType,
				transaction_amount: Number(price),
				currency_id: 'ARS',
				...(startDate ? { start_date: startDate.toISOString() } : {}),
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

export async function createSetupFeePreference(
	clubId: string,
	planName: string,
	setupFee: number,
	payerEmail: string,
	externalRef: string
) {
	try {
		const platformAccessToken = process.env.MP_ACCESS_TOKEN
		if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

		const { MercadoPagoConfig, Preference } = await import('mercadopago')
		const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
		const preference = new Preference(client)

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const statusUrl = `${baseUrl}/dashboard/suscripcion/status?setup=1`

		const response = await preference.create({
			body: {
				items: [
					{
						id: externalRef,
						title: `Alta CourtOps - ${planName}`,
						description: 'Pago único inicial. Incluye el primer mes bonificado.',
						quantity: 1,
						unit_price: Number(setupFee),
						currency_id: 'ARS',
						category_id: 'services',
					},
				],
				external_reference: externalRef,
				back_urls: {
					success: statusUrl,
					failure: `${statusUrl}&status=failure`,
					pending: `${statusUrl}&status=pending`,
				},
				notification_url: `${baseUrl}/api/webhooks/mercadopago`,
				auto_return: 'approved',
				statement_descriptor: 'COURTOPS',
			},
		})

		return { success: true, init_point: response.init_point, id: response.id }
	} catch (error: unknown) {
		console.error("MP Setup Fee Error:", error)

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

export async function getPlatformPayment(id: string) {
	try {
		const platformAccessToken = process.env.MP_ACCESS_TOKEN
		if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

		const { MercadoPagoConfig, Payment } = await import('mercadopago')
		const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
		const payment = new Payment(client)

		return await payment.get({ id })
	} catch (error) {
		console.error("Error fetching platform payment:", error)
		return null
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
