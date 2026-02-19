
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
       {
              icon: UserPlus,
              step: "01",
              title: "Registrate Gratis",
              description: "Creá tu cuenta en 30 segundos. Sin tarjeta de crédito, sin compromisos. Accedé inmediatamente al panel.",
              color: "from-blue-500 to-blue-600",
              bgIcon: "bg-blue-500/10 dark:bg-blue-500/20",
              textIcon: "text-blue-600 dark:text-blue-400",
              borderHover: "group-hover:border-blue-500/30"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configurá tu Club",
              description: "Cargá canchas, horarios y precios. Un asistente te guía paso a paso. Listo en menos de 10 minutos.",
              color: "from-emerald-500 to-green-600",
              bgIcon: "bg-emerald-500/10 dark:bg-emerald-500/20",
              textIcon: "text-emerald-600 dark:text-emerald-400",
              borderHover: "group-hover:border-emerald-500/30"
       },
       {
              icon: Rocket,
              step: "03",
              title: "Empezá a Crecer",
              description: "Tus clientes reservan solos, los cobros se registran automáticamente y vos te dedicás a crecer.",
              color: "from-orange-500 to-amber-500",
              bgIcon: "bg-orange-500/10 dark:bg-orange-500/20",
              textIcon: "text-orange-600 dark:text-orange-400",
              borderHover: "group-hover:border-orange-500/30"
       }
]

export default function LandingHowItWorks() {
       return (
              <section className="py-32 px-6 bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
                     {/* Background Elements */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

                     <div className="max-w-6xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center mb-20 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                          <Rocket size={12} fill="currentColor" />
                                          Simple y Rápido
                                   </div>
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                          Empezá en{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                                                 3 simples pasos
                                          </span>
                                   </h2>
                                   <p className="text-xl text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                                          Sin instalaciones, sin servidores, sin dolores de cabeza.
                                   </p>
                            </motion.div>

                            {/* Steps - Horizontal Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 relative">
                                   {/* Connecting Line (Desktop) */}
                                   <div className="hidden md:block absolute top-28 left-[20%] right-[20%] h-[2px]">
                                          <div className="w-full h-full bg-gradient-to-r from-blue-300 via-emerald-300 to-orange-300 dark:from-blue-700 dark:via-emerald-700 dark:to-orange-700 rounded-full" />
                                   </div>

                                   {steps.map((step, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 initial={{ opacity: 0, y: 30 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: idx * 0.15, duration: 0.6 }}
                                                 className={`relative text-center group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 ${step.borderHover} hover:shadow-xl transition-all duration-500`}
                                          >
                                                 {/* Step Number Badge */}
                                                 <div className="relative mx-auto mb-8">
                                                        <div className={`w-20 h-20 mx-auto rounded-2xl ${step.bgIcon} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 relative z-10`}>
                                                               <step.icon size={32} className={step.textIcon} strokeWidth={2} />
                                                        </div>
                                                        <div className={`absolute -top-3 -right-3 w-9 h-9 rounded-xl bg-gradient-to-br ${step.color} text-white text-xs font-black flex items-center justify-center shadow-lg z-20 ring-4 ring-white dark:ring-[#0a0a0a]`}>
                                                               {step.step}
                                                        </div>
                                                 </div>

                                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                                        {step.title}
                                                 </h3>
                                                 <p className="text-slate-500 dark:text-zinc-400 leading-relaxed font-medium text-sm max-w-xs mx-auto">
                                                        {step.description}
                                                 </p>
                                          </motion.div>
                                   ))}
                            </div>

                            {/* Bottom CTA */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.5 }}
                                   className="text-center mt-16"
                            >
                                   <Link
                                          href="/register"
                                          className="group inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-transform active:scale-95 shadow-xl"
                                   >
                                          Empezar Ahora — Es Gratis
                                          <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                   </Link>
                            </motion.div>
                     </div>
              </section>
       )
}
