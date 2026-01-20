import { toZonedTime, fromZonedTime } from 'date-fns-tz'

// Default Timezone for the Club
// In the future, this could be passed as an argument from the Club configuration
export const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires'

/**
 * Converts a UTC Date (database standard) to the Club's Local Time.
 * The resulting Date object will have its UTC components matching the Local Time.
 * 
 * Example: 
 * DB has 2023-01-01T17:00:00Z (which is 14:00 in ARG).
 * This function returns a Date object that internally behaves as 2023-01-01T14:00:00Z.
 * Useful for extracting hours/minutes via getUTCHours().
 */
export function fromUTC(date: Date, headerTimezone = DEFAULT_TIMEZONE): Date {
       return toZonedTime(date, headerTimezone)
}

/**
 * Converts a Local Time Date (e.g. created from a form input 14:00) 
 * into the real UTC Date to be stored in the database.
 * 
 * Example: 
 * User selects 14:00 on the calendar (Local logic). 
 * We want to store 17:00 UTC.
 */
export function toUTC(date: Date, headerTimezone = DEFAULT_TIMEZONE): Date {
       return fromZonedTime(date, headerTimezone)
}

/**
 * Helper to construct a specific date in the Club's timezone.
 */
export function createArgDate(year: number, month: number, day: number, hours: number, minutes: number): Date {
       // Use space instead of 'T' to prevent some parsers from treating it as ISO-8601 (UTC)
       const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
       // Treat this string as 'Local Time' and convert to UTC
       return fromZonedTime(str, DEFAULT_TIMEZONE)
}

/**
 * Returns the current wall-clock time in the Club's timezone.
 */
export function nowInArg(): Date {
       return toZonedTime(new Date(), DEFAULT_TIMEZONE)
}
