'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export const TrialBanner = () => {
       // In a real app, calculate days remaining from DB
       const daysRemaining = 7;

       return (
              <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 text-center">
                     <AlertCircle size={16} />
                     <span>
                            Estás disfrutando de tu prueba gratuita de <strong>CourtOps Pro</strong>. Quedan {daysRemaining} días.
                     </span>
                     <Link href="/dashboard/billing" className="bg-white text-indigo-600 px-3 py-0.5 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors">
                            Ver Planes
                     </Link>
              </div>
       )
}
