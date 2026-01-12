'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking } from '@/actions/public-booking'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { CalendarDays, MapPin, User, Settings, Sun, Moon } from 'lucide-react'

type Props = {
       club: {
              id: string
              name: string
              logoUrl?: string | null
              slug: string
       }
       initialDateStr: string
}

export default function PublicBookingWizard({ club, initialDateStr }: Props) {
       const today = useMemo(() => new Date(initialDateStr), [initialDateStr])
       const [step, setStep] = useState(1)
       const [selectedDate, setSelectedDate] = useState<Date>(today)
       const [slots, setSlots] = useState<any[]>([])
       const [loading, setLoading] = useState(true)
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, price: number, courtId: number, courtName: string } | null>(null)
       const [clientData, setClientData] = useState({ name: '', phone: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)

       // Fetch Slots
       useEffect(() => {
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
       }, [selectedDate, club.id])

       const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

       const handleBooking = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!selectedSlot) return
              setIsSubmitting(true)
              const res = await createPublicBooking({
                     clubId: club.id,
                     courtId: selectedSlot.courtId,
                     dateStr: format(selectedDate, 'yyyy-MM-dd'),
                     timeStr: selectedSlot.time,
                     clientName: clientData.name,
                     clientPhone: clientData.phone
              })
              if (res.success) {
                     setStep(3)
                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       return (
              <div className="font-sans bg-[#F9FAFB] dark:bg-[#0A0A0C] text-slate-900 dark:text-slate-100 min-h-screen pb-24 transition-colors duration-300">
                     {/* Header */}
                     <header className="relative h-56 overflow-hidden">
                            <img
                                   alt="Club Background"
                                   className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
                                   src="https://images.unsplash.com/photo-1554068865-2484cd0088fa?q=80&w=2670&auto=format&fit=crop"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] dark:from-[#0A0A0C] via-transparent to-transparent"></div>
                            <div className="relative z-10 px-6 pt-12 flex flex-col items-center">
                                   <div className="w-16 h-16 rounded-2xl bg-[#CCFF00] flex items-center justify-center text-[#0A0A0C] font-bold text-2xl shadow-lg mb-4">
                                          {club.logoUrl ? <img src={club.logoUrl} className="w-full h-full object-cover rounded-2xl" /> : club.name.substring(0, 2).toUpperCase()}
                                   </div>
                                   <h1 className="text-2xl font-bold tracking-tight text-center">{club.name}</h1>
                                   <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Reservas Online</span>
                                   </div>
                            </div>
                     </header>

                     <main className="px-5 -mt-6 relative z-20 max-w-md mx-auto">
                            <AnimatePresence mode="wait">
                                   {/* STEP 1: DATE + SLOTS */}
                                   {step === 1 && (
                                          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                 <section className="mb-8">
                                                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Elige una fecha</h2>
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
                                                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Horarios Disponibles</h2>
                                                        <div className="space-y-4">
                                                               {loading && (
                                                                      <div className="py-12 flex justify-center">
                                                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
                                                                      </div>
                                                               )}

                                                               {!loading && slots.length === 0 && (
                                                                      <div className="py-12 text-center text-slate-500">
                                                                             No hay turnos disponibles para este día.
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

                                   {/* STEP 2: FORM */}
                                   {step === 2 && selectedSlot && (
                                          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="pt-4">
                                                 <button onClick={() => setStep(1)} className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white">← Volver</button>

                                                 <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl mb-6">
                                                        <h2 className="text-xl font-bold mb-1">Confirmar Reserva</h2>
                                                        <p className="text-slate-500 text-sm mb-4">Completa tus datos para finalizar</p>

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
                                                               <div>
                                                                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Nombre</label>
                                                                      <input
                                                                             required
                                                                             className="w-full bg-[#F9FAFB] dark:bg-slate-800/30 border border-slate-200 dark:border-white/10 rounded-xl p-4 outline-none focus:border-[#3B82F6] transition-colors"
                                                                             placeholder="Tu nombre completo"
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
                                   {step === 3 && selectedSlot && (
                                          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="pt-8 text-center">
                                                 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                                        🎉
                                                 </div>
                                                 <h2 className="text-2xl font-bold mb-2">¡Reserva Exitosa!</h2>
                                                 <p className="text-slate-500 text-sm mb-8 px-4">Te esperamos el {format(selectedDate, 'dd/MM', { locale: es })} a las {selectedSlot.time}hs en {club.name}.</p>

                                                 <button
                                                        onClick={() => { setStep(1); setSelectedSlot(null); }}
                                                        className="px-8 py-3 bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                                 >
                                                        Volver al inicio
                                                 </button>
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </main>

                     {/* Fixed Bottom Nav (Visual Only/Navigation) */}
                     <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pointer-events-none">
                            <div className="pointer-events-auto bg-white/80 dark:bg-[#161618]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] px-8 py-4 flex justify-between items-center shadow-2xl max-w-md mx-auto">
                                   <button className="flex flex-col items-center gap-1 text-[#3B82F6]">
                                          <CalendarDays className="w-6 h-6" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Reservas</span>
                                   </button>
                                   <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#3B82F6] transition-colors">
                                          <MapPin className="w-6 h-6" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Canchas</span>
                                   </button>
                                   <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#3B82F6] transition-colors">
                                          <User className="w-6 h-6" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
                                   </button>
                                   <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-[#3B82F6] transition-colors">
                                          <Settings className="w-6 h-6" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
                                   </button>
                            </div>
                     </nav>
              </div>
       )
}
