'use client'

import React from 'react'
import { motion } from 'framer-motion'

const testimonios = [
  {
    quote: 'CourtOps ha reducido nuestra carga administrativa en un 60%. Ahora los entrenadores pueden centrarse en la técnica y no en el Excel.',
    nombre: 'Alejandro Ruiz',
    rol: 'Director',
    club: 'Club de Padel "El Muro"',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpohiuHebLgOsmWE8eei8XeCfS2r6MZvmCPJdB8VLFdUiQCF-dIYRUhREAOy0N6aFre3TakLED-cXVYFJj3l8GMTEfCo_0j45670JBoRcnCcbrpjDcTPBp0t095zan3RIaqiL9zHnoYlI3qF-CdjdjTYst5nM8oJX_mZtlaDQZclmDFn15vUCu_NXAUc_l_ehfhS0Hdl0-eaWdTtxKLaS2DuhIw2k5467FPu-KO5Lsmq75bgRYgrZc6FGgfcTTpiFEYck6XesOW0M',
    inicial: 'A',
  },
  {
    quote: 'La mejor inversión tecnológica que hemos hecho. Los socios están encantados con la app y la tasa de ocupación ha subido un 15%.',
    nombre: 'Elena Martínez',
    rol: 'Gerente',
    club: 'Arena Sports Center',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7FhbkCl5Sw7LTKQ99AdWIYnBgzKQhwWLDOW3-YM59jw_HfdaZTk-aMMCtoCoPkziLm1u_vrQjiBi0Lvh3A6NyebFSKSb0Th7wO-KvbK62HTXv3UYZFQqC0hx-AGFZc4_4Mo8RAsHt6YTGW_mm58i5GbzD8n7gAy6lHdooEoWpS7Tt-KGcaSUTw',
    inicial: 'E',
  },
]

export default function LandingTestimonials() {
  return (
    <section className="py-16 md:py-32 px-6 md:px-8" style={{ background: 'var(--co-surface)' }}>
      <div className="max-w-7xl mx-auto">

        <h2
          className="text-4xl font-black text-center mb-16"
          style={{ color: 'var(--co-navy)' }}
        >
          Hablamos con resultados
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonios.map((t, i) => (
            <motion.div
              key={i}
              className="p-10 sm:p-12 rounded-[2rem] border"
              style={{
                background: 'var(--co-card)',
                borderColor: 'var(--co-border)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: i * 0.1 }}
            >
              <p
                className="text-lg sm:text-xl italic leading-relaxed mb-8"
                style={{ color: 'var(--co-muted)' }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.nombre}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const next = e.currentTarget.nextElementSibling as HTMLElement | null
                    if (next) next.style.display = 'flex'
                  }}
                />
                {/* Avatar de respaldo */}
                <div
                  className="hidden w-14 h-14 rounded-full items-center justify-center text-white font-bold text-xl shrink-0"
                  style={{ background: 'var(--co-green)' }}
                >
                  {t.inicial}
                </div>
                <div>
                  <p className="font-bold" style={{ color: 'var(--co-navy)' }}>{t.nombre}</p>
                  <p className="text-sm" style={{ color: 'var(--co-muted)' }}>
                    {t.rol}, {t.club}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
