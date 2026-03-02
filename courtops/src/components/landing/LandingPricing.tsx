'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const plans = [
       {
              name: 'Arranque',
              price: 45000,
              description: 'Ideal para complejos pequeños en crecimiento.',
              features: ['Hasta 2 canchas', 'Agenda básica', 'Gestión de clientes', 'Reportes diarios'],
              cta: 'Empezar ahora',
              highlight: false
       },
       {
              name: 'Élite',
              price: 85000,
              description: 'Nuestra solución completa para clubes activos.',
              features: ['Hasta 8 canchas', 'Kiosko / Buffet Full', 'WhatsApp Automatizado', 'Reportes financieros', 'Soporte prioritario'],
              cta: 'Elegir Plan Élite',
              highlight: true
       },
       {
              name: 'VIP',
              price: 150000,
              description: 'Escalabilidad empresarial sin límites.',
              features: ['Canchas ilimitadas', 'Gestión Multi-Club', 'API para integradores', 'Marca Blanca', 'Account Manager'],
              cta: 'Contactar Ventas',
              highlight: false
       }
]

export default function LandingPricing() {
       const router = useRouter()
       const [isYearly, setIsYearly] = useState(false)

       return (
              <section className="py-24 md:py-32 px-4 md:px-6 bg-slate-50 dark:bg-[#080808] transition-colors duration-700" id="pricing">
                     <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16 md:mb-20 space-y-4">
                                   <h2 className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Planes y Precios</h2>
                                   <h3 className="text-3xl md:text-5xl font-medium text-slate-900 dark:text-white tracking-tight leading-tight">Escoge el plan perfecto para tu club.</h3>

                                   {/* Billing Toggle */}
                                   <div className="flex items-center justify-center gap-4 pt-6">
                                          <span className={cn("text-xs md:text-sm font-medium", !isYearly ? "text-slate-900 dark:text-white" : "text-slate-400")}>Mensual</span>
                                          <button
                                                 onClick={() => setIsYearly(!isYearly)}
                                                 className="w-10 md:w-12 h-5 md:h-6 rounded-full bg-slate-200 dark:bg-zinc-800 relative transition-colors"
                                          >
                                                 <motion.div
                                                        animate={{ x: isYearly ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 24) : 4 }}
                                                        className="absolute top-0.5 md:top-1 w-4 h-4 rounded-full bg-white dark:bg-emerald-500 shadow-sm"
                                                 />
                                          </button>
                                          <span className={cn("text-xs md:text-sm font-medium flex items-center gap-2", isYearly ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                                                 Anual <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">-20%</span>
                                          </span>
                                   </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                   {plans.map((plan, i) => (
                                          <motion.div
                                                 key={i}
                                                 initial={{ opacity: 0, y: 20 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: i * 0.1 }}
                                                 className={cn(
                                                        "p-8 md:p-10 rounded-3xl border flex flex-col transition-all h-full",
                                                        plan.highlight
                                                               ? "bg-white dark:bg-zinc-900 border-emerald-500 shadow-xl dark:shadow-emerald-500/5 relative"
                                                               : "bg-white dark:bg-transparent border-slate-200 dark:border-white/5"
                                                 )}
                                          >
                                                 {plan.highlight && (
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                               Más Popular
                                                        </div>
                                                 )}

                                                 <div className="mb-6 md:mb-8 text-center md:text-left">
                                                        <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                                                        <p className="text-slate-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed">{plan.description}</p>
                                                 </div>

                                                 <div className="mb-8 md:mb-10 flex items-baseline justify-center md:justify-start gap-1">
                                                        <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                                               ${new Intl.NumberFormat('es-AR').format(isYearly ? plan.price * 0.8 : plan.price)}
                                                        </span>
                                                        <span className="text-slate-400 text-xs md:text-sm">/mes</span>
                                                 </div>

                                                 <div className="space-y-4 mb-10 md:mb-12 flex-1">
                                                        {plan.features.map((feature, j) => (
                                                               <div key={j} className="flex items-start gap-3">
                                                                      <Check className="text-emerald-500 shrink-0 mt-1" size={14} />
                                                                      <span className="text-slate-600 dark:text-zinc-300 text-xs md:text-sm">{feature}</span>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 <button
                                                        onClick={() => router.push('/register')}
                                                        className={cn(
                                                               "w-full py-4 rounded-xl md:rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                                               plan.highlight
                                                                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                                                      : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10"
                                                        )}
                                                 >
                                                        {plan.cta} <ArrowRight size={16} />
                                                 </button>
                                          </motion.div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
