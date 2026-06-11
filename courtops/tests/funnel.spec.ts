import { test, expect } from '@playwright/test'
import { OFFICIAL_PLATFORM_PLANS } from '../src/lib/platform-plans'
import { freshClub, registerNewClub, completeOnboarding } from './helpers'

const fmtARS = (n: number) =>
	new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

test.describe('Funnel completo: landing → registro → onboarding → link público', () => {
	test('1. Landing renderiza con CTA, planes coherentes y sin menciones a competidores', async ({ page }) => {
		await page.goto('/')

		// Hero + CTA principal. En mobile el CTA del nav vive en el menú hamburguesa.
		const visibleCta = page.locator('a[href^="/register"]').filter({ visible: true })
		if (await visibleCta.count() === 0) {
			await page.getByRole('button', { name: 'Menú' }).click()
			await expect(page.locator('a[href^="/register"]').filter({ visible: true }).first()).toBeVisible()
			await page.keyboard.press('Escape')
		} else {
			await expect(visibleCta.first()).toBeVisible()
		}

		// Pricing desde la fuente única — los 3 precios oficiales visibles
		for (const plan of OFFICIAL_PLATFORM_PLANS) {
			await expect(page.getByText(fmtARS(plan.price)).first()).toBeVisible()
		}

		// Sin mención al competidor ni rating fabricado
		const html = await page.content()
		expect(html).not.toContain('CourtReserve')
		expect(html).not.toContain('aggregateRating')
	})

	test('2-6. Registro 4 campos → auto-login → onboarding → canchas/precio → skip MP → link público', async ({ page }) => {
		const club = freshClub()

		// Registro: exactamente 4 campos visibles, sin selección de plan previa
		await page.goto('/register')
		await expect(page.getByText(/solo 4 datos/i)).toBeVisible()
		await expect(page.getByText(/elegí tu plan/i)).toHaveCount(0)

		await registerNewClub(page, club)

		// Auto-login verificado: estamos en dashboard CON el wizard de onboarding overlay
		await expect(page.getByText(/configuracion inicial/i)).toBeVisible({ timeout: 20_000 })

		// Onboarding completo con duración custom y precio custom
		const publicUrl = await completeOnboarding(page, {
			courts: ['Cancha Central', 'Cancha 2'],
			price: '18000',
			duration: '60',
		})

		expect(publicUrl).toContain('courtops')
		expect(publicUrl).toContain('/p/')

		// Ir al dashboard: el wizard no debe reaparecer
		await page.getByRole('button', { name: /ir al dashboard/i }).click()
		await page.waitForURL('**/dashboard**')
		await expect(page.getByText(/configuracion inicial/i)).toHaveCount(0)

		// 9. Trial banner visible con countdown claro
		await expect(page.getByText(/te quedan \d+ días de prueba/i)).toBeVisible()

		// 6. Link público abre y muestra el club (sin sesión)
		const slug = publicUrl.split('/p/')[1]
		await page.context().clearCookies()
		await page.goto(`/p/${slug}`)
		await expect(page.getByText(club.clubName).first()).toBeVisible({ timeout: 20_000 })
	})

	test('15. Página de suscripción muestra los mismos precios que la landing', async ({ page }) => {
		const club = freshClub()
		await registerNewClub(page, club)
		// Cerrar el wizard rápido (mínimo indispensable) para navegar
		await completeOnboarding(page)
		await page.getByRole('button', { name: /ir al dashboard/i }).click()
		await page.waitForURL('**/dashboard**')

		await page.goto('/dashboard/suscripcion')
		await expect(page.getByText(/prueba gratis activa/i)).toBeVisible({ timeout: 20_000 })
		for (const plan of OFFICIAL_PLATFORM_PLANS) {
			// La página tiene layout mobile (oculto en desktop) y desktop:
			// filtrar por elementos visibles en el viewport actual
			await expect(page.getByText(fmtARS(plan.price)).filter({ visible: true }).first()).toBeVisible()
		}
	})
})

test.describe('Error states', () => {
	test('18. Email duplicado da error humano, no stack', async ({ page }) => {
		const club = freshClub()
		await registerNewClub(page, club)
		await page.context().clearCookies()

		// Intentar registrar el mismo email otra vez
		await page.goto('/register')
		await page.getByPlaceholder('Ej: Arena Padel').fill('Otro Club')
		await page.getByPlaceholder('Franco Rossi').fill('Otro Usuario')
		await page.getByPlaceholder('admin@tuclub.com').fill(club.email)
		await page.getByPlaceholder('••••••••').fill('otra12345')
		await page.getByRole('button', { name: /crear mi club gratis/i }).click()

		await expect(page.getByText(/el email ya está registrado/i)).toBeVisible()
		// Seguimos en /register, sin crash
		expect(page.url()).toContain('/register')
	})

	test('18b. Slug público inexistente no muestra stack técnico', async ({ page }) => {
		const response = await page.goto('/p/club-que-no-existe-xyz')
		// Sea 404 o página de "no encontrado", nunca un stack de Prisma/Next
		const body = await page.content()
		expect(body).not.toMatch(/PrismaClient|P10\d\d|at async/i)
		expect(response?.status() ?? 200).toBeLessThan(500)
	})
})
