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
              title: "Crea tu Cuenta",
              description: "Regístrate en 30 segundos sin compromisos. Accede de inmediato a tu panel de control y descubre todo el potencial.",
              color: "text-indigo-500 dark:text-indigo-400",
              bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
              borderColor: "border-indigo-200 dark:border-indigo-500/20",
              gradient: "from-indigo-600 to-violet-500",
              glow: "shadow-[0_0_30px_rgba(99,102,241,0.3)]"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configura tu Club",
              description: "Personaliza tus canchas, horarios, precios y servicios extra con nuestro asistente intuitivo. Estarás listo en 5 minutos.",
              color: "text-violet-500 dark:text-violet-400",
              bgColor: "bg-violet-100 dark:bg-violet-500/10",
              borderColor: "border-violet-200 dark:border-violet-500/20",
              gradient: "from-violet-500 to-purple-400",
              glow: "shadow-[0_0_30px_rgba(139,92,246,0.3)]"
       },
       {
              icon: Rocket,
              step: "03",
              title: "Empieza a Crecer",
              description: "Comparte tu enlace personalizado. Tus clientes reservan y pagan online, mientras tú te dedicas a escalar tu negocio.",
              color: "text-orange-500 dark:text-orange-400",
              bgColor: "bg-orange-100 dark:bg-orange-500/10",
              borderColor: "border-orange-200 dark:border-orange-500/20",
              gradient: "from-orange-500 to-amber-500",
              glow: "shadow-[0_0_30px_rgba(249,115,22,0.3)]"
       }
]

export default function LandingHowItWorks() {
       return (
              <section className="py-12 px-4 relative overflow-hidden bg-white dark:bg-black">
                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="flex flex-col md:flex-row gap-8 items-stretch">
                                   <div className="md:w-1/3 flex flex-col justify-center">
                                          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 w-fit">
                                                 <Zap size={14} fill="currentColor" /> Rápido
                                          </div>
                                          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-4">
                                                 Listos para operar <br />
                                                 en <span className="text-indigo-500">5 minutos.</span>
                                          </h2>
                                          <p className="text-slate-500 dark:text-zinc-500 font-medium">
                                                 Hemos simplificado todo para que puedas empezar hoy mismo.
                                          </p>
                                   </div>

                                   <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                          {steps.map((step, idx) => (
                                                 <div key={idx} className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 transition-all hover:border-indigo-500/20 hover:shadow-2xl">
                                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", step.bgColor, step.color)}>
                                                               <step.icon size={24} />
                                                        </div>
                                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{step.title}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium leading-relaxed">{step.description}</p>
                                                 </div>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
