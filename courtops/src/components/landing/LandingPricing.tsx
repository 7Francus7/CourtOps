'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, ArrowRight, Building2, Crown, Sparkles, Shield, Lock, Infinity as InfinityIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

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
       const router = useRouter()
       const isYearly = billingCycle === 'yearly'
       const displayPrice = isYearly ? plan.monthlyPrice * 0.8 : plan.monthlyPrice

       return (
              <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.1, duration: 0.8 }}
                     className={cn(
                            "relative flex flex-col p-12 rounded-[3.5rem] border transition-all duration-700 h-full",
                            plan.highlight
                                   ? "bg-slate-950 text-white border-emerald-500/50 shadow-[0_40px_80px_-15px_rgba(16,185,129,0.3)] scale-105 z-10"
                                   : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-white/20"
                     )}
              >
                     {plan.highlight && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[10px] px-8 py-2 rounded-full uppercase tracking-[0.4em] shadow-2xl animate-pulse">
                                   Máximo Valor
                            </div>
                     )}

                     <div className="flex flex-col h-full">
                            <div className="flex items-center gap-6 mb-12">
                                   <div className={cn(
                                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all duration-700",
                                          plan.highlight ? "bg-emerald-500 text-white border-emerald-400/50" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 group-hover:text-emerald-500"
                                   )}>
                                          <plan.icon size={32} strokeWidth={1.5} />
                                   </div>
                                   <div>
                                          <h3 className={cn("text-3xl font-black tracking-tighter uppercase italic leading-none mb-1", plan.highlight ? "text-white" : "text-slate-950 dark:text-white")}>{plan.name}</h3>
                                          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">{plan.description}</p>
                                   </div>
                            </div>

                            <div className="mb-12">
                                   <div className="flex items-baseline gap-2">
                                          <span className="text-zinc-500 text-3xl font-black tracking-tighter">$</span>
                                          <span className={cn("text-[80px] font-black tracking-tighter tabular-nums leading-none", plan.highlight ? "text-white" : "text-slate-950 dark:text-white")}>
                                                 {new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(displayPrice / 1000)}k
                                          </span>
                                          <span className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">/mes</span>
                                   </div>
                            </div>

                            <div className="space-y-5 mb-16 flex-1">
                                   {plan.features.map((f, i) => (
                                          <div key={i} className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                                                 <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                                                        plan.highlight ? "bg-emerald-500 border-white/20 text-white" : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400"
                                                 )}>
                                                        <Check size={12} strokeWidth={4} />
                                                 </div>
                                                 <span className={cn("text-sm font-bold tracking-tight italic", plan.highlight ? "text-zinc-300" : "text-slate-600 dark:text-zinc-400")}>{f}</span>
                                          </div>
                                   ))}
                            </div>

                            <button
                                   onClick={() => router.push('/register')}
                                   className={cn(
                                          "w-full py-7 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl",
                                          plan.highlight
                                                 ? "bg-white text-black hover:bg-zinc-100"
                                                 : "bg-slate-950 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                                   )}>
                                   <span className="flex items-center justify-center gap-3">
                                          Elegir Plan {plan.name} <ArrowRight size={18} strokeWidth={3} />
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
                     features: ['Hasta 8 Canchas', 'Kiosco Integrado', 'Torneos Live', 'WhatsApp Bot', 'Analytics'],
                     highlight: true,
                     icon: Crown,
                     color: 'emerald'
              },
              {
                     name: 'VIP',
                     monthlyPrice: 150000,
                     description: 'Gestión multisede',
                     features: ['Canchas Ilimitadas', 'Multi-Club', 'API Full', 'Marca Blanca', 'Ejecutivo Dedicado'],
                     highlight: false,
                     icon: Building2,
                     color: 'white'
              },
       ]

       return (
              <section className="py-32 px-4 md:px-12 bg-white dark:bg-[#02040A] relative transition-colors duration-1000" id="pricing">
                     <div className="max-w-7xl mx-auto relative z-10">
                            <div className="text-center mb-32">
                                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl mb-10">
                                          <Sparkles size={12} className="fill-current" /> Planes Sin Comisiones
                                   </div>
                                   <h2 className="text-5xl md:text-8xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.85] uppercase italic mb-16">
                                          Inversión Clara. <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600 dark:from-emerald-400 dark:to-indigo-500">Escalabilidad Garantizada.</span>
                                   </h2>

                                   {/* Billing Toggle - High Performance Aesthetic */}
                                   <div className="flex items-center justify-center gap-4 bg-slate-100 dark:bg-white/[0.03] w-fit mx-auto p-2 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-inner">
                                          <button
                                                 onClick={() => setBillingCycle('monthly')}
                                                 className={cn(
                                                        "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                                        billingCycle === 'monthly' ? "bg-slate-950 dark:bg-white text-white dark:text-black shadow-2xl scale-105" : "text-zinc-500"
                                                 )}
                                          >
                                                 Mensual
                                          </button>
                                          <button
                                                 onClick={() => setBillingCycle('yearly')}
                                                 className={cn(
                                                        "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                                                        billingCycle === 'yearly' ? "bg-slate-950 dark:bg-white text-white dark:text-black shadow-2xl scale-105" : "text-zinc-500"
                                                 )}
                                          >
                                                 Anual
                                                 <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full">-20%</div>
                                          </button>
                                   </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-stretch">
                                   {plans.map((plan, i) => (
                                          <PricingCard key={i} plan={plan} billingCycle={billingCycle} idx={i} />
                                   ))}
                            </div>

                            {/* Verification Badges */}
                            <div className="mt-40 grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-slate-200 dark:border-white/5 pt-24">
                                   {[
                                          { icon: Shield, title: 'Standard de Seguridad', sub: 'SSL 256-bit AES' },
                                          { icon: Zap, title: 'Setup Instantáneo', sub: 'Listo en 5 minutos' },
                                          { icon: InfinityIcon, title: 'Sin Permanencia', sub: 'Cancela cuando quieras' },
                                          { icon: Lock, title: 'Datos Privados', sub: 'GDPR Compliance' },
                                   ].map((item, i) => (
                                          <div key={i} className="flex flex-col items-center text-center gap-4 group">
                                                 <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                        <item.icon size={24} strokeWidth={1.5} />
                                                 </div>
                                                 <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">{item.title}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{item.sub}</p>
                                                 </div>
                                          </div>
                                   ))}
                            </div>
                     </div>
              </section>
       )
}
