'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, BarChart3, Layout, MessageSquare, ScanLine,
  Trophy, FileText, Gift, Check, Zap, TrendingUp, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Mini demo components ---

function BookingMini() {
  const [active, setActive] = useState(2)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % 6), 1600)
    return () => clearInterval(t)
  }, [])

  const slots = [
    { time: '09:00', player: 'García', booked: true },
    { time: '10:30', player: 'Rodríguez', booked: true },
    { time: '12:00', player: null, booked: false },
    { time: '14:00', player: 'Martinez', booked: true },
    { time: '16:00', player: null, booked: false },
    { time: '18:00', player: 'VIP', booked: true },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot, i) => (
        <motion.div
          key={i}
          animate={i === active && !slot.booked ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'rounded-xl p-2.5 border text-center transition-all duration-300',
            slot.booked
              ? 'bg-emerald-500/8 dark:bg-emerald-500/10 border-emerald-500/20'
              : i === active
                ? 'bg-emerald-500/5 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5'
          )}
        >
          <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">{slot.time}</div>
          {slot.booked ? (
            <div className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{slot.player}</div>
          ) : (
            <div className={cn('text-[8px] font-bold mt-0.5', i === active ? 'text-emerald-400' : 'text-slate-300 dark:text-zinc-700')}>
              {i === active ? '+ Reservar' : 'Libre'}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function WhatsAppMini() {
  const messages = [
    { text: 'Recordatorio: Cancha 2, mañana 18:00 hs', from: 'bot', delay: 0 },
    { text: 'García vs Rodríguez · Seña $3.200 abonada', from: 'bot', delay: 0.25 },
    { text: 'Confirmado! Nos vemos mañana', from: 'user', delay: 0.55 },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <MessageSquare size={11} className="text-white" />
        </div>
        <span className="text-[9px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">CourtOps Bot</span>
        <div className="flex items-center gap-1 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[7px] font-bold text-emerald-500 uppercase">Online</span>
        </div>
      </div>
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: m.from === 'bot' ? -8 : 8, y: 4 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: m.delay, duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'px-3 py-2 rounded-xl text-[9px] font-medium max-w-[88%]',
            m.from === 'bot'
              ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-zinc-300 rounded-tl-sm'
              : 'bg-emerald-500 text-white ml-auto rounded-tr-sm'
          )}
        >
          {m.text}
        </motion.div>
      ))}
    </div>
  )
}

function AnalyticsMini() {
  const bars = [40, 65, 50, 85, 70, 95, 75]

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 h-16 relative">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 relative h-full">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className={cn(
                'w-full rounded-t-lg absolute bottom-0',
                i === 5 ? 'bg-emerald-500' : 'bg-emerald-500/20 dark:bg-emerald-500/15'
              )}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <span key={d} className="text-[7px] font-bold text-slate-300 dark:text-zinc-700 flex-1 text-center">{d}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/15">
        <TrendingUp size={11} className="text-emerald-500 shrink-0" />
        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">+18% vs mes anterior · $1.2M este mes</span>
      </div>
    </div>
  )
}

function QRMini() {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 p-2 flex items-center justify-center"
      >
        <div className="w-full h-full grid grid-cols-4 gap-0.5">
          {[1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1].map((v, i) => (
            <div key={i} className={cn('rounded-[1px]', v ? 'bg-slate-900 dark:bg-white' : 'bg-transparent')} />
          ))}
        </div>
      </motion.div>
      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full">
        <Check size={9} className="text-emerald-500" strokeWidth={3} />
        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Check-in confirmado</span>
      </div>
    </div>
  )
}

function TournamentMini() {
  return (
    <div className="flex items-center gap-2 justify-center flex-wrap">
      <div className="flex flex-col gap-1.5">
        {([['García', true], ['López', false], ['Martínez', true], ['Ruiz', false]] as [string, boolean][]).map(([p, w], i) => (
          <div key={i} className={cn(
            'px-2.5 py-1.5 rounded-lg border text-[8px] font-bold',
            w
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 text-slate-400'
          )}>
            {p}
          </div>
        ))}
      </div>
      <ChevronRight size={12} className="text-slate-300 dark:text-zinc-700 shrink-0" />
      <div className="flex flex-col gap-1.5">
        {([['García', true], ['Martínez', false]] as [string, boolean][]).map(([p, w], i) => (
          <div key={i} className={cn(
            'px-2.5 py-1.5 rounded-lg border text-[8px] font-bold',
            w
              ? 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400'
              : 'bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5 text-slate-400'
          )}>
            {p}
          </div>
        ))}
      </div>
      <ChevronRight size={12} className="text-slate-300 dark:text-zinc-700 shrink-0" />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[9px] font-black text-amber-600 dark:text-amber-400 text-center"
      >
        Campeon<br />Garcia
      </motion.div>
    </div>
  )
}

// --- BentoCard ---

interface BentoCardProps {
  icon: React.ElementType
  iconClass: string
  title: string
  description: string
  children: React.ReactNode
  className?: string
  highlight?: boolean
  delay?: number
}

function BentoCard({ icon: Icon, iconClass, title, description, children, className, highlight, delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1], delay }}
      className={cn(
        'relative rounded-3xl border p-6 flex flex-col overflow-hidden group transition-all duration-300 hover:-translate-y-1',
        highlight
          ? 'bg-gradient-to-br from-emerald-500/[0.07] to-transparent dark:from-emerald-500/[0.10] border-emerald-500/30 dark:border-emerald-500/25 shadow-xl shadow-emerald-500/5'
          : 'bg-white dark:bg-white/[0.03] border-slate-200/80 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/15 shadow-sm dark:shadow-none',
        className
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-emerald-500/3 to-transparent pointer-events-none rounded-3xl" />
      <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center mb-4 shrink-0', iconClass)}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white tracking-tight mb-1 text-base">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-5">{description}</p>
      <div className="flex-1 flex flex-col justify-end">
        {children}
      </div>
    </motion.div>
  )
}

// --- Main ---

export default function LandingFeatures() {
  return (
    <section className="py-10 md:py-24 px-4 sm:px-6 relative overflow-hidden" id="features">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-emerald-500/[0.04] blur-[160px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-8 md:mb-16 space-y-3 px-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Zap size={11} fill="currentColor" /> Todo en una plataforma
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            Cada herramienta que
            <br className="hidden md:block" />
            <span className="text-slate-400 dark:text-zinc-500"> tu club necesita.</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

          {/* Booking — featured wide */}
          <div className="sm:col-span-2 lg:col-span-4">
            <BentoCard
              icon={Calendar}
              iconClass="bg-emerald-500/10 text-emerald-500"
              title="Reservas en Segundos"
              description="Tus jugadores reservan cancha desde el celular. Vos ves todo en tiempo real — sin llamadas, sin papel, sin Excel."
              highlight
              delay={0}
              className="h-full"
            >
              <BookingMini />
            </BentoCard>
          </div>

          {/* Analytics */}
          <div className="lg:col-span-2">
            <BentoCard
              icon={BarChart3}
              iconClass="bg-indigo-500/10 text-indigo-500"
              title="Analytics en Vivo"
              description="Reportes de ingresos, ocupación y clientes. Todo en tiempo real desde el panel."
              delay={0.08}
              className="h-full"
            >
              <AnalyticsMini />
            </BentoCard>
          </div>

          {/* WhatsApp */}
          <div className="lg:col-span-2">
            <BentoCard
              icon={MessageSquare}
              iconClass="bg-blue-500/10 text-blue-500"
              title="WhatsApp Automático"
              description="Recordatorios y confirmaciones enviados solos — sin tocar nada."
              delay={0.12}
              className=""
            >
              <WhatsAppMini />
            </BentoCard>
          </div>

          {/* QR Check-in */}
          <div className="lg:col-span-2">
            <BentoCard
              icon={ScanLine}
              iconClass="bg-cyan-500/10 text-cyan-500"
              title="QR Check-in"
              description="Cada reserva genera un QR único. El jugador escanea al llegar y queda registrado."
              delay={0.16}
              className=""
            >
              <QRMini />
            </BentoCard>
          </div>

          {/* POS / Kiosco */}
          <div className="lg:col-span-2">
            <BentoCard
              icon={Layout}
              iconClass="bg-amber-500/10 text-amber-500"
              title="Kiosco & POS"
              description="Vendé productos desde la cancha. Stock integrado, todo queda en caja."
              delay={0.2}
              className=""
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Agua', price: '$1.500', emoji: '💧' },
                  { name: 'Pelotas', price: '$12.000', emoji: '🎾' },
                  { name: 'Grip', price: '$3.000', emoji: '🏓' },
                  { name: 'Gatorade', price: '$2.500', emoji: '⚡' },
                ].map((p, i) => (
                  <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                    <div className="text-sm mb-0.5">{p.emoji}</div>
                    <div className="text-[7px] font-bold text-slate-400 uppercase">{p.name}</div>
                    <div className="text-[9px] font-black text-amber-600 dark:text-amber-400">{p.price}</div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Tournaments */}
          <div className="sm:col-span-2 lg:col-span-3">
            <BentoCard
              icon={Trophy}
              iconClass="bg-violet-500/10 text-violet-500"
              title="Torneos & Brackets"
              description="Armá torneos con brackets digitales. Los jugadores se anotan solos desde el link público."
              delay={0.24}
              className=""
            >
              <TournamentMini />
            </BentoCard>
          </div>

          {/* Waivers + Referrals */}
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BentoCard
              icon={FileText}
              iconClass="bg-rose-500/10 text-rose-500"
              title="Firmas Digitales"
              description="Deslinde con firma electrónica antes de jugar. Sin papeles."
              delay={0.28}
              className=""
            >
              <div>
                <div className="h-9 rounded-lg border-2 border-dashed border-rose-300/50 dark:border-rose-500/25 flex items-center justify-center mb-2">
                  <span className="text-[9px] font-medium text-rose-300 dark:text-rose-600 italic">firma aquí...</span>
                </div>
                <div className="flex items-center gap-1.5 bg-rose-500/8 dark:bg-rose-500/10 px-2.5 py-1.5 rounded-lg">
                  <Check size={9} className="text-rose-500" strokeWidth={3} />
                  <span className="text-[8px] font-bold text-rose-500">Documento firmado</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              icon={Gift}
              iconClass="bg-pink-500/10 text-pink-500"
              title="Referidos"
              description="Tus jugadores invitan amigos. Crecés orgánicamente y los premiás."
              delay={0.32}
              className=""
            >
              <div>
                <div className="p-3 rounded-xl bg-pink-500/8 dark:bg-pink-500/10 border border-pink-500/20 text-center mb-2">
                  <div className="text-sm font-black text-pink-600 dark:text-pink-400 tracking-widest font-mono">PADEL2024</div>
                  <div className="text-[7px] font-bold text-pink-400/60 mt-0.5">Código de referido</div>
                </div>
                <div className="text-[8px] text-center text-slate-400 dark:text-zinc-600">3 amigos invitados este mes</div>
              </div>
            </BentoCard>
          </div>

        </div>
      </div>
    </section>
  )
}
