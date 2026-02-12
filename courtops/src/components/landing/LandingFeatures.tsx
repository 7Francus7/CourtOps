
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Smartphone, TrendingUp, ShieldCheck, Zap, Receipt, BarChart3, Users, Settings } from 'lucide-react'

export default function LandingFeatures() {
       const FEATURES = [
              {
                     icon: Clock,
                     title: "Reservas Instantáneas",
                     description: "Elimina las llamadas. Tus clientes reservan en segundos desde cualquier dispositivo, 24/7.",
                     color: "text-blue-400"
              },
              {
                     icon: Receipt,
                     title: "Control de Caja Automatizado",
                     description: "Cuadra tu día sin errores. Efectivo, transferencias y gastos se registran automáticamente.",
                     color: "text-emerald-400"
              },
              {
                     icon: Zap,
                     title: "Precios Dinámicos",
                     description: "Maximiza ingresos. Configura tarifas diferentes para horarios pico, fin de semana o feriados.",
                     color: "text-amber-400"
              },
              {
                     icon: Smartphone,
                     title: "Kiosco POS Integrado",
                     description: "Vende bebidas, alquila paletas y controla el stock sin salir del sistema.",
                     color: "text-rose-400"
              },
              {
                     icon: TrendingUp,
                     title: "Reportes Inteligentes",
                     description: "Visualiza la ocupación real, ticket promedio y crecimiento mensual con gráficos claros.",
                     color: "text-violet-400"
              },
              {
                     icon: ShieldCheck,
                     title: "Seguridad Total",
                     description: "Auditoría completa. Registramos quién creó, modificó o cobró cada reserva.",
                     color: "text-cyan-400"
              }
       ]

       return (
              <section className="py-24 px-6 bg-[#0a0a0a] relative overflow-hidden" id="features">
                     {/* Background elements */}
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#0a0a0a] to-[#0a0a0a]" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                                   <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Características Potentes</span>
                                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                          Todo lo que necesitas para <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                                                 profesionalizar tu club.
                                          </span>
                                   </h2>
                                   <p className="text-xl text-zinc-400 leading-relaxed font-light">
                                          Dejamos atrás las planillas de Excel y los cuadernos.
                                          CourtOps es el sistema operativo integral para complejos deportivos modernos.
                                   </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                   {FEATURES.map((feature, idx) => (
                                          <motion.div
                                                 key={idx}
                                                 whileHover={{ y: -5 }}
                                                 className="group relative p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:border-white/10 hover:bg-zinc-800/50 transition-all duration-300 backdrop-blur-sm"
                                          >
                                                 <div className={`mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors ${feature.color}`}>
                                                        <feature.icon size={28} strokeWidth={1.5} />
                                                 </div>

                                                 <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                                                        {feature.title}
                                                 </h3>

                                                 <p className="text-zinc-400 leading-relaxed font-medium text-sm">
                                                        {feature.description}
                                                 </p>

                                                 {/* Hover corner effect */}
                                                 <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-tr-[2rem] rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                                          </motion.div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
