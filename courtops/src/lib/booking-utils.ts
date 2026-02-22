import { TurneroBooking } from "@/types/booking"

export type BookingStatusDetails = {
       totalPrice: number
       totalPaid: number
       balance: number
       isPaid: boolean
       isPartial: boolean
       statusLabel: "PAID" | "PARTIAL" | "UNPAID"
}

export function getBookingFinancialStatus(booking: TurneroBooking): BookingStatusDetails {
       const itemsTotal = booking.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0
       const totalPrice = booking.price + itemsTotal
       const totalPaid = booking.transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

       const balance = Math.max(0, totalPrice - totalPaid)
       const isPaid = totalPaid >= totalPrice
       const isPartial = totalPaid > 0 && totalPaid < totalPrice

       let statusLabel: "PAID" | "PARTIAL" | "UNPAID" = "UNPAID"
       if (isPaid) statusLabel = "PAID"
       else if (isPartial) statusLabel = "PARTIAL"

       return {
              totalPrice,
              totalPaid,
              balance,
              isPaid,
              isPartial,
              statusLabel
       }
}
