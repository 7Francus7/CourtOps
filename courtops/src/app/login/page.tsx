'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Zap, Mail, Lock, Eye, EyeOff, Sun, Moon, Check, CalendarCheck, BarChart3, MessageSquare, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

const features = [
	{ icon: CalendarCheck, text: 'Agenda digital en tiempo real' },
	{ icon: MessageSquare, text: 'WhatsApp automático a tus socios' },
	{ icon: BarChart3, text: 'Reportes financieros al instante' },
	{ icon: ShieldCheck, text: 'Torneos, kiosko y caja incluidos' },
]

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { setTheme, resolvedTheme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(true)

	useEffect(() => {
		setMounted(true)
		const savedEmail = localStorage.getItem('courtops_remember_email')
		if (savedEmail) {
			setEmail(savedEmail)
			setRememberMe(true)
		} else {
			setRememberMe(false)
		}
	}, [])

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

		if (rememberMe) {
			localStorage.setItem('courtops_remember_email', email)
		} else {
			localStorage.removeItem('courtops_remember_email')
		}

		const result = await signIn('credentials', {
			redirect: false,
			email,
			password,
			rememberMe: rememberMe ? 'true' : 'false'
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
		<div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-500">

			{/* Background ambient layers */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Grid */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:64px_64px] [--grid-color:rgba(0,0,0,0.04)] dark:[--grid-color:rgba(255,255,255,0.02)]" />
				{/* Orbs */}
				<div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] rounded-full blur-[160px]" />
				<div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-500/[0.04] dark:bg-violet-500/[0.06] rounded-full blur-[160px]" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-500/[0.03] dark:bg-teal-500/[0.04] rounded-full blur-[120px]" />
			</div>

			{/* Top-left back link */}
			<div className="absolute top-5 left-5 z-20">
				<Link
					href="/"
					className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-colors bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] px-3 py-1.5 rounded-lg backdrop-blur-sm"
				>
					<ArrowLeft size={13} /> Volver al inicio
				</Link>
			</div>

			{/* Top-right theme toggle */}
			{mounted && (
				<div className="absolute top-5 right-5 z-20">
					<button
						onClick={() => setTheme(isDark ? 'light' : 'dark')}
						className="w-8 h-8 rounded-lg bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 transition-all backdrop-blur-sm"
						aria-label="Cambiar tema"
					>
						{isDark ? <Sun size={14} /> : <Moon size={14} />}
					</button>
				</div>
			)}

			{/* Main card */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
				className="relative z-10 w-full max-w-[980px] rounded-[2rem] overflow-hidden border border-slate-200/80 dark:border-white/[0.07] shadow-2xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
			>
				<div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

					{/* LEFT: Brand panel */}
					<div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-slate-900 dark:bg-zinc-900/80 relative overflow-hidden">
						{/* Inner ambient */}
						<div className="absolute inset-0 pointer-events-none">
							<div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/[0.12] rounded-full blur-[100px]" />
							<div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-violet-500/[0.08] rounded-full blur-[100px]" />
							<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
						</div>

						{/* Logo */}
						<div className="relative z-10">
							<div className="flex items-center gap-2.5">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
									<Zap size={18} fill="currentColor" />
								</div>
								<span className="text-lg font-bold text-white tracking-tight">CourtOps</span>
							</div>
						</div>

						{/* Headline + features */}
						<div className="relative z-10 space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl xl:text-[2.6rem] font-bold text-white tracking-tight leading-[1.15]">
									La gestión de tu<br />club,{' '}
									<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
										simplificada.
									</span>
								</h1>
								<p className="text-[14px] text-zinc-400 leading-relaxed max-w-sm">
									Reservas, cobros, WhatsApp y reportes. Todo desde un solo panel, sin complicaciones.
								</p>
							</div>

							{/* Feature list */}
							<div className="space-y-3">
								{features.map((feat, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
										className="flex items-center gap-3"
									>
										<div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
											<feat.icon size={13} className="text-emerald-400" />
										</div>
										<span className="text-sm text-zinc-300 font-medium">{feat.text}</span>
									</motion.div>
								))}
							</div>
						</div>

						{/* Bottom stats strip */}
						<div className="relative z-10 flex items-center gap-8 pt-6 border-t border-white/[0.07]">
							{[
								{ value: '150+', label: 'Clubes activos' },
								{ value: '50K+', label: 'Turnos gestionados' },
								{ value: '4.9★', label: 'Valoración promedio' },
							].map((stat, i) => (
								<div key={i}>
									<p className="text-base font-bold text-white tracking-tight">{stat.value}</p>
									<p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{stat.label}</p>
								</div>
							))}
						</div>
					</div>

					{/* RIGHT: Form panel */}
					<div className="flex flex-col justify-center p-8 sm:p-10 xl:p-12 bg-white dark:bg-zinc-950/90">

						{/* Mobile logo */}
						<div className="lg:hidden flex items-center gap-2.5 mb-10">
							<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
								<Zap size={16} fill="currentColor" />
							</div>
							<span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">CourtOps</span>
						</div>

						{/* Header */}
						<div className="mb-8">
							<div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">
								<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Panel de gestión
							</div>
							<h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bienvenido de vuelta</h2>
							<p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">Ingresá con tu cuenta para continuar</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Email */}
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 ml-0.5">Email</label>
								<div className="relative group">
									<Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors duration-200" />
									<input
										type="email"
										required
										value={email}
										onChange={e => setEmail(e.target.value)}
										className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500/60 dark:focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-zinc-600 font-medium"
										placeholder="admin@tuclub.com"
										autoComplete="email"
									/>
								</div>
							</div>

							{/* Password */}
							<div className="space-y-1.5">
								<label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 ml-0.5">Contraseña</label>
								<div className="relative group">
									<Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-emerald-500 transition-colors duration-200" />
									<input
										type={showPassword ? 'text' : 'password'}
										required
										value={password}
										onChange={e => setPassword(e.target.value)}
										className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl py-3 pl-10 pr-10 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500/60 dark:focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200 placeholder:text-slate-300 dark:placeholder:text-zinc-600 font-medium"
										placeholder="Tu contraseña"
										autoComplete="current-password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 hover:text-slate-500 dark:hover:text-zinc-400 transition-colors"
										tabIndex={-1}
									>
										{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
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
											: "border-slate-300 dark:border-zinc-600 bg-transparent"
									)}>
										{rememberMe && (
											<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
										)}
									</div>
									<span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Recordarme</span>
								</label>
								<Link
									href="/forgot-password"
									className="text-xs text-slate-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
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
											<p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Submit */}
							<button
								type="submit"
								disabled={isLoading}
								className={cn(
									"w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 group",
									isLoading
										? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed"
										: "bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
								)}
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>Ingresar <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
								)}
							</button>
						</form>

						{/* Divider + register */}
						<div className="mt-7 pt-6 border-t border-slate-100 dark:border-white/[0.06]">
							<p className="text-center text-sm text-slate-500 dark:text-zinc-400">
								¿No tenés cuenta?{' '}
								<Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold transition-colors">
									Registrate gratis
								</Link>
							</p>

							{/* Trust signals */}
							<div className="flex items-center justify-center gap-4 mt-5">
								{[
									{ icon: ShieldCheck, text: 'Sin tarjeta de crédito' },
									{ icon: Check, text: '7 días gratis' },
								].map((item, i) => (
									<div key={i} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-zinc-600">
										<item.icon size={11} className="text-emerald-500" />
										{item.text}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	)
}
