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
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
                     <div className="w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-[#3f3f46] flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

                            {/* Header */}
                            <div className="px-6 py-5 border-b-2 border-slate-200 dark:border-[#3f3f46] flex items-center justify-between bg-slate-50 dark:bg-[#252525]">
                                   <div className="flex items-center space-x-3">
                                          <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse shadow-lg shadow-[var(--primary)]/30"></div>
                                          <div>
                                                 <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">Nueva Reserva</h2>
                                                 <span className="text-[10px] font-bold text-slate-600 dark:text-gray-400 mt-1.5 block uppercase tracking-widest bg-slate-200 dark:bg-[#2d2d2d] px-2.5 py-1 rounded-lg inline-block">
                                                        {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                                 </span>
                                          </div>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-transparent text-slate-600 dark:text-gray-500 hover:bg-slate-300 hover:text-slate-900 dark:hover:text-gray-300 transition-all focus:outline-none flex items-center justify-center"
                                   >
                                          <span className="material-icons text-xl">close</span>
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-6 bg-white dark:bg-background">

                                   {error && (
                                          <div className="p-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 rounded-2xl text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-3">
                                                 <span className="material-icons text-lg">error_outline</span>
                                                 {error}
                                          </div>
                                   )}

                                   {/* Time & Court Grid */}
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                 <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Horario</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-slate-500 dark:text-gray-400 group-focus-within:text-[var(--primary)]">schedule</span>
                                                        </div>
                                                        <select
                                                               className="block w-full pl-10 pr-10 py-3.5 text-sm font-bold bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] appearance-none text-slate-900 dark:text-white transition-all cursor-pointer outline-none shadow-sm"
                                                               value={formData.time}
                                                               onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                        >
                                                               {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                               <span className="material-icons text-slate-400">expand_more</span>
                                                        </div>
                                                 </div>
                                          </div>
                                          <div className="space-y-2">
                                                 <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Cancha</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-slate-500 dark:text-gray-400 group-focus-within:text-[var(--primary)]">sports_tennis</span>
                                                        </div>
                                                        <select
                                                               className="block w-full pl-10 pr-10 py-3.5 text-sm font-bold bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] appearance-none text-slate-900 dark:text-white transition-all cursor-pointer outline-none shadow-sm"
                                                               value={formData.courtId}
                                                               onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                        >
                                                               {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                               <span className="material-icons text-slate-400">expand_more</span>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Client Name */}
                                   <div className="space-y-2">
                                          <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Nombre del Cliente</label>
                                          <div className="relative group">
                                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <span className="material-icons-outlined text-slate-500 dark:text-gray-400 group-focus-within:text-[var(--primary)]">person</span>
                                                 </div>
                                                 <input
                                                        required
                                                        type="text"
                                                        className="block w-full pl-10 pr-4 py-3.5 text-sm font-medium bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all outline-none shadow-sm"
                                                        autoFocus placeholder="Escribe el nombre..."
                                                        value={formData.name}
                                                        onChange={async (e) => {
                                                               const val = e.target.value
                                                               setFormData({ ...formData, name: val })
                                                               if (val.length > 2) {
                                                                      const res = await getClients(val)
                                                                      setSearchResults(res.success ? res.data : [])
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
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#252525] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
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
                                                                             className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-[#333] flex flex-col gap-0.5 border-b border-slate-100 dark:border-[#3f3f46] last:border-0"
                                                                      >
                                                                             <span className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</span>
                                                                             <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-gray-400">
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
                                                 <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Teléfono / WhatsApp</label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-slate-500 dark:text-gray-400 group-focus-within:text-[var(--primary)]">smartphone</span>
                                                        </div>
                                                        <input
                                                               required
                                                               type="tel"
                                                               className="block w-full pl-10 pr-4 py-3.5 text-sm font-medium bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all outline-none shadow-sm"
                                                               placeholder="351 1234567"
                                                               value={formData.phone}
                                                               onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        />
                                                 </div>
                                          </div>
                                          <div className="space-y-2">
                                                 <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Email <span className="normal-case font-normal text-slate-500 dark:text-gray-500">(Opcional)</span></label>
                                                 <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                               <span className="material-icons-outlined text-slate-500 dark:text-gray-400 group-focus-within:text-[var(--primary)]">alternate_email</span>
                                                        </div>
                                                        <input
                                                               type="email"
                                                               className="block w-full pl-10 pr-4 py-3.5 text-sm font-medium bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all outline-none shadow-sm"
                                                               placeholder="cliente@ejemplo.com"
                                                               value={formData.email}
                                                               onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        />
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Notes */}
                                   <div className="space-y-2">
                                          <label className="block text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">Notas / Pedidos Especiales</label>
                                          <textarea
                                                 className="block w-full px-4 py-3.5 text-sm font-medium bg-slate-50 dark:bg-[#2d2d2d] border-2 border-slate-200 dark:border-[#3f3f46] rounded-2xl focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 resize-none transition-all outline-none custom-scrollbar shadow-sm"
                                                 placeholder="Jugadores traen sus paletas, requiere pelotas nuevas..."
                                                 rows={3}
                                                 value={formData.notes}
                                                 onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                          />
                                   </div>

                                   {/* Switches */}
                                   <div className="space-y-3 pt-2">
                                          {/* Member Switch */}
                                          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#2d2d2d] rounded-2xl border-2 border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-gray-600 transition-all group shadow-sm">
                                                 <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                               <span className="material-icons-outlined text-base text-slate-600 dark:text-gray-400 group-hover:text-[var(--primary)] transition-colors">verified</span>
                                                               ¿Es Socio?
                                                        </span>
                                                        <span className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">Aplica tarifa preferencial si existe</span>
                                                 </div>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                               type="checkbox"
                                                               className="sr-only peer"
                                                               checked={formData.isMember}
                                                               onChange={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 dark:after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] shadow-inner"></div>
                                                 </label>
                                          </div>

                                          {/* Recurring Switch */}
                                          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#2d2d2d] rounded-2xl border-2 border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-gray-600 transition-all group shadow-sm">
                                                 <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                               <span className="material-icons-outlined text-base text-slate-600 dark:text-gray-400 group-hover:text-[var(--primary)] transition-colors">event_repeat</span>
                                                               Turno Fijo
                                                        </span>
                                                        <span className="text-xs text-slate-600 dark:text-gray-400 mt-0.5">Repetir esta reserva semanalmente</span>
                                                 </div>
                                                 <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                               type="checkbox"
                                                               className="sr-only peer"
                                                               checked={formData.isRecurring}
                                                               onChange={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                                        />
                                                        <div className="w-11 h-6 bg-slate-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-200 dark:after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] shadow-inner"></div>
                                                 </label>
                                          </div>

                                          {/* Recurring Date (Conditional) */}
                                          {formData.isRecurring && (
                                                 <div className="p-4 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 animate-in slide-in-from-top-2 shadow-sm">
                                                        <label className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest ml-1 mb-2 block">Fecha de Fin</label>
                                                        <input
                                                               type="date"
                                                               required={formData.isRecurring}
                                                               className="w-full bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white font-black outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all shadow-sm"
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
                                                 "p-5 mt-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 shadow-sm",
                                                 estimatedPrice === 0
                                                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-200"
                                                        : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200"
                                          )}>
                                                 <div className="flex items-center gap-4">
                                                        {estimatedPrice === 0 ? (
                                                               <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                                      <AlertTriangle size={20} />
                                                               </div>
                                                        ) : (
                                                               <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                                      <span className="material-icons text-xl">payments</span>
                                                               </div>
                                                        )}
                                                        <div>
                                                               <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                                                      {estimatedPrice === 0 ? "Atención" : "Costo del Turno"}
                                                               </p>
                                                               <p className="text-base font-black mt-0.5">
                                                                      {estimatedPrice === 0
                                                                             ? "Sin precio configurado (Gratis)"
                                                                             : `Total a cobrar: $${estimatedPrice.toLocaleString()}`
                                                                      }
                                                               </p>
                                                        </div>
                                                 </div>
                                          </div>
                                   )}
                                   <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                                          <div className="flex items-center justify-between">
                                                 <label className="block text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest">Estado del Cobro</label>
                                                 <span className="text-[9px] text-slate-400 dark:text-zinc-600 font-bold uppercase tracking-wider">Dividir gastos se configura despues</span>
                                          </div>

                                          <div className="grid grid-cols-3 gap-2">
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-[0.98]",
                                                               formData.paymentType === 'none'
                                                                      ? "bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-900 dark:text-white shadow-inner"
                                                                      : "bg-white dark:bg-[#18181b] border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">money_off</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Impago</span>
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'partial', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-[0.98]",
                                                               formData.paymentType === 'partial'
                                                                      ? "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 shadow-inner"
                                                                      : "bg-white dark:bg-[#18181b] border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">savings</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Seña</span>
                                                 </button>
                                                 <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, paymentType: 'full', depositAmount: '' })}
                                                        className={cn(
                                                               "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all active:scale-[0.98]",
                                                               formData.paymentType === 'full'
                                                                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner"
                                                                      : "bg-white dark:bg-[#18181b] border-slate-200 dark:border-white/5 text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                                        )}
                                                 >
                                                        <span className="material-icons text-xl">payments</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Pagado</span>
                                                 </button>
                                          </div>

                                          {/* Conditional Inputs */}
                                          {formData.paymentType === 'partial' && (
                                                 <div className="animate-in slide-in-from-top-2 p-5 bg-orange-50/50 dark:bg-orange-500/5 rounded-2xl border border-orange-200 dark:border-orange-500/20 shadow-sm">
                                                        <label className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 block">Monto de la Seña</label>
                                                        <div className="relative group">
                                                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 font-black text-lg transition-colors group-focus-within:text-orange-700">$</span>
                                                               <input
                                                                      type="number"
                                                                      autoFocus
                                                                      className="w-full bg-white dark:bg-[#121214] border border-orange-200 dark:border-orange-500/20 rounded-xl py-3 pl-9 pr-4 text-slate-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
                                                                      placeholder="0.00"
                                                                      value={formData.depositAmount}
                                                                      onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                               />
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 dark:text-muted-foreground mt-3 flex items-center gap-2">
                                                               <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                                               Se registrará como pago en <strong className="text-slate-900 dark:text-white">Efectivo</strong>.
                                                        </p>
                                                 </div>
                                          )}

                                          {formData.paymentType === 'full' && (
                                                 <div className="animate-in slide-in-from-top-2 p-5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-4 shadow-sm">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
                                                               <span className="material-icons text-xl">check</span>
                                                        </div>
                                                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                                               Se registrará el cobro total e inmediato en <strong className="text-emerald-900 dark:text-emerald-100 font-black">Efectivo</strong>.
                                                        </p>
                                                 </div>
                                          )}
                                   </div>
                            </form>

                            {/* Footer */}
                            <div className="px-6 py-5 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#18181b] flex justify-end gap-3 z-10 relative">
                                   <button
                                          onClick={onClose}
                                          type="button"
                                          disabled={isSubmitting}
                                          className="px-6 py-4 rounded-xl text-xs font-black text-slate-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all uppercase tracking-widest"
                                   >
                                          Cancelar
                                   </button>
                                   <button
                                          onClick={handleSubmit}
                                          disabled={isSubmitting}
                                          type="button"
                                          className="px-8 py-4 rounded-xl text-xs font-black text-[#111] bg-[var(--primary)] hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 active:scale-[0.98] transition-all flex items-center gap-2 uppercase tracking-widest"
                                   >
                                          {isSubmitting ? (
                                                 <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                          ) : (
                                                 <span className="material-icons text-base">check</span>
                                          )}
                                          {isSubmitting ? 'Guardando...' : 'Confirmar'}
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
