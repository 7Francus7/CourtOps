'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago'
import prisma from '@/lib/db'

export async function createPreference(bookingId: number, redirectPath: string = '/reservar') {
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
              const club = booking.club as any

              if (!club.mpAccessToken) throw new Error("El club no tiene configurado Mercado Pago")

              // 2. Calculate Amount
              // Si bookingDeposit > 0, cobramos eso. Si no, cobramos booking.price.
              const deposit = club.bookingDeposit || 0
              const amountToPay = deposit > 0 ? deposit : booking.price

              if (amountToPay <= 0) throw new Error("El monto a cobrar es inválido")

              // 3. Configure MP
              const client = new MercadoPagoConfig({ accessToken: club.mpAccessToken })
              const preference = new Preference(client)

              // 4. Create Preference
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              // Ensure redirectPath starts with / or is full URL? Assuming path, so append to baseUrl
              // If redirectPath is just "whatever", prepend slash if missing? 
              // Let's assume passed path is clean.
              const successUrl = `${baseUrl}${redirectPath}`

              const response = await preference.create({
                     body: {
                            items: [
                                   {
                                          id: String(booking.id),
                                          title: `Reserva ${booking.court.name}`,
                                          description: `Fecha: ${booking.startTime.toLocaleDateString()}`,
                                          quantity: 1,
                                          unit_price: amountToPay,
                                          currency_id: 'ARS'
                                   }
                            ],
                            external_reference: String(booking.id),
                            back_urls: {
                                   success: successUrl,
                                   failure: successUrl,
                                   pending: successUrl
                            },
                            notification_url: `${baseUrl}/api/webhooks/mercadopago?clubId=${club.id}`,
                            auto_return: 'approved',
                            statement_descriptor: 'COURTOPS'
                     }
              })

              return { success: true, init_point: response.init_point, preferenceId: response.id }
       } catch (error: any) {
              console.error("Error creating MP preference:", error)
              return { success: false, error: error.message }
       }
}
