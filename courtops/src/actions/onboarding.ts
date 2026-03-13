'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'

export type OnboardingCourt = {
       name: string
       sport: string
}

export type OnboardingData = {
       courts: OnboardingCourt[]
       openTime: string
       closeTime: string
       slotDuration: number
       price: number
}

export const finishOnboarding = createSafeAction(async ({ clubId }, data: OnboardingData) => {
       // 1. Update Club Settings
       await prisma.club.update({
              where: { id: clubId },
              data: {
                     openTime: data.openTime,
                     closeTime: data.closeTime,
                     slotDuration: data.slotDuration,
              }
       })

       // 2. Create Courts
       const existingCount = await prisma.court.count({ where: { clubId } })

       if (existingCount === 0 && data.courts.length > 0) {
              const courtsToCreate = data.courts.map((court, i) => ({
                     name: court.name,
                     clubId,
                     sport: court.sport,
                     sortOrder: i,
                     duration: data.slotDuration,
              }))

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
