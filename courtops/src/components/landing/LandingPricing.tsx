
'use client'

import React, { useState } from 'react'
import { Check, Sparkles, Shield, Zap, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingPricing() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              {
                     name: 'Inicial',
                     monthlyPrice: 45000,
                     description: 'Ideal para clubes pequeños que recién comienzan.',
                     features: ['Hasta 2 Canchas', 'Turnero Digital', 'Caja Básica', 'Soporte por Email'],
                     highlight: false,
                     color: 'blue'
              },
              {
                     name: 'Profesional',
                     monthlyPrice: 85000,
                     description: 'Perfecto para clubes en expansión con kiosco.',
                     features: ['Hasta 5 Canchas', 'Punto de Venta (Kiosco)', 'Control de Stock', 'Reportes Avanzados', 'Soporte WhatsApp'],
                     highlight: true,
                     current: true,
                     color: 'primary'
              },
              {
                     name: 'Empresarial',
                     monthlyPrice: 150000,
                     description: 'Potencia total para grandes complejos.',
                     features: ['Canchas Ilimitadas', 'Gestión Multi-Sede', 'Acceso a API', 'Roles de Empleado', 'Soporte Prioritario 24/7'],
                     highlight: false,
                     color: 'purple'
              },
       ]

       const formatPrice = (amount: number) => {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
       }

       return (
              <section className="py-24 px-6 bg-slate-50 dark:bg-[#09090b] relative overflow-hidden transition-colors duration-300" id="pricing">
                     {/* Background Gradients */}
                     <div className="absolute top-0 right-0 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />
                     <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal" />

                     <div className="max-w-7xl mx-auto relative z-10">

                            {/* Header */}
                            <div className="text-center mb-20 space-y-4">
                                   <h2 className="text-primary dark:text-primary font-bold tracking-widest uppercase text-xs">Planes y Precios</h2>
                                   <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
                                          Mejora la gestión de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">Club Deportivo</span>
                                   </h1>
                                   <p className="text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto text-xl leading-relaxed">
                                          Elige el plan que mejor se adapte a tus necesidades. Sin comisiones por reserva. Cancela cuando quieras.
                                   </p>

                                   {/* Billing Cycle Toggle */}
                                   <div className="flex items-center justify-center mt-10 gap-4 select-none">
                                          <span
                                                 className={cn("text-sm font-medium transition-colors cursor-pointer", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500")}
                                                 onClick={() => setBillingCycle('monthly')}
                                          >
                                                 Mensual
                                          </span>
                                          <button
                                                 onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                                 className="w-14 h-7 bg-slate-200 dark:bg-zinc-800 rounded-full relative p-1 transition-colors hover:bg-slate-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                          >
                                                 <div className={cn("w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300", billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0")} />
                                          </button>
                                          <span
                                                 className={cn("text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer", billingCycle === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-zinc-500")}
                                                 onClick={() => setBillingCycle('yearly')}
                                          >
                                                 Anual
                                                 <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">20% OFF</span>
                                          </span>
                                   </div>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
                                   {plans.map((plan) => {
                                          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.monthlyPrice * 0.8
                                          const isYearly = billingCycle === 'yearly'

                                          return (
                                                 <div
                                                        key={plan.name}
                                                        className={cn(
                                                               "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 group hover:-translate-y-2",
                                                               plan.highlight
                                                                      ? "bg-white dark:bg-zinc-900/80 border-primary/50 shadow-2xl shadow-primary/10 dark:shadow-primary/20 z-10 scale-[1.02]"
                                                                      : "bg-white/50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900/60 hover:shadow-xl dark:hover:shadow-none"
                                                        )}
                                                 >
                                                        {plan.highlight && (
                                                               <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 w-max">
                                                                      <Sparkles size={12} fill="currentColor" /> Recomendado
                                                               </div>
                                                        )}

                                                        <div className="mb-8">
                                                               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                                      {plan.name}
                                                               </h3>
                                                               <div className="flex flex-col mb-4">
                                                                      <div className="flex items-baseline gap-1">
                                                                             <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{formatPrice(price)}</span>
                                                                             <span className="text-slate-500 dark:text-zinc-500 font-medium">/mes</span>
                                                                      </div>
                                                                      {isYearly && (
                                                                             <span className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                                                                                    Facturado {formatPrice(price * 12)} al año
                                                                             </span>
                                                                      )}
                                                               </div>
                                                               <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[40px] font-medium">
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
                                                                                           plan.highlight ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground" : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
                                                                                    )}>
                                                                                           <Check size={12} strokeWidth={3} />
                                                                                    </div>
                                                                                    <span className="leading-tight">{feature}</span>
                                                                             </li>
                                                                      ))}
                                                               </ul>
                                                        </div>

                                                        <a
                                                               href={`https://wa.me/5493524421497?text=Hola,%20quisiera%20contratar%20el%20plan%20${plan.name}%20(${isYearly ? 'Anual' : 'Mensual'})%20de%20CourtOps`}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className={cn(
                                                                      "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2",
                                                                      plan.highlight
                                                                             ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                                                             : "bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200"
                                                               )}
                                                        >
                                                               Contratar Ahora <ArrowRight size={14} strokeWidth={3} />
                                                        </a>
                                                 </div>
                                          )
                                   })}
                            </div>

                            {/* Enterprise Banner */}
                            <div className="mt-20 relative group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 md:p-12 text-center transition-all hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md">
                                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 group-hover:to-primary/10 transition-all" />

                                   <div className="relative z-10 flex flex-col items-center gap-4">
                                          <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-2xl mb-2">
                                                 <Shield size={32} />
                                          </div>
                                          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">¿Necesitas un plan a medida?</h3>
                                          <p className="text-slate-600 dark:text-zinc-400 max-w-xl mx-auto mb-6">
                                                 Para cadenas deportivas, franquicias o clubes con necesidades específicas de integración y soporte.
                                          </p>
                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola,%20soy%20una%20cadena%20y%20necesito%20un%20plan%20a%20medida"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="inline-flex items-center gap-2 text-slate-900 dark:text-white border-b border-primary/50 pb-1 hover:text-primary dark:hover:text-primary transition-colors font-bold uppercase tracking-wider text-sm"
                                          >
                                                 Contactar Ventas Corporativas <Zap size={14} />
                                          </a>
                                   </div>
                            </div>

                     </div>
              </section>
       )
}
