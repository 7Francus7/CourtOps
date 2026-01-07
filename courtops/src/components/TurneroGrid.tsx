'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

import { getBookingsForDate, getCourts, getClubSettings, type BookingWithClient } from '@/actions/turnero'
import { cn } from '@/lib/utils'

// Removed BookingManagementModal import
import BookingModal from './BookingModal'

type Court = { id: number; name: string }

function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

type Props = {
       onBookingClick: (booking: any) => void
       refreshKey?: number
}

export default function TurneroGrid({ onBookingClick, refreshKey = 0 }: Props) {
       const router = useRouter()
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())
       const [courts, setCourts] = useState<Court[]>([])
       const [bookings, setBookings] = useState<BookingWithClient[]>([])
       const [config, setConfig] = useState({ openTime: '08:00', closeTime: '23:30', slotDuration: 90 })
       const [isLoading, setIsLoading] = useState(true)
       const [now, setNow] = useState<Date | null>(null)

       const [isNewModalOpen, setIsNewModalOpen] = useState(false)
       const [newModalData, setNewModalData] = useState<{ courtId?: number; time?: string }>({})

       // Removed local managementData state

       const TIME_SLOTS = useMemo(() => {
              const slots: Date[] = []
              const [openH, openM] = config.openTime.split(':').map(Number)
              const [closeH, closeM] = config.closeTime.split(':').map(Number)

              let cur = set(selectedDate, { hours: openH, minutes: openM, seconds: 0, milliseconds: 0 })
              let endLimit = set(selectedDate, { hours: closeH, minutes: closeM, seconds: 0, milliseconds: 0 })

              // Handle crossing midnight
              if (endLimit <= cur) {
                     endLimit = addDays(endLimit, 1)
              }

              while (cur < endLimit) {
                     slots.push(cur)
                     cur = addMinutes(cur, config.slotDuration)
              }
              return slots
       }, [selectedDate, config])

       const bookingsByCourtAndTime = useMemo(() => {
              const map = new Map<string, BookingWithClient>()
              for (const b of bookings) {
                     if (b.status === 'CANCELED') continue;

                     const start = new Date(b.startTime)
                     const key = `${b.courtId}-${timeKey(start)}`
                     map.set(key, b)
              }
              return map
       }, [bookings])

       // FIX: Handle Current Time Interval Client Side Only
       useEffect(() => {
              setNow(new Date())
              const interval = setInterval(() => setNow(new Date()), 60000)
              return () => clearInterval(interval)
       }, [])

       async function fetchData(silent = false) {
              if (!silent) setIsLoading(true)
              try {
                     const [courtsRes, bookingsRes, settingsRes] = await Promise.all([
                            getCourts(),
                            getBookingsForDate(selectedDate),
                            getClubSettings()
                     ])
                     setCourts(courtsRes)
                     setBookings(bookingsRes)
                     if (settingsRes) setConfig(settingsRes as any) // Update config
              } finally {
                     if (!silent) setIsLoading(false)
              }
       }

       useEffect(() => {
              fetchData()

              // Polling every 10 seconds
              const intervalId = setInterval(() => {
                     fetchData(true)
              }, 10000)

              return () => clearInterval(intervalId)
       }, [selectedDate])

       // Refresh when key changes (from parent)
       useEffect(() => {
              if (refreshKey > 0) {
                     fetchData(true)
              }
       }, [refreshKey])

       function goToday() {
              setSelectedDate(new Date())
       }

       function openNewBooking(courtId?: number, time?: string) {
              setNewModalData({ courtId, time })
              setIsNewModalOpen(true)
       }

       function openBookingManagement(booking: BookingWithClient, courtName: string) {
              onBookingClick({
                     id: booking.id,
                     clientName: booking.client?.name || 'Cliente',
                     startTime: booking.startTime,
                     courtName: courtName,
                     status: booking.status,
                     paymentStatus: booking.paymentStatus,
                     price: booking.price
              })
       }

       return (
              <div className="flex flex-col h-full bg-bg-dark rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                     {/* Header */}
                     {/* Header */}
                     <div className="flex flex-col sm:flex-row items-center justify-between p-3 lg:p-4 border-b border-white/5 bg-bg-surface/30 backdrop-blur-sm gap-3 transition-all">
                            {/* Date Navigation */}
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-6 p-1 sm:p-0">
                                   <button
                                          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                          className="text-text-grey hover:text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-white/10"
                                   >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                   </button>

                                   <div className="flex flex-col items-center flex-1 sm:flex-none px-4 text-center min-w-[140px]">
                                          <div className="text-white font-bold text-lg lg:text-2xl capitalize leading-none mb-1 tracking-tight">
                                                 {format(selectedDate, "EEEE d", { locale: es })}
                                          </div>
                                          <div className="text-[10px] lg:text-xs text-brand-blue uppercase font-bold tracking-[0.2em] leading-none">
                                                 {format(selectedDate, "MMMM", { locale: es })}
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                          className="text-text-grey hover:text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all active:scale-95 border border-transparent hover:border-white/10"
                                   >
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                   </button>
                            </div>

                            {/* Actions & Legend */}
                            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                                   {!isSameDay(selectedDate, new Date()) && (
                                          <button
                                                 onClick={goToday}
                                                 className="mr-auto sm:mr-0 text-xs font-bold text-brand-blue bg-brand-blue/10 px-3 py-2 rounded-lg hover:bg-brand-blue/20 transition-colors"
                                          >
                                                 HOY
                                          </button>
                                   )}

                                   <div className="hidden lg:flex items-center gap-2 px-2 border-r border-white/5 mr-2">
                                          <div className="flex items-center gap-2 px-2">
                                                 <div className="w-2 h-2 bg-brand-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                 <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider">Pagado</span>
                                          </div>
                                          <div className="flex items-center gap-2 px-2">
                                                 <div className="w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                 <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider">Confirmado</span>
                                          </div>
                                          <div className="flex items-center gap-2 px-2">
                                                 <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                                 <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider">Seña</span>
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => openNewBooking()}
                                          className="hidden sm:flex bg-brand-green text-bg-dark font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-brand-green-variant transition-colors shadow-lg shadow-brand-green/20"
                                   >
                                          + Reserva
                                   </button>

                                   {/* Mobile Config Button (if header hidden) but usually header has it. Use this mainly for Desktop */}
                                   <a href="/configuracion" className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg bg-white/5 text-text-grey hover:text-white hover:bg-white/10 transition-colors" title="Configuración">
                                          ⚙️
                                   </a>
                            </div>
                     </div>

                     {/* Grid Container - Horizontal Scroll */}
                     <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0B0D10]">

                            {/* Loading State */}
                            {isLoading && (
                                   <div className="absolute inset-0 flex items-center justify-center z-50 bg-bg-dark/50 backdrop-blur-sm">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
                                   </div>
                            )}

                            {/* Inner Grid with Min Width to force scroll */}
                            <div className="min-w-[600px] lg:min-w-0" style={{
                                   display: 'grid',
                                   gridTemplateColumns: `80px repeat(${courts.length}, minmax(180px, 1fr))`
                            }}>
                                   {/* Sticky Header */}
                                   <div className="contents">
                                          <div className="sticky top-0 left-0 z-30 bg-bg-dark border-b border-r border-white/10 p-3 text-center flex items-center justify-center shadow-lg h-[60px]">
                                                 <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40">Hora</span>
                                          </div>
                                          {courts.map((court, index) => (
                                                 <div key={court.id} className={cn(
                                                        "sticky top-0 z-20 bg-bg-dark border-b border-r border-white/10 p-3 text-center shadow-lg flex flex-col justify-center h-[60px]",
                                                        index === courts.length - 1 ? "border-r-0" : ""
                                                 )}>
                                                        <span className="font-black text-brand-blue text-sm sm:text-base tracking-wide uppercase">
                                                               {court.name}
                                                        </span>
                                                        <span className="text-[10px] text-white/30 font-medium">Padel</span>
                                                 </div>
                                          ))}
                                   </div>

                                   {/* Body */}
                                   {TIME_SLOTS.map((slotStart, slotIndex) => {
                                          const slotLabel = timeKey(slotStart)

                                          // Correct Client-Side Calculation
                                          let isCurrentTime = false
                                          if (now) {
                                                 const isToday = isSameDay(selectedDate, now)
                                                 if (isToday) {
                                                        const slotExactStart = set(now, {
                                                               hours: slotStart.getHours(),
                                                               minutes: slotStart.getMinutes(),
                                                               seconds: 0,
                                                               milliseconds: 0
                                                        })
                                                        const slotExactEnd = addMinutes(slotExactStart, config.slotDuration)

                                                        if (now >= slotExactStart && now < slotExactEnd) {
                                                               isCurrentTime = true
                                                        }
                                                 }
                                          }

                                          return (
                                                 <div key={slotLabel} className="contents group/time-row">
                                                        {/* Time Column - Sticky Left */}
                                                        <div className={cn(
                                                               "sticky left-0 z-10 p-3 border-r border-b border-white/10 text-center text-sm font-mono flex items-center justify-center font-medium bg-[#111418]",
                                                               isCurrentTime ? "text-brand-blue font-bold" : "text-text-grey group-hover/time-row:text-white transition-colors"
                                                        )}>
                                                               <div className={cn(
                                                                      "px-2 py-1 rounded",
                                                                      isCurrentTime && "bg-brand-blue/10"
                                                               )}>
                                                                      {slotLabel}
                                                               </div>
                                                        </div>

                                                        {/* Court Slots */}
                                                        {courts.map((court, courtIndex) => {
                                                               const key = `${court.id}-${slotLabel}`
                                                               const booking = bookingsByCourtAndTime.get(key)
                                                               const isLastColumn = courtIndex === courts.length - 1

                                                               return (
                                                                      <div key={key} className={cn(
                                                                             "p-1 border-r border-b border-white/10 relative min-h-[120px] transition-all duration-300",
                                                                             isLastColumn ? "border-r-0" : "",
                                                                             isCurrentTime ? "bg-brand-blue/[0.03]" : "hover:bg-white/[0.02]"
                                                                      )}>
                                                                             {/* Background Pattern for empty slots to reduce "void" feel */}
                                                                             {!booking && (
                                                                                    <div className="absolute inset-0 opacity-0 group-hover/time-row:opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent transition-opacity" />
                                                                             )}

                                                                             {/* Current Time Line indicator */}
                                                                             {isCurrentTime && (
                                                                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-brand-blue shadow-[0_0_10px_rgba(59,130,246,0.5)] z-0" />
                                                                             )}

                                                                             <div className="w-full h-full relative z-10">
                                                                                    {booking ? (() => {
                                                                                           const itemsTotal = (booking.items as any[])?.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0) || 0
                                                                                           const totalCost = booking.price + itemsTotal
                                                                                           const totalPaid = (booking.transactions as any[])?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0
                                                                                           const balance = totalCost - totalPaid
                                                                                           const isPaid = balance <= 0
                                                                                           const isPartial = totalPaid > 0 && !isPaid

                                                                                           return (
                                                                                                  <div
                                                                                                         onClick={() => openBookingManagement(booking, court.name)}
                                                                                                         className={cn(
                                                                                                                "w-full h-full rounded-lg p-3 text-left transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between overflow-hidden relative group/card border",
                                                                                                                isPaid
                                                                                                                       ? "bg-[#051A10] border-brand-green/30 hover:border-brand-green/60"
                                                                                                                       : booking.status === 'PENDING' && !isPartial
                                                                                                                              ? "bg-[#2A1205] border-orange-500/30 hover:border-orange-500/60"
                                                                                                                              : "bg-[#051220] border-brand-blue/30 hover:border-brand-blue/60"
                                                                                                         )}
                                                                                                  >
                                                                                                         {/* Status Top Line - Clean Design */}
                                                                                                         <div className="flex justify-between items-start mb-2">
                                                                                                                <span className={cn(
                                                                                                                       "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                                                                                       isPaid ? "bg-brand-green/20 text-brand-green" :
                                                                                                                              isPartial ? "bg-yellow-500/20 text-yellow-500" :
                                                                                                                                     booking.status === 'PENDING' ? "bg-orange-500/20 text-orange-500" :
                                                                                                                                            "bg-brand-blue/20 text-brand-blue"
                                                                                                                )}>
                                                                                                                       {isPaid ? 'Pagado' : isPartial ? 'Parcial' : booking.status === 'PENDING' ? 'Reserva' : 'Seña'}
                                                                                                                </span>
                                                                                                                <span className="font-mono text-xs font-bold text-white/90">
                                                                                                                       ${totalCost.toLocaleString('es-AR')}
                                                                                                                </span>
                                                                                                         </div>

                                                                                                         <div className="flex-1 flex items-center">
                                                                                                                <h4 className="font-bold text-white text-sm sm:text-base leading-tight w-full truncate" title={booking.client?.name || 'Cliente'}>
                                                                                                                       {booking.client?.name || 'Cliente'}
                                                                                                                </h4>
                                                                                                         </div>

                                                                                                         {!isPaid && (
                                                                                                                <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                                                                                                                       <span className="text-[10px] text-red-400 font-medium">Debe: ${balance.toLocaleString('es-AR')}</span>
                                                                                                                </div>
                                                                                                         )}
                                                                                                  </div>
                                                                                           )
                                                                                    })() : (
                                                                                           <div
                                                                                                  onClick={() => openNewBooking(court.id, slotLabel)}
                                                                                                  className="w-full h-full rounded-lg border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/[0.03] hover:border-brand-green/20 cursor-pointer group/empty"
                                                                                           >
                                                                                                  <span className="text-brand-green font-bold text-2xl scale-75 group-hover/empty:scale-100 transition-transform">+</span>
                                                                                                  <span className="text-[10px] text-brand-green/70 font-bold uppercase tracking-wider mt-1 opacity-0 group-hover/empty:opacity-100 transition-opacity">Reservar</span>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          )
                                   })}
                            </div>
                     </div>

                     {/* Modals */}
                     <BookingModal
                            isOpen={isNewModalOpen}
                            onClose={() => setIsNewModalOpen(false)}
                            onSuccess={() => {
                                   fetchData()
                                   router.refresh()
                                   setIsNewModalOpen(false)
                            }}
                            initialDate={selectedDate}
                            initialTime={newModalData.time}
                            initialCourtId={newModalData.courtId || 0}
                            courts={courts}
                     />


              </div>
       )
}
