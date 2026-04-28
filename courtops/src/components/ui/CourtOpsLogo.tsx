import React from 'react'
import { cn } from '@/lib/utils'

const GREEN = '#00e676'

/**
 * Auto-detects dark/light mode via Tailwind dark: classes.
 * Use this when the background can be either light or dark.
 */
export function CourtOpsLogoAuto({ className }: { className?: string }) {
	return (
		<>
			<CourtOpsLogoFull className={cn('dark:hidden', className)} darkBg={false} />
			<CourtOpsLogoFull className={cn('hidden dark:inline-block', className)} darkBg />
		</>
	)
}

/**
 * Icon-only mark (C + circle + dot).
 * darkBg=true (default) → white strokes, for dark backgrounds.
 * darkBg=false → dark strokes, for light backgrounds.
 */
export function CourtOpsMark({ className, darkBg = true }: { className?: string; darkBg?: boolean }) {
	const stroke = darkBg ? '#ffffff' : '#111827'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 60 60"
			className={cn('shrink-0', className)}
			aria-hidden="true"
		>
			<g transform="translate(4, 10)">
				<path d="M 28 6 A 14 14 0 1 0 28 34" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
				<circle cx="36" cy="20" r="14" fill="none" stroke={GREEN} strokeWidth="8" />
				<circle cx="36" cy="20" r="4" fill={stroke} />
			</g>
		</svg>
	)
}

/**
 * Full horizontal logo: icon + "CourtOps" wordmark.
 * darkBg=true (default) → white text, for dark backgrounds.
 * darkBg=false → dark text, for light/white backgrounds.
 */
export function CourtOpsLogoFull({ className, darkBg = true }: { className?: string; darkBg?: boolean }) {
	const stroke = darkBg ? '#ffffff' : '#111827'
	const textFill = darkBg ? '#ffffff' : '#111827'
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 240 60"
			className={cn('shrink-0', className)}
			aria-label="CourtOps"
		>
			<g transform="translate(10, 10)">
				<path d="M 28 6 A 14 14 0 1 0 28 34" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
				<circle cx="36" cy="20" r="14" fill="none" stroke={GREEN} strokeWidth="8" />
				<circle cx="36" cy="20" r="4" fill={stroke} />
			</g>
			<text x="75" y="42" fontFamily="'Nunito', sans-serif" fontWeight="800" fontSize="34" fill={textFill} letterSpacing="-0.5">
				Court<tspan fontWeight="400" fill={GREEN}>Ops</tspan>
			</text>
		</svg>
	)
}
