'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  History,
  Loader2,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Send,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  getWhatsAppCampaignComposerData,
  sendWhatsAppCampaign,
} from '@/actions/campaigns'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'
import {
  CAMPAIGN_DELIVERY_TYPES,
  CAMPAIGN_PLAYBOOKS,
  CAMPAIGN_SEGMENTS,
  TEMPLATE_CAMPAIGN_VARIABLE_KEYS,
  findUnsupportedTemplateVariables,
  renderCampaignTemplate,
  type CampaignDeliveryType,
  type CampaignPlaybookKey,
  type CampaignSegment,
  type CampaignVariableKey,
} from '@/lib/whatsapp-campaigns'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
}

type ComposerData = Awaited<ReturnType<typeof getWhatsAppCampaignComposerData>>
type SendResult = Awaited<ReturnType<typeof sendWhatsAppCampaign>>
type HistoryStatusFilter = 'ALL' | 'SENT' | 'PARTIAL' | 'FAILED' | 'SIMULATED'

const DEFAULT_PLAYBOOK = CAMPAIGN_PLAYBOOKS[0]

function buildPreviewVariables(composer: ComposerData | null) {
  const previewRecipient = composer?.recipientsPreview[0]

  return {
    nombre: previewRecipient?.name || 'Jugador',
    primer_nombre: previewRecipient?.firstName || previewRecipient?.name || 'Jugador',
    club: composer?.club.name || 'Tu club',
    link_reserva: composer?.club.reservationLink || '',
    dias_sin_jugar: previewRecipient?.daysSinceLastBooking?.toString() || '',
    deuda_reservas: previewRecipient?.debtCount?.toString() || '0',
    fecha_vencimiento: previewRecipient?.membershipExpiryLabel || '',
    dias_para_vencer: previewRecipient?.daysToMembershipExpiry?.toString() || '',
    dias_desde_alta: previewRecipient?.daysSinceCreated?.toString() || '0',
    reservas_60d: previewRecipient?.bookingsLast60?.toString() || '0',
  }
}

function getRecipientInsight(recipient: NonNullable<ComposerData>['recipientsPreview'][number], segment: CampaignSegment) {
  if (segment === 'INACTIVE_30D') {
    return recipient.daysSinceLastBooking != null
      ? `${recipient.daysSinceLastBooking} dias sin jugar`
      : 'Sin reservas recientes'
  }

  if (segment === 'MEMBERSHIP_EXPIRING') {
    if (!recipient.membershipExpiryLabel) return 'Sin vencimiento cargado'
    return `Vence ${recipient.membershipExpiryLabel} (${recipient.daysToMembershipExpiry ?? 0} dias)`
  }

  if (segment === 'WITH_DEBT') {
    return `${recipient.debtCount} reserva(s) vencidas pendientes`
  }

  if (segment === 'NEW_CLIENTS') {
    return `${recipient.daysSinceCreated} dias desde el alta`
  }

  return `${recipient.bookingsLast60} reservas ultimos 60 dias`
}

export default function WhatsAppCampaignModal({ open, onClose }: Props) {
  const confirm = useConfirmation()
  const [selectedPlaybook, setSelectedPlaybook] = useState<CampaignPlaybookKey>(DEFAULT_PLAYBOOK.key)
  const [segment, setSegment] = useState<CampaignSegment>(DEFAULT_PLAYBOOK.segment)
  const [deliveryType, setDeliveryType] = useState<CampaignDeliveryType>(DEFAULT_PLAYBOOK.deliveryType)
  const [message, setMessage] = useState<string>(DEFAULT_PLAYBOOK.template)
  const [templateName, setTemplateName] = useState<string>(DEFAULT_PLAYBOOK.templateName)
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('ALL')
  const [composer, setComposer] = useState<ComposerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  const activePlaybook = useMemo(
    () => CAMPAIGN_PLAYBOOKS.find((playbook) => playbook.key === selectedPlaybook) || DEFAULT_PLAYBOOK,
    [selectedPlaybook],
  )

  async function loadComposer(nextSegment: CampaignSegment) {
    setLoading(true)
    try {
      const data = await getWhatsAppCampaignComposerData(nextSegment)
      setComposer(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar la campana')
    } finally {
      setLoading(false)
    }
  }

  function applyPlaybook(playbookKey: CampaignPlaybookKey) {
    const playbook = CAMPAIGN_PLAYBOOKS.find((item) => item.key === playbookKey)
    if (!playbook) return

    setSelectedPlaybook(playbook.key)
    setSegment(playbook.segment)
    setDeliveryType(playbook.deliveryType)
    setMessage(playbook.template)
    setTemplateName(playbook.templateName)
  }

  useEffect(() => {
    if (!open) return
    setResult(null)
    void loadComposer(segment)
  }, [open, segment])

  const previewRecipient = composer?.recipientsPreview[0]
  const previewMessage = useMemo(
    () => renderCampaignTemplate(message, buildPreviewVariables(composer)),
    [composer, message],
  )

  const filteredHistory = useMemo(() => {
    if (!composer) return []
    if (historyStatusFilter === 'ALL') return composer.history
    return composer.history.filter((item) => item.status === historyStatusFilter)
  }, [composer, historyStatusFilter])

  const availableVariables = useMemo(() => {
    if (!composer) return []

    const recommendedVariableKeys = activePlaybook.recommendedVariables as readonly CampaignVariableKey[]
    const baseVariables = deliveryType === 'TEMPLATE'
      ? composer.variables.filter((variable) =>
        TEMPLATE_CAMPAIGN_VARIABLE_KEYS.includes(variable.key))
      : composer.variables

    const recommendedKeys = new Set<CampaignVariableKey>(recommendedVariableKeys)

    return [...baseVariables].sort((left, right) => {
      const leftPriority = recommendedKeys.has(left.key) ? 0 : 1
      const rightPriority = recommendedKeys.has(right.key) ? 0 : 1
      if (leftPriority !== rightPriority) return leftPriority - rightPriority
      return left.label.localeCompare(right.label, 'es')
    })
  }, [activePlaybook.recommendedVariables, composer, deliveryType])

  const templateUnsupportedVariables = useMemo(() => {
    if (deliveryType !== 'TEMPLATE') return []
    return findUnsupportedTemplateVariables(message)
  }, [deliveryType, message])

  const templateUnsupportedLabels = useMemo(() => {
    if (!composer) return []
    const labelByKey = new Map(composer.variables.map((variable) => [variable.key, variable.label]))
    return templateUnsupportedVariables.map((key) => labelByKey.get(key) || `{${key}}`)
  }, [composer, templateUnsupportedVariables])

  async function handleSend() {
    if (!composer || !message.trim() || composer.reachableCount === 0) return

    const approved = await confirm({
      title: deliveryType === 'TEMPLATE' ? 'Enviar plantilla por WhatsApp' : 'Enviar campana por WhatsApp',
      description: `Se enviara a ${composer.reachableCount} clientes del segmento "${composer.segment.label}". Esta accion quedara registrada en el historial.`,
      confirmLabel: 'Enviar campana',
      cancelLabel: 'Cancelar',
    })

    if (!approved) return

    setSending(true)
    try {
      const response = await sendWhatsAppCampaign({
        segment,
        message,
        deliveryType,
        templateName: deliveryType === 'TEMPLATE' ? templateName : undefined,
      })

      setResult(response)
      await loadComposer(segment)
      toast.success(
        response.simulated > 0
          ? 'Campana registrada en modo simulacion'
          : 'Campana enviada correctamente',
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar la campana')
    } finally {
      setSending(false)
    }
  }

  function appendVariable(variable: string) {
    setMessage((current) => `${current}${current.endsWith(' ') || current.length === 0 ? '' : ' '}${variable}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-[#25D366]/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366]">
                  <MessageCircle size={20} className="fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Campanas por WhatsApp</h3>
                  <p className="text-xs text-muted-foreground">Playbooks listos para reactivacion, retencion, cobro y onboarding</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!result ? (
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <section className="space-y-5">
                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <WandSparkles size={16} className="text-[#25D366]" />
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Playbooks</p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Elige un objetivo y arrancas con copy, variables y segmento listos.
                          </p>
                        </div>
                        {loading ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : null}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {CAMPAIGN_PLAYBOOKS.map((playbook) => {
                          const audienceCount = composer?.segmentReachCounts?.[playbook.segment] ?? 0

                          return (
                            <button
                              key={playbook.key}
                              onClick={() => applyPlaybook(playbook.key)}
                              className={cn(
                                'rounded-[1.35rem] border p-4 text-left transition-all',
                                selectedPlaybook === playbook.key
                                  ? 'border-[#25D366] bg-[#25D366]/10 shadow-[0_0_0_1px_rgba(37,211,102,0.15)]'
                                  : 'border-border/60 bg-background/70 hover:border-[#25D366]/40',
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#25D366]">
                                    {playbook.objective}
                                  </p>
                                  <p className="mt-1 text-base font-black">{playbook.label}</p>
                                </div>
                                {selectedPlaybook === playbook.key ? (
                                  <CheckCircle size={16} className="shrink-0 text-[#25D366]" />
                                ) : null}
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{playbook.description}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-secondary/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                                  {CAMPAIGN_SEGMENTS.find((item) => item.key === playbook.segment)?.label}
                                </span>
                                <span className="rounded-full bg-[#25D366]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#25D366]">
                                  {audienceCount} contactos
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Armado rapido</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Ajusta segmento, modo de envio y copy sin empezar desde cero.
                          </p>
                        </div>
                        <button
                          onClick={() => applyPlaybook(activePlaybook.key)}
                          className="rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-[#25D366]/40 hover:text-foreground"
                        >
                          Reaplicar playbook
                        </button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Megaphone size={15} className="text-[#25D366]" />
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Segmento</p>
                          </div>
                          <div className="grid gap-2">
                            {CAMPAIGN_SEGMENTS.map((item) => (
                              <button
                                key={item.key}
                                onClick={() => setSegment(item.key)}
                                className={cn(
                                  'rounded-2xl border p-3 text-left transition-all',
                                  segment === item.key
                                    ? 'border-[#25D366] bg-[#25D366]/10'
                                    : 'border-border/60 bg-background/70 hover:border-[#25D366]/40',
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-bold">{item.label}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                  <span className="rounded-full bg-secondary/70 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                                    {composer?.segmentReachCounts?.[item.key] ?? 0}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <MessagesSquare size={15} className="text-[#25D366]" />
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Modo de envio</p>
                          </div>
                          <div className="grid gap-2">
                            {CAMPAIGN_DELIVERY_TYPES.map((item) => (
                              <button
                                key={item.key}
                                onClick={() => setDeliveryType(item.key)}
                                className={cn(
                                  'rounded-2xl border p-3 text-left transition-all',
                                  deliveryType === item.key
                                    ? 'border-[#25D366] bg-[#25D366]/10'
                                    : 'border-border/60 bg-background/70 hover:border-[#25D366]/40',
                                )}
                              >
                                <p className="font-bold">{item.label}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                              </button>
                            ))}
                          </div>
                          {deliveryType === 'TEMPLATE' ? (
                            <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-xs text-violet-500">
                              En modo plantilla solo se envian {TEMPLATE_CAMPAIGN_VARIABLE_KEYS.map((key) => `{${key}}`).join(', ')}.
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.35rem] border border-border/60 bg-background/70 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Copy base</p>
                            <p className="mt-1 text-xs text-muted-foreground">{activePlaybook.description}</p>
                          </div>
                          <span className="rounded-full bg-[#25D366]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#25D366]">
                            {activePlaybook.objective}
                          </span>
                        </div>

                        {deliveryType === 'TEMPLATE' ? (
                          <div className="mb-3 rounded-2xl border border-border/60 bg-background/80 p-3">
                            <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                              <NotebookPen size={14} className="text-[#25D366]" />
                              Plantilla Meta aprobada
                            </label>
                            <input
                              value={templateName}
                              onChange={(event) => setTemplateName(event.target.value)}
                              placeholder="courtops_reactivacion_v1"
                              className="w-full rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm outline-none transition-all focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/20"
                            />
                          </div>
                        ) : null}

                        <textarea
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          rows={8}
                          className="w-full rounded-2xl border border-border/60 bg-background/80 p-4 text-sm outline-none transition-all focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/20"
                        />

                        {templateUnsupportedLabels.length > 0 ? (
                          <div className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-500">
                            Este copy usa variables no compatibles con plantilla Meta: {templateUnsupportedLabels.join(', ')}. Cambia a mensaje libre o deja solo variables basicas.
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {availableVariables.map((variable) => {
                            const recommended = (activePlaybook.recommendedVariables as readonly CampaignVariableKey[]).includes(variable.key)

                            return (
                              <button
                                key={variable.key}
                                onClick={() => appendVariable(variable.label)}
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                                  recommended
                                    ? 'border-[#25D366]/30 bg-[#25D366]/10 text-foreground hover:border-[#25D366]'
                                    : 'border-border/60 bg-secondary/50 text-muted-foreground hover:border-[#25D366]/40 hover:text-foreground',
                                )}
                              >
                                {variable.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Historial reciente</p>
                      </div>
                      {composer?.history.length ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {(['ALL', 'SENT', 'PARTIAL', 'FAILED', 'SIMULATED'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => setHistoryStatusFilter(status)}
                                className={cn(
                                  'rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
                                  historyStatusFilter === status
                                    ? 'border-[#25D366] bg-[#25D366]/10 text-foreground'
                                    : 'border-border/60 bg-background/70 text-muted-foreground hover:border-[#25D366]/40',
                                )}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          {filteredHistory.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-border/50 bg-background/70 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold">{CAMPAIGN_SEGMENTS.find((segmentItem) => segmentItem.key === item.segment)?.label || item.segment}</p>
                                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString('es-AR')}</p>
                                </div>
                                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                                  {item.status}
                                </span>
                              </div>
                              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                {item.deliveryType === 'TEMPLATE' ? `Plantilla: ${item.templateName || 'sin nombre'}` : 'Mensaje libre'}
                              </p>
                              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.previewMessage}</p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {item.sentCount}/{item.reachableCount} enviados - {item.failedCount} fallidos
                                {item.simulatedCount > 0 ? ` - ${item.simulatedCount} simulados` : ''}
                              </p>
                            </div>
                          ))}
                          {!filteredHistory.length ? (
                            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-center text-sm text-muted-foreground">
                              No hay campanas con ese estado.
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-center text-sm text-muted-foreground">
                          Todavia no hay campanas registradas.
                        </div>
                      )}
                    </div>
                  </section>

                  <aside className="space-y-5">
                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <ClipboardList size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Checklist y audiencia</p>
                      </div>

                      {composer ? (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Alcance estimado</p>
                              <p className="mt-2 text-3xl font-black">{composer.reachableCount}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{composer.segment.label}</p>
                            </div>
                            <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Reserva publica</p>
                              <p className="mt-2 truncate text-sm font-semibold">{composer.club.reservationLink}</p>
                            </div>
                            <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Entrega historica</p>
                              <p className="mt-2 text-3xl font-black">{composer.historySummary.deliveryRate}%</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {composer.historySummary.sent}/{composer.historySummary.reachable} enviados en {composer.historySummary.campaigns} campanas
                              </p>
                            </div>
                          </div>

                          {!composer.club.hasWhatsAppFeature ? (
                            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-500">
                              Tu plan no incluye campanas automaticas por WhatsApp.
                            </div>
                          ) : composer.club.isSimulationMode ? (
                            <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-500">
                              WhatsApp no esta configurado en entorno real. El envio se registrara en modo simulacion.
                            </div>
                          ) : null}

                          <div className="mt-4 rounded-2xl border border-border/50 bg-background/70 p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Checklist sugerido</p>
                            <div className="mt-3 space-y-2">
                              {activePlaybook.launchChecklist.map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-[#25D366]" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="mb-2 flex items-center gap-2">
                              <History size={15} className="text-[#25D366]" />
                              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Muestra de destinatarios</p>
                            </div>
                            {composer.recipientsPreview.map((recipient) => (
                              <div key={recipient.id} className="rounded-2xl border border-border/50 bg-background/70 p-3">
                                <p className="font-semibold">{recipient.name}</p>
                                <p className="text-xs text-muted-foreground">{recipient.phone}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{getRecipientInsight(recipient, segment)}</p>
                              </div>
                            ))}
                            {composer.reachableCount > composer.recipientsPreview.length ? (
                              <p className="text-xs text-muted-foreground">
                                Mostrando {composer.recipientsPreview.length} de {composer.reachableCount} destinatarios.
                              </p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <div className="flex min-h-[200px] items-center justify-center">
                          <Loader2 size={22} className="animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MessageCircle size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Previsualizacion</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-[#25D366]/15 bg-[#25D366]/5 p-4">
                        <p className="mb-2 text-xs text-muted-foreground">
                          Vista para {previewRecipient?.name || 'Jugador'}
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6">{previewMessage || 'Escribe un mensaje para ver la previsualizacion.'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 rounded-2xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={
                          !composer?.club.hasWhatsAppFeature ||
                          !message.trim() ||
                          !composer?.reachableCount ||
                          sending ||
                          loading ||
                          (deliveryType === 'TEMPLATE' && (!templateName.trim() || templateUnsupportedVariables.length > 0))
                        }
                        className="flex-1 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {deliveryType === 'TEMPLATE' ? 'Enviar plantilla' : 'Lanzar campana'}
                        </span>
                      </button>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="space-y-4 py-8 text-center">
                  <CheckCircle size={48} className="mx-auto text-[#25D366]" />
                  <div>
                    <h4 className="text-xl font-black">{result.sent} mensajes procesados</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      de {result.total} destinatarios - {result.failed} fallidos
                      {result.simulated > 0 ? ` - ${result.simulated} simulados` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.deliveryType === 'TEMPLATE' ? `Plantilla ${result.templateName || 'sin nombre'}` : 'Mensaje libre'}
                    </p>
                  </div>
                  {result.failedRecipients.length > 0 ? (
                    <div className="mx-auto max-w-xl rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-left text-sm text-amber-500">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <p className="font-bold">Destinatarios fallidos</p>
                      </div>
                      <p>{result.failedRecipients.join(', ')}</p>
                    </div>
                  ) : null}
                  <button onClick={onClose} className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
