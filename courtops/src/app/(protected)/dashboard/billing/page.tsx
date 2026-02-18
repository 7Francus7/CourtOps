'use client'

import React, { useState } from 'react'
import { Check, Star, Shield, Zap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BillingPage() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              {
                     name: 'Start',
                     price: '$45.000',
                     description: 'Ideal para clubes pequeños que recién comienzan.',
                     features: ['Hasta 2 Canchas', 'Turnero Digital', 'Caja Básica', 'Soporte por Email'],
                     highlight: false,
                     color: 'blue'
              },
              {
                     name: 'Growth',
                     price: '$85.000',
                     description: 'Perfecto para clubes en expansión con kiosco.',
                     features: ['Hasta 5 Canchas', 'Punto de Venta (Kiosco)', 'Control de Stock', 'Reportes Avanzados', 'Soporte WhatsApp'],
                     highlight: true,
                     current: true,
                     color: 'emerald'
              },
              {
                     name: 'Pro',
                     price: '$150.000',
                     description: 'Potencia total para grandes complejos.',
                     features: ['Canchas Ilimitadas', 'Gestión Multi-Sede', 'API Access', 'Roles de Empleado', 'Soporte Prioritario 24/7'],
                     highlight: false,
                     color: 'purple'
              },
       ]

       return (
              <div className="min-h-full w-full bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 p-6 lg:p-12 relative overflow-hidden transition-colors duration-300">
                     {/* Background Gradients */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />

                     <div className="relative z-10 max-w-6xl mx-auto">

                            {/* Header */}
                            <div className="text-center mb-16 space-y-4">
                                   <h2 className="text-primary font-bold tracking-widest uppercase text-xs">Planes y Precios</h2>
                                   <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                                          Mejora la gestión de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-600 dark:from-emerald-400 dark:to-cyan-500">Club Deportivo</span>
                                   </h1>
                                   <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
                                          Elige el plan que mejor se adapte a tus necesidades. Sin comisiones por reserva. Cancela cuando quieras.
                                   </p>

                                   {/* Billing Cycle Toggle (Visual only for now) */}
                                   <div className="flex items-center justify-center mt-8 gap-4">
                                          <span className={cn("text-sm font-medium transition-colors", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500")}>Mensual</span>
                                          <button
                                                 onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                                 className="w-14 h-7 bg-slate-200 dark:bg-zinc-800 rounded-full relative p-1 transition-colors hover:bg-slate-300 dark:hover:bg-zinc-700"
                                          >
                                                 <div className={cn("w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300", billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0")} />
                                          </button>
                                          <span className={cn("text-sm font-medium transition-colors flex items-center gap-2", billingCycle === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500")}>
                                                 Anual
                                                 <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Ahorra 20%</span>
                                          </span>
                                   </div>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                                   {plans.map((plan) => (
                                          <div
                                                 key={plan.name}
                                                 className={cn(
                                                        "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 group hover:-translate-y-2",
                                                        plan.highlight
                                                               ? "bg-white dark:bg-zinc-900/80 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-900/20"
                                                               : "bg-white/50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900/60 hover:shadow-xl dark:hover:shadow-none"
                                                 )}
                                          >
                                                 {plan.highlight && (
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white dark:text-black font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 w-max">
                                                               <Sparkles size={12} fill="currentColor" /> Recomendado
                                                        </div>
                                                 )}

                                                 {plan.current && !plan.highlight && (
                                                        <div className="absolute top-4 right-4 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                                                               Plan Actual
                                                        </div>
                                                 )}

                                                 <div className="mb-8">
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                               {plan.name}
                                                        </h3>
                                                        <div className="flex items-baseline gap-1 mb-4">
                                                               <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price}</span>
                                                               <span className="text-slate-500 dark:text-zinc-500 font-medium">/mes</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[40px]">
                                                               {plan.description}
                                                        </p>
                                                 </div>

                                                 <div className="flex-1 mb-8">
                                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent mb-6" />
                                                        <ul className="space-y-4">
                                                               {plan.features.map((feature) => (
                                                                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                             <div className={cn(
                                                                                    "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                                                                    plan.highlight ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                                                                             )}>
                                                                                    <Check size={12} strokeWidth={3} />
                                                                             </div>
                                                                             <span className="leading-tight">{feature}</span>
                                                                      </li>
                                                               ))}
                                                        </ul>
                                                 </div>

                                                 <button
                                                        onClick={() => {
                                                               window.open(`https://wa.me/5493524421497?text=Hola,%20me%20interesa%20el%20plan%20${plan.name}%20de%20CourtOps`, '_blank')
                                                        }}
                                                        className={cn(
                                                               "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95",
                                                               plan.highlight
                                                                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90 shadow-lg shadow-emerald-500/20"
                                                                      : "bg-white text-black hover:bg-zinc-200"
                                                        )}
                                                 >
                                                        {plan.current ? 'Tu Plan Actual' : 'Seleccionar Plan'}
                                                 </button>
                                          </div>
                                   ))}
                            </div>

                            {/* Enterprise Banner */}
                            <div className="mt-16 relative group cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-12 text-center transition-all hover:border-zinc-700">
                                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-500/5 group-hover:to-purple-500/10 transition-all" />

                                   <div className="relative z-10 flex flex-col items-center gap-4">
                                          <div className="p-3 bg-purple-500/10 rounded-2xl mb-2 text-purple-400">
                                                 <Shield size={32} />
                                          </div>
                                          <h3 className="text-2xl md:text-3xl font-bold text-white">¿Necesitas un plan a medida?</h3>
                                          <p className="text-zinc-400 max-w-xl mx-auto mb-6">
                                                 Para cadenas deportivas, franquicias o clubes con necesidades específicas de integración y soporte.
                                          </p>
                                          <button
                                                 onClick={() => window.open('https://wa.me/5493524421497?text=Hola,%20soy%20una%20cadena%20y%20necesito%20un%20plan%20a%20medida', '_blank')}
                                                 className="inline-flex items-center gap-2 text-white border-b border-purple-500 pb-1 hover:text-purple-400 transition-colors font-bold uppercase tracking-wider text-sm"
                                          >
                                                 Contactar Ventas Corporativas <Zap size={14} />
                                          </button>
                                   </div>
                            </div>

                            <div className="mt-12 text-center">
                                   <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
                                          CourtOps - Software de Gestión Deportiva
                                   </p>
                            </div>

                     </div>
              </div>
       )
}
