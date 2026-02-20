
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, CalendarCheck, BarChart3, Lock, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingFeatures() {
       return (
              <section className="py-24 md:py-32 px-4 md:px-6 bg-slate-50 dark:bg-[#030712] relative overflow-hidden" id="features">
                     {/* Premium Background Atmosphere */}
                     <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen -translate-x-1/2" />
                     <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen translate-x-1/3 translate-y-1/3" />

                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                          <ZapIcon size={14} className="fill-emerald-500 text-emerald-500" />
                                          Arquitectura Escalable
                                   </div>
                                   <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                          Todo lo que necesitas para <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                 dominar tu mercado.
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto">
                                          Diseñado con precisión obsesiva. La plataforma que automatiza tareas tediosas para que te enfoques en crecer.
                                   </p>
                            </motion.div>

                            {/* Premium Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 md:auto-rows-[340px]">

                                   {/* Feature 1 - Hero Size */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.1 }}
                                          className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 backdrop-blur-xl"
                                   >
                                          {/* Animated Gradient Blob */}
                                          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />

                                          <div className="relative z-10">
                                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 border border-emerald-200/50 dark:border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                                        <CalendarCheck size={28} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Reservas Automáticas</h3>
                                                 <p className="text-slate-600 dark:text-zinc-400 font-medium text-lg max-w-md leading-relaxed">
                                                        Tus clientes reservan y pagan en instantes desde cualquier dispositivo, 24/7. Dile adiós a los baches en tu agenda.
                                                 </p>
                                          </div>

                                          {/* Decorative UI Element floating */}
                                          <div className="hidden lg:block absolute bottom-8 right-8 w-64 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-4 rotate-2 group-hover:-rotate-3 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                                                 <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><Clock size={18} /></div>
                                                        <div>
                                                               <div className="h-2.5 w-24 bg-slate-200 dark:bg-white/10 rounded-full mb-1.5" />
                                                               <div className="h-2 w-16 bg-slate-200/70 dark:bg-white/5 rounded-full" />
                                                        </div>
                                                 </div>
                                                 <div className="absolute top-4 right-4 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                                                        Confirmada ✓
                                                 </div>
                                          </div>
                                   </motion.div>

                                   {/* Feature 2 - Vertical Chart */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.2 }}
                                          className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col justify-between group transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] hover:border-blue-500/30 backdrop-blur-xl"
                                   >
                                          <div>
                                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 border border-blue-200/50 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                                        <BarChart3 size={28} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Visualiza tu Éxito</h3>
                                                 <p className="text-slate-600 dark:text-zinc-400 font-medium">Métricas precisas de ocupación e ingresos en tiempo real.</p>
                                          </div>

                                          {/* Animated Chart Bars */}
                                          <div className="mt-8 flex items-end justify-between gap-2 h-24 px-1">
                                                 {[40, 65, 45, 80, 55, 100, 75].map((h, i) => (
                                                        <div key={i} className="w-full relative group/bar">
                                                               <div style={{ height: `${h}%` }} className="w-full bg-slate-100 dark:bg-white/5 rounded-t-md group-hover:bg-gradient-to-t group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-500 origin-bottom" />
                                                        </div>
                                                 ))}
                                          </div>
                                   </motion.div>

                                   {/* Feature 3 - Square Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.3 }}
                                          className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col group transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.1)] hover:border-purple-500/30 backdrop-blur-xl"
                                   >
                                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-fuchsia-50 dark:from-purple-500/20 dark:to-fuchsia-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-8 border border-purple-200/50 dark:border-purple-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                                 <Smartphone size={28} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Punto de Venta POS</h3>
                                          <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                                                 Gestiona hidratación, alquileres y equipamiento integrado con tu caja. Ventas sin fricción.
                                          </p>
                                   </motion.div>

                                   {/* Feature 4 - Square Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.4 }}
                                          className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 p-8 flex flex-col group transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.1)] hover:border-orange-500/30 backdrop-blur-xl"
                                   >
                                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-500/20 dark:to-amber-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-8 border border-orange-200/50 dark:border-orange-500/20 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                                 <Lock size={28} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Seguridad Inquebrantable</h3>
                                          <p className="text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                                                 Seguimiento con grado bancario. Auditoría estricta de cada peso que ingresa a tu club.
                                          </p>
                                   </motion.div>

                                   {/* Feature 5 - Dark Accent Span 2 */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: 0.5 }}
                                          className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-[#0A101A] border-none text-white p-8 md:p-10 flex flex-col justify-center group shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] dark:shadow-none"
                                   >
                                          {/* Sleek dark gradient background */}
                                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                          <div className="relative z-10 max-w-lg">
                                                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                                        <Receipt size={28} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Cierres de Caja en 1 Clic</h3>
                                                 <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                                        Deja las hojas de cálculo en el pasado. Te entregamos un arqueo de caja perfecto, automático e inviolable todos los días.
                                                 </p>
                                          </div>

                                          {/* Decorative abstract elements floating right */}
                                          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
                                                 <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-[#0A101A] to-transparent z-10" />
                                                 <div className="hidden md:flex flex-col gap-3 opacity-30 absolute right-4 top-1/2 -translate-y-1/2 rotate-12 group-hover:rotate-[15deg] group-hover:scale-105 transition-all duration-700">
                                                        <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-0.5 rounded-xl w-32 h-10 shadow-lg"><div className="w-full h-full bg-slate-900 rounded-[10px]" /></div>
                                                        <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-0.5 rounded-xl w-40 h-10 translate-x-6 shadow-lg"><div className="w-full h-full bg-slate-900 rounded-[10px]" /></div>
                                                        <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-0.5 rounded-xl w-28 h-10 translate-x-12 shadow-lg"><div className="w-full h-full bg-slate-900 rounded-[10px]" /></div>
                                                 </div>
                                          </div>
                                   </motion.div>

                            </div>
                     </div>
              </section >
       )
}
