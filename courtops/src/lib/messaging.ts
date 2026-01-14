import { TurneroBooking } from '@/types/booking'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type MessageTemplate = 'reminder' | 'payment_confirmation' | 'welcome'

export class MessagingService {
       /**
        * Generates a standardized message content for a booking
        */
       static generateBookingMessage(booking: any, type: MessageTemplate): string {
              const date = format(new Date(booking.schedule.startTime), "EEEE d 'de' MMMM", { locale: es })
              const time = format(new Date(booking.schedule.startTime), "HH:mm")
              const court = booking.schedule.courtName

              // Calculate balance
              // Ensure we handle different booking structures (TurneroBooking vs AdaptedBooking)
              // The modal passes 'adaptedBooking' which has 'pricing.balance'
              // But if we use raw prisma result, we need to calculate.

              // For now, assume 'booking' is the adapted object from the modal or similar structure
              const balance = booking.pricing?.balance ?? 0
              const clientName = booking.client?.name || 'Jugador'

              if (type === 'reminder') {
                     return `🎾 Hola *${clientName}*! te recordamos tu turno en *CourtOps*:\n\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n📍 Cancha: ${court}\n\n💰 Saldo pendiente: $${balance}\n\nTe esperamos! 🙌`
              }

              if (type === 'payment_confirmation') {
                     return `✅ Hola *${clientName}*, pago recibido con éxito para tu turno del ${date} a las ${time}.\n\nTu saldo restante es: $${balance}.\n\nGracias por confiar en CourtOps! 🎾`
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
}
