'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createBooking } from '@/actions/createBooking'
import { getClients } from '@/actions/clients'
import { cn } from '@/lib/utils'
import { MessagingService } from '@/lib/messaging'
import { Check, MessageCircle } from 'lucide-react'
import { createPortal } from 'react-dom'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string }[]
}

export default function BookingModal({ isOpen, onClose, onSuccess, initialDate, initialTime, initialCourtId, courts }: Props) {
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
              paymentType: 'none' as 'none' | 'full' | 'partial' | 'split',
              depositAmount: '',
              payments: [] as { method: string, amount: number }[]
       })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [error, setError] = useState('')

       // Search
       const [searchResults, setSearchResults] = useState<any[]>([])
       const [showSuggestions, setShowSuggestions] = useState(false)

       const [mounted, setMounted] = useState(false)
       const [successData, setSuccessData] = useState<any>(null)

       useEffect(() => {
              setMounted(true)
              return () => setMounted(false)
       }, [])

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
       if (!mounted) return null

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
                            recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
                            payments: formData.paymentType === 'split' ? formData.payments : undefined
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
              return createPortal(
                     <div className="fixed inset-0 z-[60] bg-black/95 sm:bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 text-gray-100 font-sans">
                            <div className="bg-[#1e1e1e] border border-[#3f3f46] w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                                   <div className="w-20 h-20 bg-[#a3e635]/20 rounded-full flex items-center justify-center text-[#a3e635] mb-6 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                                          <Check className="w-10 h-10 stroke-[3px]" />
                                   </div>

                                   <h2 className="text-2xl font-black text-white mb-2">¡Reserva Creada!</h2>
                                   <p className="text-gray-400 text-sm font-medium mb-8">
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
                                                 className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                                          >
                                                 <MessageCircle className="w-5 h-5 fill-current" />
                                                 ENVIAR POR WHATSAPP
                                          </button>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full h-14 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                          >
                                                 Cerrar
                                          </button>
                                   </div>
                            </div>
                     </div>,
                     document.body
              )
       }

       return createPortal(
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 text-gray-100 font-sans">
                     <div className="w-full max-w-lg bg-[#1e1e1e] rounded-2xl shadow-2xl border border-[#3f3f46] flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

                            {/* Header */}
                            <div className="px-6 py-5 border-b border-[#3f3f46] flex items-center justify-between bg-[#252525]">
                                   <div className="flex items-center space-x-3">
                                          <div className="w-2.5 h-2.5 rounded-full bg-[#a3e635] animate-pulse"></div>
                                          <div>
                                                 <h2 className="text-xl font-bold text-white leading-none">Nueva Reserva</h2>
                                                 <span className="text-xs font-medium text-gray-400 mt-1 block uppercase tracking-wider bg-[#2d2d2d] px-2 py-0.5 rounded inline-block">
                                                        {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                                 </span>
                                          </div>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                                   >
                                          <span className="material-icons">close</span>
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6">

                                   {error && (
                                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-3">
                                                 <span className="material-icons text-lg">error_outline</span>
                                                 {error}
                                          </div>
                                   )}

                                   {/* Time & Court Grid */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Horario</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#a3e635]">schedule</span>
                                                        </div>
                                                        <select
                                                               className="block w-full pl-10 pr-10 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent appearance-none text-white transition-shadow cursor-pointer outline-none"
                                                               value={formData.time}
                                                               onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                        >
                                                               {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                               <span className="material-icons text-gray-400">expand_more</span>
                                                        </div>
                                                 </div>
                                          </div>
                                          <div className="space-y-2">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Cancha</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#a3e635]">sports_tennis</span>
                                                        </div>
                                                        <select
                                                               className="block w-full pl-10 pr-10 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent appearance-none text-white transition-shadow cursor-pointer outline-none"
                                                               value={formData.courtId}
                                                               onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                        >
                                                               {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                               <span className="material-icons text-gray-400">expand_more</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Client Name */}
                                   <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre del Cliente</label>
                                          <div className="relative group">
                                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#a3e635]">person</span>
                                                 </div>
                                                 <input
                                                        required
                                                        type="text"
                                                        className="block w-full pl-10 pr-4 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent text-white placeholder-gray-500 transition-shadow outline-none"
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

                                                 {/* Suggestions Overlay */}
                                                 {showSuggestions && searchResults.length > 0 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#252525] border border-[#3f3f46] rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
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
                                                                             className="w-full text-left p-3 hover:bg-[#333] flex flex-col gap-0.5 border-b border-[#3f3f46] last:border-0"
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

                                   {/* Phone & Email Grid */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Teléfono / WhatsApp</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#a3e635]">smartphone</span>
                                                        </div>
                                                        <input
                                                               required
                                                               type="tel"
                                                               className="block w-full pl-10 pr-4 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent text-white placeholder-gray-500 transition-shadow outline-none"
                                                               placeholder="351 1234567"
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                 </div>
                                          </div>
                                          <div className="space-y-2">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Email <span className="normal-case font-normal text-gray-500">(Opcional)</span></label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-gray-400 group-focus-within:text-[#a3e635]">alternate_email</span>
                                                        </div>
                                                        <input
                                                               type="email"
                                                               className="block w-full pl-10 pr-4 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent text-white placeholder-gray-500 transition-shadow outline-none"
                                                               placeholder="cliente@ejemplo.com"
                                                               value={formData.email}
                                                               onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Notes */}
                                   <div className="space-y-2">
                                          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Notas / Pedidos Especiales</label>
                                          <textarea
                                                 className="block w-full px-4 py-3 text-sm bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-[#a3e635] focus:border-transparent text-white placeholder-gray-500 resize-none transition-shadow outline-none custom-scrollbar"
                                                 placeholder="Jugadores traen sus paletas, requiere pelotas nuevas..."
                                                 rows={3}
                                                 value={formData.notes}
                                                 onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                          />
                                   </div>

                                   {/* Switches */}
                                   <div className="space-y-3 pt-2">
                                          {/* Member Switch */}
                                          <div className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-xl border border-transparent hover:border-gray-600 transition-colors group">
                                                 <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                                               <span className="material-icons-outlined text-base text-gray-400 group-hover:text-[#a3e635] transition-colors">verified</span>
                                                               ¿Es Socio?
                                                        </span>
                                                        <span className="text-xs text-gray-400 mt-0.5">Aplica tarifa preferencial si existe</span>
                                                 </div>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                               type="checkbox"
                                                               className="sr-only peer"
                                                               checked={formData.isMember}
                                                               onChange={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a3e635]"></div>
                                                 </label>
                                          </div>

                                          {/* Recurring Switch */}
                                          <div className="flex items-center justify-between p-4 bg-[#2d2d2d] rounded-xl border border-transparent hover:border-gray-600 transition-colors group">
                                                 <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                                               <span className="material-icons-outlined text-base text-gray-400 group-hover:text-[#a3e635] transition-colors">event_repeat</span>
                                                               Turno Fijo
                                                        </span>
                                                        <span className="text-xs text-gray-400 mt-0.5">Repetir esta reserva semanalmente</span>
                                                 </div>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                               type="checkbox"
                                                               className="sr-only peer"
                                                               checked={formData.isRecurring}
                                                               onChange={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a3e635]"></div>
                                                 </label>
                                          </div>

                                          {/* Recurring Date (Conditional) */}
                                          {formData.isRecurring && (
                                                 <div className="p-4 bg-[#a3e635]/10 rounded-xl border border-[#a3e635]/20 animate-in slide-in-from-top-2">
                                                        <label className="text-[10px] font-bold text-[#a3e635] uppercase tracking-widest ml-1 mb-2 block">Fecha de Fin</label>
                                                        <input
                                                               type="date"
                                                               required={formData.isRecurring}
                                                               className="w-full bg-[#1e1e1e] border border-[#3f3f46] rounded-lg p-3 text-white font-medium outline-none focus:border-[#a3e635] transition-all"
                                                               value={formData.recurringEndDate || ''}
                                                               onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                               min={new Date().toISOString().split('T')[0]}
                                                        />
                                                 </div>
                                          )}
                                   </div>

                                   {/* Payment Section - Legacy + Split */}
                                   <div className="pt-2 space-y-2">
                                          <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Pagos</label>
                                                 <div className="flex bg-[#2d2d2d] rounded-lg p-0.5">
                                                        <button
                                                               type="button"
                                                               onClick={() => setFormData(prev => ({ ...prev, paymentType: 'none', payments: [] }))}
                                                               className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all", formData.paymentType !== 'split' ? "bg-[#3f3f46] text-white shadow" : "text-gray-500 hover:text-gray-300")}
                                                        >
                                                               Simple
                                                        </button>
                                                        <button
                                                               type="button"
                                                               onClick={() => setFormData(prev => ({ ...prev, paymentType: 'split' }))}
                                                               className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all flex items-center gap-1", formData.paymentType === 'split' ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-300")}
                                                        >
                                                               <span className="material-icons text-[12px]">call_split</span>
                                                               Dividir
                                                        </button>
                                                 </div>
                                          </div>

                                          {formData.paymentType !== 'split' ? (
                                                 <div className="space-y-2">
                                                        <div className="grid grid-cols-3 gap-2">
                                                               <button
                                                                      type="button"
                                                                      onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                                      className={cn(
                                                                             "p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                                             formData.paymentType === 'none'
                                                                                    ? "bg-white/10 border-white/20 text-white"
                                                                                    : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
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
                                                                                    : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
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
                                                                                    : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
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
                                                                             className="block w-full pl-8 pr-4 py-3 bg-[#2d2d2d] border border-[#3f3f46] rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white font-mono font-bold outline-none transition-shadow"
                                                                             placeholder="Monto..."
                                                                             value={formData.depositAmount}
                                                                             onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                                      />
                                                               </div>
                                                        )}
                                                 </div>
                                          ) : (
                                                 <div className="space-y-3 bg-[#2d2d2d] p-4 rounded-xl border border-[#3f3f46]">
                                                        <div className="flex flex-col gap-2">
                                                               {formData.payments.map((p, idx) => (
                                                                      <div key={idx} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                                                                             <div className="flex-1 bg-[#1e1e1e] rounded-lg px-3 py-2 border border-[#3f3f46] text-sm text-gray-300 flex justify-between items-center">
                                                                                    <span className="uppercase font-bold text-[10px] bg-white/5 px-2 py-0.5 rounded">{p.method}</span>
                                                                                    <span className="font-mono font-bold text-white">${p.amount}</span>
                                                                             </div>
                                                                             <button
                                                                                    type="button"
                                                                                    onClick={() => setFormData(prev => ({ ...prev, payments: prev.payments.filter((_, i) => i !== idx) }))}
                                                                                    className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                                                                             >
                                                                                    <span className="material-icons text-lg">close</span>
                                                                             </button>
                                                                      </div>
                                                               ))}
                                                               {formData.payments.length === 0 && (
                                                                      <div className="text-center py-4 text-gray-500 text-xs italic">
                                                                             No hay pagos registrados
                                                                      </div>
                                                               )}
                                                        </div>

                                                        <div className="flex gap-2 border-t border-white/5 pt-3">
                                                               <select
                                                                      id="split-method"
                                                                      className="bg-[#1e1e1e] border border-[#3f3f46] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 w-1/3"
                                                               >
                                                                      <option value="CASH">Efectivo</option>
                                                                      <option value="MERCADOPAGO">MercadoPago</option>
                                                                      <option value="DEBIT">Débito</option>
                                                                      <option value="CREDIT">Crédito</option>
                                                                      <option value="TRANSFER">Transferencia</option>
                                                               </select>
                                                               <input
                                                                      id="split-amount"
                                                                      type="number"
                                                                      placeholder="Monto"
                                                                      className="bg-[#1e1e1e] border border-[#3f3f46] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500 flex-1 font-mono"
                                                               />
                                                               <button
                                                                      type="button"
                                                                      onClick={() => {
                                                                             const methodEl = document.getElementById('split-method') as HTMLSelectElement
                                                                             const amountEl = document.getElementById('split-amount') as HTMLInputElement
                                                                             const amount = parseFloat(amountEl.value)
                                                                             if (amount > 0) {
                                                                                    setFormData(prev => ({
                                                                                           ...prev,
                                                                                           payments: [...prev.payments, { method: methodEl.value, amount }]
                                                                                    }))
                                                                                    amountEl.value = ''
                                                                                    amountEl.focus()
                                                                             }
                                                                      }}
                                                                      className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
                                                               >
                                                                      <span className="material-icons text-lg">add</span>
                                                               </button>
                                                        </div>

                                                        {formData.payments.length > 0 && (
                                                               <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                                                      <span className="text-xs text-gray-400 font-bold uppercase">Total Pagado</span>
                                                                      <span className="text-emerald-500 font-mono font-black text-lg">
                                                                             ${formData.payments.reduce((sum, p) => sum + p.amount, 0)}
                                                                      </span>
                                                               </div>
                                                        )}
                                                 </div>
                                          )}
                                   </div>
                            </form>

                            {/* Footer */}
                            <div className="px-6 py-5 border-t border-[#3f3f46] bg-[#252525] flex justify-end space-x-3">
                                   <button
                                          onClick={onClose}
                                          type="button"
                                          disabled={isSubmitting}
                                          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 bg-transparent border border-[#3f3f46] hover:bg-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors"
                                   >
                                          Cancelar
                                   </button>
                                   <button
                                          onClick={handleSubmit}
                                          disabled={isSubmitting}
                                          type="button"
                                          className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#111] bg-[#a3e635] hover:brightness-110 shadow-lg shadow-[#a3e635]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a3e635] transition-all transform active:scale-95 flex items-center gap-2"
                                   >
                                          {isSubmitting ? (
                                                 <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                          ) : (
                                                 <span className="material-icons text-base">check</span>
                                          )}
                                          {isSubmitting ? 'Guardando...' : 'Confirmar Reserva'}
                                   </button>
                            </div>

                            {isSubmitting && (
                                   <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                                          <div className="relative">
                                                 <div className="w-12 h-12 border-4 border-[#a3e635]/30 border-t-[#a3e635] rounded-full animate-spin" />
                                          </div>
                                   </div>
                            )}

                     </div>
              </div>,
              document.body
       )
}
