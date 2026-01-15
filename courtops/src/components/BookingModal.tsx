'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createBooking } from '@/actions/createBooking'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { MessagingService } from '@/lib/messaging'
import { Check, MessageCircle } from 'lucide-react'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string }[]
}

export default function BookingModal({ isOpen, onClose, onSuccess, initialDate, initialTime, initialCourtId, courts, inline = false }: Props) {
       const [formData, setFormData] = useState({
              name: '',
              phone: '',
              email: '',
              time: initialTime || '14:00',
              courtId: initialCourtId || (courts[0]?.id || 0),
              notes: '',
              isMember: false,
              isRecurring: false,
              recurringEndDate: '',
              paymentType: 'none' as 'none' | 'full' | 'partial',
              depositAmount: ''
       })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [error, setError] = useState('')

       // Search
       const [searchResults, setSearchResults] = useState<any[]>([])
       const [showSuggestions, setShowSuggestions] = useState(false)

       const [successData, setSuccessData] = useState<any>(null)

       useEffect(() => {
              if (isOpen) {
                     setSuccessData(null) // Reset success state
                     setFormData(prev => ({
                            ...prev,
                            time: initialTime || '14:00',
                            courtId: initialCourtId || (courts[0]?.id || 0),
                            // Reset payment fields on open
                            paymentType: 'none',
                            depositAmount: ''
                     }))
              }
       }, [isOpen, initialTime, initialCourtId, courts])

       if (!isOpen) return null

       // Fixed time slots (1.5h duration) - CUSTOM RULES
       const timeOptions = [
              '14:00',
              '15:30',
              '17:00',
              '18:30',
              '20:00',
              '21:30',
              '23:00'
       ]

       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              setError('')

              try {
                     const [hours, minutes] = formData.time.split(':').map(Number)
                     const startDate = new Date(initialDate)
                     startDate.setHours(hours, minutes, 0, 0)

                     let paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' = 'UNPAID'
                     if (formData.paymentType === 'full') paymentStatus = 'PAID'
                     if (formData.paymentType === 'partial') paymentStatus = 'PARTIAL'

                     const res = await createBooking({
                            clientName: formData.name,
                            clientPhone: formData.phone,
                            clientEmail: formData.email || undefined,
                            courtId: Number(formData.courtId),
                            startTime: startDate,
                            paymentStatus: paymentStatus,
                            advancePaymentAmount: formData.paymentType === 'partial' ? Number(formData.depositAmount) : undefined,
                            notes: formData.notes,
                            isMember: formData.isMember,
                            recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined
                     })

                     if (res.success && res.booking) {
                            // Don't close immediately, show success screen
                            setSuccessData({
                                   booking: res.booking,
                                   client: res.client,
                                   // Create a temporary adapted booking object for the message generator
                                   adaptedBooking: {
                                          schedule: {
                                                 startTime: res.booking.startTime,
                                                 courtName: courts.find(c => c.id === res.booking?.courtId)?.name || 'Cancha'
                                          }
                                   }
                            })
                            onSuccess() // Refresh parent
                     } else {
                            setError(res.error as string || 'Error desconocido')
                     }
              } catch (err) {
                     setError('Error al crear reserva. Intente de nuevo.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       // Success View
       if (successData) {
              const SuccessContent = (
                     <div className={cn(
                            "bg-[#1A1D24] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200",
                            inline ? "border-none shadow-none bg-transparent" : " "
                     )}>
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                   <Check className="w-10 h-10 stroke-[3px]" />
                            </div>

                            <h2 className="text-2xl font-black text-white mb-2">¡Reserva Creada!</h2>
                            <p className="text-slate-400 text-sm font-medium mb-8">
                                   El turno ha sido agendado correctamente.
                            </p>

                            <div className="space-y-3 w-full">
                                   <button
                                          onClick={() => {
                                                 const phone = successData.client?.phone
                                                 if (phone) {
                                                        const text = MessagingService.generateBookingMessage(successData.adaptedBooking, 'new_booking')
                                                        const url = MessagingService.getWhatsAppUrl(phone, text)
                                                        window.open(url, '_blank')
                                                 }
                                          }}
                                          className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                                   >
                                          <MessageCircle className="w-5 h-5 fill-current" />
                                          ENVIAR POR WHATSAPP
                                   </button>

                                   <button
                                          onClick={onClose}
                                          className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                   >
                                          Cerrar
                                   </button>
                            </div>
                     </div>
              )

              if (inline) {
                     return (
                            <div className="w-full h-full flex items-center justify-center bg-[#1A1D24] rounded-3xl border border-white/5">
                                   {SuccessContent}
                            </div>
                     )
              }

              return (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                            {SuccessContent}
                     </div>
              )
       }

       const ModalContent = (
              <div className={cn(
                     "bg-[#1A1D23] border border-white/5 w-full overflow-hidden flex flex-col h-full",
                     inline ? "rounded-3xl shadow-none border-none bg-transparent" : "max-w-lg sm:rounded-3xl shadow-2xl sm:h-auto max-h-[100vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
              )}>

                     {/* Header */}
                     <div className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
                            <div>
                                   <div className="flex items-center gap-2 mb-1">
                                          <span className="w-3 h-3 bg-[var(--color-primary)] rounded-full animate-pulse"></span>
                                          <h1 className="text-2xl font-bold text-white">Nueva Reserva</h1>
                                   </div>
                                   <div className="inline-block px-3 py-1 bg-[#242830] rounded-full mt-1">
                                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                 {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                          </p>
                                   </div>
                            </div>
                            <button
                                   onClick={onClose}
                                   className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                            >
                                   <span className="material-icons-round">close</span>
                            </button>
                     </div>

                     <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-4 space-y-6 custom-scrollbar">

                            {error && (
                                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-in slide-in-from-top-2 duration-300 flex items-center gap-3">
                                          <span className="material-icons-round text-lg">error_outline</span>
                                          {error}
                                   </div>
                            )}

                            {/* Time & Court Selection - Styled to match inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Horario</label>
                                          <div className="relative group">
                                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="material-icons-round text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">schedule</span>
                                                 </div>
                                                 <select
                                                        className="block w-full pl-12 pr-10 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all appearance-none outline-none font-medium cursor-pointer"
                                                        value={formData.time}
                                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                 >
                                                        {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                 </select>
                                                 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <span className="material-icons-round text-gray-500">expand_more</span>
                                                 </div>
                                          </div>
                                   </div>
                                   <div className="space-y-2">
                                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cancha</label>
                                          <div className="relative group">
                                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="material-icons-round text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">sports_tennis</span>
                                                 </div>
                                                 <select
                                                        className="block w-full pl-12 pr-10 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all appearance-none outline-none font-medium cursor-pointer"
                                                        value={formData.courtId}
                                                        onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                 >
                                                        {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                 </select>
                                                 <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                        <span className="material-icons-round text-gray-500">expand_more</span>
                                                 </div>
                                          </div>
                                   </div>
                            </div>

                            {/* Client Info */}
                            <div className="space-y-2 relative">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre del Cliente</label>
                                   <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                 <span className="material-icons-round text-gray-400 text-xl group-focus-within:text-[var(--color-primary)] transition-colors">person</span>
                                          </div>
                                          <input
                                                 required
                                                 type="text"
                                                 className="block w-full pl-12 pr-4 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all placeholder-gray-600 outline-none font-medium"
                                                 placeholder="Escribe el nombre..."
                                                 value={formData.name}
                                                 onChange={async (e) => {
                                                        const val = e.target.value
                                                        setFormData({ ...formData, name: val })
                                                        if (val.length > 2) {
                                                               const res = await getClients(val)
                                                               setSearchResults(res)
                                                               setShowSuggestions(true)
                                                        } else {
                                                               setShowSuggestions(false)
                                                        }
                                                 }}
                                                 onFocus={() => { if (formData.name.length > 2) setShowSuggestions(true) }}
                                                 onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                          />

                                          {/* Suggestions Dropdown */}
                                          {showSuggestions && searchResults.length > 0 && (
                                                 <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D23] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                                        {searchResults.map((client: any) => (
                                                               <button
                                                                      key={client.id}
                                                                      type="button"
                                                                      onClick={() => {
                                                                             setFormData({
                                                                                    ...formData,
                                                                                    name: client.name,
                                                                                    phone: client.phone || '',
                                                                                    email: client.email || '',
                                                                                    notes: client.notes || formData.notes
                                                                             })
                                                                             setShowSuggestions(false)
                                                                      }}
                                                                      className="w-full text-left p-3 hover:bg-white/5 flex flex-col gap-0.5 border-b border-white/5 last:border-0"
                                                               >
                                                                      <span className="text-sm font-bold text-white">{client.name}</span>
                                                                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                                             {client.phone && <span>{client.phone}</span>}
                                                                      </div>
                                                               </button>
                                                        ))}
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            <div className="space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono / WhatsApp</label>
                                   <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                 <span className="material-icons-round text-gray-400 text-xl group-focus-within:text-[var(--color-primary)] transition-colors">smartphone</span>
                                          </div>
                                          <input
                                                 required
                                                 type="tel"
                                                 className="block w-full pl-12 pr-4 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all placeholder-gray-600 outline-none font-mono"
                                                 placeholder="351 1234567"
                                                 value={formData.phone}
                                                 onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                          />
                                   </div>
                            </div>

                            <div className="space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email <span className="text-gray-500 font-normal capitalize">(Opcional)</span></label>
                                   <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                 <span className="material-icons-round text-gray-400 text-xl group-focus-within:text-[var(--color-primary)] transition-colors">alternate_email</span>
                                          </div>
                                          <input
                                                 type="email"
                                                 className="block w-full pl-12 pr-4 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all placeholder-gray-600 outline-none"
                                                 placeholder="cliente@ejemplo.com"
                                                 value={formData.email}
                                                 onChange={e => setFormData({ ...formData, email: e.target.value })}
                                          />
                                   </div>
                            </div>

                            <div className="space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notas / Pedidos Especiales</label>
                                   <textarea
                                          className="block w-full px-4 py-4 bg-[#242830] border-transparent focus:border-[var(--color-primary)] focus:ring-0 text-white rounded-2xl transition-all resize-none placeholder-gray-600 outline-none custom-scrollbar"
                                          placeholder="Jugadores traen sus paletas, requiere pelotas nuevas..."
                                          rows={3}
                                          value={formData.notes}
                                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                   />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-3 pt-2">
                                   {/* Member Toggle */}
                                   <div className="flex items-center justify-between p-4 bg-[#242830] rounded-2xl cursor-pointer hover:bg-[#2A2E36] transition-colors" onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}>
                                          <div>
                                                 <p className="text-sm font-bold text-white">¿ES SOCIO?</p>
                                                 <p className="text-xs text-gray-400">Aplica tarifa preferencial si existe</p>
                                          </div>
                                          <div className={cn(
                                                 "w-11 h-6 rounded-full transition-colors relative flex items-center px-[2px]",
                                                 formData.isMember ? "bg-[var(--color-primary)]" : "bg-gray-700"
                                          )}>
                                                 <span className={cn(
                                                        "w-5 h-5 bg-white rounded-full shadow-md transition-all",
                                                        formData.isMember ? "translate-x-full border-white" : "translate-x-0"
                                                 )} />
                                          </div>
                                   </div>

                                   {/* Recurring Toggle */}
                                   <div className="flex items-center justify-between p-4 bg-[#242830] rounded-2xl cursor-pointer hover:bg-[#2A2E36] transition-colors" onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}>
                                          <div>
                                                 <p className="text-sm font-bold text-white">TURNO FIJO</p>
                                                 <p className="text-xs text-gray-400">Repetir esta reserva semanalmente</p>
                                          </div>
                                          <div className={cn(
                                                 "w-11 h-6 rounded-full transition-colors relative flex items-center px-[2px]",
                                                 formData.isRecurring ? "bg-[var(--color-accent-blue)]" : "bg-gray-700"
                                          )}>
                                                 <span className={cn(
                                                        "w-5 h-5 bg-white rounded-full shadow-md transition-all",
                                                        formData.isRecurring ? "translate-x-full" : "translate-x-0"
                                                 )} />
                                          </div>
                                   </div>

                                   {/* Recurring Date Input */}
                                   {formData.isRecurring && (
                                          <div className="p-4 bg-[var(--color-accent-blue)]/10 rounded-2xl border border-[var(--color-accent-blue)]/20 animate-in slide-in-from-top-2">
                                                 <label className="text-[10px] font-bold text-[var(--color-accent-blue)] uppercase tracking-widest ml-1 mb-2 block">Fecha de Fin</label>
                                                 <input
                                                        type="date"
                                                        required={formData.isRecurring}
                                                        className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-3 text-white font-medium outline-none focus:border-[var(--color-accent-blue)] transition-all"
                                                        value={formData.recurringEndDate || ''}
                                                        onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                 />
                                          </div>
                                   )}
                            </div>

                            {/* Payment Section - Kept simple to match aesthetic */}
                            <div className="pt-2 space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pago / Seña</label>
                                   <div className="grid grid-cols-3 gap-2">
                                          <button
                                                 type="button"
                                                 onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                 className={cn(
                                                        "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                        formData.paymentType === 'none'
                                                               ? "bg-white/10 border-white/20 text-white"
                                                               : "bg-[#242830] border-transparent text-gray-500 hover:text-gray-300"
                                                 )}
                                          >
                                                 Sin Pago
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => setFormData({ ...formData, paymentType: 'full', depositAmount: '' })}
                                                 className={cn(
                                                        "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                        formData.paymentType === 'full'
                                                               ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                                                               : "bg-[#242830] border-transparent text-gray-500 hover:text-gray-300"
                                                 )}
                                          >
                                                 Total
                                          </button>
                                          <button
                                                 type="button"
                                                 onClick={() => setFormData({ ...formData, paymentType: 'partial' })}
                                                 className={cn(
                                                        "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                        formData.paymentType === 'partial'
                                                               ? "bg-orange-500/20 border-orange-500 text-orange-500"
                                                               : "bg-[#242830] border-transparent text-gray-500 hover:text-gray-300"
                                                 )}
                                          >
                                                 Seña
                                          </button>
                                   </div>

                                   {/* Partial Amount */}
                                   {formData.paymentType === 'partial' && (
                                          <div className="relative group animate-in slide-in-from-top-2">
                                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <span className="text-orange-500 font-bold">$</span>
                                                 </div>
                                                 <input
                                                        type="number"
                                                        min="1"
                                                        step="100"
                                                        className="block w-full pl-8 pr-4 py-4 bg-[#242830] border-transparent focus:border-orange-500 focus:ring-0 text-white rounded-2xl transition-all placeholder-gray-600 outline-none font-mono font-bold"
                                                        placeholder="Monto..."
                                                        value={formData.depositAmount}
                                                        onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                 />
                                          </div>
                                   )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 pb-4">
                                   <button
                                          type="button"
                                          onClick={onClose}
                                          disabled={isSubmitting}
                                          className="flex-1 py-4 bg-gray-800 text-gray-300 font-bold rounded-2xl hover:bg-gray-700 transition-colors uppercase tracking-wider text-xs"
                                   >
                                          Cancelar
                                   </button>
                                   <button
                                          type="submit"
                                          disabled={isSubmitting}
                                          className="flex-[1.5] py-4 bg-[var(--color-accent-blue)] text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-[var(--color-accent-blue)]/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50"
                                   >
                                          <span className="material-icons-round text-lg">check_circle</span>
                                          {isSubmitting ? 'Guardando...' : 'Confirmar'}
                                   </button>
                            </div>

                     </form>

                     {isSubmitting && (
                            <div className="absolute inset-0 z-[100] bg-[#0F1115]/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                                   <div className="relative">
                                          <div className="w-12 h-12 border-4 border-[var(--color-accent-blue)]/30 border-t-[var(--color-accent-blue)] rounded-full animate-spin" />
                                   </div>
                            </div>
                     )}
              </div>
       )

       if (inline) {
              return ModalContent
       }

       return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
                     {ModalContent}
              </div>
       )
}
