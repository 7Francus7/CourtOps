'use client'

import { format as dateFnsFormat, FormatOptions } from 'date-fns'
import { es } from 'date-fns/locale'
import { toZonedTime } from 'date-fns-tz'

// Always use Argentina timezone for display
export const ARGENTINA_TZ = 'America/Argentina/Buenos_Aires'

/**
 * Format a date in Argentina timezone
 * This ensures consistent display regardless of user's browser timezone
 */
export function formatInArg(date: Date | string, formatStr: string, options?: FormatOptions): string {
       const d = typeof date === 'string' ? new Date(date) : date
       const argDate = toZonedTime(d, ARGENTINA_TZ)
       return dateFnsFormat(argDate, formatStr, { locale: es, ...options })
}

/**
 * Get a Date object representing the local time in Argentina
 * The underlying UTC time is shifted so that getUTCHours(), etc. return Argentina local values
 */
export function toArgTime(date: Date | string): Date {
       const d = typeof date === 'string' ? new Date(date) : date
       return toZonedTime(d, ARGENTINA_TZ)
}
