'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'

import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverEvent, MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Use client-side API fetch instead of server action to avoid serialization issues
import { updateBookingDetails } from '@/actions/manageBooking'
import { cn } from '@/lib/utils'
import { TurneroBooking, TurneroCourt } from '@/types/booking'
import WaitingListSidebar from './WaitingListSidebar'


function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

const PADEL_SLOT_MINUTES = 90

// --- SUB-COMPONENTS ---

// --- SUB-COMPONENTS ---
import { Check, Clock, ArrowLeftRight, Plus, Image as ImageIcon, Users } from 'lucide-react'

const DraggableBookingCard = React.memo(function DraggableBookingCard({ booking, onClick, style: propStyle }: { booking: TurneroBooking, onClick: (_id: number) => void, style?: React.CSSProperties }) {
       const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
              id: booking.id.toString(),
              data: { booking }
       })

       const style = {
              transform: CSS.Translate.toString(transform),
              zIndex: isDragging ? 50 : 1,
              ...propStyle
       }

       const itemsT = booking.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0
       const total = booking.price + itemsT
       const paid = booking.transactions?.reduce((s, t) => s + t.amount, 0) || 0
       const balance = total - paid
       const isPaid = balance <= 0

       const durationMin = Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)
       const startLabel = format(new Date(booking.startTime), 'HH:mm')
       const endLabel = format(new Date(booking.endTime), 'HH:mm')

       let containerClass = "bg-card border-border"
       let statusText = "CONFIRMADO"
       let statusColor = "bg-muted text-muted-foreground"
       let accentColor = "text-muted-foreground"

       if (isPaid) {
              containerClass = "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              statusText = "PAGADO"
              statusColor = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              accentColor = "text-emerald-600 dark:text-emerald-400"
       } else if (paid > 0) {
              containerClass = "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20"
              statusText = `SEÑA ${Math.round((paid / total) * 100)}%`
              statusColor = "bg-blue-500/20 text-blue-700 dark:text-blue-400"
              accentColor = "text-blue-600 dark:text-blue-400"
       } else {
              containerClass = "bg-card border-border hover:bg-muted/50 dark:hover:bg-white/5 shadow-sm"
              statusText = "PENDIENTE"
              statusColor = "bg-muted text-muted-foreground"
       }

       // Safely extract new fields
       const bType = (booking as any).bookingType || 'NORMAL'
       const isClass = bType === 'CLASS'
       const isMatch = bType === 'MATCH'

       return (
              <div
                     ref={setNodeRef}
                     style={style}
                     {...listeners}
                     {...attributes}
                     role="button"
                     aria-label={`Reserva de ${booking.client?.name || booking.guestName || "invitado"}`}
                     tabIndex={0}
                     onClick={() => {
                            if (!isDragging) onClick(booking.id)
                     }}
                     className={cn(
                            "w-full h-full rounded-2xl p-3 text-left cursor-grab transition-all duration-300 flex flex-col group/card relative overflow-hidden select-none border-2",
                            containerClass,
                            isDragging && "scale-105 shadow-2xl z-50 cursor-grabbing ring-4 ring-emerald-500/20 rotate-1",
                            isClass && "border-primary/30",
                            isMatch && "border-emerald-500/30"
                     )}
              >
                     {/* Header: status + type + check */}
                     <div className="flex items-center justify-between relative z-10 gap-1 overflow-hidden">
                            <div className="flex items-center gap-1 min-w-0">
                                   <span className={cn("text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border border-current/10 shrink-0", statusColor)}>
                                          {statusText}
                                   </span>
                                   {isClass && (
                                          <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-primary text-white shrink-0">
                                                 CLASE
                                          </span>
                                   )}
                                   {isMatch && (
                                          <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500 text-white shrink-0">
                                                 PARTIDO
                                          </span>
                                   )}
                            </div>
                            {isPaid && <Check size={10} className="text-emerald-500 shrink-0" />}
                     </div>

                     {/* Client name */}
                     <h4 className="font-black text-sm text-foreground truncate capitalize leading-tight tracking-tight mt-2 relative z-10">
                            {booking.client?.name || booking.guestName || '---'}
                     </h4>

                     {/* Phone */}
                     {booking.client?.phone && (
                            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5 relative z-10">
                                   {booking.client.phone}
                            </p>
                     )}

                     {/* Spacer to push time + price to bottom */}
                     <div className="flex-1" />

                     {/* Time range */}
                     <div className="flex items-center gap-1.5 relative z-10 mt-2">
                            <Clock size={11} className={cn("shrink-0", accentColor)} />
                            <span className={cn("text-[11px] font-bold tabular-nums", accentColor)}>
                                   {startLabel} - {endLabel}
                            </span>
                            <span className="text-[9px] text-muted-foreground/70 font-medium">
                                   {durationMin}&apos;
                            </span>
                     </div>

                     {/* Price row */}
                     {total > 0 && (
                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-current/5 relative z-10">
                                   <span className="text-[9px] text-muted-foreground font-medium">Total</span>
                                   <span className="text-[11px] font-black tabular-nums text-foreground/80">
                                          ${total.toLocaleString()}
                                   </span>
                            </div>
                     )}

              </div>
       )
}, (prev, next) => {
       return prev.booking.id === next.booking.id &&
              prev.booking.status === next.booking.status &&
              prev.booking.paymentStatus === next.booking.paymentStatus &&
              prev.booking.price === next.booking.price &&
              prev.booking.startTime === next.booking.startTime &&
              prev.booking.endTime === next.booking.endTime &&
              JSON.stringify(prev.booking.items || []) === JSON.stringify(next.booking.items || []) &&
              JSON.stringify(prev.booking.transactions || []) === JSON.stringify(next.booking.transactions || [])
})


const DroppableSlot = React.memo(function DroppableSlot({ id, children, isCurrent, isHourSlot, onSlotClick, onFlyerClick, isDragActive }: { id: string, children: React.ReactNode, isCurrent: boolean, isHourSlot?: boolean, onSlotClick?: (_id: string) => void, onFlyerClick?: (_id: string) => void, isDragActive?: boolean }) {
       const { setNodeRef, isOver } = useDroppable({ id })

       return (
              <div
                     ref={setNodeRef}
                     onClick={() => {
                            if (!children && onSlotClick) {
                                   onSlotClick(id)
                            }
                     }}
                     className={cn(
                            "group p-1 border-r relative h-full min-h-[96px] transition-all duration-200",
                            isHourSlot ? "border-b border-border/60" : "border-b border-border/25",
                            isCurrent ? "bg-emerald-500/5 overflow-hidden" : isHourSlot ? "bg-white/[0.018] dark:bg-white/[0.018]" : "bg-transparent",
                            isOver && "bg-emerald-500/10 ring-2 ring-inset ring-emerald-500/40",
                            isDragActive && !children && !isOver && "bg-emerald-500/[0.03] border-emerald-500/10",
                            !children && !isDragActive && "cursor-pointer hover:bg-muted/50 dark:hover:bg-white/[0.04]"
                     )}
              >
                     {/* "Now" Indicator Line */}
                     {isCurrent && (
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-500/50 z-0" />
                     )}

                     {/* Drop target indicator when hovering */}
                     {isOver && (
                            <div className="absolute inset-1 z-20 rounded-xl border-2 border-dashed border-emerald-500/50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                   <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-lg border border-emerald-500/20">
                                          <ArrowLeftRight size={14} className="text-emerald-500" />
                                   </div>
                            </div>
                     )}

                     {/* Hover hint for empty slots */}
                     {!children && !isOver && !isDragActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none gap-2">
                                   <div 
                                       className="w-8 h-8 rounded-xl bg-primary shadow-sm flex items-center justify-center cursor-pointer pointer-events-auto transform hover:scale-110 active:scale-95 transition-all"
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if (onSlotClick) onSlotClick(id);
                                       }}
                                       title="Reservar"
                                   >
                                          <Plus size={16} className="text-primary-foreground font-black" />
                                   </div>
                                   <div 
                                       className="w-8 h-8 rounded-xl bg-background border border-border shadow-sm flex items-center justify-center cursor-pointer pointer-events-auto transform hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if (onFlyerClick) onFlyerClick(id);
                                       }}
                                       title="Generar Flyer"
                                   >
                                          <ImageIcon size={14} />
                                   </div>
                            </div>
                     )}

                     {children}
              </div>
       )
})


// --- MAIN COMPONENT ---

// --- MAIN COMPONENT ---

// --- MAIN COMPONENT ---

export default function TurneroGrid({
       onBookingClick,
       onNewBooking,
       refreshKey = 0,
       date,
       onDateChange,
       hideHeader = false,
       showWaitingList = true,
       demoData,
       onGenerateFlyer
}: {
       onBookingClick: (_id: number) => void,
       onNewBooking?: (_data: {
              courtId?: number
              time?: string
              date: Date
              clientName?: string
              clientPhone?: string
              clientEmail?: string
              notes?: string
              waitingListId?: number
       }) => void,
       refreshKey?: number,
       date: Date,
       onDateChange: (_d: Date) => void,
       hideHeader?: boolean,
       showWaitingList?: boolean,
       demoData?: Record<string, unknown>,
       onGenerateFlyer?: (_data: { courtId: number, time: string, date: Date, courtName: string }) => void
}) {

       // Use prop date instead of internal state
       const selectedDate = date
       const [now, setNow] = useState<Date | null>(null)

       // UI States
       const [isWaitingListOpen, setIsWaitingListOpen] = useState(false)
       const [waitingListFocus, setWaitingListFocus] = useState<{ preferredStartTime: string | null, preferredCourtId: number | null }>({
              preferredStartTime: null,
              preferredCourtId: null
       })
       const [activeId, setActiveId] = useState<string | null>(null)

       const queryClient = useQueryClient()

       const sensors = useSensors(
              useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
              useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
       )

       // --- DATA FETCHING (React Query) ---
       const { data, isLoading, isError, error } = useQuery({
              queryKey: ['turnero', selectedDate.toISOString(), demoData ? 'demo' : 'live'],
              queryFn: async () => {
                     if (demoData) return demoData
                     try {
                            const res = await fetch('/api/dashboard/turnero', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ date: selectedDate.toISOString() })
                            })

                            if (!res.ok) {
                                   const text = await res.text()
                                   throw new Error(`API error ${res.status}: ${text}`)
                            }

                            const result = await res.json()

                            // Normalize older server shapes (if any)
                            if (result.success === false) {
                                   console.warn('[TURNERO] Server returned error:', result.error)
                            }

                            // Ensure arrays exist
                            result.courts = result.courts || []
                            result.bookings = result.bookings || []
                            result.config = result.config || { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }

                            return result
                     } catch (err) {
                            console.error('[TURNERO] Query function error:', err)
                            throw err
                     }
              },
              refetchInterval: 10000,
              refetchOnWindowFocus: true,
              staleTime: 0,
              gcTime: 600000,
              retry: 1,
              refetchOnMount: true
       })

       // Log errors for debugging
       useEffect(() => {
              if (isError) {
                     console.error('[TURNERO CRITICAL]', error)
              }
              if (data) {
                     console.log('[TURNERO DATA]', { courts: data.courts?.length, bookings: data.bookings?.length })
              }
       }, [isError, error, data])

       // Force refetch on external refresh key
       useEffect(() => {
              if (refreshKey > 0) {
                     queryClient.invalidateQueries({ queryKey: ['turnero'] })
              }
       }, [refreshKey, queryClient])

       // Derived State
       const courts = useMemo(() => data?.courts || [], [data?.courts])
       const bookings = useMemo(() => {
              if (!data?.bookings) return []
              return data.bookings.filter((b: TurneroBooking) => isSameDay(new Date(b.startTime), selectedDate))
       }, [data, selectedDate])

       const handleSlotClick = useCallback((id: string) => {
              if (!onNewBooking) return
              const dashIdx = id.indexOf('-')
              if (dashIdx < 0) return
              const courtIdStr = id.substring(0, dashIdx)
              const timeLabel = id.substring(dashIdx + 1)
              onNewBooking({ courtId: Number(courtIdStr), time: timeLabel, date: selectedDate })
       }, [onNewBooking, selectedDate])

       const handleFlyerClick = useCallback((id: string) => {
              if (!onGenerateFlyer) return
              const dashIdx = id.indexOf('-')
              if (dashIdx < 0) return
              const courtIdStr = id.substring(0, dashIdx)
              const timeLabel = id.substring(dashIdx + 1)
              const courtId = Number(courtIdStr)
              const courtName = (courts as any).find((c: any) => c.id === courtId)?.name || `Cancha ${courtId}`
              onGenerateFlyer({ courtId, time: timeLabel, date: selectedDate, courtName })
       }, [onGenerateFlyer, selectedDate, courts])

       // Robust config fallback
       const safeConfig = useMemo(() => {
              const config = data?.config || { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }
              return {
                     openTime: config.openTime || '14:00',
                     closeTime: config.closeTime || '00:30',
                     slotDuration: config.slotDuration || 90
              }
       }, [data?.config])

       // --- REAL-TIME UPDATES (Pusher) ---
       useEffect(() => {
              if (!data?.clubId) return

              let channel: { bind: (_event: string, _callback: (_data: Record<string, unknown>) => void) => void; unbind_all: () => void; unsubscribe: () => void } | undefined;

              const connectPusher = async () => {
                     try {
                            const { pusherClient } = await import('@/lib/pusher');
                            // Subscribe to the specific club channel
                            const channelName = `club-${data.clubId}`;
                            channel = pusherClient.subscribe(channelName);

                            // Listen for ANY update relevant to bookings
                            channel.bind('booking-update', (payload: Record<string, unknown>) => {
                                   queryClient.invalidateQueries({ queryKey: ['turnero'] });
                                   if (payload.action === 'create') {
                                          try { new Audio('/sounds/notification.mp3').play().catch(() => {}) } catch {}
                                          const clientName = (payload.clientName as string) || 'Nuevo cliente'
                                          const courtName = (payload.courtName as string) || ''
                                          const time = (payload.time as string) || ''
                                          toast.success(
                                                 clientName,
                                                 {
                                                        description: courtName && time ? courtName + ' · ' + time : 'Nueva reserva recibida',
                                                        position: 'top-center',
                                                        duration: 5000,
                                                 }
                                          )
                                   } else if (payload.action === 'cancel') {
                                          const waitingMatches = Number(payload.waitingListMatches || 0)
                                          const startTime = typeof payload.startTime === 'string' ? payload.startTime : null
                                          const courtId = typeof payload.courtId === 'number'
                                                 ? payload.courtId
                                                 : typeof payload.courtId === 'string'
                                                        ? Number(payload.courtId)
                                                        : null

                                          if (waitingMatches > 0 && showWaitingList) {
                                                 setWaitingListFocus({
                                                        preferredStartTime: startTime,
                                                        preferredCourtId: Number.isFinite(courtId) ? courtId : null
                                                 })
                                                 setIsWaitingListOpen(true)
                                          }

                                          toast.info('Reserva cancelada', {
                                                 description: waitingMatches > 0
                                                        ? `${waitingMatches} persona${waitingMatches === 1 ? '' : 's'} en lista de espera para este horario.`
                                                        : 'Se libero el horario.',
                                                 position: 'top-center',
                                                 duration: 4000
                                          })
                                   }
                            });

                            channel.bind('waiting-list-update', (payload: Record<string, unknown>) => {
                                   if (payload.action !== 'create') return
                                   const requesterName = (payload.name as string) || 'Nueva solicitud'
                                   const fromPublicBooking = payload.source === 'public'
                                   toast.info(requesterName, {
                                          description: fromPublicBooking
                                                 ? 'Se sumo a la lista de espera desde la reserva online.'
                                                 : 'Se agrego a la lista de espera.',
                                          position: 'top-center',
                                          duration: 4500,
                                   })
                            })
                     } catch {
                            // Silent fail for pusher
                     }
              }

              connectPusher();

              return () => {
                     if (channel) {
                            channel.unbind_all();
                            channel.unsubscribe();
                     }
              }
       }, [data?.clubId, queryClient, showWaitingList]);

       // --- TIME CLOCK ---
       useEffect(() => {
              setNow(new Date())
              const interval = setInterval(() => setNow(new Date()), 60000)
              return () => clearInterval(interval)
       }, [])

       // --- MEMOS ---
       const GRID_STEP = PADEL_SLOT_MINUTES

       // --- MEMOS ---

       const TIME_SLOTS = useMemo(() => {
              const slots: Date[] = []
              const [openH, openM] = safeConfig.openTime.split(':').map(Number)
              const [closeH, closeM] = safeConfig.closeTime.split(':').map(Number)
              let cur = set(selectedDate, { hours: openH, minutes: openM, seconds: 0, milliseconds: 0 })
              let endLimit = set(selectedDate, { hours: closeH, minutes: closeM, seconds: 0, milliseconds: 0 })

              // Correct Midnight Crossing Logic
              if (endLimit <= cur) {
                     // If close time is "smaller" than open time (e.g. 02:00 < 14:00), it implies next day
                     endLimit = addDays(endLimit, 1)
              }

              while (cur < endLimit) {
                     slots.push(cur)
                     cur = addMinutes(cur, GRID_STEP)
              }
              return slots
       }, [selectedDate, safeConfig, GRID_STEP])

       const { bookingsByCourtAndTime, occupiedSlots } = useMemo(() => {
              const map = new Map<string, TurneroBooking>()
              const occupied = new Set<string>()

              for (const b of bookings) {
                     const start = new Date(b.startTime)
                     const end = new Date(b.endTime)
                     const timeStr = format(start, 'HH:mm')

                     // Register Booking Start
                     map.set(`${b.courtId}-${timeStr}`, b)

                     // Mark occupied slots (excluding the exact start time which handles the booking itself)
                     let ptr = addMinutes(start, GRID_STEP)
                     // Loop until (end - small buffer) to avoid claiming the slot starting exactly when this ends
                     // Tolerance 1000ms
                     while (ptr < end) {
                            const occTime = format(ptr, 'HH:mm')
                            occupied.add(`${b.courtId}-${occTime}`)
                            ptr = addMinutes(ptr, GRID_STEP)
                     }
              }
              return { bookingsByCourtAndTime: map, occupiedSlots: occupied }
       }, [bookings, GRID_STEP])


       // --- MUTATIONS ---
       const moveBookingMutation = useMutation({
              mutationFn: async ({ bookingId, newStartTime, courtId }: { bookingId: number, newStartTime: Date, courtId: number }) => {
                     return await updateBookingDetails(bookingId, newStartTime, courtId)
              },
              onMutate: async ({ bookingId, newStartTime, courtId }) => {
                     await queryClient.cancelQueries({ queryKey: ['turnero'] })
                     const queryKey = ['turnero', selectedDate.toISOString(), demoData ? 'demo' : 'live']
                     const previousData = queryClient.getQueryData(queryKey) as any

                     // Optimistic update: move the booking in the cache immediately
                     if (previousData?.bookings) {
                            const optimistic = {
                                   ...previousData, bookings: previousData.bookings.map((b: TurneroBooking) => {
                                          if (b.id === bookingId) {
                                                 const durationMs = new Date(b.endTime).getTime() - new Date(b.startTime).getTime()
                                                 return {
                                                        ...b,
                                                        courtId,
                                                        startTime: newStartTime.toISOString(),
                                                        endTime: new Date(newStartTime.getTime() + durationMs).toISOString()
                                                 }
                                          }
                                          return b
                                   })
                            }
                            queryClient.setQueryData(queryKey, optimistic)
                     }

                     // Store for undo
                     lastMoveRef.current = { bookingId, previousData }

                     const toastId = toast.loading('Reprogramando reserva...', { id: 'move-booking' })
                     return { previousData, queryKey, toastId }
              },
              onSuccess: (res: any, variables, context: any) => {
                     toast.dismiss('move-booking')
                     if (res.success) {
                            toast.success('✅ Reserva reprogramada', {
                                   duration: 5000,
                                   action: {
                                          label: 'Deshacer',
                                          onClick: () => {
                                                 if (lastMoveRef.current?.previousData && context?.queryKey) {
                                                        queryClient.setQueryData(context.queryKey, lastMoveRef.current.previousData)
                                                        // Also revert on server
                                                        const oldBooking = lastMoveRef.current.previousData.bookings?.find((b: TurneroBooking) => b.id === lastMoveRef.current!.bookingId)
                                                        if (oldBooking) {
                                                               updateBookingDetails(oldBooking.id, new Date(oldBooking.startTime), oldBooking.courtId)
                                                                      .then(() => {
                                                                             toast.success('↩️ Reserva restaurada')
                                                                             queryClient.invalidateQueries({ queryKey: ['turnero'] })
                                                                      })
                                                        }
                                                 }
                                          }
                                   }
                            })
                            // Refresh to get server-confirmed state
                            queryClient.invalidateQueries({ queryKey: ['turnero'] })
                     } else {
                            toast.error(res.error || 'Error del servidor')
                            // Revert optimistic update
                            if (context?.previousData && context?.queryKey) {
                                   queryClient.setQueryData(context.queryKey, context.previousData)
                            }
                            queryClient.invalidateQueries({ queryKey: ['turnero'] })
                     }
              },
              onError: (err, variables, context: any) => {
                     toast.dismiss('move-booking')
                     toast.error('❌ Error al mover reserva')
                     // Revert optimistic update
                     if (context?.previousData && context?.queryKey) {
                            queryClient.setQueryData(context.queryKey, context.previousData)
                     }
              },
       })

       // --- DnD HANDLERS ---
       const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)
       const [pendingMove, setPendingMove] = useState<{ bookingId: number, booking: TurneroBooking, newStartTime: Date, courtId: number, courtName: string, timeLabel: string } | null>(null)
       const lastMoveRef = useRef<{ bookingId: number, previousData: any } | null>(null)

       function handleDragStart(event: DragStartEvent) {
              setActiveId(event.active.id as string)
              setDragOverSlot(null)
       }

       function handleDragOver(event: DragOverEvent) {
              const { over } = event
              setDragOverSlot(over ? (over.id as string) : null)
       }

       function handleDragEnd(event: DragEndEvent) {
              const draggedId = activeId
              setActiveId(null)
              setDragOverSlot(null)
              const { active, over } = event
              if (!over) return

              const bookingId = Number(active.id)
              const overId = over.id as string

              // Parse courtId-HH:MM — split only on first dash
              const dashIdx = overId.indexOf('-')
              if (dashIdx < 0) return
              const courtIdStr = overId.substring(0, dashIdx)
              const timeStr = overId.substring(dashIdx + 1)
              if (!courtIdStr || !timeStr) return

              const courtId = Number(courtIdStr)
              const [targetH, targetM] = timeStr.split(':').map(Number)
              const newStartTime = set(selectedDate, { hours: targetH, minutes: targetM, seconds: 0, milliseconds: 0 })

              // Find the booking being moved
              const booking = bookings.find((b: TurneroBooking) => b.id === bookingId)
              if (!booking) return

              // Check if it's the same slot (no-op)
              const currentSlotKey = `${booking.courtId}-${format(new Date(booking.startTime), 'HH:mm')}`
              if (currentSlotKey === overId) return

              // Client-side overlap check
              const durationMs = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()
              const newEndTime = new Date(newStartTime.getTime() + durationMs)
              const hasOverlap = bookings.some((b: TurneroBooking) => {
                     if (b.id === bookingId) return false
                     if (b.courtId !== courtId) return false
                     const bStart = new Date(b.startTime).getTime()
                     const bEnd = new Date(b.endTime).getTime()
                     return newStartTime.getTime() < bEnd && newEndTime.getTime() > bStart
              })

              if (hasOverlap) {
                     toast.error('⚠️ Ese horario ya está ocupado', { duration: 2500 })
                     return
              }

              // Find court name for confirmation
              const targetCourt = courts.find((c: TurneroCourt) => c.id === courtId)
              const courtName = targetCourt?.name || `Cancha ${courtId}`
              const timeLabel = timeStr

              // Show confirmation
              setPendingMove({ bookingId, booking, newStartTime, courtId, courtName, timeLabel })
       }

       function confirmMove() {
              if (!pendingMove) return
              const { bookingId, newStartTime, courtId } = pendingMove
              setPendingMove(null)
              moveBookingMutation.mutate({ bookingId, newStartTime, courtId })
       }

       function cancelMove() {
              setPendingMove(null)
       }

       const colTemplate = `64px repeat(${courts.length}, minmax(100px, 1fr))`

       return (
              <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                     <div className="flex flex-col h-full bg-transparent rounded-3xl overflow-hidden flex-1">
                            {!hideHeader && (
                                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-b border-border bg-muted/50 dark:bg-black/20 gap-3">
                                          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                                 <button aria-label="Día anterior" onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                                        <span className="material-icons-round">chevron_left</span>
                                                 </button>
                                                 <div className="flex flex-col items-center min-w-[160px]">
                                                        <div className="text-xl font-black text-foreground leading-tight capitalize tracking-tight">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mt-1">
                                                               {format(selectedDate, "MMMM yyyy", { locale: es })}
                                                        </div>
                                                 </div>
                                                 <button aria-label="Día siguiente" onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
                                                        <span className="material-icons-round">chevron_right</span>
                                                 </button>
                                          </div>
                                         {showWaitingList && (
                                                 <button
                                                        onClick={() => {
                                                               setWaitingListFocus({
                                                                      preferredStartTime: null,
                                                                      preferredCourtId: null
                                                               })
                                                               setIsWaitingListOpen(true)
                                                        }}
                                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-foreground transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
                                                 >
                                                        <Users size={15} />
                                                        Lista de espera
                                                 </button>
                                          )}
                                   </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-background">
                                   {isLoading && (
                                          <div className="absolute top-0 left-0 right-0 h-1 z-50 bg-muted overflow-hidden">
                                                 <div className="h-full bg-emerald-500 animate-[shimmer_1.5s_infinite] w-1/3" />
                                          </div>
                                   )}

                                   <div className="min-w-fit lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
                                          <div className="contents">
                                                 {/* Corner Cell */}
                                                 <div className="sticky top-0 left-0 z-30 bg-background border-b border-r border-border p-2 flex flex-col items-center justify-center h-[44px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{format(selectedDate, 'MMM d', { locale: es })}</span>
                                                 </div>
                                                 {/* Court Headers */}
                                                 {courts.map((court: TurneroCourt, idx: number) => (
                                                        <div key={court.id} className={cn("sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-r border-border px-2 py-1.5 text-center flex flex-col justify-center h-[52px]", idx === courts.length - 1 && "border-r-0")}>
                                                               <span className="font-extrabold text-foreground/80 text-xs tracking-wider capitalize truncate">{court.name}</span>
                                                               <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                                                                      Padel · {court.duration || GRID_STEP} min
                                                               </span>
                                                        </div>
                                                 ))}
                                          </div>
                                          {TIME_SLOTS.map((slotStart) => {
                                                 const label = timeKey(slotStart)
                                                 const isHour = slotStart.getMinutes() === 0
                                                 let isCurrent = false
                                                 if (now && isSameDay(selectedDate, now)) {
                                                        const s = set(now, { hours: slotStart.getHours(), minutes: slotStart.getMinutes(), seconds: 0 })
                                                        const e = addMinutes(s, GRID_STEP)
                                                        if (now >= s && now < e) isCurrent = true
                                                 }
                                                 return (
                                                        <div key={label} className="contents group/time-row">
                                                               {/* Time Column */}
                                                               <div className={cn(
                                                                      "sticky left-0 z-10 border-r border-b bg-background h-[96px]",
                                                                      "relative flex items-center justify-center",
                                                                      isHour ? "border-border/60" : "border-border/25",
                                                                      isCurrent ? "text-emerald-500" : isHour ? "text-foreground/55" : "text-muted-foreground/30",
                                                               )}>
                                                                      {/* Tick mark for on-the-hour slots */}
                                                                      {isHour && !isCurrent && (
                                                                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-border/50 rounded-l-full" />
                                                                      )}
                                                                      {isCurrent && (
                                                                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-emerald-500/70 rounded-l-full" />
                                                                      )}
                                                                      <span className={cn(
                                                                             isHour ? "text-[11px] font-bold" : "text-[9px] font-medium"
                                                                      )}>
                                                                             {label}
                                                                      </span>
                                                               </div>
                                                               {courts.map((court: TurneroCourt) => {
                                                                      const key = `${court.id}-${label}`

                                                                      // Check if occupied by a previous booking's span
                                                                      if (occupiedSlots.has(key)) return null

                                                                      const booking = bookingsByCourtAndTime.get(`${court.id}-${label}`)

                                                                      // Calculate Span based on actual booking duration
                                                                      let span = 1
                                                                      if (booking) {
                                                                             const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000
                                                                             span = Math.ceil(duration / GRID_STEP)
                                                                      }

                                                                      return (
                                                                             <div
                                                                                    key={`${court.id}-${label}`}
                                                                                    style={{ gridRow: `span ${span}` }}
                                                                                    className="h-full min-h-0"
                                                                             >
                                                                                    <DroppableSlot
                                                                                           id={`${court.id}-${label}`}
                                                                                           isCurrent={isCurrent}
                                                                                           isHourSlot={isHour}
                                                                                           isDragActive={!!activeId}
                                                                                           onSlotClick={handleSlotClick} onFlyerClick={handleFlyerClick}
                                                                                    >
                                                                                           {booking && <DraggableBookingCard booking={booking} onClick={onBookingClick} />}
                                                                                    </DroppableSlot>
                                                                             </div>
                                                                      )
                                                               })}
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            </div>
                            <WaitingListSidebar
                                   isOpen={showWaitingList && isWaitingListOpen}
                                   onClose={() => {
                                          setIsWaitingListOpen(false)
                                          setWaitingListFocus({
                                                 preferredStartTime: null,
                                                 preferredCourtId: null
                                          })
                                   }}
                                   date={selectedDate}
                                   clubId={data?.clubId}
                                   preferredStartTime={waitingListFocus.preferredStartTime}
                                   preferredCourtId={waitingListFocus.preferredCourtId}
                                   onConvertToBooking={onNewBooking}
                            />
                            {/* CONFIRMATION MODAL */}
                            {pendingMove && (
                                   <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={cancelMove}>
                                          <div className="bg-card border border-border rounded-3xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
                                                 <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                               <ArrowLeftRight size={20} className="text-primary" />
                                                        </div>
                                                        <div>
                                                               <h3 className="font-black text-foreground text-lg">Reprogramar Reserva</h3>
                                                               <p className="text-xs text-muted-foreground font-medium">Confirmar cambio de horario</p>
                                                        </div>
                                                 </div>
                                                 <div className="bg-muted/30 rounded-2xl p-4 space-y-3 mb-6 border border-border/50">
                                                        <div className="flex items-center justify-between text-sm">
                                                               <span className="text-muted-foreground font-medium">Cliente</span>
                                                               <span className="font-bold text-foreground">{pendingMove.booking.client?.name || pendingMove.booking.guestName || '---'}</span>
                                                        </div>
                                                        <div className="h-px bg-border/50" />
                                                        <div className="flex items-center justify-between text-sm">
                                                               <span className="text-muted-foreground font-medium">Nuevo horario</span>
                                                               <span className="font-bold text-primary">{pendingMove.timeLabel}hs</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                               <span className="text-muted-foreground font-medium">Cancha</span>
                                                               <span className="font-bold text-foreground">{pendingMove.courtName}</span>
                                                        </div>
                                                 </div>
                                                 <div className="flex gap-3">
                                                        <button onClick={cancelMove} className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold text-sm rounded-xl transition-all active:scale-95">
                                                               Cancelar
                                                        </button>
                                                        <button onClick={confirmMove} className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl">
                                                               Confirmar
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            )}
                     </div>
              </DndContext>
       )
}
