'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking } from '@/actions/public-booking'
import { createPreference } from '@/actions/mercadopago'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CalendarDays, MapPin, User, Settings, Star, Wallet, History, Zap, ChevronRight, ArrowRight, ArrowLeft, LogIn, CheckCircle2, Download, Home, Clock, Ticket, Trophy, Calendar } from 'lucide-react'

type Props = {
       club: {
              id: string
              name: string
              logoUrl?: string | null
              slug: string
              mpAlias?: string | null
              mpCvu?: string | null
              mpAccessToken?: string | null
              mpPublicKey?: string | null
              bookingDeposit?: number | null
              phone?: string | null
              themeColor?: string | null
              address?: string | null
       }
       initialDateStr: string
}

function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 197, 94';
}

type BookingMode = 'guest' | 'premium' | null

export default function PublicBookingWizard({ club, initialDateStr }: Props) {
       const today = useMemo(() => new Date(initialDateStr), [initialDateStr])
       const primaryColor = club.themeColor || '#22c55e'
       const primaryRgb = hexToRgb(primaryColor)

       // Payment Return Handler
       const searchParams = useSearchParams()
       useEffect(() => {
              const status = searchParams.get('status')
              const externalRef = searchParams.get('external_reference')

              if (status === 'approved' && externalRef) {
                     getPublicBooking(Number(externalRef)).then(booking => {
                            if (booking && booking.court) {
                                   setStep(3)
                                   setCreatedBookingId(booking.id)
                                   setMode(booking.guestName ? 'guest' : 'premium')
                                   const date = new Date(booking.startTime)
                                   setSelectedDate(date)
                                   setSelectedSlot({
                                          time: format(date, 'HH:mm'),
                                          price: Number(booking.price),
                                          courtId: booking.courtId,
                                          courtName: booking.court.name
                                   })
                                   confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
                            }
                     }).catch(console.error)
              }
       }, [searchParams])



       // Steps: 0=Landing, 'register'=Sign Up, 'login'=Login, 1=Date/Slot, 2=Confirm, 3=Success
       const [step, setStep] = useState<number | 'register' | 'login'>(0)
       const [mode, setMode] = useState<BookingMode>(null)

       const [selectedDate, setSelectedDate] = useState<Date>(today)
       const [slots, setSlots] = useState<any[]>([])
       const [loading, setLoading] = useState(true)
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, price: number, courtId: number, courtName: string } | null>(null)

       // Client Data State
       // For Premium: filled in 'register' step
       // For Guest: filled in Step 2
       const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)

       // Fetch Slots when Date changes (only if in Step 1)
       useEffect(() => {
              if (step !== 1) return
              const fetchSlots = async () => {
                     setLoading(true)
                     setSelectedSlot(null)
                     try {
                            const data = await getPublicAvailability(club.id, selectedDate)
                            setSlots(data)
                     } catch (error) {
                            console.error(error)
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id, step])

       const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

       const handleLogin = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              try {
                     const client = await getPublicClient(club.id, clientData.phone)
                     if (client) {
                            // Split name if possible or just use full name
                            const parts = client.name.split(' ')
                            const name = parts[0]
                            const lastname = parts.slice(1).join(' ') || ''

                            setClientData({
                                   name: name,
                                   lastname: lastname,
                                   phone: client.phone,
                                   email: client.email || ''
                            })
                            setMode('premium')
                            setStep(1) // Skip to booking
                     } else {
                            alert('No encontramos una cuenta con este número. Por favor regístrate.')
                            setStep('register') // Go to register
                     }
              } catch (error) {
                     console.error(error)
                     alert('Ocurrió un error al buscar tu cuenta.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleRegisterSubmit = (e: React.FormEvent) => {
              e.preventDefault()
              if (clientData.name && clientData.lastname && clientData.phone) {
                     setStep(1)
              }
       }

       const handleBooking = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedSlot) return
              setIsSubmitting(true)

              // Helper to combine name
              const fullName = mode === 'premium'
                     ? `${clientData.name} ${clientData.lastname}`.trim()
                     : clientData.name // Guest might just enter full name in one field or we adapt the guest form

              const res = await createPublicBooking({
                     clubId: club.id,
                     courtId: selectedSlot.courtId,
                     dateStr: format(selectedDate, 'yyyy-MM-dd'),
                     timeStr: selectedSlot.time,
                     clientName: fullName,
                     clientPhone: clientData.phone,
                     email: clientData.email,
                     isGuest: mode === 'guest'
              })

              if (res.success && res.bookingId) {
                     setCreatedBookingId(res.bookingId)
                     setStep(3)
                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       const handlePayment = async () => {
              if (!createdBookingId) return
              setIsPaying(true)
              const res = await createPreference(createdBookingId, `/p/${club.slug}`)
              setIsPaying(false)
              if (res.success && res.init_point) {
                     window.location.href = res.init_point
              } else {
                     alert("Error al generar pago: " + (res.error || 'Desconocido'))
              }
       }


       // ----------------------------------------------------------------------
       // STEP 0: LANDING
       // ----------------------------------------------------------------------
       if (step === 0) {
              return (
                     <div
                            className="font-sans bg-[#131416] text-white min-h-screen flex flex-col relative overflow-hidden"
                            style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
                     >
                            {/* Background Image Layer */}
                            <div className="fixed inset-0 z-0">
                                   <div className="w-full h-full bg-cover bg-center grayscale-[20%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554068865-24cecd4e34cd?q=80&w=2662&auto=format&fit=crop')" }}></div>
                                   <div className="absolute inset-0 bg-[#131416]/80 backdrop-blur-sm"></div>
                            </div>

                            <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto w-full px-6 py-8">
                                   {/* Header */}
                                   <header className="flex flex-col items-center mb-12 mt-8">
                                          <div className="mb-4">
                                                 <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                               <span className="text-white text-2xl font-bold">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </div>
                                          <h2 className="text-white text-3xl font-extrabold tracking-tight">{club.name}</h2>
                                          <div className="h-1 w-12 bg-primary mt-2 rounded-full"></div>
                                   </header>

                                   <div className="mb-8 text-center">
                                          <h1 className="text-white text-2xl font-bold leading-tight tracking-tight px-2">Acceso al Portal de Reservas</h1>
                                   </div>

                                   {/* Premium Card */}
                                   <div className="mb-6">
                                          <div className="bg-[#1c2426]/90 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
                                                 <div>
                                                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                                                               <Star className="text-primary fill-primary" size={20} />
                                                               Tu Cuenta
                                                        </h3>
                                                        <ul className="space-y-4">
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                                             <Wallet size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Gestionar cuenta corriente</span>
                                                               </li>
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                                             <History size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Historial de turnos</span>
                                                               </li>
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                                                             <Zap size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Pagos rápidos y seguros</span>
                                                               </li>
                                                        </ul>
                                                 </div>

                                                 <div className="flex flex-col gap-3">
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('register'); }}
                                                               className="w-full h-14 bg-primary hover:bg-primary/90 transition-all rounded-xl text-white font-bold text-base flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                                                        >
                                                               <span>Crear Perfil</span>
                                                               <ChevronRight className="ml-2" size={20} />
                                                        </button>
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('login'); }}
                                                               className="w-full h-14 bg-white/5 hover:bg-white/10 transition-all rounded-xl text-white font-bold text-sm flex items-center justify-center border border-white/10"
                                                        >
                                                               <span>Ya tengo cuenta</span>
                                                               <LogIn className="ml-2" size={18} />
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Guest Access */}
                                   <div className="mt-auto pb-6">
                                          <div className="flex flex-col gap-3">
                                                 <button
                                                        onClick={() => { setMode('guest'); setStep(1); }}
                                                        className="w-full h-14 border-2 border-white/20 hover:border-white/40 bg-transparent rounded-xl text-white font-bold text-base transition-colors flex items-center justify-center"
                                                 >
                                                        Continuar como Invitado
                                                 </button>
                                                 <p className="text-gray-400 text-xs text-center px-8">
                                                        * No se guardará historial ni cuenta corriente en este modo.
                                                 </p>
                                          </div>
                                   </div>

                                   <footer className="flex justify-center items-center gap-2 opacity-40 mt-4">
                                          <span className="text-[10px] font-bold tracking-widest uppercase">Powered by CourtOps</span>
                                   </footer>
                            </div>
                     </div>
              )
       }

       // ----------------------------------------------------------------------
       // STEP LOGIN: PREMIUM LOGIN
       // ----------------------------------------------------------------------
       if (step === 'login') {
              return (
                     <div
                            className="font-sans bg-[#F9FAFB] dark:bg-[#101418] text-slate-900 dark:text-white min-h-screen flex flex-col"
                            style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
                     >
                            <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-[#101418]/80 backdrop-blur-xl p-4 border-b border-gray-200 dark:border-gray-800">
                                   <button onClick={() => setStep(0)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                          <ArrowLeft size={20} />
                                   </button>
                                   <h1 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Iniciar Sesión</h1>
                            </header>

                            <main className="flex-1 flex flex-col p-5 max-w-md mx-auto w-full">
                                   <section className="mb-8">
                                          <h2 className="text-3xl font-extrabold leading-tight pt-4">Bienvenido de nuevo</h2>
                                          <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-2">
                                                 Ingresa tu número de teléfono o email para acceder a tu cuenta.
                                          </p>
                                   </section>

                                   <form onSubmit={handleLogin} className="space-y-4">
                                          <div className="flex flex-col">
                                                 <label className="text-sm font-semibold mb-2 ml-1">Teléfono o Email</label>
                                                 <input
                                                        required
                                                        type="text"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                        className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-[#006aff] transition-all"
                                                        placeholder="+54 9 11 ... o ejemplo@gmail.com"
                                                 />
                                          </div>

                                          <div className="pt-6">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full bg-[#006aff] hover:bg-[#0055cc] text-white font-bold text-lg h-16 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                                 >
                                                        {isSubmitting ? 'Verificando...' : 'Ingresar'}
                                                        <ArrowRight size={20} />
                                                 </button>
                                          </div>
                                   </form>
                            </main>
                     </div>
              )
       }

       // ----------------------------------------------------------------------
       // STEP REGISTER: PREMIUM SIGN UP
       // ----------------------------------------------------------------------
       if (step === 'register') {
              return (
                     <div
                            className="font-sans bg-[#F9FAFB] dark:bg-[#101418] text-slate-900 dark:text-white min-h-screen flex flex-col"
                            style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
                     >
                            <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-[#101418]/80 backdrop-blur-xl p-4 border-b border-gray-200 dark:border-gray-800">
                                   <button onClick={() => setStep(0)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                          <ArrowLeft size={20} />
                                   </button>
                                   <h1 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Registro de Cliente</h1>
                            </header>

                            <main className="flex-1 flex flex-col p-5 max-w-md mx-auto w-full">
                                   <section className="mb-8">
                                          <h2 className="text-3xl font-extrabold leading-tight pt-4">Crear cuenta en {club.name}</h2>
                                          <p className="text-gray-600 dark:text-gray-400 text-base font-normal mt-2">
                                                 Completa tus datos para empezar a reservar canchas y gestionar tus partidos de forma profesional.
                                          </p>
                                   </section>

                                   <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                          <div className="grid grid-cols-1 gap-4">
                                                 <div className="flex flex-col">
                                                        <label className="text-sm font-semibold mb-2 ml-1">Nombre</label>
                                                        <input
                                                               required
                                                               value={clientData.name}
                                                               onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                               className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-[#006aff] transition-all"
                                                               placeholder="Ej. Juan"
                                                        />
                                                 </div>
                                                 <div className="flex flex-col">
                                                        <label className="text-sm font-semibold mb-2 ml-1">Apellido</label>
                                                        <input
                                                               required
                                                               value={clientData.lastname}
                                                               onChange={e => setClientData({ ...clientData, lastname: e.target.value })}
                                                               className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-[#006aff] transition-all"
                                                               placeholder="Ej. Pérez"
                                                        />
                                                 </div>
                                          </div>
                                          <div className="flex flex-col">
                                                 <label className="text-sm font-semibold mb-2 ml-1">Teléfono (WhatsApp)</label>
                                                 <input
                                                        required
                                                        type="tel"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                        className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-primary transition-all"
                                                        placeholder="+54 9 11 ..."
                                                 />
                                          </div>
                                          <div className="flex flex-col">
                                                 <label className="text-sm font-semibold mb-2 ml-1">Correo Electrónico (Opcional)</label>
                                                 <input
                                                        type="email"
                                                        value={clientData.email}
                                                        onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                                        className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-primary transition-all"
                                                        placeholder="juan@email.com"
                                                 />
                                          </div>

                                          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-4">
                                                 <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
                                                        <Wallet size={20} />
                                                 </div>
                                                 <div>
                                                        <p className="font-semibold text-sm">Cuenta Corriente Automática</p>
                                                        <p className="text-xs opacity-70 mt-1">
                                                               Al registrarte, se habilitará automáticamente tu cuenta corriente.
                                                        </p>
                                                 </div>
                                          </div>

                                          <div className="pt-6 flex flex-col gap-4">
                                                 <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-16 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                                        Crear mi Perfil y Reservar
                                                        <ArrowRight size={20} />
                                                 </button>
                                                 <button type="button" onClick={() => { setMode('guest'); setStep(1); }} className="w-full text-center py-2 text-primary font-semibold text-base hover:underline">
                                                        Entrar como invitado
                                                 </button>
                                          </div>
                                   </form>
                            </main>
                     </div>
              )
       }

       // ----------------------------------------------------------------------
       // MAIN WIZARD (Steps 1, 2, 3)
       // ----------------------------------------------------------------------
       return (
              <div
                     className="font-sans bg-[#F9FAFB] dark:bg-[#0A0A0C] text-slate-900 dark:text-slate-100 min-h-screen pb-24 transition-colors duration-300"
                     style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
              >
                     {/* Header for Booking Steps */}
                     <header className="relative h-40 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] dark:from-[#0A0A0C] via-transparent to-transparent"></div>
                            <div className="relative z-10 px-6 pt-8 flex flex-col items-center">
                                   {step === 1 && (
                                          <button onClick={() => setStep(0)} className="absolute left-6 top-8 text-slate-400 hover:text-white">
                                                 <ArrowLeft />
                                          </button>
                                   )}
                                   <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                 {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover rounded-xl" /> : club.name.substring(0, 2).toUpperCase()}
                                          </div>
                                          <h1 className="text-xl font-bold tracking-tight">{club.name}</h1>
                                   </div>
                                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                                 {mode === 'guest' ? 'Modo Invitado' : 'Usuario'}
                                          </span>
                                   </div>
                            </div>
                     </header>

                     <main className="px-5 -mt-6 relative z-20 max-w-md mx-auto">
                            <AnimatePresence mode="wait">
                                   {/* STEP 1: DATE + SLOTS */}
                                   {(step === 1) && (
                                          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                 <section className="mb-8">
                                                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">fecha</h2>
                                                        <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x">
                                                               {days.map(d => {
                                                                      const active = isSameDay(d, selectedDate)
                                                                      return (
                                                                             <button
                                                                                    key={d.toString()}
                                                                                    onClick={() => setSelectedDate(d)}
                                                                                    className={cn(
                                                                                           "flex-shrink-0 w-20 h-28 flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 snap-center",
                                                                                           active
                                                                                                  ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
                                                                                                  : "bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-500"
                                                                                    )}
                                                                             >
                                                                                    <span className={cn("text-[10px] font-bold uppercase mb-1", active ? "opacity-80" : "")}>
                                                                                           {format(d, 'EEE', { locale: es })}
                                                                                    </span>
                                                                                    <span className={cn("text-2xl font-black", !active && "text-slate-700 dark:text-slate-300")}>
                                                                                           {format(d, 'd')}
                                                                                    </span>
                                                                             </button>
                                                                      )
                                                               })}
                                                        </div>
                                                 </section>

                                                 <section>
                                                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Horarios</h2>
                                                        <div className="space-y-4">
                                                               {loading && (
                                                                      <div className="py-12 flex justify-center">
                                                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                                                      </div>
                                                               )}

                                                               {!loading && slots.length === 0 && (
                                                                      <div className="py-12 text-center text-slate-500">
                                                                             No hay turnos disponibles.
                                                                      </div>
                                                               )}

                                                               {!loading && slots.map((slot, idx) => (
                                                                      <div key={idx} className="bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
                                                                             <div className="flex justify-between items-center mb-5">
                                                                                    <span className="text-xl font-bold">{slot.time}</span>
                                                                                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                                                                                           ${slot.price}
                                                                                    </span>
                                                                             </div>
                                                                             <div className="grid grid-cols-2 gap-3">
                                                                                    {slot.courts.map((court: any) => (
                                                                                           <button
                                                                                                  key={court.id}
                                                                                                  onClick={() => {
                                                                                                         setSelectedSlot({ time: slot.time, price: slot.price, courtId: court.id, courtName: court.name })
                                                                                                         setStep(2)
                                                                                                  }}
                                                                                                  className="py-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all rounded-2xl text-sm font-semibold active:scale-[0.98]"
                                                                                           >
                                                                                                  {court.name}
                                                                                           </button>
                                                                                    ))}
                                                                             </div>
                                                                      </div>
                                                               ))}
                                                        </div>
                                                 </section>
                                          </motion.div>
                                   )}

                                   {/* STEP 2: CONFIRMATION FORM */}
                                   {(step === 2 && selectedSlot) && (
                                          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="pt-4">
                                                 <button onClick={() => setStep(1)} className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white">← Volver</button>

                                                 <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl mb-6">
                                                        <h2 className="text-xl font-bold mb-1">Confirmar Reserva</h2>
                                                        <p className="text-slate-500 text-sm mb-4">Revisa los datos antes de confirmar</p>

                                                        <div className="flex justify-between items-center bg-[#F9FAFB] dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-6">
                                                               <div>
                                                                      <p className="font-bold text-lg">{selectedSlot.time} hs</p>
                                                                      <p className="text-xs text-slate-500 capitalize">{format(selectedDate, 'EEEE d MMM', { locale: es })}</p>
                                                               </div>
                                                               <div className="text-right">
                                                                      <p className="font-bold text-lg text-primary">${selectedSlot.price}</p>
                                                                      <p className="text-xs text-slate-500">{selectedSlot.courtName}</p>
                                                               </div>
                                                        </div>

                                                        <form onSubmit={handleBooking} className="space-y-4">
                                                               {/* If Guest, show inputs. If Premium, show static data */}
                                                               {mode === 'guest' ? (
                                                                      <>
                                                                             <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-4">
                                                                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-1">Requiere Seña</p>
                                                                                    <p className="text-xs text-orange-800 dark:text-orange-300">
                                                                                           {club.bookingDeposit && club.bookingDeposit > 0
                                                                                                  ? `Para confirmar esta reserva, deberás abonar una seña de $${club.bookingDeposit}.`
                                                                                                  : "Para confirmar esta reserva, deberás abonar una seña."}
                                                                                           La reserva quedará pendiente hasta ese momento.
                                                                                    </p>
                                                                             </div>
                                                                             <div>
                                                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nombre Completo</label>
                                                                                    <input
                                                                                           required
                                                                                           className="w-full bg-[#F9FAFB] dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-colors"
                                                                                           placeholder="Tu nombre"
                                                                                           value={clientData.name}
                                                                                           onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                             <div>
                                                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Teléfono</label>
                                                                                    <input
                                                                                           required
                                                                                           type="tel"
                                                                                           className="w-full bg-[#F9FAFB] dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 outline-none focus:border-primary transition-colors"
                                                                                           placeholder="Tu número de celular"
                                                                                           value={clientData.phone}
                                                                                           onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </>
                                                               ) : (
                                                                      <div className="space-y-3">
                                                                             <div className="bg-slate-5, dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                                                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Cliente</span>
                                                                                    <div className="font-bold text-lg">{clientData.name} {clientData.lastname}</div>
                                                                                    <div className="text-sm text-slate-400">{clientData.phone}</div>
                                                                                    {clientData.email && <div className="text-sm text-slate-400">{clientData.email}</div>}
                                                                             </div>
                                                                             <div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 p-3 rounded-lg">
                                                                                    <Wallet size={14} />
                                                                                    El valor del turno se cargará a tu cuenta corriente
                                                                             </div>
                                                                      </div>
                                                               )}

                                                               <button
                                                                      type="submit"
                                                                      disabled={isSubmitting}
                                                                      className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                                                               >
                                                                      {isSubmitting ? 'Procesando...' : (mode === 'guest' ? 'Solicitar Reserva' : 'Confirmar Reserva')}
                                                               </button>
                                                        </form>
                                                 </div>
                                          </motion.div>
                                   )}

                                   {/* STEP 3: SUCCESS */}
                                   {(step === 3 && selectedSlot) && (
                                          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pt-8 w-full max-w-md mx-auto">

                                                 {/* Success Illustration & Title */}
                                                 <div className="flex flex-col items-center pb-6">
                                                        <div className="relative mb-6">
                                                               <div className={cn("absolute inset-0 blur-3xl rounded-full bg-primary/20", mode === 'guest' ? "bg-orange-500/20" : "")}></div>
                                                               <div className={cn("relative flex items-center justify-center border w-24 h-24 rounded-full", mode === 'guest' ? "bg-orange-500/10 border-orange-500/30 text-orange-500" : "bg-primary/10 border-primary/30 text-primary")}>
                                                                      {mode === 'guest' ? <Clock size={48} /> : <CheckCircle2 size={48} />}
                                                               </div>
                                                               <div className="absolute -bottom-2 -right-2 bg-primary w-10 h-10 rounded-xl flex items-center justify-center border-4 border-[#F9FAFB] dark:border-[#0A0A0C]">
                                                                      <Trophy className="text-white" size={20} />
                                                               </div>
                                                        </div>
                                                        <h1 className="text-3xl font-bold leading-tight text-center mb-2">
                                                               {mode === 'guest' ? 'Solicitud Enviada' : '¡Reserva Exitosa!'}
                                                        </h1>
                                                        {mode === 'guest' && (
                                                               <p className="text-slate-500 text-sm text-center">
                                                                      Tu reserva está pendiente de pago.
                                                               </p>
                                                        )}
                                                 </div>

                                                 {/* ACTION GRID: WhatsApp & Calendar */}
                                                 <div className="grid grid-cols-2 gap-3 mb-6">
                                                        <button
                                                               onClick={() => {
                                                                      const text = `¡Hola! Reservé cancha en ${club.name} para el ${format(selectedDate, 'EEEE d', { locale: es })} a las ${selectedSlot.time}hs. 🎾\n\n¿Quién se suma?`
                                                                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                                                               }}
                                                               className="col-span-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-6 rounded-xl font-bold text-center shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                        >
                                                               <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                               Invitar Amigos (WhatsApp)
                                                        </button>

                                                        <button
                                                               onClick={() => {
                                                                      // Google Calendar Format
                                                                      const start = selectedDate.toISOString().replace(/-|:|\.\d\d\d/g, "")
                                                                      // End time approx +90 mins 
                                                                      const endDate = new Date(selectedDate.getTime() + 90 * 60000)
                                                                      const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")

                                                                      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Padel en ${club.name}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Cancha: ${selectedSlot.courtName}\nPrecio: $${selectedSlot.price}`)}&location=${encodeURIComponent(club.address || club.name)}`
                                                                      window.open(url, '_blank')
                                                               }}
                                                               className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-700 dark:text-white py-3 px-4 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                                                        >
                                                               <Calendar size={16} />
                                                               Google Calendar
                                                        </button>
                                                        <button
                                                               onClick={() => {
                                                                      alert('Función próximamente disponible (Outlook/Apple)')
                                                               }}
                                                               className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-700 dark:text-white py-3 px-4 rounded-xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                                                        >
                                                               <Calendar size={16} />
                                                               Otros
                                                        </button>
                                                 </div>

                                                 {/* Booking Details Card (Bento Style) */}
                                                 <div className="bg-white dark:bg-[#161618] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm mb-8">
                                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
                                                               <div>
                                                                      <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Cancha</p>
                                                                      <p className="text-lg font-bold">{selectedSlot.courtName}</p>
                                                               </div>
                                                               <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                                      <Trophy size={20} />
                                                               </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div>
                                                                      <p className="text-slate-400 text-xs font-medium mb-1">Fecha</p>
                                                                      <p className="font-bold capitalize">{format(selectedDate, 'EEE d MMM', { locale: es })}</p>
                                                               </div>
                                                               <div>
                                                                      <p className="text-slate-400 text-xs font-medium mb-1">Horario</p>
                                                                      <p className="font-bold">{selectedSlot.time}hs</p>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* GUEST: Payment Info & Upsell */}
                                                 {mode === 'guest' && (
                                                        <>
                                                               <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/20 p-5 rounded-2xl mb-8">
                                                                      <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
                                                                             <span className="w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center text-xs">1</span>
                                                                             Datos de Pago (Seña)
                                                                      </h3>

                                                                      {club.mpAccessToken && createdBookingId && (
                                                                             <button
                                                                                    onClick={handlePayment}
                                                                                    disabled={isPaying}
                                                                                    className="w-full py-4 rounded-xl bg-[#009EE3] hover:bg-[#008ED0] text-white font-black text-lg shadow-lg mb-6 flex items-center justify-center gap-2 transition-all active:scale-95"
                                                                             >
                                                                                    {isPaying ? 'Cargando...' : `PAGAR ${club.bookingDeposit ? `$${club.bookingDeposit}` : 'SEÑA'} CON MP`}
                                                                             </button>
                                                                      )}

                                                                      {club.mpAlias ? (
                                                                             <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800/50 flex justify-between items-center group cursor-pointer active:scale-[0.98] transition-all" onClick={() => { navigator.clipboard.writeText(club.mpAlias!); alert('Alias copiado!'); }}>
                                                                                    <div>
                                                                                           <p className="text-xs text-slate-500 mb-1">Alias/CBU</p>
                                                                                           <code className="font-mono font-bold text-lg select-all text-slate-800 dark:text-slate-200">{club.mpAlias}</code>
                                                                                    </div>
                                                                                    <span className="text-[10px] bg-orange-100 dark:bg-orange-900/50 px-3 py-1.5 rounded-lg text-orange-700 dark:text-orange-300 font-bold uppercase tracking-wider">Copiar</span>
                                                                             </div>
                                                                      ) : (
                                                                             <p className="text-sm italic opacity-70">Consultar datos de pago al club.</p>
                                                                      )}

                                                                      <div className="mt-4 flex items-start gap-3">
                                                                             <span className="w-6 h-6 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center text-xs shrink-0 font-bold text-orange-800 dark:text-orange-200">2</span>
                                                                             <p className="text-sm text-orange-900 dark:text-orange-100 leading-snug">
                                                                                    Envía el comprobante por WhatsApp para confirmar tu turno definitivamente.
                                                                             </p>
                                                                      </div>
                                                               </div>

                                                               {/* Conversion Banner */}
                                                               <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 mb-8 shadow-lg shadow-primary/20 text-white">
                                                                      <div className="relative z-10">
                                                                             <h3 className="text-xl font-bold leading-tight mb-2">¿Quieres guardar este turno?</h3>
                                                                             <p className="text-white/90 text-sm font-medium mb-6 leading-relaxed">
                                                                                    Regístrate para gestionar tus reservas, recibir créditos y activar tu Cuenta Corriente.
                                                                             </p>

                                                                             <div className="space-y-3 mb-6">
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="bg-white/20 p-1.5 rounded-full"><History size={14} className="text-white" /></div>
                                                                                           <span className="text-xs font-semibold">Historial completo</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3">
                                                                                           <div className="bg-white/20 p-1.5 rounded-full"><Wallet size={14} className="text-white" /></div>
                                                                                           <span className="text-xs font-semibold">Créditos automáticos</span>
                                                                                    </div>
                                                                             </div>

                                                                             <button onClick={() => setStep('register')} className="w-full bg-white text-primary hover:bg-slate-50 transition-colors py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg">
                                                                                    CREAR CUENTA AHORA
                                                                             </button>
                                                                      </div>
                                                                      <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12">
                                                                             <Ticket size={180} />
                                                                      </div>
                                                               </div>
                                                        </>
                                                 )}


                                                 {/* Footer Actions */}
                                                 <div className="flex flex-col gap-3">
                                                        <button
                                                               onClick={() => { setStep(1); setSelectedSlot(null); }}
                                                               className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors font-bold text-sm bg-slate-100 dark:bg-white/5"
                                                        >
                                                               <Home size={20} />
                                                               Volver al Inicio
                                                        </button>
                                                 </div>

                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>
              </div>
       )
}
