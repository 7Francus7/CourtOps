'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, cancelSubscriptionMP, getSubscription } from './mercadopago'
import { getPlatformPaymentAdapter } from '@/lib/payment'
import { revalidatePath } from 'next/cache'
import { getPlanFeatures } from '@/lib/plan-features'

const DEFAULT_PLANS = [
       {
              name: 'Inicial',
              price: 45000,
              features: JSON.stringify(['Hasta 2 Canchas', 'Turnero Digital', 'Caja Básica', 'Soporte por Email']),
       },
       {
              name: 'Profesional',
              price: 85000,
              features: JSON.stringify(['Hasta 8 Canchas', 'Punto de Venta (Kiosco)', 'Gestión de Torneos', 'Control de Stock', 'Reportes Avanzados', 'Soporte WhatsApp']),
       },
       {
              name: 'Empresarial',
              price: 150000,
              features: JSON.stringify(['Canchas Ilimitadas', 'Gestión Multi-Sede', 'Gestión de Torneos', 'API Access', 'Roles de Empleado', 'Soporte Prioritario 24/7']),
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

       // Delete old plans that are not in DEFAULT_PLANS
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
       const platformProvider = process.env.PLATFORM_PAYMENT_PROVIDER || 'mercadopago'
       const hasToken = platformProvider === 'stripe'
              ? !!process.env.STRIPE_SECRET_KEY
              : !!process.env.MP_ACCESS_TOKEN

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

export async function initiateSubscription(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: { users: true }
       })

       if (!club) throw new Error("Club no encontrado")

       // Find Plan
       const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
       if (!plan) throw new Error("Plan no válido")

       // Calculate Price and Frequency
       let finalPrice = plan.price
       let frequency = 1
       const frequencyType = 'months'

       if (billingCycle === 'yearly') {
              // 20% discount, paid annually (12 months at once)
              finalPrice = (plan.price * 0.8) * 12
              frequency = 12
       }

       // DEV MODE BYPASS
       if (process.env.NODE_ENV === 'development' && !process.env.MP_ACCESS_TOKEN && !process.env.STRIPE_SECRET_KEY) {
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
              const fakeId = `DEV_${clubId}:${planId}:${billingCycle}`

              return {
                     success: true,
                     init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
              }
       }

       // Get Admin Email
       const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
       const payerEmail = adminUser?.email || 'admin@courtops.com'

       // Determine platform payment provider
       const platformProvider = process.env.PLATFORM_PAYMENT_PROVIDER || 'mercadopago'

       if (platformProvider === 'stripe') {
              // --- STRIPE FLOW ---
              try {
                     const { adapter } = getPlatformPaymentAdapter()
                     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

                     // Use Stripe Price IDs if available
                     const stripePriceId = billingCycle === 'yearly'
                            ? plan.stripePriceIdYearly
                            : plan.stripePriceIdMonthly

                     // Cancel previous Stripe subscription if exists
                     if (club.stripeSubscriptionId) {
                            try {
                                   await adapter.cancelSubscription(club.stripeSubscriptionId)
                            } catch (e) {
                                   console.error("Failed to cancel previous Stripe subscription:", e)
                            }
                     }

                     const result = await adapter.createSubscriptionCheckout({
                            clubId,
                            planName: plan.name,
                            price: finalPrice,
                            payerEmail,
                            externalRef: `${clubId}:${planId}:${billingCycle}`,
                            frequency,
                            frequencyType,
                            backUrl: `${baseUrl}/dashboard/suscripcion/status`,
                            stripePriceId: stripePriceId || undefined,
                     })

                     return { success: true, init_point: result.checkoutUrl }
              } catch (error: unknown) {
                     console.error("Stripe Subscription Error:", error)
                     return { success: false, error: error instanceof Error ? error.message : 'Error de Stripe' }
              }
       }

       // --- MERCADOPAGO FLOW (default) ---
       // Auto-cancel previous subscription if exists
       if (club.mpPreapprovalId && (club.subscriptionStatus === 'authorized' || club.subscriptionStatus === 'ACTIVE')) {
              try {
                     await cancelSubscriptionMP(club.mpPreapprovalId)
              } catch (e) {
                     console.error("Failed to cancel previous subscription:", e)
              }
       }

       // Create MP Preference with calculated price and frequency
       const result = await createSubscriptionPreference(
              clubId,
              plan.name,
              finalPrice,
              payerEmail,
              `${clubId}:${planId}:${billingCycle}`,
              frequency,
              frequencyType
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

       // Stripe subscription cancellation
       if (club.stripeSubscriptionId) {
              try {
                     const { adapter } = getPlatformPaymentAdapter()
                     const res = await adapter.cancelSubscription(club.stripeSubscriptionId)
                     if (res.success) {
                            await prisma.club.update({
                                   where: { id: clubId },
                                   data: {
                                          subscriptionStatus: 'cancelled',
                                          stripeSubscriptionId: null,
                                   }
                            })
                            revalidatePath('/dashboard/suscripcion')
                            return { success: true, message: "Suscripción Stripe cancelada exitosamente." }
                     }
              } catch (error) {
                     console.error("Error in Stripe cancelSubscription:", error)
              }
       }

       // MercadoPago subscription cancellation
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
              const parts = preapprovalId.replace('DEV_', '').split(':')
              if (parts.length < 2) throw new Error("ID de desarrollo inválido")

              const [refClubId, refPlanId, cycle] = parts

              if (refClubId !== clubId) {
                     throw new Error("El ID del club no coincide con la suscripción (DEV)")
              }

              const daysToAdd = cycle === 'yearly' ? 365 : 30

              const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
              const features = plan ? getPlanFeatures(plan.name) : {}

              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            mpPreapprovalId: preapprovalId,
                            platformPlanId: refPlanId,
                            subscriptionStatus: 'authorized',
                            nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
                            ...features
                     }
              })

              revalidatePath('/dashboard/suscripcion')
              return { success: true }
       }

       // STRIPE SESSION HANDLING (session_id from Stripe Checkout)
       if (preapprovalId.startsWith('cs_')) {
              try {
                     const { adapter } = getPlatformPaymentAdapter()
                     const status = await adapter.getSubscriptionStatus(preapprovalId)

                     if (!status || status.status !== 'authorized') {
                            throw new Error("La sesión de Stripe no está aprobada")
                     }

                     const [refClubId, refPlanId, cycle] = (status.externalReference || '').split(':')

                     if (refClubId !== clubId) {
                            throw new Error("El ID del club no coincide con la suscripción")
                     }

                     const daysToAdd = cycle === 'yearly' ? 365 : 30
                     const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
                     const features = plan ? getPlanFeatures(plan.name) : {}

                     await prisma.club.update({
                            where: { id: clubId },
                            data: {
                                   stripeSubscriptionId: preapprovalId,
                                   platformPlanId: refPlanId,
                                   subscriptionStatus: 'authorized',
                                   nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
                                   ...features
                            }
                     })

                     revalidatePath('/dashboard/suscripcion')
                     return { success: true }
              } catch (error) {
                     console.error("Error processing Stripe session:", error)
                     throw error
              }
       }

       // MERCADOPAGO FLOW (default)
       const subscription = await getSubscription(preapprovalId)
       if (!subscription) throw new Error("No se pudo verificar la suscripción")

       if (subscription.status !== 'authorized') {
              throw new Error("La suscripción no está autorizada")
       }

       const [refClubId, refPlanId] = (subscription.external_reference || '').split(':')

       if (refClubId !== clubId) {
              throw new Error("El ID del club no coincide con la suscripción")
       }

       const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
       const features = plan ? getPlanFeatures(plan.name) : {}

       await prisma.club.update({
              where: { id: clubId },
              data: {
                     mpPreapprovalId: preapprovalId,
                     platformPlanId: refPlanId,
                     subscriptionStatus: subscription.status,
                     nextBillingDate: subscription.next_payment_date ? new Date(subscription.next_payment_date) : undefined,
                     ...features
              }
       })

       revalidatePath('/dashboard/suscripcion')
       return { success: true }
}
