'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, cancelSubscriptionMP, getSubscription } from './mercadopago'
import { revalidatePath } from 'next/cache'
import { getPlanFeatures } from '@/lib/plan-features'

const DEFAULT_PLANS = [
	{
		name: 'Arranque',
		price: 45000,
		setupFee: 100000,
		features: JSON.stringify([
			'Hasta 2 canchas de padel',
			'Hasta 3 empleados en el sistema',
			'Reservas online (link público)',
			'Turnero digital en tiempo real',
			'Caja diaria (apertura y cierre)',
			'QR Check-in',
			'Soporte por email L-V'
		]),
	},
	{
		name: 'Élite',
		price: 89000,
		setupFee: 100000,
		features: JSON.stringify([
			'Hasta 8 canchas de padel',
			'Hasta 10 empleados en el sistema',
			'Todo lo del plan Arranque',
			'Kiosco / Punto de venta con stock',
			'Pagos online con MercadoPago',
			'Notificaciones WhatsApp automáticas',
			'Gestión de torneos y brackets',
			'Waivers digitales (firma electrónica)',
			'Reportes financieros avanzados',
			'Soporte prioritario WhatsApp 24/7'
		]),
	},
	{
		name: 'VIP',
		price: 129000,
		setupFee: 100000,
		features: JSON.stringify([
			'Canchas ilimitadas',
			'Usuarios ilimitados',
			'Todo lo del plan Élite',
			'Dominio personalizado (ej: tuclub.com)',
			'Gestor de cuenta dedicado'
		]),
	}
]

export async function getSubscriptionDetails() {
	const clubId = await getCurrentClubId()

	const existingPlans = await prisma.platformPlan.findMany()

	for (const p of DEFAULT_PLANS) {
		const existing = existingPlans.find(ep => ep.name === p.name)
		if (existing) {
			if (existing.price !== p.price || existing.features !== p.features || existing.setupFee !== p.setupFee) {
				await prisma.platformPlan.update({
					where: { id: existing.id },
					data: { price: p.price, setupFee: p.setupFee, features: p.features }
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

	const pendingPlan = club.pendingPlanId
		? allPlans.find(p => p.id === club.pendingPlanId) ?? null
		: null

	const isDev = process.env.NODE_ENV === 'development'
	const hasToken = !!process.env.MP_ACCESS_TOKEN

	return {
		currentPlan: club.platformPlan,
		subscriptionStatus: club.subscriptionStatus,
		nextBillingDate: club.nextBillingDate,
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

	let price = plan.price
	let frequency = 1
	const frequencyType = 'months'

	if (billingCycle === 'yearly') {
		price = Math.round(plan.price * 12 * 0.8)
		frequency = 12
	}

	if (!process.env.MP_ACCESS_TOKEN) {
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
		const fakeId = `DEV_${clubId}:${planId}:${billingCycle}`

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

	const result = await createSubscriptionPreference(
		clubId,
		plan.name,
		price,
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
	const newPlan = await prisma.platformPlan.findUnique({ where: { id: planId } })
	if (!newPlan) throw new Error("Plan no válido")

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
