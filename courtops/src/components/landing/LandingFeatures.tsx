
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, CalendarCheck, BarChart3, Lock, ZapIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingFeatures() {
       return (
              <section className="py-16 md:py-32 px-4 md:px-6 bg-slate-50 dark:bg-[#050505] relative overflow-hidden" id="features">
                     {/* Background noise/grain if you want, or just clean */}
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-4 md:space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                          <ZapIcon size={12} fill="currentColor" />
                                          Potencia tu Club
                                   </div>
                                   <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                                          Todo lo que necesitas para <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                                                 escalar tu negocio.
                                          </span>
                                   </h2>
                                   <p className="text-base md:text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto">
                                          Diseñado para obsesivos del control y amantes de la simplicidad.
                                   </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 md:auto-rows-[300px]">
                                   {/* Feature 1 - Large (Span 2 cols) */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: 0.1 }}
                                          className="md:col-span-2 group relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10"
                                   >
                                          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                          <div className="relative z-10">
                                                 <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                                        <CalendarCheck size={24} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Reservas Instantáneas</h3>
                                                 <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-md">Elimina las llamadas y WhatsApps. Tus clientes reservan en segundos desde cualquier dispositivo, 24/7, con pago anticipado opcional.</p>
                                          </div>

                                          {/* Mini UI Visualization - Hidden on mobile */}
                                          <div className="hidden md:block absolute bottom-6 right-12 w-48 h-32 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl shadow-lg p-3 rotate-3 group-hover:rotate-0 transition-transform duration-500 origin-bottom-right">
                                                 <div className="w-8 h-8 rounded-full bg-emerald-500 mb-2 flex items-center justify-center text-white"><Clock size={16} /></div>
                                                 <div className="h-2 w-24 bg-slate-200 dark:bg-zinc-800 rounded mb-1" />
                                                 <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                                                 <div className="absolute top-3 right-3 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Confirmada</div>
                                          </div>
                                   </motion.div>

                                   {/* Feature 2 - Tall (Span 1 col, 2 rows if needed, but let's keep consistent height) */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: 0.2 }}
                                          className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-6 md:p-8 flex flex-col justify-between hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10"
                                   >
                                          <div>
                                                 <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                                        <BarChart3 size={24} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Reportes Inteligentes</h3>
                                                 <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm">Visualiza la ocupación real, ticket promedio y crecimiento mensual.</p>
                                          </div>
                                          <div className="mt-6 h-24 flex items-end justify-between gap-1 px-2">
                                                 {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                                        <div key={i} style={{ height: `${h}%` }} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-sm group-hover:bg-blue-500 transition-colors duration-500 delay-[50ms]" />
                                                 ))}
                                          </div>
                                   </motion.div>

                                   {/* Feature 3 - Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: 0.3 }}
                                          className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-6 md:p-8 flex flex-col hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
                                   >
                                          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                                                 <Smartphone size={24} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kiosco POS</h3>
                                          <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-4">Vende bebidas, alquila paletas y controla el stock sin salir del sistema.</p>
                                   </motion.div>

                                   {/* Feature 4 - Standard */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: 0.4 }}
                                          className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-6 md:p-8 flex flex-col hover:border-orange-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
                                   >
                                          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-6">
                                                 <Lock size={24} strokeWidth={2.5} />
                                          </div>
                                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Seguridad Total</h3>
                                          <p className="text-slate-500 dark:text-zinc-400 font-medium text-sm mb-4">Auditoría completa de cada movimiento de caja y reserva.</p>
                                   </motion.div>

                                   {/* Feature 5 - Large (Span 2 cols) */}
                                   <motion.div // Removed md:col-span-2 to keep symmetry or adapt? Let's span 2.
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: 0.5 }}
                                          className="md:col-span-2 relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-2xl"
                                   >
                                          <div className="z-10 max-w-sm">
                                                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 backdrop-blur-md">
                                                        <Receipt size={24} strokeWidth={2.5} />
                                                 </div>
                                                 <h3 className="text-2xl font-bold text-white mb-3">Caja Automatizada</h3>
                                                 <p className="text-zinc-400 font-medium">Olvídate de cuadrar la caja manualmente al final del día. Todo se registra automáticamente.</p>
                                          </div>

                                          {/* Decorative abstract graphic */}
                                          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
                                          <div className="hidden md:flex flex-col gap-2 opacity-50 absolute right-8 top-8 rotate-12">
                                                 <div className="bg-white/10 backdrop-blur p-2 rounded-lg w-24 h-8" />
                                                 <div className="bg-white/10 backdrop-blur p-2 rounded-lg w-32 h-8 translate-x-4" />
                                                 <div className="bg-white/10 backdrop-blur p-2 rounded-lg w-28 h-8 translate-x-2" />
                                          </div>
                                   </motion.div>

                            </div>
                     </div>
              </section >
       )
}
