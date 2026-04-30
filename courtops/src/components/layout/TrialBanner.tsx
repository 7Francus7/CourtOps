'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, ShieldX, Sparkles } from 'lucide-react'
import { differenceInDays } from 'date-fns'

interface TrialBannerProps {
       subscriptionStatus: string
       nextBillingDate: Date | string | null
       plan: string
       isSubscribed?: boolean
}

export const TrialBanner = ({ subscriptionStatus, nextBillingDate, plan }: TrialBannerProps) => {
       const today = new Date()
       const billingDate = nextBillingDate ? new Date(nextBillingDate) : null

       if (!billingDate) return null

       const daysRemaining = differenceInDays(billingDate, today)

       if (subscriptionStatus === 'TRIAL') {
              if (daysRemaining < 0) {
                     return (
                            <div className="relative z-50 border-b border-red-500/20 bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-4 py-3 text-white shadow-lg">
                                   <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div className="flex items-start gap-3">
                                                 <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                                                        <ShieldX size={17} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm font-black">Tu prueba termino</p>
                                                        <p className="text-xs font-medium text-white/70">
                                                               Activa un plan para mantener reservas online, caja y operacion sin cortes.
                                                        </p>
                                                 </div>
                                          </div>
                                          <Link href="/dashboard/suscripcion" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-black uppercase tracking-widest text-red-700 transition-all active:scale-[0.98]">
                                                 Activar plan
                                                 <ArrowRight size={14} />
                                          </Link>
                                   </div>
                            </div>
                     )
              }

              return (
                     <div className="relative z-50 border-b border-primary/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-3 text-white shadow-lg animate-in slide-in-from-top-full duration-500">
                            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                   <div className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                                 <Sparkles size={17} />
                                          </div>
                                          <div>
                                                 <p className="text-sm font-black">
                                                        CourtOps {plan}: {daysRemaining} dias de prueba
                                                 </p>
                                                 <p className="text-xs font-medium text-white/65">
                                                        Ya podes vender reservas, compartir QR y operar desde el celular.
                                                 </p>
                                          </div>
                                   </div>
                                   <Link href="/dashboard/suscripcion" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-[0.98]">
                                          Elegir plan
                                          <ArrowRight size={14} />
                                   </Link>
                            </div>
                     </div>
              )
       }

       if (subscriptionStatus === 'ACTIVE' && daysRemaining <= 5 && daysRemaining >= 0) {
              return (
                     <div className="relative z-50 border-b border-amber-500/20 bg-amber-500/10 px-4 py-3 text-foreground animate-in slide-in-from-top-full duration-500">
                            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                   <div className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
                                                 <AlertCircle size={17} />
                                          </div>
                                          <div>
                                                 <p className="text-sm font-black">Renovacion proxima</p>
                                                 <p className="text-xs font-medium text-muted-foreground">
                                                        Tu suscripcion se renueva en <strong>{daysRemaining} dias</strong>.
                                                 </p>
                                          </div>
                                   </div>
                                   <Link href="/dashboard/suscripcion" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-amber-500/25 bg-background px-4 text-xs font-black uppercase tracking-widest text-amber-600 transition-all active:scale-[0.98]">
                                          Gestionar
                                          <ArrowRight size={14} />
                                   </Link>
                            </div>
                     </div>
              )
       }

       return null
}
