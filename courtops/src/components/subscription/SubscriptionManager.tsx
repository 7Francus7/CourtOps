'use client'

import { useState } from 'react'
import { Check, Loader2, CreditCard, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription } from '@/actions/subscription'
import { useRouter } from 'next/navigation'

interface Plan {
       id: string
       name: string
       price: number
       features: string[]
}

interface SubscriptionManagerProps {
       currentPlan: any
       subscriptionStatus: string | null
       nextBillingDate: Date | null
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

       const handleSubscribe = async (planId: string) => {
              if (!isConfigured) return
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

       return (
              <div className="space-y-8">
                     {!isConfigured && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3">
                                   <AlertTriangle className="text-destructive w-5 h-5 shrink-0" />
                                   <div className="flex-1">
                                          <h4 className="text-destructive font-bold text-sm">Configuración Incompleta</h4>
                                          <p className="text-destructive/80 text-xs mt-0.5">
                                                 El token de acceso de MercadoPago (MP_ACCESS_TOKEN) no está configurado en las variables de entorno. Los pagos no funcionarán.
                                          </p>
                                   </div>
                            </div>
                     )}

                     {isDevMode && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center gap-3">
                                   <AlertTriangle className="text-yellow-500 w-5 h-5 shrink-0" />
                                   <div className="flex-1">
                                          <h4 className="text-yellow-500 font-bold text-sm">Modo Desarrollo Activo</h4>
                                          <p className="text-yellow-600/80 dark:text-yellow-400/80 text-xs mt-0.5">
                                                 Pagos simulados. Al suscribirte se activará el plan automáticamente sin ir a MercadoPago.
                                          </p>
                                   </div>
                            </div>
                     )}

                     {/* Current Status */}
                     <div className="bg-card p-6 rounded-2xl border border-border relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
                                   <div>
                                          <div className="flex items-center gap-2 mb-2 text-primary">
                                                 <CreditCard className="w-5 h-5" />
                                                 <h3 className="font-bold text-lg">Estado de la Suscripción</h3>
                                          </div>

                                          <div className="flex items-center gap-3">
                                                 <span className="text-3xl font-bold text-foreground">
                                                        {currentPlan ? currentPlan.name : "Plan Gratuito / Prueba"}
                                                 </span>
                                                 {subscriptionStatus && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'authorized' ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'
                                                               }`}>
                                                               {subscriptionStatus === 'authorized' ? 'ACTIVO' : subscriptionStatus}
                                                        </span>
                                                 )}
                                          </div>

                                          {nextBillingDate && (
                                                 <p className="text-muted-foreground text-sm mt-2">
                                                        Próxima facturación: {new Date(nextBillingDate).toLocaleDateString()}
                                                 </p>
                                          )}
                                          {!currentPlan && (
                                                 <p className="text-muted-foreground text-sm mt-2">Actualmente estás en el periodo de prueba o plan gratuito.</p>
                                          )}
                                   </div>

                                   {currentPlan && subscriptionStatus !== 'CANCELLED' && (
                                          <button
                                                 className="px-4 py-2 rounded-xl text-sm font-bold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                                                 onClick={handleCancel}
                                                 disabled={!!loadingId}
                                          >
                                                 {loadingId === 'cancel' && <Loader2 className="w-4 h-4 animate-spin" />}
                                                 Cancelar Suscripción
                                          </button>
                                   )}
                            </div>
                     </div>

                     {/* Plans */}
                     <div className="grid md:grid-cols-2 gap-6">
                            {availablePlans.map((plan) => {
                                   const isCurrent = isPlanActive(plan.id)

                                   return (
                                          <div
                                                 key={plan.id}
                                                 className={`p-8 rounded-3xl border flex flex-col transition-all ${isCurrent
                                                        ? 'bg-primary/5 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]'
                                                        : 'bg-card border-border hover:border-primary/50'
                                                        }`}
                                          >
                                                 {isCurrent && (
                                                        <div className="mb-4">
                                                               <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                                                      Plan Actual
                                                               </span>
                                                        </div>
                                                 )}

                                                 <div className="mb-6">
                                                        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                                        <div className="flex items-baseline gap-1">
                                                               <span className="text-4xl font-black text-foreground">{formatPrice(plan.price)}</span>
                                                               <span className="text-muted-foreground font-medium">/ mes</span>
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 mb-8">
                                                        <ul className="space-y-4">
                                                               {plan.features.map((feature, i) => (
                                                                      <li key={i} className="flex items-start gap-3 text-muted-foreground text-sm">
                                                                             <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                                                    <Check className="w-3 h-3 text-primary" />
                                                                             </div>
                                                                             {feature}
                                                                      </li>
                                                               ))}
                                                        </ul>
                                                 </div>

                                                 <button
                                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                                               ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default'
                                                               : !isConfigured
                                                                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                                      : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] shadow-lg shadow-primary/20'
                                                               }`}
                                                        disabled={isCurrent || !!loadingId || !isConfigured}
                                                        onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                 >
                                                        {loadingId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        {isCurrent ? (
                                                               <>
                                                                      <Check className="w-4 h-4" /> Plan Activo
                                                               </>
                                                        ) : (
                                                               !isConfigured ? 'No Configurado' : (currentPlan ? 'Cambiar a este Plan' : 'Suscribirse Ahora')
                                                        )}
                                                 </button>
                                                 {currentPlan && !isCurrent && isConfigured && (
                                                        <p className="text-[10px] text-center mt-3 text-muted-foreground">
                                                               Al cambiar, se cancelará tu plan anterior automáticamente.
                                                        </p>
                                                 )}
                                          </div>
                                   )
                            })}
                     </div>
              </div>
       )
}
