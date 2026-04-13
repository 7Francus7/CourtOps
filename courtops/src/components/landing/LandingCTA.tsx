'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingCTA() {
  return (
    <section className="py-24 px-6 md:px-8" style={{ background: 'var(--co-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="relative rounded-[3rem] p-14 md:p-24 text-center overflow-hidden"
          style={{ background: 'var(--co-green)' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Orbe ambiental */}
          <div
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />

          <div className="relative z-10">
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-8 text-white"
            >
              ¿Listo para transformar tu gestión?
            </h2>
            <p className="text-lg sm:text-xl mb-12 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Únete a los clubes líderes que ya operan con precisión. Empieza tu prueba gratuita de 7 días, sin tarjetas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-5 rounded-full font-black text-lg text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--co-featured-card)',
                  boxShadow: '0 8px 32px rgba(9,20,38,0.3)',
                }}
              >
                Empieza tu prueba gratuita hoy
              </Link>
              <Link
                href="#pricing"
                className="px-10 py-5 rounded-full font-black text-lg text-white transition-all hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                Ver planes
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
