
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, CalendarCheck, BarChart3, Lock, ZapIcon, Sparkles, Shield, Cpu, Globe } from 'lucide-react'
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
       const colorMap = {
              emerald: 'group-hover:text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/20',
              indigo: 'group-hover:text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/20',
              orange: 'group-hover:text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/20',
              violet: 'group-hover:text-violet-500 bg-violet-500/10 border-violet-500/20 shadow-violet-500/20',
              teal: 'group-hover:text-teal-500 bg-teal-500/10 border-teal-500/20 shadow-teal-500/20',
       }

       const glowMap = {
              emerald: 'from-emerald-500/20 to-transparent',
              indigo: 'from-indigo-500/20 to-transparent',
              orange: 'from-orange-500/20 to-transparent',
              violet: 'from-violet-500/20 to-transparent',
              teal: 'from-teal-500/20 to-transparent',
       }

       return (
              <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     whileInView={{ opacity: 1, scale: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
                     className={cn(
                            "relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/5 p-8 md:p-10 flex flex-col justify-between group transition-all duration-700 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-2xl hover:-translate-y-2",
                            className
                     )}
              >
                     {/* Internal Glow Effect */}
                     <div className={cn("absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none", glowMap[color])} />

                     <div className="relative z-10">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border mb-8 group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
                                   {icon}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase italic leading-none">{title}</h3>
                            <p className="text-slate-500 dark:text-zinc-500 font-medium text-base md:text-lg leading-relaxed max-w-sm">
                                   {description}
                            </p>
                     </div>

                     {/* Subtle Grain Overlay */}
                     <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay group-hover:opacity-[0.05] transition-opacity">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                     </div>
              </motion.div>
       )
}

export default function LandingFeatures() {
       return (
              <section className="py-40 px-4 md:px-8 bg-white dark:bg-black relative overflow-hidden" id="features">
                     {/* Background Atmospheric Lighting */}
                     <div className="absolute top-1/4 left-0 w-[1000px] h-[1000px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[200px] pointer-events-none -translate-x-1/2" />
                     <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none translate-x-1/2" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                   className="text-center max-w-4xl mx-auto mb-24 space-y-8"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-3xl shadow-xl">
                                          <Cpu size={14} className="text-emerald-500" />
                                          Tecnología de Vanguardia
                                   </div>
                                   <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] flex flex-col">
                                          Un Motor de Élite <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-2">
                                                 Para Tu Negocio.
                                          </span>
                                   </h2>
                                   <p className="text-xl md:text-2xl text-slate-500 dark:text-zinc-500 font-medium max-w-2xl mx-auto leading-tight">
                                          CourtOps no es solo un software; es una obra de ingeniería diseñada para transformar la fricción operativa en rentabilidad pura.
                                   </p>
                            </motion.div>

                            {/* Premium Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-8 auto-rows-fr">

                                   {/* Main Feature - 4 cols */}
                                   <FeatureCard
                                          title="Reservas Sin Fricción"
                                          description="Experiencia de usuario optimizada para la conversión. Tus canchas siempre llenas, tu teléfono siempre libre."
                                          icon={<CalendarCheck size={32} strokeWidth={2.5} />}
                                          className="md:col-span-4"
                                          color="emerald"
                                          delay={0.1}
                                   />

                                   {/* Metric Icon Feature - 2 cols */}
                                   <FeatureCard
                                          title="Analítica Real"
                                          description="Visualiza cada centavo. Métricas en tiempo real para decisiones inteligentes."
                                          icon={<BarChart3 size={32} strokeWidth={2.5} />}
                                          className="md:col-span-2"
                                          color="indigo"
                                          delay={0.2}
                                   />

                                   {/* Omichannel - 2 cols */}
                                   <FeatureCard
                                          title="Omnicanal"
                                          description="Web, App o WhatsApp. Reserva desde donde sea con la misma simplicidad absoluta."
                                          icon={<Globe size={32} strokeWidth={2.5} />}
                                          className="md:col-span-2"
                                          color="teal"
                                          delay={0.3}
                                   />

                                   {/* POS Feature - Dark/Premium - 4 cols */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                          className="md:col-span-4 relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-10 md:p-14 flex flex-col justify-center group shadow-2xl min-h-[400px]"
                                   >
                                          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-12">
                                                 <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                                                        <Receipt size={48} strokeWidth={1.5} />
                                                 </div>
                                                 <div className="max-w-md">
                                                        <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">
                                                               Punto de <br /> Venta Pro
                                                        </h3>
                                                        <p className="text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
                                                               Vende bebidas, equipos y alquileres con la velocidad de un club de primera. Integración total con inventario y caja.
                                                        </p>
                                                 </div>
                                          </div>

                                          {/* Decorative Background Elements */}
                                          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-600/30 via-transparent to-transparent opacity-50" />
                                          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500 blur-[100px] opacity-20 pointer-events-none" />
                                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
                                   </motion.div>

                                   {/* Dynamic Grid Expansion */}
                                   <FeatureCard
                                          title="Blindado"
                                          description="Seguridad de grado bancario para tus datos y transacciones."
                                          icon={<Shield size={32} strokeWidth={2.5} />}
                                          className="md:col-span-3"
                                          color="violet"
                                          delay={0.5}
                                   />

                                   <FeatureCard
                                          title="Velocidad"
                                          description="Infraestructura escalable que nunca se detiene. Tiempo de carga instantáneo."
                                          icon={<Zap size={32} strokeWidth={2.5} />}
                                          className="md:col-span-3"
                                          color="orange"
                                          delay={0.6}
                                   />

                            </div>
                     </div>
              </section >
       )
}
