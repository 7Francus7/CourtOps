
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, CalendarCheck, BarChart3, Lock, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingFeatures() {
       return (
              <section className="py-20 px-4 md:px-6 bg-slate-50 dark:bg-[#030712] relative overflow-hidden" id="features">
                     {/* Premium Background Atmosphere */}
                     <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen -translate-x-1/2" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="text-center max-w-3xl mx-auto mb-16 space-y-4"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                          <ZapIcon size={14} className="fill-emerald-500 text-emerald-500" />
                                          Arquitectura Escalable
                                   </div>
                                   <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Todo lo necesario <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                                                 para dominar tu mercado.
                                          </span>
                                   </h2>
                            </motion.div>

                            {/* Premium Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px]">

                                   {/* Feature 1 - Hero Size */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.1 }}
                                          className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-xl backdrop-blur-xl"
                                   >
                                          <div className="relative z-10">
                                                 <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-500/20">
                                                        <CalendarCheck size={24} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Reservas Automáticas</h3>
                                                 <p className="text-slate-600 dark:text-zinc-400 font-medium text-base max-w-md">
                                                        Tus clientes reservan y pagan en instantes 24/7. Dile adiós a los baches en tu agenda.
                                                 </p>
                                          </div>
                                   </motion.div>

                                   {/* Feature 2 - Square Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.2 }}
                                          className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col group transition-all duration-500 hover:shadow-xl backdrop-blur-xl"
                                   >
                                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 border border-blue-500/20">
                                                 <BarChart3 size={24} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Reportes en Vivo</h3>
                                          <p className="text-slate-600 dark:text-zinc-400 font-medium text-sm leading-relaxed">
                                                 Métricas precisas de ocupación e ingresos en tiempo real desde cualquier lugar.
                                          </p>
                                   </motion.div>

                                   {/* Feature 3 - Square Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.3 }}
                                          className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col group transition-all duration-500 hover:shadow-xl backdrop-blur-xl"
                                   >
                                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 border border-purple-500/20">
                                                 <Smartphone size={24} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">App de Administración</h3>
                                          <p className="text-slate-600 dark:text-zinc-400 font-medium text-sm leading-relaxed">
                                                 Controla tu club desde el celular con nuestra app nativa diseñada para dueños.
                                          </p>
                                   </motion.div>

                                   {/* Feature 4 - Dark Accent Span 2 */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.4 }}
                                          className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-[#0A101A] border-none text-white p-8 md:p-10 flex flex-col justify-center group"
                                   >
                                          <div className="relative z-10 max-w-lg">
                                                 <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white mb-6 backdrop-blur-md border border-white/10">
                                                        <Receipt size={24} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Punto de Venta POS</h3>
                                                 <p className="text-slate-400 font-medium text-base leading-relaxed">
                                                        Gestión de caja integrada. Ventas de hidratación, alquileres y equipamiento en segundos con cierres de caja automáticos.
                                                 </p>
                                          </div>
                                   </motion.div>

                            </div>
                     </div>
              </section >
       )
}
