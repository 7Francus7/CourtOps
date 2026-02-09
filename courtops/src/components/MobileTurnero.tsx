'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTurneroData } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import { TurneroBooking, TurneroCourt } from '@/types/booking'
import { ChevronLeft, ChevronRight, Plus, Clock, ArrowLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface MobileTurneroProps {
       date: Date
       onDateChange: (date: Date) => void
       onBookingClick: (id: number) => void
       onBack: () => void
}

const variants = {
       enter: (direction: number) => {
              return {
                     x: direction > 0 ? 1000 : -1000,
                     opacity: 0
              };
       },
       center: {
              zIndex: 1,
              x: 0,
              opacity: 1
       },
       exit: (direction: number) => {
              return {
                     zIndex: 0,
                     x: direction < 0 ? 1000 : -1000,
                     opacity: 0
              };
       }
};

import { Haptics } from '@/lib/haptics'

function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

// Sub-components for better performance
const BookingCard = React.memo(({ booking, courtName, onBookingClick }: { booking: TurneroBooking, courtName: string, onBookingClick: (id: number) => void }) => {
       const isPaid = (booking.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0) || 0) >= booking.price

       return (
              <div
                     onClick={() => {
                            Haptics.light()
                            onBookingClick(booking.id)
                     }}
                     className={cn(
                            "relative overflow-hidden rounded-xl border p-4 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
                            isPaid
                                   ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/20"
                                   : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-500/20"
                     )}
              >
                     <div className="flex justify-between items-start relative z-10">
                            <div className="flex flex-col">
                                   <span className={cn(
                                          "text-[10px] font-black uppercase tracking-wider mb-0.5",
                                          isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                                   )}>{courtName}</span>
                                   <h4 className="text-base font-black text-foreground truncate max-w-[150px] capitalize leading-tight">
                                          {booking.client?.name || booking.guestName || "Anónimo"}
                                   </h4>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                   <span className={cn(
                                          "text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase",
                                          isPaid
                                                 ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20"
                                                 : "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20"
                                   )}>
                                          {isPaid ? "PAGADO" : "DEBE"}
                                   </span>
                                   <span className="text-xs font-bold text-foreground/80">
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
                     onClick={() => {
                            Haptics.light()
                            onBookingClick({ isNew: true, date: selectedDate, courtId, time: timeLabel })
                     }}
                     className="relative w-full h-[52px] rounded-xl flex items-center justify-between px-4 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 active:scale-[0.99] transition-all group/empty shadow-sm"
              >
                     <div className="flex items-center gap-3">
                            <div className="w-1 h-3 rounded-full bg-slate-200 dark:bg-white/20 group-hover/empty:bg-emerald-500 transition-colors" />
                            <span className="text-xs font-bold text-slate-400 dark:text-muted-foreground group-hover/empty:text-foreground transition-colors uppercase tracking-wide">
                                   {courtName}
                            </span>
                     </div>

                     <div className="flex items-center gap-2 opacity-0 group-hover/empty:opacity-100 transition-opacity">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Reservar</span>
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                   <Plus size={12} className="text-emerald-600 dark:text-emerald-500" />
                            </div>
                     </div>

                     <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-hover/empty:opacity-0 transition-opacity">
                            <Plus size={14} className="text-slate-400 dark:text-muted-foreground" />
                     </div>
              </button>
       )
})


export default function MobileTurnero({ date, onDateChange, onBookingClick, onBack }: MobileTurneroProps) {
       const selectedDate = date
       const queryClient = useQueryClient()
       const [now, setNow] = useState<Date | null>(null)
       const [[page, direction], setPage] = useState([0, 0]);

       const paginate = (newDirection: number) => {
              const newDate = newDirection > 0 ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
              setPage([page + newDirection, newDirection]);
              onDateChange(newDate);
       };

       // Data Fetching
       const { data, isLoading } = useQuery({
              queryKey: ['turnero', selectedDate.toISOString()],
              queryFn: () => getTurneroData(selectedDate.toISOString()),
              refetchInterval: 30000,
       })

       // Swipe Logic
       const touchStartX = useRef<number | null>(null)
       const touchStartY = useRef<number | null>(null)

       const onTouchStart = (e: React.TouchEvent) => {
              touchStartX.current = e.targetTouches[0].clientX
              touchStartY.current = e.targetTouches[0].clientY
       }

       const onTouchEnd = (e: React.TouchEvent) => {
              if (!touchStartX.current || !touchStartY.current) return

              const touchEndX = e.changedTouches[0].clientX
              const touchEndY = e.changedTouches[0].clientY

              const deltaX = touchStartX.current - touchEndX
              const deltaY = touchStartY.current - touchEndY

              // Check if horizontal swipe dominant (more X than Y motion)
              // and if distance is significant (> 50px)
              if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                     if (deltaX > 0) {
                            // Swipe Left -> Next Day
                            paginate(1)
                     } else {
                            // Swipe Right -> Prev Day
                            paginate(-1)
                     }
              }

              touchStartX.current = null
              touchStartY.current = null
       }

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
              <div className="flex flex-col h-full bg-background relative overflow-hidden font-sans transition-colors duration-300">
                     {/* Ambient Background - Subtle */}
                     <div className="fixed top-[-20%] right-[-20%] w-[400px] h-[400px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                     <div className="fixed bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/20 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

                     {/* MODERN HEADER */}
                     <div className="flex flex-col border-b border-slate-200 dark:border-white/5 bg-background/90 backdrop-blur-xl sticky top-0 z-50 transition-all">
                            <div className="flex items-center justify-between px-4 py-3">
                                   <button
                                          onClick={onBack}
                                          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all active:scale-95"
                                   >
                                          <ArrowLeft size={22} />
                                   </button>

                                   <div className="flex items-center gap-6">
                                          <button
                                                 onClick={() => paginate(-1)}
                                                 className="p-2 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all active:scale-90"
                                          >
                                                 <ChevronLeft size={20} />
                                          </button>

                                          <div className="flex flex-col items-center cursor-pointer group" onClick={() => { /* Potential: Open Calendar Picker */ }}>
                                                 <span className="text-foreground font-black text-lg leading-none capitalize tracking-wide group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {format(selectedDate, 'EEEE d', { locale: es })}
                                                 </span>
                                                 <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 group-hover:text-emerald-600/70 dark:group-hover:text-emerald-400/70 transition-colors">
                                                        {format(selectedDate, 'MMMM', { locale: es })}
                                                 </span>
                                          </div>

                                          <button
                                                 onClick={() => paginate(1)}
                                                 className="p-2 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-all active:scale-90"
                                          >
                                                 <ChevronRight size={20} />
                                          </button>
                                   </div>

                                   <div className="w-9" /> {/* Spacer */}
                            </div>
                     </div>

                     {/* TIMELINE CONTENT */}
                     <div
                            className="flex-1 overflow-hidden relative z-10"
                            onTouchStart={onTouchStart}
                            onTouchEnd={onTouchEnd}
                     >
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                   <motion.div
                                          key={page}
                                          custom={direction}
                                          variants={variants}
                                          initial="enter"
                                          animate="center"
                                          exit="exit"
                                          transition={{
                                                 x: { type: "spring", stiffness: 300, damping: 30 },
                                                 opacity: { duration: 0.2 }
                                          }}
                                          className="h-full overflow-y-auto custom-scrollbar pb-32"
                                   >
                                          {isLoading ? (
                                                 <div className="p-4 space-y-8">
                                                        {[...Array(4)].map((_, i) => (
                                                               <div key={i} className="flex gap-4">
                                                                      <Skeleton className="w-12 h-6 bg-slate-200 dark:bg-white/5 rounded" />
                                                                      <div className="flex-1 space-y-3">
                                                                             <Skeleton className="h-24 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />
                                                                             <Skeleton className="h-14 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />
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
                                                                                                  ? "text-emerald-600 dark:text-emerald-400 scale-110 bg-emerald-100 dark:bg-emerald-500/10 px-2"
                                                                                                  : "text-slate-400 dark:text-muted-foreground group-hover/time-row:text-foreground"
                                                                                    )}>
                                                                                           {timeLabel}
                                                                                    </span>
                                                                                    {/* Connecting Line */}
                                                                                    {index !== TIME_SLOTS.length - 1 && (
                                                                                           <div className="w-px flex-1 bg-gradient-to-b from-slate-200 dark:from-white/10 to-transparent my-2 group-hover/time-row:from-slate-300 dark:group-hover/time-row:from-white/20" />
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
                                   </motion.div>
                            </AnimatePresence>
                     </div>

                     {/* FAB - Create Booking */}
                     <div className="fixed bottom-6 right-6 lg:hidden z-50">
                            <button
                                   onClick={() => onBookingClick({ isNew: true, date: selectedDate } as any)}
                                   className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] flex items-center justify-center text-white active:scale-90 transition-all hover:scale-105"
                            >
                                   <Plus size={28} strokeWidth={2.5} />
                            </button>
                     </div>
              </div>
       )
}
