'use client'

import React, { useMemo, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Store, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { registerClub } from '@/actions/auth/register'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FormField } from '@/components/ui/form-field'
import { useFormValidation } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'
import { CourtOpsLogoFull, CourtOpsLogoAuto } from '@/components/ui/CourtOpsLogo'

const inputBase = 'h-11 w-full rounded-xl border bg-zinc-50 pl-10 pr-4 text-sm outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-800/60 dark:text-white dark:focus:bg-zinc-800'
const inputBorder = 'border-zinc-200 focus:border-emerald-400 dark:border-zinc-700'
const inputBorderError = 'border-red-400 focus:border-red-400'

const TRIAL_BENEFITS = [
	'14 días gratis con todas las funciones',
	'Sin tarjeta de crédito',
	'Link público de reservas desde el primer minuto',
	'Cobros online con MercadoPago',
	'Elegís tu plan cuando quieras, dentro del sistema',
]

export default function RegisterPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState({ clubName: '', userName: '', email: '', password: '' })

	const validationRules = useMemo(
		() => ({
			clubName: (v: string) => (v.trim().length < 2 ? 'El nombre del club es obligatorio' : null),
			userName: (v: string) => (v.trim().length < 2 ? 'Tu nombre es obligatorio' : null),
			email: (v: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Ingresá un email válido' : null),
			password: (v: string) => (v.length < 6 ? 'Mínimo 6 caracteres' : null),
		}),
		[]
	)

	const { errors, validate, validateAll } = useFormValidation(validationRules)

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateAll(formData)) return
		setLoading(true)

		const data = new FormData()
		data.append('clubName', formData.clubName)
		data.append('userName', formData.userName)
		data.append('email', formData.email)
		data.append('password', formData.password)

		const res = await registerClub(data)

		if (!res.success) {
			setLoading(false)
			toast.error(res.error || 'Error al registrarse')
			return
		}

		// Auto-login: el usuario nunca debería ver una pantalla de login
		// inmediatamente después de crear su cuenta.
		const login = await signIn('credentials', {
			email: formData.email,
			password: formData.password,
			redirect: false,
		})

		if (login?.error) {
			setLoading(false)
			router.push('/login?registered=true')
			return
		}

		toast.success('¡Cuenta creada! Configuremos tu club.')
		router.push('/dashboard')
		router.refresh()
	}

	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white">
			<header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/95 px-6 pb-4 pt-[max(env(safe-area-inset-top),1rem)] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
				<div className="mx-auto flex max-w-5xl items-center justify-between">
					<Link href="/" aria-label="CourtOps inicio" className="hover:opacity-80 transition-opacity inline-flex">
						<CourtOpsLogoAuto className="h-8 w-auto" />
					</Link>
					<div className="flex items-center gap-5">
						<span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
							¿Ya sos cliente?{' '}
							<Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">
								Iniciar sesión
							</Link>
						</span>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="mx-auto grid w-full max-w-5xl gap-5 px-6 py-14 md:py-20 lg:grid-cols-[1fr_1.2fr]">
				{/* Left panel: value prop */}
				<aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-white flex flex-col">
					<CourtOpsLogoFull className="h-8 w-auto" darkBg />
					<h1 className="mt-7 text-3xl font-bold tracking-tight">Probá CourtOps gratis.</h1>
					<p className="mt-2 text-sm leading-relaxed text-zinc-400">
						En menos de 10 minutos tu club recibe reservas online.
					</p>

					<div className="mt-6 space-y-3">
						{TRIAL_BENEFITS.map((item) => (
							<div key={item} className="flex items-start gap-3">
								<Check size={16} className="mt-0.5 shrink-0 text-emerald-400" />
								<span className="text-sm text-zinc-300">{item}</span>
							</div>
						))}
					</div>

					<div className="mt-auto pt-8">
						<div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Después del registro</p>
							<p className="mt-2 text-sm text-zinc-300">
								Te guiamos paso a paso: canchas, horarios, precio y tu link público listo para compartir.
							</p>
						</div>
					</div>
				</aside>

				{/* Form panel */}
				<div className="rounded-2xl border border-zinc-200 bg-white px-8 py-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h2 className="text-xl font-bold tracking-tight">Creá tu cuenta</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Solo 4 datos. El resto lo configurás adentro.
					</p>

					<form onSubmit={handleRegister} className="mt-6 space-y-4">
						<FormField label="Nombre del club" error={errors.clubName}>
							<div className="relative">
								<Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
								<input
									type="text"
									required
									autoFocus
									className={cn(inputBase, errors.clubName ? inputBorderError : inputBorder)}
									placeholder="Ej: Arena Padel"
									value={formData.clubName}
									onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
									onBlur={() => validate('clubName', formData.clubName)}
								/>
							</div>
						</FormField>

						<FormField label="Tu nombre" error={errors.userName}>
							<div className="relative">
								<User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
								<input
									type="text"
									required
									className={cn(inputBase, errors.userName ? inputBorderError : inputBorder)}
									placeholder="Franco Rossi"
									value={formData.userName}
									onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
									onBlur={() => validate('userName', formData.userName)}
								/>
							</div>
						</FormField>

						<FormField label="Email" error={errors.email}>
							<div className="relative">
								<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
								<input
									type="email"
									required
									className={cn(inputBase, errors.email ? inputBorderError : inputBorder)}
									placeholder="admin@tuclub.com"
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									onBlur={() => validate('email', formData.email)}
								/>
							</div>
						</FormField>

						<FormField label="Contraseña" error={errors.password}>
							<div className="relative">
								<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
								<input
									type={showPassword ? 'text' : 'password'}
									required
									className={cn(inputBase, 'pr-10', errors.password ? inputBorderError : inputBorder)}
									placeholder="••••••••"
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									onBlur={() => validate('password', formData.password)}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
									aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
								>
									{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
								</button>
							</div>
						</FormField>

						<button
							type="submit"
							disabled={loading}
							className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{loading ? (
								<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								<>Crear mi club gratis <ArrowRight size={15} /></>
							)}
						</button>

						<p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
							14 días gratis · Sin tarjeta · Cancelás cuando quieras
						</p>
					</form>
				</div>
			</main>
		</div>
	)
}
