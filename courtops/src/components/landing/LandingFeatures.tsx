'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { CalendarCheck, BarChart3, Receipt, Shield, Zap, Globe, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
       title: string
       description: string
       icon: React.ReactNode
       className?: string
       delay?: number
       color?: 'emerald' | 'indigo' | 'orange' | 'violet' | 'teal'
}

const FeatureCard = ({ title, description, icon, className, delay = 0, color = 'emerald' }: FeatureCardProps) => {
       const mouseX = useMotionValue(0)
       const mouseY = useMotionValue(0)

       function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
              const { left, top } = currentTarget.getBoundingClientRect()
              mouseX.set(clientX - left)
              mouseY.set(clientY - top)
       }

       const colorMap = {
              emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5 dark:shadow-emerald-500/20',
              indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5 dark:shadow-indigo-500/20',
              orange: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/5 dark:shadow-orange-500/20',
              violet: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-violet-500/5 dark:shadow-violet-500/20',
              teal: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20 shadow-teal-500/5 dark:shadow-teal-500/20',
       }

       const glowMap = {
              emerald: 'rgba(16, 185, 129, 0.1)',
              indigo: 'rgba(99, 102, 241, 0.1)',
              orange: 'rgba(249, 115, 22, 0.1)',
              violet: 'rgba(139, 92, 246, 0.1)',
              teal: 'rgba(20, 184, 166, 0.1)',
       }

       return (
              <motion.div
                     onMouseMove={handleMouseMove}
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     whileInView={{ opacity: 1, scale: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
                     className={cn(
                            "relative overflow-hidden rounded-[3rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 md:p-12 flex flex-col justify-between group transition-all duration-700 hover:border-emerald-500/30 dark:hover:border-white/20 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-3xl",
                            className
                     )}
              >
                     {/* Spotlight Hover Effect */}
                     <motion.div
                            className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                            style={{
                                   background: useSpring(
                                          `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${glowMap[color]}, transparent 80%)`,
                                          { stiffness: 500, damping: 50 }
                                   ) as any
                            }}
                     />

                     <div className="relative z-10">
                            <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 border mb-10 group-hover:scale-110 group-hover:rotate-6 shadow-xl", colorMap[color])}>
                                   <div className="group-hover:animate-pulse">
                                          {React.cloneElement(icon as React.ReactElement<any>, { size: 32, strokeWidth: 1.5 })}
                                   </div>
                            </div>
                            <h3 className="text-3xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter uppercase italic leading-none">{title}</h3>
                            <p className="text-slate-500 dark:text-zinc-500 font-bold text-lg leading-tight max-w-sm italic">
                                   {description}
                            </p>
                     </div>

                     <div className="absolute top-8 right-10 text-[8px] font-black uppercase tracking-[0.5em] opacity-0 group-hover:opacity-30 transition-opacity duration-700 text-slate-900 dark:text-white">
                            CORE_MODULE.{delay * 10 || 0}
                     </div>
              </motion.div>
       )
}

export default function LandingFeatures() {
       return (
              <section className="py-32 px-4 md:px-8 bg-white dark:bg-[#02040A] relative overflow-hidden transition-colors duration-1000" id="features">
                     {/* Tac-Grid Decor */}
                     <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
                     </div>

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                   className="text-center max-w-4xl mx-auto mb-24 space-y-8"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                          Tecnología de Alto Desempeño
                                   </div>
                                   <h2 className="text-5xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.85] uppercase italic">
                                          Un Motor de Élite <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600 dark:from-emerald-400 dark:to-indigo-500 pb-2">
                                                 Para Tu Negocio.
                                          </span>
                                   </h2>
                                   <p className="text-xl md:text-3xl text-slate-500 dark:text-zinc-500 font-bold max-w-2xl mx-auto leading-tight italic opacity-80">
                                          Transformamos la complejidad operativa en rentabilidad pura. Cada milisegundo cuenta.
                                   </p>
                            </motion.div>

                            {/* Ultra Modern Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                                   <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <FeatureCard
                                                 title="Reservas Inteligentes"
                                                 description="Turnero dinámico con lógica de cancelación y pago integrado."
                                                 icon={<CalendarCheck />}
                                                 color="emerald"
                                                 delay={0.1}
                                          />
                                          <FeatureCard
                                                 title="Analítica Pro"
                                                 description="Métricas financieras y de ocupación en tiempo real."
                                                 icon={<BarChart3 />}
                                                 color="indigo"
                                                 delay={0.2}
                                          />
                                          <FeatureCard
                                                 title="Omnicanalidad"
                                                 description="Reserva desde Web, App o WhatsApp sin fricción."
                                                 icon={<Globe />}
                                                 color="teal"
                                                 delay={0.3}
                                          />
                                          <FeatureCard
                                                 title="Seguridad Total"
                                                 description="Tus datos protegidos con standard bancario."
                                                 icon={<Shield />}
                                                 color="violet"
                                                 delay={0.4}
                                          />
                                   </div>

                                   {/* Main Featured POS Component - Unified Light/Dark */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                          whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 1, delay: 0.5 }}
                                          className="md:col-span-4 relative overflow-hidden rounded-[3rem] bg-slate-950 text-white p-12 flex flex-col justify-center group shadow-2xl min-h-[500px] border border-white/5"
                                   >
                                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-transparent opacity-50" />

                                          <div className="relative z-10 space-y-10">
                                                 <div className="relative w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(16,185,129,0.5)] group-hover:rotate-6 group-hover:scale-110 transition-all duration-700">
                                                        <Receipt size={48} strokeWidth={1} className="group-hover:animate-pulse" />
                                                 </div>

                                                 <div className="space-y-6">
                                                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase italic">
                                                               Punto de <br />
                                                               <span className="text-emerald-400">Venta Pro.</span>
                                                        </h3>
                                                        <p className="text-slate-400 font-bold text-xl leading-relaxed italic opacity-80">
                                                               Vende bebidas, equipos y alquileres con la velocidad de un club de primera división.
                                                        </p>
                                                 </div>

                                                 <div className="pt-10 flex items-center gap-4">
                                                        <div className="h-px flex-1 bg-white/10" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Módulo Activado</span>
                                                        <div className="h-px flex-1 bg-white/10" />
                                                 </div>
                                          </div>

                                          <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
                                                 <Sparkles size={200} />
                                          </div>
                                   </motion.div>
                            </div>
                     </div>
              </section>
       )
}
