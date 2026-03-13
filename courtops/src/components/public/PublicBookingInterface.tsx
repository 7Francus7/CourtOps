'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { format, addDays, startOfToday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { createPublicBooking, getPublicAvailability } from '@/actions/public-booking'
import {
       Calendar, Clock, MapPin, Users,
       ChevronRight, CheckCircle2, X,
       MessageCircle, Copy, Share2, Info,
       Landmark, ChevronLeft, Zap, Sun, Sunset, Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type Court = {
       id: number
       name: string
       type: string | null
       sport: string
       duration: number
       price: number
}

type Slot = {
       time: string
       price: number
       courts: Court[]
}

type Props = {
       club: any
}

function getTimeCategory(time: string): 'morning' | 'afternoon' | 'night' {
       const hour = parseInt(time.split(':')[0], 10)
       if (hour < 13) return 'morning'
       if (hour < 20) return 'afternoon'
       return 'night'
}

const categoryConfig = {
       morning: { label: 'Mañana', icon: Sun, color: 'text-amber-400' },
       afternoon: { label: 'Tarde', icon: Sunset, color: 'text-orange-400' },
       night: { label: 'Noche', icon: Moon, color: 'text-indigo-400' },
}

export default function PublicBookingInterface({ club }: Props) {
       const [selectedDate, setSelectedDate] = useState(startOfToday())
       const [availability, setAvailability] = useState<Slot[]>([])
       const [loading, setLoading] = useState(true)

       // Booking interaction state
       const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
       const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
       const [formData, setFormData] = useState({ name: '', phone: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [bookingSuccess, setBookingSuccess] = useState(false)

       // Date navigation (7 days)
       const dates = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i)), [])

       useEffect(() => {
              async function fetchSlots() {
                     setLoading(true)
                     setSelectedSlot(null)
                     setSelectedCourt(null)
                     try {
                            // No duration override - each court uses its configured default
                            const slots = await getPublicAvailability(club.id, selectedDate)
                            setAvailability(slots)
                     } catch (error) {
                            console.error(error)
                            toast.error('Error al cargar disponibilidad')
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id])

       // Group slots by time of day
       const groupedSlots = useMemo(() => {
              const groups: Record<string, Slot[]> = { morning: [], afternoon: [], night: [] }
              availability.forEach(slot => {
                     groups[getTimeCategory(slot.time)].push(slot)
              })
              return groups
       }, [availability])

       const handleSelectSlot = useCallback((slot: Slot) => {
              setSelectedSlot(slot)
              // Auto-select court if only one available
              setSelectedCourt(slot.courts.length === 1 ? slot.courts[0] : null)
       }, [])

       async function handleBooking(e: React.FormEvent) {
              e.preventDefault()
              if (!selectedSlot || !selectedCourt) return

              setIsSubmitting(true)
              try {
                     const res = await createPublicBooking({
                            clubId: club.id,
                            courtId: selectedCourt.id,
                            dateStr: format(selectedDate, 'yyyy-MM-dd'),
                            timeStr: selectedSlot.time,
                            clientName: formData.name,
                            clientPhone: formData.phone,
                            isGuest: true,
                            // No durationMinutes - use court's default
                     })

                     if (res.success) {
                            setBookingSuccess(true)
                     } else {
                            toast.error(res.error || 'Error al crear la reserva')
                     }
              } catch {
                     toast.error('Error inesperado. Intenta de nuevo.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const copyToClipboard = (text: string, label: string) => {
              navigator.clipboard.writeText(text)
              toast.success(`${label} copiado`)
       }

       const hasPaymentInfo = club.mpAlias || club.mpCvu
       const totalSlots = availability.length

       return (
              <div className="flex flex-col h-full bg-[#0a0a0a] text-white font-sans relative">

                     {/* HEADER */}
                     <header className="relative px-5 pt-5 pb-4 flex items-center justify-between sticky top-0 z-20">
                            <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0a0a0a] border-b border-white/[0.04]" />
                            <div className="flex items-center gap-3.5 relative z-10">
                                   {club.logoUrl ? (
                                          <Image src={club.logoUrl} alt={club.name} width={44} height={44} className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10" />
                                   ) : (
                                          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                                 <Zap size={22} className="text-black" />
                                          </div>
                                   )}
                                   <div>
                                          <h1 className="font-extrabold text-[15px] tracking-tight leading-none">{club.name}</h1>
                                          {club.address && (
                                                 <p className="text-[11px] text-white/40 mt-0.5 flex items-center gap-1">
                                                        <MapPin size={10} /> {club.address}
                                                 </p>
                                          )}
                                   </div>
                            </div>
                            {club.phone && (
                                   <button
                                          onClick={() => window.open(`https://wa.me/${club.phone}`, '_blank')}
                                          className="relative z-10 w-9 h-9 bg-white/[0.06] hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center border border-white/[0.06]"
                                   >
                                          <MessageCircle size={17} className="text-primary" />
                                   </button>
                            )}
                     </header>

                     {/* DATE PICKER */}
                     <div className="px-5 pt-4 pb-3">
                            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-3">
                                   {format(selectedDate, "MMMM yyyy", { locale: es })}
                            </p>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                                   {dates.map((date) => {
                                          const isSelected = isSameDay(date, selectedDate)
                                          const isToday = isSameDay(date, startOfToday())
                                          return (
                                                 <motion.button
                                                        key={date.toISOString()}
                                                        onClick={() => setSelectedDate(date)}
                                                        whileTap={{ scale: 0.93 }}
                                                        className={cn(
                                                               "relative flex flex-col items-center justify-center min-w-[3.5rem] h-[4.5rem] rounded-2xl transition-all duration-200 border",
                                                               isSelected
                                                                      ? "border-primary/40 text-black"
                                                                      : "bg-white/[0.03] border-white/[0.04] text-white/50 hover:border-white/10 hover:bg-white/[0.06]"
                                                        )}
                                                 >
                                                        {isSelected && (
                                                               <motion.div
                                                                      layoutId="activeDate"
                                                                      className="absolute inset-0 bg-primary rounded-2xl"
                                                                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                               />
                                                        )}
                                                        <span className={cn(
                                                               "relative z-10 text-[10px] font-bold uppercase tracking-tight",
                                                               isSelected ? "text-black/50" : ""
                                                        )}>
                                                               {format(date, 'EEE', { locale: es })}
                                                        </span>
                                                        <span className={cn(
                                                               "relative z-10 text-lg font-extrabold leading-none mt-0.5",
                                                               isSelected ? "text-black" : ""
                                                        )}>
                                                               {format(date, 'd')}
                                                        </span>
                                                        {isToday && !isSelected && (
                                                               <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                                                        )}
                                                 </motion.button>
                                          )
                                   })}
                            </div>
                     </div>

                     {/* AVAILABILITY COUNT BAR */}
                     {!loading && (
                            <div className="px-5 py-2.5 flex items-center justify-between">
                                   <p className="text-[11px] font-medium text-white/30">
                                          {totalSlots > 0
                                                 ? <><span className="text-primary font-bold">{totalSlots}</span> {totalSlots === 1 ? 'horario disponible' : 'horarios disponibles'}</>
                                                 : 'Sin disponibilidad'
                                          }
                                   </p>
                                   {totalSlots > 0 && (
                                          <p className="text-[11px] text-white/20">
                                                 desde <span className="text-white/50 font-semibold">${Math.min(...availability.map(s => s.price)).toLocaleString('es-AR')}</span>
                                          </p>
                                   )}
                            </div>
                     )}

                     {/* SLOTS LIST */}
                     <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5 relative">
                            <AnimatePresence mode="wait">
                                   {loading ? (
                                          <motion.div
                                                 key="loading"
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="space-y-3 pt-2"
                                          >
                                                 {[1, 2, 3, 4, 5, 6].map(i => (
                                                        <div
                                                               key={i}
                                                               className="h-[4.5rem] bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.04]"
                                                               style={{ animationDelay: `${i * 80}ms` }}
                                                        />
                                                 ))}
                                          </motion.div>
                                   ) : availability.length === 0 ? (
                                          <motion.div
                                                 key="empty"
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0 }}
                                                 className="text-center pt-16 pb-8"
                                          >
                                                 <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/[0.06]">
                                                        <Calendar size={28} className="text-white/20" />
                                                 </div>
                                                 <h3 className="font-bold text-base text-white/60 mb-1.5">No hay turnos disponibles</h3>
                                                 <p className="text-sm text-white/30 max-w-[240px] mx-auto">Probá seleccionando otro día o contactá al club.</p>
                                          </motion.div>
                                   ) : (
                                          <motion.div
                                                 key="slots"
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="space-y-5"
                                          >
                                                 {(['morning', 'afternoon', 'night'] as const).map(category => {
                                                        const slots = groupedSlots[category]
                                                        if (slots.length === 0) return null
                                                        const config = categoryConfig[category]
                                                        const Icon = config.icon

                                                        return (
                                                               <div key={category}>
                                                                      {/* Category Header */}
                                                                      <div className="flex items-center gap-2 mb-3 pt-1">
                                                                             <Icon size={14} className={config.color} />
                                                                             <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">{config.label}</span>
                                                                             <div className="flex-1 h-px bg-white/[0.04]" />
                                                                      </div>

                                                                      {/* Slot Grid */}
                                                                      <div className="grid grid-cols-3 gap-2">
                                                                             {slots.map((slot, idx) => (
                                                                                    <motion.button
                                                                                           key={slot.time}
                                                                                           initial={{ opacity: 0, y: 8 }}
                                                                                           animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                                                                                           whileTap={{ scale: 0.95 }}
                                                                                           onClick={() => handleSelectSlot(slot)}
                                                                                           className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-primary/30 rounded-2xl p-3 transition-all duration-200 text-left overflow-hidden"
                                                                                    >
                                                                                           <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/[0.04] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                           <div className="relative z-10">
                                                                                                  <span className="text-[17px] font-extrabold tracking-tight text-white block leading-none">
                                                                                                         {slot.time}
                                                                                                  </span>
                                                                                                  <div className="flex items-center justify-between mt-2">
                                                                                                         <span className="text-[11px] font-semibold text-primary">
                                                                                                                ${slot.price.toLocaleString('es-AR')}
                                                                                                         </span>
                                                                                                         <span className="text-[9px] text-white/25 font-medium">
                                                                                                                {slot.courts.length} {slot.courts.length === 1 ? 'cancha' : 'canchas'}
                                                                                                         </span>
                                                                                                  </div>
                                                                                           </div>
                                                                                    </motion.button>
                                                                             ))}
                                                                      </div>
                                                               </div>
                                                        )
                                                 })}
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </div>

                     {/* FOOTER */}
                     <div className="px-5 py-3 border-t border-white/[0.04] bg-[#0a0a0a]">
                            <p className="text-[10px] font-medium text-white/15 text-center tracking-widest uppercase">Powered by CourtOps</p>
                     </div>

                     {/* BOOKING MODAL */}
                     <AnimatePresence>
                            {selectedSlot && !bookingSuccess && (
                                   <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                                                 onClick={() => !isSubmitting && setSelectedSlot(null)}
                                          />

                                          <motion.div
                                                 key="booking-modal"
                                                 initial={{ opacity: 0, y: "100%" }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 exit={{ opacity: 0, y: "100%" }}
                                                 transition={{ type: "spring", stiffness: 300, damping: 32 }}
                                                 className="relative bg-[#0c0c0c] w-full max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/[0.08] overflow-hidden flex flex-col max-h-[92vh]"
                                          >
                                                 <form onSubmit={handleBooking} className="flex flex-col overflow-hidden">

                                                        {/* Modal Header */}
                                                        <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.06]">
                                                               <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-transparent pointer-events-none" />
                                                               <div className="relative z-10 flex justify-between items-start">
                                                                      <div>
                                                                             <h3 className="text-lg font-extrabold tracking-tight">Reservar turno</h3>
                                                                             <div className="flex items-center gap-3 mt-2 text-[13px] text-white/60 font-medium">
                                                                                    <span className="flex items-center gap-1.5">
                                                                                           <Calendar size={13} className="text-primary" />
                                                                                           {format(selectedDate, "EEE d MMM", { locale: es })}
                                                                                    </span>
                                                                                    <span className="text-white/15">|</span>
                                                                                    <span className="flex items-center gap-1.5">
                                                                                           <Clock size={13} className="text-primary" />
                                                                                           {selectedSlot.time} hs
                                                                                    </span>
                                                                             </div>
                                                                      </div>
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => setSelectedSlot(null)}
                                                                             disabled={isSubmitting}
                                                                             className="w-8 h-8 flex items-center justify-center bg-white/[0.06] rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                                                      >
                                                                             <X size={16} />
                                                                      </button>
                                                               </div>
                                                        </div>

                                                        <div className="p-5 space-y-5 overflow-y-auto">

                                                               {/* Court Selection */}
                                                               <div className="space-y-2.5">
                                                                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                                                                             {selectedSlot.courts.length > 1 ? 'Elegí tu cancha' : 'Cancha'}
                                                                      </label>
                                                                      <div className={cn(
                                                                             "grid gap-2",
                                                                             selectedSlot.courts.length > 1 ? "grid-cols-2" : "grid-cols-1"
                                                                      )}>
                                                                             {selectedSlot.courts.map((court) => {
                                                                                    const isSelected = selectedCourt?.id === court.id
                                                                                    return (
                                                                                           <motion.button
                                                                                                  key={court.id}
                                                                                                  type="button"
                                                                                                  whileTap={{ scale: 0.97 }}
                                                                                                  onClick={() => setSelectedCourt(court)}
                                                                                                  className={cn(
                                                                                                         "relative p-3.5 rounded-2xl border transition-all duration-200 text-left overflow-hidden",
                                                                                                         isSelected
                                                                                                                ? "border-primary/40 bg-primary/[0.08]"
                                                                                                                : "border-white/[0.06] bg-white/[0.03] hover:border-white/10"
                                                                                                  )}
                                                                                           >
                                                                                                  {isSelected && (
                                                                                                         <motion.div
                                                                                                                layoutId="activeCourt"
                                                                                                                className="absolute inset-0 bg-primary/[0.06] border border-primary/30 rounded-2xl"
                                                                                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                                                                         />
                                                                                                  )}
                                                                                                  <div className="relative z-10">
                                                                                                         <div className="flex items-center justify-between mb-1.5">
                                                                                                                <span className="font-bold text-sm text-white">{court.name}</span>
                                                                                                                {isSelected && <CheckCircle2 size={16} className="text-primary" />}
                                                                                                         </div>
                                                                                                         <div className="flex items-center gap-2 text-[10px] text-white/35">
                                                                                                                {court.type && (
                                                                                                                       <span className="bg-white/[0.06] px-1.5 py-0.5 rounded font-medium">{court.type}</span>
                                                                                                                )}
                                                                                                                <span>{court.duration} min</span>
                                                                                                         </div>
                                                                                                         <p className="text-primary font-bold text-sm mt-2">
                                                                                                                ${court.price.toLocaleString('es-AR')}
                                                                                                         </p>
                                                                                                  </div>
                                                                                           </motion.button>
                                                                                    )
                                                                             })}
                                                                      </div>
                                                               </div>

                                                               {/* Personal Info */}
                                                               <div className="space-y-3">
                                                                      <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Tus datos</label>
                                                                      <div className="space-y-2.5">
                                                                             <input
                                                                                    required
                                                                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-white/20"
                                                                                    placeholder="Nombre completo"
                                                                                    value={formData.name}
                                                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                             />
                                                                             <input
                                                                                    required
                                                                                    type="tel"
                                                                                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-white font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-white/20"
                                                                                    placeholder="WhatsApp (ej: 3511234567)"
                                                                                    value={formData.phone}
                                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               {/* Payment Info - Only show if club has payment details */}
                                                               {hasPaymentInfo && selectedCourt && (
                                                                      <motion.div
                                                                             initial={{ opacity: 0, height: 0 }}
                                                                             animate={{ opacity: 1, height: 'auto' }}
                                                                             className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3"
                                                                      >
                                                                             <div className="flex items-center gap-2 mb-1">
                                                                                    <Landmark size={14} className="text-primary" />
                                                                                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Datos para seña</span>
                                                                             </div>

                                                                             {club.mpAlias && (
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => copyToClipboard(club.mpAlias, 'Alias')}
                                                                                           className="w-full flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] p-3 rounded-xl border border-white/[0.04] transition-colors group"
                                                                                    >
                                                                                           <span className="text-[10px] font-semibold text-white/30 uppercase">Alias</span>
                                                                                           <div className="flex items-center gap-2">
                                                                                                  <span className="text-sm font-bold text-white">{club.mpAlias}</span>
                                                                                                  <Copy size={12} className="text-white/20 group-hover:text-primary transition-colors" />
                                                                                           </div>
                                                                                    </button>
                                                                             )}
                                                                             {club.mpCvu && (
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => copyToClipboard(club.mpCvu, 'CBU/CVU')}
                                                                                           className="w-full flex justify-between items-center bg-white/[0.03] hover:bg-white/[0.06] p-3 rounded-xl border border-white/[0.04] transition-colors group"
                                                                                    >
                                                                                           <span className="text-[10px] font-semibold text-white/30 uppercase">CVU</span>
                                                                                           <div className="flex items-center gap-2">
                                                                                                  <span className="text-sm font-bold text-white truncate max-w-[160px]">{club.mpCvu}</span>
                                                                                                  <Copy size={12} className="text-white/20 group-hover:text-primary transition-colors" />
                                                                                           </div>
                                                                                    </button>
                                                                             )}

                                                                             <div className="h-px bg-white/[0.06]" />

                                                                             <div className="flex justify-between items-end">
                                                                                    <div>
                                                                                           <p className="text-[10px] text-white/30 font-medium">Total</p>
                                                                                           <p className="text-lg font-extrabold text-white">${selectedCourt.price.toLocaleString('es-AR')}</p>
                                                                                    </div>
                                                                                    {club.bookingDeposit && (
                                                                                           <div className="text-right">
                                                                                                  <p className="text-[10px] text-white/30 font-medium">Seña</p>
                                                                                                  <p className="text-lg font-extrabold text-primary">${Number(club.bookingDeposit).toLocaleString('es-AR')}</p>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      </motion.div>
                                                               )}

                                                               {/* Info Notice */}
                                                               <div className="flex items-start gap-2.5 p-3 bg-blue-500/[0.06] border border-blue-500/10 rounded-xl">
                                                                      <Info size={14} className="text-blue-400/60 flex-shrink-0 mt-0.5" />
                                                                      <p className="text-[11px] text-blue-300/50 font-medium leading-relaxed">
                                                                             Tu reserva quedará pendiente hasta que el club la confirme.
                                                                      </p>
                                                               </div>
                                                        </div>

                                                        {/* Submit Button */}
                                                        <div className="p-5 bg-[#0c0c0c] border-t border-white/[0.06]">
                                                               <motion.button
                                                                      type="submit"
                                                                      disabled={isSubmitting || !selectedCourt || !formData.name || !formData.phone}
                                                                      whileTap={{ scale: 0.98 }}
                                                                      className="w-full bg-primary text-black font-extrabold text-[15px] py-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all tracking-tight flex items-center justify-center gap-2"
                                                               >
                                                                      {isSubmitting ? (
                                                                             <>
                                                                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                                                    Reservando...
                                                                             </>
                                                                      ) : (
                                                                             <>
                                                                                    Confirmar reserva
                                                                                    <ChevronRight size={18} />
                                                                             </>
                                                                      )}
                                                               </motion.button>
                                                        </div>
                                                 </form>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>

                     {/* SUCCESS MODAL */}
                     <AnimatePresence>
                            {bookingSuccess && selectedSlot && (
                                   <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                          />

                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0 }}
                                                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                                 transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                 className="relative bg-[#0c0c0c] w-full max-w-sm rounded-3xl border border-white/[0.08] overflow-hidden"
                                          >
                                                 {/* Success Glow */}
                                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-24 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

                                                 <div className="relative z-10 p-8 text-center">
                                                        <motion.div
                                                               initial={{ scale: 0 }}
                                                               animate={{ scale: 1 }}
                                                               transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                                                               className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30"
                                                        >
                                                               <CheckCircle2 size={32} className="text-black" />
                                                        </motion.div>

                                                        <motion.h3
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: 0.2 }}
                                                               className="text-2xl font-extrabold tracking-tight mb-2"
                                                        >
                                                               Reserva enviada
                                                        </motion.h3>

                                                        <motion.p
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: 0.3 }}
                                                               className="text-white/40 text-sm mb-2"
                                                        >
                                                               Tu turno para el
                                                        </motion.p>

                                                        <motion.div
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: 0.35 }}
                                                               className="inline-flex items-center gap-2 bg-white/[0.06] px-4 py-2 rounded-xl border border-white/[0.08] mb-6"
                                                        >
                                                               <Calendar size={14} className="text-primary" />
                                                               <span className="font-bold text-sm">
                                                                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                                                               </span>
                                                               <span className="text-white/20">|</span>
                                                               <Clock size={14} className="text-primary" />
                                                               <span className="font-bold text-sm">{selectedSlot.time}hs</span>
                                                        </motion.div>

                                                        <motion.p
                                                               initial={{ opacity: 0 }}
                                                               animate={{ opacity: 1 }}
                                                               transition={{ delay: 0.4 }}
                                                               className="text-white/30 text-xs mb-8 leading-relaxed"
                                                        >
                                                               El club confirmará tu reserva a la brevedad.
                                                        </motion.p>

                                                        <motion.div
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: 0.45 }}
                                                               className="grid grid-cols-2 gap-2.5"
                                                        >
                                                               <button
                                                                      onClick={() => {
                                                                             setSelectedSlot(null)
                                                                             setSelectedCourt(null)
                                                                             setBookingSuccess(false)
                                                                             setFormData({ name: '', phone: '' })
                                                                      }}
                                                                      className="bg-white/[0.06] border border-white/[0.08] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-white/[0.1] transition-colors"
                                                               >
                                                                      Nueva reserva
                                                               </button>
                                                               {club.phone && (
                                                                      <button
                                                                             onClick={() => window.open(`https://wa.me/${club.phone}?text=Hola! Acabo de reservar un turno para el ${format(selectedDate, 'dd/MM')} a las ${selectedSlot.time}hs`, '_blank')}
                                                                             className="bg-primary text-black font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-1.5"
                                                                      >
                                                                             <MessageCircle size={15} />
                                                                             WhatsApp
                                                                      </button>
                                                               )}
                                                        </motion.div>
                                                 </div>
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>
       )
}
