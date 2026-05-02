'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Zap,
  Shield,
  Headphones,
  RefreshCw,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Settings2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

/* ─── Plan data ─────────────────────────────────────────────────────────────── */

const planes = [
  {
    id: 'base',
    nombre: 'Base',
    badge: null,
    subtitulo: 'Para clubes que quieren empezar ordenados sin complejidad.',
    precio: 45000,
    cta: 'Empezar con Base',
    destacado: false,
    funciones: [
      { texto: 'Hasta 2 canchas de pádel', nueva: false },
      { texto: 'Hasta 3 usuarios / empleados', nueva: false },
      { texto: 'Reservas online con link público propio', nueva: true },
      { texto: 'Turnero digital en tiempo real', nueva: true },
      { texto: 'Gestión completa de clientes', nueva: true },
      { texto: 'Caja diaria con apertura y cierre', nueva: true },
      { texto: 'QR Check-in para control de acceso', nueva: true },
      { texto: 'Soporte por email (Lun–Vie)', nueva: false },
    ],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    badge: 'Más popular',
    subtitulo: 'La operación completa para vender, cobrar y automatizar.',
    precio: 79000,
    cta: 'Empezar con Pro',
    destacado: true,
    funciones: [
      { texto: 'Hasta 8 canchas de pádel', nueva: false },
      { texto: 'Hasta 10 usuarios / empleados', nueva: false },
      { texto: 'Todo lo del plan Base incluido', nueva: false },
      { texto: 'Kiosco POS con gestión de stock', nueva: true },
      { texto: 'Pagos online con MercadoPago', nueva: true },
      { texto: 'Recordatorios y confirmaciones por WhatsApp', nueva: true },
      { texto: 'Torneos con brackets automáticos', nueva: true },
      { texto: 'Waivers digitales con firma electrónica', nueva: true },
      { texto: 'Reportes de ingresos y ocupación', nueva: true },
      { texto: 'Sistema de membresías y abonos', nueva: true },
      { texto: 'Soporte prioritario WhatsApp 24/7', nueva: true },
    ],
  },
  {
    id: 'max',
    nombre: 'Max',
    badge: null,
    subtitulo: 'Para complejos premium que necesitan escala total.',
    precio: 119000,
    cta: 'Empezar con Max',
    destacado: false,
    funciones: [
      { texto: 'Canchas ilimitadas', nueva: false },
      { texto: 'Usuarios ilimitados', nueva: false },
      { texto: 'Todo lo del plan Pro incluido', nueva: false },
      { texto: 'Multi-sucursal (hasta 3 sedes)', nueva: true },
      { texto: 'Dominio personalizado (tuclub.com)', nueva: true },
      { texto: 'Branding white-label completo', nueva: true },
      { texto: 'Academia y gestión de profesores', nueva: true },
      { texto: 'Gestor de cuenta dedicado', nueva: true },
      { texto: 'Acceso anticipado a nuevas funciones', nueva: true },
    ],
  },
]

const garantias = [
  { icon: Settings2, texto: 'Configuración inicial incluida' },
  { icon: Headphones, texto: 'Soporte personalizado' },
  { icon: Shield, texto: 'Sin contratos largos' },
  { icon: RefreshCw, texto: 'Actualizaciones constantes' },
]

/* ─── Utils ──────────────────────────────────────────────────────────────────── */

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

/* ─── Sub-components ─────────────────────────────────────────────────────────── */

function PlanCard({
  plan,
  esAnual,
  index,
  onCta,
}: {
  plan: (typeof planes)[number]
  esAnual: boolean
  index: number
  onCta: () => void
}) {
  const precioBase = esAnual ? Math.round(plan.precio * 0.8) : plan.precio
  const precioTachado = esAnual ? plan.precio : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className={cn(
        'relative flex flex-col',
        plan.destacado && 'md:-mt-4 md:z-10',
      )}
    >
      {/* Glow behind PRO card */}
      {plan.destacado && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[28px] blur-2xl opacity-30"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #34d399 0%, transparent 70%)' }}
          aria-hidden
        />
      )}

      <div
        className={cn(
          'relative flex flex-col flex-1 rounded-[24px] overflow-hidden transition-all duration-300',
          plan.destacado
            ? 'bg-zinc-900 shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_24px_80px_rgba(0,0,0,0.5)]'
            : 'bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]',
        )}
      >
        {/* Top emerald accent stripe on PRO */}
        {plan.destacado && (
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        )}

        <div className={cn('flex flex-col flex-1 p-7 md:p-8', plan.destacado && 'md:py-10')}>

          {/* Badge */}
          {plan.badge ? (
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 px-3 py-1">
              <Sparkles size={11} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                {plan.badge}
              </span>
            </div>
          ) : (
            <div className="mb-4 h-[26px]" />
          )}

          {/* Plan name + subtitle */}
          <h3 className="text-2xl font-black tracking-tight text-white">
            {plan.nombre}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 min-h-[40px]">
            {plan.subtitulo}
          </p>

          {/* Price block */}
          <div className="mt-7 mb-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={esAnual ? `${plan.id}-anual` : `${plan.id}-mensual`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="flex items-end gap-2"
              >
                {precioTachado && (
                  <span className="mb-1.5 text-sm text-zinc-600 line-through tabular-nums">
                    {fmt(precioTachado)}
                  </span>
                )}
                <span
                  className={cn(
                    'text-[2.6rem] font-black leading-none tracking-tight tabular-nums',
                    plan.destacado ? 'text-white' : 'text-zinc-100',
                  )}
                >
                  {fmt(precioBase)}
                </span>
                <span className="mb-1.5 text-sm text-zinc-500">/mes</span>
              </motion.div>
            </AnimatePresence>
            <p className="mt-1.5 text-xs text-zinc-600">
              + $150.000 pago único inicial · Primer mes bonificado
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-6" />

          {/* Features */}
          <ul className="space-y-3 flex-grow mb-8">
            {plan.funciones.map((f, j) => (
              <li key={j} className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
                    f.nueva && plan.destacado
                      ? 'bg-emerald-400/15'
                      : f.nueva
                      ? 'bg-emerald-400/10'
                      : 'bg-zinc-800',
                  )}
                >
                  <Check
                    size={10}
                    strokeWidth={3}
                    className={cn(
                      f.nueva ? 'text-emerald-400' : 'text-zinc-500',
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'text-sm leading-relaxed',
                    f.nueva ? 'text-zinc-200' : 'text-zinc-500',
                  )}
                >
                  {f.texto}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {plan.destacado ? (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              onClick={onCta}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 py-4 text-sm font-black text-emerald-950 shadow-[0_8px_32px_rgba(52,211,153,0.25)] transition-colors hover:bg-emerald-300"
            >
              {plan.cta}
              <ArrowRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              onClick={onCta}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/50 py-4 text-sm font-black text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            >
              {plan.cta}
              <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────────── */

export default function LandingPricing() {
  const router = useRouter()
  const [esAnual, setEsAnual] = useState(false)

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#09090b] py-24 md:py-36 px-5 md:px-8"
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        {/* Center top radial glow */}
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 opacity-[0.07]"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, #34d399 0%, transparent 70%)',
          }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="text-center mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 mb-6"
          >
            <Zap size={12} className="text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              Planes
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05]"
          >
            Tu club en modo
            <br />
            <span className="text-emerald-400">profesional.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed"
          >
            Sin contratos largos ni complicaciones.
            Empezá en minutos y escalá cuando el negocio lo pida.
          </motion.p>

          {/* Toggle mensual / anual */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-8 inline-flex items-center rounded-2xl bg-zinc-900 border border-zinc-800 p-1 gap-1"
          >
            <button
              onClick={() => setEsAnual(false)}
              className={cn(
                'relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                !esAnual
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setEsAnual(true)}
              className={cn(
                'relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                esAnual
                  ? 'bg-zinc-700 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              Anual
              <span className="rounded-full bg-emerald-400/15 border border-emerald-400/25 px-2 py-0.5 text-[10px] font-black text-emerald-400 tracking-wider">
                −20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid gap-4 md:gap-5 md:grid-cols-3 items-end">
          {planes.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              esAnual={esAnual}
              index={i}
              onCta={() => router.push(`/register?plan=${plan.id}`)}
            />
          ))}
        </div>

        {/* ── Trust badges ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {garantias.map(({ icon: Icon, texto }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-400/15">
                <Icon size={14} className="text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-zinc-300 leading-tight">
                {texto}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── Footnote ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center text-xs text-zinc-600"
        >
          Todos los planes incluyen pago único inicial de $150.000 con el primer mes bonificado.
          Podés cambiar de plan en cualquier momento.
        </motion.p>
      </div>
    </section>
  )
}
