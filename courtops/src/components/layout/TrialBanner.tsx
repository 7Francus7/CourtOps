'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface TrialBannerProps {
       subscriptionStatus: string;
       nextBillingDate: Date | string | null;
       plan: string;
}

export const TrialBanner = ({ subscriptionStatus, nextBillingDate, plan }: TrialBannerProps) => {
       if (subscriptionStatus !== 'TRIAL' || !nextBillingDate) {
              return null;
       }

       const today = new Date();
       const billingDate = new Date(nextBillingDate);
       const daysRemaining = differenceInDays(billingDate, today);

       if (daysRemaining < 0) return null; // Expired or handled elsewhere

       return (
              <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 text-center animate-in slide-in-from-top-full duration-500">
                     <AlertCircle size={16} />
                     <span>
                            Estás disfrutando de tu prueba gratuita de <strong>CourtOps {plan}</strong>. Quedan {daysRemaining} días.
                     </span>
                     <Link href="/dashboard/billing" className="bg-white text-indigo-600 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors">
                            Ver Planes
                     </Link>
              </div>
       )
}
