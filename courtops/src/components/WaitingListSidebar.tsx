'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { addToWaitingList, getWaitingList, resolveWaitingList, updateWaitingListStatus } from '@/actions/waitingList'
import { useConfirmation } from '@/components/providers/ConfirmationProvider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getOpportunityMessage({
       name,
       notes,
       preferredTimeLabel,
       preferredCourtId,
       date
}: {
       name: string
       notes?: string
       preferredTimeLabel?: string | null
       preferredCourtId?: number | null
       date?: Date
}) {
       const dateLabel = date ? format(date, "d 'de' MMMM", { locale: es }) : null
       const slotLine = [
              dateLabel ? `para el ${dateLabel}` : null,
              preferredTimeLabel ? `a las ${preferredTimeLabel}` : null,
              preferredCourtId ? `en Cancha ${preferredCourtId}` : null
       ].filter(Boolean).join(' ')

       return [
              `Hola ${name}, se libero un turno${slotLine ? ` ${slotLine}` : ''} y te tengo en lista de espera.`,
              notes ? `Referencia: ${notes}` : null,
              'Si queres, te ayudo a reservar ahora.'
       ].filter(Boolean).join('\n')
}

function getWhatsAppUrl(phone: string, text: string) {
       let cleanPhone = phone.replace(/\D/g, '')
       if (cleanPhone.startsWith('0')) cleanPhone = '54' + cleanPhone.slice(1)
       if (!cleanPhone.startsWith('54') && cleanPhone.length <= 10) cleanPhone = '54' + cleanPhone

       return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}

type WaitingItem = {
       id: number
       name: string
       phone: string
       startTime?: string | Date | null
       endTime?: string | Date | null
       notes?: string | null
       court?: { id?: number; name: string } | null
       createdAt: string | Date
}

type WaitingListSidebarProps = {
       date: Date
       clubId?: string
       preferredStartTime?: string | null
       preferredCourtId?: number | null
       isOpen: boolean
       onClose: () => void
       onConvertToBooking?: (_data: {
              courtId?: number
              time?: string
              date: Date
              clientName?: string
              clientPhone?: string
              notes?: string
              waitingListId?: number
       }) => void
}

export default function WaitingListSidebar({
       date,
       clubId,
       preferredStartTime,
       preferredCourtId,
       isOpen,
       onClose,
       onConvertToBooking
}: WaitingListSidebarProps) {
       const confirmAction = useConfirmation()
       const [list, setList] = useState<WaitingItem[]>([])
       const [summary, setSummary] = useState({
              pending: 0,
              contacted: 0,
              noResponse: 0,
              fulfilled: 0
       })
       const [isLoading, setIsLoading] = useState(false)
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [formData, setFormData] = useState({
              name: '',
              phone: '',
              startTime: '',
              notes: ''
       })

       const preferredTimeLabel = useMemo(() => {
              if (!preferredStartTime) return null
              return format(new Date(preferredStartTime), 'HH:mm')
       }, [preferredStartTime])

       const fetchList = useCallback(async () => {
              setIsLoading(true)
              const response = await getWaitingList(date.toISOString())
              if (response.success) {
                     setList(response.list as unknown as WaitingItem[])
                     setSummary(response.summary)
              }
              setIsLoading(false)
       }, [date])

       useEffect(() => {
              if (isOpen) {
                     fetchList()
              }
       }, [fetchList, isOpen])

       useEffect(() => {
              if (!isOpen || !clubId) return

              const selectedDateKey = format(date, 'yyyy-MM-dd')
              let channel:
                     | {
                            bind: (_event: string, _callback: (_data: Record<string, unknown>) => void) => void
                            unbind_all: () => void
                            unsubscribe: () => void
                     }
                     | undefined

              const connectPusher = async () => {
                     try {
                            const { pusherClient } = await import('@/lib/pusher')
                            channel = pusherClient.subscribe(`club-${clubId}`)

                            channel.bind('waiting-list-update', (payload: Record<string, unknown>) => {
                                   const payloadDate = typeof payload.dateStr === 'string' ? payload.dateStr.slice(0, 10) : ''
                                   if (payloadDate !== selectedDateKey) return

                                   fetchList()

                                   if (payload.action === 'create') {
                                          const sourceLabel = payload.source === 'public' ? 'desde la reserva online' : 'en lista de espera'
                                          toast.success((payload.name as string) || 'Nueva solicitud', {
                                                 description: `Se agrego ${sourceLabel}.`,
                                                 position: 'top-center',
                                                 duration: 4000
                                          })
                                   } else if (payload.action === 'status') {
                                          const status = typeof payload.status === 'string' ? payload.status : ''
                                          const description = status === 'CONTACTED'
                                                 ? 'Marcado como contactado.'
                                                 : status === 'NO_RESPONSE'
                                                        ? 'Marcado sin respuesta.'
                                                        : 'Estado actualizado.'
                                          toast.info((payload.name as string) || 'Lista de espera', {
                                                 description,
                                                 position: 'top-center',
                                                 duration: 3000
                                          })
                                   }
                            })
                     } catch (error) {
                            console.error('Waiting list realtime error:', error)
                     }
              }

              connectPusher()

              return () => {
                     if (channel) {
                            channel.unbind_all()
                            channel.unsubscribe()
                     }
              }
       }, [clubId, date, fetchList, isOpen])

       const prioritizedList = useMemo(() => {
              if (!preferredTimeLabel && !preferredCourtId) return list

              return [...list].sort((a, b) => {
                     const score = (item: WaitingItem) => {
                            let value = 0

                            if (preferredTimeLabel && item.startTime) {
                                   const itemTime = format(new Date(item.startTime), 'HH:mm')
                                   if (itemTime === preferredTimeLabel) value += 3
                            } else if (preferredTimeLabel && !item.startTime) {
                                   value += 1
                            }

                            if (preferredCourtId && item.court?.id === preferredCourtId) {
                                   value += 2
                            } else if (preferredCourtId && !item.court?.id) {
                                   value += 1
                            }

                            return value
                     }

                     return score(b) - score(a)
              })
       }, [list, preferredCourtId, preferredTimeLabel])

       const prioritizedMatches = useMemo(() => {
              if (!preferredTimeLabel && !preferredCourtId) return []

              return prioritizedList.filter(item => {
                     const isPreferredTime = preferredTimeLabel && item.startTime
                            ? format(new Date(item.startTime), 'HH:mm') === preferredTimeLabel
                            : false
                     const isPreferredCourt = preferredCourtId ? item.court?.id === preferredCourtId : false
                     const isFlexibleTime = Boolean(preferredTimeLabel && !item.startTime)
                     const isFlexibleCourt = Boolean(preferredCourtId && !item.court?.id)

                     return isPreferredTime || isPreferredCourt || isFlexibleTime || isFlexibleCourt
              })
       }, [preferredCourtId, preferredTimeLabel, prioritizedList])

       const topOpportunityLead = prioritizedMatches[0] ?? null
       const topOpportunityMessage = topOpportunityLead
              ? getOpportunityMessage({
                     name: topOpportunityLead.name,
                     notes: topOpportunityLead.notes || undefined,
                     preferredTimeLabel,
                     preferredCourtId,
                     date
              })
              : null

       async function handleSubmit(event: React.FormEvent) {
              event.preventDefault()
              setIsSubmitting(true)

              let startDate: Date | undefined
              if (formData.startTime) {
                     const [hours, minutes] = formData.startTime.split(':').map(Number)
                     startDate = new Date(date)
                     startDate.setHours(hours, minutes, 0, 0)
              }

              const response = await addToWaitingList({
                     date,
                     startTime: startDate,
                     clientName: formData.name,
                     clientPhone: formData.phone,
                     notes: formData.notes
              })

              if (response.success) {
                     toast.success('Agregado a lista de espera')
                     setFormData({ name: '', phone: '', startTime: '', notes: '' })
                     fetchList()
              } else {
                     toast.error(response.error || 'Error')
              }

              setIsSubmitting(false)
       }

       async function handleRemove(id: number) {
              const confirmed = await confirmAction({
                     title: 'Eliminar de la lista',
                     description: 'Borrar a esta persona de la lista de espera?',
                     confirmLabel: 'Eliminar',
                     variant: 'destructive'
              })
              if (!confirmed) return

              await resolveWaitingList(id, 'DELETE')
              fetchList()
              toast.success('Eliminado')
       }

       async function handleFulfill(id: number) {
              const confirmed = await confirmAction({
                     title: 'Marcar como cubierto',
                     description: 'Sacar esta solicitud de la lista porque el turno ya fue resuelto?',
                     confirmLabel: 'Marcar',
                     variant: 'default'
              })
              if (!confirmed) return

              await resolveWaitingList(id, 'FULFILLED')
              fetchList()
              toast.success('Solicitud resuelta')
       }

       async function handleMarkStatus(id: number, status: 'CONTACTED' | 'NO_RESPONSE') {
              const confirmed = await confirmAction({
                     title: status === 'CONTACTED' ? 'Marcar como contactado' : 'Marcar sin respuesta',
                     description: status === 'CONTACTED'
                            ? 'Mover esta solicitud a contactado para seguir el rescate?'
                            : 'Sacar esta solicitud de pendientes porque no respondio?',
                     confirmLabel: status === 'CONTACTED' ? 'Marcar' : 'Confirmar',
                     variant: 'default'
              })
              if (!confirmed) return

              const response = await updateWaitingListStatus(id, status)
              if (response.success) {
                     fetchList()
                     toast.success(status === 'CONTACTED' ? 'Marcado como contactado' : 'Marcado sin respuesta')
              } else {
                     toast.error(response.error || 'No se pudo actualizar')
              }
       }

       async function handleCopyOpportunityMessage() {
              if (!topOpportunityMessage) return

              try {
                     await navigator.clipboard.writeText(topOpportunityMessage)
                     toast.success('Mensaje copiado')
              } catch {
                     toast.error('No se pudo copiar el mensaje')
              }
       }

       async function handleOpenWhatsApp(item: WaitingItem, text: string) {
              window.open(getWhatsAppUrl(item.phone, text), '_blank', 'noopener,noreferrer')

              const response = await updateWaitingListStatus(item.id, 'CONTACTED')
              if (response.success) {
                     fetchList()
              }
       }

       function handleConvertLead(item: WaitingItem) {
              if (!onConvertToBooking) return

              const initialTime = preferredTimeLabel
                     || (item.startTime ? format(new Date(item.startTime), 'HH:mm') : undefined)
              const initialCourtId = preferredCourtId || item.court?.id

              onConvertToBooking({
                     date,
                     time: initialTime,
                     courtId: initialCourtId,
                     clientName: item.name,
                     clientPhone: item.phone,
                     notes: item.notes || undefined,
                     waitingListId: item.id
              })
              onClose()
       }

       return (
              <>
                     {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />}

                     <div
                            className={cn(
                                   'fixed inset-y-0 right-0 z-50 flex w-full transform flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 sm:w-96',
                                   isOpen ? 'translate-x-0' : 'translate-x-full'
                            )}
                     >
                            <div className="flex items-center justify-between border-b border-border bg-card p-6">
                                   <div>
                                          <h2 className="text-xl font-bold text-foreground">Lista de espera</h2>
                                          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                                                 {format(date, "EEEE d 'de' MMMM", { locale: es })}
                                          </p>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                   >
                                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                 <path d="M18 6L6 18M6 6l12 12" />
                                          </svg>
                                   </button>
                            </div>

                            <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6">
                                   <div className="grid grid-cols-2 gap-2">
                                          <div className="rounded-xl border border-border bg-card p-3">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pendientes</p>
                                                 <p className="mt-1 text-2xl font-black text-foreground">{summary.pending}</p>
                                          </div>
                                          <div className="rounded-xl border border-border bg-card p-3">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contactados</p>
                                                 <p className="mt-1 text-2xl font-black text-blue-500">{summary.contacted}</p>
                                          </div>
                                          <div className="rounded-xl border border-border bg-card p-3">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin respuesta</p>
                                                 <p className="mt-1 text-2xl font-black text-amber-500">{summary.noResponse}</p>
                                          </div>
                                          <div className="rounded-xl border border-border bg-card p-3">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resueltas</p>
                                                 <p className="mt-1 text-2xl font-black text-emerald-500">{summary.fulfilled}</p>
                                          </div>
                                   </div>

                                   {(preferredTimeLabel || preferredCourtId) && (
                                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                                 <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                                        Oportunidad detectada
                                                 </p>
                                                 <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">
                                                        Se libero un turno y la lista fue ordenada para mostrar primero a quienes mejor matchean.
                                                 </p>
                                                 <p className="mt-2 text-[11px] font-bold text-primary">
                                                        {preferredTimeLabel ? `Horario: ${preferredTimeLabel} hs` : 'Horario flexible'}
                                                        {preferredCourtId ? ` · Cancha ${preferredCourtId}` : ''}
                                                 </p>
                                                 {topOpportunityLead ? (
                                                        <div className="mt-4 rounded-xl border border-primary/20 bg-background/80 p-3">
                                                               <div className="flex items-start justify-between gap-3">
                                                                      <div>
                                                                             <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                                                                                    Mejor candidato
                                                                             </p>
                                                                             <p className="mt-1 text-sm font-bold text-foreground">
                                                                                    {topOpportunityLead.name}
                                                                             </p>
                                                                             <p className="text-xs text-muted-foreground">
                                                                                    {topOpportunityLead.phone}
                                                                             </p>
                                                                      </div>
                                                                      <div className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                                                             {prioritizedMatches.length} match{prioritizedMatches.length === 1 ? '' : 'es'}
                                                                      </div>
                                                               </div>
                                                               <div className="mt-3 flex flex-wrap gap-2">
                                                                      {onConvertToBooking && (
                                                                             <button
                                                                                    type="button"
                                                                                    onClick={() => handleConvertLead(topOpportunityLead)}
                                                                                    className="rounded-lg border border-primary/20 bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                                                                             >
                                                                                    Reservar ahora
                                                                             </button>
                                                                      )}
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => topOpportunityMessage && handleOpenWhatsApp(topOpportunityLead, topOpportunityMessage)}
                                                                             className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                                                      >
                                                                             WhatsApp primero
                                                                      </button>
                                                                      <button
                                                                             type="button"
                                                                             onClick={handleCopyOpportunityMessage}
                                                                             className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
                                                                      >
                                                                             Copiar mensaje
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 ) : (
                                                        <p className="mt-3 text-xs text-muted-foreground">
                                                               No hay matches exactos todavia. Quedan primero quienes dejaron horario o cancha flexible.
                                                        </p>
                                                 )}
                                          </div>
                                   )}

                                   <div className="rounded-xl border border-border bg-muted/50 p-4 dark:bg-white/5">
                                          <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                 Nueva solicitud
                                          </h3>
                                          <form onSubmit={handleSubmit} className="space-y-3">
                                                 <input
                                                        required
                                                        placeholder="Nombre cliente"
                                                        className="w-full rounded-lg border border-border bg-muted p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary dark:bg-black/30"
                                                        value={formData.name}
                                                        onChange={event => setFormData(current => ({ ...current, name: event.target.value }))}
                                                 />
                                                 <div className="flex gap-3">
                                                        <input
                                                               required
                                                               placeholder="Telefono"
                                                               className="flex-1 rounded-lg border border-border bg-muted p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary dark:bg-black/30"
                                                               value={formData.phone}
                                                               onChange={event => setFormData(current => ({ ...current, phone: event.target.value }))}
                                                        />
                                                        <input
                                                               type="time"
                                                               className="w-24 rounded-lg border border-border bg-muted p-3 text-sm text-foreground outline-none focus:border-primary dark:bg-black/30"
                                                               value={formData.startTime}
                                                               onChange={event => setFormData(current => ({ ...current, startTime: event.target.value }))}
                                                        />
                                                 </div>
                                                 <textarea
                                                        placeholder="Notas (prefiere Cancha 1, etc)"
                                                        className="h-20 w-full resize-none rounded-lg border border-border bg-muted p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary dark:bg-black/30"
                                                        value={formData.notes}
                                                        onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))}
                                                 />
                                                 <button
                                                        disabled={isSubmitting}
                                                        type="submit"
                                                        className="w-full rounded-lg bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? 'Guardando...' : 'Agregar a lista'}
                                                 </button>
                                          </form>
                                   </div>

                                   <div>
                                          <h3 className="mb-4 flex items-center justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                 En espera
                                                 <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground dark:bg-white/10">
                                                        {prioritizedList.length}
                                                 </span>
                                          </h3>

                                          {isLoading ? (
                                                 <div className="flex justify-center py-8">
                                                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-muted-foreground/30" />
                                                 </div>
                                          ) : prioritizedList.length === 0 ? (
                                                 <div className="py-8 text-center text-sm italic text-muted-foreground/50">
                                                        No hay nadie en espera hoy.
                                                 </div>
                                          ) : (
                                                 <div className="space-y-3">
                                                        {prioritizedList.map(item => {
                                                               const isPreferredTime = preferredTimeLabel && item.startTime
                                                                      ? format(new Date(item.startTime), 'HH:mm') === preferredTimeLabel
                                                                      : false
                                                               const isPreferredCourt = preferredCourtId ? item.court?.id === preferredCourtId : false
                                                               const isPriority = Boolean(isPreferredTime || isPreferredCourt)

                                                               return (
                                                                      <div
                                                                             key={item.id}
                                                                             className={cn(
                                                                                    'group flex items-start justify-between rounded-xl border p-4 transition-colors hover:border-muted-foreground/20',
                                                                                    isPriority ? 'border-primary/30 bg-card shadow-sm shadow-primary/10' : 'border-border bg-card'
                                                                             )}
                                                                      >
                                                                             <div>
                                                                                <div className="flex items-center gap-2">
                                                                                       <div className="text-sm font-bold text-foreground">{item.name}</div>
                                                                                       {isPriority && (
                                                                                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
                                                                                                     Prioridad
                                                                                              </span>
                                                                                       )}
                                                                                </div>
                                                                                <div className="mt-0.5 text-xs text-muted-foreground">{item.phone}</div>
                                                                                {item.startTime && (
                                                                                       <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                                                                                              Pref: {format(new Date(item.startTime), 'HH:mm')} aprox
                                                                                       </div>
                                                                                )}
                                                                                {item.court?.name && (
                                                                                       <div className="mt-2 text-[10px] font-medium text-muted-foreground">
                                                                                              Cancha: {item.court.name}
                                                                                       </div>
                                                                                )}
                                                                                {item.notes && (
                                                                                       <div className="mt-2 text-[10px] italic text-muted-foreground/60">
                                                                                              "{item.notes}"
                                                                                       </div>
                                                                                )}
                                                                                <div className="mt-2 text-[9px] text-muted-foreground/40">
                                                                                       Solicitado: {format(new Date(item.createdAt), 'HH:mm')}
                                                                                </div>
                                                                             </div>

                                                                             <div className="flex items-center gap-1.5">
                                                                                    {onConvertToBooking && (
                                                                                           <button
                                                                                                  onClick={() => handleConvertLead(item)}
                                                                                                  className="rounded-lg border border-primary/20 bg-primary px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                                                                                                  title="Convertir a reserva"
                                                                                           >
                                                                                                  Reservar
                                                                                           </button>
                                                                                    )}
                                                                                    <button
                                                                                           onClick={() => handleMarkStatus(item.id, 'CONTACTED')}
                                                                                           className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
                                                                                           title="Marcar como contactado"
                                                                                    >
                                                                                           Contactado
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleMarkStatus(item.id, 'NO_RESPONSE')}
                                                                                           className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
                                                                                           title="Marcar sin respuesta"
                                                                                    >
                                                                                           Sin respuesta
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleFulfill(item.id)}
                                                                                           className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
                                                                                           title="Marcar como cubierto"
                                                                                    >
                                                                                           Cubierto
                                                                                    </button>
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => handleOpenWhatsApp(
                                                                                                  item,
                                                                                                  getOpportunityMessage({
                                                                                                         name: item.name,
                                                                                                         notes: item.notes || undefined,
                                                                                                         preferredTimeLabel,
                                                                                                         preferredCourtId,
                                                                                                         date
                                                                                                  })
                                                                                           )}
                                                                                           className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                                                                                           title="Contactar por WhatsApp"
                                                                                    >
                                                                                           WhatsApp
                                                                                    </button>
                                                                                    <button
                                                                                           onClick={() => handleRemove(item.id)}
                                                                                           className="p-1 text-muted-foreground/40 transition-colors hover:text-red-400"
                                                                                           title="Eliminar"
                                                                                    >
                                                                                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                                                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                                                           </svg>
                                                                                    </button>
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          )}
                                   </div>
                            </div>
                     </div>
              </>
       )
}
