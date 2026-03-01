'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, ArrowRight, Building2, Crown, Sparkles, Shield, Lock, Infinity as InfinityIcon } from 'lucide-react'
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

       return (
              <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.1, duration: 0.8 }}
                     className={cn(
                            "relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 h-full",
                            plan.highlight
                                   ? "bg-white/[0.03] border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.1)] z-10"
                                   : "bg-white/[0.01] border-white/5 hover:border-white/10"
                     )}
              >
                     <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-10">
                                   <div className={cn(
                                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                          plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-zinc-500"
                                   )}>
                                          <plan.icon size={24} />
                                   </div>
                                   <div>
                                          <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">{plan.name}</h3>
                                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{plan.description}</p>
                                   </div>
                            </div>

                            <div className="mb-10">
                                   <div className="flex items-baseline gap-2">
                                          <span className="text-zinc-600 text-2xl font-black">$</span>
                                          <span className="text-6xl font-black text-white tracking-tighter tabular-nums">
                                                 {new Intl.NumberFormat('es-AR').format(displayPrice)}
                                          </span>
                                          <span className="text-zinc-600 font-bold text-xs uppercase tracking-widest">/mes</span>
                                   </div>
                            </div>

                            <div className="space-y-4 mb-12 flex-1">
                                   {plan.features.map((f, i) => (
                                          <div key={i} className="flex items-center gap-3 text-zinc-400">
                                                 <div className={cn(
                                                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border",
                                                        plan.highlight ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-zinc-700"
                                                 )}>
                                                        <Check size={10} strokeWidth={4} />
                                                 </div>
                                                 <span className="text-xs font-bold tracking-wide uppercase">{f}</span>
                                          </div>
                                   ))}
                            </div>

                            <button className={cn(
                                   "w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95",
                                   plan.highlight
                                          ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                                          : "bg-white text-black hover:bg-zinc-200"
                            )}>
                                   <span className="flex items-center justify-center gap-2">
                                          Elegir {plan.name} <ArrowRight size={14} />
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
                     description: 'Clubes en crecimiento',
                     features: ['2 Canchas', 'Gestión Pro', 'Caja Básica', 'Soporte App'],
                     highlight: false,
                     icon: Zap,
                     color: 'white'
              },
              {
                     name: 'Élite',
                     monthlyPrice: 85000,
                     description: 'Máxima productividad',
                     features: ['Ilimitadas', 'Kiosco Integrado', 'Torneos Live', 'WhatsApp Bot', 'Analytics'],
                     highlight: true,
                     icon: Crown,
                     color: 'emerald'
              },
              {
                     name: 'VIP',
                     monthlyPrice: 150000,
                     description: 'Gestión multisede',
                     features: ['Multi-Club', 'API Full', 'Marca Blanca', 'Account Mgr', 'SLA 99.9%'],
                     highlight: false,
                     icon: Building2,
                     color: 'white'
              },
       ]

       return (
              <section className="py-24 px-4 md:px-12 bg-black relative" id="pricing">
                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="text-center mb-24">
                                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                                          <Sparkles size={10} className="fill-emerald-500" /> Precios Claros
                                   </div>
                                   <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic mb-12">
                                          Simplicidad <br />
                                          <span className="text-emerald-500">Sin Comisiones.</span>
                                   </h2>

                                   {/* Billing Toggle - Minimalist */}
                                   <div className="flex items-center justify-center gap-6 mt-12 bg-white/[0.03] w-fit mx-auto p-1.5 rounded-2xl border border-white/5">
                                          <button
                                                 onClick={() => setBillingCycle('monthly')}
                                                 className={cn(
                                                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        billingCycle === 'monthly' ? "bg-white text-black" : "text-zinc-500"
                                                 )}
                                          >
                                                 Mensual
                                          </button>
                                          <button
                                                 onClick={() => setBillingCycle('yearly')}
                                                 className={cn(
                                                        "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        billingCycle === 'yearly' ? "bg-white text-black" : "text-zinc-500"
                                                 )}
                                          >
                                                 Anual
                                          </button>
                                   </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                                   {plans.map((plan, i) => (
                                          <PricingCard key={i} plan={plan} billingCycle={billingCycle} idx={i} />
                                   ))}
                            </div>

                            <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/5 pt-16 opacity-50">
                                   {[
                                          { icon: Shield, title: 'Seguro', sub: 'SSL 256-bit' },
                                          { icon: Zap, title: 'Rápido', sub: 'Setup en minutos' },
                                          { icon: InfinityIcon, title: 'Libre', sub: 'Sin permanencia' },
                                          { icon: Lock, title: 'Privado', sub: 'Datos protegidos' },
                                   ].map((item, i) => (
                                          <div key={i} className="flex flex-col items-center text-center gap-2">
                                                 <item.icon size={20} className="text-zinc-500" />
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-white">{item.title}</p>
                                          </div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
