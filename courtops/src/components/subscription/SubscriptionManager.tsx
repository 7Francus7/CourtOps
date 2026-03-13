'use client'

import React, { useState } from 'react'
import { Check, Loader2, Sparkles, Shield, Zap, AlertTriangle, ArrowRight, Crown, Rocket, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription } from '@/actions/subscription'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'

interface Plan {
       id: string
       name: string
       price: number
       features: string[]
}

interface SubscriptionManagerProps {
       currentPlan: any
       subscriptionStatus: string | null
       nextBillingDate: Date | string | null
       availablePlans: Plan[]
       isConfigured: boolean
       isDevMode?: boolean
}

export default function SubscriptionManager({
       currentPlan,
       subscriptionStatus,
       nextBillingDate,
       availablePlans,
       isConfigured,
       isDevMode = false
}: SubscriptionManagerProps) {
       const router = useRouter()
       const confirm = useConfirmation()
       const [loadingId, setLoadingId] = useState<string | null>(null)
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const handleSubscribe = async (planId: string) => {
              if (!isConfigured) {
                     toast.error("El sistema de pagos no está configurado.")
                     return
              }
              try {
                     setLoadingId(planId)
                     const res = await initiateSubscription(planId, billingCycle)

                     if (res.success && res.init_point) {
                            window.location.href = res.init_point
                     } else {
                            toast.error((res as any).error || "Error al iniciar suscripción")
                            setLoadingId(null)
                     }
              } catch (error) {
                     toast.error("Error al conectar con el servidor")
                     setLoadingId(null)
              }
       }

       const handleCancel = async () => {
              const ok = await confirm({
                     title: 'Cancelar suscripción',
                     description: '¿Estás seguro? Perderás acceso a las funciones premium al finalizar el período actual.',
                     confirmLabel: 'Cancelar suscripción',
                     variant: 'destructive'
              })
              if (!ok) return

              try {
                     setLoadingId("cancel")
                     const res = await cancelSubscription()
                     if (res.success) {
                            toast.success(res.message)
                            router.refresh()
                     } else {
                            toast.error("Error al cancelar")
                     }
              } finally {
                     setLoadingId(null)
              }
       }

       const formatPrice = (price: number) => {
              return new Intl.NumberFormat('es-AR', {
                     style: 'currency',
                     currency: 'ARS',
                     maximumFractionDigits: 0
              }).format(price)
       }

       const isPlanActive = (planId: string) => currentPlan?.id === planId && subscriptionStatus?.toLowerCase() !== 'cancelled' && subscriptionStatus !== 'CANCELLED_PENDING'

       const getPlanMetadata = (name: string, idx: number) => {
              const lowerName = name.toLowerCase()
              if (lowerName.includes('inicial')) return {
                     description: 'Ideal para clubes pequeños que recién comienzan su digitalización.',
                     icon: <Rocket size={20} />,
                     tier: 'starter' as const,
                     accentColor: 'blue',
                     gradientFrom: 'from-blue-500',
                     gradientTo: 'to-cyan-400',
                     glowColor: 'rgba(59, 130, 246, 0.15)',
                     iconBg: 'bg-blue-500/10 text-blue-500',
                     checkColor: 'from-blue-500 to-cyan-400',
                     checkBg: 'bg-blue-500/10 text-blue-500',
                     highlight: false,
                     includesFrom: null,
              }
              if (lowerName.includes('profesional')) return {
                     description: 'Potencia total con Kiosco y Torneos. La opción preferida por los líderes.',
                     icon: <Zap size={20} />,
                     tier: 'pro' as const,
                     accentColor: 'emerald',
                     gradientFrom: 'from-emerald-500',
                     gradientTo: 'to-teal-400',
                     glowColor: 'rgba(16, 185, 129, 0.2)',
                     iconBg: 'bg-emerald-500/10 text-emerald-500',
                     checkColor: 'from-emerald-500 to-teal-400',
                     checkBg: 'bg-emerald-500/10 text-emerald-500',
                     highlight: true,
                     includesFrom: 'Inicial',
              }
              if (lowerName.includes('empresarial')) return {
                     description: 'Arquitectura escalable y soporte dedicado para complejos de alto rendimiento.',
                     icon: <Building2 size={20} />,
                     tier: 'enterprise' as const,
                     accentColor: 'violet',
                     gradientFrom: 'from-violet-500',
                     gradientTo: 'to-purple-400',
                     glowColor: 'rgba(139, 92, 246, 0.15)',
                     iconBg: 'bg-violet-500/10 text-violet-500',
                     checkColor: 'from-violet-500 to-purple-400',
                     checkBg: 'bg-violet-500/10 text-violet-500',
                     highlight: false,
                     includesFrom: 'Profesional',
              }
              return {
                     description: 'Plan estándar',
                     icon: <Zap size={20} />,
                     tier: 'starter' as const,
                     accentColor: 'slate',
                     gradientFrom: 'from-slate-500',
                     gradientTo: 'to-slate-400',
                     glowColor: 'rgba(100, 116, 139, 0.1)',
                     iconBg: 'bg-slate-500/10 text-slate-500',
                     checkColor: 'from-slate-500 to-slate-400',
                     checkBg: 'bg-slate-500/10 text-slate-500',
                     highlight: false,
                     includesFrom: null,
              }
       }

       const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)
       const isYearly = billingCycle === 'yearly'

       return (
              <div className="space-y-8 relative pb-12">
                     {/* Ambient background */}
                     <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/[0.03] dark:bg-emerald-500/[0.07] rounded-[100%] blur-[120px] pointer-events-none" />

                     {/* Alerts */}
                     {!isConfigured && (
                            <motion.div
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md"
                            >
                                   <div className="p-2 bg-red-500/10 rounded-lg">
                                          <AlertTriangle className="text-red-500 w-5 h-5" />
                                   </div>
                                   <div className="flex-1">
                                          <h4 className="text-red-600 dark:text-red-400 font-bold text-sm">Configuración Incompleta</h4>
                                          <p className="text-red-600/70 dark:text-red-400/60 text-xs mt-0.5">El sistema de pagos no está configurado. Por favor, contacta a soporte.</p>
                                   </div>
                            </motion.div>
                     )}

                     {isDevMode && (
                            <motion.div
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md"
                            >
                                   <div className="p-2 bg-yellow-500/10 rounded-lg">
                                          <Shield className="text-yellow-500 w-5 h-5" />
                                   </div>
                                   <div className="flex-1">
                                          <h4 className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">Modo Desarrollo Activo</h4>
                                          <p className="text-yellow-600/70 dark:text-yellow-400/60 text-xs mt-0.5">Entorno de pruebas. No se realizarán cargos reales.</p>
                                   </div>
                            </motion.div>
                     )}

                     {/* Billing Cycle Toggle */}
                     <div className="flex items-center justify-center gap-5 select-none relative z-20 py-4">
                            <span
                                   className={cn(
                                          "text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer py-1",
                                          billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
                                   )}
                                   onClick={() => setBillingCycle('monthly')}
                            >
                                   Mensual
                            </span>

                            <button
                                   onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                   className={cn(
                                          "relative w-14 h-7 rounded-full p-0.5 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                                          billingCycle === 'yearly'
                                                 ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                 : "bg-muted border border-border"
                                   )}
                            >
                                   <motion.div
                                          layout
                                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                          className={cn(
                                                 "w-6 h-6 rounded-full shadow-md",
                                                 billingCycle === 'yearly'
                                                        ? "bg-white ml-auto"
                                                        : "bg-white dark:bg-zinc-300"
                                          )}
                                   />
                            </button>

                            <div className="flex items-center gap-2.5">
                                   <span
                                          className={cn(
                                                 "text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer py-1",
                                                 billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
                                          )}
                                          onClick={() => setBillingCycle('yearly')}
                                   >
                                          Anual
                                   </span>
                                   <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/20 tracking-tight">
                                          -20%
                                   </span>
                            </div>
                     </div>

                     {/* Plans Grid */}
                     <div className="grid lg:grid-cols-3 gap-6 lg:gap-5 items-start">
                            {sortedPlans.map((plan, idx) => {
                                   const meta = getPlanMetadata(plan.name, idx)
                                   const isCurrent = isPlanActive(plan.id)
                                   const basePrice = plan.price
                                   const displayPrice = isYearly ? basePrice * 0.8 : basePrice

                                   return (
                                          <motion.div
                                                 key={plan.id}
                                                 initial={{ opacity: 0, y: 30 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: idx * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                                 className={cn(
                                                        "relative flex flex-col rounded-3xl border transition-all duration-500 group overflow-visible",
                                                        meta.highlight && "lg:-mt-4 lg:mb-4",
                                                        isCurrent
                                                               ? "bg-card border-emerald-500/50 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/20"
                                                               : meta.highlight
                                                                      ? "bg-card border-emerald-500/30 shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(16,185,129,0.15)] hover:-translate-y-1.5"
                                                                      : "bg-card/60 border-border/60 hover:border-border hover:bg-card hover:-translate-y-1 hover:shadow-xl"
                                                 )}
                                          >
                                                 {/* Top accent line */}
                                                 <div className={cn(
                                                        "absolute top-0 inset-x-8 h-px bg-gradient-to-r opacity-0 transition-opacity duration-500",
                                                        meta.gradientFrom, meta.gradientTo,
                                                        (meta.highlight || isCurrent) ? "opacity-100 inset-x-0 h-0.5 rounded-t-3xl" : "group-hover:opacity-60"
                                                 )} />

                                                 {/* Badges */}
                                                 {meta.highlight && !isCurrent && (
                                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                                                               <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-[10px] uppercase tracking-[0.15em] px-5 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 ring-4 ring-background">
                                                                      <Sparkles size={12} /> Más Popular
                                                               </div>
                                                        </div>
                                                 )}

                                                 {isCurrent && (
                                                        <div className="absolute -top-3.5 right-6 z-30">
                                                               <div className="bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.15em] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 ring-4 ring-background">
                                                                      <Check size={12} strokeWidth={4} /> Tu Plan
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* Card content */}
                                                 <div className={cn("p-8 flex flex-col h-full", meta.highlight && "pt-10")}>

                                                        {/* Header */}
                                                        <div className="mb-8">
                                                               <div className="flex items-center gap-3 mb-5">
                                                                      <div className={cn("p-2.5 rounded-xl", meta.iconBg)}>
                                                                             {meta.icon}
                                                                      </div>
                                                                      <h3 className="text-xl font-black text-foreground tracking-tight">
                                                                             {plan.name}
                                                                      </h3>
                                                               </div>

                                                               {/* Price */}
                                                               <div className="mb-4">
                                                                      <div className="flex items-baseline gap-1.5">
                                                                             <AnimatePresence mode="wait">
                                                                                    <motion.span
                                                                                           key={displayPrice}
                                                                                           initial={{ opacity: 0, y: 10 }}
                                                                                           animate={{ opacity: 1, y: 0 }}
                                                                                           exit={{ opacity: 0, y: -10 }}
                                                                                           transition={{ duration: 0.3 }}
                                                                                           className="text-4xl xl:text-5xl font-black text-foreground tracking-tighter tabular-nums"
                                                                                    >
                                                                                           {formatPrice(displayPrice)}
                                                                                    </motion.span>
                                                                             </AnimatePresence>
                                                                             <span className="text-muted-foreground/60 font-bold text-base">/mes</span>
                                                                      </div>

                                                                      {/* Yearly details */}
                                                                      <AnimatePresence>
                                                                             {isYearly && (
                                                                                    <motion.div
                                                                                           initial={{ opacity: 0, height: 0 }}
                                                                                           animate={{ opacity: 1, height: 'auto' }}
                                                                                           exit={{ opacity: 0, height: 0 }}
                                                                                           className="overflow-hidden"
                                                                                    >
                                                                                           <div className="flex items-center gap-2.5 mt-2">
                                                                                                  <span className="text-sm text-muted-foreground/50 line-through tabular-nums">{formatPrice(basePrice)}</span>
                                                                                                  <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                                                                         Ahorrás {formatPrice(basePrice * 12 * 0.2)}/año
                                                                                                  </span>
                                                                                           </div>
                                                                                           <p className="text-xs text-muted-foreground/60 mt-1">
                                                                                                  Total anual: <span className="font-bold text-foreground/80">{formatPrice(displayPrice * 12)}</span>
                                                                                           </p>
                                                                                    </motion.div>
                                                                             )}
                                                                      </AnimatePresence>
                                                               </div>

                                                               <p className="text-sm text-muted-foreground leading-relaxed">
                                                                      {meta.description}
                                                               </p>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="w-full h-px bg-border/60 mb-7" />

                                                        {/* Features */}
                                                        <div className="flex-1 mb-8">
                                                               {meta.includesFrom && (
                                                                      <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-4">
                                                                             Todo de {meta.includesFrom}, más:
                                                                      </p>
                                                               )}
                                                               <ul className="space-y-3.5">
                                                                      {plan.features.map((feature, i) => (
                                                                             <li key={i} className="flex items-center gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                                                                    <div className={cn(
                                                                                           "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                                                                                           isCurrent || meta.highlight
                                                                                                  ? `bg-gradient-to-tr ${meta.checkColor} text-white shadow-sm`
                                                                                                  : meta.checkBg
                                                                                    )}>
                                                                                           <Check size={11} strokeWidth={3.5} />
                                                                                    </div>
                                                                                    <span className="font-medium">{feature}</span>
                                                                             </li>
                                                                      ))}
                                                               </ul>
                                                        </div>

                                                        {/* CTA Button */}
                                                        <button
                                                               onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                               disabled={isCurrent || !!loadingId || !isConfigured}
                                                               className={cn(
                                                                      "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2.5",
                                                                      isCurrent
                                                                             ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default"
                                                                             : meta.highlight
                                                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                                                                                    : "bg-foreground/[0.07] text-foreground border border-border hover:bg-foreground/[0.12] hover:border-foreground/20 active:scale-[0.98]"
                                                               )}
                                                        >
                                                               {loadingId === plan.id ? (
                                                                      <Loader2 className="w-4 h-4 animate-spin" />
                                                               ) : isCurrent ? (
                                                                      <>
                                                                             <Check size={14} strokeWidth={3} />
                                                                             <span>Plan Actual</span>
                                                                      </>
                                                               ) : (
                                                                      <>
                                                                             <span>Comenzar</span>
                                                                             <ArrowRight size={14} strokeWidth={3} />
                                                                      </>
                                                               )}
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   )
                            })}
                     </div>

                     {/* Active subscription footer */}
                     {currentPlan && subscriptionStatus?.toLowerCase() !== 'cancelled' && subscriptionStatus !== 'CANCELLED_PENDING' && (
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   className="mt-16 pt-10 border-t border-border/50"
                            >
                                   <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
                                          <div className="flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                        <Crown className="text-emerald-500 w-5 h-5" />
                                                 </div>
                                                 <div className="text-left">
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">Suscripción Activa</p>
                                                        <p className="text-sm text-foreground/70">
                                                               Próximo cargo: <span className="font-bold text-foreground">{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                                        </p>
                                                 </div>
                                          </div>

                                          <div className="flex items-center gap-5">
                                                 <button
                                                        onClick={() => window.open('https://wa.me/5493524421497', '_blank')}
                                                        className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-[0.15em] transition-colors flex items-center gap-1.5"
                                                 >
                                                        Soporte <ArrowRight size={12} className="-rotate-45" />
                                                 </button>
                                                 <div className="w-px h-5 bg-border" />
                                                 <button
                                                        onClick={handleCancel}
                                                        disabled={!!loadingId}
                                                        className="text-[10px] font-black text-muted-foreground/50 hover:text-red-500 uppercase tracking-[0.15em] transition-colors flex items-center gap-1.5"
                                                 >
                                                        {loadingId === 'cancel' && <Loader2 className="w-3 h-3 animate-spin" />}
                                                        Cancelar
                                                 </button>
                                          </div>
                                   </div>
                            </motion.div>
                     )}
              </div>
       )
}
