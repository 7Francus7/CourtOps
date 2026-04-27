'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createSafeAction } from '@/lib/safe-action'

export type OnboardingCourt = {
       name: string
       sport?: string
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
                     slotDuration: 90,
              }
       })

       // 2. Create Courts
       if (data.courts.length > 0) {
              const existingCourts = await prisma.court.findMany({
                     where: { clubId },
                     include: { _count: { select: { bookings: true } } }
              })
              const allUnused = existingCourts.every(c => c._count.bookings === 0)

              if (existingCourts.length === 0 || allUnused) {
                     if (existingCourts.length > 0) {
                            await prisma.court.deleteMany({ where: { clubId } })
                     }
                     await prisma.court.createMany({
                            data: data.courts.map((court, i) => ({
                                   name: court.name,
                                   clubId,
                                   sport: 'PADEL',
                                   sortOrder: i,
                                   duration: 90,
                            }))
                     })
              }
       }

       // 3. Create or update catch-all Price Rule
       const existingRules = await prisma.priceRule.findMany({ where: { clubId } })
       const catchAll = existingRules.find(r => !r.courtId && r.daysOfWeek === '0,1,2,3,4,5,6')
       if (catchAll) {
              await prisma.priceRule.update({
                     where: { id: catchAll.id },
                     data: {
                            price: data.price,
                            startTime: data.openTime,
                            endTime: data.closeTime,
                     }
              })
       } else if (existingRules.length === 0) {
              await prisma.priceRule.create({
                     data: {
                            clubId,
                            name: 'Tarifa General',
                            price: data.price,
                            startTime: data.openTime,
                            endTime: data.closeTime,
                            daysOfWeek: '0,1,2,3,4,5,6',
                            priority: 1
                     }
              })
       }

       revalidatePath('/')
       return true
})
