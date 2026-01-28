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
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                   <AlertTriangle className="text-red-500 w-5 h-5 shrink-0" />
                                   <div className="flex-1">
                                          <h4 className="text-red-500 font-bold text-sm">Configuración Incompleta</h4>
                                          <p className="text-red-400/80 text-xs mt-0.5">
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
                                          <p className="text-yellow-400/80 text-xs mt-0.5">
                                                 Pagos simulados. Al suscribirte se activará el plan automáticamente sin ir a MercadoPago.
                                          </p>
                                   </div>
                            </div>
                     )}

                     {/* Current Status */}
                     <div className="bg-bg-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
                                   <div>
                                          <div className="flex items-center gap-2 mb-2 text-brand-blue">
                                                 <CreditCard className="w-5 h-5" />
                                                 <h3 className="font-bold text-lg">Estado de la Suscripción</h3>
                                          </div>

                                          <div className="flex items-center gap-3">
                                                 <span className="text-3xl font-bold text-white">
                                                        {currentPlan ? currentPlan.name : "Plan Gratuito / Prueba"}
                                                 </span>
                                                 {subscriptionStatus && (
                                                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'authorized' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                                               }`}>
                                                               {subscriptionStatus === 'authorized' ? 'ACTIVO' : subscriptionStatus}
                                                        </span>
                                                 )}
                                          </div>

                                          {nextBillingDate && (
                                                 <p className="text-zinc-500 text-sm mt-2">
                                                        Próxima facturación: {new Date(nextBillingDate).toLocaleDateString()}
                                                 </p>
                                          )}
                                          {!currentPlan && (
                                                 <p className="text-zinc-500 text-sm mt-2">Actualmente estás en el periodo de prueba o plan gratuito.</p>
                                          )}
                                   </div>

                                   {currentPlan && subscriptionStatus !== 'CANCELLED' && (
                                          <button
                                                 className="px-4 py-2 rounded-xl text-sm font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
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
                     <div className="flex flex-wrap justify-center gap-6">
                            {availablePlans.map((plan) => {
                                   const isCurrent = isPlanActive(plan.id)

                                   return (
                                          <div
                                                 key={plan.id}
                                                 className={`w-full max-w-md p-8 rounded-3xl border flex flex-col transition-all ${isCurrent
                                                        ? 'bg-brand-blue/10 border-brand-blue shadow-[0_0_30px_rgba(0,128,255,0.1)]'
                                                        : 'bg-bg-card border-white/5 hover:border-white/10'
                                                        }`}
                                          >
                                                 {isCurrent && (
                                                        <div className="mb-4">
                                                               <span className="bg-brand-blue text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                                                      Plan Actual
                                                               </span>
                                                        </div>
                                                 )}

                                                 <div className="mb-6">
                                                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                                        <div className="flex items-baseline gap-1">
                                                               <span className="text-4xl font-black text-white">{formatPrice(plan.price)}</span>
                                                               <span className="text-zinc-500 font-medium">/ mes</span>
                                                        </div>
                                                 </div>

                                                 <div className="flex-1 mb-8">
                                                        <ul className="space-y-4">
                                                               {plan.features.map((feature, i) => (
                                                                      <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm">
                                                                             <div className="w-5 h-5 rounded-full bg-brand-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                                                                                    <Check className="w-3 h-3 text-brand-blue" />
                                                                             </div>
                                                                             {feature}
                                                                      </li>
                                                               ))}
                                                        </ul>
                                                 </div>

                                                 <button
                                                        className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCurrent
                                                               ? 'bg-white/5 text-zinc-500 cursor-not-allowed'
                                                               : !isConfigured
                                                                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                                      : 'btn-primary hover:scale-[1.02]'
                                                               }`}
                                                        disabled={isCurrent || !!loadingId || !isConfigured}
                                                        onClick={() => !isCurrent && handleSubscribe(plan.id)}
                                                 >
                                                        {loadingId === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        {isCurrent ? 'Plan Activo' : (!isConfigured ? 'No Configurado' : 'Suscribirse Ahora')}
                                                 </button>
                                          </div>
                                   )
                            })}
                     </div>
              </div>
       )
}
