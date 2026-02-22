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
              <section className="py-32 px-4 relative overflow-hidden bg-white dark:bg-black">
                     {/* Atmospheric Gradients */}
                     <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[10%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
                            <div className="absolute bottom-[0%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] mix-blend-screen" />
                     </div>

                     <div className="max-w-7xl mx-auto relative z-10">
                            {/* Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                   className="text-center mb-24 md:mb-32 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                                          <Zap size={14} className="text-orange-500" />
                                          Configuración Instantánea
                                   </div>
                                   <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] flex flex-col">
                                          Tu club operando
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-orange-500 pb-2">
                                                 en tiempo récord.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-500 font-medium max-w-2xl mx-auto tracking-tight">
                                          Sin implementaciones tediosas. Hemos simplificado la ingeniería para que tú solo tengas que enfocarte en gestionar.
                                   </p>
                            </motion.div>

                            {/* Steps Container with Connecting Line */}
                            <div className="relative">
                                   {/* Ultra-Premium Edge-lit Connecting Line (Desktop only) */}
                                   <div className="hidden md:block absolute top-[3.125rem] left-[16.66%] right-[16.66%] h-[3px] z-0">
                                          {/* Base subtle track */}
                                          <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/5 rounded-full" />

                                          {/* Dashboard-style dashed track overlay */}
                                          <div className="absolute inset-x-0 top-[1px] h-[1px] border-t-2 border-dashed border-slate-300 dark:border-white/10 opacity-50" />

                                          {/* Animated fill gradient line */}
                                          <motion.div
                                                 initial={{ scaleX: 0 }}
                                                 whileInView={{ scaleX: 1 }}
                                                 viewport={{ once: true, margin: "-100px" }}
                                                 transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                                                 className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-orange-500 rounded-full origin-left shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                          />

                                          {/* Moving photon light beam */}
                                          <motion.div
                                                 initial={{ x: "-100%" }}
                                                 whileInView={{ x: "300%" }}
                                                 transition={{
                                                        duration: 2.5,
                                                        ease: "linear",
                                                        repeat: Infinity,
                                                        repeatDelay: 2
                                                 }}
                                                 className="absolute top-1/2 -translate-y-1/2 w-[200px] h-[4px] blur-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90 z-10 mix-blend-screen"
                                          />

                                          {/* Precise Connection Nodes (Align with centers) */}
                                          <div className="absolute top-1/2 left-0 w-3 h-3 -mt-1.5 -translate-x-1/2 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] border-2 border-white dark:border-[#030712] z-20" />
                                          <div className="absolute top-1/2 left-1/2 w-3 h-3 -mt-1.5 -translate-x-1/2 rounded-full bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.8)] border-2 border-white dark:border-[#030712] z-20" />
                                          <div className="absolute top-1/2 right-0 w-3 h-3 -mt-1.5 translate-x-1/2 rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] border-2 border-white dark:border-[#030712] z-20" />
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
                                                        <div className="relative flex flex-col items-center text-center p-10 rounded-[2.5rem] transition-all duration-500 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 backdrop-blur-3xl group-hover:border-slate-900 group-hover:dark:border-white/20 group-hover:shadow-2xl h-full group">
                                                               <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase transition-colors">
                                                                      {step.title}
                                                               </h3>
                                                               <p className="text-slate-500 dark:text-zinc-500 leading-relaxed font-medium text-[15px]">
                                                                      {step.description}
                                                               </p>

                                                               {/* Decorative accent line */}
                                                               <div className={cn(
                                                                      "absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-[2px] rounded-t-full transition-all duration-500",
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
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-violet-500" /> Sin tarjeta de crédito</span>
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-violet-500" /> Cancela sin costo</span>
                                                 <span className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200/50 dark:border-white/5 backdrop-blur-sm"><CheckCircle2 size={16} className="text-violet-500" /> Soporte prioritario</span>
                                          </div>

                                          <Link
                                                 href="/register"
                                                 className="group relative inline-flex items-center justify-center p-[2px] overflow-hidden rounded-[24px] bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#030712]"
                                          >
                                                 <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#7C3AED_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                 <span className="relative inline-flex items-center justify-center gap-3 w-full px-10 py-5 text-sm font-black uppercase tracking-widest text-white bg-slate-900 dark:bg-[#030712] rounded-[22px] transition-all duration-500 group-hover:bg-slate-800 dark:group-hover:bg-[#030712]/90">
                                                        Empezar Ahora Gratis
                                                        <ArrowRight size={20} className="group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300 text-violet-400" />
                                                 </span>
                                          </Link>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
