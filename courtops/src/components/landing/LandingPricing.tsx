'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

const planes = [
  {
    id: 'arranque',
    nombre: 'Básico',
    subtitulo: 'Para clubes que inician',
    precio: 45000,
    funciones: [
      'Gestión de hasta 4 pistas',
      'Reservas ilimitadas',
      'Caja y cobros integrados',
      'Soporte vía email',
    ],
    cta: 'Elegir Básico',
    destacado: false,
  },
  {
    id: 'elite',
    nombre: 'Élite',
    subtitulo: 'Gestión profesional completa',
    precio: 85000,
    funciones: [
      'Pistas ilimitadas',
      'WhatsApp automático',
      'Kiosko / POS con stock',
      'Pagos online integrados',
      'Torneos y brackets digitales',
      'Soporte prioritario 24/7',
    ],
    cta: 'Elegir Élite',
    destacado: true,
  },
  {
    id: 'vip',
    nombre: 'Pro',
    subtitulo: 'Grandes instalaciones y redes',
    precio: 150000,
    funciones: [
      'Todo lo de Élite',
      'Multi-sede desde un panel',
      'API de desarrollador',
      'Manager de cuenta dedicado',
      'Marca blanca con tu branding',
    ],
    cta: 'Elegir Pro',
    destacado: false,
  },
]

export default function LandingPricing() {
  const router = useRouter()
  const [esAnual, setEsAnual] = useState(false)

  const getPrecio = (base: number) => esAnual ? Math.round(base * 0.8) : base
  const fmt = (n: number) => new Intl.NumberFormat('es-AR').format(n)

  return (
    <section
      className="py-32 px-6 md:px-8"
      style={{ background: 'var(--co-bg)' }}
      id="pricing"
    >
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-black mb-8"
            style={{ color: 'var(--co-navy)' }}
          >
            Planes que escalan contigo
          </h2>

          {/* Toggle facturación */}
          <div
            className="inline-flex items-center p-1 rounded-full"
            style={{ background: 'var(--co-surface-card)' }}
          >
            <button
              onClick={() => setEsAnual(false)}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all"
              style={!esAnual
                ? {
                  background: 'var(--co-card)',
                  color: 'var(--co-navy)',
                  boxShadow: '0 1px 4px rgba(17,28,45,0.1)',
                }
                : { color: 'var(--co-muted)' }
              }
            >
              Mensual
            </button>
            <button
              onClick={() => setEsAnual(true)}
              className="px-6 py-2 rounded-full font-bold text-sm transition-all"
              style={esAnual
                ? {
                  background: 'var(--co-card)',
                  color: 'var(--co-navy)',
                  boxShadow: '0 1px 4px rgba(17,28,45,0.1)',
                }
                : { color: 'var(--co-muted)' }
              }
            >
              Anual{' '}
              <span className="font-extrabold" style={{ color: 'var(--co-green)' }}>
                (Ahorra 20%)
              </span>
            </button>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {planes.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
              className="relative flex flex-col"
              style={plan.destacado ? { transform: 'scale(1.05)', zIndex: 10 } : {}}
            >
              {/* Badge "Más Popular" */}
              {plan.destacado && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 rounded-full text-xs font-black tracking-widest whitespace-nowrap"
                  style={{ background: 'var(--co-green)', color: '#fff' }}
                >
                  MÁS POPULAR
                </div>
              )}

              <div
                className="flex flex-col p-10 rounded-[2.5rem] flex-1"
                style={plan.destacado
                  ? {
                    background: 'var(--co-featured-card)',
                    boxShadow: '0 25px 60px rgba(9,20,38,0.2)',
                  }
                  : {
                    background: 'var(--co-card)',
                    border: '1px solid var(--co-border)',
                  }
                }
              >
                {/* Nombre del plan */}
                <h4
                  className="text-xl font-bold mb-2"
                  style={{ color: plan.destacado ? '#f9f9ff' : 'var(--co-navy)' }}
                >
                  {plan.nombre}
                </h4>
                <p
                  className="mb-6 text-sm"
                  style={{ color: plan.destacado ? 'rgba(249,249,255,0.55)' : 'var(--co-muted)' }}
                >
                  {plan.subtitulo}
                </p>

                {/* Precio */}
                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={esAnual ? 'anual' : 'mensual'}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span
                        className="text-4xl font-black"
                        style={{ color: plan.destacado ? '#f9f9ff' : 'var(--co-navy)' }}
                      >
                        ${fmt(getPrecio(plan.precio))}
                      </span>
                      <span
                        className="text-sm ml-1"
                        style={{ color: plan.destacado ? 'rgba(249,249,255,0.45)' : 'var(--co-muted)' }}
                      >
                        /mes
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Funciones */}
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.funciones.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: 'var(--co-green)' }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: plan.destacado ? 'rgba(249,249,255,0.75)' : 'var(--co-muted)' }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.destacado ? (
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-4 rounded-full font-black text-sm text-white transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      background: 'var(--co-green)',
                      boxShadow: '0 8px 24px var(--co-green-shadow)',
                    }}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-4 rounded-full font-black text-sm border-2 transition-all hover:bg-[var(--co-navy)] hover:text-white active:scale-95"
                    style={{
                      borderColor: 'var(--co-navy)',
                      color: 'var(--co-navy)',
                      background: 'transparent',
                    }}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
