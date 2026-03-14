'use client'

import React, { useState } from 'react'
import { Check, Loader2, Sparkles, Shield, Zap, AlertTriangle, ArrowRight, Crown, Rocket, Building2, Star } from 'lucide-react'
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
              } catch {
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
              }).format(price).replace(/\s/g, '')
       }

       const isPlanActive = (planId: string) => currentPlan?.id === planId && subscriptionStatus?.toLowerCase() !== 'cancelled' && subscriptionStatus !== 'CANCELLED_PENDING'

       const getPlanMetadata = (name: string) => {
              const n = name.toLowerCase()
              if (n.includes('inicial')) return {
                     description: 'Ideal para clubes pequeños que comienzan su digitalización.',
                     icon: <Rocket size={18} strokeWidth={2.5} />,
                     highlight: false,
                     includesFrom: null,
                     accent: {
                            gradient: 'from-sky-500 to-blue-600',
                            text: 'text-sky-400',
                            bg: 'bg-sky-500',
                            bgSoft: 'bg-sky-500/10',
                            border: 'border-sky-500/20',
                            glow: '0 0 60px -15px rgba(56,189,248,0.3)',
                            ring: 'ring-sky-500/10',
                     }
              }
              if (n.includes('profesional')) return {
                     description: 'Potencia total con Kiosco y Torneos. La preferida por los líderes.',
                     icon: <Zap size={18} strokeWidth={2.5} />,
                     highlight: true,
                     includesFrom: 'Inicial',
                     accent: {
                            gradient: 'from-emerald-400 to-teal-500',
                            text: 'text-emerald-400',
                            bg: 'bg-emerald-500',
                            bgSoft: 'bg-emerald-500/10',
                            border: 'border-emerald-500/30',
                            glow: '0 0 80px -15px rgba(16,185,129,0.4)',
                            ring: 'ring-emerald-500/20',
                     }
              }
              if (n.includes('empresarial')) return {
                     description: 'Soporte dedicado y arquitectura escalable para grandes complejos.',
                     icon: <Building2 size={18} strokeWidth={2.5} />,
                     highlight: false,
                     includesFrom: 'Profesional',
                     accent: {
                            gradient: 'from-violet-500 to-purple-600',
                            text: 'text-violet-400',
                            bg: 'bg-violet-500',
                            bgSoft: 'bg-violet-500/10',
                            border: 'border-violet-500/20',
                            glow: '0 0 60px -15px rgba(139,92,246,0.3)',
                            ring: 'ring-violet-500/10',
                     }
              }
              return {
                     description: '', icon: <Zap size={18} />, highlight: false, includesFrom: null,
                     accent: { gradient: 'from-slate-500 to-slate-600', text: 'text-slate-400', bg: 'bg-slate-500', bgSoft: 'bg-slate-500/10', border: 'border-slate-500/20', glow: 'none', ring: 'ring-slate-500/10' }
              }
       }

       const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)
       const isYearly = billingCycle === 'yearly'

       return (
              <div className="space-y-10 relative pb-12">
                     {/* Ambient glows */}
                     <div className="absolute -top-40 left-1/4 w-[600px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[150px] pointer-events-none" />
                     <div className="absolute -top-20 right-1/4 w-[400px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

                     {/* Alerts */}
                     <AnimatePresence>
                            {!isConfigured && (
                                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                          className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                                          <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="text-red-500 w-5 h-5" /></div>
                                          <div>
                                                 <h4 className="text-red-400 font-bold text-sm">Configuración Incompleta</h4>
                                                 <p className="text-red-400/60 text-xs mt-0.5">El sistema de pagos no está configurado.</p>
                                          </div>
                                   </motion.div>
                            )}
                            {isDevMode && (
                                   <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                          className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                                          <div className="p-2 bg-amber-500/10 rounded-lg"><Shield className="text-amber-500 w-5 h-5" /></div>
                                          <div>
                                                 <h4 className="text-amber-400 font-bold text-sm">Modo Desarrollo</h4>
                                                 <p className="text-amber-400/60 text-xs mt-0.5">No se realizarán cargos reales.</p>
                                          </div>
                                   </motion.div>
                            )}
                     </AnimatePresence>

                     {/* Billing Toggle */}
                     <div className="flex items-center justify-center gap-4 select-none relative z-20">
                            <span onClick={() => setBillingCycle('monthly')}
                                   className={cn("text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer transition-colors", billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground/70")}>
                                   Mensual
                            </span>

                            <button onClick={() => setBillingCycle(p => p === 'monthly' ? 'yearly' : 'monthly')}
                                   className={cn("relative w-12 h-6 rounded-full transition-all duration-500 focus:outline-none",
                                          billingCycle === 'yearly' ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_24px_rgba(16,185,129,0.35)]" : "bg-muted/80 border border-border/80")}>
                                   <motion.div layout transition={{ type: "spring", stiffness: 600, damping: 28 }}
                                          className={cn("w-5 h-5 rounded-full shadow-md absolute top-0.5",
                                                 billingCycle === 'yearly' ? "bg-white left-[calc(100%-22px)]" : "bg-white dark:bg-zinc-200 left-0.5")} />
                            </button>

                            <div className="flex items-center gap-2">
                                   <span onClick={() => setBillingCycle('yearly')}
                                          className={cn("text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer transition-colors", billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground/70")}>
                                          Anual
                                   </span>
                                   <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-emerald-500/25">
                                          -20%
                                   </span>
                            </div>
                     </div>

                     {/* Plans Grid */}
                     <div className="grid lg:grid-cols-3 gap-5 items-start relative z-10">
                            {sortedPlans.map((plan, idx) => {
                                   const meta = getPlanMetadata(plan.name)
                                   const isCurrent = isPlanActive(plan.id)
                                   const basePrice = plan.price
                                   const displayPrice = isYearly ? basePrice * 0.8 : basePrice
                                   const { accent } = meta

                                   return (
                                          <motion.div
                                                 key={plan.id}
                                                 initial={{ opacity: 0, y: 24 }}
                                                 whileInView={{ opacity: 1, y: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                                                 className={cn(
                                                        "relative flex flex-col rounded-[1.75rem] transition-all duration-500 group overflow-visible",
                                                        meta.highlight && "lg:scale-[1.03] z-10",
                                                        isCurrent
                                                               ? cn("border-2", accent.border, "shadow-2xl", `ring-2 ${accent.ring}`)
                                                               : meta.highlight
                                                                      ? cn("border", accent.border, "shadow-xl hover:shadow-2xl hover:-translate-y-1")
                                                                      : "border border-border/40 hover:border-border/80 hover:-translate-y-0.5 hover:shadow-lg"
                                                 )}
                                                 style={{ boxShadow: (isCurrent || meta.highlight) ? accent.glow : undefined }}
                                          >
                                                 {/* Inner card bg with refined premium gradients */}
                                                 <div className="absolute inset-0 rounded-[1.75rem] bg-card overflow-hidden">
                                                        {/* Base ambient gradient */}
                                                        <div className={cn(
                                                               "absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity duration-700",
                                                               accent.gradient,
                                                               (meta.highlight || isCurrent) ? "opacity-[0.1]" : "group-hover:opacity-[0.06]"
                                                        )} />
                                                        
                                                        {/* Spotlight behind Icon Area */}
                                                        <div className={cn(
                                                               "absolute top-8 left-10 w-32 h-32 rounded-full blur-[40px] opacity-0 transition-opacity duration-700",
                                                               accent.bg,
                                                               (meta.highlight || isCurrent) ? "opacity-[0.15]" : "group-hover:opacity-[0.08]"
                                                        )} />

                                                        {/* Top Spotlight effect */}
                                                        <div className={cn(
                                                               "absolute top-0 left-0 right-0 h-48 bg-[radial-gradient(circle_at_50%_0%,var(--tw-gradient-from),transparent_70%)] opacity-0 transition-opacity duration-700",
                                                               (meta.highlight || isCurrent) ? "opacity-[0.2]" : "group-hover:opacity-[0.1]"
                                                        )} 
                                                        style={{ 
                                                               backgroundImage: `radial-gradient(circle at 50% 0%, ${meta.accent.bg.replace('bg-', '') === 'sky-500' ? '#0ea5e9' : meta.accent.bg.replace('bg-', '') === 'emerald-500' ? '#10b981' : '#8b5cf6'}30, transparent 70%)` 
                                                        }} />

                                                        {/* Bottom corner glow */}
                                                        <div className={cn(
                                                               "absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-0 transition-opacity duration-700",
                                                               accent.bg,
                                                               (meta.highlight || isCurrent) ? "opacity-[0.1]" : "group-hover:opacity-[0.05]"
                                                        )} />
                                                 </div>

                                                 {/* Top accent: Sophisticated "Glow Line" */}
                                                 <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden rounded-t-[1.75rem] z-20">
                                                        <div className={cn(
                                                               "h-full w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-all duration-500 scale-x-90 group-hover:scale-x-100",
                                                               accent.text,
                                                               (meta.highlight || isCurrent) ? "opacity-60 scale-x-100" : "group-hover:opacity-30"
                                                        )} />
                                                 </div>
                                                 
                                                 {/* Outer Top Blur Glow */}
                                                 {(meta.highlight || isCurrent) && (
                                                        <div className={cn(
                                                               "absolute -top-1 left-[20%] right-[20%] h-4 rounded-full blur-[12px] opacity-30 z-10",
                                                               accent.bg
                                                        )} />
                                                 )}
                                                 
                                                 {(meta.highlight || isCurrent) && (
                                                        <div className={cn(
                                                               "absolute -top-[1px] left-[15%] right-[15%] h-[2px] rounded-full blur-[2px] opacity-80 z-20",
                                                               accent.bg
                                                        )} />
                                                 )}

                                                 {/* Badge: Más Popular */}
                                                 {meta.highlight && !isCurrent && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                                                               <div className={cn("bg-gradient-to-r text-white font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 ring-[3px] ring-background", accent.gradient)}>
                                                                      <Star size={10} fill="currentColor" /> Más Popular
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* Badge: Tu Plan */}
                                                 {isCurrent && (
                                                        <div className="absolute -top-3 right-5 z-30">
                                                               <div className={cn("bg-gradient-to-r text-white font-black text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 ring-[3px] ring-background", accent.gradient)}>
                                                                      <Check size={10} strokeWidth={4} /> Tu Plan
                                                               </div>
                                                        </div>
                                                 )}

                                                 {/* Content */}
                                                 <div className={cn("relative p-7 sm:p-8 flex flex-col h-full", meta.highlight && !isCurrent && "pt-9")}>

                                                        {/* Plan name + icon */}
                                                        <div className="flex items-center gap-3 mb-6">
                                                               <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", accent.bgSoft, accent.text)}>
                                                                      {meta.icon}
                                                               </div>
                                                               <h3 className="text-lg font-black text-foreground tracking-tight">{plan.name}</h3>
                                                        </div>

                                                        {/* Price block */}
                                                        <div className="mb-5">
                                                               <div className="flex items-end gap-1">
                                                                      <AnimatePresence mode="wait">
                                                                             <motion.span
                                                                                    key={displayPrice}
                                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    exit={{ opacity: 0, scale: 1.05 }}
                                                                                    transition={{ duration: 0.25 }}
                                                                                    className="text-[2.5rem] sm:text-[2.75rem] font-black text-foreground tracking-tight tabular-nums leading-none"
                                                                             >
                                                                                    {formatPrice(displayPrice)}
                                                                             </motion.span>
                                                                      </AnimatePresence>
                                                                      <span className="text-muted-foreground/40 font-bold text-sm mb-1.5">/mes</span>
                                                               </div>

                                                               <AnimatePresence>
                                                                      {isYearly && (
                                                                             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                                                    <div className="flex items-center gap-2 mt-2">
                                                                                           <span className="text-xs text-muted-foreground/40 line-through tabular-nums">{formatPrice(basePrice)}</span>
                                                                                           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                                                                  Ahorrás {formatPrice(basePrice * 12 * 0.2)}/año
                                                                                           </span>
                                                                                    </div>
                                                                                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                                                                           Pago anual: <span className="font-semibold text-foreground/60">{formatPrice(displayPrice * 12)}</span>
                                                                                    </p>
                                                                             </motion.div>
                                                                      )}
                                                               </AnimatePresence>
                                                        </div>

                                                        <p className="text-[13px] text-muted-foreground/70 leading-relaxed mb-7">{meta.description}</p>

                                                        {/* Divider */}
                                                        <div className={cn("h-px mb-6 bg-gradient-to-r from-transparent via-border/60 to-transparent")} />

                                                        {/* Features */}
                                                        <div className="flex-1 mb-7">
                                                               {meta.includesFrom && (
                                                                      <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mb-3.5">
                                                                             Todo de {meta.includesFrom}, más:
                                                                      </p>
                                                               )}
                                                               <ul className="space-y-3">
                                                                      {plan.features.map((feature, i) => (
                                                                             <motion.li
                                                                                    key={i}
                                                                                    initial={{ opacity: 0, x: -8 }}
                                                                                    whileInView={{ opacity: 1, x: 0 }}
                                                                                    viewport={{ once: true }}
                                                                                    transition={{ delay: idx * 0.1 + i * 0.04, duration: 0.3 }}
                                                                                    className="flex items-center gap-2.5 text-[13px]"
                                                                             >
                                                                                    <div className={cn(
                                                                                           "w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0",
                                                                                           (isCurrent || meta.highlight)
                                                                                                  ? cn("bg-gradient-to-br text-white shadow-sm", accent.gradient)
                                                                                                  : cn(accent.bgSoft, accent.text)
                                                                                    )}>
                                                                                           <Check size={10} strokeWidth={3.5} />
                                                                                    </div>
                                                                                    <span className="text-foreground/75 font-medium group-hover:text-foreground/90 transition-colors">{feature}</span>
                                                                             </motion.li>
                                                                      ))}
                                                               </ul>
                                                        </div>

                                                        {/* CTA */}
                                                        <button
                                                               onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                               disabled={isCurrent || !!loadingId || !isConfigured}
                                                               className={cn(
                                                                      "w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2",
                                                                      isCurrent
                                                                             ? cn("border-2", accent.border, accent.text, "bg-transparent cursor-default")
                                                                             : meta.highlight
                                                                                    ? cn("bg-gradient-to-r text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0", accent.gradient, `shadow-emerald-500/20 hover:shadow-emerald-500/30`)
                                                                                    : "bg-foreground/[0.06] text-foreground/80 border border-border/60 hover:bg-foreground/[0.1] hover:border-foreground/20 hover:text-foreground active:scale-[0.98]"
                                                               )}
                                                        >
                                                               {loadingId === plan.id ? (
                                                                      <Loader2 className="w-4 h-4 animate-spin" />
                                                               ) : isCurrent ? (
                                                                      <><Check size={13} strokeWidth={3} /> Plan Actual</>
                                                               ) : (
                                                                      <><span>Elegir Plan</span><ArrowRight size={13} strokeWidth={3} /></>
                                                               )}
                                                        </button>
                                                 </div>
                                          </motion.div>
                                   )
                            })}
                     </div>

                     {/* Subscription footer */}
                     {currentPlan && subscriptionStatus?.toLowerCase() !== 'cancelled' && subscriptionStatus !== 'CANCELLED_PENDING' && (
                            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                                   className="mt-14 pt-8 border-t border-border/30">
                                   <div className="flex flex-col sm:flex-row items-center justify-between gap-5 max-w-2xl mx-auto">
                                          <div className="flex items-center gap-3">
                                                 <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                        <Crown className="text-emerald-400 w-4 h-4" />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.2em]">Suscripción Activa</p>
                                                        <p className="text-xs text-foreground/60">
                                                               Próximo cargo: <span className="font-bold text-foreground/80">{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                                        </p>
                                                 </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                                 <button onClick={() => window.open('https://wa.me/5493524421497', '_blank')}
                                                        className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-[0.15em] transition-colors flex items-center gap-1">
                                                        Soporte <ArrowRight size={10} className="-rotate-45" />
                                                 </button>
                                                 <div className="w-px h-4 bg-border/40" />
                                                 <button onClick={handleCancel} disabled={!!loadingId}
                                                        className="text-[10px] font-bold text-muted-foreground/30 hover:text-red-400 uppercase tracking-[0.15em] transition-colors flex items-center gap-1">
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
