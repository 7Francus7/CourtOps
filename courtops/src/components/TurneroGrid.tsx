'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'

import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
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
import { Check, Clock, AlertCircle, Coins, Phone, Plus } from 'lucide-react'

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

       // Premium Styling Logic
       // Default is CONFIRMED (registered but payment pending/partial not fully paid)
       // Changed from primary to Blue to distinct from Green (Paid)
       let containerClass = "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/50 shadow-lg shadow-blue-900/20"
       let statusIcon = <Check size={10} className="text-white" />
       let statusText = "CONFIRMADO"
       let textColor = "text-white"
       let pillClass = "bg-white/20 text-white"

       if (isPaid) {
              containerClass = "bg-gradient-to-br from-[#10b981] to-[#059669] border-[#0be8a0]/50 shadow-lg shadow-emerald-900/20" // Emerald Green
              statusIcon = <Coins size={10} className="text-white" />
              statusText = "PAGADO"
              textColor = "text-white font-semibold"
              pillClass = "bg-black/20 text-white"
       } else if (booking.status === 'PENDING') {
              containerClass = "bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-sm border-slate-600/50" // Neutral Grey for Pending
              statusIcon = <Clock size={10} className="text-slate-300" />
              statusText = "PENDIENTE"
              textColor = "text-slate-200"
              pillClass = "bg-white/10 text-slate-300"
       } else if (paid > 0) {
              containerClass = "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/50 shadow-lg shadow-orange-900/20" // Orange for Partial
              statusIcon = <AlertCircle size={10} className="text-white" />
              statusText = "SEÑA PARCIAL"
              textColor = "text-white"
              pillClass = "bg-white/20 text-white"
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
                            "w-full h-full rounded-2xl p-3 text-left border cursor-move transition-all duration-300 flex flex-col group/card relative overflow-hidden touch-none",
                            containerClass,
                            isDragging ? "opacity-90 scale-105 rotate-2 shadow-2xl z-50 cursor-grabbing ring-2 ring-white/50" : "hover:-translate-y-1 hover:shadow-xl"
                     )}
              >
                     {/* Glossy Effect Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-100 pointer-events-none" />

                     {/* Header: Status & Price */}
                     <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
                            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/10 shadow-sm transition-transform group-hover/card:scale-105", pillClass)}>
                                   {statusIcon}
                                   <span>{statusText}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                   <span className={cn("text-xs font-black leading-none drop-shadow-md", textColor)}>${total.toLocaleString()}</span>
                            </div>
                     </div>

                     {/* Content: Name & Info */}
                     <div className="flex-1 min-h-0 flex flex-col relative z-10 px-0.5">
                            <h4 className={cn("font-bold text-sm truncate capitalize leading-tight mb-1 drop-shadow-sm", textColor)}>
                                   {booking.client?.name || booking.guestName || '---'}
                            </h4>

                            {(booking.client?.phone || booking.guestPhone) && (
                                   <div className="flex items-center gap-1.5 opacity-80">
                                          <Phone size={10} className={textColor} />
                                          <span className={cn("text-[10px] font-medium tracking-tight", textColor)}>
                                                 {booking.client?.phone || booking.guestPhone}
                                          </span>
                                   </div>
                            )}

                            {/* Items / Extras Ribbon */}
                            {booking.items && booking.items.length > 0 && (
                                   <div className="mt-auto pt-2">
                                          <div className="flex flex-wrap gap-1">
                                                 {booking.items.slice(0, 2).map((item, i: number) => (
                                                        <span key={i} className={cn("text-[9px] px-1.5 py-0.5 rounded-md leading-none font-bold backdrop-blur-md border border-white/10 shadow-sm", pillClass)}>
                                                               {item.quantity}x {item.product?.name?.split(' ')[0]}
                                                        </span>
                                                 ))}
                                                 {booking.items.length > 2 && <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-bold", pillClass)}>+{booking.items.length - 2}</span>}
                                          </div>
                                   </div>
                            )}

                            {/* Balance Alert */}
                            {balance > 0 && booking.status !== 'PENDING' && (
                                   <div className="absolute -bottom-1 -right-1">
                                          <span className="text-[8px] font-black text-white bg-red-500 shadow-lg shadow-red-500/40 px-2 py-1 rounded-tl-xl rounded-br-xl backdrop-blur-md border border-white/10">
                                                 DEBE ${balance.toLocaleString()}
                                          </span>
                                   </div>
                            )}
                     </div>
              </div>
       )
}, (prev, next) => {
       // Custom comparison to really avoid renders unless critical data changes
       return prev.booking.id === next.booking.id &&
              prev.booking.status === next.booking.status &&
              prev.booking.paymentStatus === next.booking.paymentStatus &&
              prev.booking.paymentStatus === next.booking.paymentStatus &&
              // prev.booking.updatedAt === next.booking.updatedAt // updatedAt might not be in the selection, so we rely on status/paymentStatus mostly
              prev.booking.price === next.booking.price
})

const BookingCardPreview = React.memo(function BookingCardPreview({ booking }: { booking: TurneroBooking }) {
       const itemsT = booking.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0
       const total = booking.price + itemsT
       const paid = booking.transactions?.reduce((s, t) => s + t.amount, 0) || 0
       const balance = total - paid
       const isPaid = balance <= 0

       // Premium Styling Logic Mirror
       let containerClass = "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/50"
       let statusText = "CONFIRMADO"
       let textColor = "text-white"

       if (isPaid) {
              containerClass = "bg-gradient-to-br from-[#10b981] to-[#059669] border-[#0be8a0]/50"
              statusText = "PAGADO"
              textColor = "text-white font-semibold"
       } else if (booking.status === 'PENDING') {
              containerClass = "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600/50"
              statusText = "PENDIENTE"
              textColor = "text-slate-200"
       } else if (paid > 0) {
              containerClass = "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/50"
              statusText = "SEÑA PARCIAL"
              textColor = "text-white"
       }

       return (
              <div className={cn(
                     "w-[220px] h-[120px] rounded-2xl p-3 text-left border shadow-2xl flex flex-col pointer-events-none scale-110 rotate-3 backdrop-blur-md opacity-90 z-50 ring-2 ring-white/20",
                     containerClass
              )}>
                     <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60" />

                     <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
                            <div className={cn("px-2 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm border border-white/20 bg-white/20 text-white")}>
                                   {statusText}
                            </div>
                            <span className={cn("text-xs font-black leading-none", textColor)}>${total}</span>
                     </div>
                     <div className="flex-1 min-h-0 relative z-10">
                            <h4 className={cn("font-bold text-sm truncate capitalize leading-tight mb-0.5", textColor)}>{booking.client?.name || booking.guestName || '---'}</h4>
                     </div>
              </div>
       )
})


const DroppableSlot = React.memo(function DroppableSlot({ id, children, isCurrent, isValidStart = true, onSlotClick }: { id: string, children: React.ReactNode, isCurrent: boolean, isValidStart?: boolean, onSlotClick?: () => void }) {
       const { setNodeRef, isOver } = useDroppable({ id, disabled: !isValidStart })

       return (
              <div
                     ref={setNodeRef}
                     onClick={(e) => {
                            if (!children && isValidStart && onSlotClick) {
                                   onSlotClick()
                            }
                     }}
                     className={cn(
                            "group p-1 border-r border-b border-border/30 relative h-full min-h-[60px] transition-all duration-300",
                            isCurrent ? "bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden" : "bg-transparent",
                            isOver && isValidStart && "bg-primary/10 shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]",
                            !children && isValidStart ? "cursor-pointer hover:bg-muted/30" : "cursor-default bg-muted/5"
                     )}
              >
                     {/* "Now" Indicator Line */}
                     {isCurrent && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] z-0" />
                     )}

                     {children ? children : isValidStart && (
                            <div className="w-full h-full rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                   <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
                                          <Plus className="w-5 h-5" />
                                   </div>
                            </div>
                     )}
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
       hideHeader = false
}: {
       onBookingClick: (id: number) => void,
       onNewBooking?: (data: { courtId?: number, time?: string, date: Date }) => void,
       refreshKey?: number,
       date: Date,
       onDateChange: (d: Date) => void,
       hideHeader?: boolean
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
              queryKey: ['turnero', selectedDate.toISOString()],
              queryFn: async () => {
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
       const activeBooking = useMemo(() => bookings.find((b: any) => b.id.toString() === activeId), [activeId, bookings])

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
                     const previousData = queryClient.getQueryData(['turnero', selectedDate.toISOString()])
                     // Optimistic update omitted for complex grid logic safety, relying on invalidate
                     return { previousData }
              },
              onError: (err, newTodo, context: any) => {
                     // ...
                     toast.error('Error al mover reserva')
              },
              onSettled: () => {
                     queryClient.invalidateQueries({ queryKey: ['turnero'] })
              },
              onSuccess: (res: any) => {
                     if (res.success) {
                            toast.success('Reserva reprogramada')
                     } else {
                            toast.error(res.error || 'Error del servidor')
                            queryClient.invalidateQueries({ queryKey: ['turnero'] })
                     }
              }
       })

       // --- DnD HANDLERS ---
       function handleDragStart(event: DragStartEvent) {
              setActiveId(event.active.id as string)
       }

       function handleDragEnd(event: DragEndEvent) {
              setActiveId(null)
              const { active, over } = event
              if (!over) return
              const bookingId = Number(active.id)
              const [courtIdStr, timeStr] = (over.id as string).split('-')
              if (!courtIdStr || !timeStr) return

              const courtId = Number(courtIdStr)
              const [targetH, targetM] = timeStr.split(':').map(Number)
              // Keep original date context
              const newStartTime = set(selectedDate, { hours: targetH, minutes: targetM, seconds: 0, milliseconds: 0 })

              moveBookingMutation.mutate({ bookingId, newStartTime, courtId })
       }

       const colTemplate = `80px repeat(${courts.length}, minmax(180px, 1fr))`

       return (
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                     <div className="flex flex-col h-full bg-card/60 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-xl overflow-hidden flex-1">
                            {!hideHeader && (
                                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-b border-border/40 bg-card/30 gap-3">
                                          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                                 <button onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-2 hover:bg-muted/50 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95">
                                                        <span className="material-icons-round">chevron_left</span>
                                                 </button>
                                                 <div className="flex flex-col items-center min-w-[160px]">
                                                        <div className="text-xl font-black text-foreground leading-tight capitalize tracking-tight">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 font-bold mt-1">
                                                               {format(selectedDate, "MMMM yyyy", { locale: es })}
                                                        </div>
                                                 </div>
                                                 <button onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-2 hover:bg-muted/50 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95">
                                                        <span className="material-icons-round">chevron_right</span>
                                                 </button>
                                          </div>
                                          <div className="flex items-center gap-4 justify-end w-full sm:w-auto">
                                                 <button
                                                        onClick={() => {
                                                               if (onNewBooking) {
                                                                      onNewBooking({ date: selectedDate })
                                                               }
                                                        }}
                                                        className="group flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                                                 >
                                                        <Plus className="w-4 h-4 text-background" strokeWidth={3} />
                                                        NUEVA RESERVA
                                                 </button>
                                          </div>
                                   </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-card/10">
                                   {isLoading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}

                                   <div className="min-w-fit lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: colTemplate }}>
                                          <div className="contents">
                                                 <div className="sticky top-0 left-0 z-30 bg-background/95 backdrop-blur-md border-b border-r border-border/30 p-4 flex items-center justify-center h-[70px]">
                                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hora</span>
                                                 </div>
                                                 {courts.map((court: TurneroCourt, idx: number) => (
                                                        <div key={court.id} className={cn("sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-r border-border/30 p-2 text-center flex flex-col justify-center h-[70px]", idx === courts.length - 1 && "border-r-0")}>
                                                               <span className="font-black text-primary text-xs tracking-widest uppercase">{court.name}</span>
                                                               <span className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5 tracking-wide opacity-50">{(court as any).sport || 'Padel'} • {(court as any).duration || 90}min</span>
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
                                                               <div className={cn("sticky left-0 z-10 p-2 border-r border-b border-border/30 text-center text-[10px] font-black flex items-center justify-center bg-background/95 backdrop-blur-sm h-[60px]", isCurrent ? "text-primary relative overflow-hidden" : "text-muted-foreground")}>
                                                                      {isCurrent && <div className="absolute left-0 w-1 h-full bg-primary" />}
                                                                      {label}
                                                               </div>
                                                               {courts.map((court: TurneroCourt) => {
                                                                      const key = `${court.id}-${label}`

                                                                      // Check if occupied by a previous booking's span
                                                                      if (occupiedSlots.has(key)) return null

                                                                      const booking = bookingsByCourtAndTime.get(`${court.id}-${label}`)

                                                                      // Calculate Span
                                                                      let span = 1
                                                                      if (booking) {
                                                                             const duration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000
                                                                             span = Math.ceil(duration / GRID_STEP)
                                                                      }

                                                                      // Strict Slots Logic
                                                                      // Only allow start if it aligns with court duration relative to Open Time
                                                                      // We assume TIME_SLOTS[0] is Open Time.
                                                                      const courtDuration = (court as any).duration || 90
                                                                      const minFromOpen = slotIndex * GRID_STEP
                                                                      const isValidStart = (minFromOpen % courtDuration) === 0

                                                                      return (
                                                                             <div
                                                                                    key={`${court.id}-${label}`}
                                                                                    style={{ gridRow: `span ${span}` }}
                                                                                    className={cn("contents-wrapper")}
                                                                             >
                                                                                    <DroppableSlot
                                                                                           id={`${court.id}-${label}`}
                                                                                           isCurrent={isCurrent}
                                                                                           isValidStart={isValidStart}
                                                                                           onSlotClick={
                                                                                                  isValidStart && !booking
                                                                                                         ? () => {
                                                                                                                if (onNewBooking) {
                                                                                                                       onNewBooking({ courtId: court.id, time: label, date: selectedDate })
                                                                                                                }
                                                                                                         }
                                                                                                         : undefined
                                                                                           }
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
                                   isOpen={isWaitingListOpen}
                                   onClose={() => setIsWaitingListOpen(false)}
                                   date={selectedDate}
                            />
                            <DragOverlay>
                                   {activeBooking ? <BookingCardPreview booking={activeBooking} /> : null}
                            </DragOverlay>
                     </div>
              </DndContext>
       )
}
