'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'

import { getBookingsForDate, getCourts, type BookingWithClient } from '@/actions/turnero'
import { cn } from '@/lib/utils'

import BookingModal from './BookingModal'
import BookingManagementModal from './BookingManagementModal'

const START_HOUR = 14
const LAST_SLOT_START_HOUR = 23
const SLOT_DURATION_MIN = 90

type Court = { id: number; name: string }

function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

export default function TurneroGrid() {
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())
       const [courts, setCourts] = useState<Court[]>([])
       const [bookings, setBookings] = useState<BookingWithClient[]>([])
       const [isLoading, setIsLoading] = useState(true)
       const [now, setNow] = useState<Date | null>(null) // FIX: Hydration Mismatch

       const [isNewModalOpen, setIsNewModalOpen] = useState(false)
       const [newModalData, setNewModalData] = useState<{ courtId?: number; time?: string }>({})

       // Management Modal State
       // We use direct object for managementData to match existing BookingManagementModal props
       const [managementData, setManagementData] = useState<any>(null)

       const TIME_SLOTS = useMemo(() => {
              const slots: Date[] = []
              let cur = set(selectedDate, { hours: START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 })
              const lastStart = set(selectedDate, { hours: LAST_SLOT_START_HOUR, minutes: 0, seconds: 0, milliseconds: 0 })

              while (cur <= lastStart) {
                     slots.push(cur)
                     cur = addMinutes(cur, SLOT_DURATION_MIN)
              }
              return slots
       }, [selectedDate])

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
                     const [courtsRes, bookingsRes] = await Promise.all([
                            getCourts(),
                            getBookingsForDate(selectedDate),
                     ])
                     setCourts(courtsRes)
                     setBookings(bookingsRes)
              } finally {
                     if (!silent) setIsLoading(false)
              }
       }

       useEffect(() => {
              fetchData()

              // Polling every 10 seconds to keep grid updated with public bookings
              const intervalId = setInterval(() => {
                     fetchData(true)
              }, 10000)

              return () => clearInterval(intervalId)
              // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [selectedDate])

       function goToday() {
              setSelectedDate(new Date())
       }

       function openNewBooking(courtId?: number, time?: string) {
              setNewModalData({ courtId, time })
              setIsNewModalOpen(true)
       }

       function openBookingManagement(booking: BookingWithClient, courtName: string) {
              setManagementData({
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
                     <div className="flex flex-col sm:flex-row items-center justify-between p-3 lg:p-4 border-b border-white/5 bg-bg-surface/30 gap-3">
                            {/* Date Navigation */}
                            <div className="flex items-center justify-between w-full sm:w-auto gap-2 lg:gap-3 p-1 sm:p-0">
                                   <button
                                          onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                          className="text-text-grey text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors active:scale-95"
                                   >
                                          ←
                                   </button>

                                   <div className="flex flex-col items-center flex-1 sm:flex-none px-2 text-center">
                                          <div className="text-white font-bold text-lg lg:text-xl capitalize leading-none mb-1">
                                                 {format(selectedDate, "EEEE d", { locale: es })}
                                          </div>
                                          <div className="text-xs text-text-grey uppercase font-bold tracking-widest leading-none">
                                                 {format(selectedDate, "MMMM", { locale: es })}
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                          className="text-text-grey text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors active:scale-95"
                                   >
                                          →
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
                     <div className="flex-1 overflow-auto custom-scrollbar relative bg-bg-card">

                            {/* Loading State */}
                            {isLoading && (
                                   <div className="absolute inset-0 flex items-center justify-center z-50 bg-bg-dark/50 backdrop-blur-sm">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
                                   </div>
                            )}

                            {/* Inner Grid with Min Width to force scroll */}
                            <div className="min-w-[600px] lg:min-w-0" style={{
                                   display: 'grid',
                                   gridTemplateColumns: `80px repeat(${courts.length}, minmax(140px, 1fr))`
                            }}>
                                   {/* Sticky Header */}
                                   <div className="contents">
                                          <div className="sticky top-0 left-0 z-30 bg-bg-surface border-b border-r border-white/5 p-3 text-center text-text-grey text-xs font-bold uppercase tracking-wider flex items-center justify-center shadow-sm">
                                                 Hora
                                          </div>
                                          {courts.map((court) => (
                                                 <div key={court.id} className="sticky top-0 z-20 bg-bg-surface border-b border-r border-white/5 p-3 text-center last:border-r-0 shadow-sm">
                                                        <span className="font-bold text-brand-blue text-sm tracking-wide block truncate">
                                                               {court.name}
                                                        </span>
                                                 </div>
                                          ))}
                                   </div>

                                   {/* Body */}
                                   {TIME_SLOTS.map((slotStart) => {
                                          const slotLabel = timeKey(slotStart)

                                          // Correct Client-Side Calculation
                                          let isCurrentTime = false
                                          if (now) {
                                                 const isToday = isSameDay(selectedDate, now)
                                                 if (isToday) {
                                                        // Create date objects for comparison using the 'now' year/month/day but slot time
                                                        const slotExactStart = set(now, {
                                                               hours: slotStart.getHours(),
                                                               minutes: slotStart.getMinutes(),
                                                               seconds: 0,
                                                               milliseconds: 0
                                                        })
                                                        const slotExactEnd = addMinutes(slotExactStart, SLOT_DURATION_MIN)

                                                        if (now >= slotExactStart && now < slotExactEnd) {
                                                               isCurrentTime = true
                                                        }
                                                 }
                                          }

                                          return (
                                                 <div key={slotLabel} className="contents group">
                                                        {/* Time Column - Sticky Left */}
                                                        <div className={cn(
                                                               "sticky left-0 z-10 p-3 border-r border-b border-white/5 text-center text-sm font-mono flex items-center justify-center font-medium bg-bg-card/95 backdrop-blur-sm",
                                                               isCurrentTime ? "text-brand-blue font-bold shadow-[inset_3px_0_0_0_rgba(59,130,246,1)]" : "text-text-grey"
                                                        )}>
                                                               {slotLabel}
                                                        </div>

                                                        {/* Court Slots */}
                                                        {courts.map((court) => {
                                                               const key = `${court.id}-${slotLabel}`
                                                               const booking = bookingsByCourtAndTime.get(key)

                                                               return (
                                                                      <div key={key} className={cn(
                                                                             "p-1 border-r border-b border-white/5 last:border-r-0 relative min-h-[100px] transition-colors",
                                                                             isCurrentTime ? "bg-brand-blue/5" : "hover:bg-white/[0.02]"
                                                                      )}>
                                                                             {/* Current Time Line across row */}
                                                                             {isCurrentTime && (
                                                                                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-brand-blue/20 pointer-events-none" />
                                                                             )}

                                                                             <div className="w-full h-full rounded-xl relative">
                                                                                    {booking ? (
                                                                                           <div
                                                                                                  onClick={() => openBookingManagement(booking, court.name)}
                                                                                                  className={cn(
                                                                                                         "w-full h-full rounded-xl p-3 text-left transition-all cursor-pointer hover:scale-[1.02] shadow-md flex flex-col justify-between overflow-hidden",
                                                                                                         booking.paymentStatus === 'PAID'
                                                                                                                ? "bg-gradient-to-br from-brand-green/20 to-brand-green/5 border border-brand-green/30"
                                                                                                                : booking.status === 'PENDING'
                                                                                                                       ? "bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30"
                                                                                                                       : "bg-gradient-to-br from-brand-blue/20 to-brand-blue/5 border border-brand-blue/30"
                                                                                                  )}
                                                                                           >
                                                                                                  <div className="min-w-0">
                                                                                                         <div className="flex justify-between items-start mb-1 gap-1">
                                                                                                                <span
                                                                                                                       className={cn(
                                                                                                                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap",
                                                                                                                              booking.paymentStatus === 'PAID'
                                                                                                                                     ? "bg-brand-green text-bg-dark"
                                                                                                                                     : booking.status === 'PENDING'
                                                                                                                                            ? "bg-orange-500 text-white"
                                                                                                                                            : "bg-brand-blue text-white"
                                                                                                                       )}
                                                                                                                >
                                                                                                                       {booking.paymentStatus === 'PAID' ? 'OK' : booking.status === 'PENDING' ? 'Seña' : 'Conf.'}
                                                                                                                </span>
                                                                                                                <span className="text-white text-xs font-mono opacity-60">
                                                                                                                       ${booking.price.toLocaleString('es-AR')}
                                                                                                                </span>
                                                                                                         </div>
                                                                                                         <h4 className="font-bold text-white text-sm truncate leading-tight">
                                                                                                                {booking.client?.name || 'Cliente'}
                                                                                                         </h4>
                                                                                                  </div>
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div
                                                                                                  onClick={() => openNewBooking(court.id, slotLabel)}
                                                                                                  className="w-full h-full rounded-xl border border-dashed border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-green/5 hover:border-brand-green/30 cursor-pointer"
                                                                                           >
                                                                                                  <span className="text-brand-green font-bold text-lg">+</span>
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
                                   setIsNewModalOpen(false)
                            }}
                            initialDate={selectedDate}
                            initialTime={newModalData.time}
                            initialCourtId={newModalData.courtId || 0}
                            courts={courts}
                     />

                     <BookingManagementModal
                            booking={managementData}
                            onClose={() => setManagementData(null)}
                            onUpdate={() => {
                                   fetchData()
                                   setManagementData(null)
                            }}
                     />
              </div>
       )
}
