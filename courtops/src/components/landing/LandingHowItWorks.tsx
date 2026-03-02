'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Settings, Rocket, ArrowRight, Zap, CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
       {
              icon: UserPlus,
              step: "01",
              title: "Crea tu Cuenta",
              description: "Regístrate en 30 segundos sin compromisos. Accede de inmediato a tu panel de control y descubre todo el potencial.",
              color: "text-emerald-500",
              bgColor: "bg-emerald-500/10",
              borderColor: "border-emerald-500/20",
              glow: "shadow-emerald-500/20"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configura tu Club",
              description: "Personaliza tus canchas, horarios, precios y servicios extra con nuestro asistente intuitivo. Estarás listo en 5 minutos.",
              color: "text-indigo-500",
              bgColor: "bg-indigo-500/10",
              borderColor: "border-indigo-500/20",
              glow: "shadow-indigo-500/20"
       },
       {
              icon: Rocket,
              step: "03",
              title: "Empieza a Crecer",
              description: "Comparte tu enlace personalizado. Tus clientes reservan y pagan online, mientras tú te dedicas a escalar tu negocio.",
              color: "text-teal-500",
              bgColor: "bg-teal-500/10",
              borderColor: "border-teal-500/20",
              glow: "shadow-teal-500/20"
       }
]

export default function LandingHowItWorks() {
       return (
              <section className="py-32 px-4 relative overflow-hidden bg-white dark:bg-[#02040A] transition-colors duration-1000" id="how-it-works">
                     {/* Cinematic Background elements */}
                     <div className="absolute inset-0 z-0">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
                     </div>

                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="flex flex-col lg:flex-row gap-16 items-center">
                                   <motion.div
                                          initial={{ opacity: 0, x: -30 }}
                                          whileInView={{ opacity: 1, x: 0 }}
                                          viewport={{ once: true }}
                                          className="lg:w-1/3 flex flex-col items-start text-left"
                                   >
                                          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-3xl shadow-xl">
                                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                 Proceso de Ingeniería
                                          </div>
                                          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-8 uppercase italic">
                                                 Listos para <br />
                                                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-2">
                                                        Operar ya.
                                                 </span>
                                          </h2>
                                          <p className="text-xl text-slate-500 dark:text-zinc-500 font-medium max-w-sm leading-tight italic opacity-80 mb-10">
                                                 Hemos simplificado la complejidad técnica para que puedas enfocarte en lo que importa: <span className="text-slate-900 dark:text-white">tu complejo.</span>
                                          </p>

                                          <div className="flex items-center gap-6">
                                                 <div className="flex -space-x-3">
                                                        {[1, 2, 3, 4].map(i => (
                                                               <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-black bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase overflow-hidden shadow-xl">
                                                                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                                                               </div>
                                                        ))}
                                                 </div>
                                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">+500 Clubes Activos</p>
                                          </div>
                                   </motion.div>

                                   <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                          {/* Connecting Lines (Desktop) */}
                                          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent -translate-y-1/2 z-0 hidden md:block" />

                                          {steps.map((step, idx) => (
                                                 <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: idx * 0.2, duration: 0.8 }}
                                                        className="group relative z-10"
                                                 >
                                                        <div className="p-10 rounded-[3rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 transition-all duration-700 hover:border-emerald-500/30 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-xl flex flex-col items-center text-center">
                                                               <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-all duration-700 border group-hover:rotate-12 group-hover:scale-110 shadow-2xl", step.bgColor, step.color, step.borderColor)}>
                                                                      <step.icon size={36} strokeWidth={1.5} />
                                                               </div>

                                                               <div className="absolute top-6 right-8 text-4xl font-black text-slate-100 dark:text-white/5 italic tracking-tighter">
                                                                      {step.step}
                                                               </div>

                                                               <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 leading-none italic">{step.title}</h3>
                                                               <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium leading-relaxed">
                                                                      {step.description}
                                                               </p>

                                                               {idx < 2 && (
                                                                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-slate-200 dark:text-white/10 hidden md:block">
                                                                             <ChevronRight size={32} />
                                                                      </div>
                                                               )}
                                                        </div>

                                                        {/* Glow effect for each card */}
                                                        <div className={cn("absolute inset-0 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none -z-10", step.bgColor)} />
                                                 </motion.div>
                                          ))}
                                   </div>
                            </div>
                     </div>
              </section>
       )
}
