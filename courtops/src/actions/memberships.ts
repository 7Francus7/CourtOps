'use server'

import prisma from '@/lib/db'
import { getCurrentClubId, getOrCreateTodayCashRegister } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/logger'
import { addDays } from 'date-fns'

export async function getMembershipPlans() {
       const clubId = await getCurrentClubId()
       return await prisma.membershipPlan.findMany({
              where: { clubId, isActive: true },
              orderBy: { price: 'asc' }
       })
}

export async function createMembershipPlan(data: { name: string, price: number, durationDays: number, discountPercent: number, description?: string }) {
       const clubId = await getCurrentClubId()
       try {
              const plan = await prisma.membershipPlan.create({
                     data: {
                            clubId,
                            ...data
                     }
              })
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'SETTINGS',
                     details: { type: 'NEW_PLAN', name: data.name }
              })
              revalidatePath('/configuracion')
              return { success: true, plan }
       } catch (error: any) {
              return { success: false, error: error.message }
       }
}

export async function subscribeClient(clientId: number, planId: string, paymentMethod: string = 'CASH') {
       const clubId = await getCurrentClubId()

       try {
              const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } })
              if (!plan) return { success: false, error: 'Plan no encontrado' }

              const client = await prisma.client.findUnique({ where: { id: clientId } })
              if (!client) return { success: false, error: 'Cliente no encontrado' }

              const startDate = new Date()
              const endDate = addDays(startDate, plan.durationDays)

              // 1. Create Membership Record
              const membership = await prisma.membership.create({
                     data: {
                            clientId,
                            planId,
                            startDate,
                            endDate,
                            pricePaid: plan.price,
                            status: 'ACTIVE'
                     }
              })

              // 2. Update Client Status
              await prisma.client.update({
                     where: { id: clientId },
                     data: {
                            membershipStatus: 'ACTIVE',
                            membershipExpiresAt: endDate
                     }
              })

              // 3. Register Payment
              if (plan.price > 0) {
                     const register = await getOrCreateTodayCashRegister(clubId)
                     await prisma.transaction.create({
                            data: {
                                   cashRegisterId: register.id,
                                   type: 'INCOME',
                                   category: 'MEMBERSHIP',
                                   amount: plan.price,
                                   method: paymentMethod,
                                   description: `Suscripción ${plan.name} - ${client.name}`,
                                   clientId: client.id
                            }
                     })
              }

              // 4. Log
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'CLIENT',
                     entityId: clientId.toString(),
                     details: { type: 'SUBSCRIPTION', plan: plan.name, price: plan.price }
              })

              revalidatePath(`/clientes/${clientId}`)
              return { success: true, membership }

       } catch (error: any) {
              console.error(error)
              return { success: false, error: error.message }
       }
}
