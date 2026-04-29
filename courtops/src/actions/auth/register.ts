'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getPlanFeatures } from '@/lib/plan-features'

export async function registerClub(formData: FormData) {
	try {
		const clubName = formData.get('clubName') as string
		const email = formData.get('email') as string
		const password = formData.get('password') as string
		const userName = formData.get('userName') as string
		const plan = (formData.get('plan') as string)?.replace(/_ANUAL$/, '')

		if (!clubName || !email || !password || !userName) {
			return { success: false, error: 'Faltan campos requeridos.' }
		}

		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return { success: false, error: 'El email ya está registrado.' }
		}

		const slug = clubName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Math.floor(Math.random() * 1000)

		const nextBillingDate = new Date()
		nextBillingDate.setDate(nextBillingDate.getDate() + 7)

		let platformPlanId: string | undefined = undefined
		let maxCourts = 2
		let maxUsers = 3
		let hasKiosco = false
		let hasOnlinePayments = false
		let hasAdvancedReports = false
		let hasTournaments = false
		let hasWhatsApp = false
		let hasWaivers = false
		let hasCustomDomain = false

		const isFreePlan = plan === 'FREE'

		if (isFreePlan) {
			maxCourts = 2
			maxUsers = 3
			hasKiosco = true
			hasOnlinePayments = false
			hasAdvancedReports = true
			hasTournaments = true
			hasWhatsApp = false
			hasWaivers = true
		} else {
			const platformPlan = await prisma.platformPlan.findFirst({
				where: { name: { equals: plan, mode: 'insensitive' } }
			})

			if (platformPlan) {
				platformPlanId = platformPlan.id
				const features = getPlanFeatures(platformPlan.name)
				maxCourts = features.maxCourts
				maxUsers = features.maxUsers
				hasKiosco = features.hasKiosco
				hasOnlinePayments = features.hasOnlinePayments
				hasAdvancedReports = features.hasAdvancedReports
				hasTournaments = features.hasTournaments
				hasWhatsApp = features.hasWhatsApp
				hasWaivers = features.hasWaivers
				hasCustomDomain = features.hasCustomDomain
			}
		}

		const hashedPassword = await bcrypt.hash(password, 12)

		await prisma.$transaction(async (tx) => {
			const club = await tx.club.create({
				data: {
					name: clubName,
					slug: slug,
					plan: 'BASIC',
					platformPlanId: platformPlanId,
					subscriptionStatus: 'TRIAL',
					nextBillingDate: nextBillingDate,
					maxCourts,
					maxUsers,
					hasKiosco,
					hasOnlinePayments,
					hasAdvancedReports,
					hasTournaments,
					hasWhatsApp,
					hasWaivers,
					hasCustomDomain,
					openTime: '08:00',
					closeTime: '23:00',
					slotDuration: 90,
					themeColor: '#10b981',
				}
			})

			await tx.user.create({
				data: {
					name: userName,
					email: email,
					password: hashedPassword,
					role: 'ADMIN',
					clubId: club.id
				}
			})

			await tx.priceRule.create({
				data: {
					clubId: club.id,
					name: 'Precio Base',
					price: 10000,
					daysOfWeek: '0,1,2,3,4,5,6',
					startTime: '00:00',
					endTime: '23:59',
					priority: 0
				}
			})
		})

		import('@/lib/email').then(({ sendWelcomeEmail }) => {
			sendWelcomeEmail(email, userName, clubName).catch(err => console.error('Failed to send welcome email', err))
		})

		return { success: true }
	} catch (error: unknown) {
		console.error('Registration Error:', error)
		return { success: false, error: 'Error al crear la cuenta. Intente nuevamente.' }
	}
}
