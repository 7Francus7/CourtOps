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
import BookingModal from './BookingModal'
import { TurneroBooking, TurneroCourt } from '@/types/booking'
import WaitingListSidebar from './WaitingListSidebar'


function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

// --- SUB-COMPONENTS ---

function DraggableBookingCard({ booking, onClick, style: propStyle }: { booking: TurneroBooking, onClick: (id: number) => void, style?: React.CSSProperties }) {
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

       let cardStyle = "bg-[#0c2b4d] border-brand-blue/30"; let lbl = "CONFIRMADO"; let badge = "bg-brand-blue text-white"
       if (isPaid) { cardStyle = "bg-[#142e1b] border-brand-green/30"; lbl = "PAGADO"; badge = "bg-brand-green text-bg-dark" }
       else if (booking.status === 'PENDING') { cardStyle = "bg-zinc-800 border-zinc-600/30"; lbl = "PENDIENTE"; badge = "bg-zinc-500 text-white" }
       else if (paid > 0) { cardStyle = "bg-[#3a1e0e] border-orange-600/30"; lbl = "SEÑA"; badge = "bg-orange-500 text-white" }

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
                     className={cn("w-full h-full rounded-xl p-2.5 text-left border cursor-move hover:shadow-2xl transition-all flex flex-col group/card shadow-lg touch-none", cardStyle, isDragging && "opacity-30")}
              >
                     <div className="flex justify-between items-start gap-1 mb-1.5">
                            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-md", badge)}>{lbl}</span>
                            <div className="flex flex-col items-end">
                                   <span className="font-mono text-[11px] font-bold text-white leading-none">${total}</span>
                                   {balance > 0 && <span className="text-[8px] text-red-400 font-bold mt-0.5 whitespace-nowrap">Faltan ${balance}</span>}
                            </div>
                     </div>
                     <div className="flex-1 min-h-0">
                            <h4 className="font-bold text-white text-sm truncate capitalize leading-tight mb-0.5">{booking.client?.name || booking.guestName || '---'}</h4>
                            {(booking.client?.phone || booking.guestPhone) && (
                                   <div className="flex items-center gap-1 mb-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                          <span className="text-[10px] text-white/50 font-medium">{booking.client?.phone || booking.guestPhone}</span>
                                   </div>
                            )}

                            {booking.items && booking.items.length > 0 && (
                                   <div className="mt-1 pt-1.5 border-t border-white/5">
                                          <div className="flex flex-wrap gap-1">
                                                 {booking.items.slice(0, 2).map((item, i: number) => (
                                                        <span key={i} className="text-[8px] bg-white/5 text-white/60 px-1 py-0.5 rounded leading-none">
                                                               {item.quantity}x {item.product?.name?.split(' ')[0]}
                                                        </span>
                                                 ))}
                                                 {booking.items.length > 2 && <span className="text-[8px] text-white/30">+{(booking.items.length - 2)}</span>}
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>
       )
}

function BookingCardPreview({ booking }: { booking: TurneroBooking }) {
       const itemsT = booking.items?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0
       const total = booking.price + itemsT
       const paid = booking.transactions?.reduce((s, t) => s + t.amount, 0) || 0
       const balance = total - paid
       const isPaid = balance <= 0

       let cardStyle = "bg-[#0c2b4d] border-brand-blue/30"; let lbl = "CONFIRMADO"; let badge = "bg-brand-blue text-white"
       if (isPaid) { cardStyle = "bg-[#142e1b] border-brand-green/30"; lbl = "PAGADO"; badge = "bg-brand-green text-bg-dark" }
       else if (booking.status === 'PENDING') { cardStyle = "bg-zinc-800 border-zinc-600/30"; lbl = "PENDIENTE"; badge = "bg-zinc-500 text-white" }
       else if (paid > 0) { cardStyle = "bg-[#3a1e0e] border-orange-600/30"; lbl = "SEÑA"; badge = "bg-orange-500 text-white" }

       return (
              <div className={cn("w-full h-[120px] rounded-xl p-2.5 text-left border shadow-2xl flex flex-col pointer-events-none scale-105 rotate-2 opacity-90 backdrop-blur-sm", cardStyle)}>
                     <div className="flex justify-between items-start gap-1 mb-1.5">
                            <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-md", badge)}>{lbl}</span>
                            <div className="flex flex-col items-end">
                                   <span className="font-mono text-[11px] font-bold text-white leading-none">${total}</span>
                            </div>
                     </div>
                     <div className="flex-1 min-h-0">
                            <h4 className="font-bold text-white text-sm truncate capitalize leading-tight mb-0.5">{booking.client?.name || booking.guestName || '---'}</h4>
                     </div>
              </div>
       )
}


function DroppableSlot({ id, children, isCurrent, onClick }: { id: string, children: React.ReactNode, isCurrent: boolean, onClick: () => void }) {
       const { setNodeRef, isOver } = useDroppable({ id })

       return (
              <div
                     ref={setNodeRef}
                     className={cn("p-1 border-r border-b border-white/10 relative min-h-[120px] transition-all duration-200", isCurrent && "bg-brand-blue/[0.02]", isOver && "bg-brand-green/10 border-brand-green/30 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]")}
              >
                     {children ? children : (
                            <div onClick={onClick} className="w-full h-full rounded-xl border border-dashed border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/[0.02] cursor-pointer transition-all">
                                   <span className="text-brand-green font-bold text-xl">+</span>
                            </div>
                     )}
              </div>
       )
}

// --- MAIN COMPONENT ---

export default function TurneroGrid({
       onBookingClick,
       refreshKey = 0,
       date,
       onDateChange
}: {
       onBookingClick: (id: number) => void,
       refreshKey?: number,
       date: Date,
       onDateChange: (d: Date) => void
}) {

       // Use prop date instead of internal state
       const selectedDate = date
       const [now, setNow] = useState<Date | null>(null)

       // UI States
       const [isNewModalOpen, setIsNewModalOpen] = useState(false)
       const [newModalData, setNewModalData] = useState<{ courtId?: number; time?: string }>({})
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

       // Debug Info
       const debugInfo = {
              res: bookings.length,
              tot: data?.bookings?.length || 0,
              club: data?.clubId ? data.clubId.substring(0, 8) : '...',
              error: isError ? (error as Error).message : (data?.success === false ? data?.error : '')
       }

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
              onSuccess: (res: any) => {
                     if (res.success) {
                            toast.dismiss()
                            toast.success('Reserva reprogramada')
                            queryClient.invalidateQueries({ queryKey: ['turnero'] })
                     } else {
                            toast.error(res.error || 'Error al mover reserva')
                     }
              },
              onError: (err: any) => {
                     toast.error('Error de conexión')
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
              const targetId = over.id as string // "courtId-time"
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
                     <div className="flex flex-col h-full bg-[#1A1D24]/70 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                            {/* HEADER */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/5 bg-white/5 gap-3">
                                   <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-6">
                                          <button
                                                 onClick={() => onDateChange(subDays(selectedDate, 1))}
                                                 className="text-white hover:bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                                                 aria-label="Día anterior"
                                          >
                                                 <span className="material-icons-round" aria-hidden="true">chevron_left</span>
                                          </button>

                                          <div className="flex flex-col items-center min-w-[140px]">
                                                 <div className="text-white font-bold text-lg capitalize tracking-tight">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                                 <div className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                                                        {format(selectedDate, "MMMM yyyy", { locale: es })}
                                                 </div>
                                          </div>

                                          <button
                                                 onClick={() => onDateChange(addDays(selectedDate, 1))}
                                                 className="text-white hover:bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                                                 aria-label="Día siguiente"
                                          >
                                                 <span className="material-icons-round" aria-hidden="true">chevron_right</span>
                                          </button>
                                   </div>

                                   <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pagado</div>
                                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]"></span> Confirmado</div>
                                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Seña</div>
                                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Espera</div>
                                   </div>

                                   <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                                          <button
                                                 onClick={() => setIsWaitingListOpen(true)}
                                                 className="bg-white/5 text-white/60 font-bold text-xs uppercase px-4 py-2 rounded-xl hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2"
                                          >
                                                 <span className="material-icons-round text-sm">hourglass_empty</span> <span className="hidden sm:inline">Espera</span>
                                          </button>

                                          <button onClick={() => setIsNewModalOpen(true)} className="bg-[var(--color-primary)] text-slate-900 font-bold text-xs uppercase px-4 py-2 rounded-xl hover:brightness-110 shadow-lg shadow-[var(--color-primary)]/20 transition-all flex items-center gap-2">
                                                 <span className="material-icons-round text-sm">add</span> Nueva Reserva
                                          </button>
                                   </div>
                            </div>

                            {/* GRID CONTENT */}
                            <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0F1115] grid-dots">
                                   {isLoading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0F1115]/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" /></div>}

                                   <div className="min-w-[600px] lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: `80px repeat(${courts.length}, minmax(180px, 1fr))` }}>

                                          {/* HEADERS */}
                                          <div className="contents">
                                                 <div className="sticky top-0 left-0 z-30 bg-[#0F1115]/90 backdrop-blur border-b border-r border-white/10 p-3 flex items-center justify-center h-[70px]">
                                                        <span className="text-[10px] font-bold uppercase text-slate-500">Hora</span>
                                                 </div>
                                                 {courts.map((court: TurneroCourt, idx: number) => (
                                                        <div key={court.id} className={cn("sticky top-0 z-20 bg-[#0F1115]/90 backdrop-blur border-b border-r border-white/10 p-3 text-center flex flex-col justify-center h-[70px]", idx === courts.length - 1 && "border-r-0")}>
                                                               <span className="font-bold text-[var(--color-accent-blue)] text-xs tracking-widest uppercase">{court.name}</span>
                                                               <span className="text-[10px] text-slate-500 mt-1">Padel</span>
                                                        </div>
                                                 ))}
                                          </div>

                                          {/* SLOTS */}
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
                                                               <div className={cn("sticky left-0 z-10 p-3 border-r border-b border-white/10 text-center text-[11px] font-bold flex items-center justify-center bg-[#0F1115]", isCurrent ? "text-[var(--color-primary)]" : "text-slate-500")}>{label}</div>
                                                               {courts.map((court: TurneroCourt) => {
                                                                      const booking = bookingsByCourtAndTime.get(`${court.id}-${label}`)
                                                                      return (
                                                                             <DroppableSlot
                                                                                    key={`${court.id}-${label}`}
                                                                                    id={`${court.id}-${label}`}
                                                                                    isCurrent={isCurrent}
                                                                                    onClick={() => { setNewModalData({ courtId: court.id, time: label }); setIsNewModalOpen(true); }}
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

                            <BookingModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['turnero'] }); setIsNewModalOpen(false); }} initialDate={selectedDate} initialTime={newModalData.time} initialCourtId={newModalData.courtId || 0} courts={courts} />

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
