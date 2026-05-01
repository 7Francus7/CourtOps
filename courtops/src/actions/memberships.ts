'use server'

import prisma from '@/lib/db'
import { getCurrentClubId, getOrCreateTodayCashRegister } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/logger'
import { addDays } from 'date-fns'
import { nowInArg } from '@/lib/date-utils'

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
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function updateMembershipPlan(id: string, data: { name: string, price: number, durationDays: number, discountPercent: number, description?: string }) {
       const clubId = await getCurrentClubId()
       try {
              // Verify ownership
              const existing = await prisma.membershipPlan.findFirst({
                     where: { id, clubId }
              })
              if (!existing) throw new Error("Plan no encontrado")

              const plan = await prisma.membershipPlan.update({
                     where: { id_clubId: { id, clubId } },
                     data: { ...data }
              })

              await logAction({
                     clubId,
                     action: 'UPDATE',
                     entity: 'SETTINGS',
                     details: { type: 'UPDATE_PLAN', name: data.name }
              })
              revalidatePath('/configuracion')
              return { success: true, plan }
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function deleteMembershipPlan(id: string) {
       const clubId = await getCurrentClubId()
       try {
              // Verify ownership
              const existing = await prisma.membershipPlan.findFirst({
                     where: { id, clubId }
              })
              if (!existing) throw new Error("Plan no encontrado")

              // Soft delete or hard delete depending on schema. 
              // Usually we might check if it has memberships. Schema says references memberships.
              // Let's modify to isActive = false if we want to keep history, or delete if possible.
              // Schema: isActive Boolean @default(true)

              await prisma.membershipPlan.update({
                     where: { id },
                     data: { isActive: false }
              })

              await logAction({
                     clubId,
                     action: 'DELETE',
                     entity: 'SETTINGS',
                     details: { type: 'DELETE_PLAN', id }
              })
              revalidatePath('/configuracion')
              return { success: true }
       } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}

export async function getActiveMembers() {
  const clubId = await getCurrentClubId()
  const now = nowInArg()
  const members = await prisma.membership.findMany({
    where: { plan: { clubId }, status: 'ACTIVE' },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true, clubId: true } },
      plan: { select: { id: true, name: true, price: true, durationDays: true } }
    },
    orderBy: { endDate: 'asc' }
  })
  return members.filter(m => m.client.clubId === clubId).map(m => ({
    ...m,
    isExpiringSoon: m.endDate < addDays(now, 7)
  }))
}

export async function getMembershipsOverview() {
  const clubId = await getCurrentClubId()
  const now = nowInArg()
  const [plans, activeCount, expiredCount, totalRevenue] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { clubId, isActive: true },
      include: {
        _count: { select: { memberships: { where: { status: 'ACTIVE' } } } }
      }
    }),
    prisma.membership.count({ where: { plan: { clubId }, status: 'ACTIVE', endDate: { gte: now } } }),
    prisma.membership.count({ where: { plan: { clubId }, OR: [{ status: 'EXPIRED' }, { endDate: { lt: now } }] } }),
    prisma.membership.aggregate({
      where: { plan: { clubId }, status: 'ACTIVE' },
      _sum: { pricePaid: true }
    })
  ])
  return {
    plans: plans.map(p => ({ ...p, activeSubscribers: p._count.memberships })),
    activeCount,
    expiredCount,
    monthlyRevenue: totalRevenue._sum.pricePaid ?? 0
  }
}

export async function cancelClientMembership(membershipId: string) {
  const clubId = await getCurrentClubId()
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, plan: { clubId } },
    include: { client: true }
  })
  if (!membership) return { success: false, error: 'Membresía no encontrada' }
  await prisma.$transaction(async (tx) => {
    await tx.membership.update({ where: { id: membershipId }, data: { status: 'CANCELLED' } })
    await tx.client.update({
      where: { id_clubId: { id: membership.clientId, clubId } },
      data: { membershipStatus: 'NONE', membershipExpiresAt: null }
    })
  })
  await logAction({ clubId, action: 'UPDATE', entity: 'CLIENT', entityId: membership.clientId.toString(), details: { type: 'CANCEL_MEMBERSHIP' } })
  revalidatePath('/dashboard/membresias')
  return { success: true }
}

export async function subscribeClient(clientId: number, planId: string, paymentMethod: string = 'CASH') {
       const clubId = await getCurrentClubId()

       try {
              // Verify plan belongs to this club
              const plan = await prisma.membershipPlan.findFirst({ where: { id: planId, clubId } })
              if (!plan) return { success: false, error: 'Plan no encontrado' }

              // Verify client belongs to this club
              const client = await prisma.client.findFirst({ where: { id: clientId, clubId } })
              if (!client) return { success: false, error: 'Cliente no encontrado' }

              const startDate = nowInArg()
              const endDate = addDays(startDate, plan.durationDays)

              // Get cash register before transaction (uses global prisma)
              const register = plan.price > 0 ? await getOrCreateTodayCashRegister(clubId) : null

              // Wrap all writes in a transaction for atomicity
              const membership = await prisma.$transaction(async (tx) => {
                     // 1. Create Membership Record
                     const newMembership = await tx.membership.create({
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
                     await tx.client.update({
                            where: { id_clubId: { id: clientId, clubId } },
                            data: {
                                   membershipStatus: 'ACTIVE',
                                   membershipExpiresAt: endDate
                            }
                     })

                     // 3. Register Payment
                     if (plan.price > 0 && register) {
                            await tx.transaction.create({
                                   data: {
                                          clubId,
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

                     return newMembership
              })

              // 4. Log (outside transaction — non-critical)
              await logAction({
                     clubId,
                     action: 'CREATE',
                     entity: 'CLIENT',
                     entityId: clientId.toString(),
                     details: { type: 'SUBSCRIPTION', plan: plan.name, price: plan.price }
              })

              revalidatePath(`/clientes/${clientId}`)
              return { success: true, membership }

       } catch (error: unknown) {
              console.error(error)
              return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
       }
}
