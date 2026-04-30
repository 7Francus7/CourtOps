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
                            <div className="relative z-50 border-b border-red-500/20 bg-gradient-to-r from-red-950 via-red-900 to-red-950 px-4 py-2.5 text-white shadow-lg sm:py-3">
                                   <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                                          <div className="flex min-w-0 items-center gap-2.5 sm:items-start sm:gap-3">
                                                 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:mt-0.5 sm:h-9 sm:w-9 sm:rounded-2xl">
                                                        <ShieldX size={17} />
                                                 </div>
                                                 <div className="min-w-0">
                                                        <p className="truncate text-xs font-black sm:text-sm">Tu prueba termino</p>
                                                        <p className="hidden text-xs font-medium text-white/70 sm:block">
                                                               Activa un plan para mantener reservas online, caja y operacion sin cortes.
                                                        </p>
                                                 </div>
                                          </div>
                                          <Link href="/dashboard/suscripcion" className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-[10px] font-black uppercase tracking-widest text-red-700 transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-4 sm:text-xs">
                                                 <span className="sm:hidden">Plan</span>
                                                 <span className="hidden sm:inline">Activar plan</span>
                                                 <ArrowRight size={14} />
                                          </Link>
                                   </div>
                            </div>
                     )
              }

              return (
                     <div className="relative z-50 border-b border-primary/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 py-2.5 text-white shadow-lg animate-in slide-in-from-top-full duration-500 sm:py-3">
                            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                                   <div className="flex min-w-0 items-center gap-2.5 sm:items-start sm:gap-3">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:mt-0.5 sm:h-9 sm:w-9 sm:rounded-2xl">
                                                 <Sparkles size={17} />
                                          </div>
                                          <div className="min-w-0">
                                                 <p className="truncate text-xs font-black sm:text-sm">
                                                        CourtOps {plan}: {daysRemaining} dias de prueba
                                                 </p>
                                                 <p className="hidden text-xs font-medium text-white/65 sm:block">
                                                        Ya podes vender reservas, compartir QR y operar desde el celular.
                                                 </p>
                                          </div>
                                   </div>
                                   <Link href="/dashboard/suscripcion" className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-4 sm:text-xs">
                                          <span className="sm:hidden">Plan</span>
                                          <span className="hidden sm:inline">Elegir plan</span>
                                          <ArrowRight size={14} />
                                   </Link>
                            </div>
                     </div>
              )
       }

       if (subscriptionStatus === 'ACTIVE' && daysRemaining <= 5 && daysRemaining >= 0) {
              return (
                     <div className="relative z-50 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-foreground animate-in slide-in-from-top-full duration-500 sm:py-3">
                            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                                   <div className="flex min-w-0 items-center gap-2.5 sm:items-start sm:gap-3">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 sm:mt-0.5 sm:h-9 sm:w-9 sm:rounded-2xl">
                                                 <AlertCircle size={17} />
                                          </div>
                                          <div className="min-w-0">
                                                 <p className="truncate text-xs font-black sm:text-sm">Renovacion proxima</p>
                                                 <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                                                        Tu suscripcion se renueva en <strong>{daysRemaining} dias</strong>.
                                                 </p>
                                          </div>
                                   </div>
                                   <Link href="/dashboard/suscripcion" className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-amber-500/25 bg-background px-3 text-[10px] font-black uppercase tracking-widest text-amber-600 transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-4 sm:text-xs">
                                          <span className="sm:hidden">Plan</span>
                                          <span className="hidden sm:inline">Gestionar</span>
                                          <ArrowRight size={14} />
                                   </Link>
                            </div>
                     </div>
              )
       }

       return null
}
