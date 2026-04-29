/**
 * Determines feature limits based on plan name.
 * ONLY 3 plans: Base | Pro | Max
 */
import { normalizePlatformPlanName } from './platform-plans'

export function getPlanFeatures(planName: string) {
	const name = normalizePlatformPlanName(planName)

	if (name === 'Pro') {
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

	if (name === 'Max') {
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

	// Base defaults
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
