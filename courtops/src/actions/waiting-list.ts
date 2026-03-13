'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export async function joinWaitingList(data: {
       courtId?: number
       date: Date
       name: string
       phone: string
       notes?: string
}) {
       try {
              const clubId = await getCurrentClubId()

              await prisma.waitingList.create({
                     data: {
                            clubId,
                            courtId: data.courtId,
                            date: data.date,
                            name: data.name,
                            phone: data.phone,
                            notes: data.notes,
                            status: 'PENDING'
                     }
              })

              revalidatePath('/dashboard')
              return { success: true }
       } catch (error) {
              console.error("Join Waiting List Error:", error)
              return { success: false, error: 'Error al unirse a la lista de espera' }
       }
}

export async function checkWaitingList(_date: Date, _courtId: number) {
       try {
              await getCurrentClubId()
              // Logic to check if there are people waiting specifically for this slot
              // For now, simpler implementation
              return { count: 0 }
       } catch (_e) {
              return { count: 0 }
       }
}
