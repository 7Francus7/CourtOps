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
                                                        "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 group overflow-hidden",
                                                        // Highlight styles
                                                        isCurrent
                                                               ? "bg-card border-primary/50 ring-2 ring-primary/20 shadow-2xl z-20 scale-[1.02]"
                                                               : highlight
                                                                      ? "bg-card border-primary/30 shadow-xl shadow-primary/5 hover:border-primary/50 hover:shadow-primary/10 hover:-translate-y-1"
                                                                      : "bg-card/50 border-border hover:border-primary/20 hover:bg-card hover:shadow-lg hover:-translate-y-1"
                                                 )}
                                          >
                                                 {/* Background Gradient */}
                                                 {gradient && (
                                                        <div className={cn("absolute inset-0 bg-gradient-to-b opacity-50 pointer-events-none", gradient)} />
                                                 )}

                                                 {highlight && !isCurrent && (
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-b-xl shadow-lg flex items-center gap-2 z-10 w-max">
                                                               <Sparkles size={12} fill="currentColor" /> Recomendado
                                                        </div>
                                                 )}

                                                 {isCurrent && (
                                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary border-l border-b border-primary/20 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-bl-2xl flex items-center gap-2 z-10">
                                                               <Check size={12} strokeWidth={4} /> Plan Actual
                                                        </div>
                                                 )}

                                                 <div className="mb-8 mt-2 relative z-10">
                                                        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                                               {plan.name}
                                                        </h3>
                                                        <div className="flex flex-col mb-4">
                                                               <div className="flex items-baseline gap-1">
                                                                      <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{formatPrice(displayPrice)}</span>
                                                                      <span className="text-muted-foreground font-medium">/mes</span>
                                                               </div>
                                                               {isYearly && (
                                                                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md w-max">
                                                                             Ahorrás {formatPrice((basePrice - displayPrice) * 12)} al año
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                                                               {description}
                                                        </p>
                                                 </div>

                                                 <div className="flex-1 mb-8 relative z-10">
                                                        <div className="w-full h-px bg-border mb-6" />
                                                        <ul className="space-y-4">
                                                               {plan.features.map((feature, i) => (
                                                                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                                                             <div className={cn(
                                                                                    "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                                                                    isCurrent || highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                                             )}>
                                                                                    <Check size={12} strokeWidth={3} />
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
                                                               "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative z-10 shadow-lg",
                                                               isCurrent
                                                                      ? "bg-muted text-muted-foreground cursor-default border border-border shadow-none"
                                                                      : highlight
                                                                             ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25"
                                                                             : "bg-foreground text-background hover:bg-foreground/90 shadow-foreground/10"
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
