'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, ArrowRight, Zap, Shield, Clock, TrendingUp,
  Star, Gift, ChevronRight, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// ─── Plan data ───────────────────────────────────────────────────────────────

const plans = [
  {
    id: 'arranque',
    name: 'Arranque',
    badge: null,
    price: 45000,
    tagline: 'Para clubes que dan el primer salto digital.',
    roi: 'Operativo en menos de 1 hora',
    features: [
      'Hasta 2 canchas gestionadas',
      'Agenda digital — adiós cuadernos',
      'Base de clientes centralizada',
      'Caja y cobros integrados',
      'Reportes diarios en segundos',
      'QR Check-in básico',
    ],
    notIncluded: ['Kiosco / POS', 'WhatsApp automático', 'Torneos'],
    cta: 'Empezar gratis 7 días',
    ctaSub: 'Sin tarjeta de crédito',
    highlight: false,
    variant: 'default' as const,
  },
  {
    id: 'elite',
    name: 'Élite',
    badge: 'Más elegido',
    price: 85000,
    tagline: 'Automatización total para clubes en crecimiento.',
    roi: '+$120.000/mes de ingresos adicionales en promedio',
    features: [
      'Hasta 8 canchas sin límites',
      'Kiosco / Buffet con stock integrado',
      'WhatsApp auto → -40% no-shows',
      'Torneos y brackets digitales',
      'Reportes financieros completos',
      'QR Check-in + firma digital',
      'Programa de referidos',
      'Soporte prioritario 24/7',
    ],
    notIncluded: [],
    cta: 'Elegir Plan Élite',
    ctaSub: '7 días gratis incluidos',
    highlight: true,
    variant: 'elite' as const,
  },
  {
    id: 'vip',
    name: 'VIP',
    badge: 'Enterprise',
    price: 150000,
    tagline: 'Potencia sin límites para complejos grandes.',
    roi: 'Diseñado para cadenas y grupos deportivos',
    features: [
      'Canchas ilimitadas en todas las sedes',
      'Multi-sede desde un solo panel',
      'API + Webhooks para integradores',
      'Marca blanca con tu branding',
      'Ejecutivo de cuenta dedicado',
    ],
    notIncluded: [],
    cta: 'Hablar con Ventas',
    ctaSub: 'Demo personalizada gratis',
    highlight: false,
    variant: 'vip' as const,
  },
]

const comparisonRows: { feature: string; arranque: boolean | string; elite: boolean | string; vip: boolean | string }[] = [
  { feature: 'Canchas', arranque: 'Hasta 2', elite: 'Hasta 8', vip: 'Ilimitadas' },
  { feature: 'Agenda Digital', arranque: true, elite: true, vip: true },
  { feature: 'Caja & Cobros', arranque: true, elite: true, vip: true },
  { feature: 'QR Check-in', arranque: true, elite: true, vip: true },
  { feature: 'Kiosco / POS', arranque: false, elite: true, vip: true },
  { feature: 'WhatsApp Automático', arranque: false, elite: true, vip: true },
  { feature: 'Torneos', arranque: false, elite: true, vip: true },
  { feature: 'Firma Digital', arranque: false, elite: true, vip: true },
  { feature: 'Reportes Avanzados', arranque: false, elite: true, vip: true },
  { feature: 'Multi-Sede', arranque: false, elite: false, vip: true },
  { feature: 'API / Webhooks', arranque: false, elite: false, vip: true },
  { feature: 'Marca Blanca', arranque: false, elite: false, vip: true },
  { feature: 'Soporte', arranque: 'Email', elite: 'Prioritario 24/7', vip: 'Ejecutivo dedicado' },
]

// ─── Subcomponents ────────────────────────────────────────────────────────────

function BillingToggle({ isYearly, onChange }: { isYearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(false)}
        className={cn(
          'text-sm font-semibold transition-colors',
          !isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-600'
        )}
      >
        Mensual
      </button>
      <button
        onClick={() => onChange(!isYearly)}
        className={cn(
          'w-12 h-6 rounded-full relative transition-colors border focus:outline-none',
          isYearly
            ? 'bg-emerald-500 border-emerald-500'
            : 'bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/10'
        )}
      >
        <motion.div
          animate={{ x: isYearly ? 24 : 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(true)}
          className={cn(
            'text-sm font-semibold transition-colors',
            isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-zinc-600'
          )}
        >
          Anual
        </button>
        <motion.span
          animate={{ opacity: isYearly ? 1 : 0.6, scale: isYearly ? 1 : 0.95 }}
          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/20"
        >
          Ahorrá 20%
        </motion.span>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LandingPricing() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)

  const getPrice = (base: number) =>
    isYearly ? Math.round(base * 0.8) : base

  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

  return (
    <section className="py-10 md:py-24 px-4 sm:px-6 relative overflow-hidden" id="pricing">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-emerald-500/[0.05] blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-8 md:mb-12 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
            <Zap size={9} fill="currentColor" /> Planes y Precios
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Elegí tu Plan.{' '}
            <span className="text-slate-400 dark:text-zinc-500 font-normal">Escala cuando quieras.</span>
          </h2>

          <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Todos incluyen <strong className="text-slate-900 dark:text-white">7 días gratis</strong> y configuración express.
            Sin contratos ni permanencia mínima.
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <div className="flex -space-x-1.5">
                {['bg-emerald-500', 'bg-violet-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500'].map((c, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 border-white dark:border-zinc-950 ${c}`} />
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">+143 clubes activos</span>
            </div>
            <span className="text-slate-200 dark:text-zinc-700 hidden sm:block">·</span>
            <div className="flex items-center gap-1 text-amber-500">
              {[1,2,3,4,5].map(s => <Star key={s} size={11} fill="currentColor" />)}
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 ml-1">4.9 / 5</span>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
          </div>

          <AnimatePresence>
            {isYearly && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="overflow-hidden"
              >
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold">
                  <Gift size={13} /> Con el plan anual ahorrás hasta <strong>$408.000 al año</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
              className={cn(
                'relative rounded-3xl overflow-hidden flex flex-col',
                plan.variant === 'elite'
                  ? 'lg:scale-[1.04] shadow-2xl shadow-emerald-500/15'
                  : ''
              )}
            >
              {/* ── Élite card ── */}
              {plan.variant === 'elite' && (
                <>
                  {/* Animated badge */}
                  <div className="absolute top-0 left-0 right-0 z-20 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-2">
                    <Sparkles size={11} className="text-white/80 fill-white/60" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Más elegido</span>
                    <Sparkles size={11} className="text-white/80 fill-white/60" />
                  </div>

                  {/* Elite card content */}
                  <div className="relative bg-slate-900 border border-emerald-500/40 rounded-3xl flex flex-col pt-12 pb-8 px-7">
                    {/* Glow blobs inside */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                      <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-500/15 blur-[80px] rounded-full" />
                      <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-teal-500/10 blur-[60px] rounded-full" />
                    </div>

                    <div className="relative z-10 flex flex-col gap-5">
                      {/* Plan name */}
                      <div>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{plan.name}</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">{plan.tagline}</p>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          {isYearly && (
                            <span className="text-sm text-zinc-500 line-through">${fmt(plan.price)}</span>
                          )}
                          <span className="text-5xl md:text-6xl font-black text-white tabular-nums tracking-tighter leading-none">
                            ${fmt(getPrice(plan.price))}
                          </span>
                          <span className="text-zinc-500 text-xs">/mes</span>
                        </div>
                        {isYearly && (
                          <p className="text-[10px] font-bold text-emerald-400 mt-1">
                            Ahorrás ${fmt(Math.round(plan.price * 0.2 * 12))} al año
                          </p>
                        )}
                      </div>

                      {/* ROI callout */}
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <TrendingUp size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-emerald-300 leading-snug">{plan.roi}</p>
                      </div>

                      {/* CTA */}
                      <div className="space-y-2">
                        <button
                          onClick={() => router.push('/register')}
                          className="group w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-emerald-50 shadow-xl shadow-black/20 flex items-center justify-center gap-2 overflow-hidden relative"
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
                          <span className="relative">{plan.cta}</span>
                          <ArrowRight size={15} className="relative group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <p className="text-center text-[9px] text-zinc-500 font-semibold">{plan.ctaSub}</p>
                      </div>

                      {/* Features */}
                      <div className="pt-2 space-y-2.5 border-t border-white/[0.06]">
                        {plan.features.map((feat, j) => (
                          <div key={j} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={9} className="text-emerald-400" strokeWidth={3} />
                            </div>
                            <span className="text-xs text-zinc-300 leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── Default & VIP cards ── */}
              {plan.variant !== 'elite' && (
                <div className={cn(
                  'rounded-3xl border flex flex-col gap-5 p-7',
                  plan.variant === 'vip'
                    ? 'bg-slate-900 dark:bg-zinc-950 border-violet-500/20'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08]'
                )}>
                  {/* Top badge */}
                  {plan.badge && (
                    <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 text-violet-500">
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan name */}
                  <div>
                    <p className={cn(
                      'text-[10px] font-black uppercase tracking-[0.2em] mb-1',
                      plan.variant === 'vip' ? 'text-violet-400' : 'text-slate-400 dark:text-zinc-500'
                    )}>
                      {plan.name}
                    </p>
                    <p className="text-slate-500 dark:text-zinc-400 text-xs leading-relaxed">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      {isYearly && (
                        <span className="text-sm text-zinc-400 line-through">${fmt(plan.price)}</span>
                      )}
                      <span className={cn(
                        'text-4xl md:text-5xl font-black tabular-nums tracking-tighter leading-none',
                        plan.variant === 'vip'
                          ? 'text-white'
                          : 'text-slate-900 dark:text-white'
                      )}>
                        ${fmt(getPrice(plan.price))}
                      </span>
                      <span className="text-zinc-400 text-xs">/mes</span>
                    </div>
                    {isYearly && (
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        Ahorrás ${fmt(Math.round(plan.price * 0.2 * 12))} al año
                      </p>
                    )}
                  </div>

                  {/* ROI hint */}
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold border',
                    plan.variant === 'vip'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : 'bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400 border-slate-100 dark:border-white/5'
                  )}>
                    <TrendingUp size={11} className="shrink-0" />
                    {plan.roi}
                  </div>

                  {/* CTA */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => plan.id === 'vip' ? null : router.push('/register')}
                      className={cn(
                        'w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group',
                        plan.variant === 'vip'
                          ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20'
                          : 'bg-slate-900 dark:bg-white/[0.08] text-white border border-slate-800 dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/15'
                      )}
                    >
                      {plan.cta}
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-600 font-medium">{plan.ctaSub}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-white/[0.05] pt-4">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <div className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          plan.variant === 'vip' ? 'bg-violet-500/15' : 'bg-emerald-500/10'
                        )}>
                          <Check size={9} className={plan.variant === 'vip' ? 'text-violet-400' : 'text-emerald-500'} strokeWidth={3} />
                        </div>
                        <span className="text-xs text-slate-600 dark:text-zinc-400 leading-snug">{feat}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feat, j) => (
                      <div key={j} className="flex items-start gap-2.5 opacity-30">
                        <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          <X size={8} className="text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-zinc-500 line-through leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-12 py-6 border-y border-slate-100 dark:border-white/[0.06]"
        >
          {[
            { icon: Shield, text: '7 días gratis en todos los planes' },
            { icon: Clock, text: 'Configuración en menos de 1 hora' },
            { icon: Zap, text: 'Sin contratos ni permanencia' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-slate-500 dark:text-zinc-400">
              <item.icon size={14} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Comparison table — hidden on mobile ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden sm:block mt-16 md:mt-24"
        >
          <div className="text-center mb-10 space-y-2">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Comparación detallada
            </h3>
            <p className="text-xs text-zinc-400">Todo lo que incluye cada plan, sin letra chica.</p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[580px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white dark:bg-zinc-950 text-left py-3 px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[160px] sm:w-[200px]">
                    Funcionalidad
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Arranque
                  </th>
                  <th className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <Zap size={10} fill="currentColor" /> Élite
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center text-xs font-bold text-violet-500 uppercase tracking-wider">
                    VIP
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 dark:border-white/[0.04] hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-white dark:bg-zinc-950 hover:bg-slate-50/70 dark:hover:bg-zinc-950 py-3.5 px-4 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors">
                      {row.feature}
                    </td>
                    {([row.arranque, row.elite, row.vip] as (boolean | string)[]).map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center">
                        {val === true ? (
                          <div className="flex justify-center">
                            <div className={cn(
                              'w-5 h-5 rounded-full flex items-center justify-center',
                              j === 1 ? 'bg-emerald-500/20' : 'bg-emerald-500/10'
                            )}>
                              <Check className="text-emerald-500" size={10} strokeWidth={3} />
                            </div>
                          </div>
                        ) : val === false ? (
                          <X className="mx-auto text-slate-300 dark:text-zinc-700" size={14} />
                        ) : (
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-lg border',
                            j === 1
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 border-emerald-500/15'
                              : j === 2
                                ? 'text-violet-500 bg-violet-500/8 border-violet-500/15'
                                : 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-white/[0.04] border-slate-100 dark:border-white/5'
                          )}>
                            {val}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
