'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, CreditCard, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: CalendarCheck,
    title: 'Gestión de Reservas',
    description: 'Sistema inteligente que optimiza la ocupación de pistas y evita solapamientos en tiempo real.',
    dark: false,
  },
  {
    icon: CreditCard,
    title: 'Pagos Online',
    description: 'Pasarela de pagos integrada para abonos, cuotas y reservas instantáneas con seguridad bancaria.',
    dark: true,
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en Tiempo Real',
    description: 'Análisis profundo de ingresos, ocupación y tendencias para decisiones basadas en datos puros.',
    dark: false,
  },
]

export default function LandingFeatures() {
  return (
    <section
      className="py-16 md:py-32 px-6 md:px-8"
      style={{ background: 'var(--co-bg)' }}
      id="features"
    >
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="mb-10 md:mb-20">
          <span
            className="font-extrabold uppercase text-xs tracking-[0.2em]"
            style={{ color: 'var(--co-green)' }}
          >
            Potencia sin límites
          </span>
          <h2
            className="text-4xl sm:text-5xl font-black tracking-tight mt-4"
            style={{ color: 'var(--co-navy)' }}
          >
            Gestión de alto rendimiento
          </h2>
        </div>

        {/* Tarjetas */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
              className="p-10 rounded-[2rem] group transition-all duration-300"
              style={{ background: feat.dark ? 'var(--co-featured-card)' : 'var(--co-surface)' }}
            >
              {/* Icono */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300"
                style={{ background: feat.dark ? 'var(--co-green)' : 'var(--co-card)' }}
              >
                <feat.icon
                  size={28}
                  strokeWidth={1.5}
                  style={{ color: feat.dark ? '#fff' : 'var(--co-green)' }}
                />
              </div>

              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: feat.dark ? '#f9f9ff' : 'var(--co-navy)' }}
              >
                {feat.title}
              </h3>

              <p
                className="leading-relaxed"
                style={{ color: feat.dark ? 'rgba(249,249,255,0.6)' : 'var(--co-muted)' }}
              >
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
