'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfToday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { createPublicBooking, getPublicAvailability } from '@/actions/public-booking'
import {
       Calendar, Clock, Landmark, MapPin,
       ChevronRight, CheckCircle2, AlertCircle,
       MessageCircle, Copy, Share2, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
       club: any
}

export default function PublicBookingInterface({ club }: Props) {
       const [selectedDate, setSelectedDate] = useState(startOfToday())
       const [availability, setAvailability] = useState<any[]>([])
       const [loading, setLoading] = useState(true)

       // Booking interaction state
       const [selectedSlot, setSelectedSlot] = useState<any>(null)
       const [formData, setFormData] = useState({ name: '', phone: '', receiptFile: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [bookingSuccess, setBookingSuccess] = useState(false)
       const [validation, setValidation] = useState({ selectedCourtId: 0 })

       // Date navigation (7 days)
       const dates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i))

       useEffect(() => {
              async function fetchSlots() {
                     setLoading(true)
                     try {
                            const slots = await getPublicAvailability(club.id, selectedDate)
                            setAvailability(slots)
                     } catch (error) {
                            console.error(error)
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id])

       async function handleBooking(e: React.FormEvent) {
              e.preventDefault()
              if (!selectedSlot) return

              let courtId = validation.selectedCourtId || selectedSlot.courts[0].id

              setIsSubmitting(true)
              try {
                     const res = await createPublicBooking({
                            clubId: club.id,
                            courtId: courtId,
                            dateStr: format(selectedDate, 'yyyy-MM-dd'),
                            timeStr: selectedSlot.time,
                            clientName: formData.name,
                            clientPhone: formData.phone,
                            isGuest: true
                     })

                     if (res.success) {
                            setBookingSuccess(true)
                            toast.success("¡Reserva enviada con éxito!")
                     } else {
                            toast.error(res.error || "Error al crear la reserva")
                     }
              } catch (err) {
                     toast.error("Error inesperado. Intenta de nuevo.")
              } finally {
                     setIsSubmitting(false)
              }
       }

       const copyToClipboard = (text: string, label: string) => {
              navigator.clipboard.writeText(text)
              toast.success(`${label} copiado al portapapeles`)
       }

       return (
              <div className="flex flex-col h-full bg-[#0a0a0a] text-white font-sans relative">

                     {/* HEADER */}
                     <header className="p-6 bg-[#111] border-b border-white/5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl bg-opacity-80">
                            <div className="flex items-center gap-4">
                                   {club.logoUrl ? (
                                          <img src={club.logoUrl} alt={club.name} className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-white/10" />
                                   ) : (
                                          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary/20 font-black text-black italic">
                                                 🎾
                                          </div>
                                   )}
                                   <div>
                                          <h1 className="font-black text-lg tracking-tight leading-none mb-1 uppercase italic">{club.name}</h1>
                                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                 SISTEMA DE RESERVAS
                                          </div>
                                   </div>
                            </div>
                            <button
                                   onClick={() => window.open(`https://wa.me/${club.phone || '5493524421497'}`, '_blank')}
                                   className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                            >
                                   <MessageCircle size={20} className="text-primary" />
                            </button>
                     </header>

                     {/* DATE PICKER */}
                     <div className="py-6 border-b border-white/5 relative bg-[#0a0a0a]">
                            <div className="flex gap-3 px-6 overflow-x-auto no-scrollbar pb-2">
                                   {dates.map((date) => {
                                          const isSelected = isSameDay(date, selectedDate)
                                          return (
                                                 <motion.button
                                                        key={date.toISOString()}
                                                        onClick={() => setSelectedDate(date)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={cn(
                                                               "relative flex flex-col items-center justify-center min-w-[4rem] h-[5rem] rounded-[1.25rem] transition-colors duration-200 border overflow-hidden",
                                                               isSelected
                                                                      ? "border-primary/50 text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                                                      : "bg-[#111] border-white/5 text-muted-foreground hover:border-white/20"
                                                        )}
                                                 >
                                                        {isSelected && (
                                                               <motion.div
                                                                      layoutId="activeDatePublic"
                                                                      className="absolute inset-0 bg-primary"
                                                                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                               />
                                                        )}
                                                        <span className={cn("relative z-10 text-[10px] font-black uppercase tracking-tighter mb-1", isSelected ? "text-black/60" : "text-muted-foreground")}>
                                                               {format(date, 'EEE', { locale: es })}
                                                        </span>
                                                        <span className={cn("relative z-10 text-xl font-black italic", isSelected ? "text-black" : "")}>{format(date, 'd')}</span>
                                                 </motion.button>
                                          )
                                   })}
                            </div>
                     </div>

                     {/* SLOTS LIST */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-4 relative bg-[#0a0a0a]">
                            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <Clock size={12} className="text-primary" /> Turnos Disponibles
                            </h2>

                            <AnimatePresence mode="wait">
                                   {loading ? (
                                          <motion.div
                                                 key="loading"
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="space-y-4"
                                          >
                                                 {[1, 2, 3, 4, 5].map(i => (
                                                        <motion.div
                                                               key={i}
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                                                               className="h-20 bg-[#111] rounded-3xl animate-pulse border border-white/5"
                                                        />
                                                 ))}
                                          </motion.div>
                                   ) : availability.length === 0 ? (
                                          <motion.div
                                                 key="empty"
                                                 initial={{ opacity: 0, scale: 0.95 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="text-center py-20 px-10"
                                          >
                                                 <div className="w-20 h-20 bg-[#111]/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 text-4xl shadow-inner shadow-white/5">😴</div>
                                                 <h3 className="font-bold text-lg mb-2">No hay turnos</h3>
                                                 <p className="text-sm text-muted-foreground">Intentá seleccionando otro día.</p>
                                          </motion.div>
                                   ) : (
                                          <motion.div
                                                 key="loaded"
                                                 initial="hidden"
                                                 animate="show"
                                                 variants={{
                                                        hidden: { opacity: 0 },
                                                        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
                                                 }}
                                                 className="space-y-3"
                                          >
                                                 {availability.map((slot: any) => (
                                                        <motion.div
                                                               key={slot.time}
                                                               variants={{
                                                                      hidden: { opacity: 0, y: 20 },
                                                                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                                                               }}
                                                               className="group bg-[#111] border border-white/5 p-4 sm:p-5 rounded-[1.5rem] flex items-center justify-between hover:border-primary/40 transition-all hover:bg-[#151515] relative overflow-hidden"
                                                        >
                                                               <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                               <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                                                                      <div className="flex flex-col">
                                                                             <span className="text-2xl font-black italic tracking-tighter text-white">{slot.time}</span>
                                                                             <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                                                    {slot.courts.length > 1 ? `${slot.courts.length} CANCHAS` : '1 CANCHA'}
                                                                             </span>
                                                                      </div>
                                                                      <div className="h-10 w-[1px] bg-white/10" />
                                                                      <div className="flex flex-col">
                                                                             <span className="text-xl sm:text-lg font-black text-white/90 leading-none">${slot.price}</span>
                                                                             <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Precio Final</span>
                                                                      </div>
                                                               </div>

                                                               <motion.button
                                                                      whileHover={{ scale: 1.05 }}
                                                                      whileTap={{ scale: 0.95 }}
                                                                      onClick={() => {
                                                                             setSelectedSlot(slot)
                                                                             setValidation({ selectedCourtId: slot.courts[0].id })
                                                                      }}
                                                                      className="bg-primary text-black px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase italic tracking-tighter shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow relative z-10"
                                                               >
                                                                      Reservar
                                                               </motion.button>
                                                        </motion.div>
                                                 ))}
                                          </motion.div>
                                   )}
                            </AnimatePresence>
                     </div>

                     {/* FOOTER */}
                     <footer className="p-8 text-center space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Powered by CourtOps</p>
                     </footer>

                     {/* BOOKING MODAL */}
                     <AnimatePresence>
                            {selectedSlot && (
                                   <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                                          <motion.div
                                                 initial={{ opacity: 0 }}
                                                 animate={{ opacity: 1 }}
                                                 exit={{ opacity: 0 }}
                                                 className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                                 onClick={() => !isSubmitting && setSelectedSlot(null)}
                                          />

                                          <motion.div
                                                 key="booking-modal"
                                                 initial={{ opacity: 0, y: "100%", scale: 0.95 }}
                                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                                 exit={{ opacity: 0, y: "100%", scale: 0.95 }}
                                                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                 className="relative bg-[#0a0a0a] w-full max-w-md sm:rounded-[2.5rem] rounded-t-[2rem] border-t sm:border border-white/10 sm:shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/5"
                                          >
                                                 {/* Decorative Glow */}
                                                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                                                 {!bookingSuccess ? (
                                                        <form onSubmit={handleBooking} className="flex flex-col overflow-hidden relative z-10">
                                                               {/* Modal Header */}
                                                               <div className="p-6 pb-4 flex justify-between items-start border-b border-white/5">
                                                                      <div>
                                                                             <motion.h3
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: 0.1 }}
                                                                                    className="text-2xl font-black italic uppercase tracking-tighter"
                                                                             >
                                                                                    Confirmar Turno
                                                                             </motion.h3>
                                                                             <motion.div
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: 0.15 }}
                                                                                    className="flex items-center gap-2 text-primary font-bold text-sm mt-1"
                                                                             >
                                                                                    <Calendar size={14} />
                                                                                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                                                                                    <Clock size={14} className="ml-2" />
                                                                                    {selectedSlot.time}hs
                                                                             </motion.div>
                                                                      </div>
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => setSelectedSlot(null)}
                                                                             disabled={isSubmitting}
                                                                             className="p-2 bg-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                                                                      >
                                                                             ✕
                                                                      </button>
                                                               </div>

                                                               <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                                                      {/* Court Selection */}
                                                                      {selectedSlot.courts.length > 1 && (
                                                                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
                                                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Selecciona Cancha</label>
                                                                                    <div className="grid grid-cols-2 gap-2">
                                                                                           {selectedSlot.courts.map((c: any) => (
                                                                                                  <button
                                                                                                         key={c.id}
                                                                                                         type="button"
                                                                                                         onClick={() => setValidation({ ...validation, selectedCourtId: c.id })}
                                                                                                         className={cn(
                                                                                                                "p-3 rounded-2xl text-xs font-black uppercase italic border transition-all",
                                                                                                                validation.selectedCourtId === c.id
                                                                                                                       ? "bg-primary border-primary text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                                                                                                       : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                                                                                                         )}
                                                                                                  >
                                                                                                         {c.name}
                                                                                                  </button>
                                                                                           ))}
                                                                                    </div>
                                                                             </motion.div>
                                                                      )}

                                                                      {/* Personal Info */}
                                                                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-1 gap-4">
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1">Tu Nombre Completo</label>
                                                                                    <input
                                                                                           required
                                                                                           className="w-full bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                                                                                           placeholder="Ej: Juan Pérez"
                                                                                           value={formData.name}
                                                                                           onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1">WhatsApp (con código de área)</label>
                                                                                    <input
                                                                                           required
                                                                                           type="tel"
                                                                                           className="w-full bg-[#111] border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/20"
                                                                                           placeholder="Ej: 3511234567"
                                                                                           value={formData.phone}
                                                                                           onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </motion.div>

                                                                      {/* Payment Info */}
                                                                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-primary/5 border border-primary/20 rounded-3xl p-5 space-y-4 shadow-inner shadow-primary/5">
                                                                             <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                           <Landmark size={18} className="text-primary" />
                                                                                           <span className="text-sm font-black uppercase italic text-primary">Detalles de Seña</span>
                                                                                    </div>
                                                                                    <div className="bg-primary text-black text-[10px] px-2 py-0.5 rounded font-black italic">TRANSFERENCIA</div>
                                                                             </div>

                                                                             <div className="space-y-3">
                                                                                    <div className="flex justify-between items-center group cursor-pointer bg-black/20 p-2.5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors" onClick={() => copyToClipboard(club.mpAlias || 'ALFA.PADEL.MP', 'Alias')}>
                                                                                           <span className="text-[10px] font-bold text-muted-foreground uppercase">Alias</span>
                                                                                           <div className="flex items-center gap-2">
                                                                                                  <span className="text-sm font-black text-white">{club.mpAlias || 'ALFA.PADEL.MP'}</span>
                                                                                                  <Copy size={12} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                                           </div>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center group cursor-pointer bg-black/20 p-2.5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors" onClick={() => copyToClipboard(club.mpCvu || '0000003100000000000000', 'CBU/CVU')}>
                                                                                           <span className="text-[10px] font-bold text-muted-foreground uppercase">CBU/CVU</span>
                                                                                           <div className="flex items-center gap-2">
                                                                                                  <span className="text-sm font-black text-white truncate max-w-[140px]">{club.mpCvu || '0000003100000000000000'}</span>
                                                                                                  <Copy size={12} className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                                                                           </div>
                                                                                    </div>
                                                                             </div>

                                                                             <div className="h-[1px] bg-primary/10 w-full" />

                                                                             <div className="flex justify-between items-end">
                                                                                    <div>
                                                                                           <p className="text-[10px] font-bold text-primary uppercase">Costo total: ${selectedSlot.price}</p>
                                                                                           <p className="text-[10px] font-black text-white/50 uppercase mt-1">Seña a transferir:</p>
                                                                                           <p className="text-3xl font-black text-white italic leading-none mt-1 shadow-primary/20 text-shadow-sm">${club.bookingDeposit || '6500'}</p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Saldo en cancha</p>
                                                                                           <p className="text-sm font-bold text-white">${selectedSlot.price - (club.bookingDeposit || 6500)}</p>
                                                                                    </div>
                                                                             </div>
                                                                      </motion.div>

                                                                      {/* Receipt Upload */}
                                                                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-3 pb-4">
                                                                             <div className="flex justify-between items-center pr-1">
                                                                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Adjuntar Comprobante</label>
                                                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] font-black uppercase italic">Requerido</span>
                                                                             </div>
                                                                             <div className="relative group">
                                                                                    <input
                                                                                           required
                                                                                           type="file"
                                                                                           accept="image/*,.pdf"
                                                                                           onChange={e => {
                                                                                                  const file = e.target.files?.[0]
                                                                                                  if (file) {
                                                                                                         const reader = new FileReader()
                                                                                                         reader.onloadend = () => setFormData({ ...formData, receiptFile: reader.result as string })
                                                                                                         reader.readAsDataURL(file)
                                                                                                  }
                                                                                           }}
                                                                                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                                    />
                                                                                    <motion.div
                                                                                           whileHover={{ scale: 1.01 }}
                                                                                           className={cn(
                                                                                                  "w-full h-24 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-300",
                                                                                                  formData.receiptFile ? "border-primary bg-primary/10" : "border-white/10 bg-[#111] group-hover:border-primary/40 group-hover:bg-[#151515]"
                                                                                           )}
                                                                                    >
                                                                                           {formData.receiptFile ? (
                                                                                                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-1.5">
                                                                                                         <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                                                                                <CheckCircle2 size={20} />
                                                                                                         </div>
                                                                                                         <span className="text-primary font-bold text-xs">Cargado con éxito</span>
                                                                                                  </motion.div>
                                                                                           ) : (
                                                                                                  <div className="flex flex-col items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                                                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                                                                                                                <Landmark size={16} />
                                                                                                         </div>
                                                                                                         <span className="text-[10px] font-bold text-white uppercase">Tocar para subir Imagen o PDF</span>
                                                                                                  </div>
                                                                                           )}
                                                                                    </motion.div>
                                                                             </div>
                                                                      </motion.div>
                                                               </div>

                                                               {/* Final Action */}
                                                               <div className="p-5 sm:p-6 bg-[#0a0a0a] border-t border-white/5 space-y-4 relative z-20">
                                                                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] text-blue-400 font-bold leading-tight">
                                                                             <Info size={14} className="flex-shrink-0 mt-0.5" />
                                                                             Tu reserva quedará pendiente hasta que el club verifique el comprobante de pago.
                                                                      </div>
                                                                      <motion.button
                                                                             type="submit"
                                                                             disabled={isSubmitting || !formData.receiptFile}
                                                                             whileHover={{ scale: isSubmitting || !formData.receiptFile ? 1 : 1.02 }}
                                                                             whileTap={{ scale: isSubmitting || !formData.receiptFile ? 1 : 0.98 }}
                                                                             className="w-full relative overflow-hidden bg-primary text-black font-black text-lg py-5 rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] disabled:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-tighter transition-all"
                                                                      >
                                                                             {isSubmitting ? (
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                           <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                                                           Confirmando...
                                                                                    </span>
                                                                             ) : 'Completar Reserva'}
                                                                             {!isSubmitting && formData.receiptFile && (
                                                                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:animate-[shimmer_1.5s_infinite]" />
                                                                             )}
                                                                      </motion.button>
                                                               </div>
                                                        </form>
                                                 ) : (
                                                        <motion.div
                                                               initial={{ opacity: 0, scale: 0.9 }}
                                                               animate={{ opacity: 1, scale: 1 }}
                                                               className="p-8 sm:p-10 text-center flex flex-col items-center relative min-h-[400px] justify-center"
                                                        >
                                                               <div className="absolute inset-0 bg-primary/5 pattern-dots pattern-primary/20 pattern-size-4 pattern-opacity-100" />
                                                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                                                               <motion.div
                                                                      initial={{ scale: 0 }}
                                                                      animate={{ scale: 1 }}
                                                                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                                                      className="relative z-10 w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-4xl mb-8 shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] rotate-3"
                                                               >
                                                                      <CheckCircle2 size={48} className="text-black" />
                                                               </motion.div>
                                                               <motion.h3
                                                                      initial={{ opacity: 0, y: 20 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: 0.3 }}
                                                                      className="relative z-10 text-4xl font-black italic uppercase tracking-tighter mb-4 text-white text-shadow-sm"
                                                               >
                                                                      ¡Excelente!
                                                               </motion.h3>
                                                               <motion.p
                                                                      initial={{ opacity: 0, y: 20 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: 0.4 }}
                                                                      className="relative z-10 text-white/70 text-sm font-medium mb-10 leading-relaxed max-w-[280px]"
                                                               >
                                                                      Enviamos tu soli al club para el <br />
                                                                      <span className="text-white font-black text-lg bg-white/10 px-2 py-0.5 rounded-lg inline-block mt-2">
                                                                             {format(selectedDate, 'dd/MM')} a las {selectedSlot.time}hs
                                                                      </span>
                                                                      <br /><br />
                                                                      Te avisaremos por WhatsApp en breve con la confirmación final.
                                                               </motion.p>
                                                               <motion.div
                                                                      initial={{ opacity: 0, y: 20 }}
                                                                      animate={{ opacity: 1, y: 0 }}
                                                                      transition={{ delay: 0.5 }}
                                                                      className="grid grid-cols-2 gap-3 w-full relative z-10"
                                                               >
                                                                      <button
                                                                             onClick={() => {
                                                                                    setSelectedSlot(null)
                                                                                    setBookingSuccess(false)
                                                                                    setFormData({ name: '', phone: '', receiptFile: '' })
                                                                                    window.location.reload()
                                                                             }}
                                                                             className="flex-1 bg-[#111] border border-white/10 text-white font-black py-4 rounded-2xl text-[10px] sm:text-xs uppercase italic tracking-tighter hover:bg-[#1a1a1a] transition-colors"
                                                                      >
                                                                             Volver
                                                                      </button>
                                                                      <button
                                                                             onClick={() => window.open(`https://wa.me/${club.phone || '5493524421497'}?text=Hola! Acabo de reservar un turno para el ${format(selectedDate, 'dd/MM')} a las ${selectedSlot.time}hs`, '_blank')}
                                                                             className="flex-1 bg-primary text-black font-black py-4 rounded-2xl text-[10px] sm:text-xs uppercase italic tracking-tighter shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:brightness-110 transition-all"
                                                                      >
                                                                             WhatsApp
                                                                      </button>
                                                               </motion.div>
                                                        </motion.div>
                                                 )}
                                          </motion.div>
                                   </div>
                            )}
                     </AnimatePresence>
              </div>
       )
}
