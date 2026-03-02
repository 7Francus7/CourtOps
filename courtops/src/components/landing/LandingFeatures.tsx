'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, BarChart3, Layout, Shield, Zap, Globe, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureProps {
       title: string
       description: string
       icon: React.ReactNode
       delay?: number
}

const FeatureItem = ({ title, description, icon, delay = 0 }: FeatureProps) => (
       <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay }}
              className="p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 transition-all hover:border-emerald-500/20 group"
       >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                     {icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
                     {description}
              </p>
       </motion.div>
)

export default function LandingFeatures() {
       return (
              <section className="py-32 px-6 bg-white dark:bg-[#050505] transition-colors duration-700" id="features">
                     <div className="max-w-7xl mx-auto">
                            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                                   <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Características principales</h2>
                                   <h3 className="text-4xl md:text-5xl font-medium text-slate-900 dark:text-white tracking-tight">
                                          Todo lo que necesitas para operar <br className="hidden md:block" />
                                          <span className="text-slate-400 dark:text-zinc-600">con eficiencia total.</span>
                                   </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   <FeatureItem
                                          title="Agenda Inteligente"
                                          description="Visualiza tus canchas en tiempo real. Gestiona reservas, cancelaciones y turnos fijos en segundos."
                                          icon={<Calendar className="text-emerald-500" size={24} />}
                                          delay={0.1}
                                   />
                                   <FeatureItem
                                          title="Analítica de Negocio"
                                          description="Reportes detallados de ingresos, ocupación y comportamiento de usuarios para tomar mejores decisiones."
                                          icon={<BarChart3 className="text-indigo-500" size={24} />}
                                          delay={0.2}
                                   />
                                   <FeatureItem
                                          title="Punto de Venta"
                                          description="Terminal de facturación rápida para productos del buffet, alquiler de equipo y servicios extra."
                                          icon={<Layout className="text-amber-500" size={24} />}
                                          delay={0.3}
                                   />
                                   <FeatureItem
                                          title="Comunicación Automatizada"
                                          description="Notificaciones vía WhatsApp y Email para recordar turnos y reducir ausentismo."
                                          icon={<MessageSquare className="text-blue-500" size={24} />}
                                          delay={0.4}
                                   />
                                   <FeatureItem
                                          title="Seguridad Bancaria"
                                          description="Infraestructura blindada y backups automáticos para que tu información esté siempre a salvo."
                                          icon={<Shield className="text-violet-500" size={24} />}
                                          delay={0.5}
                                   />
                                   <FeatureItem
                                          title="Plataforma Global"
                                          description="Accede desde cualquier dispositivo y gestiona múltiples sedes desde una única cuenta central."
                                          icon={<Globe className="text-teal-500" size={24} />}
                                          delay={0.6}
                                   />
                            </div>
                     </div>
              </section>
       )
}
