'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTurneroData } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import { TurneroBooking, TurneroCourt } from '@/types/booking'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
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
              <div className="flex flex-col h-full bg-[#09090b] relative overflow-hidden">
                     {/* Ambient Background */}
                     <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />
                     <div className="absolute top-[20%] left-[-10%] w-[200px] h-[200px] bg-brand-green/10 rounded-full blur-[80px] pointer-events-none" />

                     {/* HEADER */}
                     <div className="flex items-center justify-between px-4 py-4 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 shadow-2xl shadow-black/50">
                            <button
                                   onClick={onBack}
                                   className="p-2 -ml-2 text-white/50 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all"
                            >
                                   <ArrowLeft size={24} />
                            </button>

                            <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/5">
                                   <button
                                          onClick={() => onDateChange(subDays(selectedDate, 1))}
                                          className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 text-white/50 active:scale-90 transition-all"
                                   >
                                          <ChevronLeft size={18} />
                                   </button>

                                   <div className="flex flex-col items-center px-2 min-w-[100px]">
                                          <span className="text-white font-bold capitalize text-sm leading-none">
                                                 {format(selectedDate, 'EEEE d', { locale: es })}
                                          </span>
                                          <span className="text-[10px] text-brand-green uppercase font-black tracking-widest mt-0.5">
                                                 {format(selectedDate, 'MMMM', { locale: es })}
                                          </span>
                                   </div>

                                   <button
                                          onClick={() => onDateChange(addDays(selectedDate, 1))}
                                          className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-white/10 text-white/50 active:scale-90 transition-all"
                                   >
                                          <ChevronRight size={18} />
                                   </button>
                            </div>

                            <div className="w-8" /> {/* Spacer for centering */}
                     </div>

                     {/* TIMELINE CONTENT */}
                     <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 space-y-8 relative z-10 custom-scrollbar">
                            {isLoading ? (
                                   <div className="space-y-6 pt-2">
                                          {[14, 15, 16, 17, 18].map((i) => (
                                                 <div key={i} className="relative pl-14">
                                                        {/* Time Skeleton */}
                                                        <div className="absolute left-0 top-0 w-12 flex flex-col items-end">
                                                               <Skeleton className="h-4 w-10 bg-white/5" />
                                                        </div>
                                                        {/* Line and Dot */}
                                                        <div className="absolute left-[52px] top-2 bottom-0 w-px bg-white/5" />
                                                        <div className="absolute left-[50px] top-2.5 w-1.5 h-1.5 rounded-full bg-white/10" />

                                                        {/* Card Skeletons */}
                                                        <div className="grid grid-cols-1 gap-3">
                                                               <Skeleton className="h-[90px] w-full rounded-2xl bg-white/5 border border-white/5" />
                                                               <Skeleton className="h-[70px] w-full rounded-2xl bg-white/5 border border-dashed border-white/5" />
                                                        </div>
                                                 </div>
                                          ))}
                                   </div>
                            ) : (
                                   TIME_SLOTS.map((slot, index) => {
                                          const timeLabel = timeKey(slot)
                                          const isPast = now && slot < now && !isSameDay(selectedDate, addDays(now, 1))

                                          return (
                                                 <div key={timeLabel} className="relative pl-14 group/time">
                                                        {/* Time Marker */}
                                                        <div className="absolute left-0 top-0 w-12 flex flex-col items-end">
                                                               <span className={cn(
                                                                      "text-sm font-bold font-mono transition-colors",
                                                                      timeLabel === format(now || new Date(), 'HH:mm') ? "text-brand-green scale-110" : "text-white/30 group-hover/time:text-white"
                                                               )}>
                                                                      {timeLabel}
                                                               </span>
                                                        </div>

                                                        {/* Timeline Line */}
                                                        <div className="absolute left-[52px] top-2 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent group-hover/time:via-white/20 transition-colors" />
                                                        <div className={cn(
                                                               "absolute left-[50px] top-2.5 w-1.5 h-1.5 rounded-full box-content border-2 border-[#09090b] transition-all",
                                                               timeLabel === format(now || new Date(), 'HH:mm') ? "bg-brand-green ring-4 ring-brand-green/20" : "bg-white/20 group-hover/time:bg-white"
                                                        )} />

                                                        {/* Courts Grid for this Time */}
                                                        <div className="grid grid-cols-1 gap-3">
                                                               {courts.map((court: TurneroCourt) => {
                                                                      const booking = bookingsByCourtAndTime.get(`${court.id}-${timeLabel}`)
                                                                      const isPaid = booking && (booking.transactions?.reduce((acc: any, t: any) => acc + t.amount, 0) || 0) >= booking.price

                                                                      return (
                                                                             <div key={court.id} className="relative">
                                                                                    {booking ? (
                                                                                           <motion.div
                                                                                                  initial={{ opacity: 0, x: -10 }}
                                                                                                  animate={{ opacity: 1, x: 0 }}
                                                                                                  onClick={() => onBookingClick(booking.id)}
                                                                                                  className={cn(
                                                                                                         "rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden group",
                                                                                                         isPaid
                                                                                                                ? "bg-[#1A1D21]/80 border-brand-green/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                                                                                                : "bg-[#1A1D21]/80 border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]"
                                                                                                  )}
                                                                                           >
                                                                                                  {/* Status Glow Blob */}
                                                                                                  <div className={cn(
                                                                                                         "absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40",
                                                                                                         isPaid ? "bg-brand-green" : "bg-orange-500"
                                                                                                  )} />

                                                                                                  {/* Status Stripe */}
                                                                                                  <div className={cn(
                                                                                                         "absolute left-0 top-0 bottom-0 w-1",
                                                                                                         isPaid ? "bg-brand-green" : "bg-orange-500"
                                                                                                  )} />

                                                                                                  <div className="flex justify-between items-start mb-2 pl-3">
                                                                                                         <div>
                                                                                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
                                                                                                                       {court.name}
                                                                                                                </span>
                                                                                                                <h3 className="text-white font-bold text-lg leading-tight capitalize truncate max-w-[180px]">
                                                                                                                       {booking.client?.name || booking.guestName || "Cliente Eventual"}
                                                                                                                </h3>
                                                                                                         </div>
                                                                                                         <div className={cn(
                                                                                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                                                                                                isPaid
                                                                                                                       ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                                                                                                                       : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                                                                         )}>
                                                                                                                {isPaid ? "PAGADO" : "PENDIENTE"}
                                                                                                         </div>
                                                                                                  </div>

                                                                                                  {/* Footer info */}
                                                                                                  <div className="pl-3 flex items-center justify-between mt-3 border-t border-white/5 pt-2">
                                                                                                         <div className="flex items-center gap-2">
                                                                                                                <div className="flex items-center gap-1">
                                                                                                                       <Clock className="w-3 h-3 text-white/30" />
                                                                                                                       <span className="text-xs text-white/50">{config.slotDuration} min</span>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                         <span className="font-mono font-bold text-white text-sm">
                                                                                                                ${booking.price.toLocaleString()}
                                                                                                         </span>
                                                                                                  </div>
                                                                                           </motion.div>
                                                                                    ) : (
                                                                                           // EMPTY SLOT CARD
                                                                                           <motion.button
                                                                                                  initial={{ opacity: 0 }}
                                                                                                  animate={{ opacity: 1 }}
                                                                                                  onClick={() => onBookingClick({ isNew: true, date: selectedDate, courtId: court.id, time: timeLabel } as any)}
                                                                                                  className="w-full h-[60px] rounded-2xl border border-dashed border-white/10 hover:border-brand-green/50 hover:bg-brand-green/5 flex items-center justify-between px-4 group transition-all"
                                                                                           >
                                                                                                  <div className="flex items-center gap-3">
                                                                                                         <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-brand-green transition-colors" />
                                                                                                         <span className="text-xs font-bold text-white/20 uppercase tracking-widest group-hover:text-brand-green/70 transition-colors">
                                                                                                                {court.name}
                                                                                                         </span>
                                                                                                  </div>
                                                                                                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-brand-green group-hover:text-black group-hover:scale-110 transition-all shadow-none group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                                                                                         <Plus size={16} />
                                                                                                  </div>
                                                                                           </motion.button>
                                                                                    )}
                                                                             </div>
                                                                      )
                                                               })}
                                                        </div>
                                                 </div>
                                          )
                                   })
                            )}
                     </div>

                     {/* FLOATING ACTION BUTTON */}
                     <div className="fixed bottom-24 right-6 lg:hidden z-50">
                            <button
                                   onClick={() => onBookingClick({ isNew: true, date: selectedDate } as any)}
                                   className="w-14 h-14 bg-brand-green rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center text-black active:scale-90 transition-all hover:scale-105 border border-white/20"
                            >
                                   <Plus size={28} />
                            </button>
                     </div>
              </div>
       )
}
