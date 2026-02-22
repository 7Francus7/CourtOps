
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, CalendarCheck, BarChart3, Lock, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingFeatures() {
       return (
              <section className="py-32 px-4 md:px-6 bg-white dark:bg-black relative overflow-hidden" id="features">
                     {/* Atmospheric Lighting */}
                     <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/2" />
                     <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/2" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                   className="text-center max-w-4xl mx-auto mb-20 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                                          <ZapIcon size={14} className="text-emerald-500" />
                                          Soberanía Operativa
                                   </div>
                                   <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] flex flex-col">
                                          Ingeniería de élite
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 pb-2">
                                                 para tu club.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-500 dark:text-zinc-500 font-medium max-w-2xl mx-auto tracking-tight">
                                          Dejamos atrás los sistemas genéricos. CourtOps es una obra de ingeniería diseñada para la máxima rentabilidad y el mínimo esfuerzo.
                                   </p>
                            </motion.div>

                            {/* Premium Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-[350px]">

                                   {/* Feature 1 - Hero Size */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.7 }}
                                          className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 flex flex-col justify-between transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 backdrop-blur-3xl"
                                   >
                                          <div className="relative z-10">
                                                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                                        <CalendarCheck size={28} strokeWidth={2} />
                                                 </div>
                                                 <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Reservas sin Fricción</h3>
                                                 <p className="text-slate-500 dark:text-zinc-500 font-medium text-lg leading-relaxed max-w-sm">
                                                        Experiencia de usuario optimizada para la conversión. Tus canchas siempre llenas, tu teléfono siempre libre.
                                                 </p>
                                          </div>
                                          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all" />
                                   </motion.div>

                                   {/* Feature 2 - Metrics */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.7, delay: 0.1 }}
                                          className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600/5 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 flex flex-col justify-start group transition-all duration-500 hover:border-indigo-500/30 backdrop-blur-3xl"
                                   >
                                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-500/20">
                                                 <BarChart3 size={24} strokeWidth={2} />
                                          </div>
                                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">Big Data</h3>
                                          <p className="text-slate-500 dark:text-zinc-500 font-medium text-sm leading-relaxed">
                                                 Analítica descriptiva y predictiva para conocer cada centavo que entra a tu negocio.
                                          </p>
                                   </motion.div>

                                   {/* Feature 3 - App */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.7, delay: 0.2 }}
                                          className="relative overflow-hidden rounded-[2.5rem] bg-orange-600/5 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 flex flex-col justify-start group transition-all duration-500 hover:border-orange-500/30 backdrop-blur-3xl"
                                   >
                                          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6 border border-orange-500/20">
                                                 <Smartphone size={24} strokeWidth={2} />
                                          </div>
                                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter uppercase">Omnicanalidad</h3>
                                          <p className="text-slate-500 dark:text-zinc-500 font-medium text-sm leading-relaxed">
                                                 Tus clientes reservan desde la web, app o WhatsApp con la misma simplicidad.
                                          </p>
                                   </motion.div>

                                   {/* Feature 4 - POS Hero */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.7, delay: 0.3 }}
                                          className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-12 flex flex-col justify-center group shadow-2xl"
                                   >
                                          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
                                                 <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-white backdrop-blur-2xl border border-white/20 group-hover:rotate-12 transition-transform duration-700">
                                                        <Receipt size={40} strokeWidth={1.5} />
                                                 </div>
                                                 <div className="max-w-xs">
                                                        <h3 className="text-4xl font-black mb-4 tracking-tighter leading-none">POS de Alto Rendimiento</h3>
                                                        <p className="text-slate-400 font-medium text-base leading-snug">
                                                               Vende bebidas, equipos y alquileres con la velocidad del rayo.
                                                        </p>
                                                 </div>
                                          </div>
                                          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-transparent opacity-50" />
                                          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                                   </motion.div>

                                   {/* Feature 5 - Security */}
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.7, delay: 0.4 }}
                                          className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-10 flex flex-col justify-center transition-all duration-500 hover:border-teal-500/30 backdrop-blur-3xl group"
                                   >
                                          <div className="flex items-center gap-8">
                                                 <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-500/20">
                                                        <Lock size={28} strokeWidth={2} />
                                                 </div>
                                                 <div>
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Blindado</h3>
                                                        <p className="text-slate-500 dark:text-zinc-500 font-medium text-base">
                                                               Tus datos y transacciones protegidos por encriptación de grado bancario.
                                                        </p>
                                                 </div>
                                          </div>
                                   </motion.div>

                            </div>
                     </div>
              </section >
       )
}
