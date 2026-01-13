'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking } from '@/actions/public-booking'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CalendarDays, MapPin, User, Settings, Star, Wallet, History, Zap, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react'

type Props = {
       club: {
              id: string
              name: string
              logoUrl?: string | null
              slug: string
       }
       initialDateStr: string
}

type BookingMode = 'guest' | 'premium' | null

export default function PublicBookingWizard({ club, initialDateStr }: Props) {
       const today = useMemo(() => new Date(initialDateStr), [initialDateStr])

       // Steps: 0=Landing, 'register'=Sign Up, 1=Date/Slot, 2=Confirm, 3=Success
       const [step, setStep] = useState<number | 'register'>(0)
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

              if (res.success) {
                     setStep(3)
                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       // ----------------------------------------------------------------------
       // STEP 0: LANDING
       // ----------------------------------------------------------------------
       if (step === 0) {
              return (
                     <div className="font-sans bg-[#131416] text-white min-h-screen flex flex-col relative overflow-hidden">
                            {/* Background Image Layer */}
                            <div className="fixed inset-0 z-0">
                                   <div className="w-full h-full bg-cover bg-center grayscale-[20%]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554068865-24cecd4e34cd?q=80&w=2662&auto=format&fit=crop')" }}></div>
                                   <div className="absolute inset-0 bg-[#131416]/80 backdrop-blur-sm"></div>
                            </div>

                            <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto w-full px-6 py-8">
                                   {/* Header */}
                                   <header className="flex flex-col items-center mb-12 mt-8">
                                          <div className="mb-4">
                                                 <div className="w-16 h-16 bg-[#006aff] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,106,255,0.3)]">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                               <span className="text-white text-2xl font-bold">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </div>
                                          <h2 className="text-white text-3xl font-extrabold tracking-tight">{club.name}</h2>
                                          <div className="h-1 w-12 bg-[#006aff] mt-2 rounded-full"></div>
                                   </header>

                                   <div className="mb-8 text-center">
                                          <h1 className="text-white text-2xl font-bold leading-tight tracking-tight px-2">Acceso al Portal de Reservas</h1>
                                   </div>

                                   {/* Premium Card */}
                                   <div className="mb-6">
                                          <div className="bg-[#1c2426]/90 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col gap-6">
                                                 <div>
                                                        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                                                               <Star className="text-[#006aff] fill-[#006aff]" size={20} />
                                                               Tu Perfil Premium
                                                        </h3>
                                                        <ul className="space-y-4">
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-[#006aff]/20 flex items-center justify-center text-[#006aff]">
                                                                             <Wallet size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Gestionar cuenta corriente</span>
                                                               </li>
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-[#006aff]/20 flex items-center justify-center text-[#006aff]">
                                                                             <History size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Historial de turnos</span>
                                                               </li>
                                                               <li className="flex items-center gap-3">
                                                                      <div className="w-8 h-8 rounded-lg bg-[#006aff]/20 flex items-center justify-center text-[#006aff]">
                                                                             <Zap size={16} />
                                                                      </div>
                                                                      <span className="text-gray-300 text-sm font-medium">Pagos rápidos y seguros</span>
                                                               </li>
                                                        </ul>
                                                 </div>
                                                 <button
                                                        onClick={() => { setMode('premium'); setStep('register'); }}
                                                        className="w-full h-14 bg-[#006aff] hover:bg-[#0055cc] transition-all rounded-xl text-white font-bold text-base flex items-center justify-center shadow-[0_0_20px_rgba(0,106,255,0.2)]"
                                                 >
                                                        <span>Crear Perfil / Iniciar Sesión</span>
                                                        <ChevronRight className="ml-2" size={20} />
                                                 </button>
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
       // STEP REGISTER: PREMIUM SIGN UP
       // ----------------------------------------------------------------------
       if (step === 'register') {
              return (
                     <div className="font-sans bg-[#F9FAFB] dark:bg-[#101418] text-slate-900 dark:text-white min-h-screen flex flex-col">
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
                                                        className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-[#006aff] transition-all"
                                                        placeholder="+54 9 11 ..."
                                                 />
                                          </div>
                                          <div className="flex flex-col">
                                                 <label className="text-sm font-semibold mb-2 ml-1">Correo Electrónico (Opcional)</label>
                                                 <input
                                                        type="email"
                                                        value={clientData.email}
                                                        onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                                        className="w-full rounded-xl bg-white dark:bg-[#1b2028] border border-gray-200 dark:border-[#394556] h-14 px-4 outline-none focus:ring-2 focus:ring-[#006aff] transition-all"
                                                        placeholder="juan@email.com"
                                                 />
                                          </div>

                                          <div className="mt-6 p-4 rounded-xl bg-[#006aff]/10 border border-[#006aff]/20 flex gap-4">
                                                 <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-[#006aff]/20 text-[#006aff]">
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
                                                 <button type="submit" className="w-full bg-[#006aff] hover:bg-[#0055cc] text-white font-bold text-lg h-16 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                                                        Crear mi Perfil y Reservar
                                                        <ArrowRight size={20} />
                                                 </button>
                                                 <button type="button" onClick={() => { setMode('guest'); setStep(1); }} className="w-full text-center py-2 text-[#006aff] font-semibold text-base hover:underline">
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
              <div className="font-sans bg-[#F9FAFB] dark:bg-[#0A0A0C] text-slate-900 dark:text-slate-100 min-h-screen pb-24 transition-colors duration-300">
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
                                          <div className="w-10 h-10 rounded-xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0C] font-bold text-lg shadow-lg">
                                                 {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover rounded-xl" /> : club.name.substring(0, 2).toUpperCase()}
                                          </div>
                                          <h1 className="text-xl font-bold tracking-tight">{club.name}</h1>
                                   </div>
                                   <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                                                 {mode === 'guest' ? 'Modo Invitado' : 'Modo Premium'}
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
                                                                                                  ? "bg-gradient-to-br from-[#3B82F6] to-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
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
                                                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
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
                                                                                    <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">
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
                                                                                                  className="py-4 bg-slate-100 dark:bg-slate-800/50 hover:bg-[#3B82F6] hover:text-white dark:hover:bg-[#3B82F6] transition-all rounded-2xl text-sm font-semibold active:scale-[0.98]"
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
                                                                      <p className="font-bold text-lg text-emerald-500">${selectedSlot.price}</p>
                                                                      <p className="text-xs text-slate-500">{selectedSlot.courtName}</p>
                                                               </div>
                                                        </div>

                                                        <form onSubmit={handleBooking} className="space-y-4">
                                                               {/* If Guest, show inputs. If Premium, show static data */}
                                                               {mode === 'guest' ? (
                                                                      <>
                                                                             <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-4">
                                                                                    <p className="text-xs text-yellow-500">Estás reservando como INVITADO. No se creará una cuenta.</p>
                                                                             </div>
                                                                             <div>
                                                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nombre Completo</label>
                                                                                    <input
                                                                                           required
                                                                                           className="w-full bg-[#F9FAFB] dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 outline-none focus:border-[#3B82F6] transition-colors"
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
                                                                                           className="w-full bg-[#F9FAFB] dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 outline-none focus:border-[#3B82F6] transition-colors"
                                                                                           placeholder="Tu número de celular"
                                                                                           value={clientData.phone}
                                                                                           onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </>
                                                               ) : (
                                                                      <div className="space-y-3">
                                                                             <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                                                                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Cliente</span>
                                                                                    <div className="font-bold text-lg">{clientData.name} {clientData.lastname}</div>
                                                                                    <div className="text-sm text-slate-400">{clientData.phone}</div>
                                                                                    {clientData.email && <div className="text-sm text-slate-400">{clientData.email}</div>}
                                                                             </div>
                                                                             <div className="flex items-center gap-2 text-xs text-[#006aff] font-bold bg-[#006aff]/10 p-3 rounded-lg">
                                                                                    <Wallet size={14} />
                                                                                    Se registrará en tu cuenta corriente
                                                                             </div>
                                                                      </div>
                                                               )}

                                                               <button
                                                                      type="submit"
                                                                      disabled={isSubmitting}
                                                                      className="w-full py-4 bg-[#CCFF00] hover:bg-[#bbe600] text-black font-bold rounded-2xl shadow-lg shadow-[#CCFF00]/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                                                               >
                                                                      {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
                                                               </button>
                                                        </form>
                                                 </div>
                                          </motion.div>
                                   )}

                                   {/* STEP 3: SUCCESS */}
                                   {(step === 3 && selectedSlot) && (
                                          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="pt-8 text-center">
                                                 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                                        🎉
                                                 </div>
                                                 <h2 className="text-2xl font-bold mb-2">¡Reserva Exitosa!</h2>
                                                 <p className="text-slate-500 text-sm mb-8 px-4">Te esperamos el {format(selectedDate, 'dd/MM', { locale: es })} a las {selectedSlot.time}hs en {club.name}.</p>

                                                 <button
                                                        onClick={() => { setStep(0); setSelectedSlot(null); setMode(null); setClientData({ name: '', lastname: '', phone: '', email: '' }) }}
                                                        className="px-8 py-3 bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                 >
                                                        Volver al inicio
                                                 </button>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>
              </div>
       )
}
