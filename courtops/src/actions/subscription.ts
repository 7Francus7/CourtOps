'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, createSetupFeePreference, cancelSubscriptionMP, getPlatformPayment, getSubscription } from './mercadopago'
import { revalidatePath } from 'next/cache'
import { getPlanFeatures } from '@/lib/plan-features'
import { syncOfficialPlatformPlans } from '@/lib/platform-plans'

function hasPaidSetupFee(club: { setupFeePaidAt?: Date | null; setupFeePaymentId?: string | null; mpPreapprovalId?: string | null }) {
	return Boolean(club.setupFeePaidAt || club.setupFeePaymentId || club.mpPreapprovalId)
}

function getPlanBilling(planPrice: number, billingCycle: 'monthly' | 'yearly') {
	if (billingCycle === 'yearly') {
		return { price: Math.round(planPrice * 12 * 0.8), frequency: 12, frequencyType: 'months' }
	}

	return { price: planPrice, frequency: 1, frequencyType: 'months' }
}

function getFirstRecurringStartDate(setupFeePaidAt?: Date | null) {
	const startDate = new Date(setupFeePaidAt || Date.now())
	startDate.setDate(startDate.getDate() + 30)
	return startDate
}

export async function getSubscriptionDetails() {
	const clubId = await getCurrentClubId()

	await syncOfficialPlatformPlans(prisma)

	const club = await prisma.club.findUnique({
		where: { id: clubId },
		include: { platformPlan: true }
	})

	if (!club) throw new Error("Club no encontrado")

	const allPlans = await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } })

	const pendingPlan = club.pendingPlanId
		? allPlans.find(p => p.id === club.pendingPlanId) ?? null
		: null

	const isDev = process.env.NODE_ENV === 'development'
	const hasToken = !!process.env.MP_ACCESS_TOKEN

	return {
		currentPlan: club.platformPlan,
		subscriptionStatus: club.subscriptionStatus,
		nextBillingDate: club.nextBillingDate,
		setupFeePaidAt: club.setupFeePaidAt,
		availablePlans: allPlans.map(p => ({
			...p,
			setupFee: p.setupFee ?? 0,
			features: JSON.parse(p.features) as string[]
		})),
		pendingPlan: pendingPlan
			? {
				...pendingPlan,
				setupFee: pendingPlan.setupFee ?? 0,
				features: JSON.parse(pendingPlan.features) as string[]
			}
			: null,
		pendingBillingCycle: club.pendingBillingCycle as 'monthly' | 'yearly' | null,
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

	const { price, frequency, frequencyType } = getPlanBilling(plan.price, billingCycle)

	const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
	const payerEmail = adminUser?.email || 'admin@courtops.com'
	const setupFee = plan.setupFee ?? 0
	const shouldChargeSetupFee = setupFee > 0 && !hasPaidSetupFee(club)

	if (!process.env.MP_ACCESS_TOKEN) {
		if (shouldChargeSetupFee) {
			await prisma.club.update({
				where: { id: clubId },
				data: {
					setupFeePaidAt: new Date(),
					setupFeePaymentId: `DEV_SETUP_${clubId}:${planId}:${billingCycle}`,
				},
			})
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const fakeId = `DEV_${clubId}:${planId}:${billingCycle}`

		return {
			success: true,
			init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
		}
	}

	if (shouldChargeSetupFee) {
		return createSetupFeePreference(
			clubId,
			plan.name,
			setupFee,
			payerEmail,
			`SETUP:${clubId}:${planId}:${billingCycle}`
		)
	}

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
		price,
		payerEmail,
		`${clubId}:${planId}:${billingCycle}`,
		frequency,
		frequencyType,
		!club.mpPreapprovalId && hasPaidSetupFee(club) ? getFirstRecurringStartDate(club.setupFeePaidAt) : undefined
	)

	return result
}

export async function handleSetupFeeSuccess(paymentId: string) {
	const clubId = await getCurrentClubId()

	if (!paymentId) throw new Error("No se pudo verificar el pago inicial")

	const payment = await getPlatformPayment(paymentId)
	if (!payment) throw new Error("No se pudo verificar el pago inicial")

	if (payment.status !== 'approved') {
		throw new Error("El pago inicial todavÃ­a no fue aprobado")
	}

	const [kind, refClubId, refPlanId, cycle = 'monthly'] = (payment.external_reference || '').split(':')

	if (kind !== 'SETUP' || refClubId !== clubId || !refPlanId) {
		throw new Error("La referencia del pago inicial no coincide con tu club")
	}

	const billingCycle = cycle === 'yearly' ? 'yearly' : 'monthly'
	const club = await prisma.club.findUnique({
		where: { id: clubId },
		include: { users: true }
	})
	const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })

	if (!club || !plan) throw new Error("No se pudo preparar la suscripciÃ³n")

	if (!hasPaidSetupFee(club)) {
		await prisma.club.update({
			where: { id: clubId },
			data: {
				setupFeePaidAt: new Date(),
				setupFeePaymentId: String(payment.id),
			}
		})
	}

	const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
	const payerEmail = adminUser?.email || 'admin@courtops.com'
	const { price, frequency, frequencyType } = getPlanBilling(plan.price, billingCycle)

	return createSubscriptionPreference(
		clubId,
		plan.name,
		price,
		payerEmail,
		`${clubId}:${refPlanId}:${billingCycle}`,
		frequency,
		frequencyType,
		getFirstRecurringStartDate(new Date())
	)
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
		return { success: true, message: "Suscripción cancelada correctamente." }
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
				return { success: true, message: "Suscripción cancelada. Seguirá activa hasta fin de período." }
			}
		} catch (error) {
			console.error("Cancel error:", error)
		}
	}

	await prisma.club.update({
		where: { id: clubId },
		data: { subscriptionStatus: 'cancelled' }
	})

	revalidatePath('/dashboard/suscripcion')
	return { success: true, message: "Suscripción cancelada." }
}

export async function changePlan(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
	const clubId = await getCurrentClubId()
	const club = await prisma.club.findUnique({
		where: { id: clubId },
		include: { users: true, platformPlan: true }
	})

	if (!club) throw new Error("Club no encontrado")

	const currentPlan = club.platformPlan
	const isActive = club.subscriptionStatus?.toLowerCase() === 'authorized' || club.subscriptionStatus?.toLowerCase() === 'active'
	const newPlan = await prisma.platformPlan.findUnique({ where: { id: planId } })
	if (!newPlan) throw new Error("Plan no válido")

	if (!isActive) {
		return initiateSubscription(planId, billingCycle)
	}

	if (currentPlan?.id === newPlan.id) {
		return { success: false, error: "Ya tenés este plan" }
	}

	const isUpgrade = newPlan.price > (currentPlan?.price || 0)

	if (!isUpgrade) {
		await prisma.club.update({
			where: { id: clubId },
			data: {
				pendingPlanId: planId,
				pendingBillingCycle: billingCycle,
			}
		})
		revalidatePath('/dashboard/suscripcion')
		return {
			success: true,
			pending: true,
			message: `Tu plan cambiará a ${newPlan.name} cuando venza el período actual. No se reembolsa la diferencia.`
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

	if (!process.env.MP_ACCESS_TOKEN) {
		const fakeId = `DEV_CHANGE_${clubId}:${planId}:${billingCycle}:upgrade`
		return {
			success: true,
			init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
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

	let price = newPlan.price
	let frequency = 1

	if (billingCycle === 'yearly') {
		price = Math.round(newPlan.price * 12 * 0.8)
		frequency = 12
	}

	const result = await createSubscriptionPreference(
		clubId,
		newPlan.name,
		price,
		payerEmail,
		`${clubId}:${planId}:${billingCycle}:upgrade`,
		frequency,
		'months'
	)

	return result
}

export async function cancelPendingDowngrade() {
	const clubId = await getCurrentClubId()
	await prisma.club.update({
		where: { id: clubId },
		data: { pendingPlanId: null, pendingBillingCycle: null }
	})
	revalidatePath('/dashboard/suscripcion')
	return { success: true }
}

export async function handleSubscriptionSuccess(preapprovalId: string) {
	const clubId = await getCurrentClubId()

	if (preapprovalId.startsWith('DEV_')) {
		const parts = preapprovalId.replace('DEV_', '').split(':')
		if (parts.length < 2) throw new Error("ID inválido")

		const [refClubId, refPlanId, cycle] = parts

		if (refClubId !== clubId) {
			throw new Error("ID de club no coincide")
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

	const subscription = await getSubscription(preapprovalId)
	if (!subscription) throw new Error("No se pudo verificar la suscripción")

	if (subscription.status !== 'authorized') {
		throw new Error("Suscripción no autorizada")
	}

	const [refClubId, refPlanId] = (subscription.external_reference || '').split(':')

	if (refClubId !== clubId) {
		throw new Error("ID de club no coincide")
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
