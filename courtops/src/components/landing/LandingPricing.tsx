
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Shield, Zap, ArrowRight, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LandingPricing() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              {
                     name: 'Inicial',
                     monthlyPrice: 45000,
                     description: 'Ideal para clubes pequeños que recién comienzan su digitalización.',
                     features: ['Hasta 2 Canchas', 'Turnero Digital Inteligente', 'Caja Básica', 'Soporte por Email L-V'],
                     highlight: false,
                     gradient: 'from-blue-500/20 to-blue-500/0',
                     border: 'group-hover:border-blue-500/30'
              },
              {
                     name: 'Profesional',
                     monthlyPrice: 85000,
                     description: 'Perfecto para clubes en expansión que buscan automatización total.',
                     features: ['Hasta 8 Canchas', 'Kiosco / Punto de Venta Integrado', 'Gestión Completa de Torneos', 'Control de Stock y Proveedores', 'Reportes Financieros Avanzados', 'Soporte Prioritario WhatsApp 24/7'],
                     highlight: true,
                     gradient: 'from-emerald-500/20 to-teal-500/0',
                     border: 'border-emerald-500/50'
              },
              {
                     name: 'Empresarial',
                     monthlyPrice: 150000,
                     description: 'Potencia absoluta y escalabilidad sin límites para grandes complejos.',
                     features: ['Canchas Ilimitadas', 'Gestión de Múltiples Sedes', 'Módulo de Torneos Pro', 'Acceso a API y Webhooks', 'Roles y Permisos Granulares', 'Ejecutivo de Cuenta Dedicado'],
                     highlight: false,
                     gradient: 'from-purple-500/20 to-purple-500/0',
                     border: 'group-hover:border-purple-500/30'
              },
       ]

       const formatPrice = (amount: number) => {
              return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
       }

       return (
              <section className="py-24 md:py-32 px-4 md:px-6 bg-white dark:bg-[#030712] relative overflow-hidden transition-colors duration-300" id="pricing">
                     {/* Cinematic Background Atmosphere */}
                     <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[100%] blur-[120px] pointer-events-none mix-blend-screen" />
                     <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
                     <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" />

                     <div className="max-w-7xl mx-auto relative z-10">

                            {/* Section Header */}
                            <motion.div
                                   initial={{ opacity: 0, y: 20 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ duration: 0.8, ease: "easeOut" }}
                                   className="text-center mb-16 md:mb-24 space-y-6"
                            >
                                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm">
                                          <Shield size={14} className="fill-emerald-500/50" />
                                          Inversión Inteligente
                                   </div>
                                   <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                                          Impulsa tu club sin <br className="hidden md:block" />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 filter drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                 comisiones ocultas
                                          </span>
                                   </h2>
                                   <p className="text-lg md:text-xl text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                                          Selecciona el ecosistema tecnológico que necesitas hoy, con la tranquilidad de escalar mañana.
                                   </p>

                                   {/* Billing Cycle Toggle (Glassmorphism) */}
                                   <div className="flex items-center justify-center mt-12 gap-5 select-none relative z-20">
                                          <span
                                                 className={cn("text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500")}
                                                 onClick={() => setBillingCycle('monthly')}
                                          >
                                                 Mensual
                                          </span>

                                          <button
                                                 onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                                 className="relative w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 border border-slate-300 dark:border-white/10 transition-all hover:bg-slate-300 dark:hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-inner"
                                          >
                                                 <div className={cn("w-6 h-6 bg-white dark:bg-emerald-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-transform duration-500 cubic-bezier(0.16,1,0.3,1)", billingCycle === 'yearly' ? "translate-x-8" : "translate-x-0")} />
                                          </button>

                                          <span
                                                 className={cn("text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-3 cursor-pointer", billingCycle === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-zinc-500")}
                                                 onClick={() => setBillingCycle('yearly')}
                                          >
                                                 Anual
                                                 <div className="relative">
                                                        <div className="absolute inset-0 bg-emerald-500 blur-sm opacity-50 rounded-full animate-pulse" />
                                                        <span className="relative text-[10px] bg-emerald-500 text-white dark:text-white px-2.5 py-1 rounded-full font-black tracking-widest shadow-md">
                                                               2 MESES GRATIS
                                                        </span>
                                                 </div>
                                          </span>
                                   </div>
                            </motion.div>

                            {/* Pricing Cards Grid */}
                            <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 perspective-[2000px]">
                                   {plans.map((plan, idx) => {
                                          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.monthlyPrice * 0.8333 // Approx 2 months free equivalent logic based on previous (monthly * 0.8 is roughly 2.4 months free if billed yearly. Just doing math visualization)
                                          const isYearly = billingCycle === 'yearly'
                                          const displayPrice = isYearly ? plan.monthlyPrice * 10 / 12 : plan.monthlyPrice; // If yearly, they pay 10 months out of 12. Display monthly equivalent.
                                          const billedYearlyTotal = plan.monthlyPrice * 10;

                                          return (
                                                 <motion.div
                                                        key={plan.name}
                                                        initial={{ opacity: 0, y: 40, rotateX: 10 }}
                                                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: idx * 0.2, duration: 0.8, ease: "easeOut" }}
                                                        className={cn(
                                                               "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] border transition-all duration-500 group overflow-visible h-full",
                                                               plan.highlight
                                                                      ? "bg-slate-50 dark:bg-[#0A101A] border-emerald-500/50 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] dark:shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)] z-20 md:scale-105"
                                                                      : "bg-white/80 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.04] backdrop-blur-xl z-10"
                                                        )}
                                                 >
                                                        {/* Subtle top gradient within card */}
                                                        <div className={cn("absolute top-0 inset-x-0 h-32 bg-gradient-to-b opacity-50 pointer-events-none transition-opacity duration-500 rounded-t-[2.5rem]", plan.gradient, plan.highlight ? "opacity-100" : "group-hover:opacity-100")} />

                                                        {plan.highlight && (
                                                               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-2 ring-4 ring-white dark:ring-[#030712] z-30">
                                                                      <Sparkles size={14} className="animate-pulse" /> Recomendado
                                                               </div>
                                                        )}

                                                        <div className="mb-8 relative z-10">
                                                               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                                                      {plan.name}
                                                               </h3>
                                                               <div className="flex flex-col mb-4 min-h-[90px] justify-center">
                                                                      <div className="flex items-start gap-1">
                                                                             <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{formatPrice(displayPrice)}</span>
                                                                      </div>
                                                                      {isYearly ? (
                                                                             <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                                                                                    Único pago de {formatPrice(billedYearlyTotal)}/año
                                                                             </span>
                                                                      ) : (
                                                                             <span className="text-sm text-slate-500 dark:text-zinc-500 font-medium mt-2">
                                                                                    Facturado mensualmente
                                                                             </span>
                                                                      )}
                                                               </div>
                                                               <p className="text-[15px] text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[50px] font-medium">
                                                                      {plan.description}
                                                               </p>
                                                        </div>

                                                        {/* Feature List Divider */}
                                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-8 relative z-10" />

                                                        <div className="flex-1 mb-10 relative z-10">
                                                               <ul className="space-y-5">
                                                                      {plan.features.map((feature, fIdx) => (
                                                                             <li key={fIdx} className="flex items-start gap-4 text-[15px] text-slate-700 dark:text-zinc-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                                    <div className={cn(
                                                                                           "mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110",
                                                                                           plan.highlight ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400"
                                                                                    )}>
                                                                                           <Check size={12} strokeWidth={4} />
                                                                                    </div>
                                                                                    <span className="leading-snug">{feature}</span>
                                                                             </li>
                                                                      ))}
                                                               </ul>
                                                        </div>

                                                        <a
                                                               href={`https://wa.me/5493524421497?text=Hola,%20busco%20contratar%20el%20plan%20${plan.name}%20(${isYearly ? 'Anual' : 'Mensual'})%20de%20CourtOps`}
                                                               target="_blank"
                                                               rel="noopener noreferrer"
                                                               className={cn(
                                                                      "w-full py-4.5 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group/btn flex items-center justify-center gap-2 z-10",
                                                                      plan.highlight
                                                                             ? "bg-emerald-500 text-white shadow-[0_10px_40px_-10px_rgba(16,185,129,0.8)]"
                                                                             : "bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 shadow-xl"
                                                               )}
                                                        >
                                                               <span className="relative z-10 flex items-center gap-2">
                                                                      Contratar Ahora <ArrowRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                                               </span>
                                                               {plan.highlight && (
                                                                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                                               )}
                                                        </a>
                                                 </motion.div>
                                          )
                                   })}
                            </div>

                            {/* Ultra Premium Enterprise Banner */}
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                                   className="mt-20 md:mt-24 relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-[#0A101A] border border-slate-800 dark:border-white/5 p-8 md:p-12 transition-all hover:border-slate-700 dark:hover:border-white/10 shadow-2xl"
                            >
                                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                                   {/* Decorative blur rings */}
                                   <div className="absolute -right-20 -top-20 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
                                   <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

                                   <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
                                          <div className="flex items-center gap-6 text-left flex-1">
                                                 <div className="p-4 bg-white/5 backdrop-blur-md text-indigo-400 rounded-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                        <Building2 size={36} strokeWidth={1.5} />
                                                 </div>
                                                 <div>
                                                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Arquitectura a Medida</h3>
                                                        <p className="text-slate-400 text-lg">
                                                               Franquicias, clubes gigantes o necesidades de integración complejas. Construimos la solución.
                                                        </p>
                                                 </div>
                                          </div>

                                          <a
                                                 href="https://wa.me/5493524421497?text=Hola,%20soy%20una%20cadena%20y%20necesito%20un%20plan%20Corporativo"
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="shrink-0 flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl backdrop-blur-md transition-colors border border-white/10 font-bold uppercase tracking-widest text-sm"
                                          >
                                                 Contactar Ventas VIP <Zap size={16} className="fill-white" />
                                          </a>
                                   </div>
                            </motion.div>

                     </div>
              </section>
       )
}
