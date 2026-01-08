'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { format, addDays, subDays, isSameDay, addMinutes, set } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

import { getTurneroData } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import BookingModal from './BookingModal'

function timeKey(d: Date) {
       return format(d, 'HH:mm')
}

export default function TurneroGrid({ onBookingClick, refreshKey = 0 }: { onBookingClick: (b: any) => void, refreshKey?: number }) {
       const router = useRouter()
       const [selectedDate, setSelectedDate] = useState<Date>(new Date())
       const [courts, setCourts] = useState<any[]>([])
       const [bookings, setBookings] = useState<any[]>([])
       const [config, setConfig] = useState({ openTime: '08:00', closeTime: '23:30', slotDuration: 90 })
       const [isLoading, setIsLoading] = useState(true)
       const [now, setNow] = useState<Date | null>(null)
       const [debugInfo, setDebugInfo] = useState({ res: 0, tot: 0, club: '...', error: '' })
       const [isNewModalOpen, setIsNewModalOpen] = useState(false)
       const [newModalData, setNewModalData] = useState<{ courtId?: number; time?: string }>({})

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
              const map = new Map<string, any>()
              for (const b of bookings) {
                     const timeStr = format(new Date(b.startTime), 'HH:mm')
                     map.set(`${b.courtId}-${timeStr}`, b)
              }
              return map
       }, [bookings])

       useEffect(() => {
              setNow(new Date())
              const interval = setInterval(() => setNow(new Date()), 60000)
              return () => clearInterval(interval)
       }, [])

       async function fetchData(silent = false) {
              if (!silent) setIsLoading(true)
              try {
                     const res = await getTurneroData(selectedDate.toISOString())

                     if (res.success) {
                            setCourts(res.courts)
                            setConfig(res.config)
                            const filtered = res.bookings.filter((b: any) => isSameDay(new Date(b.startTime), selectedDate))
                            setBookings(filtered)
                            setDebugInfo({
                                   res: filtered.length,
                                   tot: res.bookings.length,
                                   club: res.clubId.substring(0, 8),
                                   error: ''
                            })
                     } else {
                            setDebugInfo(prev => ({ ...prev, club: 'ERR', error: res.error || 'Unknown' }))
                     }
              } catch (e: any) {
                     console.error("Fetch error", e)
                     setDebugInfo(prev => ({ ...prev, club: 'FATAL', error: e.message }))
              } finally {
                     if (!silent) setIsLoading(false)
              }
       }

       useEffect(() => { fetchData() }, [selectedDate])
       useEffect(() => { if (refreshKey > 0) fetchData(true) }, [refreshKey])
       useEffect(() => {
              const int = setInterval(() => fetchData(true), 30000)
              return () => clearInterval(int)
       }, [selectedDate])

       return (
              <div className="flex flex-col h-full bg-bg-dark rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                     <div className="flex flex-col sm:flex-row items-center justify-between p-3 lg:p-4 border-b border-white/5 bg-bg-surface/30 backdrop-blur-sm gap-3">
                            <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-6">
                                   <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="text-text-grey hover:text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                   </button>
                                   <div className="absolute top-1 left-1 text-[8px] text-zinc-500 select-none flex flex-col items-start gap-1">
                                          <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-2">
                                                 R:{debugInfo.res} T:{debugInfo.tot} ({debugInfo.club})
                                                 {debugInfo.error && <span className="text-red-400 font-bold border-l border-white/10 pl-2">{debugInfo.error}</span>}
                                          </span>
                                   </div>
                                   <div className="flex flex-col items-center min-w-[140px]">
                                          <div className="text-white font-bold text-lg lg:text-2xl capitalize tracking-tight">{format(selectedDate, "EEEE d", { locale: es })}</div>
                                          <div className="text-[10px] text-brand-blue uppercase font-bold tracking-[0.2em] flex gap-2">
                                                 {format(selectedDate, "MMMM", { locale: es })}
                                                 <span className="text-white/30 text-[8px]">v2.6</span>
                                          </div>
                                   </div>
                                   <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="text-text-grey hover:text-white w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                   </button>
                            </div>
                            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
                                   <div className="hidden lg:flex items-center gap-4 px-4 border-r border-white/5 mr-2">
                                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" /><span className="text-[10px] text-text-grey font-bold uppercase">Pagado</span></div>
                                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-brand-blue rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" /><span className="text-[10px] text-text-grey font-bold uppercase">Confirmado</span></div>
                                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" /><span className="text-[10px] text-text-grey font-bold uppercase">Seña</span></div>
                                   </div>
                                   <button onClick={() => setIsNewModalOpen(true)} className="bg-brand-green text-bg-dark font-bold text-xs uppercase px-4 py-2 rounded-lg hover:bg-brand-green-variant shadow-lg shadow-brand-green/20">+ Reserva</button>
                            </div>
                     </div>
                     <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0B0D10]">
                            {isLoading && <div className="absolute inset-0 flex items-center justify-center z-50 bg-bg-dark/50 backdrop-blur-sm"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" /></div>}
                            <div className="min-w-[600px] lg:min-w-0" style={{ display: 'grid', gridTemplateColumns: `80px repeat(${courts.length}, minmax(180px, 1fr))` }}>
                                   <div className="contents">
                                          <div className="sticky top-0 left-0 z-30 bg-bg-dark border-b border-r border-white/10 p-3 flex items-center justify-center shadow-lg h-[60px]">
                                                 <span className="text-[10px] font-bold uppercase text-white/40">Hora</span>
                                          </div>
                                          {courts.map((court: any, idx: number) => (
                                                 <div key={court.id} className={cn("sticky top-0 z-20 bg-bg-dark border-b border-r border-white/10 p-3 text-center shadow-lg flex flex-col justify-center h-[60px]", idx === courts.length - 1 && "border-r-0")}>
                                                        <span className="font-black text-brand-blue text-sm uppercase">{court.name}</span>
                                                        <span className="text-[9px] text-white/30">Padel</span>
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
                                                        <div className={cn("sticky left-0 z-10 p-3 border-r border-b border-white/10 text-center text-xs font-mono flex items-center justify-center bg-[#111418]", isCurrent ? "text-brand-blue font-bold sky-shadow" : "text-text-grey group-hover/time-row:text-white transition-colors")}>{label}</div>
                                                        {courts.map((court: any) => {
                                                               const booking = bookingsByCourtAndTime.get(`${court.id}-${label}`)
                                                               return (
                                                                      <div key={`${court.id}-${label}`} className={cn("p-1 border-r border-b border-white/10 relative min-h-[120px]", isCurrent && "bg-brand-blue/[0.02]")}>
                                                                             {booking ? (() => {
                                                                                    const itemsT = (booking.items as any[])?.reduce((s, i) => s + (i.unitPrice * i.quantity), 0) || 0
                                                                                    const total = booking.price + itemsT
                                                                                    const paid = (booking.transactions as any[])?.reduce((s, t) => s + t.amount, 0) || 0
                                                                                    const balance = total - paid
                                                                                    const isPaid = balance <= 0
                                                                                    let style = "bg-[#0c2b4d] border-brand-blue/30"; let lbl = "CONFIRMADO"; let badge = "bg-brand-blue text-white"
                                                                                    if (isPaid) { style = "bg-[#142e1b] border-brand-green/30"; lbl = "PAGADO"; badge = "bg-brand-green text-bg-dark" }
                                                                                    else if (booking.status === 'PENDING') { style = "bg-[#3a1e0e] border-orange-600/30"; lbl = "PENDIENTE"; badge = "bg-orange-500 text-white" }
                                                                                    return (
                                                                                           <div onClick={() => onBookingClick(booking)} className={cn("w-full h-full rounded-xl p-2.5 text-left border cursor-pointer hover:shadow-2xl transition-all flex flex-col group/card shadow-lg", style)}>
                                                                                                  <div className="flex justify-between items-start gap-1 mb-1.5">
                                                                                                         <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-md", badge)}>{lbl}</span>
                                                                                                         <div className="flex flex-col items-end">
                                                                                                                <span className="font-mono text-[11px] font-bold text-white leading-none">${total}</span>
                                                                                                                {balance > 0 && <span className="text-[8px] text-red-400 font-bold mt-0.5 whitespace-nowrap">Faltan ${balance}</span>}
                                                                                                         </div>
                                                                                                  </div>
                                                                                                  <div className="flex-1 min-h-0">
                                                                                                         <h4 className="font-bold text-white text-sm truncate capitalize leading-tight mb-0.5">{booking.client?.name || '---'}</h4>
                                                                                                         {booking.client?.phone && (
                                                                                                                <div className="flex items-center gap-1 mb-1">
                                                                                                                       <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                                                                                                       <span className="text-[10px] text-white/50 font-medium">{booking.client.phone}</span>
                                                                                                                </div>
                                                                                                         )}

                                                                                                         {booking.items && (booking.items as any[]).length > 0 && (
                                                                                                                <div className="mt-1 pt-1.5 border-t border-white/5">
                                                                                                                       <div className="flex flex-wrap gap-1">
                                                                                                                              {(booking.items as any[]).slice(0, 2).map((item: any, i: number) => (
                                                                                                                                     <span key={i} className="text-[8px] bg-white/5 text-white/60 px-1 py-0.5 rounded leading-none">
                                                                                                                                            {item.quantity}x {item.product?.name?.split(' ')[0]}
                                                                                                                                     </span>
                                                                                                                              ))}
                                                                                                                              {(booking.items as any[]).length > 2 && <span className="text-[8px] text-white/30">+{(booking.items as any[]).length - 2}</span>}
                                                                                                                       </div>
                                                                                                                </div>
                                                                                                         )}
                                                                                                  </div>
                                                                                                  <div className="mt-auto pt-1 flex justify-between items-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                                                         <span className="text-[8px] text-white/40 uppercase font-black">Ver Detalles</span>
                                                                                                         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><path d="m9 18 6-6-6-6" /></svg>
                                                                                                  </div>
                                                                                           </div>
                                                                                    )
                                                                             })() : (
                                                                                    <div onClick={() => { setNewModalData({ courtId: court.id, time: label }); setIsNewModalOpen(true); }} className="w-full h-full rounded-xl border border-dashed border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/[0.02] cursor-pointer transition-all">
                                                                                           <span className="text-brand-green font-bold text-xl">+</span>
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          )
                                   })}
                            </div>
                     </div>
                     <BookingModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={() => { fetchData(); setIsNewModalOpen(false); }} initialDate={selectedDate} initialTime={newModalData.time} initialCourtId={newModalData.courtId || 0} courts={courts} />
              </div>
       )
}
