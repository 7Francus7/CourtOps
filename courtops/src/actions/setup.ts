'use server'

import { getCurrentClubId } from "@/lib/tenant"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type SetupData = {
       clubName: string
       courtCount: number
       courtSurface: string
       openTime: string
       closeTime: string
       basePrice: number
}

export async function completeSetup(data: SetupData) {
       const clubId = await getCurrentClubId()

       if (!clubId) throw new Error("No club found")

       try {
              // 1. Update Club Details
              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            name: data.clubName,
                            openTime: data.openTime,
                            closeTime: data.closeTime,
                            // If we added setupCompleted to schema, we'd set it here.
                            // For now, relies on courts > 0 logic
                     }
              })

              // 2. Create Courts
              // First, check if courts exist. If so, maybe skip or delete?
              // Let's assume this is only run for fresh clubs.
              const existingCourts = await prisma.court.count({ where: { clubId } })

              if (existingCourts === 0) {
                     const courtsToCreate = Array.from({ length: data.courtCount }).map((_, i) => ({
                            clubId,
                            name: `Cancha ${i + 1}`,
                            surface: data.courtSurface,
                            sport: 'PADEL',
                            duration: 90
                     }))

                     await prisma.court.createMany({
                            data: courtsToCreate
                     })
              }

              // 3. Create Price Rule
              const existingRules = await prisma.priceRule.count({ where: { clubId } })
              if (existingRules === 0) {
                     await prisma.priceRule.create({
                            data: {
                                   clubId,
                                   name: 'Precio Base',
                                   price: data.basePrice,
                                   daysOfWeek: '0,1,2,3,4,5,6',
                                   startTime: '00:00',
                                   endTime: '23:59',
                                   priority: 0
                            }
                     })
              }

              revalidatePath('/dashboard')
              return { success: true }
       } catch (error: any) {
              console.error("Setup Error:", error)
              return { success: false, error: error.message }
       }
}

export async function checkSetupStatus() {
       const clubId = await getCurrentClubId() // Redirects if not logged in

       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: {
                     _count: {
                            select: { courts: true, priceRules: true }
                     }
              }
       })

       if (!club) return { isSetup: false }

       // Definition of "Setup Complete": Has at least 1 court and 1 price rule
       const isSetup = club._count.courts > 0 && club._count.priceRules > 0

       return {
              isSetup,
              clubName: club.name,
              openTime: club.openTime,
              closeTime: club.closeTime
       }
}
