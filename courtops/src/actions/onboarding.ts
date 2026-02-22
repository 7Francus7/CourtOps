'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'

export const finishOnboarding = createSafeAction(async ({ clubId }, data: {
       courtCount: number
       openTime: string
       closeTime: string
       price: number
}) => {
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
                            sport: 'padel',
                            branchId: null
                     })
              }

              await prisma.court.createMany({
                     data: courtsToCreate
              })
       }

       revalidatePath('/')
       return true
})
