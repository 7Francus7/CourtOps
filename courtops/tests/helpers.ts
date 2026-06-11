import type { Page } from '@playwright/test'

/** Datos únicos por corrida — evita choques de email/slug entre corridas. */
export function freshClub() {
	const stamp = Date.now().toString(36)
	return {
		clubName: `QA Club ${stamp}`,
		userName: 'QA Tester',
		email: `qa-${stamp}@courtops-e2e.test`,
		password: 'qa123456',
	}
}

/** Registro completo: 4 campos + submit. Deja la sesión iniciada. */
export async function registerNewClub(page: Page, club = freshClub()) {
	await page.goto('/register')
	await page.getByPlaceholder('Ej: Arena Padel').fill(club.clubName)
	await page.getByPlaceholder('Franco Rossi').fill(club.userName)
	await page.getByPlaceholder('admin@tuclub.com').fill(club.email)
	await page.getByPlaceholder('••••••••').fill(club.password)
	await page.getByRole('button', { name: /crear mi club gratis/i }).click()
	// Auto-login → dashboard
	await page.waitForURL('**/dashboard**', { timeout: 30_000 })
	return club
}

/**
 * Completa el OnboardingWizard: bienvenida → canchas → horarios/precio →
 * skip MercadoPago → pantalla final. Devuelve el link público mostrado.
 */
export async function completeOnboarding(
	page: Page,
	opts: { courts?: string[]; price?: string; duration?: '60' | '90' | '120' } = {},
) {
	const courts = opts.courts ?? ['Cancha 1', 'Cancha 2']

	// El wizard es un overlay fixed sobre el dashboard: scopear los clicks
	// adentro evita matchear botones del turnero de fondo (ej: "Día Siguiente").
	const wizard = page.locator('div.fixed.inset-0').filter({ hasText: /paso \d de \d/i })

	// En 375px el toast de Sonner ("¡Cuenta creada!") tapa el botón Comenzar
	// y en emulación táctil su timer queda pausado (nunca expira), así que
	// interceptaría todos los clicks. Lo removemos del DOM directamente.
	await page.evaluate(() => {
		document.querySelectorAll('[data-sonner-toast]').forEach((t) => t.remove())
	})

	// Paso 1: bienvenida
	await wizard.getByRole('button', { name: 'Comenzar', exact: true }).click()

	// Paso 2: canchas
	for (const name of courts) {
		await wizard.getByPlaceholder('Ej. Cancha 1').fill(name)
		await wizard.getByPlaceholder('Ej. Cancha 1').press('Enter')
	}
	await wizard.getByRole('button', { name: 'Siguiente', exact: true }).click()

	// Paso 3: horarios + duración + precio
	if (opts.duration) {
		await wizard.getByRole('button', { name: new RegExp(`^${opts.duration}\\s*min$`, 'i') }).click()
	}
	if (opts.price) {
		await wizard.locator('input[type="number"]').fill(opts.price)
	}
	await wizard.getByRole('button', { name: 'Finalizar', exact: true }).click()

	// Paso 4: MercadoPago — skipeable
	await wizard.getByText(/cobra online/i).waitFor()
	await wizard.getByRole('button', { name: /lo hago despues/i }).click()

	// Paso 5: celebración + link público
	await wizard.getByText(/todo listo/i).waitFor()
	const linkBox = wizard.locator('.font-mono', { hasText: 'courtops' }).first()
	const publicUrl = (await linkBox.textContent())?.trim() ?? ''
	return publicUrl
}
