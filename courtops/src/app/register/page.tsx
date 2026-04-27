'use client'

import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, Store, User, Zap } from 'lucide-react'
import { Nunito } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { registerClub } from '@/actions/auth/register'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FormField } from '@/components/ui/form-field'
import { useFormValidation } from '@/hooks/useFormValidation'
import { cn } from '@/lib/utils'

const fontLogo = Nunito({ subsets: ['latin'], weight: ['400', '800'] })

const PLANS = [
  { id: 'FREE', name: 'Prueba gratis', eyebrow: '7 días', price: 0, period: '', description: 'Probá reservas, caja, clientes y reportes con datos reales.', features: ['Todas las funciones', 'Hasta 2 canchas', 'Sin tarjeta', 'Soporte inicial'], cta: 'Comenzar gratis', icon: Sparkles },
  { id: 'Arranque', name: 'Arranque', eyebrow: 'Base', price: 45000, period: '/mes', description: 'Para ordenar agenda y caja sin complejidad.', features: ['Hasta 2 canchas', 'Turnero digital', 'Caja básica'], cta: 'Seleccionar', icon: Zap },
  { id: 'Élite', name: 'Élite', eyebrow: 'Recomendado', price: 85000, period: '/mes', description: 'Para clubes con alto movimiento, POS, torneos y métricas.', features: ['Hasta 8 canchas', 'POS / kiosco full', 'Gestión de torneos', 'Analítica avanzada'], cta: 'Seleccionar', icon: ShieldCheck, featured: true },
  { id: 'VIP', name: 'VIP', eyebrow: 'Escala', price: 150000, period: '/mes', description: 'Para complejos grandes con varias sedes e integraciones.', features: ['Canchas ilimitadas', 'Multi-sede central', 'API / webhooks', 'Ejecutivo dedicado'], cta: 'Seleccionar', icon: Store },
]

function CourtOpsMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className={className} aria-hidden="true">
      <g transform="translate(5, 10)">
        <path d="M 25 5 A 15 15 0 1 0 25 35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="20" r="12" fill="none" stroke="#00e676" strokeWidth="6" />
        <circle cx="32" cy="20" r="4" fill="currentColor" />
      </g>
    </svg>
  )
}

function CourtOpsLogo() {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-sm ring-1 ring-black/10 dark:bg-white dark:text-black dark:ring-white/10">
        <CourtOpsMark className="h-8 w-8" />
      </span>
      <span className={cn(fontLogo.className, 'text-2xl font-extrabold tracking-tight')}>
        Court<span className="font-normal text-[#00e676]">Ops</span>
      </span>
    </span>
  )
}

function PlanPrice({ plan, isYearly }: { plan: (typeof PLANS)[number]; isYearly: boolean }) {
  if (plan.price === 0) return <div className="text-3xl font-black tracking-tight text-emerald-500 md:text-4xl">Gratis</div>
  const price = isYearly ? Math.round(plan.price * 0.8) : plan.price
  return (
    <div className="flex items-end gap-1">
      <span className="text-3xl font-black tracking-tight md:text-4xl">${new Intl.NumberFormat('es-AR').format(price)}</span>
      <span className="pb-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">{plan.period}</span>
    </div>
  )
}

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
    <div className="min-h-screen bg-[#f4faf7] text-black transition-colors duration-500 dark:bg-[#07090b] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-16 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-400/15 blur-[120px] dark:bg-emerald-500/10" />
      </div>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f4faf7]/90 px-5 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#07090b]/90 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" aria-label="CourtOps inicio"><CourtOpsLogo /></Link>
          <div className="flex items-center gap-4">
            <div className="hidden text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-zinc-500 sm:block">
              ¿Ya sos cliente?
              <Link href="/login" className="ml-3 text-black transition-colors hover:text-emerald-500 dark:text-white">Login</Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-10 md:px-10 md:py-14">
        <AnimatePresence mode="wait">
          {step === 'PLANS' ? (
            <motion.section key="plans" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="w-full">
              <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
                <div className="mb-7 inline-flex rounded-full border border-emerald-500/20 bg-emerald-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Sin tarjeta para empezar</div>
                <h1 className="text-5xl font-black tracking-tight md:text-7xl">Elegí tu plan.</h1>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-zinc-400">Empezá simple. Cambiá de plan cuando tu club lo necesite.</p>

                <div className="mt-9 inline-flex items-center rounded-2xl border border-black/10 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <button type="button" onClick={() => setIsYearly(false)} className={cn('h-10 rounded-xl px-5 text-sm font-black transition-colors', !isYearly ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 dark:text-zinc-500')}>Mensual</button>
                  <button type="button" onClick={() => setIsYearly(true)} className={cn('flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-black transition-colors', isYearly ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-slate-500 dark:text-zinc-500')}>
                    Anual
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300">-20%</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {PLANS.map((plan, index) => {
                  const Icon = plan.icon
                  return (
                    <motion.article key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={cn('flex min-h-[430px] flex-col rounded-2xl border p-6 shadow-sm transition-transform hover:-translate-y-1 md:p-8', plan.featured ? 'border-black bg-black text-white shadow-2xl shadow-black/10 dark:border-white dark:bg-white dark:text-black' : 'border-black/10 bg-white/85 text-black dark:border-white/10 dark:bg-white/[0.04] dark:text-white')}>
                      <div className="mb-8 flex items-center justify-between">
                        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', plan.featured ? 'bg-white/10 text-emerald-300 dark:bg-black dark:text-emerald-400' : 'bg-black text-emerald-300 dark:bg-white dark:text-black')}>
                          <Icon size={20} />
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 dark:text-zinc-500">{plan.eyebrow}</span>
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">{plan.name}</h2>
                      <div className="mt-6"><PlanPrice plan={plan} isYearly={isYearly} /></div>
                      <p className={cn('mt-6 min-h-[56px] text-sm leading-7', plan.featured ? 'text-white/75 dark:text-black/65' : 'text-slate-600 dark:text-zinc-400')}>{plan.description}</p>
                      <button type="button" onClick={() => handlePlanSelect(plan.id)} className={cn('mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black transition-transform active:scale-[0.98]', plan.id === 'FREE' ? 'bg-emerald-500 text-white hover:bg-emerald-400' : plan.featured ? 'bg-emerald-300 text-black hover:bg-emerald-200 dark:bg-emerald-400 dark:hover:bg-emerald-300' : 'bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90')}>
                        {plan.cta}<ArrowRight size={16} />
                      </button>
                      <div className="mt-8 space-y-4">
                        {plan.features.map((feature) => (
                          <div key={feature} className={cn('flex items-center gap-3 text-sm font-semibold', plan.featured ? 'text-white/80 dark:text-black/70' : 'text-slate-700 dark:text-zinc-400')}>
                            <Check size={15} className="text-emerald-500" />{feature}
                          </div>
                        ))}
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            </motion.section>
          ) : (
            <motion.section key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="rounded-2xl border border-black/10 bg-black p-8 text-white shadow-2xl shadow-black/10 dark:border-white/10">
                <button type="button" onClick={() => setStep('PLANS')} className="mb-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-white/55 transition-colors hover:text-white"><ArrowLeft size={16} />Planes</button>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black"><CourtOpsMark className="h-9 w-9" /></div>
                <h1 className="mt-8 text-4xl font-black tracking-tight">Activá tu club.</h1>
                <p className="mt-5 text-sm leading-7 text-white/65">Dejamos listo el espacio inicial para que cargues canchas, horarios y empieces a operar.</p>
                <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">Plan elegido</div>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div className="text-2xl font-black">{selectedPlanData?.name}</div>
                    {selectedPlanData && <PlanPrice plan={selectedPlanData} isYearly={isYearly} />}
                  </div>
                </div>
              </aside>

              <div className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-black tracking-tight">Creá tu cuenta</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400">Usá un email al que tengas acceso. Después podés invitar a tu equipo.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-5">
                  <FormField label="Nombre del club" error={errors.clubName}>
                    <div className="relative"><Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="text" required className={cn('h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm font-semibold text-black outline-none transition-colors focus:border-emerald-500 dark:bg-black/20 dark:text-white', errors.clubName ? 'border-red-500' : 'border-black/10 dark:border-white/10')} placeholder="Ej: Arena Padel" value={formData.clubName} onChange={(e) => setFormData({ ...formData, clubName: e.target.value })} onBlur={() => validate('clubName', formData.clubName)} /></div>
                  </FormField>
                  <FormField label="Tu nombre" error={errors.userName}>
                    <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="text" required className={cn('h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm font-semibold text-black outline-none transition-colors focus:border-emerald-500 dark:bg-black/20 dark:text-white', errors.userName ? 'border-red-500' : 'border-black/10 dark:border-white/10')} placeholder="Franco Rossi" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} onBlur={() => validate('userName', formData.userName)} /></div>
                  </FormField>
                  <FormField label="Email" error={errors.email}>
                    <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type="email" required className={cn('h-12 w-full rounded-xl border bg-white pl-12 pr-4 text-sm font-semibold text-black outline-none transition-colors focus:border-emerald-500 dark:bg-black/20 dark:text-white', errors.email ? 'border-red-500' : 'border-black/10 dark:border-white/10')} placeholder="admin@tuclub.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} onBlur={() => validate('email', formData.email)} /></div>
                  </FormField>
                  <FormField label="Contraseña" error={errors.password}>
                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input type={showPassword ? 'text' : 'password'} required className={cn('h-12 w-full rounded-xl border bg-white pl-12 pr-12 text-sm font-semibold text-black outline-none transition-colors focus:border-emerald-500 dark:bg-black/20 dark:text-white', errors.password ? 'border-red-500' : 'border-black/10 dark:border-white/10')} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} onBlur={() => validate('password', formData.password)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-black dark:hover:text-white" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
                  </FormField>
                  <button type="submit" disabled={loading} className="flex h-13 min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-black text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black">
                    {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <>Finalizar registro <ArrowRight size={17} /></>}
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
