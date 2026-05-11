'use server'

import prisma from '@/lib/db'
import { getCurrentClubId } from '@/lib/tenant'
import { createSubscriptionPreference, cancelSubscriptionMP, getSubscription } from './mercadopago'
import { revalidatePath } from 'next/cache'
import { getPlanFeatures } from '@/lib/plan-features'
import { syncOfficialPlatformPlans } from '@/lib/platform-plans'
import { logger } from '@/lib/app-logger'

function getPlanBilling(planPrice: number, billingCycle: 'monthly' | 'yearly') {
	if (billingCycle === 'yearly') {
		return { price: Math.round(planPrice * 12 * 0.8), frequency: 12, frequencyType: 'months' }
	}

	return { price: planPrice, frequency: 1, frequencyType: 'months' }
}

export async function getSubscriptionDetails() {
	const clubId = await getCurrentClubId()

	try {
		await syncOfficialPlatformPlans(prisma)
	} catch (e) {
		console.error("Error syncing platform plans:", e)
	}

	const club = await prisma.club.findUnique({
		where: { id: clubId },
		include: { platformPlan: true }
	})

	if (!club) throw new Error("Club no encontrado")

	// Days remaining
	const now = new Date()
	let daysRemaining: number | null = null
	if (club.subscriptionStatus === 'TRIAL') {
		const trialEnd = new Date(club.createdAt)
		trialEnd.setDate(trialEnd.getDate() + 7)
		daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000))
	} else {
		const endDate = club.subscriptionEnd || club.nextBillingDate
		if (endDate) daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
	}

	const allPlans = await prisma.platformPlan.findMany({ orderBy: { price: 'asc' } })

	const pendingPlan = club.pendingPlanId
		? allPlans.find(p => p.id === club.pendingPlanId) ?? null
		: null

	const safePlans = allPlans.map(p => {
		let features: string[] = []
		try {
			features = p.features ? JSON.parse(p.features) : []
			if (!Array.isArray(features)) features = []
		} catch (e) {
			console.error(`Error parsing features for plan ${p.name}:`, e)
		}
		return {
			...p,
			setupFee: p.setupFee ?? 0,
			features
		}
	})

	const pendingPlanDetails = pendingPlan ? (() => {
		let features: string[] = []
		try {
			features = pendingPlan.features ? JSON.parse(pendingPlan.features) : []
			if (!Array.isArray(features)) features = []
		} catch (e) {
			console.error(`Error parsing features for pending plan ${pendingPlan.name}:`, e)
		}
		return {
			...pendingPlan,
			setupFee: pendingPlan.setupFee ?? 0,
			features
		}
	})() : null

	const isDev = process.env.NODE_ENV === 'development'
	const hasToken = !!process.env.MP_ACCESS_TOKEN

	return {
		currentPlan: club.platformPlan,
		subscriptionStatus: club.subscriptionStatus,
		nextBillingDate: club.nextBillingDate,
		availablePlans: safePlans,
		pendingPlan: pendingPlanDetails,
		pendingBillingCycle: club.pendingBillingCycle as 'monthly' | 'yearly' | null,
		isConfigured: hasToken || isDev,
		isDevMode: isDev && !hasToken,
		// New billing fields
		daysRemaining,
		subscriptionEnd: club.subscriptionEnd?.toISOString() ?? null,
		subscriptionMethod: club.subscriptionMethod ?? 'MERCADOPAGO',
		bankDetails: {
			alias: process.env.COURTOPS_BANK_ALIAS || 'courtops.admin',
			cvu: process.env.COURTOPS_BANK_CVU || '',
			accountName: process.env.COURTOPS_BANK_ACCOUNT_NAME || 'CourtOps',
		},
	}
}

export async function initiateSubscription(planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') {
	const log = logger.child({ planId, billingCycle, action: 'initiateSubscription' })
	
	try {
		const clubId = await getCurrentClubId()
		const club = await prisma.club.findUnique({
			where: { id: clubId },
			include: { users: true }
		})

		if (!club) {
			log.error("Club no encontrado", { clubId })
			return { success: false, error: "Club no encontrado" }
		}

		const plan = await prisma.platformPlan.findUnique({ where: { id: planId } })
		if (!plan) {
			log.error("Plan no válido", { planId })
			return { success: false, error: "Plan no válido" }
		}

		log.info("Iniciando suscripción", { clubId, planName: plan.name, price: plan.price })

		const features = getPlanFeatures(plan.name)
		const courtCount = await prisma.court.count({ where: { clubId, deletedAt: null } })
		if (courtCount > features.maxCourts) {
			log.warn("Exceso de canchas para el plan", { clubId, courtCount, maxCourts: features.maxCourts })
			return {
				success: false,
				error: `El plan ${plan.name} permite hasta ${features.maxCourts} canchas, pero tenés ${courtCount} registradas. Por favor, eliminá canchas desde Configuración o elegí un plan superior.`
			}
		}

		const { price, frequency, frequencyType } = getPlanBilling(plan.price, billingCycle)
		const adminUser = club.users.find(u => u.role === 'ADMIN' || u.role === 'OWNER') || club.users[0]
		const payerEmail = adminUser?.email || 'admin@courtops.com'

		if (!process.env.MP_ACCESS_TOKEN) {
			log.warn("MP_ACCESS_TOKEN no configurada, usando modo demo", { clubId })
			const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
			const fakeId = `DEV_${clubId}:${planId}:${billingCycle}`
			return {
				success: true,
				init_point: `${baseUrl}/dashboard/suscripcion/status?preapproval_id=${fakeId}&status=authorized`
			}
		}

		if (club.mpPreapprovalId && (club.subscriptionStatus === 'authorized' || club.subscriptionStatus === 'ACTIVE')) {
			try {
				log.info("Cancelando suscripción previa", { preapprovalId: club.mpPreapprovalId })
				await cancelSubscriptionMP(club.mpPreapprovalId)
			} catch (e) {
				log.error("Fallo al cancelar suscripción anterior", { error: e })
			}
		}

		log.info("Creando preferencia de suscripción recurrente", { clubId, price, frequency })
		return createSubscriptionPreference(
			clubId,
			plan.name,
			price,
			payerEmail,
			`${clubId}:${planId}:${billingCycle}`,
			frequency,
			frequencyType,
		)
	} catch (error: any) {
		log.error("Error crítico en initiateSubscription", { 
			message: error?.message, 
			stack: error?.stack 
		})
		return { 
			success: false, 
			error: error instanceof Error ? error.message : "Error interno del servidor al procesar la suscripción" 
		}
	}
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
	const log = logger.child({ planId, billingCycle, action: 'changePlan' })

	try {
		const clubId = await getCurrentClubId()
		const club = await prisma.club.findUnique({
			where: { id: clubId },
			include: { users: true, platformPlan: true }
		})

		if (!club) {
			log.error("Club no encontrado", { clubId })
			return { success: false, error: "Club no encontrado" }
		}

		const currentPlan = club.platformPlan
		const isActive = club.subscriptionStatus?.toLowerCase() === 'authorized' || club.subscriptionStatus?.toLowerCase() === 'active'
		
		const newPlan = await prisma.platformPlan.findUnique({ where: { id: planId } })
		if (!newPlan) {
			log.error("Plan no válido", { planId })
			return { success: false, error: "Plan no válido" }
		}

		log.info("Cambiando plan", { 
			clubId, 
			from: currentPlan?.name, 
			to: newPlan.name,
			isActive 
		})

		const features = getPlanFeatures(newPlan.name)
		const courtCount = await prisma.court.count({ where: { clubId, deletedAt: null } })
		if (courtCount > features.maxCourts) {
			log.warn("Exceso de canchas para el nuevo plan", { clubId, courtCount, maxCourts: features.maxCourts })
			return { 
				success: false, 
				error: `El plan ${newPlan.name} permite hasta ${features.maxCourts} canchas, pero tenés ${courtCount} registradas. Por favor, eliminá canchas o elegí un plan superior.` 
			}
		}

		if (!isActive) {
			log.info("Suscripción no activa, iniciando nueva", { clubId })
			return initiateSubscription(planId, billingCycle)
		}

		if (currentPlan?.id === newPlan.id) {
			return { success: false, error: "Ya tenés este plan" }
		}

		const isUpgrade = newPlan.price > (currentPlan?.price || 0)

		if (!isUpgrade) {
			log.info("Downgrade detectado, programando cambio", { clubId, planId })
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

		// Upgrade flow
		log.info("Upgrade detectado, procediendo a MercadoPago", { clubId })
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

		if (!process.env.MP_ACCESS_TOKEN) {
			log.warn("MP_ACCESS_TOKEN no configurada en upgrade, usando modo demo", { clubId })
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
				log.info("Cancelando suscripción anterior para upgrade", { preapprovalId: club.mpPreapprovalId })
				await cancelSubscriptionMP(club.mpPreapprovalId)
			} catch (e) {
				log.error("Error al cancelar suscripción previa en upgrade", { error: e })
			}
		}

		let price = newPlan.price
		let frequency = 1

		if (billingCycle === 'yearly') {
			price = Math.round(newPlan.price * 12 * 0.8)
			frequency = 12
		}

		log.info("Creando preferencia de upgrade", { clubId, price, frequency })
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
	} catch (error: any) {
		log.error("Error crítico en changePlan", { 
			message: error?.message, 
			stack: error?.stack 
		})
		return { 
			success: false, 
			error: error instanceof Error ? error.message : "Error interno del servidor al cambiar el plan" 
		}
	}
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
	const log = logger.child({ preapprovalId, action: 'handleSubscriptionSuccess' })

	try {
		const clubId = await getCurrentClubId()

		if (preapprovalId.startsWith('DEV_')) {
			log.info("Procesando éxito de suscripción en modo DEV", { preapprovalId })
			const parts = preapprovalId.replace('DEV_', '').split(':')
			if (parts.length < 2) throw new Error("ID inválido")

			const [refClubId, refPlanId, cycle] = parts

			if (refClubId !== clubId) {
				log.error("ID de club no coincide en modo DEV", { refClubId, clubId })
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

		log.info("Verificando suscripción en MercadoPago", { preapprovalId })
		const subscription = await getSubscription(preapprovalId)
		if (!subscription) {
			log.error("No se encontró la suscripción en MercadoPago", { preapprovalId })
			throw new Error("No se pudo verificar la suscripción")
		}

		if (subscription.status !== 'authorized') {
			log.warn("Suscripción no autorizada en MercadoPago", { preapprovalId, status: subscription.status })
			throw new Error("Suscripción no autorizada")
		}

		const [refClubId, refPlanId] = (subscription.external_reference || '').split(':')

		if (refClubId !== clubId) {
			log.error("ID de club no coincide con la suscripción", { refClubId, clubId })
			throw new Error("ID de club no coincide")
		}

		const plan = await prisma.platformPlan.findUnique({ where: { id: refPlanId } })
		if (!plan) throw new Error("Plan no encontrado")
		
		const features = getPlanFeatures(plan.name)

		log.info("Activando plan para el club", { clubId, planName: plan.name })
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
	} catch (error: any) {
		log.error("Error en handleSubscriptionSuccess", { message: error?.message })
		throw error
	}
}

export async function submitSaaSReceipt(planId: string, billingCycle: 'monthly' | 'yearly', receiptUrl: string, reference: string) {
	const clubId = await getCurrentClubId()
	
	await prisma.club.update({
		where: { id: clubId },
		data: {
			subscriptionStatus: 'PENDING_VALIDATION',
			subscriptionMethod: 'TRANSFER',
			subscriptionReference: reference,
			subscriptionReceiptUrl: receiptUrl,
			pendingPlanId: planId,
			pendingBillingCycle: billingCycle
		}
	})

	revalidatePath('/dashboard/suscripcion')
	return { success: true }
}
