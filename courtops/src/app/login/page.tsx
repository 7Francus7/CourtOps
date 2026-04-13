'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
	ArrowLeft,
	ArrowRight,
	Mail,
	Lock,
	Eye,
	EyeOff,
	Check,
	CalendarCheck,
	BarChart3,
	MessageSquare,
	ShieldCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const features = [
	{ icon: CalendarCheck, text: 'Agenda digital en tiempo real' },
	{ icon: MessageSquare, text: 'WhatsApp automático a tus socios' },
	{ icon: BarChart3, text: 'Reportes financieros al instante' },
	{ icon: ShieldCheck, text: 'Torneos, kiosko y caja incluidos' },
]

export default function LoginPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(true)

	useEffect(() => {
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
			rememberMe: rememberMe ? 'true' : 'false',
		})

		if (result?.error) {
			setError('Credenciales inválidas. Revisá tus datos e intentá de nuevo.')
			setIsLoading(false)
		} else {
			router.push('/dashboard')
			router.refresh()
		}
	}

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-500"
			style={{ background: 'var(--co-bg)' }}
		>
			{/* ── Background ambient ─── */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Grid */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							'linear-gradient(to right, var(--co-navy-05) 1px, transparent 1px), linear-gradient(to bottom, var(--co-navy-05) 1px, transparent 1px)',
						backgroundSize: '64px 64px',
					}}
				/>
				{/* Orbs */}
				<div
					className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] rounded-full blur-[160px]"
					style={{ background: 'var(--co-green-10)' }}
				/>
				<div
					className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-60"
					style={{ background: 'var(--co-green-10)' }}
				/>
			</div>

			{/* ── Back link ─── */}
			<div className="absolute top-5 left-5 z-20">
				<Link
					href="/"
					className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all hover:opacity-80"
					style={{
						color: 'var(--co-muted)',
						background: 'color-mix(in srgb, var(--co-card) 85%, transparent)',
						border: '1px solid var(--co-border)',
					}}
				>
					<ArrowLeft size={13} /> Volver al inicio
				</Link>
			</div>

			{/* ── Main card ─── */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
				className="relative z-10 w-full max-w-[980px] rounded-[2rem] overflow-hidden"
				style={{
					border: '1px solid var(--co-border)',
					boxShadow: '0 32px 80px rgba(9,20,38,0.12)',
				}}
			>
				<div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">

					{/* ── LEFT: Brand panel (always dark) ── */}
					<div
						className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
						style={{ background: 'var(--co-dark-section)' }}
					>
						{/* Inner ambient */}
						<div className="absolute inset-0 pointer-events-none">
							<div
								className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full blur-[100px]"
								style={{ background: 'var(--co-green-10)' }}
							/>
							<div
								className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-40"
								style={{ background: 'rgba(99,102,241,0.08)' }}
							/>
							<div
								className="absolute inset-0"
								style={{
									backgroundImage:
										'linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px)',
									backgroundSize: '48px 48px',
								}}
							/>
						</div>

						{/* Logo */}
						<div className="relative z-10">
							<Link
								href="/"
								className="text-xl font-black tracking-tighter text-white select-none hover:opacity-80 transition-opacity"
							>
								CourtOps
							</Link>
						</div>

						{/* Headline + features */}
						<div className="relative z-10 space-y-8">
							<div className="space-y-4">
								<h1 className="text-4xl xl:text-[2.6rem] font-black text-white tracking-[-0.03em] leading-[1.1]">
									La gestión de tu club,{' '}
									<span style={{ color: 'var(--co-mint)' }}>simplificada.</span>
								</h1>
								<p className="text-sm leading-relaxed max-w-sm text-zinc-400">
									Reservas, cobros, WhatsApp y reportes. Todo desde un solo panel, sin complicaciones.
								</p>
							</div>

							<div className="space-y-3">
								{features.map((feat, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
										className="flex items-center gap-3"
									>
										<div
											className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
											style={{
												background: 'var(--co-green-10)',
												border: '1px solid rgba(16,185,129,0.2)',
											}}
										>
											<feat.icon size={13} style={{ color: 'var(--co-mint)' }} />
										</div>
										<span className="text-sm text-zinc-300 font-medium">{feat.text}</span>
									</motion.div>
								))}
							</div>
						</div>

						{/* Stats */}
						<div
							className="relative z-10 flex items-center gap-8 pt-6"
							style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
						>
							{[
								{ value: '150+', label: 'Clubes activos' },
								{ value: '50K+', label: 'Turnos gestionados' },
								{ value: '4.9★', label: 'Valoración promedio' },
							].map((stat, i) => (
								<div key={i}>
									<p className="text-base font-black text-white tracking-tight">{stat.value}</p>
									<p className="text-[10px] font-medium uppercase tracking-wider mt-0.5 text-zinc-500">
										{stat.label}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* ── RIGHT: Form panel ── */}
					<div
						className="flex flex-col justify-center p-8 sm:p-10 xl:p-12"
						style={{ background: 'var(--co-card)' }}
					>
						{/* Mobile logo */}
						<div className="lg:hidden mb-10">
							<Link
								href="/"
								className="text-lg font-black tracking-tighter hover:opacity-80 transition-opacity"
								style={{ color: 'var(--co-navy)' }}
							>
								CourtOps
							</Link>
						</div>

						{/* Header */}
						<div className="mb-8">
							<span
								className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] mb-4"
								style={{ background: 'var(--co-mint)', color: 'var(--co-mint-text)' }}
							>
								<span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
								Panel de gestión
							</span>
							<h2
								className="text-2xl font-black tracking-tight"
								style={{ color: 'var(--co-navy)' }}
							>
								Bienvenido de vuelta
							</h2>
							<p className="text-sm mt-1.5" style={{ color: 'var(--co-muted)' }}>
								Ingresá con tu cuenta para continuar
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="space-y-4">

							{/* Email */}
							<div className="space-y-1.5">
								<label
									className="text-xs font-semibold ml-0.5"
									style={{ color: 'var(--co-muted)' }}
								>
									Email
								</label>
								<div className="relative">
									<Mail
										size={14}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
										style={{ color: 'var(--co-navy-50)' }}
									/>
									<input
										type="email"
										required
										value={email}
										onChange={e => setEmail(e.target.value)}
										className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-200 font-medium placeholder:opacity-40 focus:ring-2"
										style={{
											background: 'var(--co-surface)',
											border: '1.5px solid var(--co-border)',
											color: 'var(--co-navy)',
										}}
										onFocus={e => (e.currentTarget.style.borderColor = 'var(--co-green)')}
										onBlur={e => (e.currentTarget.style.borderColor = 'var(--co-border)')}
										placeholder="admin@tuclub.com"
										autoComplete="email"
									/>
								</div>
							</div>

							{/* Password */}
							<div className="space-y-1.5">
								<label
									className="text-xs font-semibold ml-0.5"
									style={{ color: 'var(--co-muted)' }}
								>
									Contraseña
								</label>
								<div className="relative">
									<Lock
										size={14}
										className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
										style={{ color: 'var(--co-navy-50)' }}
									/>
									<input
										type={showPassword ? 'text' : 'password'}
										required
										value={password}
										onChange={e => setPassword(e.target.value)}
										className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-200 font-medium placeholder:opacity-40"
										style={{
											background: 'var(--co-surface)',
											border: '1.5px solid var(--co-border)',
											color: 'var(--co-navy)',
										}}
										onFocus={e => (e.currentTarget.style.borderColor = 'var(--co-green)')}
										onBlur={e => (e.currentTarget.style.borderColor = 'var(--co-border)')}
										placeholder="Tu contraseña"
										autoComplete="current-password"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 cursor-pointer"
										style={{ color: 'var(--co-navy-50)' }}
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
										className="sr-only"
									/>
									<div
										className="w-4 h-4 rounded-[5px] border-2 flex items-center justify-center transition-all duration-150"
										style={
											rememberMe
												? { background: 'var(--co-green)', borderColor: 'var(--co-green)' }
												: { borderColor: 'var(--co-border)', background: 'transparent' }
										}
									>
										{rememberMe && (
											<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
												<path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
									</div>
									<span className="text-xs font-medium" style={{ color: 'var(--co-muted)' }}>
										Recordarme
									</span>
								</label>
								<Link
									href="/forgot-password"
									className="text-xs font-medium transition-opacity hover:opacity-70"
									style={{ color: 'var(--co-muted)' }}
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
										<div
											className="p-3 rounded-xl flex items-center gap-2.5"
											style={{
												background: 'rgba(239,68,68,0.08)',
												border: '1px solid rgba(239,68,68,0.2)',
											}}
										>
											<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
											<p className="text-xs font-medium text-red-500">{error}</p>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Submit */}
							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 mt-2 group active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
								style={
									isLoading
										? { background: 'var(--co-navy-50)' }
										: {
												background: 'var(--co-green)',
												boxShadow: '0 4px 20px var(--co-green-shadow)',
										  }
								}
							>
								{isLoading ? (
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>
										Ingresar
										<ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
									</>
								)}
							</button>
						</form>

						{/* Bottom */}
						<div
							className="mt-7 pt-6"
							style={{ borderTop: '1px solid var(--co-border)' }}
						>
							<p className="text-center text-sm" style={{ color: 'var(--co-muted)' }}>
								¿No tenés cuenta?{' '}
								<Link
									href="/register"
									className="font-bold transition-opacity hover:opacity-80"
									style={{ color: 'var(--co-green)' }}
								>
									Registrate gratis
								</Link>
							</p>

							{/* Trust signals */}
							<div className="flex items-center justify-center gap-5 mt-5">
								{[
									{ icon: ShieldCheck, text: 'Sin tarjeta de crédito' },
									{ icon: Check, text: '7 días gratis' },
								].map((item, i) => (
									<div
										key={i}
										className="flex items-center gap-1.5 text-[10px] font-semibold"
										style={{ color: 'var(--co-navy-50)' }}
									>
										<item.icon size={11} style={{ color: 'var(--co-green)' }} />
										{item.text}
									</div>
								))}
							</div>

							{/* Legal links */}
							<div className="flex items-center justify-center gap-3 mt-4">
								<Link
									href="/legal/terms"
									className="text-[10px] transition-opacity hover:opacity-80"
									style={{ color: 'var(--co-navy-50)' }}
								>
									Términos
								</Link>
								<span style={{ color: 'var(--co-border)' }}>·</span>
								<Link
									href="/legal/privacy"
									className="text-[10px] transition-opacity hover:opacity-80"
									style={{ color: 'var(--co-navy-50)' }}
								>
									Privacidad
								</Link>
							</div>
						</div>
					</div>

				</div>
			</motion.div>
		</div>
	)
}
