import { addHours, subHours } from 'date-fns'

// Current Argentina Offset is UTC-3 (no DST)
const ARG_OFFSET = -3

/**
 * Converts a date picked in Argentina (local time) into a UTC Date object
 * for storage in the database.
 * 
 * Example: Picking 14:00 in ARG -> We want to save 17:00 UTC.
 */
export function toUTC(date: Date): Date {
       // If we represent 14:00 ARG as 14:00 UTC, we need to add 3 hours to get the real UTC 17:00.
       return addHours(date, 3)
}

/**
 * Converts a UTC Date from the database into a Date object that "looks" like
 * it's in Argentina local time, even if the environment is UTC.
 * 
 * Used for extracting hour/day components on the server.
 */
export function fromUTC(date: Date): Date {
       return addHours(date, -3) // 17:00 UTC -> 14:00 ARG
}

/**
 * Creates a Date object from YYYY-MM-DD HH:mm strings,
 * ensuring it represents that exact time in Argentina (UTC-3).
 */
export function createArgDate(year: number, month: number, day: number, hours: number, minutes: number): Date {
       // 1. Create a UTC date with those numbers
       const utcDate = new Date(Date.UTC(year, month, day, hours, minutes))
       // 2. 14:00 in ARG is 17:00 UTC.
       return addHours(utcDate, 3)
}

/**
 * Returns the current date/time in Argentina
 */
export function nowInArg(): Date {
       const now = new Date()
       // If server is UTC (0), and ARG is -3, we add -3 hours.
       return addHours(now, -3)
}
