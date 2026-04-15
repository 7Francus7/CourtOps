/**
 * Determines feature limits based on plan name.
 * ONLY 3 plans: Arranque | Élite | VIP
 */
export function getPlanFeatures(planName: string) {
	const name = planName.toLowerCase()

	const isArranque = name === 'arranque'
	const isElite = name === 'élite' || name === 'elite'
	const isVip = name === 'vip'

	if (isElite) {
		return {
			maxCourts: 8,
			maxUsers: 10,
			hasKiosco: true,
			hasOnlinePayments: true,
			hasAdvancedReports: true,
			hasTournaments: true,
			hasWhatsApp: true,
			hasWaivers: true,
			hasCustomDomain: false,
		}
	}

	if (isVip) {
		return {
			maxCourts: 99,
			maxUsers: 99,
			hasKiosco: true,
			hasOnlinePayments: true,
			hasAdvancedReports: true,
			hasTournaments: true,
			hasWhatsApp: true,
			hasWaivers: true,
			hasCustomDomain: true,
		}
	}

	// Arranque — defaults
	return {
		maxCourts: 2,
		maxUsers: 3,
		hasKiosco: false,
		hasOnlinePayments: false,
		hasAdvancedReports: false,
		hasTournaments: false,
		hasWhatsApp: false,
		hasWaivers: false,
		hasCustomDomain: false,
	}
}
