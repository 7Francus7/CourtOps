'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface TrialBannerProps {
       subscriptionStatus: string;
       nextBillingDate: Date | string | null;
       plan: string;
       isSubscribed?: boolean;
}

export const TrialBanner = ({ subscriptionStatus, nextBillingDate, plan, isSubscribed = false }: TrialBannerProps) => {
       // 1. If actively subscribed (external payment provider), hide banner
       if (isSubscribed) return null;

       // 2. If status is explicitly Active (manual override), hide banner
       if (subscriptionStatus === 'ACTIVE') return null;

       // 3. If no billing date, cannot calculate trial end, safely hide
       if (!nextBillingDate) return null;

       const today = new Date();
       const billingDate = new Date(nextBillingDate);
       const daysRemaining = differenceInDays(billingDate, today);

       // 4. If trial expired (negative days), hide banner (or show 'Expired' if desired, but user wants it gone)
       if (daysRemaining < 0) return null;

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
