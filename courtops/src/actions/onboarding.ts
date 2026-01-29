'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export async function finishOnboarding(data: {
       courtCount: number
       openTime: string
       closeTime: string
       price: number
}) {
       try {
              const clubId = await getCurrentClubId()

              // 1. Update Club Settings
              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            openTime: data.openTime,
                            closeTime: data.closeTime,
                     }
              })

              // 2. Create Courts
              const existingCount = await prisma.court.count({ where: { clubId } })

              if (existingCount === 0) {
                     const courtsToCreate = []
                     for (let i = 1; i <= data.courtCount; i++) {
                            courtsToCreate.push({
                                   name: `Cancha ${i}`,
                                   clubId,
                                   sport: 'padel', // Default
                                   branchId: null // Default branch if any, or null
                            })
                     }

                     await prisma.court.createMany({
                            data: courtsToCreate
                     })
              }

              revalidatePath('/')
              return { success: true }
       } catch (error: any) {
              console.error("Onboarding Error:", error)
              return { success: false, error: error.message }
       }
}
