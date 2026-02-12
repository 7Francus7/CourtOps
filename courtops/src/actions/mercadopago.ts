'use server'

import { MercadoPagoConfig, Preference, PreApproval } from 'mercadopago'
import prisma from '@/lib/db'

import { decrypt } from '@/lib/encryption'

// ... existing imports

export async function createPreference(bookingId: number, redirectPath: string = '/reservar', customAmount?: number) {
       try {
              // 1. Get Booking and Club
              const booking = await prisma.booking.findUnique({
                     where: { id: bookingId },
                     include: {
                            club: true,
                            court: true
                     }
              })

              if (!booking) throw new Error("Reserva no encontrada")
              const club = booking.club

              if (!club.mpAccessToken) throw new Error("El club no tiene configurado Mercado Pago")

              const accessToken = decrypt(club.mpAccessToken)

              // 2. Calculate Amount
              // Priority: Custom Amount > Deposit > Full Price
              let amountToPay = customAmount && customAmount > 0 ? customAmount : 0

              if (amountToPay === 0) {
                     const deposit = club.bookingDeposit || 0
                     amountToPay = deposit > 0 ? deposit : booking.price
              }

              if (amountToPay <= 0) throw new Error("El monto a cobrar es inválido")

              // 3. Configure MP
              const client = new MercadoPagoConfig({ accessToken })
              const preference = new Preference(client)

              // 4. Create Preference
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              const successUrl = `${baseUrl}${redirectPath}`
              const failureUrl = `${baseUrl}${redirectPath}?status=failure`
              const pendingUrl = `${baseUrl}${redirectPath}?status=pending`

              // Customize title based on partial vs full
              const isPartial = amountToPay < booking.price
              const title = isPartial ? `Seña Reserva - ${booking.court.name}` : `Reserva Total - ${booking.court.name}`

              console.log('🔧 Creating MercadoPago preference:', {
                     bookingId: booking.id,
                     amount: amountToPay,
                     successUrl,
                     baseUrl
              })

              const response = await preference.create({
                     body: {
                            items: [
                                   {
                                          id: String(booking.id),
                                          title: title,
                                          description: `Fecha: ${booking.startTime.toLocaleDateString()}`,
                                          quantity: 1,
                                          unit_price: amountToPay,
                                          currency_id: 'ARS'
                                   }
                            ],
                            external_reference: String(booking.id),
                            back_urls: {
                                   success: successUrl,
                                   failure: failureUrl,
                                   pending: pendingUrl
                            },
                            notification_url: `${baseUrl}/api/webhooks/mercadopago?clubId=${club.id}`,
                            auto_return: 'approved',
                            statement_descriptor: 'COURTOPS'
                     }
              })

              console.log('✅ MercadoPago preference created:', response.id)

              return { success: true, init_point: response.init_point, preferenceId: response.id }
       } catch (error: any) {
              console.error("Error creating MP preference:", error)
              return { success: false, error: error.message }
       }
}

export async function createSubscriptionPreference(
       clubId: string,
       planName: string,
       price: number,
       payerEmail: string,
       externalRef: string
) {
       try {
              // Use Platform's MP Token
              const platformAccessToken = process.env.MP_ACCESS_TOKEN
              if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

              const club = await prisma.club.findUnique({ where: { id: clubId } })
              if (!club) throw new Error("Club no encontrado")

              const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
              const preapproval = new PreApproval(client)

              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              // URL to return to after subscribing
              const backUrl = `${baseUrl}/dashboard/suscripcion/status`

              const response = await preapproval.create({
                     body: {
                            reason: `Suscripción ${planName} - CourtOps`,
                            auto_recurring: {
                                   frequency: 1,
                                   frequency_type: 'months',
                                   transaction_amount: price,
                                   currency_id: 'ARS'
                            },
                            back_url: backUrl,
                            // payer_email needs to be a test user for sandbox or a real email in prod.
                            // However, preapproval often fails if the email is the same as the collector.
                            // For safety, let's omit it or use a generic one if MP complains.
                            // MP Docs say payer_email is required for preapproval.
                            payer_email: payerEmail,
                            external_reference: externalRef,
                            status: 'authorized'
                     }
              })

              return { success: true, init_point: response.init_point, id: response.id }
       } catch (error: any) {
              console.error("Error creating subscription:", error)
              // Return detailed validation error if available
              const errorMsg = error.cause?.map((e: any) => e.description).join(', ') || error.message
              return { success: false, error: errorMsg }
       }
}

export async function getSubscription(id: string) {
       try {
              const platformAccessToken = process.env.MP_ACCESS_TOKEN
              if (!platformAccessToken) throw new Error("Plataforma Mercado Pago no configurada")

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

              const client = new MercadoPagoConfig({ accessToken: platformAccessToken })
              const preapproval = new PreApproval(client)

              const response = await preapproval.update({
                     id,
                     body: {
                            status: 'cancelled'
                     }
              })
              return { success: true, data: response }
       } catch (error: any) {
              console.error("Error cancelling subscription in MP:", error)
              return { success: false, error: error.message }
       }
}
