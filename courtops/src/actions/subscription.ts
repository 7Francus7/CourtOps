'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, cancelSubscriptionMP, getSubscription } from './mercadopago'
import { revalidatePath } from 'next/cache'

const DEFAULT_PLANS = [
       {
              name: "Start",
              price: 45000,
              features: JSON.stringify([
                     "Hasta 2 canchas",
                     "Panel de Administración",
                     "Reservas Online",
                     "Control de Caja Simple",
                     "Soporte por Email"
              ])
       },
       {
              // Refreshed prices
              name: "Pro",
              price: 85000,
              features: JSON.stringify([
                     "Hasta 6 canchas",
                     "Punto de Venta (Kiosco)",
                     "Reportes Financieros Avanzados",
                     "Gestión de Clientes y Deudas",
                     "Soporte Prioritario WhatsApp",
                     "Recordatorios Automáticos"
              ])
       }
]

export async function getSubscriptionDetails() {
       const clubId = await getCurrentClubId()

       // Ensure plans exist and are up to date
       const existingPlans = await prisma.platformPlan.findMany()

       // Update or Create Plans
       for (const p of DEFAULT_PLANS) {
              const existing = existingPlans.find(ep => ep.name === p.name)
              if (existing) {
                     // Update if price changed
                     if (existing.price !== p.price || existing.features !== p.features) {
                            await prisma.platformPlan.update({
                                   where: { id: existing.id },
                                   data: { price: p.price, features: p.features }
                            })
                     }
              } else {
                     await prisma.platformPlan.create({ data: p })
              }
       }

       // Delete old plans that are not in DEFAULT_PLANS (Optional, but keeps it clean)
       const planNames = DEFAULT_PLANS.map(p => p.name)
       await prisma.platformPlan.deleteMany({
              where: {
                     name: { notIn: planNames }
              }
       })

       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: { platformPlan: true }
       })

       if (!club) throw new Error("Club no encontrado")

       const allPlans = await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } })

       const isDev = process.env.NODE_ENV === 'development'
       const hasToken = !!process.env.MP_ACCESS_TOKEN

       return {
              currentPlan: club.platformPlan,
              subscriptionStatus: club.subscriptionStatus,
              nextBillingDate: club.nextBillingDate,
              availablePlans: allPlans.map(p => ({
                     ...p,
                     features: JSON.parse(p.features) as string[]
              })),
              isConfigured: hasToken || isDev,
              isDevMode: isDev && !hasToken
       }
}

export async function initiateSubscription(planId: string) {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: { users: true }
       })

       if (!club) throw new Error("Club no encontrado")

       // Find Plan
       const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
       if (!plan) throw new Error("Plan no válido")

       // DEV MODE BYPASS
       if (process.env.NODE_ENV === 'development' && !process.env.MP_ACCESS_TOKEN) {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              // Redirect directly to success page with a fake ID that encodes the plan
              // Format: DEV_CLUBID:PLANID
              const fakeId = `DEV_${clubId}:${planId}`

              return {
                     success: true,
                     init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
              }
       }

       // Get Admin Email (try to find an admin, or fallback to the first user or a placeholder)
       const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
       const payerEmail = adminUser?.email || 'admin@courtops.com'

       // Auto-cancel previous subscription if exists (Upgrade/Downgrade flow)
       if (club.mpPreapprovalId && (club.subscriptionStatus === 'authorized' || club.subscriptionStatus === 'ACTIVE')) {
              try {
                     console.log(`Cancelling previous subscription ${club.mpPreapprovalId} for club ${clubId} before new subscription...`)
                     // Note: You must ensure cancelSubscriptionMP is imported. I will add it to the top imports in a separate edit if not available, 
                     // but here I assume it's available or I will add the import. 
                     // Wait, I cannot add imports here. I should do a MultiReplace or ensure it is imported.
                     // The previous file view showed `import { getSubscription, cancelSubscriptionMP } from './mercadopago'` at line 188.
                     // I will move that import to the top so it's available here.
                     await cancelSubscriptionMP(club.mpPreapprovalId)
              } catch (e) {
                     console.error("Failed to cancel previous subscription during switch:", e)
              }
       }

       // Create MP Preference
       const result = await createSubscriptionPreference(
              clubId,
              plan.name,
              plan.price,
              payerEmail,
              `${clubId}:${planId}` // External Ref: ClubId:PlanId
       )

       return result
}

export async function cancelSubscription() {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({
              where: { id: clubId }
       })

       if (!club) throw new Error("Club no encontrado")

       // If in DEV mode (fake ID), just mark as cancelled
       if (club.mpPreapprovalId?.startsWith('DEV_')) {
              await prisma.club.update({
                     where: { id: clubId },
                     data: { subscriptionStatus: 'cancelled' }
              })
              revalidatePath('/dashboard/suscripcion')
              return { success: true, message: "Suscripción cancelada (Modo Desarrollo)." }
       }

       if (club.mpPreapprovalId) {
              try {
                     const res = await cancelSubscriptionMP(club.mpPreapprovalId)
                     if (res.success) {
                            await prisma.club.update({
                                   where: { id: clubId },
                                   data: {
                                          subscriptionStatus: 'cancelled',
                                   }
                            })
                            revalidatePath('/dashboard/suscripcion')
                            return { success: true, message: "Suscripción cancelada exitosamente." }
                     } else {
                            // If API fails, mark as pending cancellation
                            await prisma.club.update({
                                   where: { id: clubId },
                                   data: { subscriptionStatus: 'CANCELLED_PENDING' }
                            })
                            revalidatePath('/dashboard/suscripcion')
                            return { success: true, message: "Suscripción marcada como pendiente de cancelación. Hubo un error con la API de MercadoPago." }
                     }
              } catch (error) {
                     console.error("Error in cancelSubscription:", error)
              }
       }

       // Fallback
       await prisma.club.update({
              where: { id: clubId },
              data: {
                     subscriptionStatus: 'CANCELLED_PENDING',
              }
       })

       revalidatePath('/dashboard/suscripcion')
       return { success: true, message: "Suscripción marcada para cancelar. Contacte soporte si el estado no cambia." }
}



export async function handleSubscriptionSuccess(preapprovalId: string) {
       const clubId = await getCurrentClubId()

       // DEV MODE HANDLING
       if (preapprovalId.startsWith('DEV_')) {
              // Format: DEV_CLUBID:PLANID
              const parts = preapprovalId.replace('DEV_', '').split(':')
              if (parts.length !== 2) throw new Error("ID de desarrollo inválido")

              const [refClubId, refPlanId] = parts

              if (refClubId !== clubId) {
                     throw new Error("El ID del club no coincide con la suscripción (DEV)")
              }

              // Update Club
              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            mpPreapprovalId: preapprovalId, // Store the fake ID
                            platformPlanId: refPlanId,
                            subscriptionStatus: 'authorized', // Assume active for dev
                            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
                     }
              })

              revalidatePath('/dashboard/suscripcion')
              return { success: true }
       }

       // Verify with MP
       const subscription = await getSubscription(preapprovalId)
       if (!subscription) throw new Error("No se pudo verificar la suscripción")

       if (subscription.status !== 'authorized') {
              throw new Error("La suscripción no está autorizada")
       }

       // Parse external_reference "clubId:planId"
       const [refClubId, refPlanId] = (subscription.external_reference || '').split(':')

       if (refClubId !== clubId) {
              throw new Error("El ID del club no coincide con la suscripción")
       }

       // Update Club
       await prisma.club.update({
              where: { id: clubId },
              data: {
                     mpPreapprovalId: preapprovalId,
                     platformPlanId: refPlanId,
                     subscriptionStatus: subscription.status,
                     nextBillingDate: subscription.next_payment_date ? new Date(subscription.next_payment_date) : undefined
              }
       })

       revalidatePath('/dashboard/suscripcion')
       return { success: true }
}
