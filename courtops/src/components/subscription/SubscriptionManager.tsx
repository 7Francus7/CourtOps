'use client'

import React, { useState } from 'react'
import { Check, Loader2, Sparkles, Shield, Zap, AlertTriangle } from 'lucide-react'
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
                     description: 'Ideal para clubes pequeños que recién comienzan.',
                     color: 'blue',
                     highlight: false,
                     gradient: 'from-blue-500/10 to-transparent'
              }
              if (lowerName.includes('profesional')) return {
                     description: 'Potencia total con Kiosco y Torneos.',
                     color: 'emerald',
                     highlight: true,
                     gradient: 'from-emerald-500/10 to-transparent'
              }
              if (lowerName.includes('empresarial')) return {
                     description: 'Solución definitiva para grandes complejos.',
                     color: 'purple',
                     highlight: false,
                     gradient: 'from-purple-500/10 to-transparent'
              }
              return { description: 'Plan estándar', color: 'slate', highlight: false, gradient: '' }
       }

       const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)

       return (
              <div className="space-y-8 relative">
                     {/* Dev/Config Warnings */}
                     {!isConfigured && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 mb-6">
                                   <AlertTriangle className="text-destructive w-5 h-5 shrink-0" />
                                   <div className="flex-1">
                                          <h4 className="text-destructive font-bold text-sm">Configuración Incompleta</h4>
                                          <p className="text-destructive/80 text-xs mt-0.5">El token de acceso de MercadoPago no está configurado. Los pagos no funcionarán.</p>
                                   </div>
                            </div>
                     )}

                     {isDevMode && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3 mb-6">
                                   <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0" />
                                   <div className="flex-1">
                                          <h4 className="text-yellow-500 font-bold text-sm">Modo Desarrollo Activo</h4>
                                          <p className="text-yellow-600/80 dark:text-yellow-400/80 text-xs mt-0.5">Pagos simulados. Se activará el plan automáticamente.</p>
                                   </div>
                            </div>
                     )}

                     {/* Billing Toggle */}
                     <div className="flex items-center justify-center gap-4 select-none mb-10">
                            <span
                                   className={cn("text-sm font-medium transition-colors cursor-pointer", billingCycle === 'monthly' ? "text-foreground" : "text-muted-foreground")}
                                   onClick={() => setBillingCycle('monthly')}
                            >
                                   Mensual
                            </span>
                            <button
                                   onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                   className="w-14 h-7 bg-slate-200 dark:bg-zinc-800 rounded-full relative p-1 transition-colors hover:bg-slate-300 dark:hover:bg-zinc-700 focus:outline-none"
                            >
                                   <div className={cn("w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300", billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0")} />
                            </button>
                            <span
                                   className={cn("text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer", billingCycle === 'yearly' ? "text-foreground" : "text-muted-foreground")}
                                   onClick={() => setBillingCycle('yearly')}
                            >
                                   Anual
                                   <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">20% OFF</span>
                            </span>
                     </div>

                     {/* Plans Grid */}
                     <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                            {sortedPlans.map((plan) => {
                                   const { description, highlight, color, gradient } = getPlanMetadata(plan.name)
                                   const isCurrent = isPlanActive(plan.id)
                                   const basePrice = plan.price
                                   const displayPrice = billingCycle === 'monthly' ? basePrice : basePrice * 0.8
                                   const isYearly = billingCycle === 'yearly'

                                   return (
                                          <div
                                                 key={plan.id}
                                                 className={cn(
                                                        "relative flex flex-col p-8 xl:p-10 rounded-3xl border transition-all duration-300 group overflow-visible",
                                                        // Highlight styles: pure flat bright cards
                                                        isCurrent
                                                               ? "bg-white dark:bg-zinc-950 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 z-20 scale-[1.02]"
                                                               : highlight
                                                                      ? "bg-white dark:bg-zinc-950 border-emerald-500 shadow-2xl shadow-emerald-500/15 hover:-translate-y-2 z-10"
                                                                      : "bg-slate-50 dark:bg-zinc-900 border-border shadow-xl hover:-translate-y-1 hover:border-slate-300 dark:hover:border-zinc-700"
                                                 )}
                                          >
                                                 {highlight && (
                                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[10px] xl:text-xs uppercase tracking-widest px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5 z-30 whitespace-nowrap">
                                                               <Sparkles size={14} fill="currentColor" /> RECOMENDADO
                                                        </div>
                                                 )}

                                                 {isCurrent && (
                                                        <div className="absolute top-6 right-6 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20">
                                                               <Check size={12} strokeWidth={4} /> Plan Actual
                                                        </div>
                                                 )}

                                                 <div className="mb-6 mt-4 relative z-10">
                                                        <h3 className="text-xl xl:text-2xl font-bold text-foreground mb-4">
                                                               {plan.name}
                                                        </h3>
                                                        <div className="flex flex-col mb-4 min-h-[5rem] justify-center">
                                                               <div className="flex items-baseline gap-2">
                                                                      <span className="text-5xl xl:text-6xl font-black text-foreground tracking-tighter">{formatPrice(displayPrice)}</span>
                                                                      <span className="text-muted-foreground font-semibold text-base xl:text-lg">/mes</span>
                                                               </div>
                                                               {isYearly && (
                                                                      <span className="text-xs xl:text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                                                                             Ahorrás {formatPrice((basePrice - displayPrice) * 12)} al año
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <p className="text-sm xl:text-base text-muted-foreground leading-relaxed">
                                                               {description}
                                                        </p>
                                                 </div>

                                                 <div className="flex-1 mb-8 relative z-10">
                                                        <div className="w-full h-px bg-border my-6 xl:my-8" />
                                                        <ul className="space-y-4 xl:space-y-5">
                                                               {plan.features.map((feature, i) => (
                                                                      <li key={i} className="flex items-center gap-3 text-sm xl:text-[15px] text-foreground/80 group-hover:text-foreground transition-colors">
                                                                             <div className={cn(
                                                                                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                                                                    isCurrent || highlight ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700"
                                                                             )}>
                                                                                    <Check size={12} strokeWidth={4} />
                                                                             </div>
                                                                             <span className="leading-tight font-medium">{feature}</span>
                                                                      </li>
                                                               ))}
                                                        </ul>
                                                 </div>

                                                 <button
                                                        onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                        disabled={isCurrent || !!loadingId || !isConfigured}
                                                        className={cn(
                                                               "w-full py-4 xl:py-5 rounded-xl xl:rounded-2xl font-black text-xs xl:text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative z-10",
                                                               isCurrent
                                                                      ? "bg-transparent text-slate-500 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 cursor-default shadow-none"
                                                                      : highlight
                                                                             ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/25"
                                                                             : "bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 shadow-lg shadow-black/10"
                                                        )}
                                                 >
                                                        {loadingId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        {isCurrent ? 'Plan Activo' : 'Seleccionar Plan'}
                                                 </button>
                                          </div>
                                   )
                            })}
                     </div>

                     {/* Cancel / Support Extra Actions */}
                     {currentPlan && subscriptionStatus !== 'CANCELLED' && (
                            <div className="mt-16 flex flex-col items-center gap-4 text-center">
                                   <p className="text-sm text-muted-foreground">
                                          Próxima facturación: <span className="text-foreground font-bold">{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : 'N/A'}</span>
                                   </p>
                                   <div className="flex gap-4">
                                          <button
                                                 onClick={() => window.open('https://wa.me/5493524421497', '_blank')}
                                                 className="text-xs font-bold text-emerald-500 hover:text-emerald-600 uppercase tracking-wider"
                                          >
                                                 Soporte WhatsApp
                                          </button>
                                          <div className="w-px h-4 bg-border" />
                                          <button
                                                 onClick={handleCancel}
                                                 disabled={!!loadingId}
                                                 className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-2"
                                          >
                                                 {loadingId === 'cancel' && <Loader2 className="w-3 h-3 animate-spin" />}
                                                 Cancelar Suscripción
                                          </button>
                                   </div>
                            </div>
                     )}
              </div>
       )
}
