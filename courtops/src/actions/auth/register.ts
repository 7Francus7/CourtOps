'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

const TRIAL_DAYS = 14

export async function registerClub(formData: FormData) {
	try {
		const clubName = (formData.get('clubName') as string)?.trim()
		const email = (formData.get('email') as string)?.trim().toLowerCase()
		const password = formData.get('password') as string
		const userName = (formData.get('userName') as string)?.trim()

		if (!clubName || !email || !password || !userName) {
			return { success: false, error: 'Faltan campos requeridos.' }
		}

		const existingUser = await prisma.user.findUnique({ where: { email } })
		if (existingUser) {
			return { success: false, error: 'El email ya está registrado.' }
		}

		const slug = clubName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') + '-' + Math.floor(Math.random() * 1000)

		const nextBillingDate = new Date()
		nextBillingDate.setDate(nextBillingDate.getDate() + TRIAL_DAYS)

		const hashedPassword = await bcrypt.hash(password, 12)

		// El trial arranca con todas las funciones habilitadas (nivel Pro):
		// el usuario tiene que ver el valor completo antes de elegir plan.
		// Canchas y precios los crea el OnboardingWizard, no el registro —
		// así el wizard es la única fuente de configuración inicial.
		await prisma.$transaction(async (tx) => {
			const club = await tx.club.create({
				data: {
					name: clubName,
					slug: slug,
					plan: 'BASIC',
					subscriptionStatus: 'TRIAL',
					nextBillingDate: nextBillingDate,
					maxCourts: 8,
					maxUsers: 5,
					hasKiosco: true,
					hasOnlinePayments: true,
					hasAdvancedReports: true,
					hasTournaments: true,
					hasWhatsApp: false,
					hasWaivers: true,
					hasCustomDomain: false,
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
