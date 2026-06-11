'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShieldX, CreditCard, Lock, Ban } from 'lucide-react'

export type BlockReason = 'TRIAL_EXPIRED' | 'SUSPENDED' | null

interface TrialExpiredGuardProps {
       blockReason: BlockReason
       children: React.ReactNode
}

// Rutas accesibles aun con la cuenta bloqueada: el usuario SIEMPRE
// tiene que poder llegar a pagar.
const ALLOWED_PATHS = ['/dashboard/suscripcion']

const COPY = {
       TRIAL_EXPIRED: {
              icon: ShieldX,
              title: 'Tu prueba gratuita terminó',
              body: 'Probaste CourtOps 14 días. Para seguir operando, elegí un plan: transferencia bancaria sin comisión o MercadoPago.',
       },
       SUSPENDED: {
              icon: Ban,
              title: 'Tu cuenta está suspendida',
              body: 'Tu suscripción venció y el período de gracia terminó. Renovala y tu acceso vuelve al instante.',
       },
} as const

export function TrialExpiredGuard({ blockReason, children }: TrialExpiredGuardProps) {
       const pathname = usePathname()

       if (!blockReason) return <>{children}</>

       const isAllowed = ALLOWED_PATHS.some(p => pathname.startsWith(p))
       if (isAllowed) return <>{children}</>

       const copy = COPY[blockReason]
       const Icon = copy.icon

       return (
              <div className="flex-1 flex items-center justify-center p-6">
                     <div className="max-w-lg w-full text-center space-y-6">
                            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                   <Icon className="w-10 h-10 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                   <h1 className="text-2xl font-bold text-foreground">{copy.title}</h1>
                                   <p className="text-muted-foreground text-base">{copy.body}</p>
                            </div>

                            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <Lock className="w-4 h-4" />
                                          <span>Funciones pausadas temporalmente:</span>
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

                            <Link
                                   href="/dashboard/suscripcion"
                                   className="inline-flex items-center gap-2 bg-primary hover:brightness-110 text-primary-foreground px-8 py-3 rounded-xl font-semibold text-base transition-all shadow-lg"
                            >
                                   <CreditCard className="w-5 h-5" />
                                   {blockReason === 'SUSPENDED' ? 'Renovar mi plan' : 'Elegir mi plan'}
                            </Link>

                            <p className="text-xs text-muted-foreground">
                                   Tus reservas, clientes y configuración están guardados. Al activar el plan, todo vuelve exactamente como estaba.
                            </p>
                     </div>
              </div>
       )
}
