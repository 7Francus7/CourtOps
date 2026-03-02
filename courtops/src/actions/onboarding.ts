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
                            sport: 'PADEL',
                     })
              }

              await prisma.court.createMany({
                     data: courtsToCreate
              })
       }

       // 3. Create Default Price Rule (Catch-all)
       const existingRules = await prisma.priceRule.count({ where: { clubId } })
       if (existingRules === 0) {
              await prisma.priceRule.create({
                     data: {
                            clubId,
                            name: 'Tarifa General',
                            price: data.price,
                            startTime: data.openTime,
                            endTime: data.closeTime,
                            daysOfWeek: '0,1,2,3,4,5,6', // All days
                            priority: 1
                     }
              })
       }

       revalidatePath('/')
       return true
})
