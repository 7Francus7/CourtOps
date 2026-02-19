
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const steps = [
       {
              icon: UserPlus,
              step: "01",
              title: "Registrate Gratis",
              description: "Creá tu cuenta en 30 segundos. Sin tarjeta de crédito. Accedé inmediatamente al panel.",
              color: "text-blue-500",
              bgColor: "bg-blue-500/10",
              borderColor: "border-blue-500/20",
              gradient: "from-blue-500 to-cyan-500"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configurá tu Club",
              description: "Cargá canchas, horarios y precios con nuestro asistente paso a paso. Listo en 5 minutos.",
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
              gradient: "from-emerald-500 to-green-500"
       },
       {
              icon: Rocket,
              step: "03",
              title: "Empezá a Crecer",
              description: "Compartí tu link. Tus clientes reservan solos y vos te dedicás a gestionar tu club.",
              color: "text-orange-500",
              bgColor: "bg-orange-500/10",
              borderColor: "border-orange-500/20",
              gradient: "from-orange-500 to-amber-500"
       }
]

export default function LandingHowItWorks() {
       return (
              <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
                     {/* Background Gradients */}
                     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
                     </div>

                     <div className="max-w-7xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center mb-16 md:mb-24 space-y-4"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                                          <Zap size={14} fill="currentColor" />
                                          Simple y Rápido
                                   </div>
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Tu sistema listo en{' '}
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-green-300">
                                                 3 pasos
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                          Olvídate de instalaciones complejas. CourtOps funciona en la nube, accesible desde cualquier dispositivo.
                                   </p>
                            </motion.div>

                            {/* Steps Container */}
                            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                                   {/* Steps mapping */}

                                   {steps.map((step, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 initial={{ opacity: 0, y: 30 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: idx * 0.2, duration: 0.6 }}
                                                 className="relative z-10 group"
                                          >
                                                 {/* Card Content */}
                                                 <div className={cn(
                                                        "relative flex flex-col items-center text-center h-full p-8 rounded-3xl transition-all duration-300",
                                                        "bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5",
                                                        "hover:border-slate-300 dark:hover:border-white/10 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-emerald-500/5 hover:-translate-y-1"
                                                 )}>
                                                        {/* Icon Container */}
                                                        <div className="relative mb-8">
                                                               <div className={cn(
                                                                      "w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg",
                                                                      step.bgColor,
                                                                      step.color
                                                               )}>
                                                                      <step.icon size={32} strokeWidth={2} />
                                                               </div>
                                                               {/* Step Badge */}
                                                               <div className={cn(
                                                                      "absolute -top-3 -right-3 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg ring-4 ring-white dark:ring-[#09090b]",
                                                                      `bg-gradient-to-br ${step.gradient}`
                                                               )}>
                                                                      {step.step}
                                                               </div>
                                                        </div>

                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                                               {step.title}
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed font-medium text-sm">
                                                               {step.description}
                                                        </p>

                                                        {/* Decorative bottoms */}
                                                        <div className={cn(
                                                               "absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                                               `bg-gradient-to-r ${step.gradient}`
                                                        )} />
                                                 </div>
                                          </motion.div>
                                   ))}
                            </div>

                            {/* CTA */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   whileInView={{ opacity: 1, scale: 1 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.6 }}
                                   className="mt-16 md:mt-24 text-center"
                            >
                                   <div className="inline-flex flex-col items-center gap-6">
                                          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500 dark:text-zinc-500">
                                                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Sin tarjeta de crédito</span>
                                                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Cancelá cuando quieras</span>
                                                 <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Soporte incluido</span>
                                          </div>

                                          <Link
                                                 href="/register"
                                                 className="relative group inline-flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider overflow-hidden shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                          >
                                                 <span className="relative z-10 flex items-center gap-2">
                                                        Empezar Ahora Gratis
                                                        <ArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                                 </span>
                                                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-10 dark:opacity-0 transition-opacity" />
                                          </Link>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
