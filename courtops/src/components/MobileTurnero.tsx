'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTurneroData } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import { TurneroBooking, TurneroCourt } from '@/types/booking'
import { ChevronLeft, ChevronRight, Plus, Clock, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface MobileTurneroProps {
       date: Date
       onDateChange: (date: Date) => void
       onBookingClick: (id: number) => void
       onBack: () => void
}

function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

// Sub-components for better performance
const BookingCard = React.memo(({ booking, courtName, onBookingClick }: { booking: TurneroBooking, courtName: string, onBookingClick: (id: number) => void }) => {
       const isPaid = (booking.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0) || 0) >= booking.price

       return (
              <div
                     onClick={() => onBookingClick(booking.id)}
                     className={cn(
                            "relative overflow-hidden rounded-xl border p-4 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-lg",
                            isPaid
                                   ? "bg-[#0f291e]/80 border-brand-green/20" // Dark Green Tint
                                   : "bg-[#29150f]/80 border-orange-500/20"  // Dark Orange Tint
                     )}
              >
                     {/* Gradient Overlay */}
                     <div className={cn(
                            "absolute inset-0 bg-gradient-to-r opacity-20 pointer-events-none",
                            isPaid ? "from-brand-green to-transparent" : "from-orange-500 to-transparent"
                     )} />

                     <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                   <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">{courtName}</span>
                                   <h4 className="text-base font-bold text-white truncate max-w-[150px] capitalize leading-tight">
                                          {booking.client?.name || booking.guestName || "Anónimo"}
                                   </h4>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                   <span className={cn(
                                          "text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase",
                                          isPaid ? "text-brand-green bg-brand-green/10" : "text-orange-400 bg-orange-500/10"
                                   )}>
                                          {isPaid ? "PAGADO" : "DEBE"}
                                   </span>
                                   <span className="text-xs text-white/80">
                                          ${booking.price.toLocaleString()}
                                   </span>
                            </div>
                     </div>
              </div>
       )
}, (prev, next) => {
       return prev.booking.id === next.booking.id &&
              prev.booking.status === next.booking.status &&
              prev.booking.paymentStatus === next.booking.paymentStatus &&
              prev.booking.price === next.booking.price
})

const EmptySlot = React.memo(({ courtName, onBookingClick, timeLabel, courtId, selectedDate }: any) => {
       return (
              <button
                     onClick={() => onBookingClick({ isNew: true, date: selectedDate, courtId, time: timeLabel })}
                     className="relative w-full h-[52px] rounded-xl flex items-center justify-between px-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 active:scale-[0.99] transition-all group/empty"
              >
                     <div className="flex items-center gap-3">
                            <div className="w-1 h-3 rounded-full bg-white/20 group-hover/empty:bg-brand-green transition-colors" />
                            <span className="text-xs font-medium text-white/40 group-hover/empty:text-white transition-colors uppercase tracking-wide">
                                   {courtName}
                            </span>
                     </div>

                     <div className="flex items-center gap-2 opacity-0 group-hover/empty:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Reservar</span>
                            <div className="w-5 h-5 rounded-full bg-brand-green/20 flex items-center justify-center">
                                   <Plus size={12} className="text-brand-green" />
                            </div>
                     </div>

                     <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-hover/empty:opacity-0 transition-opacity">
                            <Plus size={14} className="text-white" />
                     </div>
              </button>
       )
})


export default function MobileTurnero({ date, onDateChange, onBookingClick, onBack }: MobileTurneroProps) {
       const selectedDate = date
       const queryClient = useQueryClient()
       const [now, setNow] = useState<Date | null>(null)

       // Data Fetching
       const { data, isLoading } = useQuery({
              queryKey: ['turnero', selectedDate.toISOString()],
              queryFn: () => getTurneroData(selectedDate.toISOString()),
              refetchInterval: 30000,
       })

       // --- REAL-TIME UPDATES (Pusher) ---
       useEffect(() => {
              if (!data?.clubId) return

              let channel: any;

              const connectPusher = async () => {
                     try {
                            const { pusherClient } = await import('@/lib/pusher');
                            const channelName = `club-${data.clubId}`;
                            channel = pusherClient.subscribe(channelName);

                            channel.bind('booking-update', (payload: any) => {
                                   queryClient.invalidateQueries({ queryKey: ['turnero'] });
                            });
                     } catch (error) {
                            console.error("Mobile Pusher Error:", error);
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

       // Derived State
       const courts = data?.courts || []
       const bookings = useMemo(() => {
              if (!data?.bookings) return []
              return data.bookings.filter((b: TurneroBooking) => isSameDay(new Date(b.startTime), selectedDate))
       }, [data, selectedDate])

       const config = data?.config || { openTime: '14:00', closeTime: '00:30', slotDuration: 90 }

       const bookingsByCourtAndTime = useMemo(() => {
              const map = new Map<string, TurneroBooking>()
              for (const b of bookings) {
                     const timeStr = format(new Date(b.startTime), 'HH:mm')
                     map.set(`${b.courtId}-${timeStr}`, b)
              }
              return map
       }, [bookings])

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

       // Clock
       useEffect(() => {
              setNow(new Date())
              const interval = setInterval(() => setNow(new Date()), 60000)
              return () => clearInterval(interval)
       }, [])

       return (
              <div className="flex flex-col h-full bg-[#09090b] relative overflow-hidden font-sans">
                     {/* Ambient Background - Subtle */}
                     <div className="fixed top-[-20%] right-[-20%] w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
                     <div className="fixed bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

                     {/* MODERN HEADER */}
                     <div className="flex flex-col border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-50 transition-all">
                            <div className="flex items-center justify-between px-4 py-3">
                                   <button
                                          onClick={onBack}
                                          className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-95"
                                   >
                                          <ArrowLeft size={22} />
                                   </button>

                                   <div className="flex items-center gap-6">
                                          <button
                                                 onClick={() => onDateChange(subDays(selectedDate, 1))}
                                                 className="p-2 text-white/50 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-all active:scale-90"
                                          >
                                                 <ChevronLeft size={20} />
                                          </button>

                                          <div className="flex flex-col items-center cursor-pointer group" onClick={() => { /* Potential: Open Calendar Picker */ }}>
                                                 <span className="text-white font-black text-lg leading-none capitalize tracking-wide group-hover:text-brand-green transition-colors">
                                                        {format(selectedDate, 'EEEE d', { locale: es })}
                                                 </span>
                                                 <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-1 group-hover:text-brand-green/70 transition-colors">
                                                        {format(selectedDate, 'MMMM', { locale: es })}
                                                 </span>
                                          </div>

                                          <button
                                                 onClick={() => onDateChange(addDays(selectedDate, 1))}
                                                 className="p-2 text-white/50 hover:text-brand-green hover:bg-brand-green/10 rounded-full transition-all active:scale-90"
                                          >
                                                 <ChevronRight size={20} />
                                          </button>
                                   </div>

                                   <div className="w-9" /> {/* Spacer */}
                            </div>
                     </div>

                     {/* TIMELINE CONTENT */}
                     <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-32">
                            {isLoading ? (
                                   <div className="p-4 space-y-8">
                                          {[...Array(4)].map((_, i) => (
                                                 <div key={i} className="flex gap-4">
                                                        <Skeleton className="w-12 h-6 bg-white/5 rounded" />
                                                        <div className="flex-1 space-y-3">
                                                               <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
                                                               <Skeleton className="h-14 w-full bg-white/5 rounded-xl" />
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            ) : (
                                   <div className="flex flex-col py-6">
                                          {TIME_SLOTS.map((slot, index) => {
                                                 const timeLabel = timeKey(slot)
                                                 const isCurrentHour = timeLabel === format(now || new Date(), 'HH:mm')

                                                 return (
                                                        <div key={timeLabel} className="group/time-row relative flex gap-4 px-4 mb-8">
                                                               {/* TIMELINE COLUMN */}
                                                               <div className="flex flex-col items-center relative min-w-[50px]">
                                                                      <span className={cn(
                                                                             "text-sm font-bold py-1 rounded-md transition-all duration-300",
                                                                             isCurrentHour
                                                                                    ? "text-brand-green scale-110 bg-brand-green/10 px-2"
                                                                                    : "text-white/40 group-hover/time-row:text-white"
                                                                      )}>
                                                                             {timeLabel}
                                                                      </span>
                                                                      {/* Connecting Line */}
                                                                      {index !== TIME_SLOTS.length - 1 && (
                                                                             <div className="w-px flex-1 bg-gradient-to-b from-white/10 to-transparent my-2 group-hover/time-row:from-white/20" />
                                                                      )}
                                                               </div>

                                                               {/* CARDS COLUMN */}
                                                               <div className="flex-1 flex flex-col gap-3 pt-1">
                                                                      {courts.map((court: TurneroCourt) => {
                                                                             const booking = bookingsByCourtAndTime.get(`${court.id}-${timeLabel}`)

                                                                             return (
                                                                                    <div key={court.id}>
                                                                                           {booking ? (
                                                                                                  <BookingCard booking={booking} courtName={court.name} onBookingClick={onBookingClick} />
                                                                                           ) : (
                                                                                                  <EmptySlot courtName={court.name} onBookingClick={onBookingClick} timeLabel={timeLabel} courtId={court.id} selectedDate={selectedDate} />
                                                                                           )}
                                                                                    </div>
                                                                             )
                                                                      })}
                                                               </div>
                                                        </div>
                                                 )
                                          })}
                                   </div>
                            )}
                     </div>

                     {/* FAB - Create Booking */}
                     <div className="fixed bottom-6 right-6 lg:hidden z-50">
                            <button
                                   onClick={() => onBookingClick({ isNew: true, date: selectedDate } as any)}
                                   className="w-14 h-14 bg-[#10b981] rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.5)] flex items-center justify-center text-[#09090b] active:scale-90 transition-transform hover:scale-105"
                            >
                                   <Plus size={28} strokeWidth={2.5} />
                            </button>
                     </div>
              </div>
       )
}
