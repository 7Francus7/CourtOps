'use client'

import React, { useState } from 'react'
import {
  Check, Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2,
  ChevronRight, Shield, Building2, Zap, Rocket, Clock, X, Smartphone,
  Copy, ArrowLeft, BadgeCheck, TrendingUp, Ban, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { initiateSubscription, cancelSubscription, changePlan, cancelPendingDowngrade } from '@/actions/subscription'
import { submitBillingTransfer } from '@/actions/billing'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Plan {
  id: string
  name: string
  price: number
  setupFee?: number
  features: string[]
}

type CurrentPlan = {
  id: string
  name: string
  price: number
  setupFee?: number
  features?: string[] | string
}

interface BankDetails {
  alias: string
  cvu: string
  accountName: string
}

interface SubscriptionManagerProps {
  currentPlan: CurrentPlan | null
  subscriptionStatus: string | null
  nextBillingDate: Date | string | null
  availablePlans: Plan[]
  pendingPlan?: Plan | null
  pendingBillingCycle?: 'monthly' | 'yearly' | null
  isConfigured: boolean
  isDevMode?: boolean
  daysRemaining?: number | null
  subscriptionEnd?: string | null
  subscriptionMethod?: string | null
  bankDetails?: BankDetails
}

type FlowView = 'plans' | 'transfer-details' | 'receipt-form'

const PLAN_ICONS: Record<string, React.ReactNode> = {
  'Base': <Rocket className="w-5 h-5" />,
  'Pro': <Zap className="w-5 h-5" />,
  'Max': <Building2 className="w-5 h-5" />,
}

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Base': { bg: 'bg-sky-500', border: 'border-sky-500/30', text: 'text-sky-500' },
  'Pro': { bg: 'bg-emerald-500', border: 'border-emerald-500/30', text: 'text-emerald-500' },
  'Max': { bg: 'bg-violet-500', border: 'border-violet-500/30', text: 'text-violet-500' },
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function StatusBanner({
  status,
  daysRemaining,
  currentPlan,
  subscriptionEnd,
  subscriptionMethod,
}: {
  status: string | null
  daysRemaining: number | null | undefined
  currentPlan: CurrentPlan | null
  subscriptionEnd: string | null | undefined
  subscriptionMethod: string | null | undefined
}) {
  const isActive = ['authorized', 'active'].includes(status?.toLowerCase() ?? '')
  const isTrial = status === 'TRIAL'
  const isPending = status === 'PENDING_VALIDATION'
  const isSuspended = status === 'SUSPENDED'
  const isCancelled = ['cancelled', 'expired', 'EXPIRED'].includes(status ?? '')
  const isExpiringSoon = isActive && daysRemaining != null && daysRemaining <= 7 && daysRemaining > 0
  const endDateStr = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  if (isSuspended) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
        <Ban className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-400">Acceso suspendido</p>
          <p className="text-sm text-red-400/70 mt-0.5">
            Tu suscripción venció y el período de gracia terminó. Realizá una transferencia para reactivar.
          </p>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 animate-in fade-in duration-300 space-y-3">
        <div className="flex items-start gap-4">
          <Clock className="w-5 h-5 text-blue-400 animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-blue-400">Comprobante en revisión</p>
            <p className="text-sm text-blue-400/70 mt-0.5">
              Verificaremos tu transferencia y activaremos tu cuenta en las próximas horas.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
            Pendiente
          </span>
        </div>
        <div className="pl-9 space-y-1">
          <p className="text-xs text-blue-300/60">• Tu acceso se activa cuando validamos la transferencia.</p>
          <p className="text-xs text-blue-300/60">• Si ya transferiste, no hace falta volver a pagar.</p>
          <p className="text-xs text-blue-300/60">• ¿Dudas? Escribinos por WhatsApp y lo resolvemos en minutos.</p>
        </div>
      </div>
    )
  }

  if (isCancelled) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-400">Suscripción inactiva</p>
          <p className="text-sm text-red-400/70 mt-0.5">Elegí un plan para acceder a todas las funciones.</p>
        </div>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-400">
            Tu suscripción vence {daysRemaining === 1 ? 'mañana' : `en ${daysRemaining} días`}
          </p>
          <p className="text-sm text-amber-400/70 mt-0.5">
            {endDateStr ? `Fecha de vencimiento: ${endDateStr}.` : ''} Renovar antes para no perder acceso.
          </p>
        </div>
      </div>
    )
  }

  if (isActive && currentPlan) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <BadgeCheck className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-emerald-400">Plan {currentPlan.name} activo</p>
          <p className="text-xs text-emerald-400/60">
            {endDateStr ? `Vence el ${endDateStr}` : 'Suscripción activa'}
            {daysRemaining != null ? ` · ${daysRemaining} días restantes` : ''}
            {subscriptionMethod === 'TRANSFER' ? ' · Transferencia' : subscriptionMethod === 'MERCADOPAGO' ? ' · MercadoPago' : ''}
          </p>
        </div>
      </div>
    )
  }

  if (isTrial) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-primary">Trial gratuito</p>
          <p className="text-xs text-primary/60">
            {daysRemaining != null
              ? daysRemaining > 0 ? `Quedan ${daysRemaining} días de prueba` : 'Tu trial venció hoy'
              : 'Probando CourtOps sin costo'}
          </p>
        </div>
      </div>
    )
  }

  return null
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm font-mono text-foreground hover:text-primary transition-colors"
      title={`Copiar ${label}`}
    >
      <span>{value || '—'}</span>
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        : <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
    </button>
  )
}

function TransferDetailsCard({
  plan,
  cycle,
  bankDetails,
  onConfirm,
  onUseMp,
  loading,
}: {
  plan: Plan
  cycle: 'monthly' | 'yearly'
  bankDetails: BankDetails
  onConfirm: () => void
  onUseMp: () => void
  loading: boolean
}) {
  const amount = cycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{plan.name}</span>
        <ChevronRight className="w-4 h-4" />
        <span>{cycle === 'yearly' ? 'Anual' : 'Mensual'}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-bold text-foreground">{formatARS(amount)}</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Transferí a</p>
            <p className="font-bold text-foreground text-lg">{bankDetails.accountName}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Alias</p>
            <CopyButton value={bankDetails.alias} label="alias" />
          </div>
          {bankDetails.cvu && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">CVU</p>
              <CopyButton value={bankDetails.cvu} label="CVU" />
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Monto exacto</p>
            <CopyButton value={String(amount)} label="monto" />
            <p className="text-[10px] text-muted-foreground mt-1">
              Concepto sugerido: CourtOps {plan.name} {cycle === 'yearly' ? 'Anual' : 'Mensual'}
            </p>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <p className="text-xs text-amber-400/80">
            ⚠️ Transferí el monto exacto y usá el concepto indicado para agilizar la validación.
          </p>
        </div>
      </div>

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        Ya transferí, subir comprobante
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        onClick={onUseMp}
        disabled={loading}
        className="w-full py-2.5 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
      >
        <Smartphone className="w-4 h-4" />
        Prefiero pagar con MercadoPago
      </button>

      <p className="text-center text-xs text-muted-foreground/50 pb-1">
        MercadoPago queda disponible como alternativa — tiene comisión adicional.
      </p>
    </div>
  )
}

function ReceiptForm({
  plan,
  cycle,
  onBack,
  onSubmit,
  loading,
}: {
  plan: Plan
  cycle: 'monthly' | 'yearly'
  onBack: () => void
  onSubmit: (reference: string, receiptUrl: string) => void
  loading: boolean
}) {
  const [reference, setReference] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a los datos bancarios
      </button>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Confirmar transferencia · Plan {plan.name}
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Número de operación o alias desde donde transferiste <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: 987654321 o mi.alias.personal"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              URL del comprobante <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Podés subir la captura a Google Drive, Dropbox, etc. y pegar el link.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (!reference.trim()) {
            toast.error('Ingresá el número de operación o alias')
            return
          }
          onSubmit(reference.trim(), receiptUrl.trim())
        }}
        disabled={loading || !reference.trim()}
        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Enviar comprobante
      </button>
    </div>
  )
}

export default function SubscriptionManager({
  currentPlan,
  subscriptionStatus,
  nextBillingDate,
  availablePlans,
  pendingPlan,
  pendingBillingCycle,
  isConfigured,
  daysRemaining,
  subscriptionEnd,
  subscriptionMethod,
  bankDetails,
}: SubscriptionManagerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [view, setView] = useState<FlowView>('plans')
  const [showCancelModal, setShowCancelModal] = useState(false)

  const bank = bankDetails ?? { alias: 'courtops.admin', cvu: '', accountName: 'CourtOps' }

  const isActive = ['authorized', 'active'].includes(subscriptionStatus?.toLowerCase() ?? '')
  const isPending = subscriptionStatus === 'PENDING_VALIDATION'
  const isSuspended = subscriptionStatus === 'SUSPENDED'
  const isExpiringSoon = isActive && daysRemaining != null && daysRemaining <= 7 && daysRemaining > 0

  const getPrice = (plan: Plan) => billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price
  const sortedPlans = [...availablePlans].sort((a, b) => a.price - b.price)

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setView('transfer-details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUseMp = async () => {
    if (!selectedPlan) return
    setLoading(true)
    try {
      const fn = isActive && currentPlan ? changePlan : initiateSubscription
      const res = await fn(selectedPlan.id, billingCycle) as { success?: boolean; init_point?: string; pending?: boolean; message?: string; error?: string }
      if (res.success && res.init_point) {
        window.location.href = res.init_point
      } else if (res.success && res.pending) {
        toast.success(res.message || 'Cambio programado')
        router.refresh()
        setView('plans')
        setSelectedPlan(null)
      } else {
        toast.error(res.error || 'Error al procesar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleTransferSubmit = async (reference: string, receiptUrl: string) => {
    if (!selectedPlan) return
    setLoading(true)
    try {
      const res = await submitBillingTransfer(selectedPlan.id, billingCycle, reference, receiptUrl || undefined)
      if (res.success) {
        toast.success('Comprobante enviado. Activaremos tu plan en breve.')
        router.refresh()
        setView('plans')
        setSelectedPlan(null)
      } else {
        toast.error(res.error || 'Error al enviar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await cancelSubscription()
      if (res.success) {
        toast.success(res.message)
        router.refresh()
      } else {
        toast.error('Error al cancelar')
      }
    } finally {
      setLoading(false)
      setShowCancelModal(false)
    }
  }

  const handleCancelDowngrade = async () => {
    setLoading(true)
    try {
      await cancelPendingDowngrade()
      toast.success('Cambio de plan cancelado')
      router.refresh()
    } catch {
      toast.error('Error')
    } finally {
      setLoading(false)
    }
  }

  // Flow views
  if (view === 'transfer-details' && selectedPlan) {
    return (
      <div className="max-w-lg space-y-6">
        <StatusBanner
          status={subscriptionStatus}
          daysRemaining={daysRemaining}
          currentPlan={currentPlan}
          subscriptionEnd={subscriptionEnd}
          subscriptionMethod={subscriptionMethod}
        />
        <TransferDetailsCard
          plan={selectedPlan}
          cycle={billingCycle}
          bankDetails={bank}
          onConfirm={() => setView('receipt-form')}
          onUseMp={handleUseMp}
          loading={loading}
        />
      </div>
    )
  }

  if (view === 'receipt-form' && selectedPlan) {
    return (
      <div className="max-w-lg space-y-6">
        <ReceiptForm
          plan={selectedPlan}
          cycle={billingCycle}
          onBack={() => setView('transfer-details')}
          onSubmit={handleTransferSubmit}
          loading={loading}
        />
      </div>
    )
  }

  // Main plans view
  return (
    <div className="space-y-8">
      {!isConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-500 w-5 h-5 shrink-0" />
          <div>
            <p className="text-amber-400 font-semibold text-sm">Modo Demo</p>
            <p className="text-amber-400/60 text-xs">No se procesarán pagos reales.</p>
          </div>
        </div>
      )}

      <StatusBanner
        status={subscriptionStatus}
        daysRemaining={daysRemaining}
        currentPlan={currentPlan}
        subscriptionEnd={subscriptionEnd}
        subscriptionMethod={subscriptionMethod}
      />

      {pendingPlan && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Clock className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-400">Cambio de plan programado</p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Tu plan cambiará a <strong>{pendingPlan.name}</strong> ({pendingBillingCycle === 'yearly' ? 'anual' : 'mensual'}) al vencer el período actual
              {nextBillingDate ? ` (${new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })})` : ''}.
            </p>
          </div>
          <button
            onClick={handleCancelDowngrade}
            disabled={loading}
            className="shrink-0 text-xs text-amber-400/60 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            Cancelar
          </button>
        </div>
      )}

      {/* Transfer method banner — no commission */}
      {!isActive && !isPending && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-400">Pagá por transferencia bancaria</p>
            <p className="text-xs text-emerald-400/70">Sin comisiones · Alias, CVU o QR · Validación en el día</p>
          </div>
          <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            Recomendado
          </span>
        </div>
      )}

      {/* Billing cycle toggle */}
      {(!isActive || isExpiringSoon || isSuspended) && (
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-medium transition-all',
              billingCycle === 'monthly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all',
              billingCycle === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Anual
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">-20%</span>
          </button>
        </div>
      )}

      {/* Plan cards */}
      {(!isActive || isExpiringSoon || isSuspended) && (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {sortedPlans.map((plan) => {
              const isCurrent = currentPlan?.id === plan.id && isActive
              const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Base']
              const price = getPrice(plan)
              const isRecommended = plan.name.toLowerCase() === 'pro'

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-2xl border p-4 transition-colors',
                    isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' : isRecommended ? 'border-primary/35 bg-primary/5' : 'border-border bg-card',
                  )}
                >
                  {isRecommended && !isCurrent && (
                    <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary-foreground">
                      Recomendado
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white', colors.bg)}>
                      {PLAN_ICONS[plan.name] || <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{plan.name}</span>
                        {isCurrent && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Actual</span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{plan.features.length} características</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-black text-foreground tabular-nums">{formatARS(price)}</span>
                    <span className="text-sm text-muted-foreground ml-1">{billingCycle === 'yearly' ? '/año' : '/mes'}</span>
                    {billingCycle === 'yearly' && (
                      <p className="text-[11px] text-emerald-500 font-medium mt-0.5">equiv. {formatARS(Math.round(plan.price * 0.8))}/mes</p>
                    )}
                  </div>
                  {isCurrent ? (
                    <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />Plan activo
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={loading}
                      className={cn(
                        'w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2',
                        isRecommended ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-muted/70',
                      )}
                    >
                      Activar con transferencia
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop */}
          <div className="hidden md:block border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-muted/50 p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div>Plan</div>
              <div className="text-center">Precio</div>
              <div className="text-center">Características</div>
              <div className="text-right">Acción</div>
            </div>
            {sortedPlans.map((plan) => {
              const isCurrent = currentPlan?.id === plan.id && isActive
              const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Base']
              const price = getPrice(plan)
              const isRecommended = plan.name.toLowerCase() === 'pro'

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'grid grid-cols-4 p-4 items-center border-t border-border transition-colors hover:bg-muted/20',
                    isCurrent && 'bg-emerald-500/5',
                    isRecommended && !isCurrent && 'bg-primary/5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', colors.bg)}>
                      {PLAN_ICONS[plan.name] || <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{plan.name}</span>
                        {isCurrent && <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Actual</span>}
                        {isRecommended && !isCurrent && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Recomendado</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-bold text-foreground tabular-nums">{formatARS(price)}</span>
                    <span className="text-xs text-muted-foreground ml-1">{billingCycle === 'yearly' ? '/año' : '/mes'}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">{plan.features.length} características</span>
                  </div>
                  <div className="text-right">
                    {isCurrent ? (
                      <span className="text-sm text-emerald-500 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-4 h-4" />Plan activo
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={loading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                      >
                        Activar
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Features grid */}
      <div className="border border-border rounded-2xl p-4 md:p-6">
        <h3 className="text-lg font-bold mb-4">Características por plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {sortedPlans.map((plan) => {
            const colors = PLAN_COLORS[plan.name] || PLAN_COLORS['Base']
            const isCurrent = currentPlan?.id === plan.id && isActive
            return (
              <div key={plan.id} className={cn('p-4 rounded-xl border', isCurrent ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border')}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', colors.bg)}>
                    {PLAN_ICONS[plan.name] || <Zap className="w-4 h-4" />}
                  </div>
                  <span className="font-bold">{plan.name}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={cn('w-4 h-4 mt-0.5 shrink-0', colors.text)} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active subscription card */}
      {currentPlan && isActive && !isExpiringSoon && (
        <div className="border border-border rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold mb-4">Tu suscripción</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan actual</p>
                <p className="font-bold">{currentPlan.name}</p>
                <p className="text-sm text-muted-foreground">{formatARS(currentPlan.price)}/mes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencimiento</p>
                <p className="font-bold">
                  {subscriptionEnd
                    ? new Date(subscriptionEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : nextBillingDate
                    ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'No disponible'}
                </p>
                {daysRemaining != null && (
                  <p className="text-xs text-muted-foreground">{daysRemaining} días restantes</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Método de pago</p>
                <p className="font-bold capitalize">
                  {subscriptionMethod === 'TRANSFER' ? 'Transferencia bancaria' : subscriptionMethod === 'MERCADOPAGO' ? 'MercadoPago' : 'Automático'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              ¿Necesitás ayuda?{' '}
              <a href="mailto:soporte@courtops.com" className="text-primary hover:underline">Contactá soporte</a>
            </p>
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
              Cancelar suscripción
            </button>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Cancelar suscripción
            </DialogTitle>
            <DialogDescription>
              ¿Cancelar tu suscripción? Perderás acceso a las funciones del plan {currentPlan?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 my-4">
            <p className="text-sm text-amber-400">
              Tu acceso continúa hasta el{' '}
              {subscriptionEnd
                ? new Date(subscriptionEnd).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                : nextBillingDate
                ? new Date(nextBillingDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'vencimiento del período'}.
            </p>
          </div>
          <DialogFooter>
            <button onClick={() => setShowCancelModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Mantener suscripción
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Cancelar suscripción
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
