'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShieldX, CreditCard, Lock } from 'lucide-react'

interface TrialExpiredGuardProps {
       isTrialExpired: boolean
       children: React.ReactNode
}

const ALLOWED_PATHS = ['/dashboard/suscripcion']

export function TrialExpiredGuard({ isTrialExpired, children }: TrialExpiredGuardProps) {
       const pathname = usePathname()

       if (!isTrialExpired) return <>{children}</>

       // Allow subscription pages
       const isAllowed = ALLOWED_PATHS.some(p => pathname.startsWith(p))
       if (isAllowed) return <>{children}</>

       return (
              <div className="flex-1 flex items-center justify-center p-6">
                     <div className="max-w-lg w-full text-center space-y-6">
                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                   <ShieldX className="w-10 h-10 text-red-500" />
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                   <h1 className="text-2xl font-bold text-foreground">
                                          Tu prueba gratuita ha expirado
                                   </h1>
                                   <p className="text-muted-foreground text-base">
                                          El período de prueba de tu cuenta ha finalizado. Para continuar utilizando CourtOps,
                                          elegí un plan y activá tu suscripción.
                                   </p>
                            </div>

                            {/* Blocked features */}
                            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Lock className="w-4 h-4" />
                                          <span>Funciones bloqueadas temporalmente:</span>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                          <span>• Reservas</span>
                                          <span>• Clientes</span>
                                          <span>• Caja</span>
                                          <span>• Kiosco</span>
                                          <span>• Torneos</span>
                                          <span>• Reportes</span>
                                   </div>
                            </div>

                            {/* CTA */}
                            <Link
                                   href="/dashboard/suscripcion"
                                   className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-indigo-500/25"
                            >
                                   <CreditCard className="w-5 h-5" />
                                   Ver Planes y Suscribirme
                            </Link>

                            <p className="text-xs text-muted-foreground">
                                   Tus datos están seguros. Una vez que actives tu suscripción, todo volverá a funcionar normalmente.
                            </p>
                     </div>
              </div>
       )
}
