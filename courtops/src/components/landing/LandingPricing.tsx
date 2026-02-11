
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LandingPricing() {
       const PLANS = [
              {
                     id: 'INITIAL',
                     name: 'Plan Inicial',
                     price: '$35.000',
                     period: '/mes',
                     description: 'Todo lo necesario para organizar tu club.',
                     features: [
                            'Inscripción Única: $200.000',
                            'Gestión de Reservas y Señas',
                            'Control de Caja Simple',
                            'Base de Datos de Clientes',
                            'Soporte Estándar'
                     ],
                     color: 'bg-emerald-500',
                     popular: false
              },
              {
                     id: 'PROFESSIONAL',
                     name: 'Plan Profesional',
                     price: '$50.000',
                     period: '/mes',
                     description: 'Potencia tu club con herramientas avanzadas.',
                     features: [
                            'Inscripción Única: $300.000',
                            'Todo lo del Plan Inicial',
                            'Gestión de Torneos y Ligas',
                            'Kiosco, Stock e Inventario',
                            'Reportes Financieros Avanzados',
                            'Soporte Prioritario 24/7'
                     ],
                     color: 'bg-emerald-500',
                     popular: true
              }
       ]

       return (
              <section className="py-24 px-6 bg-background relative overflow-hidden" id="pricing">
                     {/* Decorative */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                     <div className="max-w-6xl mx-auto relative z-10">
                            <div className="text-center mb-16 space-y-4">
                                   <span className="text-emerald-500 font-bold uppercase tracking-widest text-xs">Precios Honestos</span>
                                   <h2 className="text-4xl md:text-5xl font-black tracking-tight">Elige tu plan</h2>
                                   <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                          Sin contratos ocultos. Paga mes a mes y cancela cuando quieras.
                                   </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                   {PLANS.map((plan) => (
                                          <motion.div
                                                 key={plan.id}
                                                 whileHover={{ y: -5 }}
                                                 className={`relative p-8 rounded-3xl border transition-all duration-300
                     ${plan.popular
                                                               ? 'bg-card border-emerald-500/50 shadow-2xl shadow-emerald-500/10'
                                                               : 'bg-card/40 border-border hover:border-emerald-500/30'
                                                        }
              `}
                                          >
                                                 {plan.popular && (
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                                                               Recomendado
                                                        </div>
                                                 )}

                                                 <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                                 <div className="flex items-baseline gap-1 mb-4">
                                                        <span className="text-4xl font-black">{plan.price}</span>
                                                        <span className="text-muted-foreground">{plan.period}</span>
                                                 </div>
                                                 <p className="text-muted-foreground text-sm mb-6 min-h-[40px]">{plan.description}</p>

                                                 <Link href="/register" className="w-full">
                                                        <button
                                                               className={`w-full py-4 rounded-xl font-bold mb-8 transition-transform active:scale-95 flex items-center justify-center gap-2
                              ${plan.popular ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-xl shadow-emerald-500/20' : 'bg-secondary hover:bg-secondary/80 text-foreground'}
                       `}
                                                        >
                                                               Comenzar Ahora <ArrowRight size={18} />
                                                        </button>
                                                 </Link>

                                                 <div className="space-y-4 pt-6 border-t border-border/50">
                                                        {plan.features.map((feat, i) => (
                                                               <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                                      <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-emerald-500/20 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                                                                             <Check size={12} strokeWidth={3} />
                                                                      </div>
                                                                      {feat}
                                                               </div>
                                                        ))}
                                                 </div>
                                          </motion.div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
