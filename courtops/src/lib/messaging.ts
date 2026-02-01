import { TurneroBooking } from '@/types/booking'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type MessageTemplate = 'reminder' | 'payment_confirmation' | 'welcome' | 'new_booking' | 'retention'

export class MessagingService {
       static generateRecoveryMessage(clientName: string): string {
              return `👋 Hola *${clientName}*! Hace mucho no te vemos por las canchas 🎾\n\nTenemos horarios disponibles para esta semana con precios especiales.\n\n¿Te pinta un partido? ¡Avísanos y te guardamos lugar! 🚀`
       }
       /**
        * Generates a standardized message content for a booking
        */
       static generateBookingMessage(booking: any, type: MessageTemplate): string {
              const date = format(new Date(booking.schedule.startTime), "EEEE d 'de' MMMM", { locale: es })
              const time = format(new Date(booking.schedule.startTime), "HH:mm")
              const court = booking.schedule.courtName

              // Calculate balance
              const balance = booking.pricing?.balance ?? 0
              const clientName = booking.client?.name || 'Jugador'

              if (type === 'reminder') {
                     return `🎾 Hola *${clientName}*! te recordamos tu turno en *CourtOps*:\n\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n📍 Cancha: ${court}\n\n💰 Saldo pendiente: $${balance}\n\nTe esperamos! 🙌`
              }

              if (type === 'payment_confirmation') {
                     return `✅ Hola *${clientName}*, pago recibido con éxito para tu turno del ${date} a las ${time}.\n\nTu saldo restante es: $${balance}.\n\nGracias por confiar en CourtOps! 🎾`
              }

              if (type === 'new_booking') {
                     return `🎾 *RESERVA CONFIRMADA* ✅\n\nHola *${clientName}*, agendamos tu turno:\n\n📅 ${date}\n⏰ ${time} hs\n📍 ${court}\n\nPor favor, recordá que las cancelaciones se aceptan hasta 24hs antes.\n\n¡Nos vemos en la cancha! 🚀`
              }

              return ''
       }

       /**
        * Construct the WhatsApp URL for opening the app with pre-filled text
        */
       static getWhatsAppUrl(phone: string, text: string): string {
              const cleanPhone = phone.replace(/\D/g, '')
              const encodedText = encodeURIComponent(text)
              return `https://wa.me/${cleanPhone}?text=${encodedText}`
       }

       /**
        * Send a WhatsApp message via external provider (Placeholder)
        */
       static async sendWhatsApp(phone: string, message: string) {
              // In a real implementation, you would call an API like Twilio, WppConnect, or similar.
              // For now, we simulate the action and log it.
              console.log(`[WHATSAPP MOCK] Sending to ${phone}: ${message}`)

              // Example API Call:
              // await fetch('https://api.whatsapp-provider.com/send', {
              //     method: 'POST',
              //     body: JSON.stringify({ phone, message })
              // })
       }

       /**
        * Notify waiting users about a freed slot
        */
       static async notifyWaitingList(booking: any, waitingUsers: any[]) {
              if (!waitingUsers.length) return

              const date = format(new Date(booking.startTime), "EEEE d 'de' MMMM", { locale: es })
              const time = format(new Date(booking.startTime), "HH:mm")

              for (const user of waitingUsers) {
                     if (!user.phone) continue
                     const message = `🎾 *TURNO DISPONIBLE* ⚡\n\nHola ${user.name}, se liberó una cancha para el ${date} a las ${time} hs.\n\nSi te interesa, respondé YA para reservarla. ¡Vuela! 🚀`

                     await this.sendWhatsApp(user.phone, message)
              }
       }
}
