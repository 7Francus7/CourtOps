export type PushPreferenceKey =
	| 'bookings'
	| 'cancellations'
	| 'waitingList'
	| 'payments'
	| 'stock'

export type PushPreferences = Record<PushPreferenceKey, boolean>

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
	bookings: true,
	cancellations: true,
	waitingList: true,
	payments: true,
	stock: true
}

export function parsePushPreferences(raw?: string | null): PushPreferences {
	if (!raw) return DEFAULT_PUSH_PREFERENCES

	try {
		const parsed = JSON.parse(raw) as Partial<PushPreferences>
		return {
			bookings: parsed.bookings ?? true,
			cancellations: parsed.cancellations ?? true,
			waitingList: parsed.waitingList ?? true,
			payments: parsed.payments ?? true,
			stock: parsed.stock ?? true
		}
	} catch {
		return DEFAULT_PUSH_PREFERENCES
	}
}

export function serializePushPreferences(preferences: PushPreferences) {
	return JSON.stringify(preferences)
}
