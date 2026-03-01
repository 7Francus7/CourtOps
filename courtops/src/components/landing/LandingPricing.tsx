'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, Shield, Zap, ArrowRight, Building2, Crown, Star, Infinity as InfinityIcon, Lock, Globe } from 'lucide-react'
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

const Meteor = ({ delay, color }: { delay: number; color: string }) => (
       <motion.div
              initial={{ x: '100%', y: '-10%', opacity: 0 }}
              animate={{ x: '-100%', y: '100%', opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'linear' }}
              className={cn("absolute w-[1px] h-24 bg-gradient-to-b from-transparent to-transparent -rotate-45 pointer-events-none",
                     color === 'emerald' ? "via-emerald-400/50" : "via-primary/50"
              )}
       />
)

const PricingCard = ({ plan, billingCycle, idx }: PricingCardProps) => {
       const isYearly = billingCycle === 'yearly'
       const displayPrice = isYearly ? plan.monthlyPrice * 0.8 : plan.monthlyPrice

       const x = useMotionValue(0)
       const y = useMotionValue(0)

       const mouseX = useMotionValue(0)
       const mouseY = useMotionValue(0)

       const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
       const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

       function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
              const rect = event.currentTarget.getBoundingClientRect()
              const width = rect.width
              const height = rect.height
              const mouseXPos = event.clientX - rect.left
              const mouseYPos = event.clientY - rect.top
              const xPct = mouseXPos / width - 0.5
              const yPct = mouseYPos / height - 0.5
              x.set(xPct)
              y.set(yPct)
              mouseX.set(mouseXPos)
              mouseY.set(mouseYPos)
       }

       function handleMouseLeave() {
              x.set(0)
              y.set(0)
       }

       return (
              <motion.div
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                     onMouseMove={handleMouseMove}
                     onMouseLeave={handleMouseLeave}
                     style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                     }}
                     className={cn(
                            "relative group flex flex-col p-10 rounded-[3.5rem] border transition-all duration-700 h-full overflow-hidden",
                            plan.highlight
                                   ? "bg-[#050B14] border-emerald-500/30 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.15)] scale-[1.03] z-20"
                                   : "bg-white/[0.01] border-white/[0.05] backdrop-blur-3xl z-10 hover:border-white/10"
                     )}
              >
                     {/* 3D Content Wrapper */}
                     <div style={{ transform: "translateZ(50px)" }} className="relative z-10 h-full flex flex-col">

                            {/* Meteors for Highlighted Plan */}
                            {plan.highlight && (
                                   <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                          <Meteor delay={0} color="emerald" />
                                          <Meteor delay={2} color="emerald" />
                                          <Meteor delay={5} color="emerald" />
                                   </div>
                            )}

                            {/* Mouse Follow Glow */}
                            <motion.div
                                   className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                   style={{
                                          background: useSpring(
                                                 `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, ${plan.highlight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)'}, transparent 60%)`,
                                                 { stiffness: 500, damping: 50 }
                                          ) as any
                                   }}
                            />

                            {plan.highlight && (
                                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 group-hover:scale-110 transition-transform">
                                          <Sparkles size={12} className="fill-black" /> ¡Más Popular!
                                   </div>
                            )}

                            <div className="flex items-center gap-5 mb-12">
                                   <div className={cn(
                                          "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110 shadow-2xl",
                                          plan.highlight
                                                 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10"
                                                 : "bg-white/5 border-white/10 text-zinc-500 group-hover:text-white"
                                   )}>
                                          <plan.icon size={32} strokeWidth={1.5} />
                                   </div>
                                   <div>
                                          <h3 className="text-3xl font-black text-white tracking-widest uppercase italic leading-none mb-2">{plan.name}</h3>
                                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">{plan.description}</p>
                                   </div>
                            </div>

                            <div className="mb-12">
                                   <div className="flex items-baseline gap-2">
                                          <span className="text-zinc-600 text-3xl font-black">$</span>
                                          <motion.span
                                                 key={displayPrice}
                                                 initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                                 animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                                 transition={{ duration: 0.5 }}
                                                 className="text-7xl font-black text-white tracking-tighter tabular-nums"
                                          >
                                                 {new Intl.NumberFormat('es-AR').format(displayPrice)}
                                          </motion.span>
                                          <span className="text-zinc-600 font-bold text-sm uppercase tracking-widest">/mes</span>
                                   </div>

                                   <AnimatePresence>
                                          {isYearly && (
                                                 <motion.div
                                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                                        className="overflow-hidden"
                                                 >
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-4">
                                                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                               <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">Facturación Anual (-20%)</span>
                                                        </div>
                                                 </motion.div>
                                          )}
                                   </AnimatePresence>
                            </div>

                            <div className="space-y-6 mb-12 flex-1">
                                   {plan.features.map((f, i) => (
                                          <motion.div
                                                 key={i}
                                                 initial={{ opacity: 0, x: -10 }}
                                                 whileInView={{ opacity: 1, x: 0 }}
                                                 transition={{ delay: 0.5 + (i * 0.1) }}
                                                 className="flex items-center gap-4 text-zinc-500 group-hover:text-zinc-300 transition-colors"
                                          >
                                                 <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:rotate-12",
                                                        plan.highlight ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-white/20 group-hover:text-white/60"
                                                 )}>
                                                        <Check size={12} strokeWidth={4} />
                                                 </div>
                                                 <span className="text-xs font-black tracking-widest uppercase">{f}</span>
                                          </motion.div>
                                   ))}
                            </div>

                            <button className={cn(
                                   "w-full py-6 rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] transition-all duration-500 group/btn relative overflow-hidden active:scale-95",
                                   plan.highlight
                                          ? "bg-emerald-500 text-black shadow-[0_20px_50px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.5)] hover:scale-[1.02]"
                                          : "bg-white text-black hover:bg-zinc-200"
                            )}>
                                   <span className="relative z-10 flex items-center justify-center gap-3">
                                          Comenzar Prueba <ArrowRight size={16} className="group-hover/btn:translate-x-3 transition-transform duration-500" />
                                   </span>
                                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                     </div>

                     {/* Premium Corner Decoration */}
                     <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-white/[0.02] rounded-full blur-[60px] pointer-events-none" />
              </motion.div>
       )
}

export default function LandingPricing() {
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const plans = [
              {
                     name: 'Inicial',
                     monthlyPrice: 45000,
                     description: 'Para clubes emergentes',
                     features: ['Hasta 2 Canchas', 'Agenda Inteligente', 'Panel de Control', 'Reportes Básicos', 'Soporte Estándar'],
                     highlight: false,
                     icon: Zap,
                     color: 'white'
              },
              {
                     name: 'Profesional',
                     monthlyPrice: 85000,
                     description: 'Potencia total para tu club',
                     features: ['Canchas Ilimitadas', 'Kiosco & Inventario', 'Gestión de Torneos', 'Marketing Tools', 'WhatsApp Integration'],
                     highlight: true,
                     icon: Crown,
                     color: 'emerald'
              },
              {
                     name: 'Empresarial',
                     monthlyPrice: 150000,
                     description: 'Gestión multisede premium',
                     features: ['Multi-Club Hub', 'Full API Access', 'Branding Blanco', 'Prioridad de Soporte', 'SLA Garantizado'],
                     highlight: false,
                     icon: Building2,
                     color: 'white'
              },
       ]

       return (
              <section className="py-32 px-4 md:px-12 bg-black relative overflow-hidden" id="pricing">
                     {/* Cinematic Background Atmosphere */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#0a192f_0%,_transparent_50%)] opacity-40 pointer-events-none" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[800px] bg-emerald-500/[0.03] rounded-full blur-[200px] pointer-events-none" />
                     <div className="absolute inset-0 noise z-0 opacity-[0.02]" />

                     <div className="max-w-7xl mx-auto relative z-10">
                            <motion.div
                                   initial={{ opacity: 0, y: 30 }}
                                   whileInView={{ opacity: 1, y: 0 }}
                                   viewport={{ once: true }}
                                   className="text-center mb-32"
                            >
                                   <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
                                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Ingeniería de Precios
                                   </div>

                                   <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic">
                                          Elige tu <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-500">Nivel de Élite.</span>
                                   </h2>

                                   {/* Billing Toggle - Premium Engineering */}
                                   <div className="flex flex-col items-center gap-6 mt-16 group">
                                          <div className="flex items-center gap-8 bg-white/[0.03] border border-white/5 p-2 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                                                 <button
                                                        onClick={() => setBillingCycle('monthly')}
                                                        className={cn(
                                                               "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative",
                                                               billingCycle === 'monthly' ? "text-black" : "text-zinc-500 hover:text-white"
                                                        )}
                                                 >
                                                        {billingCycle === 'monthly' && (
                                                               <motion.div layoutId="toggle-bg" className="absolute inset-0 bg-white rounded-[1.5rem]" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                                                        )}
                                                        <span className="relative z-10">Mensual</span>
                                                 </button>
                                                 <button
                                                        onClick={() => setBillingCycle('yearly')}
                                                        className={cn(
                                                               "px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 relative",
                                                               billingCycle === 'yearly' ? "text-black" : "text-zinc-500 hover:text-white"
                                                        )}
                                                 >
                                                        {billingCycle === 'yearly' && (
                                                               <motion.div layoutId="toggle-bg" className="absolute inset-0 bg-white rounded-[1.5rem]" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                                                        )}
                                                        <span className="relative z-10">Anual</span>
                                                 </button>
                                          </div>

                                          <AnimatePresence>
                                                 {billingCycle === 'yearly' && (
                                                        <motion.p
                                                               initial={{ opacity: 0, y: -10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse"
                                                        >
                                                               Ahorro Directo del 20% Aplicado
                                                        </motion.p>
                                                 )}
                                          </AnimatePresence>
                                   </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-stretch px-4">
                                   {plans.map((plan, i) => (
                                          <PricingCard key={i} plan={plan} billingCycle={billingCycle} idx={i} />
                                   ))}
                            </div>

                            {/* Trust Badge Grid */}
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   className="mt-40 grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-white/5 pt-20"
                            >
                                   {[
                                          { icon: Shield, title: 'Seguridad Militar', sub: 'Encriptación SSL 256-bit' },
                                          { icon: Zap, title: 'Activación Real-Time', sub: 'Tu club listo en minutos' },
                                          { icon: InfinityIcon, title: 'Sin Fronteras', sub: 'Módulos nuevos incluidos' },
                                          { icon: Lock, title: 'Transparencia Total', sub: 'Sin letras pequeñas' },
                                   ].map((item, i) => (
                                          <div key={i} className="flex flex-col items-center text-center gap-4 group">
                                                 <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all duration-500">
                                                        <item.icon size={28} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-emerald-400 transition-colors">{item.title}</p>
                                                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1 opacity-60">{item.sub}</p>
                                                 </div>
                                          </div>
                                   ))}
                            </motion.div>
                     </div>
              </section>
       )
}
