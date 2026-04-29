'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function LandingHero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden" style={{ background: 'var(--co-bg)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-16 items-center">

        {/* Izquierda — texto */}
        <motion.div
          className="z-10"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
        >
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest mb-6"
            style={{ background: 'var(--co-mint)', color: 'var(--co-mint-text)' }}
          >
            GESTIÓN PARA CLUBES
          </span>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-[-0.04em] mb-8"
            style={{ color: 'var(--co-navy)' }}
          >
            Lleva tu club al siguiente nivel con CourtOps
          </h1>

          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: 'var(--co-muted)' }}>
            Control total desde una única plataforma diseñada para la alta competición. Automatiza reservas, pagos y estadísticas con precisión quirúrgica.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-full font-bold text-lg text-white transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
              style={{
                background: 'var(--co-green)',
                boxShadow: '0 4px 20px var(--co-green-shadow)',
              }}
            >
              Prueba Gratis
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 rounded-full font-bold text-lg transition-all active:scale-95 hover:opacity-80"
              style={{
                background: 'var(--co-hero-btn2)',
                color: 'var(--co-hero-btn2-text)',
              }}
            >
              Ver Demo
            </Link>
          </div>
        </motion.div>

        {/* Derecha — imagen */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.95, ease: [0.19, 1, 0.22, 1], delay: 0.1 }}
        >
          {/* Orbe ambiental */}
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'var(--co-green-10)' }}
          />

          <div className="relative z-10 lg:rotate-3 hover:rotate-0 transition-transform duration-700">
            <div
              className="bg-white p-2 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0px 20px 60px rgba(17,28,45,0.08)' }}
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKlSWBdLHc46m_ytdFcftiotvnpaKPfAtCnXNvweyrN7is5Duc_16ZNexl89FRg1m4QM5liVY0r5Pwjn19AqN27if0OYj8jHnFkCjkk-vJxehf8sB2noD_YG1EWfHalmWPMxxndpSIvAgSO2HkBYA4GkQXsfglDBY_5vZbfXotu_X7EYrFbmnm4M0hjHbSO_5bofzLQK6vWpLA38c4TZ4unuC0ebWHw4EoZkTO79RjnX4FRJ_7JkqodLpjQX_Yp3zN6y-ua6V1UDk"
                alt="Dashboard de CourtOps con métricas del club"
                className="rounded-xl w-full h-auto block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const next = e.currentTarget.nextElementSibling as HTMLElement | null
                  if (next) next.style.display = 'flex'
                }}
              />
              {/* Fallback */}
              <div
                className="hidden w-full h-72 rounded-xl items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--co-surface)', color: 'var(--co-muted)' }}
              >
                CourtOps Dashboard
              </div>
            </div>

            {/* Chip flotante */}
            <div
              className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 p-3 sm:p-5 rounded-2xl"
              style={{
                background: 'color-mix(in srgb, var(--co-card) 85%, transparent)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--co-border)',
                boxShadow: '0 8px 32px rgba(17,28,45,0.12)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--co-green)' }}
                >
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--co-navy-50)' }}>
                    Crecimiento
                  </p>
                  <p className="text-2xl font-black leading-none" style={{ color: 'var(--co-navy)' }}>
                    +24% mensual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
