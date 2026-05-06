'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle,
  History,
  Loader2,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  NotebookPen,
  Send,
  Sparkles,
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
  CAMPAIGN_SEGMENTS,
  CAMPAIGN_VARIABLES,
  renderCampaignTemplate,
  type CampaignDeliveryType,
  type CampaignSegment,
} from '@/lib/whatsapp-campaigns'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
}

type ComposerData = Awaited<ReturnType<typeof getWhatsAppCampaignComposerData>>
type SendResult = Awaited<ReturnType<typeof sendWhatsAppCampaign>>
type HistoryStatusFilter = 'ALL' | 'SENT' | 'PARTIAL' | 'FAILED' | 'SIMULATED'

const DEFAULT_TEMPLATE = 'Hola {nombre}, te escribimos desde {club}. Tenemos turnos disponibles esta semana. Reserva aca: {link_reserva}'

export default function WhatsAppCampaignModal({ open, onClose }: Props) {
  const confirm = useConfirmation()
  const [segment, setSegment] = useState<CampaignSegment>('INACTIVE_30D')
  const [deliveryType, setDeliveryType] = useState<CampaignDeliveryType>('TEXT')
  const [message, setMessage] = useState(DEFAULT_TEMPLATE)
  const [templateName, setTemplateName] = useState('courtops_reactivacion_v1')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>('ALL')
  const [composer, setComposer] = useState<ComposerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

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

  useEffect(() => {
    if (!open) return
    setResult(null)
    void loadComposer(segment)
  }, [open, segment])

  const previewRecipient = composer?.recipientsPreview[0]

  const previewMessage = useMemo(() => {
    if (!composer) return ''

    return renderCampaignTemplate(message, {
      nombre: previewRecipient?.name || 'Jugador',
      club: composer.club.name,
      link_reserva: composer.club.reservationLink,
    })
  }, [composer, message, previewRecipient?.name])

  const filteredHistory = useMemo(() => {
    if (!composer) return []
    if (historyStatusFilter === 'ALL') return composer.history
    return composer.history.filter((item) => item.status === historyStatusFilter)
  }, [composer, historyStatusFilter])

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
            className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-[#25D366]/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366]">
                  <MessageCircle size={20} className="fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Campanas por WhatsApp</h3>
                  <p className="text-xs text-muted-foreground">Reactivacion, retencion y seguimiento comercial del club</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!result ? (
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                  <section className="space-y-5">
                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Megaphone size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Segmento</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
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
                              {segment === item.key ? <CheckCircle size={16} className="shrink-0 text-[#25D366]" /> : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MessagesSquare size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Modo de envio</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
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
                    </div>

                    <div className="rounded-[1.5rem] border border-border/60 bg-card/50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Mensaje</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {deliveryType === 'TEMPLATE'
                              ? 'Define el nombre exacto de la plantilla aprobada y el texto de referencia para preview e historial.'
                              : 'Usa variables para personalizar y llevar al cliente directo al link de reserva.'}
                          </p>
                        </div>
                        {loading ? <Loader2 size={16} className="animate-spin text-muted-foreground" /> : null}
                      </div>

                      {deliveryType === 'TEMPLATE' ? (
                        <div className="mb-3 rounded-2xl border border-border/60 bg-background/70 p-3">
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
                          <p className="mt-2 text-xs text-muted-foreground">
                            Se enviara usando `es_AR` y 3 parametros en este orden: nombre, club y link_reserva.
                          </p>
                        </div>
                      ) : null}

                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        rows={8}
                        className="w-full rounded-2xl border border-border/60 bg-background/80 p-4 text-sm outline-none transition-all focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/20"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        {CAMPAIGN_VARIABLES.map((variable) => (
                          <button
                            key={variable.key}
                            onClick={() => appendVariable(variable.label)}
                            className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:border-[#25D366]/40 hover:text-foreground"
                          >
                            {variable.label}
                          </button>
                        ))}
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
                        <History size={16} className="text-[#25D366]" />
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Audiencia</p>
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
                          ) : deliveryType === 'TEMPLATE' ? (
                            <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-500">
                              Modo plantilla activo. El nombre debe coincidir con una plantilla aprobada en Meta y aceptar 3 parametros: nombre, club y link_reserva.
                            </div>
                          ) : null}

                          <div className="mt-4 space-y-2">
                            {composer.recipientsPreview.map((recipient) => (
                              <div key={recipient.id} className="rounded-2xl border border-border/50 bg-background/70 p-3">
                                <p className="font-semibold">{recipient.name}</p>
                                <p className="text-xs text-muted-foreground">{recipient.phone}</p>
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
                        disabled={!composer?.club.hasWhatsAppFeature || !message.trim() || !composer?.reachableCount || sending || loading || (deliveryType === 'TEMPLATE' && !templateName.trim())}
                        className="flex-1 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {deliveryType === 'TEMPLATE' ? 'Enviar plantilla' : 'Enviar campana'}
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
