'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, Store, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { registerClub } from '@/actions/auth/register'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FormField } from '@/components/ui/form-field'
import { useFormValidation } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'
import { CourtOpsLogoFull, CourtOpsLogoAuto } from '@/components/ui/CourtOpsLogo'

const PLANS = [
  {
    id: 'FREE',
    name: 'Prueba gratis',
    eyebrow: '7 días',
    price: 0,
    period: '',
    description: 'Probá reservas, caja, clientes y reportes con datos reales.',
    features: ['Todas las funciones', 'Hasta 2 canchas', 'Sin tarjeta', 'Soporte inicial'],
    cta: 'Comenzar gratis',
  },
  {
    id: 'Base',
    name: 'Base',
    eyebrow: 'Base',
    price: 45000,
    setupFee: 150000,
    period: '/mes',
    description: 'Para ordenar agenda y caja sin complejidad.',
    features: ['Hasta 2 canchas', 'Turnero digital', 'Caja básica'],
    cta: 'Seleccionar',
  },
  {
    id: 'Pro',
    name: 'Pro',
    eyebrow: 'Recomendado',
    price: 79000,
    setupFee: 150000,
    period: '/mes',
    description: 'Para clubes con alto movimiento, POS, torneos y métricas.',
    features: ['Hasta 8 canchas', 'POS / kiosco full', 'Gestión de torneos', 'Analítica avanzada'],
    cta: 'Seleccionar',
    featured: true,
  },
  {
    id: 'Max',
    name: 'Max',
    eyebrow: 'Escala',
    price: 119000,
    setupFee: 150000,
    period: '/mes',
    description: 'Para complejos grandes con varias sedes e integraciones.',
    features: ['Canchas ilimitadas', 'Multi-sede central', 'API / webhooks', 'Ejecutivo dedicado'],
    cta: 'Seleccionar',
  },
]


function PlanPrice({ plan, isYearly }: { plan: (typeof PLANS)[number]; isYearly: boolean }) {
  if (plan.price === 0)
    return <span className="text-4xl font-bold tracking-tight text-emerald-500">Gratis</span>
  const price = isYearly ? Math.round(plan.price * 0.8) : plan.price
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-bold tracking-tight">${new Intl.NumberFormat('es-AR').format(price)}</span>
      <span className="text-sm text-zinc-400">{plan.period}</span>
    </div>
  )
}

const inputBase = 'h-11 w-full rounded-xl border bg-zinc-50 pl-10 pr-4 text-sm outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-800/60 dark:text-white dark:focus:bg-zinc-800'
const inputBorder = 'border-zinc-200 focus:border-emerald-400 dark:border-zinc-700'
const inputBorderError = 'border-red-400 focus:border-red-400'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'PLANS' | 'FORM'>('PLANS')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [formData, setFormData] = useState({ clubName: '', userName: '', email: '', password: '' })
  const selectedPlanData = PLANS.find((plan) => plan.id === selectedPlan)

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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setStep('FORM')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan || !validateAll(formData)) return
    setLoading(true)

    const data = new FormData()
    data.append('clubName', formData.clubName)
    data.append('userName', formData.userName)
    data.append('email', formData.email)
    data.append('password', formData.password)
    data.append('plan', isYearly && selectedPlan !== 'FREE' ? `${selectedPlan}_ANUAL` : selectedPlan)

    const res = await registerClub(data)
    setLoading(false)

    if (res.success) {
      toast.success('Cuenta creada con éxito')
      router.push(selectedPlan === 'FREE' ? '/setup' : '/login?registered=true')
    } else {
      toast.error(res.error || 'Error al registrarse')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-zinc-50/95 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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

      <main className="mx-auto w-full max-w-7xl px-6 py-14 md:py-20">
        <AnimatePresence mode="wait">
          {step === 'PLANS' ? (
            <motion.section
              key="plans"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <div className="mx-auto mb-14 max-w-2xl text-center">
                <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Sin tarjeta para empezar
                </p>
                <h1 className="text-5xl font-bold tracking-tight md:text-6xl">Elegí tu plan</h1>
                <p className="mx-auto mt-5 max-w-md text-base text-zinc-500 dark:text-zinc-400">
                  En planes pagos, el alta es de $150.000 e incluye el primer mes bonificado. Después se cobra la mensualidad.
                </p>

                <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setIsYearly(false)}
                    className={cn(
                      'rounded-full px-5 py-2 text-sm font-medium transition-all',
                      !isYearly
                        ? 'bg-zinc-900 text-white shadow dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    )}
                  >
                    Mensual
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsYearly(true)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all',
                      isYearly
                        ? 'bg-zinc-900 text-white shadow dark:bg-zinc-100 dark:text-zinc-900'
                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    )}
                  >
                    Anual
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      −20%
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {PLANS.map((plan, index) => (
                  <motion.article
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={cn(
                      'relative flex flex-col rounded-2xl border p-7 transition-all hover:shadow-lg',
                      plan.featured
                        ? 'border-emerald-500/30 bg-zinc-900 text-white shadow-md shadow-zinc-900/20'
                        : 'border-zinc-200 bg-white shadow-sm hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                    )}
                  >
                    {plan.featured && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2">
                        <div className="rounded-b-lg bg-emerald-500 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
                          Recomendado
                        </div>
                      </div>
                    )}

                    <p className={cn('text-[11px] font-semibold uppercase tracking-widest', plan.featured ? 'text-emerald-400' : 'text-zinc-400')}>
                      {plan.eyebrow}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">{plan.name}</h2>

                    <div className="mt-6">
                      <PlanPrice plan={plan} isYearly={isYearly} />
                    </div>
                    {typeof plan.setupFee === 'number' && (
                      <p className={cn('mt-2 text-xs font-medium', plan.featured ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400')}>
                        + ${new Intl.NumberFormat('es-AR').format(plan.setupFee)} de alta. Primer mes incluido.
                      </p>
                    )}

                    <p className={cn('mt-4 text-sm leading-relaxed', plan.featured ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400')}>
                      {plan.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => handlePlanSelect(plan.id)}
                      className={cn(
                        'mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]',
                        plan.id === 'FREE' || plan.featured
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
                      )}
                    >
                      {plan.cta}
                      <ArrowRight size={15} />
                    </button>

                    <div className={cn('mt-6 space-y-3 border-t pt-6', plan.featured ? 'border-zinc-700/60' : 'border-zinc-100 dark:border-zinc-800')}>
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5 text-sm">
                          <Check size={13} className="shrink-0 text-emerald-500" />
                          <span className={plan.featured ? 'text-zinc-300' : 'text-zinc-600 dark:text-zinc-400'}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-[1fr_1.3fr]"
            >
              <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-white">
                <button
                  type="button"
                  onClick={() => setStep('PLANS')}
                  className="mb-10 inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <ArrowLeft size={13} />
                  Volver a planes
                </button>
                <CourtOpsLogoFull className="h-8 w-auto" darkBg />
                <h1 className="mt-8 text-3xl font-bold tracking-tight">Activá tu club.</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Dejamos listo el espacio para que cargues canchas, horarios y empieces a operar.
                </p>
                <div className="mt-8 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Plan elegido</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <span className="text-xl font-semibold">{selectedPlanData?.name}</span>
                    {selectedPlanData && <PlanPrice plan={selectedPlanData} isYearly={isYearly} />}
                  </div>
                  {selectedPlanData && typeof selectedPlanData.setupFee === 'number' && (
                    <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                      Alta de ${new Intl.NumberFormat('es-AR').format(selectedPlanData.setupFee)} con el primer mes bonificado.
                    </p>
                  )}
                </div>
              </aside>

              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-2xl font-bold tracking-tight">Creá tu cuenta</h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Usá un email al que tengas acceso. Después podés invitar a tu equipo.
                </p>
                <form onSubmit={handleRegister} className="mt-7 space-y-4">
                  <FormField label="Nombre del club" error={errors.clubName}>
                    <div className="relative">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                      <input
                        type="text"
                        required
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
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
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
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
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
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
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
                    className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-medium text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>Finalizar registro <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
