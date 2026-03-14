'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(true)

	useEffect(() => setMounted(true), [])

	useEffect(() => {
		if (searchParams.get('registered')) {
			toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
		}
		if (searchParams.get('reset')) {
			toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
		}
	}, [searchParams])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setIsLoading(true)
		setError('')

		const result = await signIn('credentials', {
			redirect: false,
			email,
			password
		})

		if (result?.error) {
			setError('Credenciales inválidas. Revisá tus datos e intentá de nuevo.')
			setIsLoading(false)
		} else {
			router.push('/dashboard')
			router.refresh()
		}
	}

	const isDark = resolvedTheme === 'dark'

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">

			{/* Background effects */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:80px_80px] [--grid-color:rgba(0,0,0,0.04)] dark:[--grid-color:rgba(255,255,255,0.015)]" />
				<div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.05] dark:bg-emerald-500/[0.07] rounded-full blur-[150px]" />
				<div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-500/[0.03] dark:bg-violet-500/[0.04] rounded-full blur-[150px]" />
			</div>

			{/* Top bar: Back + Theme toggle */}
			<div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
				<Link
					href="/"
					className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft size={16} />
					<span className="hidden sm:inline">Volver al inicio</span>
				</Link>

				{mounted && (
					<button
						onClick={() => setTheme(isDark ? 'light' : 'dark')}
						className="w-9 h-9 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
						aria-label="Cambiar tema"
					>
						{isDark ? <Sun size={16} /> : <Moon size={16} />}
					</button>
				)}
			</div>

			{/* Main container */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
				className="relative z-10 w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-border/50 shadow-xl dark:shadow-2xl dark:shadow-black/40"
			>

				{/* LEFT: Brand panel */}
				<div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-muted/50 dark:bg-card/80 relative overflow-hidden">
					{/* Subtle inner glow */}
					<div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/[0.06] rounded-full blur-[100px] pointer-events-none" />

					{/* Top: Logo */}
					<div className="relative z-10">
						<div className="flex items-center gap-2.5">
							<div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
								<Zap size={18} fill="currentColor" />
							</div>
							<span className="text-lg font-bold text-foreground tracking-tight">CourtOps</span>
						</div>
					</div>

					{/* Center: Headline */}
					<div className="relative z-10 space-y-5 -mt-4">
						<h1 className="text-4xl xl:text-[2.75rem] font-semibold text-foreground tracking-tight leading-[1.15]">
							La gestión de tu club,{' '}
							<span className="text-emerald-500 dark:text-emerald-400">simplificada.</span>
						</h1>
						<p className="text-[15px] text-muted-foreground leading-relaxed max-w-sm">
							Reservas, pagos, clientes y métricas. Todo en un solo lugar. Sin complicaciones.
						</p>
					</div>

					{/* Bottom: Stats */}
					<div className="relative z-10 flex items-center gap-8 pt-8 border-t border-border/50">
						{[
							{ value: '150+', label: 'Clubes' },
							{ value: '50K+', label: 'Turnos' },
							{ value: '99.9%', label: 'Uptime' },
						].map((stat) => (
							<div key={stat.label}>
								<p className="text-xl font-bold text-foreground tracking-tight">{stat.value}</p>
								<p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
							</div>
						))}
					</div>
				</div>

				{/* RIGHT: Form panel */}
				<div className="flex flex-col justify-center p-8 sm:p-10 xl:p-12 bg-card">
					{/* Mobile logo */}
					<div className="lg:hidden flex items-center gap-2.5 mb-10">
						<div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
							<Zap size={16} fill="currentColor" />
						</div>
						<span className="text-base font-bold text-foreground tracking-tight">CourtOps</span>
					</div>

					{/* Header */}
					<div className="mb-8">
						<h2 className="text-2xl font-bold text-foreground tracking-tight">Iniciar sesión</h2>
						<p className="text-sm text-muted-foreground mt-1.5">Ingresá a tu panel de gestión</p>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Email */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground ml-0.5">Email</label>
							<div className="relative group">
								<Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors duration-200" />
								<input
									type="email"
									required
									value={email}
									onChange={e => setEmail(e.target.value)}
									className="w-full bg-muted/50 dark:bg-secondary/50 border border-border rounded-xl py-3 pl-11 pr-4 text-foreground text-sm outline-none focus:border-emerald-500/50 focus:bg-muted dark:focus:bg-secondary/80 transition-all duration-200 placeholder:text-muted-foreground/40 font-medium"
									placeholder="admin@tuclub.com"
									autoComplete="email"
								/>
							</div>
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<label className="text-xs font-medium text-muted-foreground ml-0.5">Contraseña</label>
							<div className="relative group">
								<Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors duration-200" />
								<input
									type={showPassword ? 'text' : 'password'}
									required
									value={password}
									onChange={e => setPassword(e.target.value)}
									className="w-full bg-muted/50 dark:bg-secondary/50 border border-border rounded-xl py-3 pl-11 pr-11 text-foreground text-sm outline-none focus:border-emerald-500/50 focus:bg-muted dark:focus:bg-secondary/80 transition-all duration-200 placeholder:text-muted-foreground/40 font-medium"
									placeholder="Tu contraseña"
									autoComplete="current-password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
									tabIndex={-1}
								>
									{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
								</button>
							</div>
						</div>

						{/* Options row */}
						<div className="flex items-center justify-between pt-0.5">
							<label className="flex items-center gap-2 cursor-pointer select-none">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={e => setRememberMe(e.target.checked)}
									className="sr-only peer"
								/>
								<div className={cn(
									"w-4 h-4 rounded-[5px] border-2 flex items-center justify-center transition-all duration-150",
									rememberMe
										? "bg-emerald-500 border-emerald-500"
										: "border-muted-foreground/30 bg-transparent"
								)}>
									{rememberMe && (
										<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
									)}
								</div>
								<span className="text-xs text-muted-foreground font-medium">Recordarme</span>
							</label>
							<Link
								href="/forgot-password"
								className="text-xs text-muted-foreground hover:text-emerald-500 font-medium transition-colors"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>

						{/* Error */}
						<AnimatePresence mode="wait">
							{error && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									className="overflow-hidden"
								>
									<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5">
										<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
										<p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Submit button */}
						<button
							type="submit"
							disabled={isLoading}
							className={cn(
								"w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2",
								isLoading
									? "bg-muted text-muted-foreground cursor-not-allowed"
									: "bg-emerald-500 text-white hover:bg-emerald-600 dark:hover:bg-emerald-400 active:scale-[0.98] shadow-md shadow-emerald-500/20"
							)}
						>
							{isLoading ? (
								<div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>Ingresar <ArrowRight size={15} /></>
							)}
						</button>
					</form>

					{/* Register link */}
					<div className="mt-8 pt-6 border-t border-border/50 text-center">
						<p className="text-sm text-muted-foreground">
							¿No tenés cuenta?{' '}
							<Link href="/register" className="text-emerald-500 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-semibold transition-colors">
								Registrate gratis
							</Link>
						</p>
					</div>
				</div>
			</motion.div>
		</div>
	)
}
