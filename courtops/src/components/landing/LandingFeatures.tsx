'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, BarChart3, Layout, Shield, Zap, Globe, MessageSquare } from 'lucide-react'

interface FeatureProps {
       title: string
       description: string
       icon: React.ReactNode
}

const FeatureItem = ({ title, description, icon }: FeatureProps) => (
       <motion.div
              variants={{
                     hidden: { opacity: 0, y: 30, scale: 0.95 },
                     visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
              }}
              className="relative p-6 sm:p-8 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/50 dark:border-white/5 transition-all duration-500 hover:border-emerald-500/30 group overflow-hidden"
       >
              {/* Magic Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 shadow-md border border-slate-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-500">
                     <div className="absolute inset-0 bg-emerald-500/10 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                     {icon}
              </div>
              <h3 className="relative z-10 text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                     {title}
              </h3>
              <p className="relative z-10 text-slate-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                     {description}
              </p>
       </motion.div>
)

export default function LandingFeatures() {
       return (
              <section className="py-20 md:py-32 px-4 sm:px-6 bg-white dark:bg-[#0b0f19] transition-colors duration-700 relative overflow-hidden" id="features">
                     {/* Background Radial Gradient */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true, margin: "-100px" }}
                                   transition={{ duration: 0.8 }}
                                   className="text-center max-w-3xl mx-auto mb-16 md:mb-20 space-y-4 px-2"
                            >
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                                          <Zap size={12} className="fill-emerald-500" /> Arquitectura Premium
                                   </div>
                                   <h3 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.15]">
                                          Todo lo que necesitas para operar <br className="hidden md:block" />
                                          <span className="text-slate-400 dark:text-zinc-500">con eficiencia total.</span>
                                   </h3>
                            </motion.div>

                            <motion.div
                                   initial="hidden"
                                   whileInView="visible"
                                   viewport={{ once: true, margin: "-50px" }}
                                   variants={{
                                          hidden: {},
                                          visible: {
                                                 transition: { staggerChildren: 0.1 }
                                          }
                                   }}
                                   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                            >
                                   <FeatureItem
                                          title="Agenda Inteligente"
                                          description="Visualiza tus canchas en tiempo real. Gestiona reservas, cancelaciones y turnos fijos en segundos."
                                          icon={<Calendar className="text-emerald-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                                   <FeatureItem
                                          title="Analítica de Negocio"
                                          description="Reportes detallados de ingresos, ocupación y comportamiento de usuarios para tomar mejores decisiones."
                                          icon={<BarChart3 className="text-indigo-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                                   <FeatureItem
                                          title="Punto de Venta"
                                          description="Terminal de facturación rápida para productos del buffet, alquiler de equipo y servicios extra."
                                          icon={<Layout className="text-amber-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                                   <FeatureItem
                                          title="Comunicación Automatizada"
                                          description="Notificaciones vía WhatsApp y Email para recordar turnos y reducir ausentismo al máximo."
                                          icon={<MessageSquare className="text-blue-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                                   <FeatureItem
                                          title="Seguridad Bancaria"
                                          description="Infraestructura blindada y backups automáticos en tiempo real para que tu información esté siempre a salvo."
                                          icon={<Shield className="text-violet-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                                   <FeatureItem
                                          title="Plataforma Global"
                                          description="Accede desde cualquier dispositivo y gestiona múltiples sedes en simultáneo desde una única cuenta."
                                          icon={<Globe className="text-teal-500 relative z-10" size={26} strokeWidth={1.5} />}
                                   />
                            </motion.div>
                     </div>
              </section>
       )
}
