'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { getPublicBookingGrowthSummary } from '@/actions/public-growth'
import { cn } from '@/lib/utils'
import {
       BarChart3,
       Copy,
       Download,
       ExternalLink,
       Instagram,
       Link2,
       Loader2,
       MapPinned,
       MessageCircle,
       QrCode,
       X
} from 'lucide-react'
import { toast } from 'sonner'

type GrowthSummary = {
       success: boolean
       slug: string
       days: number
       events: {
              page_view: number
              date_selected: number
              slot_selected: number
              booking_created: number
              waitlist_created: number
       }
       conversionRate: number
       sources: {
              source: string
              medium: string
              campaign: string
              views: number
              bookings: number
              waitlist: number
       }[]
}

type Channel = {
       id: string
       label: string
       source: string
       medium: string
       campaign: string
       icon: React.ElementType
       helper: string
}

const CHANNELS: Channel[] = [
       {
              id: 'google',
              label: 'Google Business',
              source: 'google',
              medium: 'business_profile',
              campaign: 'public_booking',
              icon: MapPinned,
              helper: 'Usalo en el boton de reservas o en el perfil del club.'
       },
       {
              id: 'instagram',
              label: 'Instagram Bio',
              source: 'instagram',
              medium: 'bio',
              campaign: 'public_booking',
              icon: Instagram,
              helper: 'Pone este link en la bio y en historias destacadas.'
       },
       {
              id: 'whatsapp',
              label: 'WhatsApp',
              source: 'whatsapp',
              medium: 'broadcast',
              campaign: 'public_booking',
              icon: MessageCircle,
              helper: 'Compartilo en estados, grupos o respuestas rapidas.'
       },
       {
              id: 'qr_counter',
              label: 'QR Mostrador',
              source: 'qr',
              medium: 'counter',
              campaign: 'public_booking',
              icon: QrCode,
              helper: 'Ideal para recepcion, barra y carteleria del club.'
       }
]

function buildTrackedUrl(origin: string, slug: string, channel: Channel) {
       const url = new URL(`/p/${slug}`, origin)
       url.searchParams.set('utm_source', channel.source)
       url.searchParams.set('utm_medium', channel.medium)
       url.searchParams.set('utm_campaign', channel.campaign)
       return url.toString()
}

export default function PublicBookingGrowthKit({
       isOpen,
       onClose,
       slug
}: {
       isOpen: boolean
       onClose: () => void
       slug?: string
}) {
       const [origin, setOrigin] = useState('')
       const [selectedChannelId, setSelectedChannelId] = useState(CHANNELS[0].id)
       const [summary, setSummary] = useState<GrowthSummary | null>(null)
       const [isLoading, setIsLoading] = useState(false)

       useEffect(() => {
              if (typeof window !== 'undefined') {
                     setOrigin(window.location.origin)
              }
       }, [])

       useEffect(() => {
              if (!isOpen) return

              let cancelled = false
              setIsLoading(true)
              getPublicBookingGrowthSummary(14)
                     .then(result => {
                            if (!cancelled) setSummary(result as GrowthSummary)
                     })
                     .catch(error => {
                            console.error(error)
                            if (!cancelled) toast.error('No se pudo cargar el embudo publico')
                     })
                     .finally(() => {
                            if (!cancelled) setIsLoading(false)
                     })

              return () => {
                     cancelled = true
              }
       }, [isOpen])

       const activeSlug = slug || summary?.slug || ''
       const selectedChannel = CHANNELS.find(channel => channel.id === selectedChannelId) || CHANNELS[0]
       const selectedUrl = useMemo(() => {
              if (!origin || !activeSlug) return ''
              return buildTrackedUrl(origin, activeSlug, selectedChannel)
       }, [activeSlug, origin, selectedChannel])

       const plainPublicUrl = useMemo(() => {
              if (!origin || !activeSlug) return ''
              return `${origin}/p/${activeSlug}`
       }, [activeSlug, origin])

       const shareText = `Reserva tu cancha online en ${plainPublicUrl}`

       const copyText = async (text: string, label: string) => {
              try {
                     await navigator.clipboard.writeText(text)
                     toast.success(`${label} copiado`)
              } catch {
                     toast.error('No se pudo copiar')
              }
       }

       const downloadQr = () => {
              const canvas = document.getElementById('public-booking-growth-qr') as HTMLCanvasElement | null
              if (!canvas) return

              const link = document.createElement('a')
              link.download = `courtops-qr-${selectedChannel.id}.png`
              link.href = canvas.toDataURL('image/png')
              link.click()
       }

       if (!isOpen) return null

       const funnel = summary?.events
       const sourceRows = summary?.sources.slice(0, 5) || []

       return (
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                     <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
                            <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
                                   <div>
                                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                                 Booking publico
                                          </p>
                                          <h2 className="mt-1 text-xl font-black text-foreground">
                                                 Canales y conversion
                                          </h2>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
                                   >
                                          <X size={18} />
                                   </button>
                            </div>

                            <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
                                   <div className="space-y-5 border-b border-border p-5 lg:border-b-0 lg:border-r">
                                          <div className="grid gap-2 sm:grid-cols-2">
                                                 {CHANNELS.map(channel => {
                                                        const Icon = channel.icon
                                                        const isActive = channel.id === selectedChannelId
                                                        return (
                                                               <button
                                                                      key={channel.id}
                                                                      type="button"
                                                                      onClick={() => setSelectedChannelId(channel.id)}
                                                                      className={cn(
                                                                             'flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors',
                                                                             isActive
                                                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                                                    : 'border-border bg-card text-foreground hover:border-primary/20'
                                                                      )}
                                                               >
                                                                      <Icon size={18} className="mt-0.5 shrink-0" />
                                                                      <span>
                                                                             <span className="block text-sm font-black">{channel.label}</span>
                                                                             <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                                                                    {channel.helper}
                                                                             </span>
                                                                      </span>
                                                               </button>
                                                        )
                                                 })}
                                          </div>

                                          <div className="rounded-2xl border border-border bg-card p-4">
                                                 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0">
                                                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                                      Link trackeado
                                                               </p>
                                                               <p className="mt-2 break-all rounded-xl bg-muted px-3 py-2 text-xs font-bold text-foreground">
                                                                      {selectedUrl || 'Generando link...'}
                                                               </p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-2">
                                                               <button
                                                                      onClick={() => copyText(selectedUrl, 'Link')}
                                                                      disabled={!selectedUrl}
                                                                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                                                                      title="Copiar link"
                                                               >
                                                                      <Copy size={16} />
                                                               </button>
                                                               <button
                                                                      onClick={() => selectedUrl && window.open(selectedUrl, '_blank', 'noopener,noreferrer')}
                                                                      disabled={!selectedUrl}
                                                                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                                                                      title="Abrir link"
                                                               >
                                                                      <ExternalLink size={16} />
                                                               </button>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="grid gap-4 sm:grid-cols-[190px_1fr]">
                                                 <div className="rounded-2xl border border-border bg-white p-4">
                                                        {selectedUrl && (
                                                               <QRCodeCanvas
                                                                      id="public-booking-growth-qr"
                                                                      value={selectedUrl}
                                                                      size={158}
                                                                      level="H"
                                                                      includeMargin
                                                               />
                                                        )}
                                                 </div>
                                                 <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                               Acciones rapidas
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                               <button
                                                                      onClick={downloadQr}
                                                                      disabled={!selectedUrl}
                                                                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground transition-opacity disabled:opacity-40"
                                                               >
                                                                      <Download size={14} />
                                                                      Descargar QR
                                                               </button>
                                                               <button
                                                                      onClick={() => copyText(shareText, 'Texto')}
                                                                      disabled={!plainPublicUrl}
                                                                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:text-primary disabled:opacity-40"
                                                               >
                                                                      <Link2 size={14} />
                                                                      Texto para publicar
                                                               </button>
                                                        </div>
                                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                                               {shareText}
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="space-y-5 p-5">
                                          <div className="flex items-center justify-between">
                                                 <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                                               Ultimos 14 dias
                                                        </p>
                                                        <h3 className="mt-1 text-lg font-black text-foreground">Embudo publico</h3>
                                                 </div>
                                                 {isLoading && <Loader2 size={18} className="animate-spin text-muted-foreground" />}
                                          </div>

                                          <div className="grid grid-cols-2 gap-2">
                                                 <Metric label="Vistas" value={funnel?.page_view || 0} />
                                                 <Metric label="Turnos elegidos" value={funnel?.slot_selected || 0} />
                                                 <Metric label="Reservas" value={funnel?.booking_created || 0} accent="text-emerald-500" />
                                                 <Metric label="Conversion" value={`${summary?.conversionRate || 0}%`} accent="text-primary" />
                                          </div>

                                          <div className="rounded-2xl border border-border bg-card p-4">
                                                 <div className="mb-3 flex items-center gap-2">
                                                        <BarChart3 size={16} className="text-primary" />
                                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                               Fuentes
                                                        </p>
                                                 </div>
                                                 {sourceRows.length === 0 ? (
                                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                                               Todavia no hay datos de canales.
                                                        </p>
                                                 ) : (
                                                        <div className="space-y-2">
                                                               {sourceRows.map(source => (
                                                                      <div key={`${source.source}-${source.medium}`} className="rounded-xl border border-border bg-background p-3">
                                                                             <div className="flex items-center justify-between gap-3">
                                                                                    <div className="min-w-0">
                                                                                           <p className="truncate text-sm font-black text-foreground">
                                                                                                  {source.source} / {source.medium}
                                                                                           </p>
                                                                                           <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                                                                                  {source.campaign}
                                                                                           </p>
                                                                                    </div>
                                                                                    <div className="text-right text-xs font-bold text-muted-foreground">
                                                                                           <span className="text-foreground">{source.bookings}</span> reservas
                                                                                           <br />
                                                                                           <span className="text-foreground">{source.waitlist}</span> espera
                                                                                    </div>
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                            </div>
                     </div>
              </div>
       )
}

function Metric({
       label,
       value,
       accent = 'text-foreground'
}: {
       label: string
       value: number | string
       accent?: string
}) {
       return (
              <div className="rounded-2xl border border-border bg-card p-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                     <p className={cn('mt-1 text-2xl font-black', accent)}>{value}</p>
              </div>
       )
}
