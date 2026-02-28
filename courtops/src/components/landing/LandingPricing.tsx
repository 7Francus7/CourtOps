'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
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

const Meteor = ({ delay }: { delay: number }) => (
       <motion.div
              initial={{ x: '100%', y: '-10%', opacity: 0 }}
              animate={{ x: '-100%', y: '100%', opacity: [0, 1, 0] }}
              transition={{ duration: 2, delay, repeat: Infinity, ease: 'linear' }}
              className="absolute w-0.5 h-20 bg-gradient-to-b from-emerald-500/50 to-transparent -rotate-45 pointer-events-none"
       />
)

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
                            "relative group flex flex-col p-10 rounded-[3rem] border transition-all duration-700 h-full overflow-hidden",
                            plan.highlight
                                   ? "bg-white dark:bg-[#050B14] border-emerald-500/50 shadow-[0_30px_100px_-20px_rgba(16,185,129,0.2)] scale-105 z-20"
                                   : "bg-white/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 backdrop-blur-3xl z-10"
                     )}
              >
                     {/* Meteors for Highlighted Plan */}
                     {plan.highlight && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                                   <Meteor delay={0} />
                                   <Meteor delay={4} />
                                   <Meteor delay={8} />
                            </div>
                     )}

                     {/* Mouse Follow Glow */}
                     <motion.div
                            className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
                            style={{
                                   background: useSpring(
                                          `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${plan.highlight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)'}, transparent 40%)`,
                                          { stiffness: 500, damping: 50 }
                                   ) as any
                            }}
                     />

                     {plan.highlight && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-8 py-2 rounded-b-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                   <Crown size={12} className="fill-white" /> Recomendado
                            </div>
                     )}

                     <div className="relative z-10 mt-4">
                            <div className="flex items-center gap-5 mb-10">
                                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-xl", plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")}>
                                          <plan.icon size={28} />
                                   </div>
                                   <div>
                                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic leading-none mb-1">{plan.name}</h3>
                                          <p className="text-[10px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-widest">{plan.description}</p>
                                   </div>
                            </div>

                            <div className="mb-12 flex flex-col justify-center">
                                   <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
                                          <span className="text-slate-400 dark:text-zinc-600 text-2xl font-black shrink-0">$</span>
                                          <motion.span
                                                 key={displayPrice}
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 className="text-6xl lg:text-5xl xl:text-7xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums shrink-0"
                                          >
                                                 {new Intl.NumberFormat('es-AR').format(displayPrice)}
                                          </motion.span>
                                          <span className="text-slate-400 font-bold text-sm uppercase tracking-widest shrink-0">/mes</span>
                                   </div>
                                   <AnimatePresence>
                                          {isYearly && (
                                                 <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                 >
                                                        <p className="text-[10px] text-emerald-500 font-black uppercase mt-4 tracking-[0.3em] flex items-center gap-2">
                                                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                               Liquidación Anual (-20%)
                                                        </p>
                                                 </motion.div>
                                          )}
                                   </AnimatePresence>
                            </div>

                            <div className="space-y-6 mb-12">
                                   {plan.features.map((f, i) => (
                                          <div key={i} className="flex items-center gap-4 text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                 <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500", plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10 shadow-lg" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400")}>
                                                        <Check size={12} strokeWidth={4} />
                                                 </div>
                                                 <span className="text-xs font-black tracking-tight leading-none uppercase">{f}</span>
                                          </div>
                                   ))}
                            </div>

                            <button className={cn(
                                   "w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 group/btn relative overflow-hidden",
                                   plan.highlight
                                          ? "bg-emerald-500 text-white shadow-2xl shadow-emerald-500/40 hover:scale-[1.02] hover:shadow-emerald-500/60"
                                          : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-100"
                            )}>
                                   <span className="relative z-10 flex items-center justify-center gap-3">
                                          Iniciar con {plan.name} <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
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
                     features: ['2 Canchas Ilimitadas', 'Gestión de Agenda Pro', 'Caja de Ventas Básica', 'Soporte vía App 24/7'],
                     highlight: false,
                     icon: Zap,
                     color: 'blue'
              },
              {
                     name: 'Élite',
                     monthlyPrice: 85000,
                     description: 'El estándar de la industria',
                     features: ['Canchas Ilimitadas', 'Punto de Venta Hostelería', 'Gestión de Torneos Live', 'WhatsApp Automation', 'Analytics Predictivo'],
                     highlight: true,
                     icon: Star,
                     color: 'emerald'
              },
              {
                     name: 'Full VIP',
                     monthlyPrice: 150000,
                     description: 'Para cadenas y complejos',
                     features: ['Multisede Centralizada', 'API Integración Total', 'Account Manager Dedicado', 'Branding Blanco (App Propia)', 'SLA 99.9% Garantizado'],
                     highlight: false,
                     icon: Crown,
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
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Rentabilidad Inteligente
                                   </div>
                                   <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-8 uppercase italic">
                                          Simplicidad <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500">Sin Comisiones.</span>
                                   </h2>

                                   {/* Billing Toggle (Advanced Physics) */}
                                   <div className="flex items-center justify-center gap-8 mt-16 scale-125">
                                          <span
                                                 className={cn("text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-500", billingCycle === 'monthly' ? "text-slate-900 dark:text-white scale-110" : "text-slate-400")}
                                                 onClick={() => setBillingCycle('monthly')}
                                          >
                                                 Mensual
                                          </span>
                                          <button
                                                 onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                                 className="relative w-16 h-8 bg-slate-200 dark:bg-white/5 rounded-full p-1 border border-slate-300 dark:border-white/10 group transition-all"
                                          >
                                                 <motion.div
                                                        animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                        className="w-6 h-6 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 relative z-10"
                                                 />
                                                 <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
                                          </button>
                                          <div className="flex items-center gap-4">
                                                 <span
                                                        className={cn("text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all duration-500", billingCycle === 'yearly' ? "text-slate-900 dark:text-white scale-110" : "text-slate-400")}
                                                        onClick={() => setBillingCycle('yearly')}
                                                 >
                                                        Anual
                                                 </span>
                                                 <span className="bg-emerald-500 text-white text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/20 animate-bounce">Ahorra 20%</span>
                                          </div>
                                   </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-14 items-stretch px-4">
                                   {plans.map((plan, i) => (
                                          <PricingCard key={i} plan={plan} billingCycle={billingCycle} idx={i} />
                                   ))}
                            </div>

                            {/* Trust Ticker */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   className="mt-32 text-center border-t border-slate-100 dark:border-white/5 pt-16"
                            >
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
                                          {[
                                                 { icon: Shield, label: 'Sin Permanencia', sub: 'Cancela cuando quieras' },
                                                 { icon: Zap, label: 'Setup Express', sub: 'Listo en 5 minutos' },
                                                 { icon: Check, label: 'Updates Incluidos', sub: 'Nuevos módulos gratis' },
                                                 { icon: Building2, label: 'Factura Local', sub: 'Impuesto incluido' },
                                          ].map((item, i) => (
                                                 <div key={i} className="flex flex-col items-center gap-3 group">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all border border-transparent group-hover:border-emerald-500/20">
                                                               <item.icon size={24} />
                                                        </div>
                                                        <div className="space-y-1">
                                                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{item.label}</p>
                                                               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.sub}</p>
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            </motion.div>
                     </div>
              </section>
       )
}
