import type { PrismaClient } from '@prisma/client'

export const OFFICIAL_PLATFORM_PLANS = [
	{
		name: 'Base',
		price: 45000,
		setupFee: 150000,
		legacyNames: ['Arranque', 'Básico', 'Basico', 'Inicial'],
		features: [
			'Hasta 2 canchas de padel',
			'Hasta 3 empleados en el sistema',
			'Reservas online (link público)',
			'Turnero digital en tiempo real',
			'Caja diaria (apertura y cierre)',
			'QR Check-in',
			'Soporte por email L-V',
		],
	},
	{
		name: 'Pro',
		price: 79000,
		setupFee: 150000,
		legacyNames: ['Élite', 'Elite', 'Profesional'],
		features: [
			'Hasta 8 canchas de padel',
			'Hasta 10 empleados en el sistema',
			'Todo lo del plan Base',
			'Kiosco / Punto de venta con stock',
			'Pagos online con MercadoPago',
			'Notificaciones WhatsApp automáticas',
			'Gestión de torneos y brackets',
			'Waivers digitales (firma electrónica)',
			'Reportes financieros avanzados',
			'Soporte prioritario WhatsApp 24/7',
		],
	},
	{
		name: 'Max',
		price: 119000,
		setupFee: 150000,
		legacyNames: ['VIP', 'Empresarial', 'Enterprise'],
		features: [
			'Canchas ilimitadas',
			'Usuarios ilimitados',
			'Todo lo del plan Pro',
			'Dominio personalizado (ej: tuclub.com)',
			'Gestor de cuenta dedicado',
		],
	},
] as const

export type OfficialPlatformPlanName = (typeof OFFICIAL_PLATFORM_PLANS)[number]['name']

export function normalizePlatformPlanName(planName: string): OfficialPlatformPlanName {
	const normalized = planName.trim().toLowerCase()

	for (const plan of OFFICIAL_PLATFORM_PLANS) {
		if (plan.name.toLowerCase() === normalized) return plan.name
		if ((plan.legacyNames as readonly string[]).some((legacyName) => legacyName.toLowerCase() === normalized)) {
			return plan.name
		}
	}

	if (normalized.includes('max') || normalized.includes('vip') || normalized.includes('empresarial') || normalized.includes('enterprise')) {
		return 'Max'
	}

	if (normalized.includes('pro') || normalized.includes('élite') || normalized.includes('elite')) {
		return 'Pro'
	}

	return 'Base'
}

export function serializePlatformPlanFeatures(features: readonly string[]) {
	return JSON.stringify([...features])
}

type PlatformPlanClient = Pick<PrismaClient, 'platformPlan' | 'club'>

export async function syncOfficialPlatformPlans(prisma: PlatformPlanClient) {
	const existingPlans = await prisma.platformPlan.findMany()

	for (const plan of OFFICIAL_PLATFORM_PLANS) {
		const officialExisting = existingPlans.find((existingPlan) => existingPlan.name === plan.name)
		const legacyNames = plan.legacyNames as readonly string[]
		const legacyExisting = existingPlans.filter((existingPlan) => legacyNames.includes(existingPlan.name))
		const planToUpdate = officialExisting || legacyExisting[0]

		const data = {
			name: plan.name,
			price: plan.price,
			setupFee: plan.setupFee,
			features: serializePlatformPlanFeatures(plan.features),
		}

		const officialPlan = planToUpdate
			? await prisma.platformPlan.update({
					where: { id: planToUpdate.id },
					data,
				})
			: await prisma.platformPlan.create({ data })

		const duplicateLegacyIds = legacyExisting
			.filter((legacyPlan) => legacyPlan.id !== officialPlan.id)
			.map((legacyPlan) => legacyPlan.id)

		if (duplicateLegacyIds.length > 0) {
			await prisma.club.updateMany({
				where: { platformPlanId: { in: duplicateLegacyIds } },
				data: { platformPlanId: officialPlan.id },
			})

			await prisma.platformPlan.deleteMany({
				where: { id: { in: duplicateLegacyIds } },
			})
		}

		await prisma.club.updateMany({
			where: { platformPlanId: officialPlan.id },
			data: { plan: plan.name.toUpperCase() },
		})
	}

	await prisma.platformPlan.deleteMany({
		where: {
			name: { notIn: OFFICIAL_PLATFORM_PLANS.map((plan) => plan.name) },
			clubs: { none: {} },
		},
	})
}
