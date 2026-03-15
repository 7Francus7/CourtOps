'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, Sparkles, ShieldX } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface TrialBannerProps {
       subscriptionStatus: string;
       nextBillingDate: Date | string | null;
       plan: string;
       isSubscribed?: boolean;
}

export const TrialBanner = ({ subscriptionStatus, nextBillingDate, plan, isSubscribed = false }: TrialBannerProps) => {
       const today = new Date();
       const billingDate = nextBillingDate ? new Date(nextBillingDate) : null;

       if (!billingDate) return null

       const daysRemaining = differenceInDays(billingDate, today);

       // CASE A: TRIAL MODE
       if (subscriptionStatus === 'TRIAL') {
              // Expired trial
              if (daysRemaining < 0) {
                     return (
                            <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 text-center relative z-50">
                                   <ShieldX size={16} />
                                   <span>
                                          Tu prueba gratuita ha expirado. <strong>Suscribite</strong> para seguir usando CourtOps.
                                   </span>
                                   <Link href="/dashboard/suscripcion" className="bg-white text-red-600 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-red-50 transition-colors shadow-sm ml-2">
                                          Ver Planes
                                   </Link>
                            </div>
                     )
              }

              // Active trial
              return (
                     <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 text-center animate-in slide-in-from-top-full duration-500 relative z-50">
                            <Sparkles size={16} className="text-yellow-300" />
                            <span>
                                   Prueba Gratuita de <strong>CourtOps {plan}</strong>. Quedan {daysRemaining} días.
                            </span>
                            <Link href="/dashboard/suscripcion" className="bg-white text-indigo-600 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm ml-2">
                                   Ver Planes
                            </Link>
                     </div>
              )
       }

       // CASE B: ACTIVE SUBSCRIPTION (Expiring Soon)
       // Only show if expiring in 5 days or less
       if (subscriptionStatus === 'ACTIVE' && daysRemaining <= 5 && daysRemaining >= 0) {
              return (
                     <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 text-center animate-in slide-in-from-top-full duration-500 relative z-50">
                            <AlertCircle size={16} />
                            <span>
                                   Tu suscripción se renueva en <strong>{daysRemaining} días</strong>.
                            </span>
                            <Link href="/dashboard/suscripcion" className="bg-white text-amber-600 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-amber-50 transition-colors shadow-sm ml-2">
                                   Gestionar
                            </Link>
                     </div>
              )
       }

       return null
}
