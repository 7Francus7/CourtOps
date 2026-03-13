'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, ChevronRight } from 'lucide-react'

const steps = [
       {
              icon: UserPlus,
              title: "Registra tu Club",
              description: "Crea tu cuenta en segundos y accede a tu panel de administración inmediatamente.",
              color: "text-emerald-500",
       },
       {
              icon: Settings,
              title: "Configura la Agenda",
              description: "Define tus canchas, horarios y precios de forma flexible con nuestro asistente inteligente.",
              color: "text-indigo-500",
       },
       {
              icon: Rocket,
              title: "Lanza tu Turnero",
              description: "Comparte tu link público y comienza a recibir reservas 24/7 sin mover un dedo.",
              color: "text-teal-500",
       }
]

export default function LandingHowItWorks() {
       return (
              <section className="py-32 px-6 bg-white dark:bg-zinc-950 transition-colors duration-700 border-t border-slate-100 dark:border-white/5" id="how-it-works">
                     <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col md:flex-row gap-16 items-center">
                                   <div className="md:w-1/2 space-y-6">
                                          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Cómo funciona</h2>
                                          <h3 className="text-3xl sm:text-4xl md:text-6xl font-medium text-slate-900 dark:text-white tracking-tight leading-tight">
                                                 De la gestión manual a la <br className="hidden md:block" />
                                                 <span className="text-slate-400 dark:text-zinc-600 font-normal">automatización total.</span>
                                          </h3>
                                          <p className="text-slate-500 dark:text-zinc-400 text-lg leading-relaxed max-w-lg">
                                                 Hemos diseñado un proceso fluido para que puedas digitalizar tu complejo en cuestión de minutos, sin complicaciones técnicas.
                                          </p>
                                   </div>

                                   <div className="md:w-1/2 grid grid-cols-1 gap-4">
                                          {steps.map((step, i) => (
                                                 <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: 20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-start gap-6 p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5"
                                                 >
                                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-white/10">
                                                               <step.icon className={step.color} size={24} />
                                                        </div>
                                                        <div className="space-y-2">
                                                               <div className="flex items-center gap-3">
                                                                      <span className="text-[10px] font-black text-slate-300 dark:text-zinc-700">0{i + 1}</span>
                                                                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{step.title}</h4>
                                                               </div>
                                                               <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                                                                      {step.description}
                                                               </p>
                                                        </div>
                                                 </motion.div>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
