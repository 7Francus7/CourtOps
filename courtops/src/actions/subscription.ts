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

       for (const p of DEFAULT_PLANS) {
              const existing = existingPlans.find(ep => ep.name === p.name)
              if (existing) {
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

       const planNames = DEFAULT_PLANS.map(p => p.name)
       await prisma.platformPlan.deleteMany({
              where: { name: { notIn: planNames } }
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
              stripeSubscriptionId: club.stripeSubscriptionId,
              availablePlans: allPlans.map(p => ({
                     ...p,
                     features: JSON.parse(p.features) as string[]
              })),
              isConfigured: hasToken || isDev,
              isDevMode: isDev && !hasToken,
              paymentProvider: platformProvider,
       }
}

export async function initiateSubscription(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
       const clubId = await getCurrentClubId()
       const club = await prisma.club.findUnique({
              where: { id: clubId },
              include: { users: true }
       })

       if (!club) throw new Error("Club no encontrado")

       const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
       if (!plan) throw new Error("Plan no válido")

       let finalPrice = plan.price
       let frequency = 1
       const frequencyType = 'months'

       if (billingCycle === 'yearly') {
              finalPrice = plan.price * 0.8 // monthly price with 20% discount
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

       const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
       const payerEmail = adminUser?.email || 'admin@courtops.com'

       const platformProvider = process.env.PLATFORM_PAYMENT_PROVIDER || 'mercadopago'

       if (platformProvider === 'stripe') {
              try {
                     const { adapter } = getPlatformPaymentAdapter()
                     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

                     const stripePriceId = billingCycle === 'yearly'
                            ? plan.stripePriceIdYearly
                            : plan.stripePriceIdMonthly

                     // If club already has a Stripe subscription, try upgrading in place
                     if (club.stripeSubscriptionId?.startsWith('sub_') && stripePriceId) {
                            try {
                                   const stripeAdapter = adapter as any
                                   if (typeof stripeAdapter.updateSubscription === 'function') {
                                          const updateResult = await stripeAdapter.updateSubscription(club.stripeSubscriptionId, stripePriceId)
                                          if (updateResult.success) {
                                                 // Apply new plan features
                                                 const features = getPlanFeatures(plan.name)
                                                 await prisma.club.update({
                                                        where: { id: clubId },
                                                        data: {
                                                               platformPlanId: planId,
                                                               ...features,
                                                        }
                                                 })
                                                 revalidatePath('/dashboard/suscripcion')
                                                 return {
                                                        success: true,
                                                        init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${club.stripeSubscriptionId}&status=authorized`
                                                 }
                                          }
                                   }
                            } catch (e) {
                                   console.error("Failed to update Stripe subscription in-place, creating new checkout:", e)
                            }
                     }

                     // Cancel previous subscription before creating new
                     if (club.stripeSubscriptionId?.startsWith('sub_')) {
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
       if (club.mpPreapprovalId && (club.subscriptionStatus === 'authorized' || club.subscriptionStatus === 'ACTIVE')) {
              try {
                     await cancelSubscriptionMP(club.mpPreapprovalId)
              } catch (e) {
                     console.error("Failed to cancel previous subscription:", e)
              }
       }

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

       // DEV mode
       if (club.mpPreapprovalId?.startsWith('DEV_') || club.stripeSubscriptionId?.startsWith('DEV_')) {
              await prisma.club.update({
                     where: { id: clubId },
                     data: {
                            subscriptionStatus: 'cancelled',
                            stripeSubscriptionId: null,
                     }
              })
              revalidatePath('/dashboard/suscripcion')
              return { success: true, message: "Suscripción cancelada (Modo Desarrollo)." }
       }

       // Stripe cancellation
       if (club.stripeSubscriptionId?.startsWith('sub_')) {
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
                            return { success: true, message: "Suscripción cancelada exitosamente." }
                     }
              } catch (error) {
                     console.error("Error in Stripe cancelSubscription:", error)
              }
       }

       // MercadoPago cancellation
       if (club.mpPreapprovalId) {
              try {
                     const res = await cancelSubscriptionMP(club.mpPreapprovalId)
                     if (res.success) {
                            await prisma.club.update({
                                   where: { id: clubId },
                                   data: { subscriptionStatus: 'cancelled' }
                            })
                            revalidatePath('/dashboard/suscripcion')
                            return { success: true, message: "Suscripción cancelada exitosamente." }
                     } else {
                            await prisma.club.update({
                                   where: { id: clubId },
                                   data: { subscriptionStatus: 'CANCELLED_PENDING' }
                            })
                            revalidatePath('/dashboard/suscripcion')
                            return { success: true, message: "Suscripción marcada como pendiente de cancelación." }
                     }
              } catch (error) {
                     console.error("Error in cancelSubscription:", error)
              }
       }

       // Fallback
       await prisma.club.update({
              where: { id: clubId },
              data: { subscriptionStatus: 'CANCELLED_PENDING' }
       })

       revalidatePath('/dashboard/suscripcion')
       return { success: true, message: "Suscripción marcada para cancelar. Contacte soporte si el estado no cambia." }
}

export async function handleSubscriptionSuccess(preapprovalId: string) {
       const clubId = await getCurrentClubId()

       // DEV MODE
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

       // STRIPE SESSION (session_id from Stripe Checkout)
       if (preapprovalId.startsWith('cs_') || preapprovalId.startsWith('sub_')) {
              // Webhook handles the actual subscription activation.
              // This callback just verifies the session status for the UI.
              try {
                     const { adapter } = getPlatformPaymentAdapter()
                     const status = await adapter.getSubscriptionStatus(preapprovalId)

                     if (!status || (status.status !== 'authorized' && status.status !== 'paid')) {
                            throw new Error("La sesión de Stripe no está confirmada aún. El webhook la activará automáticamente.")
                     }

                     // Ensure club is linked (webhook may have done this already)
                     const club = await prisma.club.findUnique({ where: { id: clubId } })
                     if (club && club.subscriptionStatus !== 'authorized') {
                            // Webhook hasn't processed yet — extract ref and apply
                            const externalRef = status.externalReference || ''
                            const parts = externalRef.split(':')
                            if (parts.length >= 2) {
                                   const [refClubId, refPlanId, cycle] = parts
                                   if (refClubId === clubId) {
                                          const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
                                          const features = plan ? getPlanFeatures(plan.name) : {}
                                          const daysToAdd = cycle === 'yearly' ? 365 : 30

                                          await prisma.club.update({
                                                 where: { id: clubId },
                                                 data: {
                                                        platformPlanId: refPlanId,
                                                        subscriptionStatus: 'authorized',
                                                        nextBillingDate: status.nextPaymentDate
                                                               ? new Date(status.nextPaymentDate)
                                                               : new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
                                                        ...features,
                                                 }
                                          })
                                   }
                            }
                     }

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
