
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Check, Sparkles, Shield, Zap, ArrowRight, Building2, Crown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingCardProps {
       plan: {
              name: string
              monthlyPrice: number
              description: string
              features: string[]
              highlight: boolean
              icon: any
              color: string
       }
       billingCycle: 'monthly' | 'yearly'
       idx: number
}

const PricingCard = ({ plan, billingCycle, idx }: PricingCardProps) => {
       const isYearly = billingCycle === 'yearly'
       const displayPrice = isYearly ? plan.monthlyPrice * 0.8 : plan.monthlyPrice

       const mouseX = useMotionValue(0)
       const mouseY = useMotionValue(0)
       const cardRef = useRef<HTMLDivElement>(null)

       function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
              const { left, top } = currentTarget.getBoundingClientRect()
              mouseX.set(clientX - left)
              mouseY.set(clientY - top)
       }

       return (
              <motion.div
                     ref={cardRef}
                     onMouseMove={handleMouseMove}
                     initial={{ opacity: 0, y: 40 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                     className={cn(
                            "relative group flex flex-col p-10 rounded-[2.5rem] border transition-all duration-700 h-full overflow-hidden",
                            plan.highlight
                                   ? "bg-white dark:bg-[#050B14] border-emerald-500/50 shadow-2xl scale-105 z-20"
                                   : "bg-white/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 backdrop-blur-3xl z-10"
                     )}
              >
                     {/* Mouse Follow Glow */}
                     <motion.div
                            className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                            style={{
                                   background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${plan.highlight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)'}, transparent 40%)`,
                            }}
                     />

                     {plan.highlight && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                                   <Crown size={12} className="fill-white" /> El más elegido
                            </div>
                     )}

                     <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:rotate-12", plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")}>
                                          <plan.icon size={24} />
                                   </div>
                                   <div>
                                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">{plan.name}</h3>
                                          <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest">{plan.description}</p>
                                   </div>
                            </div>

                            <div className="mb-10 min-h-[140px] flex flex-col justify-center">
                                   <div className="flex items-baseline gap-2">
                                          <span className="text-slate-400 dark:text-zinc-600 text-2xl font-black">$</span>
                                          <span className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                                                 {new Intl.NumberFormat('es-AR').format(displayPrice)}
                                          </span>
                                          <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/mes</span>
                                   </div>
                                   {isYearly && (
                                          <motion.p
                                                 initial={{ opacity: 0, x: -10 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 className="text-xs text-emerald-500 font-black uppercase mt-4 tracking-widest"
                                          >
                                                 Liquidación Anual (-20%)
                                          </motion.p>
                                   )}
                            </div>

                            <div className="space-y-5 mb-12">
                                   {plan.features.map((f, i) => (
                                          <div key={i} className="flex items-center gap-4 text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                 <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 border", plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400")}>
                                                        <Check size={12} strokeWidth={4} />
                                                 </div>
                                                 <span className="text-sm font-medium tracking-tight leading-none uppercase">{f}</span>
                                          </div>
                                   ))}
                            </div>

                            <button className={cn(
                                   "w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 group/btn relative overflow-hidden",
                                   plan.highlight
                                          ? "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] hover:shadow-emerald-500/60"
                                          : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-100"
                            )}>
                                   <span className="relative z-10 flex items-center justify-center gap-2">
                                          Elegir {plan.name} <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                   </span>
                            </button>
                     </div>
              </motion.div>
       )
}

export default function LandingPricing() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              {
                     name: 'Arranque',
                     monthlyPrice: 45000,
                     description: 'Para clubes en crecimiento',
                     features: ['2 Canchas Ilimitadas', 'Gestión de Agenda', 'Caja Básica', 'Soporte vía App'],
                     highlight: false,
                     icon: Zap,
                     color: 'blue'
              },
              {
                     name: 'Élite',
                     monthlyPrice: 85000,
                     description: 'El estándar de la industria',
                     features: ['Canchas Ilimitadas', 'Punto de Venta Pro', 'Gestión de Torneos', 'WhatsApp Automation', 'Analytics Avanzado'],
                     highlight: true,
                     icon: Crown,
                     color: 'emerald'
              },
              {
                     name: 'Full VIP',
                     monthlyPrice: 150000,
                     description: 'Para cadenas y complejos',
                     features: ['Multisede Centralizada', 'API para Desarrolladores', 'Dedicated Manager', 'Roles Personalizados', 'Branding Blanco'],
                     highlight: false,
                     icon: Building2,
                     color: 'indigo'
              },
       ]

       return (
              <section className="py-24 px-4 md:px-8 bg-white dark:bg-black relative overflow-hidden" id="pricing">
                     {/* Background Atmospheric Glow */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[200px] pointer-events-none" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="text-center mb-24 max-w-4xl mx-auto"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                                          <Star size={14} className="text-emerald-500 fill-emerald-500" /> Rentabilidad Inteligente
                                   </div>
                                   <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-8 uppercase italic">
                                          Simplicidad <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500">Sin Comisiones.</span>
                                   </h2>

                                   {/* Billing Toggle */}
                                   <div className="flex items-center justify-center gap-8 mt-16 scale-110">
                                          <span className={cn("text-xs font-black uppercase tracking-widest cursor-pointer transition-colors", billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400")} onClick={() => setBillingCycle('monthly')}>Mensual</span>
                                          <button
                                                 onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                                 className="relative w-20 h-10 bg-slate-200 dark:bg-white/5 rounded-full p-1.5 border border-slate-300 dark:border-white/10 group overflow-hidden"
                                          >
                                                 <motion.div
                                                        animate={{ x: billingCycle === 'monthly' ? 0 : 38 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className="w-7 h-7 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"
                                                 />
                                          </button>
                                          <div className="flex items-center gap-4">
                                                 <span className={cn("text-xs font-black uppercase tracking-widest cursor-pointer transition-colors", billingCycle === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-400")} onClick={() => setBillingCycle('yearly')}>Anual</span>
                                                 <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20">-20% OFF</span>
                                          </div>
                                   </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-stretch">
                                   {plans.map((plan, i) => (
                                          <PricingCard key={i} plan={plan} billingCycle={billingCycle} idx={i} />
                                   ))}
                            </div>

                            {/* Trust Badge / Info */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   className="mt-24 text-center border-t border-slate-100 dark:border-white/5 pt-12 flex flex-col md:flex-row items-center justify-center gap-12"
                            >
                                   <div className="flex flex-col items-center gap-2">
                                          <Shield size={32} className="text-emerald-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin Permanencia</p>
                                   </div>
                                   <div className="flex flex-col items-center gap-2">
                                          <Zap size={32} className="text-indigo-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Setup Instantáneo</p>
                                   </div>
                                   <div className="flex flex-col items-center gap-2">
                                          <Check size={32} className="text-emerald-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Actualizaciones Gratis</p>
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
