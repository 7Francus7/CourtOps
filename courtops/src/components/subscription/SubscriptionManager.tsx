'use client'

import React, { useState } from 'react'
import { Check, Loader2, Sparkles, Shield, Zap, AlertTriangle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription } from '@/actions/subscription'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
       const [loadingId, setLoadingId] = useState<string | null>(null)
       const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

       const handleSubscribe = async (planId: string) => {
              if (!isConfigured) {
                     toast.error("El sistema de pagos no está configurado.")
                     return
              }
              try {
                     setLoadingId(planId)
                     const res = await initiateSubscription(planId)

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
              if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a las funciones premium al finalizar el período actual.")) return

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

       const isPlanActive = (planId: string) => currentPlan?.id === planId && subscriptionStatus !== 'CANCELLED'

       // Helper to enrich plan data with UI props (icons, colors, descriptions)
       const getPlanMetadata = (name: string) => {
              const lowerName = name.toLowerCase()
              if (lowerName.includes('inicial')) return {
                     description: 'Ideal para clubes pequeños que recién comienzan su digitalización.',
                     color: 'blue',
                     highlight: false,
                     gradient: 'from-blue-500/10 to-transparent',
                     border: 'group-hover:border-blue-500/30'
              }
              if (lowerName.includes('profesional')) return {
                     description: 'Potencia total con Kiosco y Torneos. La opción preferida por los líderes.',
                     color: 'emerald',
                     highlight: true,
                     gradient: 'from-emerald-500/20 to-teal-500/5',
                     border: 'border-emerald-500/50'
              }
              if (lowerName.includes('empresarial')) return {
                     description: 'Arquitectura escalable y soporte dedicado para complejos de alto rendimiento.',
                     color: 'purple',
                     highlight: false,
                     gradient: 'from-purple-500/10 to-transparent',
                     border: 'group-hover:border-purple-500/30'
              }
              return { description: 'Plan estándar', color: 'slate', highlight: false, gradient: '', border: '' }
       }

       const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)

       return (
              <div className="space-y-12 relative pb-12">
                     {/* Cinematic Background Atmosphere - Subtle and sophisticated */}
                     <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[100%] blur-[100px] pointer-events-none mix-blend-screen" />
                     <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

                     {/* Dev/Config Warnings - More polished styles */}
                     {!isConfigured && (
                            <motion.div
                                   initial={{ opacity: 0, y: -10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 mb-8 backdrop-blur-md"
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
                                   className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl flex items-center gap-4 mb-8 backdrop-blur-md"
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

                     {/* Billing Cycle Toggle (Premium Glassmorphism) */}
                     <div className="flex items-center justify-center gap-6 mt-8 mb-12 select-none relative z-20">
                            <span
                                   className={cn(
                                          "text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                                          billingCycle === 'monthly' ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                                   )}
                                   onClick={() => setBillingCycle('monthly')}
                            >
                                   Mensual
                            </span>

                            <button
                                   onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                   className="relative w-16 h-8 bg-slate-200 dark:bg-white/10 rounded-full p-1 border border-slate-300 dark:border-white/10 transition-all hover:bg-emerald-500/10 focus:outline-none shadow-inner group"
                            >
                                   <div className={cn(
                                          "w-6 h-6 bg-white dark:bg-emerald-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-500 cubic-bezier(0.16,1,0.3,1)",
                                          billingCycle === 'yearly' ? "translate-x-8" : "translate-x-0"
                                   )} />
                            </button>

                            <div className="flex items-center gap-3">
                                   <span
                                          className={cn(
                                                 "text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
                                                 billingCycle === 'yearly' ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                                          )}
                                          onClick={() => setBillingCycle('yearly')}
                                   >
                                          Anual
                                   </span>
                                   <motion.div
                                          animate={{ scale: [1, 1.05, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                          className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] tracking-tighter"
                                   >
                                          20% OFF
                                   </motion.div>
                            </div>
                     </div>

                     {/* Plans Grid */}
                     <div className="grid lg:grid-cols-3 gap-8 perspective-[2000px]">
                            {sortedPlans.map((plan, idx) => {
                                   const { description, highlight, color, gradient, border } = getPlanMetadata(plan.name)
                                   const isCurrent = isPlanActive(plan.id)
                                   const basePrice = plan.price
                                   const displayPrice = billingCycle === 'monthly' ? basePrice : basePrice * 0.8
                                   const isYearly = billingCycle === 'yearly'

                                   return (
                                          <motion.div
                                                 key={plan.id}
                                                 initial={{ opacity: 0, y: 40, rotateX: 10 }}
                                                 whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                                 viewport={{ once: true }}
                                                 transition={{ delay: idx * 0.1, duration: 0.8, ease: "easeOut" }}
                                                 className={cn(
                                                        "relative flex flex-col p-8 xl:p-10 rounded-[2.5rem] border transition-all duration-500 group overflow-visible h-full",
                                                        isCurrent
                                                               ? "bg-white dark:bg-[#0A101A] border-emerald-500/60 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.15)] z-20 ring-4 ring-emerald-500/5"
                                                               : highlight
                                                                      ? "bg-white dark:bg-[#0A101A] border-emerald-500/40 shadow-2xl hover:shadow-emerald-500/10 z-10 hover:-translate-y-2"
                                                                      : "bg-white/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.05] backdrop-blur-xl hover:-translate-y-1"
                                                 )}
                                          >
                                                 {/* Subtle top gradient within card */}
                                                 <div className={cn("absolute top-0 inset-x-0 h-40 bg-gradient-to-b opacity-40 pointer-events-none transition-opacity duration-500 rounded-t-[2.5rem]", gradient, (highlight || isCurrent) ? "opacity-100" : "group-hover:opacity-100")} />

                                                 {highlight && (
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5 z-30 ring-4 ring-white dark:ring-[#030712]">
                                                               <Sparkles size={14} className="animate-pulse" /> RECOMENDADO
                                                        </div>
                                                 )}

                                                 {isCurrent && (
                                                        <div className="absolute top-6 right-8 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 z-20 backdrop-blur-md border border-emerald-500/20">
                                                               <Check size={12} strokeWidth={4} /> Plan Actual
                                                        </div>
                                                 )}

                                                 <div className="mb-10 mt-6 relative z-10">
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                                                               {plan.name}
                                                        </h3>
                                                        <div className="flex flex-col mb-6 min-h-[5.5rem] justify-center">
                                                               <div className="flex items-baseline gap-2">
                                                                      <span className="text-5xl xl:text-6xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">{formatPrice(displayPrice)}</span>
                                                                      <span className="text-slate-400 dark:text-zinc-500 font-bold text-lg">/mes</span>
                                                               </div>
                                                               {isYearly && (
                                                                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-black mt-3 flex items-center gap-1.5">
                                                                             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                                             Facturado anualmente
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <p className="text-[15px] font-medium text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[60px]">
                                                               {description}
                                                        </p>
                                                 </div>

                                                 {/* Divider */}
                                                 <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-10 relative z-10" />

                                                 <div className="flex-1 mb-10 relative z-10">
                                                        <ul className="space-y-5">
                                                               {plan.features.map((feature, i) => (
                                                                      <li key={i} className="flex items-start gap-4 text-[15px] text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                                             <div className={cn(
                                                                                    "mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-300",
                                                                                    isCurrent || highlight
                                                                                           ? "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white scale-110"
                                                                                           : "bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-zinc-500 group-hover:scale-110"
                                                                             )}>
                                                                                    <Check size={12} strokeWidth={4} />
                                                                             </div>
                                                                             <span className="leading-snug font-medium">{feature}</span>
                                                                      </li>
                                                               ))}
                                                        </ul>
                                                 </div>

                                                 <button
                                                        onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                        disabled={isCurrent || !!loadingId || !isConfigured}
                                                        className={cn(
                                                               "w-full py-5 rounded-[1.25rem] font-black text-xs xl:text-sm uppercase tracking-widest transition-all relative overflow-hidden group/btn flex items-center justify-center gap-3 z-10",
                                                               isCurrent
                                                                      ? "bg-transparent text-slate-400 dark:text-zinc-500 border-2 border-slate-200 dark:border-white/10 cursor-default opacity-80"
                                                                      : highlight
                                                                             ? "bg-emerald-500 text-white shadow-[0_10px_40px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_15px_50px_-5px_rgba(16,185,129,0.6)] hover:-translate-y-1"
                                                                             : "bg-slate-900 text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-zinc-200 shadow-xl hover:-translate-y-1"
                                                        )}
                                                 >
                                                        {loadingId === plan.id ? (
                                                               <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                               <>
                                                                      <span className="relative z-10">{isCurrent ? 'Plan Activo' : 'Seleccionar Plan'}</span>
                                                                      {!isCurrent && <Zap size={16} className={cn("transition-transform group-hover/btn:scale-125", highlight ? "fill-white" : "fill-current")} />}
                                                               </>
                                                        )}
                                                        {highlight && !isCurrent && (
                                                               <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                                        )}
                                                 </button>
                                          </motion.div>
                                   )
                            })}
                     </div>

                     {/* Cancel / Support Extra Actions - More elegant footer */}
                     {currentPlan && subscriptionStatus !== 'CANCELLED' && (
                            <motion.div
                                   initial={{ opacity: 0 }}
                                   whileInView={{ opacity: 1 }}
                                   className="mt-20 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto"
                            >
                                   <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                                 <Zap className="text-emerald-500 w-6 h-6" />
                                          </div>
                                          <div className="text-left">
                                                 <p className="text-xs text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Suscripción Activa</p>
                                                 <p className="text-sm text-slate-600 dark:text-zinc-300">
                                                        Próximo cargo: <span className="font-bold text-slate-900 dark:text-white">{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                                                 </p>
                                          </div>
                                   </div>

                                   <div className="flex flex-wrap items-center justify-center gap-6">
                                          <button
                                                 onClick={() => window.open('https://wa.me/5493524421497', '_blank')}
                                                 className="text-xs font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-colors flex items-center gap-2"
                                          >
                                                 Soporte VIP 24/7 <ArrowRight size={14} className="rotate-[-45deg]" />
                                          </button>
                                          <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-white/10" />
                                          <button
                                                 onClick={handleCancel}
                                                 disabled={!!loadingId}
                                                 className="text-xs font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2 group"
                                          >
                                                 {loadingId === 'cancel' && <Loader2 className="w-3 h-3 animate-spin" />}
                                                 Cancelar Plan
                                          </button>
                                   </div>
                            </motion.div>
                     )}
              </div>
       )
}
