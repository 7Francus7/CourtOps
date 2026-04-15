'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, cancelSubscriptionMP, getSubscription } from './mercadopago'
import { revalidatePath } from 'next/cache'
import { getPlanFeatures } from '@/lib/plan-features'

function formatCurrency(amount: number) {
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		maximumFractionDigits: 0
	}).format(amount)
}

const DEFAULT_PLANS = [
       {
              name: 'Arranque',
              price: 45000,
              features: JSON.stringify(['Hasta 2 Canchas', 'Turnero Digital', 'Caja & Cobros', 'QR Check-in', 'Soporte por Email']),
       },
       {
              name: 'Élite',
              price: 85000,
              features: JSON.stringify(['Hasta 8 Canchas', 'Kiosco / POS', 'WhatsApp Automático', 'Torneos', 'Firma Digital', 'Reportes Avanzados', 'Soporte Prioritario 24/7']),
       },
       {
              name: 'VIP',
              price: 150000,
              features: JSON.stringify(['Canchas Ilimitadas', 'Multi-Sede', 'API / Webhooks', 'Marca Blanca', 'Account Manager']),
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
              isDevMode: isDev && !hasToken,
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
              finalPrice = plan.price * 0.8
              frequency = 12
       }

        // DEV MODE BYPASS (when no MP token configured)
        if (!process.env.MP_ACCESS_TOKEN) {
               const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
               const fakeId = `DEV_${clubId}:${planId}:${billingCycle}`

               return {
                      success: true,
                      init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
               }
        }

        if (finalPrice < 15) {
               return {
                      success: false,
                      error: `El precio del plan (${formatCurrency(finalPrice)}) es menor a $15 ARS (mínimo de MercadoPago).`
               }
        }

       const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
       const payerEmail = adminUser?.email || 'admin@courtops.com'

       // Cancel previous subscription if exists
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

	await prisma.club.update({
		where: { id: clubId },
		data: { subscriptionStatus: 'CANCELLED_PENDING' }
	})

	revalidatePath('/dashboard/suscripcion')
	return { success: true, message: "Suscripción marcada para cancelar. Contacte soporte si el estado no cambia." }
}

export type PlanChangeType = 'upgrade' | 'downgrade' | 'same'

export async function changePlan(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
	const clubId = await getCurrentClubId()
	const club = await prisma.club.findUnique({
		where: { id: clubId },
		include: { users: true, platformPlan: true }
	})

	if (!club) throw new Error("Club no encontrado")

	const currentPlan = club.platformPlan
	const newPlan = await prisma.platformPlan.findUnique({ where: { id: planId } })
	if (!newPlan) throw new Error("Plan no válido")

	if (currentPlan?.id === newPlan.id) {
		return { success: false, error: "Ya tienes este plan activo" }
	}

	const isUpgrade = newPlan.price > (currentPlan?.price || 0)
	const changeType: PlanChangeType = isUpgrade ? 'upgrade' : 'downgrade'

	let newPrice = newPlan.price
	if (billingCycle === 'yearly') {
		newPrice = newPlan.price * 0.8
	}

	const currentPrice = currentPlan?.price || 0
	let proratedCredit = 0
	let daysRemaining = 0

	if (currentPlan && club.nextBillingDate) {
		const now = new Date()
		const nextBilling = new Date(club.nextBillingDate)
		daysRemaining = Math.max(0, Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
		const currentCycleDays = billingCycle === 'yearly' ? 365 : 30
		
		if (daysRemaining > 0 && currentPrice > 0) {
			proratedCredit = Math.round((currentPrice * daysRemaining) / currentCycleDays)
		}
	}

	const finalPrice = Math.max(0, newPrice - proratedCredit)

	const hasMPAccess = !!process.env.MP_ACCESS_TOKEN

	if (!hasMPAccess) {
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const fakeId = `DEV_CHANGE_${clubId}:${planId}:${billingCycle}:${changeType}`

		return {
			success: true,
			init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`,
			changeType,
			proratedCredit,
			newPrice,
			finalPrice,
			daysRemaining: 0
		}
	}

	if (finalPrice < 15) {
		return {
			success: false,
			error: `La diferencia a cobrar (${formatCurrency(finalPrice)}) es menor a $15 ARS (mínimo de MercadoPago). El cambio de plan se aplicará al finalizar tu período actual.`,
			changeType,
			proratedCredit,
			newPrice,
			finalPrice,
			daysRemaining
		}
	}

	const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
	const payerEmail = adminUser?.email || 'admin@courtops.com'

	if (club.mpPreapprovalId && (club.subscriptionStatus === 'authorized' || club.subscriptionStatus === 'ACTIVE')) {
		try {
			await cancelSubscriptionMP(club.mpPreapprovalId)
		} catch (e) {
			console.error("Failed to cancel previous subscription:", e)
		}
	}

	const frequency = billingCycle === 'yearly' ? 12 : 1
	const frequencyType = 'months'

	const result = await createSubscriptionPreference(
		clubId,
		newPlan.name,
		finalPrice > 0 ? finalPrice : 1,
		payerEmail,
		`${clubId}:${planId}:${billingCycle}:${changeType}`,
		frequency,
		frequencyType
	)

	return {
		...result,
		changeType,
		proratedCredit,
		newPrice,
		finalPrice,
		daysRemaining: 0
	}
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

       // MERCADOPAGO FLOW — verify with API
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
