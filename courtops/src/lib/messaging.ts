import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type MessageTemplate = 'reminder' | 'payment_confirmation' | 'welcome' | 'new_booking' | 'retention'

export class MessagingService {
       static generateRecoveryMessage(clientName: string): string {
              return `Hola *${clientName}*! 👋\n\nHace un tiempo que no te vemos por las canchas 🎾\n\nTenemos horarios disponibles esta semana.\n¿Te pinta un partido? Respondé y te guardamos lugar 🙌`
       }

       /**
        * Generates a standardized message content for a booking.
        * Messages are designed to be short, professional and clear.
        */
       static generateBookingMessage(booking: { schedule?: { startTime?: string | Date; courtName?: string }; client?: { name?: string }; pricing?: { balance?: number; totalPrice?: number } }, type: MessageTemplate): string {
              const schedule = booking.schedule || {}
              const date = format(new Date(schedule.startTime || new Date()), "EEEE d 'de' MMMM", { locale: es })
              const time = format(new Date(schedule.startTime || new Date()), "HH:mm")
              const court = schedule.courtName
              const clientName = booking.client?.name || 'Jugador'

              // Calculate balance
              const balance = booking.pricing?.balance ?? 0
              const totalPrice = booking.pricing?.totalPrice ?? 0

              if (type === 'reminder') {
                     return [
                            `⏰ *Recordatorio de turno*`,
                            ``,
                            `Hola *${clientName}*!`,
                            `Tu turno es hoy:`,
                            ``,
                            `📅 ${date}`,
                            `🕐 ${time} hs`,
                            `📍 ${court}`,
                            balance > 0 ? `\n💰 Saldo pendiente: *$${balance.toLocaleString()}*` : '',
                            ``,
                            `Te esperamos! 🎾`
                     ].filter(Boolean).join('\n')
              }

              if (type === 'payment_confirmation') {
                     return [
                            `✅ *Pago recibido*`,
                            ``,
                            `Hola *${clientName}*!`,
                            `Confirmamos tu pago para:`,
                            ``,
                            `📅 ${date} — ${time} hs`,
                            `📍 ${court}`,
                            balance > 0 ? `\n💰 Saldo restante: *$${balance.toLocaleString()}*` : `\n✨ Turno pagado en su totalidad.`,
                            ``,
                            `¡Gracias! 🙌`
                     ].filter(Boolean).join('\n')
              }

              if (type === 'new_booking') {
                     return [
                            `🎾 *Reserva confirmada* ✅`,
                            ``,
                            `Hola *${clientName}*! Tu turno quedó agendado:`,
                            ``,
                            `📅 ${date}`,
                            `🕐 ${time} hs`,
                            `📍 ${court}`,
                            totalPrice > 0 ? `💰 Precio: *$${totalPrice.toLocaleString()}*` : '',
                            ``,
                            `⚠️ Cancelaciones: hasta 24hs antes.`,
                            ``,
                            `¡Nos vemos en la cancha! 🚀`
                     ].filter(Boolean).join('\n')
              }

              return ''
       }

       /**
        * Construct the WhatsApp URL for opening the app with pre-filled text
        */
       static getWhatsAppUrl(phone: string, text: string): string {
              // Clean phone: remove all non-digits
              let cleanPhone = phone.replace(/\D/g, '')

              // If the number starts with 0 (Argentina local), convert to international format
              if (cleanPhone.startsWith('0')) {
                     cleanPhone = '54' + cleanPhone.substring(1)
              }
              // If it doesn't start with country code, assume Argentina
              if (!cleanPhone.startsWith('54') && cleanPhone.length <= 10) {
                     cleanPhone = '54' + cleanPhone
              }

              const encodedText = encodeURIComponent(text)
              return `https://wa.me/${cleanPhone}?text=${encodedText}`
       }

       /**
        * Send a WhatsApp message via external provider (Placeholder)
        */
       static async sendWhatsApp(_phone: string, _message: string) {
              // TODO: implement WhatsApp API integration
       }

       /**
        * Notify waiting users about a freed slot
        */
       static async notifyWaitingList(booking: { startTime?: string | Date; [key: string]: unknown }, waitingUsers: { phone?: string; name: string }[]) {
              if (!waitingUsers.length) return

              const date = format(new Date(booking.startTime as string | Date), "EEEE d 'de' MMMM", { locale: es })
              const time = format(new Date(booking.startTime as string | Date), "HH:mm")

              for (const user of waitingUsers) {
                     if (!user.phone) continue
                     const message = [
                            `⚡ *Turno disponible*`,
                            ``,
                            `Hola *${user.name}*!`,
                            `Se liberó un horario:`,
                            ``,
                            `📅 ${date} — ${time} hs`,
                            ``,
                            `¿Lo querés? Respondé YA para reservarlo 🏃`
                     ].join('\n')

                     await this.sendWhatsApp(user.phone, message)
              }
       }
}
