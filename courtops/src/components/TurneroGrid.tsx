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

// --- SUB-COMPONENTS ---

function parseTimeStr(t: string) {
       const [h, m] = t.split(':').map(Number)
       return h * 60 + m
}


// --- SUB-COMPONENTS ---
import { Check, Clock, AlertCircle, Coins, Phone, Plus, GripVertical, ArrowLeftRight, Undo2 } from 'lucide-react'

const DraggableBookingCard = React.memo(function DraggableBookingCard({ booking, onClick, style: propStyle }: { booking: TurneroBooking, onClick: (id: number) => void, style?: React.CSSProperties }) {
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

       // Visual Logic matching Image 1
       // "SEÑA 50%" -> Blue
       // "PAGADO" -> Green
       // Others -> Gray

       let containerClass = "bg-[#18181b] border border-white/10" // Default dark
       let statusText = "CONFIRMADO"
       let statusColor = "text-zinc-400"

       if (isPaid) {
              containerClass = "bg-emerald-100 border-emerald-200 dark:bg-[#064e3b]/40 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-[#064e3b]/60"
              statusText = "PAGADO"
              statusColor = "text-emerald-700 dark:text-emerald-400"
       } else if (paid > 0) {
              containerClass = "bg-blue-100 border-blue-200 dark:bg-[#172554]/40 dark:border-blue-500/20 hover:bg-blue-200 dark:hover:bg-[#172554]/60"
              statusText = `SEÑA ${Math.round((paid / total) * 100)}%`
              statusColor = "text-blue-700 dark:text-blue-400"
       } else {
              // No payment yet
              containerClass = "bg-white border-slate-200 dark:bg-[#27272a]/40 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#27272a]/60 shadow-sm"
              statusText = "PENDIENTE"
              statusColor = "text-slate-500 dark:text-zinc-400"
       }

       return (
              <div
                     ref={setNodeRef}
                     style={style}
                     {...listeners}
                     {...attributes}
                     onClick={(e) => {
                            if (!isDragging) {
                                   onClick(booking.id)
                            }
                     }}
                     className={cn(
                            "w-full h-full rounded-xl p-3 text-left cursor-move transition-all duration-200 flex flex-col justify-center gap-1 group/card relative overflow-hidden touch-none select-none shadow-sm",
                            containerClass,
                            isDragging && "scale-105 shadow-2xl z-50 cursor-grabbing ring-1 ring-white/20"
                     )}
              >
                     {/* Status Label */}
                     <span className={cn("text-[10px] font-black uppercase tracking-wider", statusColor)}>
                            {statusText}
                     </span>

                     {/* Name */}
                     <h4 className="font-bold text-xs text-white/90 truncate capitalize leading-tight">
                            {booking.client?.name || booking.guestName || '---'}
                     </h4>
              </div>
       )
}, (prev, next) => {
       return prev.booking.id === next.booking.id &&
              prev.booking.status === next.booking.status &&
              prev.booking.paymentStatus === next.booking.paymentStatus &&
              prev.booking.price === next.booking.price
})


const DroppableSlot = React.memo(function DroppableSlot({ id, children, isCurrent, onSlotClick, isDragActive }: { id: string, children: React.ReactNode, isCurrent: boolean, onSlotClick?: () => void, isDragActive?: boolean }) {
       const { setNodeRef, isOver } = useDroppable({ id })

       return (
              <div
                     ref={setNodeRef}
                     onClick={(e) => {
                            if (!children && onSlotClick) {
                                   onSlotClick()
                            }
                     }}
                     className={cn(
                            "group p-1 border-r border-b border-slate-200 dark:border-white/5 relative h-full min-h-[80px] transition-all duration-200",
                            isCurrent ? "bg-emerald-500/5 relative overflow-hidden" : "bg-transparent",
                            isOver && "bg-emerald-500/10 ring-2 ring-inset ring-emerald-500/40 shadow-[inset_0_0_30px_rgba(16,185,129,0.15)]",
                            isDragActive && !children && !isOver && "bg-emerald-500/[0.03] border-emerald-500/10",
                            !children && !isDragActive && "cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                     )}
              >
                     {/* "Now" Indicator Line */}
                     {isCurrent && (
                            <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)] z-0" />
                     )}

                     {/* Drop target indicator when hovering */}
                     {isOver && (
                            <div className="absolute inset-1 z-20 rounded-xl border-2 border-dashed border-emerald-500/50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                   <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-md rounded-lg border border-emerald-500/20">
                                          <ArrowLeftRight size={14} className="text-emerald-500" />
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
       demoData
}: {
       onBookingClick: (id: number) => void,
       onNewBooking?: (data: { courtId?: number, time?: string, date: Date }) => void,
       refreshKey?: number,
       date: Date,
       onDateChange: (d: Date) => void,
       hideHeader?: boolean,
       showWaitingList?: boolean,
       demoData?: any
}) {

       // Use prop date instead of internal state
       const selectedDate = date
       const [now, setNow] = useState<Date | null>(null)

       // UI States
       const [isWaitingListOpen, setIsWaitingListOpen] = useState(false)
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
              refetchInterval: 30000,
              refetchOnWindowFocus: true,
              staleTime: 0,
              gcTime: 0,
              retry: 2,
              refetchOnMount: 'always'
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
       const courts = data?.courts || []
       const bookings = useMemo(() => {
              if (!data?.bookings) return []
              return data.bookings.filter((b: TurneroBooking) => isSameDay(new Date(b.startTime), selectedDate))
       }, [data, selectedDate])

       const config = data?.config || { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }

       // Robust config fallback
       const safeConfig = useMemo(() => ({
              openTime: config.openTime || '14:00',
              closeTime: config.closeTime || '00:30',
              slotDuration: config.slotDuration || 90
       }), [config])

       // --- REAL-TIME UPDATES (Pusher) ---
       useEffect(() => {
              if (!data?.clubId) return

              let channel: any;

              const connectPusher = async () => {
                     try {
                            const { pusherClient } = await import('@/lib/pusher');
                            // Subscribe to the specific club channel
                            const channelName = `club-${data.clubId}`;
                            channel = pusherClient.subscribe(channelName);

                            // Listen for ANY update relevant to bookings
                            channel.bind('booking-update', (payload: any) => {
                                   queryClient.invalidateQueries({ queryKey: ['turnero'] });
                                   if (payload.action === 'create') {
                                          toast.success('Nueva reserva recibida', { position: 'top-center' });
                                   }
                            });
                     } catch (error) {
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
       }, [data?.clubId, queryClient]);

       // --- TIME CLOCK ---
       useEffect(() => {
              setNow(new Date())
              const interval = setInterval(() => setNow(new Date()), 60000)
              return () => clearInterval(interval)
       }, [])

       // --- MEMOS ---
       const GRID_STEP = 30 // Fixed 30-minute granularity for mixed durations

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
       }, [selectedDate, safeConfig])

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
       }, [bookings])


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

       const colTemplate = `80px repeat(${courts.length}, minmax(180px, 1fr))`

       return (
              <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                     <div className="flex flex-col h-full bg-transparent rounded-3xl overflow-hidden flex-1">
                            {!hideHeader && (
                                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 gap-3">
                                          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                                 <button onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                                                        <span className="material-icons-round">chevron_left</span>
                                                 </button>
                                                 <div className="flex flex-col items-center min-w-[160px]">
                                                        <div className="text-xl font-black text-slate-900 dark:text-white leading-tight capitalize tracking-tight">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500 font-bold mt-1">
                                                               {format(selectedDate, "MMMM yyyy", { locale: es })}
                                                        </div>
                                                 </div>
                                                 <button onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white">
                                                        <span className="material-icons-round">chevron_right</span>
                                                 </button>
                                          </div>
                                   </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-white dark:bg-[#09090b]">
                                   {isLoading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>}

                                   <div className="min-w-fit lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
                                          <div className="contents">
                                                 {/* Corner Cell */}
                                                 <div className="sticky top-0 left-0 z-30 bg-white dark:bg-[#09090b] border-b border-r border-slate-200 dark:border-white/5 p-4 flex items-center justify-center h-[60px]">
                                                 </div>
                                                 {/* Court Headers */}
                                                 {courts.map((court: TurneroCourt, idx: number) => (
                                                        <div key={court.id} className={cn("sticky top-0 z-20 bg-white dark:bg-[#09090b] border-b border-r border-slate-200 dark:border-white/5 p-2 text-center flex flex-col justify-center h-[60px]", idx === courts.length - 1 && "border-r-0")}>
                                                               <span className="font-bold text-slate-500 dark:text-zinc-400 text-xs tracking-wider capitalize">{court.name}</span>
                                                        </div>
                                                 ))}
                                          </div>
                                          {TIME_SLOTS.map((slotStart, slotIndex) => {
                                                 const label = timeKey(slotStart)
                                                 let isCurrent = false
                                                 if (now && isSameDay(selectedDate, now)) {
                                                        const s = set(now, { hours: slotStart.getHours(), minutes: slotStart.getMinutes(), seconds: 0 })
                                                        const e = addMinutes(s, GRID_STEP)
                                                        if (now >= s && now < e) isCurrent = true
                                                 }
                                                 return (
                                                        <div key={label} className="contents group/time-row">
                                                               {/* Time Column */}
                                                               <div className={cn("sticky left-0 z-10 p-2 border-r border-b border-slate-200 dark:border-white/5 text-center text-[10px] font-medium flex items-center justify-center bg-white dark:bg-[#09090b] h-[80px]", isCurrent ? "text-emerald-500" : "text-slate-500 dark:text-zinc-600")}>
                                                                      {label}
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
                                                                                    className={cn("contents-wrapper")}
                                                                             >
                                                                                    <DroppableSlot
                                                                                           id={`${court.id}-${label}`}
                                                                                           isCurrent={isCurrent}
                                                                                           isDragActive={!!activeId}
                                                                                           onSlotClick={() => {
                                                                                                  if (onNewBooking) {
                                                                                                         onNewBooking({ courtId: court.id, time: label, date: selectedDate })
                                                                                                  }
                                                                                           }}
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
                                   onClose={() => setIsWaitingListOpen(false)}
                                   date={selectedDate}
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
