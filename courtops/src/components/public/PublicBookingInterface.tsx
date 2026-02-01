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
              <div className="max-w-md mx-auto min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col shadow-2xl border-x border-white/5">

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
                                   onClick={() => window.open(`https://wa.me/${club.phone || '543512345678'}`, '_blank')}
                                   className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                            >
                                   <MessageCircle size={20} className="text-primary" />
                            </button>
                     </header>

                     {/* DATE PICKER */}
                     <div className="py-6 border-b border-white/5">
                            <div className="flex gap-3 px-6 overflow-x-auto no-scrollbar pb-2">
                                   {dates.map((date) => {
                                          const isSelected = isSameDay(date, selectedDate)
                                          return (
                                                 <button
                                                        key={date.toISOString()}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center min-w-[3.5rem] h-20 rounded-2xl transition-all duration-300 border",
                                                               isSelected
                                                                      ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-110"
                                                                      : "bg-[#111] border-white/5 text-muted-foreground hover:border-white/20"
                                                        )}
                                                 >
                                                        <span className={cn("text-[10px] font-black uppercase tracking-tighter mb-1", isSelected ? "text-black/60" : "text-muted-foreground")}>
                                                               {format(date, 'EEE', { locale: es })}
                                                        </span>
                                                        <span className="text-xl font-black italic">{format(date, 'd')}</span>
                                                 </button>
                                          )
                                   })}
                            </div>
                     </div>

                     {/* SLOTS LIST */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                                   <Clock size={14} /> Turnos Disponibles
                            </h2>

                            {loading ? (
                                   <div className="space-y-4">
                                          {[1, 2, 3, 4, 5].map(i => (
                                                 <div key={i} className="h-20 bg-[#111] rounded-3xl animate-pulse border border-white/5" />
                                          ))}
                                   </div>
                            ) : availability.length === 0 ? (
                                   <div className="text-center py-20 px-10">
                                          <div className="w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 text-4xl">😴</div>
                                          <h3 className="font-bold text-lg mb-2">No hay turnos disponibles</h3>
                                          <p className="text-sm text-muted-foreground">Probá seleccionando otro día para ver más opciones.</p>
                                   </div>
                            ) : (
                                   availability.map((slot: any) => (
                                          <div key={slot.time} className="group bg-[#111] border border-white/5 p-5 rounded-3xl flex items-center justify-between hover:border-primary/40 transition-all active:scale-[0.98]">
                                                 <div className="flex items-center gap-5">
                                                        <div className="flex flex-col">
                                                               <span className="text-2xl font-black italic tracking-tighter text-white">{slot.time}</span>
                                                               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                                                      {slot.courts.length > 1 ? `${slot.courts.length} CANCHAS` : '1 CANCHA'}
                                                               </span>
                                                        </div>
                                                        <div className="h-10 w-[1px] bg-white/10" />
                                                        <div className="flex flex-col">
                                                               <span className="text-lg font-black text-white/90 leading-none">${slot.price}</span>
                                                               <span className="text-[10px] font-bold text-muted-foreground uppercase">Precio Final</span>
                                                        </div>
                                                 </div>

                                                 <button
                                                        onClick={() => {
                                                               setSelectedSlot(slot)
                                                               setValidation({ selectedCourtId: slot.courts[0].id })
                                                        }}
                                                        className="bg-primary text-black px-6 py-3 rounded-2xl font-black text-sm uppercase italic tracking-tighter shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                                 >
                                                        Reservar
                                                 </button>
                                          </div>
                                   ))
                            )}
                     </div>

                     {/* FOOTER */}
                     <footer className="p-8 text-center space-y-4">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Powered by CourtOps</p>
                     </footer>

                     {/* BOOKING MODAL */}
                     {selectedSlot && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                                   <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setSelectedSlot(null)} />

                                   <div className="relative bg-[#111] w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                                          {!bookingSuccess ? (
                                                 <form onSubmit={handleBooking} className="flex flex-col overflow-hidden">
                                                        {/* Modal Header */}
                                                        <div className="p-6 pb-0 flex justify-between items-start">
                                                               <div>
                                                                      <h3 className="text-2xl font-black italic uppercase tracking-tighter">Confirmar Turno</h3>
                                                                      <div className="flex items-center gap-2 text-primary font-bold text-sm mt-1">
                                                                             <Calendar size={14} />
                                                                             {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                                                                             <Clock size={14} className="ml-2" />
                                                                             {selectedSlot.time}hs
                                                                      </div>
                                                               </div>
                                                               <button
                                                                      type="button"
                                                                      onClick={() => setSelectedSlot(null)}
                                                                      disabled={isSubmitting}
                                                                      className="p-2 bg-white/5 rounded-full text-muted-foreground hover:text-white"
                                                               >
                                                                      ✕
                                                               </button>
                                                        </div>

                                                        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                                               {/* Court Selection */}
                                                               {selectedSlot.courts.length > 1 && (
                                                                      <div className="space-y-3">
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
                                                                                                                ? "bg-primary border-primary text-black"
                                                                                                                : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                                                                                                  )}
                                                                                           >
                                                                                                  {c.name}
                                                                                           </button>
                                                                                    ))}
                                                                             </div>
                                                                      </div>
                                                               )}

                                                               {/* Personal Info */}
                                                               <div className="grid grid-cols-1 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Tu Nombre Completo</label>
                                                                             <input
                                                                                    required
                                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all placeholder:text-white/10"
                                                                                    placeholder="Ej: Juan Pérez"
                                                                                    value={formData.name}
                                                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                                             />
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">WhatsApp (con código de área)</label>
                                                                             <input
                                                                                    required
                                                                                    type="tel"
                                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all placeholder:text-white/10"
                                                                                    placeholder="Ej: 3511234567"
                                                                                    value={formData.phone}
                                                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>

                                                               {/* Payment Info */}
                                                               <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 space-y-4">
                                                                      <div className="flex items-center justify-between">
                                                                             <div className="flex items-center gap-2">
                                                                                    <Landmark size={18} className="text-primary" />
                                                                                    <span className="text-sm font-black uppercase italic text-primary">Detalles de Seña</span>
                                                                             </div>
                                                                             <div className="bg-primary text-black text-[10px] px-2 py-0.5 rounded font-black italic">TRANSFERENCIA</div>
                                                                      </div>

                                                                      <div className="space-y-3">
                                                                             <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(club.mpAlias || 'ALFA.PADEL.MP', 'Alias')}>
                                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Alias:</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                           <span className="text-sm font-black text-white">{club.mpAlias || 'ALFA.PADEL.MP'}</span>
                                                                                           <Copy size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                    </div>
                                                                             </div>
                                                                             <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(club.mpCvu || '0000003100000000000000', 'CBU/CVU')}>
                                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CBU/CVU:</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                           <span className="text-sm font-black text-white truncate max-w-[150px]">{club.mpCvu || '0000003100000000000000'}</span>
                                                                                           <Copy size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                                    </div>
                                                                             </div>
                                                                      </div>

                                                                      <div className="h-[1px] bg-primary/10 w-full" />

                                                                      <div className="flex justify-between items-end">
                                                                             <div>
                                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">A transferir ahora para reservar:</p>
                                                                                    <p className="text-2xl font-black text-primary italic leading-none mt-1">${club.bookingDeposit || '6500'}</p>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Saldo en cancha:</p>
                                                                                    <p className="text-sm font-bold text-white">${selectedSlot.price - (club.bookingDeposit || 6500)}</p>
                                                                             </div>
                                                                      </div>
                                                               </div>

                                                               {/* Receipt Upload */}
                                                               <div className="space-y-3">
                                                                      <div className="flex justify-between items-center pr-1">
                                                                             <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Adjuntar Comprobante</label>
                                                                             <span className="text-primary font-bold text-[10px] uppercase">Requerido</span>
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
                                                                             <div className={cn(
                                                                                    "w-full h-24 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all",
                                                                                    formData.receiptFile ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 group-hover:border-white/20"
                                                                             )}>
                                                                                    {formData.receiptFile ? (
                                                                                           <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                                                                                  <CheckCircle2 size={18} /> Archivo Cargado
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div className="flex flex-col items-center gap-1">
                                                                                                  <Landmark size={20} className="text-muted-foreground mb-1" />
                                                                                                  <span className="text-xs font-bold text-muted-foreground uppercase">Subir Imagen o PDF</span>
                                                                                           </div>
                                                                                    )}
                                                                             </div>
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Final Action */}
                                                        <div className="p-6 bg-[#181818] border-t border-white/5 space-y-4">
                                                               <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-2xl text-[10px] text-blue-400 font-bold leading-tight">
                                                                      <Info size={14} className="flex-shrink-0" />
                                                                      Tu reserva quedará pendiente hasta que el club verifique el comprobante de pago.
                                                               </div>
                                                               <button
                                                                      type="submit"
                                                                      disabled={isSubmitting || !formData.receiptFile}
                                                                      className="w-full bg-primary text-black font-black text-lg py-5 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase italic tracking-tighter"
                                                               >
                                                                      {isSubmitting ? 'Confirmando...' : 'Finalizar y Reservar'}
                                                               </button>
                                                        </div>
                                                 </form>
                                          ) : (
                                                 <div className="p-10 text-center flex flex-col items-center">
                                                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl mb-8 shadow-2xl shadow-primary/30 animate-in zoom-in duration-500">
                                                               <CheckCircle2 size={48} className="text-black" />
                                                        </div>
                                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">¡Turno Solicitado!</h3>
                                                        <p className="text-muted-foreground text-sm font-medium mb-10 leading-relaxed">
                                                               Hemos enviado tu solicitud al club para el <span className="text-white font-bold">{format(selectedDate, 'dd/MM')} a las {selectedSlot.time}hs</span>. <br /><br />
                                                               Te notificaremos por WhatsApp una vez confirmado.
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-3 w-full">
                                                               <button
                                                                      onClick={() => {
                                                                             setSelectedSlot(null)
                                                                             setBookingSuccess(false)
                                                                             setFormData({ name: '', phone: '', receiptFile: '' })
                                                                             window.location.reload()
                                                                      }}
                                                                      className="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl text-xs uppercase italic tracking-tighter hover:bg-white/10 transition-colors"
                                                               >
                                                                      Volver al Inicio
                                                               </button>
                                                               <button
                                                                      onClick={() => window.open(`https://wa.me/${club.phone || '543512345678'}?text=Hola! Acabo de reservar un turno para el ${format(selectedDate, 'dd/MM')} a las ${selectedSlot.time}hs`, '_blank')}
                                                                      className="flex-1 bg-primary text-black font-black py-4 rounded-2xl text-xs uppercase italic tracking-tighter shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                                                               >
                                                                      Hablar con Club
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}
                                   </div>
                            </div>
                     )}
              </div>
       )
}
