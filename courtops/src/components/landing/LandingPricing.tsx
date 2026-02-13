
'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCircle2, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPricing() {
       const PLANS = [
              {
                     name: 'Start',
                     price: '$35.000',
                     period: '/mes',
                     description: 'Ideal para clubes pequeños que quieren digitalizarse.',
                     features: [
                            'Hasta 2 canchas',
                            'Panel de Administración Básico',
                            'Reservas Online (Link Público)',
                            'Control de Caja Simple',
                            'Soporte por Email'
                     ],
                     cta: 'Comenzar Gratis',
                     highlight: false,
                     color: 'text-slate-900'
              },
              {
                     name: 'Pro',
                     price: '$50.000',
                     period: '/mes',
                     description: 'La opción favorita para clubes en crecimiento.',
                     features: [
                            'Hasta 6 canchas',
                            'Punto de Venta (Kiosco) Integrado',
                            'Reportes Financieros Avanzados',
                            'Gestión de Clientes y Deudas',
                            'Soporte Prioritario WhatsApp',
                            'Recordatorios Automáticos'
                     ],
                     cta: 'Elegir Plan Pro',
                     highlight: true,
                     color: 'text-emerald-600'
              },
              {
                     name: 'Enterprise',
                     price: 'Consultar',
                     period: '',
                     description: 'Para cadenas de clubes o complejos de alto rendimiento.',
                     features: [
                            'Canchas Ilimitadas',
                            'Multi-Sede / Multi-Usuario',
                            'API de Integración',
                            'App Personalizada (Marca Blanca)',
                            'Gerente de Cuenta Dedicado',
                            'Migración de Datos Gratuita'
                     ],
                     cta: 'Contactar Ventas',
                     highlight: false,
                     color: 'text-slate-900'
              }
       ]

       return (
              <section className="py-32 px-6 bg-white relative overflow-hidden" id="pricing">

                     {/* Gradient Blob 1 */}
                     <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
                     {/* Gradient Blob 2 */}
                     <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">

                            {/* Header */}
                            <div className="text-center mb-20 space-y-6">
                                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                                          Sin Comisiones por Reserva
                                   </div>
                                   <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
                                          Precios Transparentes.
                                   </h2>
                                   <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
                                          Paga una suscripción fija mensual. Mantén el 100% de tus ingresos.
                                          Cancela cuando quieras.
                                   </p>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                   {PLANS.map((plan, idx) => (
                                          <motion.div
                                                 key={plan.name}
                                                 whileHover={{ y: -8 }}
                                                 className={`
                                                        relative p-8 rounded-[2rem] border flex flex-col h-full transition-all duration-300
                                                        ${plan.highlight
                                                               ? 'bg-white border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-4 ring-emerald-500/5'
                                                               : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
                                                        }
                                                 `}
                                          >
                                                 {plan.highlight && (
                                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                                                               <Zap size={12} fill="currentColor" /> Más Elegido
                                                        </div>
                                                 )}

                                                 {/* Plan Header */}
                                                 <div className="mb-8">
                                                        <h3 className={`text-xl font-bold mb-2 ${plan.color}`}>{plan.name}</h3>
                                                        <div className="flex items-baseline gap-1 mb-4">
                                                               <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                                                               <span className="text-slate-400 font-medium">{plan.period}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
                                                 </div>

                                                 {/* Features List */}
                                                 <div className="flex-1 space-y-4 mb-8">
                                                        {plan.features.map((feat, i) => (
                                                               <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                                                      <div className={`mt-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center ${plan.highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                             <Check size={10} strokeWidth={4} />
                                                                      </div>
                                                                      <span className="font-medium">{feat}</span>
                                                               </div>
                                                        ))}
                                                 </div>

                                                 {/* CTA Button */}
                                                 <Link href="/register" className="w-full mt-auto">
                                                        <button
                                                               className={`
                                                                      w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95
                                                                      ${plan.highlight
                                                                             ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                                                                             : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                                                                      }
                                                               `}
                                                        >
                                                               {plan.cta}
                                                        </button>
                                                 </Link>
                                          </motion.div>
                                   ))}
                            </div>

                            {/* Footer Note */}
                            <div className="text-center mt-16 pb-20 border-b border-slate-100">
                                   <p className="text-slate-500 text-sm">
                                          ¿Necesitas una implementación a medida? <a href="#" className="text-emerald-600 hover:underline font-bold">Hablemos por WhatsApp</a>.
                                   </p>
                            </div>
                     </div>
              </section>
       )
}
