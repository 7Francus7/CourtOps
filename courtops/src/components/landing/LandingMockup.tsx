'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Monitor, Smartphone, Tv } from 'lucide-react'

const canales = [
  {
    icon: Monitor,
    title: 'Panel de Administración (PC)',
    description: 'Gestión centralizada desde la oficina con herramientas avanzadas de administración.',
  },
  {
    icon: Smartphone,
    title: 'App para Jugadores',
    description: 'Reserva y paga en segundos desde el móvil. Disponible en iOS y Android.',
  },
  {
    icon: Tv,
    title: 'Kiosko y TV',
    description: 'Visualización de pistas y turnos en las pantallas de tu club automáticamente.',
  },
]

export default function LandingMockup() {
  return (
    <section
      className="py-16 md:py-32 px-6 md:px-8 overflow-hidden"
      style={{ background: 'var(--co-dark-section)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">

        {/* Izquierda — texto */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <h2
            className="text-4xl sm:text-5xl font-black leading-tight mb-12"
            style={{ color: '#f9f9ff' }}
          >
            Omnicanalidad real para tu club
          </h2>

          <div className="space-y-10">
            {canales.map((ch, i) => (
              <motion.div
                key={i}
                className="flex gap-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
              >
                <div className="shrink-0 mt-1" style={{ color: 'var(--co-green)' }}>
                  <ch.icon size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#f9f9ff' }}>
                    {ch.title}
                  </h4>
                  <p className="leading-relaxed" style={{ color: 'rgba(249,249,255,0.55)' }}>
                    {ch.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Derecha — imagen */}
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
        >
          <div
            className="p-4 rounded-[2.5rem]"
            style={{ background: 'rgba(216,227,251,0.08)', backdropFilter: 'blur(24px)' }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAB_ezIsAcqH-KEbY2kQDakHS-n6NmEh0uTc44SuDhijBbaSnTeCJ26-0qzYVauYmgAdTQy_6Lhr02_3SXqWvrkDtu-KSuPGeug-iZ_FSRNoTF2t_1Jm0s1K0GVuDvUvCEPs-LKQAr12m2yOE5mduQ1XYJKNTrgZApPU56Xm0qk9QhnhTMIPAou0mUGWZsUeExtiAKuobJ8YzHHOog-gS5rQJwmn9d0IL_Abpu5xH4G5rI5VWNFhcFomYKfLrwUmBzNT-d1YgVWEk"
              alt="CourtOps en múltiples dispositivos"
              className="rounded-[2rem] w-full h-auto block"
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const next = e.currentTarget.nextElementSibling as HTMLElement | null
                if (next) next.style.display = 'flex'
              }}
            />
            {/* Fallback */}
            <div
              className="hidden w-full h-72 rounded-[2rem] items-center justify-center text-sm font-semibold"
              style={{ background: 'rgba(249,249,255,0.06)', color: 'rgba(249,249,255,0.4)' }}
            >
              Vista multi-dispositivo
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
