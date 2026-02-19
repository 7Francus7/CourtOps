
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
                     color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
              },
              {
                     icon: Receipt,
                     title: "Control de Caja Automatizado",
                     description: "Cuadra tu día sin errores. Efectivo, transferencias y gastos se registran automáticamente.",
                     color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
              },
              {
                     icon: Zap,
                     title: "Precios Dinámicos",
                     description: "Maximiza ingresos. Configura tarifas diferentes para horarios pico, fin de semana o feriados.",
                     color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300"
              },
              {
                     icon: Smartphone,
                     title: "Kiosco POS Integrado",
                     description: "Vende bebidas, alquila paletas y controla el stock sin salir del sistema.",
                     color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-300"
              },
              {
                     icon: TrendingUp,
                     title: "Reportes Inteligentes",
                     description: "Visualiza la ocupación real, ticket promedio y crecimiento mensual con gráficos claros.",
                     color: "text-primary bg-primary/10 dark:bg-primary/20 dark:text-primary-foreground"
              },
              {
                     icon: ShieldCheck,
                     title: "Seguridad Total",
                     description: "Auditoría completa. Registramos quién creó, modificó o cobró cada reserva.",
                     color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
              }
       ]

       return (
              <section className="py-24 px-6 bg-slate-50 dark:bg-black relative overflow-hidden" id="features">
                     {/* Background elements */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-50 dark:from-zinc-900 dark:via-black dark:to-black opacity-80" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.6 }}
                                   className="text-center max-w-3xl mx-auto mb-20 space-y-6"
                            >
                                   <span className="text-primary dark:text-primary font-bold uppercase tracking-widest text-xs bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full border border-primary/20 dark:border-primary/30">Características Potentes</span>
                                   <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                          Todo lo que necesitas para <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-accent">
                                                 profesionalizar tu club.
                                          </span>
                                   </h2>
                                   <p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                                          Dejamos atrás las planillas de Excel y los cuadernos.
                                          CourtOps es el sistema operativo integral para complejos deportivos modernos.
                                   </p>
                            </motion.div>

                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.4, staggerChildren: 0.1 }}
                                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                            >
                                   {FEATURES.map((feature, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 whileHover={{ y: -5 }}
                                                 className="group relative p-8 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/10 transition-all duration-300"
                                          >
                                                 <div className={`mb-6 p-4 rounded-2xl w-fit transition-colors ${feature.color}`}>
                                                        <feature.icon size={28} strokeWidth={2} />
                                                 </div>

                                                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                                                        {feature.title}
                                                 </h3>

                                                 <p className="text-slate-500 dark:text-zinc-500 leading-relaxed font-medium text-sm">
                                                        {feature.description}
                                                 </p>

                                                 {/* Hover corner effect */}
                                                 <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100 to-transparent dark:from-white/5 rounded-tr-[2rem] rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                                          </motion.div>
                                   ))}
                            </motion.div>
                     </div>
              </section >
       )
}
