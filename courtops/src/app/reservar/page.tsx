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
import { Calendar, Clock, MapPin, Send, ArrowLeft, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'

export default function PublicBookingPage() {
       const [step, setStep] = useState(1) // 1: Date/Time, 2: Info/Confirm, 3: Success
       const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, courtId: number } | null>(null)

       const [bookings, setBookings] = useState<TurneroBooking[]>([])
       const [courts, setCourts] = useState<{ id: number, name: string }[]>([])
       const [clubSettings, setClubSettings] = useState<any>(null)
       const [loading, setLoading] = useState(true)

       const [clientData, setClientData] = useState({ name: '', phone: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [bookingId, setBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)

       // Generate Days (Today + 6 days)
       const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i)), [])

       // Fetch Data
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

       // Helper: Check availability
       const isSlotTaken = (time: string, courtId: number) => {
              return bookings.some(b => {
                     const bTime = format(new Date(b.startTime), 'HH:mm')
                     return b.courtId === courtId && bTime === time && b.status !== 'CANCELED' && b.status !== 'REJECTED'
              })
       }

       // Generate Slots
       const timeSlots = useMemo(() => {
              const slots = []
              let current = new Date()
              current.setHours(14, 0, 0, 0)
              const end = new Date()
              end.setHours(23, 0, 0, 0)

              while (current <= end) {
                     slots.push(format(current, 'HH:mm'))
                     current = addMinutes(current, 90)
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
                     await loadData()
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

       if (step === 3) {
              const courtName = courts.find(c => c.id === selectedSlot?.courtId)?.name
              const dateStr = format(selectedDate, 'd/M')
              const timeStr = selectedSlot?.time
              const whatsappText = `Hola! Reservé para el ${dateStr} a las ${timeStr}hs (${courtName}).`

              const depositAmount = clubSettings?.bookingDeposit || 0
              const showMercadoPago = clubSettings?.mpAccessToken && bookingId

              return (
                     <div className="min-h-screen bg-background text-foreground flex flex-col p-6 items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-primary/10 border border-primary/20">
                                   <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">¡Casi listo!</h2>
                            <p className="text-muted-foreground mb-8 max-w-xs text-sm font-medium leading-relaxed">
                                   {depositAmount > 0
                                          ? `Tu reserva está pendiente del pago de la seña de $${depositAmount}.`
                                          : 'Tu reserva está pendiente de pago. Confirma el comprobante para asegurar tu cancha.'}
                            </p>

                            <div className="w-full max-w-sm space-y-4 mb-8">
                                   {showMercadoPago && (
                                          <button
                                                 onClick={handlePayment}
                                                 disabled={isPaying}
                                                 className="w-full py-4 rounded-2xl bg-[#009EE3] text-white font-black text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 disabled:opacity-50"
                                          >
                                                 {isPaying ? <Loader2 className="animate-spin" /> : 'Pagar con Mercado Pago'}
                                          </button>
                                   )}

                                   <div className="bg-card p-6 rounded-3xl border border-border w-full relative overflow-hidden text-left shadow-sm">
                                          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3">Transferencia Manual</p>
                                          <div className="space-y-1">
                                                 <p className="text-lg font-black text-foreground tracking-tight">{clubSettings?.mpAlias || 'CONSULTAR'}</p>
                                                 <p className="text-xs text-muted-foreground font-medium">CVU: {clubSettings?.mpCvu || '-'}</p>
                                          </div>
                                   </div>

                                   <div className="bg-muted/50 p-4 rounded-2xl w-full border border-border/50 flex items-center justify-between text-left">
                                          <div>
                                                 <p className="text-sm font-black uppercase text-foreground">{format(selectedDate, 'EEEE d', { locale: es })}</p>
                                                 <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{courtName} — {timeStr}hs</p>
                                          </div>
                                          <Clock size={20} className="text-muted-foreground/30" />
                                   </div>
                            </div>

                            <a
                                   href={`https://wa.me/${clubSettings?.phone || '5493524421497'}?text=${encodeURIComponent(whatsappText + ' Envío comprobante.')}`}
                                   target="_blank"
                                   rel="noreferrer"
                                   className="w-full max-w-sm py-4 rounded-2xl bg-[#25D366] text-white font-black text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 mb-4"
                            >
                                   <Send size={18} />
                                   <span>Enviar Comprobante</span>
                            </a>

                            <button
                                   onClick={() => { setStep(1); setSelectedSlot(null); setBookingId(null); }}
                                   className="text-muted-foreground text-xs font-bold hover:text-foreground transition-colors uppercase tracking-widest"
                            >
                                   Volver al inicio
                            </button>
                     </div>
              )
       }

       return (
              <div className="min-h-screen bg-background text-foreground font-sans max-w-md mx-auto relative flex flex-col">
                     {/* Ambient Background */}
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none opacity-50 dark:opacity-100"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none opacity-50 dark:opacity-100"></div>

                     <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-black text-xs shadow-lg shadow-primary/20">CO</div>
                                   <h1 className="font-black text-lg tracking-tight uppercase">CourtOps <span className="text-primary font-light">Reservas</span></h1>
                            </div>
                            <ThemeToggle />
                     </header>

                     {step === 1 && (
                            <div className="p-6 space-y-8 animate-in slide-in-from-right duration-500 pb-32">
                                   {/* Date Selector */}
                                   <div className="space-y-4">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <Calendar size={14} className="text-primary" />
                                                 <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Elige una fecha</h2>
                                          </div>
                                          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                                                 {days.map(d => (
                                                        <button
                                                               key={d.toISOString()}
                                                               onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                                                               className={cn(
                                                                      "flex flex-col items-center justify-center min-w-[72px] h-[82px] rounded-2xl border transition-all duration-300",
                                                                      isSameDay(d, selectedDate)
                                                                             ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                                                                             : "bg-card border-border text-muted-foreground hover:border-primary/50"
                                                               )}
                                                        >
                                                               <span className="text-[10px] uppercase font-black opacity-70 mb-1">{format(d, 'EEE', { locale: es })}</span>
                                                               <span className="text-xl font-black">{format(d, 'd')}</span>
                                                        </button>
                                                 ))}
                                          </div>
                                   </div>

                                   {/* Slots Grid */}
                                   <div className="space-y-6">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <Clock size={14} className="text-primary" />
                                                 <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Horarios Disponibles</h2>
                                          </div>

                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                        <Loader2 className="animate-spin text-primary" size={32} />
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cargando disponibilidad...</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-8">
                                                        {courts.length === 0 ? (
                                                               <div className="text-center py-10 text-muted-foreground text-sm italic">No hay canchas disponibles</div>
                                                        ) : courts.map(court => (
                                                               <div key={court.id} className="space-y-4">
                                                                      <div className="flex items-center gap-2 pl-1 border-l-2 border-primary">
                                                                             <h3 className="text-foreground font-black text-xs uppercase tracking-widest">{court.name}</h3>
                                                                      </div>
                                                                      <div className="grid grid-cols-3 gap-3">
                                                                             {timeSlots.map(time => {
                                                                                    const taken = isSlotTaken(time, court.id)
                                                                                    const isSelected = selectedSlot?.time === time && selectedSlot?.courtId === court.id
                                                                                    return (
                                                                                           <button
                                                                                                  key={time}
                                                                                                  disabled={taken}
                                                                                                  onClick={() => setSelectedSlot({ time, courtId: court.id })}
                                                                                                  className={cn(
                                                                                                         "py-3.5 rounded-xl text-sm font-black border transition-all relative overflow-hidden",
                                                                                                         taken
                                                                                                                ? "bg-muted/50 border-border/50 text-muted-foreground/30 line-through cursor-not-allowed"
                                                                                                                : isSelected
                                                                                                                       ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10"
                                                                                                                       : "bg-card border-border text-foreground hover:border-primary/50"
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
                                   </div>

                                   {/* Fixed Bottom Action */}
                                   <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent pointer-events-none max-w-md mx-auto">
                                          <button
                                                 onClick={() => setStep(2)}
                                                 disabled={!selectedSlot}
                                                 className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 disabled:opacity-0 disabled:translate-y-10 transition-all pointer-events-auto active:scale-95"
                                          >
                                                 Continuar <ChevronRight size={18} className="inline ml-1" />
                                          </button>
                                   </div>
                            </div>
                     )}

                     {step === 2 && (
                            <form onSubmit={handleConfirm} className="p-6 space-y-6 animate-in slide-in-from-right duration-500 pb-32">
                                   <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors mb-4">
                                          <ArrowLeft size={14} /> Volver
                                   </button>

                                   <div className="bg-card p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12"></div>

                                          <h2 className="text-2xl font-black mb-1 tracking-tight uppercase">Confirmación</h2>
                                          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-8">Verifica los datos de tu turno</p>

                                          <div className="space-y-6">
                                                 <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                               <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Fecha</p>
                                                               <p className="font-black text-foreground capitalize">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                               <Clock size={20} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Hora Seleccionada</p>
                                                               <p className="font-black text-2xl text-foreground">{selectedSlot?.time} HS</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                               <MapPin size={20} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cancha</p>
                                                               <p className="font-black text-foreground uppercase tracking-tight">{courts.find(c => c.id === selectedSlot?.courtId)?.name}</p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="space-y-4">
                                          <div className="flex items-center gap-2 mb-2">
                                                 <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Tus Datos Personales</h3>
                                          </div>
                                          <div className="space-y-3">
                                                 <input
                                                        required
                                                        type="text"
                                                        placeholder="NOMBRE COMPLETO"
                                                        className="w-full bg-card border border-border rounded-2xl p-4 text-foreground font-bold placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                                        value={clientData.name}
                                                        onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                 />
                                                 <input
                                                        required
                                                        type="tel"
                                                        placeholder="CELULAR (SIN 0 NI 15)"
                                                        className="w-full bg-card border border-border rounded-2xl p-4 text-foreground font-bold placeholder:text-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                 />
                                          </div>
                                   </div>

                                   <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent pointer-events-none max-w-md mx-auto">
                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all pointer-events-auto active:scale-95 flex items-center justify-center gap-2"
                                          >
                                                 {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
                                          </button>
                                   </div>
                            </form>
                     )}
              </div>
       )
}
