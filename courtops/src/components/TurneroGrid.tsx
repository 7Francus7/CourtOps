'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'

import { DndContext, useDraggable, useDroppable, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getTurneroData } from '@/actions/dashboard'
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
import { Check, Clock, AlertCircle, Coins, Phone } from 'lucide-react'

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
       let containerClass = "bg-blue-600/90 border-blue-500/50 shadow-[0_4px_20px_-10px_rgba(37,99,235,0.6)]"
       let statusIcon = <Check size={12} className="text-white" />
       let statusText = "CONFIRMADO"
       let textColor = "text-white"

       if (isPaid) {
              containerClass = "bg-[#10b981] border-[#0be8a0]/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.6)]" // Emerald Green
              statusIcon = <Coins size={12} className="text-emerald-950" />
              statusText = "PAGADO"
              textColor = "text-emerald-950 font-semibold"
       } else if (booking.status === 'PENDING') {
              containerClass = "bg-slate-800/80 backdrop-blur-sm border-slate-600/50" // Neutral Grey for Pending
              statusIcon = <Clock size={12} className="text-slate-300" />
              statusText = "PENDIENTE"
              textColor = "text-slate-200"
       } else if (paid > 0) {
              containerClass = "bg-orange-500/90 border-orange-400/50 shadow-[0_4px_20px_-10px_rgba(249,115,22,0.6)]" // Orange for Partial
              statusIcon = <AlertCircle size={12} className="text-white" />
              statusText = "SEÑA PARCIAL"
              textColor = "text-white"
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
                            "w-full h-full rounded-xl p-3 text-left border cursor-move transition-all duration-200 flex flex-col group/card relative overflow-hidden touch-none",
                            containerClass,
                            isDragging ? "opacity-90 scale-105 rotate-3 shadow-2xl z-50 cursor-grabbing" : "hover:-translate-y-0.5"
                     )}
              >
                     {/* Glossy Effect Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 pointer-events-none" />

                     {/* Header: Status & Price */}
                     <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
                            <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase backdrop-blur-md", isPaid ? "bg-black/10 text-emerald-900" : "bg-black/20 text-white/90")}>
                                   {statusIcon}
                                   <span>{statusText}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                   <span className={cn("font-mono text-xs font-black leading-none", isPaid ? "text-emerald-950" : "text-white")}>${total}</span>
                            </div>
                     </div>

                     {/* Content: Name & Info */}
                     <div className="flex-1 min-h-0 flex flex-col relative z-10">
                            <h4 className={cn("font-bold text-sm truncate capitalize leading-tight mb-1", textColor)}>
                                   {booking.client?.name || booking.guestName || '---'}
                            </h4>

                            {(booking.client?.phone || booking.guestPhone) && (
                                   <div className="flex items-center gap-1.5 opacity-80">
                                          <Phone size={10} className={isPaid ? "text-emerald-900" : "text-white"} />
                                          <span className={cn("text-[10px] font-medium tracking-tight", isPaid ? "text-emerald-900" : "text-white")}>
                                                 {booking.client?.phone || booking.guestPhone}
                                          </span>
                                   </div>
                            )}

                            {/* Items / Extras Ribbon */}
                            {booking.items && booking.items.length > 0 && (
                                   <div className="mt-auto pt-2">
                                          <div className="flex flex-wrap gap-1">
                                                 {booking.items.slice(0, 2).map((item, i: number) => (
                                                        <span key={i} className={cn("text-[9px] px-1.5 py-0.5 rounded-lg leading-none font-medium backdrop-blur-sm border border-white/10", isPaid ? "bg-black/5 text-emerald-900" : "bg-white/10 text-white")}>
                                                               {item.quantity}x {item.product?.name?.split(' ')[0]}
                                                        </span>
                                                 ))}
                                                 {booking.items.length > 2 && <span className={cn("text-[9px] px-1 py-0.5 rounded-lg", isPaid ? "text-emerald-900" : "text-white/60")}>+{booking.items.length - 2}</span>}
                                          </div>
                                   </div>
                            )}

                            {/* Balance Alert */}
                            {balance > 0 && booking.status !== 'PENDING' && (
                                   <div className="absolute bottom-0 right-0">
                                          <span className="text-[9px] font-black text-white bg-red-500/90 px-1.5 py-0.5 rounded-tl-lg shadow-sm">
                                                 -${balance}
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
       let containerClass = "bg-blue-600/90 border-blue-500/50"
       let statusText = "CONFIRMADO"
       let textColor = "text-white"

       if (isPaid) {
              containerClass = "bg-[#10b981] border-[#0be8a0]/50"
              statusText = "PAGADO"
              textColor = "text-emerald-950 font-semibold"
       } else if (booking.status === 'PENDING') {
              containerClass = "bg-slate-800/90 border-slate-600/50"
              statusText = "PENDIENTE"
              textColor = "text-slate-200"
       } else if (paid > 0) {
              containerClass = "bg-orange-500/90 border-orange-400/50"
              statusText = "SEÑA PARCIAL"
              textColor = "text-white"
       }

       return (
              <div className={cn(
                     "w-[220px] h-[120px] rounded-xl p-3 text-left border shadow-2xl flex flex-col pointer-events-none scale-105 rotate-3 backdrop-blur-md opacity-90 z-50",
                     containerClass
              )}>
                     <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-60" />

                     <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
                            <div className={cn("px-2 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm", isPaid ? "bg-black/10 text-emerald-900" : "bg-black/20 text-white")}>
                                   {statusText}
                            </div>
                            <span className={cn("font-mono text-xs font-black leading-none", isPaid ? "text-emerald-950" : "text-white")}>${total}</span>
                     </div>
                     <div className="flex-1 min-h-0 relative z-10">
                            <h4 className={cn("font-bold text-sm truncate capitalize leading-tight mb-0.5", textColor)}>{booking.client?.name || booking.guestName || '---'}</h4>
                     </div>
              </div>
       )
})


const DroppableSlot = React.memo(function DroppableSlot({ id, children, isCurrent, onClick }: { id: string, children: React.ReactNode, isCurrent: boolean, onClick: () => void }) {
       const { setNodeRef, isOver } = useDroppable({ id })

       return (
              <div
                     ref={setNodeRef}
                     onClick={(e) => {
                            if (!children) {
                                   onClick()
                            }
                     }}
                     className={cn("group p-1 border-r border-b border-[#27272a] relative min-h-[160px] transition-all duration-200", isCurrent ? "bg-emerald-500/5 shadow-inner" : "bg-white/[0.01]", isOver && "bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]", !children && "cursor-pointer hover:bg-white/[0.03]")}
              >
                     {children ? children : (
                            <div className="w-full h-full rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                                          <span className="font-bold text-lg">+</span>
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
              queryFn: () => getTurneroData(selectedDate.toISOString()),
              refetchInterval: 30000,
              refetchOnWindowFocus: true
       })

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
                            console.log(`🔌 Connected to Pusher channel: ${channelName}`);

                            // Listen for ANY update relevant to bookings
                            channel.bind('booking-update', (payload: any) => {
                                   queryClient.invalidateQueries({ queryKey: ['turnero'] });
                                   if (payload.action === 'create') {
                                          toast.success('Nueva reserva recibida', { position: 'top-center' });
                                   }
                            });
                     } catch (error) {
                            console.error("Pusher connection failed:", error);
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
       const activeBooking = useMemo(() => bookings.find(b => b.id.toString() === activeId), [activeId, bookings])

       const TIME_SLOTS = useMemo(() => {
              const slots: Date[] = []
              const [openH, openM] = config.openTime.split(':').map(Number)
              const [closeH, closeM] = config.closeTime.split(':').map(Number)
              let cur = set(selectedDate, { hours: openH, minutes: openM, seconds: 0, milliseconds: 0 })
              let endLimit = set(selectedDate, { hours: closeH, minutes: closeM, seconds: 0, milliseconds: 0 })
              if (endLimit <= cur) endLimit = addDays(endLimit, 1)
              while (cur < endLimit) {
                     slots.push(cur)
                     cur = addMinutes(cur, config.slotDuration)
              }
              return slots
       }, [selectedDate, config])

       const bookingsByCourtAndTime = useMemo(() => {
              const map = new Map<string, TurneroBooking>()
              for (const b of bookings) {
                     const timeStr = format(new Date(b.startTime), 'HH:mm')
                     map.set(`${b.courtId}-${timeStr}`, b)
              }
              return map
       }, [bookings])

       // --- MUTATIONS ---
       const moveBookingMutation = useMutation({
              mutationFn: async ({ bookingId, newStartTime, courtId }: { bookingId: number, newStartTime: Date, courtId: number }) => {
                     return await updateBookingDetails(bookingId, newStartTime, courtId)
              },
              onMutate: async ({ bookingId, newStartTime, courtId }) => {
                     await queryClient.cancelQueries({ queryKey: ['turnero'] })
                     const previousData = queryClient.getQueryData(['turnero', selectedDate.toISOString()])
                     queryClient.setQueryData(['turnero', selectedDate.toISOString()], (old: any) => {
                            if (!old || !old.bookings) return old
                            return {
                                   ...old,
                                   bookings: old.bookings.map((b: TurneroBooking) => {
                                          if (b.id === bookingId) {
                                                 return {
                                                        ...b,
                                                        startTime: newStartTime.toISOString(),
                                                        endTime: addMinutes(newStartTime, config.slotDuration).toISOString(),
                                                        courtId: courtId
                                                 }
                                          }
                                          return b
                                   })
                            }
                     })
                     return { previousData }
              },
              onError: (err, newTodo, context: any) => {
                     if (context?.previousData) {
                            queryClient.setQueryData(['turnero', selectedDate.toISOString()], context.previousData)
                     }
                     toast.error('Error de conexión, cambios revertidos')
              },
              onSettled: () => {
                     queryClient.invalidateQueries({ queryKey: ['turnero'] })
              },
              onSuccess: (res: any) => {
                     if (res.success) {
                            toast.dismiss()
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
              const targetId = over.id as string
              const currentBooking = bookings.find(b => b.id === bookingId)
              if (currentBooking) {
                     const currentTime = format(new Date(currentBooking.startTime), 'HH:mm')
                     const currentId = `${currentBooking.courtId}-${currentTime}`
                     if (targetId === currentId) return
              }
              const [courtIdStr, timeStr] = targetId.split('-')
              const courtId = Number(courtIdStr)
              const [targetH, targetM] = timeStr.split(':').map(Number)
              const newStartTime = set(selectedDate, { hours: targetH, minutes: targetM, seconds: 0, milliseconds: 0 })
              toast.loading('Moviendo reserva...')
              moveBookingMutation.mutate({ bookingId, newStartTime, courtId })
       }

       return (
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                     <div className="flex flex-col h-full bg-[#0C0F14] border-none overflow-hidden flex-1">
                            {!hideHeader && (
                                   <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-[#27272a] bg-[#0C0F14] gap-3">
                                          <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-6">
                                                 <button onClick={() => onDateChange(subDays(selectedDate, 1))} className="p-2 hover:bg-[#18181b] rounded-full transition-colors text-slate-400 hover:text-white">
                                                        <span className="material-icons-round">chevron_left</span>
                                                 </button>
                                                 <div className="flex flex-col items-center min-w-[140px]">
                                                        <div className="text-xl font-extrabold text-white leading-tight capitalize">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                                               {format(selectedDate, "MMMM yyyy", { locale: es })}
                                                        </div>
                                                 </div>
                                                 <button onClick={() => onDateChange(addDays(selectedDate, 1))} className="p-2 hover:bg-[#18181b] rounded-full transition-colors text-slate-400 hover:text-white">
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
                                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all active:scale-95"
                                                 >
                                                        <span className="material-icons-round text-lg">add</span>
                                                        NUEVA RESERVA
                                                 </button>
                                          </div>
                                   </div>
                            )}

                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0C0F14]">
                                   {isLoading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0C0F14]/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>}
                                   <div className="min-w-fit lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: `80px repeat(${courts.length}, minmax(180px, 1fr))` }}>
                                          <div className="contents">
                                                 <div className="sticky top-0 left-0 z-30 bg-[#0C0F14] border-b border-r border-[#27272a] p-4 flex items-center justify-center h-[90px]">
                                                        <span className="text-[10px] font-bold uppercase text-slate-500">Hora</span>
                                                 </div>
                                                 {courts.map((court: TurneroCourt, idx: number) => (
                                                        <div key={court.id} className={cn("sticky top-0 z-20 bg-[#0C0F14] border-b border-r border-[#27272a] p-4 text-center flex flex-col justify-center h-[90px]", idx === courts.length - 1 && "border-r-0")}>
                                                               <span className="font-black text-emerald-500 text-xs tracking-widest uppercase">{court.name}</span>
                                                               <span className="text-[10px] text-slate-500 font-medium mt-1">Padel</span>
                                                        </div>
                                                 ))}
                                          </div>
                                          {TIME_SLOTS.map((slotStart) => {
                                                 const label = timeKey(slotStart)
                                                 let isCurrent = false
                                                 if (now && isSameDay(selectedDate, now)) {
                                                        const s = set(now, { hours: slotStart.getHours(), minutes: slotStart.getMinutes(), seconds: 0 })
                                                        const e = addMinutes(s, config.slotDuration)
                                                        if (now >= s && now < e) isCurrent = true
                                                 }
                                                 return (
                                                        <div key={label} className="contents group/time-row">
                                                               <div className={cn("sticky left-0 z-10 p-3 border-r border-b border-[#27272a] text-center text-[11px] font-bold flex items-center justify-center bg-[#0C0F14]", isCurrent ? "text-emerald-500" : "text-slate-500")}>{label}</div>
                                                               {courts.map((court: TurneroCourt) => {
                                                                      const booking = bookingsByCourtAndTime.get(`${court.id}-${label}`)
                                                                      return (
                                                                             <DroppableSlot
                                                                                    key={`${court.id}-${label}`}
                                                                                    id={`${court.id}-${label}`}
                                                                                    isCurrent={isCurrent}
                                                                                    onClick={() => {
                                                                                           if (onNewBooking) {
                                                                                                  onNewBooking({ courtId: court.id, time: label, date: selectedDate })
                                                                                           }
                                                                                    }}
                                                                             >
                                                                                    {booking && <DraggableBookingCard booking={booking} onClick={onBookingClick} />}
                                                                             </DroppableSlot>
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
