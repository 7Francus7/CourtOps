'use client'
import { PhoneInput } from '@/components/ui/PhoneInput'

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
       ArrowLeft,
       ArrowRight,
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
       Phone,
       Zap,
       User,
       Smartphone
} from 'lucide-react'

export default function PublicBookingPage() {
       const [step, setStep] = useState(1)
       const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, courtId: number, courtName?: string, price?: number } | null>(null)

       const [bookings, setBookings] = useState<TurneroBooking[]>([])
       const [courts, setCourts] = useState<{ id: number, name: string }[]>([])
       const [clubSettings, setClubSettings] = useState<{
              openTime?: string
              closeTime?: string
              slotDuration?: number
              name?: string
              mpAccessToken?: string
              mpAlias?: string
              mpCvu?: string
              phone?: string
              bookingDeposit?: number
              [key: string]: unknown
       } | null>(null)
       const [loading, setLoading] = useState(true)

       const [clientData, setClientData] = useState({ name: '', phone: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [bookingId, setBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)
       const [copied, setCopied] = useState(false)

       const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i)), [])

       const loadData = async () => {
              setLoading(true)
              try {
                     const [bRes, courtsArr, settingsRes] = await Promise.all([
                            getBookingsForDate(selectedDate.toISOString()),
                            getCourts(),
                            getSettings()
                     ])

                     if (bRes.success) {
                            setBookings(bRes.bookings)
                     }
                     setCourts(courtsArr)
                     if (settingsRes.success) {
                            setClubSettings(settingsRes.data as typeof clubSettings)
                     }
              } catch (e) {
                     console.error(e)
              }
              finally {
                     setLoading(false)
              }
       }

       useEffect(() => {
              loadData()
       // eslint-disable-next-line react-hooks/exhaustive-deps
       }, [selectedDate])

       const isSlotTaken = (time: string, courtId: number) => {
              return bookings.some(b => {
                     const bTime = format(new Date(b.startTime), 'HH:mm')
                     return b.courtId === courtId && bTime === time && b.status !== 'CANCELED' && b.status !== 'REJECTED'
              })
       }

       // Dynamic time slots from club settings
       const timeSlots = useMemo(() => {
              const slots: string[] = []
              const openTime = clubSettings?.openTime || '08:00'
              const closeTime = clubSettings?.closeTime || '23:00'
              const slotDuration = clubSettings?.slotDuration || 90

              const [openH, openM] = openTime.split(':').map(Number)
              const [closeH, closeM] = closeTime.split(':').map(Number)

              let current = new Date()
              current.setHours(openH, openM, 0, 0)

              const end = new Date()
              end.setHours(closeH, closeM, 0, 0)
              if (end <= current) end.setDate(end.getDate() + 1)

              while (current < end) {
                     slots.push(format(current, 'HH:mm'))
                     current = addMinutes(current, slotDuration)
              }
              return slots
       }, [clubSettings])

       // Check if a past time on today
       const isTimePast = (time: string) => {
              if (!isSameDay(selectedDate, new Date())) return false
              const [h, m] = time.split(':').map(Number)
              const now = new Date()
              const slotTime = new Date()
              slotTime.setHours(h, m, 0, 0)
              return slotTime < now
       }

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

              if (res.success && 'booking' in res) {
                     setBookingId(res.booking.id)
                     import('canvas-confetti').then(mod => mod.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } }))
                     setStep(3)
              } else {
                     alert("Error: " + ('error' in res ? res.error : 'Desconocido'))
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

       const clubName = clubSettings?.name || 'COURTOPS'

       // ─── STEP INDICATOR ────────────────────────────────
       const StepIndicator = () => (
              <div className="flex items-center justify-center gap-2 py-5">
                     {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center gap-2">
                                   <div className={cn(
                                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500",
                                          s < step ? "bg-primary text-primary-foreground scale-90"
                                                 : s === step ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                                        : "bg-muted text-muted-foreground"
                                   )}>
                                          {s < step ? <Check size={14} strokeWidth={3} /> : s}
                                   </div>
                                   {s < 3 && <div className={cn("w-8 h-0.5 rounded-full transition-all duration-500", s < step ? "bg-primary" : "bg-muted")} />}
                            </div>
                     ))}
              </div>
       )

       // ─── PAGE WRAPPER ──────────────────────────────────
       const PageWrapper = ({ children }: { children: React.ReactNode }) => (
              <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col items-center">
                     {/* Ambient glow */}
                     <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none -z-10 opacity-60 dark:opacity-20" />

                     {/* Header */}
                     <header className="w-full max-w-md sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border px-5 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                   {step > 1 && step < 3 && (
                                          <button onClick={() => setStep(step - 1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95">
                                                 <ArrowLeft size={18} />
                                          </button>
                                   )}
                                   <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                                                 <Zap size={16} className="fill-current" />
                                          </div>
                                          <div className="flex flex-col">
                                                 <span className="font-black text-[11px] uppercase tracking-[0.15em] text-foreground leading-none">{clubName}</span>
                                                 <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Reservas Online</span>
                                          </div>
                                   </div>
                            </div>
                            <ThemeToggle />
                     </header>

                     <StepIndicator />

                     <main className="w-full max-w-md flex-1 px-5 pb-6 relative z-10">
                            {children}
                     </main>

                     {/* Footer */}
                     <footer className="w-full max-w-md px-5 py-4 text-center border-t border-border">
                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                   Powered by <span className="text-primary font-black">CourtOps</span>
                            </p>
                     </footer>
              </div>
       )

       // ─── STEP 3: SUCCESS ───────────────────────────────
       if (step === 3) {
              const courtName = courts.find(c => c.id === selectedSlot?.courtId)?.name
              const dateStr = format(selectedDate, 'EEEE d MMMM', { locale: es })
              const timeStr = selectedSlot?.time
              const showMercadoPago = clubSettings?.mpAccessToken && bookingId

              return (
                     <PageWrapper>
                            <div className="flex flex-col items-center flex-1 animate-in zoom-in-95 duration-700 pt-4">
                                   {/* Success Icon */}
                                   <div className="relative mb-8">
                                          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150"></div>
                                          <div className="relative w-28 h-28 rounded-[2.5rem] bg-card border-2 border-primary/20 flex items-center justify-center text-primary shadow-2xl">
                                                 <Clock size={60} strokeWidth={1.5} />
                                          </div>
                                          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-xl border-4 border-background flex items-center justify-center text-primary-foreground shadow-xl">
                                                 <Trophy size={20} />
                                          </div>
                                   </div>

                                   <div className="px-4 py-1 rounded-full border-2 border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                          Reserva en Espera
                                   </div>

                                   <h2 className="text-3xl font-black tracking-tighter text-center mb-2 text-foreground">¡Último Paso!</h2>

                                   <p className="text-muted-foreground text-sm font-medium text-center max-w-[300px] mb-8 leading-relaxed">
                                          Tu turno <b>no está asegurado aún</b>. Aboná la seña y enviá el comprobante para confirmarlo.
                                   </p>

                                   {/* Booking Summary Card */}
                                   <div className="w-full mb-8">
                                          <div className="bg-card border border-border rounded-2xl p-5 shadow-lg flex items-center gap-4 relative overflow-hidden">
                                                 <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
                                                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <Calendar size={22} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">{dateStr}</p>
                                                        <p className="font-black text-xl tracking-tighter leading-none text-foreground">{timeStr}HS — <span className="text-primary">{courtName}</span></p>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Payment Section */}
                                   <div className="w-full space-y-6 pt-6 border-t border-border relative">
                                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-3 py-0.5 flex items-center gap-1.5 border border-orange-500 rounded-full shadow-md">
                                                 <AlertCircle size={14} className="text-orange-500 animate-bounce" />
                                                 <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Pagar para Reservar</span>
                                          </div>

                                          {showMercadoPago && (
                                                 <button
                                                        onClick={handlePayment}
                                                        disabled={isPaying}
                                                        className="w-full h-14 bg-[#009EE3] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#009EE3]/20 flex items-center justify-center gap-3 active:scale-[0.97] transition-all hover:brightness-105"
                                                 >
                                                        {isPaying ? <Loader2 className="animate-spin" /> : <>Mercado Pago <ExternalLink size={18} /></>}
                                                 </button>
                                          )}

                                          {/* Bank Transfer Card */}
                                          <div className="p-6 bg-card border border-border rounded-2xl shadow-lg relative overflow-hidden">
                                                 <div className="absolute top-0 right-0 p-3 text-primary/5 pointer-events-none">
                                                        <Wallet size={80} />
                                                 </div>
                                                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Transferencia Bancaria</p>

                                                 <div className="space-y-4 relative z-10">
                                                        <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-2">
                                                               <div>
                                                                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Alias / CVU</p>
                                                                      <div className="flex items-center justify-between gap-3">
                                                                             <p className="text-lg font-black text-foreground tracking-tight break-all uppercase">{clubSettings?.mpAlias || 'CONSULTAR'}</p>
                                                                             <button
                                                                                    onClick={() => {
                                                                                           navigator.clipboard.writeText(clubSettings?.mpAlias || '')
                                                                                           setCopied(true)
                                                                                           setTimeout(() => setCopied(false), 2000)
                                                                                    }}
                                                                                    className="shrink-0 w-9 h-9 bg-background rounded-lg flex items-center justify-center border border-border active:scale-90 transition-all text-primary shadow-sm"
                                                                             >
                                                                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                                                             </button>
                                                                      </div>
                                                               </div>
                                                               {clubSettings?.mpCvu && (
                                                                      <div>
                                                                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">CBU/CVU Alternativo</p>
                                                                             <p className="text-xs text-muted-foreground font-bold select-all">{clubSettings?.mpCvu}</p>
                                                                      </div>
                                                               )}
                                                        </div>

                                                        <a
                                                               href={`https://wa.me/${clubSettings?.phone || '5493524421497'}?text=${encodeURIComponent(`Hola! Ya transferí la seña de $${clubSettings?.bookingDeposit || ''} para mi turno:\n\n📅 ${format(selectedDate, 'd/M')}\n⏰ ${timeStr}hs\n📍 ${courtName}\n\nAdjunto comprobante 👇`)}`}
                                                               target="_blank"
                                                               rel="noreferrer"
                                                               className="w-full h-14 bg-[#25D366] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
                                                        >
                                                               <Phone size={18} /> Enviar Comprobante
                                                        </a>
                                                 </div>
                                          </div>
                                   </div>

                                   <button
                                          onClick={() => { setStep(1); setBookingId(null); setSelectedSlot(null); setClientData({ name: '', phone: '' }); }}
                                          className="mt-10 mb-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] hover:text-primary transition-all"
                                   >
                                          Nueva Reserva
                                   </button>
                            </div>
                     </PageWrapper>
              )
       }

       // ─── STEP 1 & 2 ───────────────────────────────────
       return (
              <PageWrapper>
                     {step === 1 && (
                            <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                   {/* Date Selector */}
                                   <section>
                                          <div className="flex items-center gap-2 mb-3 px-1 text-muted-foreground">
                                                 <Calendar size={14} />
                                                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Elegí una fecha</h2>
                                          </div>
                                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 snap-x -mx-5 px-5">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        const isToday = isSameDay(d, new Date())
                                                        return (
                                                               <button
                                                                      key={d.toISOString()}
                                                                      onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                                                                      className={cn(
                                                                             "flex-shrink-0 w-[68px] h-[88px] flex flex-col items-center justify-center rounded-2xl transition-all duration-300 snap-center border-2 relative",
                                                                             active
                                                                                    ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/25 scale-105 z-10"
                                                                                    : "bg-card border-border text-muted-foreground shadow-sm hover:border-primary/30"
                                                                      )}
                                                               >
                                                                      {isToday && !active && <div className="absolute top-1.5 w-1 h-1 rounded-full bg-primary"></div>}
                                                                      <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", active ? "opacity-90" : "opacity-60")}>
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className="text-2xl font-black tracking-tighter">
                                                                             {format(d, 'd')}
                                                                      </span>
                                                                      {isToday && <span className={cn("text-[7px] font-black uppercase tracking-widest mt-0.5", active ? "text-primary-foreground/70" : "text-primary")}>Hoy</span>}
                                                               </button>
                                                        )
                                                 })}
                                          </div>
                                   </section>

                                   {/* Court + Time Slots */}
                                   <section className="space-y-5">
                                          <div className="flex items-center gap-2 mb-1 px-1 text-muted-foreground">
                                                 <Clock size={14} />
                                                 <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Horarios Disponibles</h2>
                                          </div>

                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-3">
                                                        <Loader2 className="animate-spin text-primary" size={36} />
                                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cargando disponibilidad...</p>
                                                 </div>
                                          ) : courts.length === 0 ? (
                                                 <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Search size={24} /></div>
                                                        <p className="text-xs font-bold text-muted-foreground">No hay canchas configuradas</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-5">
                                                        {courts.map(court => {
                                                               const availableCount = timeSlots.filter(t => !isSlotTaken(t, court.id) && !isTimePast(t)).length
                                                               return (
                                                                      <div key={court.id} className="bg-card border border-border rounded-2xl p-5 shadow-lg overflow-hidden relative group">
                                                                             <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                                                             <div className="flex items-center justify-between mb-4 relative z-10">
                                                                                    <div className="flex items-center gap-2 border-l-[3px] border-primary pl-2.5">
                                                                                           <h3 className="text-base font-black text-foreground uppercase tracking-tight leading-none">{court.name}</h3>
                                                                                    </div>
                                                                                    <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                                                                           {availableCount} libres
                                                                                    </span>
                                                                             </div>
                                                                             <div className="grid grid-cols-3 gap-2 relative z-10">
                                                                                    {timeSlots.map(time => {
                                                                                           const taken = isSlotTaken(time, court.id)
                                                                                           const past = isTimePast(time)
                                                                                           const disabled = taken || past
                                                                                           const isSelected = selectedSlot?.time === time && selectedSlot?.courtId === court.id
                                                                                           return (
                                                                                                  <button
                                                                                                         key={time}
                                                                                                         disabled={disabled}
                                                                                                         onClick={() => setSelectedSlot({ time, courtId: court.id, courtName: court.name })}
                                                                                                         className={cn(
                                                                                                                "h-12 rounded-xl text-[11px] font-black border transition-all relative overflow-hidden active:scale-95",
                                                                                                                disabled
                                                                                                                       ? "bg-muted/50 border-transparent text-muted-foreground/40 cursor-not-allowed line-through"
                                                                                                                       : isSelected
                                                                                                                              ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10"
                                                                                                                              : "bg-card border-border text-foreground hover:border-primary/40 shadow-sm"
                                                                                                         )}
                                                                                                  >
                                                                                                         {time}
                                                                                                  </button>
                                                                                           )
                                                                                    })}
                                                                             </div>
                                                                      </div>
                                                               )
                                                        })}
                                                 </div>
                                          )}
                                   </section>

                                   {/* Sticky CTA */}
                                   <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none max-w-md mx-auto z-50 flex justify-center">
                                          <button
                                                 onClick={() => setStep(2)}
                                                 disabled={!selectedSlot}
                                                 className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-primary/30 disabled:opacity-0 disabled:translate-y-12 transition-all pointer-events-auto active:scale-[0.96] flex items-center justify-center gap-2"
                                          >
                                                 Continuar <ChevronRight size={20} />
                                          </button>
                                   </div>
                            </div>
                     )}

                     {step === 2 && (
                            <form onSubmit={handleConfirm} className="space-y-6 animate-in slide-in-from-right duration-500 pb-28">
                                   {/* Summary Card */}
                                   <div className="bg-card rounded-2xl p-6 border border-border shadow-lg relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                          <h2 className="text-2xl font-black tracking-tighter mb-0.5 text-foreground">Resumen</h2>
                                          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border-b border-border pb-3">Verificá tu reserva</p>

                                          <div className="space-y-4 text-left">
                                                 <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                               <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Fecha</p>
                                                               <p className="font-black text-base capitalize text-foreground">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center justify-between bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/20">
                                                        <div className="flex items-center gap-3">
                                                               <div className="w-11 h-11 rounded-xl bg-card flex items-center justify-center text-primary border border-primary/20 shrink-0 shadow-inner">
                                                                      <Clock size={22} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest mb-0.5">Hora</p>
                                                                      <p className="font-black text-xl tracking-tighter text-foreground">{selectedSlot?.time}HS</p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest mb-0.5">Cancha</p>
                                                               <p className="font-black text-base text-primary uppercase tracking-tight">{selectedSlot?.courtName}</p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Deposit Notice */}
                                   {(clubSettings?.bookingDeposit ?? 0) > 0 && (
                                          <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-4 text-left">
                                                 <div className="w-11 h-11 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                                                        <CreditCard size={22} />
                                                 </div>
                                                 <div>
                                                        <p className="text-sm font-black text-orange-700 dark:text-orange-300">Reserva con Seña</p>
                                                        <p className="text-xs text-orange-700/70 dark:text-orange-200/60 font-medium mt-0.5 leading-relaxed">
                                                               Se pedirá una seña de <b>${clubSettings?.bookingDeposit}</b> para bloquear el turno.
                                                        </p>
                                                 </div>
                                          </div>
                                   )}

                                   {/* Client Form */}
                                   <div className="space-y-3">
                                          <div className="space-y-1.5">
                                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                        <User size={12} /> Nombre Completo
                                                 </label>
                                                 <input
                                                        required
                                                        autoComplete="name"
                                                        placeholder="Ej: Juan Pérez"
                                                        className="w-full h-14 rounded-xl bg-card border border-border px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm text-foreground placeholder-muted-foreground"
                                                        value={clientData.name}
                                                        onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                        autoFocus
                                                 />
                                          </div>
                                          <div className="space-y-1.5">
                                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                                        <Smartphone size={12} /> WhatsApp
                                                 </label>
                                                 <PhoneInput
                                                        required
                                                        placeholder="351 123 4567"
                                                        value={clientData.phone}
                                                        onChange={v => setClientData({ ...clientData, phone: v })}
                                                        className="w-full h-14 rounded-xl bg-card border border-border font-bold text-foreground transition-all"
                                                 />
                                          </div>
                                   </div>

                                   {/* Security Badge */}
                                   <div className="flex items-center justify-center gap-2 text-muted-foreground/60 py-2">
                                          <ShieldCheck size={14} />
                                          <span className="text-[9px] font-bold uppercase tracking-widest">Datos protegidos y cifrados</span>
                                   </div>

                                   {/* Sticky Submit */}
                                   <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none max-w-md mx-auto z-50">
                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting || !clientData.name || !clientData.phone}
                                                 className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-base uppercase tracking-[0.15em] shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all pointer-events-auto active:scale-[0.96] flex items-center justify-center gap-2"
                                          >
                                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmar Reserva <ArrowRight size={22} /></>}
                                          </button>
                                   </div>
                            </form>
                     )}
              </PageWrapper>
       )
}
