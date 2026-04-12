'use client'

import React from 'react'
import { motion } from 'framer-motion'

const pasos = [
  {
    numero: '1',
    titulo: 'Configura tus pistas',
    descripcion: 'Sube tus horarios y tarifas en un proceso asistido de 10 minutos.',
  },
  {
    numero: '2',
    titulo: 'Importa tus socios',
    descripcion: 'Sube tu base de datos actual. Nosotros nos encargamos de las invitaciones.',
  },
  {
    numero: '3',
    titulo: '¡Lanza tu club!',
    descripcion: 'Empieza a recibir reservas y automatizar tus cobros de inmediato.',
  },
]

export default function LandingHowItWorks() {
  return (
    <section
      className="py-32 px-6 md:px-8"
      style={{ background: 'var(--co-bg)' }}
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-20">
          <h2
            className="text-4xl font-black mb-4"
            style={{ color: 'var(--co-navy)' }}
          >
            De cero a operativo en menos de una hora
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--co-muted)' }}>
            Simplicidad técnica sin sacrificar profundidad funcional.
          </p>
        </div>

        {/* Pasos */}
        <div className="grid md:grid-cols-3 gap-12 relative">
          {pasos.map((paso, i) => (
            <motion.div
              key={i}
              className="relative text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1], delay: i * 0.12 }}
            >
              {/* Círculo numerado */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto mb-8"
                style={{
                  background: 'var(--co-green)',
                  boxShadow: '0 8px 24px var(--co-green-shadow)',
                }}
              >
                {paso.numero}
              </div>

              {/* Línea conectora (solo escritorio, no en el último) */}
              {i < pasos.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-1/2 w-full h-px -z-10"
                  style={{ background: 'var(--co-mint)', marginLeft: '32px' }}
                />
              )}

              <h4
                className="text-xl font-bold mb-4"
                style={{ color: 'var(--co-navy)' }}
              >
                {paso.titulo}
              </h4>
              <p style={{ color: 'var(--co-muted)' }}>
                {paso.descripcion}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
