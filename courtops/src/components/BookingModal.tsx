'use client'


import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createBooking } from '@/actions/createBooking'
import { getClients } from '@/actions/clients'
import { getBookingPriceEstimate } from '@/actions/getBookingPrice'
import { getClubSettings } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import { MessagingService } from '@/lib/messaging'
import { Check, MessageCircle, AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'
import confetti from 'canvas-confetti'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string }[]
}

export default function BookingModal({ isOpen, onClose, onSuccess, initialDate, initialTime, initialCourtId, courts = [] }: Props) {
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


       // Split Payment Temporary State
       const [splitMethod, setSplitMethod] = useState('CASH')
       const [splitAmount, setSplitAmount] = useState('')

       // Price Estimation
       const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

       useEffect(() => {
              setMounted(true)
              return () => setMounted(false)
       }, [])

       // Check Price Effect
       useEffect(() => {
              if (!isOpen) return

              const fetchPrice = async () => {
                     const res = await getBookingPriceEstimate(
                            Number(formData.courtId),
                            initialDate,
                            formData.time,
                            formData.isMember
                     )
                     if (res.success && typeof res.price === 'number') {
                            setEstimatedPrice(res.price)
                     }
              }
              // Debounce slightly or just run
              const timer = setTimeout(fetchPrice, 300)
              return () => clearTimeout(timer)
       }, [formData.courtId, formData.time, formData.isMember, initialDate, isOpen])

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

       // Dynamic Time Slots
       const [timeOptions, setTimeOptions] = useState<string[]>([])

       useEffect(() => {
              const loadSettings = async () => {
                     try {
                            const settings = await getClubSettings()
                            if (settings) {
                                   const { openTime, closeTime, slotDuration } = settings
                                   // Generate slots
                                   const slots: string[] = []
                                   const [openH, openM] = (openTime || '08:00').split(':').map(Number)
                                   const [closeH, closeM] = (closeTime || '23:00').split(':').map(Number)

                                   let current = new Date()
                                   current.setHours(openH, openM, 0, 0)

                                   // Create end date (handle next day)
                                   let end = new Date()
                                   end.setHours(closeH, closeM, 0, 0)
                                   if (end <= current) end.setDate(end.getDate() + 1)

                                   while (current < end) {
                                          const timeStr = current.getHours().toString().padStart(2, '0') + ':' + current.getMinutes().toString().padStart(2, '0')
                                          slots.push(timeStr)
                                          current.setMinutes(current.getMinutes() + (slotDuration || 90))
                                   }
                                   setTimeOptions(slots)
                            }
                     } catch (e) {
                            console.error("Error loading time settings", e)
                            setTimeOptions(['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'])
                     }
              }
              loadSettings()
       }, [])

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
                            // Trigger celebration!
                            confetti({
                                   particleCount: 150,
                                   spread: 70,
                                   origin: { y: 0.6 },
                                   colors: ['#a3e635', '#222', '#ffffff'] // Brand colors
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
                                                        autoFocus placeholder="Escribe el nombre..."
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

                                   {/* Payment Section - Simplified for Speed */}
                                   {/* Price Preview / Warning */}
                                   {estimatedPrice !== null && (
                                          <div className={cn(
                                                 "p-3 mt-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2",
                                                 estimatedPrice === 0
                                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                                                        : "bg-emerald-500/5 border-emerald-500/20 text-emerald-100"
                                          )}>
                                                 <div className="flex items-center gap-3">
                                                        {estimatedPrice === 0 ? (
                                                               <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                                      <AlertTriangle size={16} />
                                                               </div>
                                                        ) : (
                                                               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                                      <span className="material-icons text-base">payments</span>
                                                               </div>
                                                        )}
                                                        <div>
                                                               <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                                                                      {estimatedPrice === 0 ? "Atención" : "Costo del Turno"}
                                                               </p>
                                                               <p className="text-sm font-medium">
                                                                      {estimatedPrice === 0
                                                                             ? "Sin precio configurado (Gratis)"
                                                                             : `Total a cobrar: $${estimatedPrice.toLocaleString()}`
                                                                      }
                                                               </p>
                                                        </div>
                                                 </div>
                                          </div>
                                   )}
                                   <div className="pt-4 border-t border-white/5 space-y-3">
                                          <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado del Cobro</label>
                                                 <span className="text-[10px] text-zinc-500 italic">Dividir gastos se configura tras crear la reserva</span>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2">
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'none'
                                                                      ? "bg-white/10 border-white/20 text-white shadow-lg"
                                                                      : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">money_off</span>
                                                        Impago
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'partial', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'partial'
                                                                      ? "bg-orange-500/20 border-orange-500 text-orange-500 shadow-lg"
                                                                      : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">savings</span>
                                                        Seña
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'full', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-xs font-bold uppercase transition-all",
                                                               formData.paymentType === 'full'
                                                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-lg"
                                                                      : "bg-[#2d2d2d] border-[#3f3f46] text-gray-500 hover:text-gray-300"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">payments</span>
                                                        Pagado
                                                 </button>
                                          </div>

                                          {/* Conditional Inputs */}
                                          {formData.paymentType === 'partial' && (
                                                 <div className="animate-in slide-in-from-top-2 p-4 bg-[#2d2d2d] rounded-xl border border-orange-500/30">
                                                        <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2 block">Monto de la Seña</label>
                                                        <div className="relative">
                                                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 font-bold">$</span>
                                                               <input
                                                                      type="number"
                                                                      autoFocus
                                                                      className="w-full bg-[#1e1e1e] border border-orange-500/50 rounded-lg py-2 pl-7 pr-4 text-white font-bold outline-none focus:ring-2 focus:ring-orange-500/50"
                                                                      placeholder="0.00"
                                                                      value={formData.depositAmount}
                                                                      onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                               />
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                               * Se registrará como pago en <strong className="text-white">Efectivo</strong>. Para otros medios, editar después.
                                                        </p>
                                                 </div>
                                          )}

                                          {formData.paymentType === 'full' && (
                                                 <div className="animate-in slide-in-from-top-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                               <span className="material-icons text-sm">check</span>
                                                        </div>
                                                        <p className="text-xs text-emerald-200">
                                                               Se registrará el cobro total en <strong className="text-white">Efectivo</strong>.
                                                        </p>
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
