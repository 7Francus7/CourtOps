
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt } from 'lucide-react'

export default function LandingFeatures() {
       const FEATURES = [
              {
                     icon: Clock,
                     title: "Reservas Instantáneas",
                     description: "Elimina las llamadas. Tus clientes reservan en segundos desde cualquier dispositivo, 24/7.",
                     color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400"
              },
              {
                     icon: Receipt,
                     title: "Control de Caja Automatizado",
                     description: "Cuadra tu día sin errores. Efectivo, transferencias y gastos se registran automáticamente.",
                     color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
              },
              {
                     icon: Zap,
                     title: "Precios Dinámicos",
                     description: "Maximiza ingresos. Configura tarifas diferentes para horarios pico, fin de semana o feriados.",
                     color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400"
              },
              {
                     icon: Smartphone,
                     title: "Kiosco POS Integrado",
                     description: "Vende bebidas, alquila paletas y controla el stock sin salir del sistema.",
                     color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400"
              },
              {
                     icon: TrendingUp,
                     title: "Reportes Inteligentes",
                     description: "Visualiza la ocupación real, ticket promedio y crecimiento mensual con gráficos claros.",
                     color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400"
              },
              {
                     icon: ShieldCheck,
                     title: "Seguridad Total",
                     description: "Auditoría completa. Registramos quién creó, modificó o cobró cada reserva.",
                     color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400"
              }
       ]

       return (
              <section className="py-24 px-6 bg-slate-50 dark:bg-black relative overflow-hidden" id="features">
                     {/* Background elements */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-50 dark:from-zinc-900 dark:via-black dark:to-black opacity-80" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                                   <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs bg-emerald-100/50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">Características Potentes</span>
                                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Todo lo que necesitas para <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-500">
                                                 profesionalizar tu club.
                                          </span>
                                   </h2>
                                   <p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                                          Dejamos atrás las planillas de Excel y los cuadernos.
                                          CourtOps es el sistema operativo integral para complejos deportivos modernos.
                                   </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                   {FEATURES.map((feature, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 whileHover={{ y: -5 }}
                                                 className="group relative p-8 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 transition-all duration-300"
                                          >
                                                 <div className={`mb-6 p-4 rounded-2xl w-fit transition-colors ${feature.color}`}>
                                                        <feature.icon size={28} strokeWidth={2} />
                                                 </div>

                                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {feature.title}
                                                 </h3>

                                                 <p className="text-slate-500 dark:text-zinc-500 leading-relaxed font-medium text-sm">
                                                        {feature.description}
                                                 </p>

                                                 {/* Hover corner effect */}
                                                 <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent dark:from-white/5 rounded-tr-[2rem] rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                                          </motion.div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
