'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, addDays, isSameDay, addMinutes, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getBookingsForDate, getCourts } from '@/actions/turnero'
import type { TurneroBooking } from '@/types/booking'
import { createPreference } from '@/actions/mercadopago'
import { getSettings } from '@/actions/settings'
import { createBooking } from '@/actions/createBooking'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
       Calendar,
       Clock,
       MapPin,
       Send,
       ArrowLeft,
       CheckCircle2,
       ChevronRight,
       Loader2,
       ShieldCheck,
       CreditCard,
       AlertCircle,
       ExternalLink,
       Wallet,
       Copy,
       Check,
       Search,
       Trophy,
       Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function PublicBookingPage() {
       const [step, setStep] = useState(1) // 1: Date/Time, 2: Info/Confirm, 3: Success
       const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, courtId: number, courtName?: string, price?: number } | null>(null)

       const [bookings, setBookings] = useState<TurneroBooking[]>([])
       const [courts, setCourts] = useState<{ id: number, name: string }[]>([])
       const [clubSettings, setClubSettings] = useState<any>(null)
       const [loading, setLoading] = useState(true)

       const [clientData, setClientData] = useState({ name: '', phone: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [bookingId, setBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)
       const [copied, setCopied] = useState(false)

       // Generate Days (Today + 13 days for better selection)
       const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)), [])

       const loadData = async () => {
              setLoading(true)
              try {
                     const [bRes, c, settings] = await Promise.all([
                            getBookingsForDate(selectedDate.toISOString()),
                            getCourts(),
                            getSettings()
                     ])
                     setBookings(bRes.bookings)
                     setCourts(c)
                     setClubSettings(settings)
              } catch (e) {
                     console.error(e)
              }
              finally {
                     setLoading(false)
              }
       }

       useEffect(() => {
              loadData()
       }, [selectedDate])

       const isSlotTaken = (time: string, courtId: number) => {
              return bookings.some(b => {
                     const bTime = format(new Date(b.startTime), 'HH:mm')
                     return b.courtId === courtId && bTime === time && b.status !== 'CANCELED' && b.status !== 'REJECTED'
              })
       }

       const timeSlots = useMemo(() => {
              const slots = []
              let current = new Date()
              current.setHours(7, 0, 0, 0) // Start earlier
              const end = new Date()
              end.setHours(23, 30, 0, 0)

              while (current <= end) {
                     slots.push(format(current, 'HH:mm'))
                     current = addMinutes(current, 90) // Assuming 90m slots, could be dynamic
              }
              return slots
       }, [])

       const handleConfirm = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedSlot) return
              setIsSubmitting(true)

              const [hours, minutes] = selectedSlot.time.split(':').map(Number)
              const startDate = new Date(selectedDate)
              startDate.setHours(hours, minutes, 0, 0)

              const res = await createBooking({
                     clientName: clientData.name,
                     clientPhone: clientData.phone,
                     courtId: selectedSlot.courtId,
                     startTime: startDate,
                     paymentStatus: 'UNPAID',
                     status: 'PENDING'
              })

              if (res.success && res.booking) {
                     setBookingId(res.booking.id)
                     confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
                     setStep(3)
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       const handlePayment = async () => {
              if (!bookingId) return
              setIsPaying(true)
              const res = await createPreference(bookingId)
              setIsPaying(false)
              if (res.success && res.init_point) {
                     window.location.href = res.init_point
              } else {
                     alert("Error al generar pago: " + (res.error || 'Desconocido'))
              }
       }

       const PageWrapper = ({ children }: { children: React.ReactNode }) => (
              <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0A0B0E] text-[#1E293B] dark:text-[#F1F5F9] font-sans transition-colors duration-300 flex flex-col items-center">
                     <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 opacity-60 dark:opacity-30" />
                     <header className="w-full max-w-md sticky top-0 z-50 bg-white/90 dark:bg-[#101216]/95 backdrop-blur-xl border-b border-gray-300 dark:border-white/5 px-6 py-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                   {step > 1 && (
                                          <button onClick={() => setStep(step - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 transition-all">
                                                 <ArrowLeft size={20} />
                                          </button>
                                   )}
                                   <div className="flex flex-col">
                                          <span className="font-black text-xs uppercase tracking-[0.2em] text-primary">{clubSettings?.name || 'COURTOPS'}</span>
                                          <span className="text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-widest leading-none mt-0.5">Reservas</span>
                                   </div>
                            </div>
                            <ThemeToggle />
                     </header>
                     <main className="w-full max-w-md flex-1 p-6 relative z-10">
                            {children}
                     </main>
              </div>
       )

       if (step === 3) {
              const courtName = courts.find(c => c.id === selectedSlot?.courtId)?.name
              const dateStr = format(selectedDate, 'EEEE d MMMM', { locale: es })
              const timeStr = selectedSlot?.time
              const depositAmount = clubSettings?.bookingDeposit || 0
              const showMercadoPago = clubSettings?.mpAccessToken && bookingId

              return (
                     <PageWrapper>
                            <div className="flex flex-col items-center flex-1 animate-in zoom-in-95 duration-700 pt-8">
                                   <div className="relative mb-12">
                                          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150"></div>
                                          <div className="relative w-40 h-40 rounded-[3.5rem] bg-white dark:bg-[#161B22] border-4 border-primary/10 flex items-center justify-center text-primary shadow-2xl">
                                                 <Clock size={90} strokeWidth={2} />
                                          </div>
                                          <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-primary rounded-2xl border-4 border-[#F0F2F5] dark:border-[#0A0B0E] flex items-center justify-center text-white shadow-xl">
                                                 <Trophy size={28} />
                                          </div>
                                   </div>

                                   <div className="px-5 py-1.5 rounded-full border-2 border-orange-500/30 bg-orange-500/10 text-orange-700 text-[10px] font-black uppercase tracking-widest mb-4">
                                          Reserva en Espera
                                   </div>

                                   <h2 className="text-4xl font-black tracking-tighter text-center mb-4 uppercase text-[#0F172A] dark:text-white">Último Paso</h2>

                                   <p className="text-[#334155] dark:text-[#94A3B8] text-sm font-bold text-center max-w-[320px] mb-10 leading-relaxed">
                                          Tu turno NO está asegurado aún. Para confirmarlo, debés abonar la seña y enviar el comprobante.
                                   </p>

                                   <div className="w-full space-y-4 mb-12">
                                          <div className="bg-white dark:bg-[#161B22] border-2 border-gray-200 dark:border-white/10 rounded-[2.5rem] p-7 shadow-xl flex items-center justify-between text-left relative overflow-hidden group">
                                                 <div className="absolute top-0 left-0 w-2 h-full bg-primary/40 group-hover:bg-primary transition-all"></div>
                                                 <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-primary shadow-inner">
                                                               <Calendar size={24} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] font-black uppercase text-[#94A3B8] tracking-widest mb-1">{dateStr}</p>
                                                               <p className="font-black text-2xl uppercase tracking-tighter leading-none text-[#1E293B] dark:text-white">{timeStr}HS — <span className="text-primary">{courtName}</span></p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="w-full space-y-8 pt-10 border-t-2 border-gray-300 dark:border-white/10 relative">
                                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F0F2F5] dark:bg-[#0A0B0E] px-4 py-1 flex items-center gap-2 border-2 border-orange-500 rounded-full shadow-lg">
                                                 <AlertCircle size={16} className="text-orange-500 animate-bounce" />
                                                 <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Pagar para Reservar</span>
                                          </div>

                                          {showMercadoPago && (
                                                 <button
                                                        onClick={handlePayment}
                                                        disabled={isPaying}
                                                        className="w-full h-18 bg-[#009EE3] text-white rounded-[1.8rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-[#009EE3]/30 flex items-center justify-center gap-4 active:scale-[0.97] transition-all hover:brightness-105"
                                                 >
                                                        {isPaying ? <Loader2 className="animate-spin" /> : <>Mercado Pago <ExternalLink size={20} /></>}
                                                 </button>
                                          )}

                                          <div className="p-8 bg-white dark:bg-[#161B22] border-2 border-primary/20 rounded-[2.8rem] shadow-xl text-left relative overflow-hidden">
                                                 <div className="absolute top-0 right-0 p-4 text-primary/10 transition-colors pointer-events-none">
                                                        <Wallet size={100} />
                                                 </div>
                                                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Transferencia Bancaria</p>

                                                 <div className="space-y-5 relative z-10">
                                                        <div className="p-5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                                                               <div>
                                                                      <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Alias / CVU</p>
                                                                      <div className="flex items-center justify-between gap-3">
                                                                             <p className="text-xl font-black text-[#1E293B] dark:text-white tracking-tight break-all uppercase">{clubSettings?.mpAlias || 'CONSULTAR'}</p>
                                                                             <button
                                                                                    onClick={() => {
                                                                                           navigator.clipboard.writeText(clubSettings?.mpAlias || '')
                                                                                           setCopied(true)
                                                                                           setTimeout(() => setCopied(false), 2000)
                                                                                    }}
                                                                                    className="shrink-0 w-10 h-10 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 active:scale-90 transition-all text-primary shadow-sm"
                                                                             >
                                                                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                               {clubSettings?.mpCvu && (
                                                                      <div>
                                                                             <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">CBU/CVU Alternativo</p>
                                                                             <p className="text-xs text-[#475569] dark:text-gray-400 font-bold select-all">{clubSettings?.mpCvu}</p>
                                                                      </div>
                                                               )}
                                                        </div>

                                                        <a
                                                               href={`https://wa.me/${clubSettings?.phone || '5493524421497'}?text=${encodeURIComponent(`Hola! Ya transferí la seña para el turno de las ${timeStr}hs el ${format(selectedDate, 'd/M')}. Aquí mi comprobante.`)}`}
                                                               target="_blank"
                                                               rel="noreferrer"
                                                               className="w-full h-16 bg-[#25D366] text-white rounded-[1.4rem] font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
                                                        >
                                                               <Phone size={20} /> ENVIAR COMPROBANTE
                                                        </a>
                                                 </div>
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => { setStep(1); setBookingId(null); setSelectedSlot(null); }}
                                          className="mt-12 mb-8 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.8em] hover:text-primary transition-all duration-700"
                                   >
                                          Volver
                                   </button>
                            </div>
                     </PageWrapper>
              )
       }

       return (
              <PageWrapper>
                     {step === 1 && (
                            <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                   <section>
                                          <div className="flex items-center gap-2 mb-4 px-1 text-[#475569] dark:text-[#94A3B8]">
                                                 <Calendar size={15} />
                                                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Elige una fecha</h2>
                                          </div>
                                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 snap-x -mx-6 px-6">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        return (
                                                               <button
                                                                      key={d.toISOString()}
                                                                      onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                                                                      className={cn(
                                                                             "flex-shrink-0 w-[74px] h-[96px] flex flex-col items-center justify-center rounded-[1.8rem] transition-all duration-300 snap-center border-2",
                                                                             active
                                                                                    ? "bg-primary border-primary text-white shadow-2xl shadow-primary/30 scale-105 z-10"
                                                                                    : "bg-white dark:bg-[#161B22] border-gray-300 dark:border-white/10 text-[#64748B] dark:text-[#94A3B8] shadow-md"
                                                                      )}
                                                               >
                                                                      <span className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5", active ? "opacity-90" : "opacity-60")}>
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className="text-2xl font-black tracking-tighter">
                                                                             {format(d, 'd')}
                                                                      </span>
                                                               </button>
                                                        )
                                                 })}
                                          </div>
                                   </section>

                                   <section className="space-y-6">
                                          <div className="flex items-center gap-2 mb-2 px-1 text-[#475569] dark:text-[#94A3B8]">
                                                 <Clock size={15} />
                                                 <h2 className="text-[11px] font-black uppercase tracking-[0.2em]">Canchas Disponibles</h2>
                                          </div>

                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-24 gap-4">
                                                        <Loader2 className="animate-spin text-primary" size={40} />
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calculando disponibilidad...</p>
                                                 </div>
                                          ) : courts.length === 0 ? (
                                                 <div className="text-center py-16 bg-white/60 dark:bg-[#161B22]/30 rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center gap-4">
                                                        <div className="w-14 h-14 rounded-full bg-gray-200/50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-700 shadow-sm"><Search size={28} /></div>
                                                        <p className="text-xs font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em]">No hay canchas configuradas</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-8">
                                                        {courts.map(court => (
                                                               <div key={court.id} className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-7 shadow-xl overflow-hidden relative group">
                                                                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                                                      <div className="flex items-center gap-2 mb-6 relative z-10 border-l-4 border-primary pl-3">
                                                                             <h3 className="text-xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter leading-none">{court.name}</h3>
                                                                      </div>
                                                                      <div className="grid grid-cols-3 gap-3 relative z-10">
                                                                             {timeSlots.map(time => {
                                                                                    const taken = isSlotTaken(time, court.id)
                                                                                    const isSelected = selectedSlot?.time === time && selectedSlot?.courtId === court.id
                                                                                    return (
                                                                                           <button
                                                                                                  key={time}
                                                                                                  disabled={taken}
                                                                                                  onClick={() => setSelectedSlot({ time, courtId: court.id, courtName: court.name })}
                                                                                                  className={cn(
                                                                                                         "h-14 rounded-2xl text-[11px] font-black border transition-all relative overflow-hidden active:scale-95",
                                                                                                         taken
                                                                                                                ? "bg-gray-100 dark:bg-black/20 border-transparent text-gray-400 dark:text-gray-700 opacity-50 cursor-not-allowed italic"
                                                                                                                : isSelected
                                                                                                                       ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105 z-10"
                                                                                                                       : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-[#475569] dark:text-white hover:border-primary/50 shadow-sm"
                                                                                                  )}
                                                                                           >
                                                                                                  {time}
                                                                                           </button>
                                                                                    )
                                                                             })}
                                                                      </div>
                                                               </div>
                                                        ))}
                                                 </div>
                                          )}
                                   </section>

                                   <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F0F2F5] dark:from-[#0A0B0E] via-[#F0F2F5]/90 dark:via-[#0A0B0E]/90 to-transparent pointer-events-none max-w-md mx-auto z-50 flex justify-center">
                                          <button
                                                 onClick={() => setStep(2)}
                                                 disabled={!selectedSlot}
                                                 className="w-full h-18 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 disabled:opacity-0 disabled:translate-y-12 transition-all pointer-events-auto active:scale-[0.96] flex items-center justify-center gap-3"
                                          >
                                                 Confirmar Turno <ChevronRight size={22} />
                                          </button>
                                   </div>
                            </div>
                     )}

                     {step === 2 && (
                            <form onSubmit={handleConfirm} className="space-y-8 animate-in slide-in-from-right duration-500 pb-32">
                                   <div className="bg-white dark:bg-[#161B22] rounded-[2.8rem] p-9 border-2 border-primary/10 shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                          <h2 className="text-3xl font-black tracking-tighter mb-1 uppercase text-[#0F172A] dark:text-white leading-none">Resumen</h2>
                                          <p className="text-[#64748B] dark:text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.3em] mb-10 border-b border-gray-100 dark:border-white/10 pb-4">Verifica tu reserva</p>

                                          <div className="space-y-6 text-left">
                                                 <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-sm">
                                                               <Calendar size={24} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[9px] text-[#94A3B8] uppercase font-black tracking-widest mb-0.5">Fecha</p>
                                                               <p className="font-black text-lg capitalize text-[#1E293B] dark:text-white">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 p-5 rounded-[2rem] border border-primary/20">
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-inner">
                                                                      <Clock size={28} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest mb-0.5">Hora</p>
                                                                      <p className="font-black text-2xl tracking-tighter text-[#1E293B] dark:text-white uppercase">{selectedSlot?.time}HS</p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest mb-0.5">Cancha</p>
                                                               <p className="font-black text-lg text-primary uppercase tracking-tighter">{selectedSlot?.courtName}</p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="space-y-6">
                                          <div className="p-7 bg-[#FFF2E2] dark:bg-[#1C1610] border-2 border-[#FFD8A8] dark:border-[#3D2B1F] rounded-[2.8rem] flex gap-5 text-left shadow-lg">
                                                 <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
                                                        <CreditCard size={28} />
                                                 </div>
                                                 <div>
                                                        <p className="text-base font-black uppercase tracking-tight text-orange-900 dark:text-orange-300">Reserva con Seña</p>
                                                        <p className="text-xs text-orange-900/80 dark:text-orange-200/50 font-bold mt-1 leading-relaxed">
                                                               Se requerirá el pago de una seña de <b>${clubSettings?.bookingDeposit || 0}</b> para bloquear el turno.
                                                        </p>
                                                 </div>
                                          </div>

                                          <div className="space-y-4">
                                                 <input
                                                        required
                                                        placeholder="TU NOMBRE COMPLETO"
                                                        className="w-full h-18 rounded-[1.8rem] bg-white dark:bg-[#161B22] border-2 border-gray-300 dark:border-white/10 px-6 font-bold outline-none focus:border-primary transition-all text-sm shadow-md"
                                                        value={clientData.name}
                                                        onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                 />
                                                 <input
                                                        required
                                                        type="tel"
                                                        placeholder="TELÉFONO (WHATSAPP)"
                                                        className="w-full h-18 rounded-[1.8rem] bg-white dark:bg-[#161B22] border-2 border-gray-300 dark:border-white/10 px-6 font-bold outline-none focus:border-primary transition-all text-sm shadow-md"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                 />
                                          </div>
                                   </div>

                                   <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F0F2F5] dark:from-[#0A0B0E] via-[#F0F2F5]/90 dark:via-[#0A0B0E]/90 to-transparent pointer-events-none max-w-md mx-auto z-50">
                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 disabled:opacity-50 transition-all pointer-events-auto active:scale-[0.96] flex items-center justify-center gap-3"
                                          >
                                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmar Turno <ArrowRight size={24} /></>}
                                          </button>
                                   </div>
                            </form>
                     )}
              </PageWrapper>
       )
}
