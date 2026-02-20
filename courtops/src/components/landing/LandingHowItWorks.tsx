
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
              color: "text-blue-500 dark:text-blue-400",
              bgColor: "bg-blue-100 dark:bg-blue-500/10",
              borderColor: "border-blue-200 dark:border-blue-500/20",
              gradient: "from-blue-600 to-cyan-500",
              glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]"
       },
       {
              icon: Settings,
              step: "02",
              title: "Configura tu Club",
              description: "Personaliza tus canchas, horarios, precios y servicios extra con nuestro asistente intuitivo. Estarás listo en 5 minutos.",
              color: "text-emerald-500 dark:text-emerald-400",
              bgColor: "bg-emerald-100 dark:bg-emerald-500/10",
              borderColor: "border-emerald-200 dark:border-emerald-500/20",
              gradient: "from-emerald-500 to-teal-400",
              glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]"
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
              <section className="py-24 md:py-32 px-4 relative overflow-hidden bg-slate-50 dark:bg-[#030712]">
                     {/* Premium Ambient Gradients */}
                     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
                            <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
                     </div>

                     {/* Subtle grid pattern */}
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="text-center mb-20 md:mb-32 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm hover:scale-105 transition-transform duration-300">
                                          <Zap size={14} className="fill-emerald-500 text-emerald-500" />
                                          Simple y Rápido
                                   </div>
                                   <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Tu sistema operativo <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                 listo en 3 pasos
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                          Olvídate de instalaciones complejas. CourtOps funciona 100% en la nube, con una configuración inicial que te tomará menos que preparar un café.
                                   </p>
                            </motion.div>

                            {/* Steps Container with Connecting Line */}
                            <div className="relative">
                                   {/* Connecting Line (Desktop only) */}
                                   <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-white/10 overflow-hidden mix-blend-overlay">
                                          <motion.div
                                                 initial={{ x: "-100%" }}
                                                 whileInView={{ x: "100%" }}
                                                 viewport={{ once: true }}
                                                 transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                                                 className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                                          />
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                                          {steps.map((step, idx) => (
                                                 <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 40 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: idx * 0.2, duration: 0.8, ease: "easeOut" }}
                                                        className="relative z-10 group flex flex-col items-center"
                                                 >
                                                        {/* Icon Container with Floating Effect */}
                                                        <div className="relative mb-8 md:mb-12 cursor-default">
                                                               <div className={cn(
                                                                      "w-[100px] h-[100px] rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 border backdrop-blur-xl relative z-20",
                                                                      step.bgColor,
                                                                      step.borderColor,
                                                                      step.color,
                                                                      "group-hover:" + step.glow
                                                               )}>
                                                                      <step.icon size={40} className="relative z-10" />
                                                                      {/* Behind Glow */}
                                                                      <div className={cn("absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-soft-light bg-gradient-to-br", step.gradient)} />
                                                               </div>

                                                               {/* Circular Step Number */}
                                                               <div className={cn(
                                                                      "absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl ring-8 ring-slate-50 dark:ring-[#030712] z-30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12",
                                                                      `bg-gradient-to-br ${step.gradient}`
                                                               )}>
                                                                      {step.step}
                                                               </div>
                                                        </div>

                                                        {/* Card Content (Glassmorphism) */}
                                                        <div className="relative flex flex-col items-center text-center p-8 rounded-[2rem] transition-all duration-500 bg-white/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 backdrop-blur-xl group-hover:border-emerald-500/20 group-hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.1)] group-hover:-translate-y-2 h-full">
                                                               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                                                      {step.title}
                                                               </h3>
                                                               <p className="text-slate-600 dark:text-zinc-400 leading-relaxed font-medium text-[15px]">
                                                                      {step.description}
                                                               </p>

                                                               {/* Decorative accent line */}
                                                               <div className={cn(
                                                                      "absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-1/3 h-[2px] rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                                                      `bg-gradient-to-r ${step.gradient}`
                                                               )} />
                                                        </div>
                                                 </motion.div>
                                          ))}
                                   </div>
                            </div>

                            {/* Ultra Premium CTA */}
                            <motion.div
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   whileInView={{ opacity: 1, scale: 1 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                                   className="mt-20 md:mt-32 text-center"
                            >
                                   <div className="inline-flex flex-col items-center gap-8">
                                          {/* Trust elements */}
                                          <div className="flex flex-wrap justify-center gap-6 text-[13px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Sin tarjeta de crédito</span>
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Cancela sin costo</span>
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-emerald-500" /> Soporte prioritario</span>
                                          </div>

                                          <Link
                                                 href="/register"
                                                 className="group relative inline-flex items-center justify-center p-[2px] overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#030712]"
                                          >
                                                 <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#10B981_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                 <span className="relative inline-flex items-center justify-center gap-3 w-full px-10 py-5 text-sm font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-[#030712] rounded-[22px] transition-all duration-500 group-hover:bg-slate-800 dark:group-hover:bg-[#030712]/90">
                                                        Empezar Ahora Gratis
                                                        <ArrowRight size={20} className="group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 text-emerald-400" />
                                                 </span>
                                          </Link>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
