import { Prisma } from '@prisma/client'

export type BookingWithClient = Prisma.BookingGetPayload<{
       include: {
              client: { select: { id: true, name: true } }
              items: { include: { product: true } }
              transactions: true
       }
}>

export type TurneroResponse = {
       bookings: any[]
       courts: any[]
       config: {
              openTime: string
              closeTime: string
              slotDuration: number
       }
       clubId: string
       success: boolean
       error?: string
}
