'use client'

import React from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Clock, ShieldX, Sparkles } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'

interface TrialBannerProps {
       subscriptionStatus: string
       nextBillingDate: Date | string | null
       plan?: string
       isSubscribed?: boolean
}

type BannerTone = 'info' | 'warning' | 'danger'

function BannerShell({
       tone,
       icon,
       title,
       subtitle,
       ctaLabel,
       ctaShort,
}: {
       tone: BannerTone
       icon: React.ReactNode
       title: string
       subtitle: string
       ctaLabel: string
       ctaShort: string
}) {
       const toneClasses: Record<BannerTone, { wrap: string; iconBox: string; cta: string }> = {
              info: {
                     wrap: 'border-primary/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white',
                     iconBox: 'bg-primary/15 text-primary',
                     cta: 'bg-primary text-primary-foreground',
              },
              warning: {
                     wrap: 'border-amber-500/20 bg-amber-500/10 text-foreground',
                     iconBox: 'bg-amber-500/15 text-amber-500',
                     cta: 'border border-amber-500/25 bg-background text-amber-600',
              },
              danger: {
                     wrap: 'border-red-500/20 bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white',
                     iconBox: 'bg-white/10 text-white',
                     cta: 'bg-white text-red-700',
              },
       }
       const c = toneClasses[tone]

       return (
              <div className={`relative z-50 border-b px-4 pb-2.5 pt-[max(env(safe-area-inset-top),0.625rem)] shadow-lg sm:pb-3 sm:pt-[max(env(safe-area-inset-top),0.75rem)] ${c.wrap}`}>
                     <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2.5 sm:items-start sm:gap-3">
                                   <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:mt-0.5 sm:h-9 sm:w-9 sm:rounded-2xl ${c.iconBox}`}>
                                          {icon}
                                   </div>
                                   <div className="min-w-0">
                                          <p className="truncate text-xs font-black sm:text-sm">{title}</p>
                                          <p className="hidden text-xs font-medium opacity-70 sm:block">{subtitle}</p>
                                   </div>
                            </div>
                            <Link
                                   href="/dashboard/suscripcion"
                                   className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:rounded-2xl sm:px-4 sm:text-xs ${c.cta}`}
                            >
                                   <span className="sm:hidden">{ctaShort}</span>
                                   <span className="hidden sm:inline">{ctaLabel}</span>
                                   <ArrowRight size={14} />
                            </Link>
                     </div>
              </div>
       )
}

export const TrialBanner = ({ subscriptionStatus, nextBillingDate }: TrialBannerProps) => {
       const status = subscriptionStatus
       const billingDate = nextBillingDate ? new Date(nextBillingDate) : null
       const daysRemaining = billingDate ? differenceInCalendarDays(billingDate, new Date()) : null

       // Comprobante de transferencia esperando validación del superadmin
       if (status === 'PENDING_VALIDATION') {
              return (
                     <BannerShell
                            tone="info"
                            icon={<Clock size={17} />}
                            title="Comprobante en revisión"
                            subtitle="Validamos tu transferencia en el día. Mientras tanto, seguís operando normal."
                            ctaLabel="Ver estado"
                            ctaShort="Estado"
                     />
              )
       }

       if (status === 'TRIAL') {
              // Trial vencido (el cron todavía no lo pasó a EXPIRED)
              if (daysRemaining === null || daysRemaining < 0) {
                     return (
                            <BannerShell
                                   tone="danger"
                                   icon={<ShieldX size={17} />}
                                   title="Tu prueba terminó"
                                   subtitle="Activá un plan para mantener reservas online, caja y operación sin cortes."
                                   ctaLabel="Activar plan"
                                   ctaShort="Plan"
                            />
                     )
              }

              const title =
                     daysRemaining === 0 ? 'Tu prueba termina hoy'
                     : daysRemaining === 1 ? 'Te queda 1 día de prueba'
                     : `Te quedan ${daysRemaining} días de prueba`

              return (
                     <BannerShell
                            tone={daysRemaining <= 3 ? 'warning' : 'info'}
                            icon={<Sparkles size={17} />}
                            title={title}
                            subtitle="Todas las funciones están activas. Elegí tu plan cuando quieras y no perdés nada."
                            ctaLabel="Elegir plan"
                            ctaShort="Plan"
                     />
              )
       }

       if (status === 'EXPIRED' || status === 'SUSPENDED') {
              return (
                     <BannerShell
                            tone="danger"
                            icon={<ShieldX size={17} />}
                            title={status === 'SUSPENDED' ? 'Cuenta suspendida' : 'Tu prueba terminó'}
                            subtitle="Tus datos están guardados. Activá un plan y todo vuelve al instante."
                            ctaLabel={status === 'SUSPENDED' ? 'Renovar plan' : 'Activar plan'}
                            ctaShort="Plan"
                     />
              )
       }

       // Suscripción activa por vencer (authorized = MP o transferencia validada)
       const isActive = ['active', 'authorized'].includes(status?.toLowerCase() ?? '')
       if (isActive && daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 5) {
              return (
                     <BannerShell
                            tone="warning"
                            icon={<AlertCircle size={17} />}
                            title={daysRemaining === 0 ? 'Tu suscripción vence hoy' : `Tu suscripción vence en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`}
                            subtitle="Renovala antes del vencimiento para no perder acceso."
                            ctaLabel="Renovar"
                            ctaShort="Renovar"
                     />
              )
       }

       return null
}
