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
              payments: [] as { method: string, amount: number }[],
              priceOverride: ''
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
       const [isEditingPrice, setIsEditingPrice] = useState(false)

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
                            if (!formData.priceOverride) {
                                   setFormData(prev => ({ ...prev, priceOverride: res.price.toString() }))
                            }
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
                            depositAmount: '',
                            priceOverride: ''
                     }))
                     setIsEditingPrice(false)
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

       const handleSubmit = async (e?: React.FormEvent) => {
              if (e) e.preventDefault()
              setIsSubmitting(true)
              setError('')

              try {
                     const [hours, minutes] = formData.time.split(':').map(Number)
                     const startDate = new Date(initialDate)
                     startDate.setHours(hours, minutes, 0, 0)

                     let paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' = 'UNPAID'
                     if (formData.paymentType === 'full') paymentStatus = 'PAID'
                     if (formData.paymentType === 'partial') paymentStatus = 'PARTIAL'

                     const payload = {
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
                            payments: formData.paymentType === 'split' ? formData.payments : undefined,
                            totalPrice: formData.priceOverride ? Number(formData.priceOverride) : undefined
                     }

                     const apiRes = await fetch('/api/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                     })
                     const res = await apiRes.json()

                     if (res.success && 'booking' in res) {
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
                            setError(('error' in res ? res.error : 'Error desconocido') as string)
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
                     <div className="w-full max-w-4xl bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-[#3f3f46] flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">

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

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-background">
                                   <div className="flex flex-col md:flex-row h-full">
                                          {/* LEFT COLUMN: CLIENT INFO */}
                                          <div className="flex-1 p-6 space-y-6 border-r border-slate-100 dark:border-white/5">
                                                 <div className="space-y-4">
                                                        <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                               <span className="w-4 h-[1px] bg-slate-200 dark:bg-white/10"></span>
                                                               Datos del Cliente
                                                        </h3>

                                                        {error && (
                                                               <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold flex items-center gap-2 leading-tight">
                                                                      <span className="material-icons text-sm">error</span>
                                                                      {error}
                                                               </div>
                                                        )}

                                                        <div className="space-y-4">
                                                               {/* Client Name SEARCH */}
                                                               <div className="space-y-1.5">
                                                                      <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">Nombre Completo</label>
                                                                      <div className="relative group">
                                                                             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                                    <span className="material-icons-outlined text-sm text-slate-400 dark:text-gray-500 group-focus-within:text-[var(--primary)] transition-colors">person</span>
                                                                             </div>
                                                                             <input
                                                                                    required
                                                                                    type="text"
                                                                                    className="block w-full pl-10 pr-4 py-3 text-sm font-bold bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all outline-none"
                                                                                    autoFocus placeholder="Ej: Juan Pérez"
                                                                                    value={formData.name}
                                                                                    onChange={async (e) => {
                                                                                           const val = e.target.value
                                                                                           setFormData({ ...formData, name: val })
                                                                                           if (val.length > 2) {
                                                                                                  const res = await getClients(val)
                                                                                                  setSearchResults(res.success ? (res.data ?? []) : [])
                                                                                                  setShowSuggestions(true)
                                                                                           } else {
                                                                                                  setShowSuggestions(false)
                                                                                           }
                                                                                    }}
                                                                                    onFocus={() => { if (formData.name.length > 2) setShowSuggestions(true) }}
                                                                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                                             />

                                                                             {showSuggestions && searchResults.length > 0 && (
                                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar border-t-0">
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
                                                                                                                       notes: client.notes || formData.notes,
                                                                                                                       isMember: client.membershipStatus === 'ACTIVE'
                                                                                                                })
                                                                                                                setShowSuggestions(false)
                                                                                                         }}
                                                                                                         className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex flex-col border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors"
                                                                                                  >
                                                                                                         <span className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</span>
                                                                                                         <span className="text-[10px] text-slate-500 dark:text-gray-500">{client.phone || 'Sin teléfono'}</span>
                                                                                                  </button>
                                                                                           ))}
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               </div>

                                                               {/* Phone & Email Row */}
                                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                      <div className="space-y-1.5">
                                                                             <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">WhatsApp</label>
                                                                             <div className="relative group">
                                                                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                                                           <span className="material-icons-outlined text-sm text-slate-400 dark:text-gray-500 group-focus-within:text-[var(--primary)] transition-colors">smartphone</span>
                                                                                    </div>
                                                                                    <input
                                                                                           required
                                                                                           type="tel"
                                                                                           className="block w-full pl-10 pr-4 py-3 text-sm font-medium bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all outline-none"
                                                                                           placeholder="351..."
                                                                                           value={formData.phone}
                                                                                           onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                                      <div className="space-y-1.5">
                                                                             <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">Email (Opcional)</label>
                                                                             <div className="relative group">
                                                                                    <input
                                                                                           type="email"
                                                                                           className="block w-full px-4 py-3 text-sm font-medium bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all outline-none"
                                                                                           placeholder="cliente@..."
                                                                                           value={formData.email}
                                                                                           onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               </div>

                                                               {/* Notes */}
                                                               <div className="space-y-1.5 pt-2">
                                                                      <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">Notas Especiales</label>
                                                                      <textarea
                                                                             className="block w-full px-4 py-3 text-sm font-medium bg-slate-50 dark:bg-[#252525] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 transition-all outline-none resize-none"
                                                                             placeholder="¿Alguna aclaración?"
                                                                             rows={2}
                                                                             value={formData.notes}
                                                                             onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                                      />
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                                                        {/* Compact Toggles */}
                                                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#252525] rounded-xl border border-slate-100 dark:border-white/5 group transition-colors hover:border-slate-200 dark:hover:border-white/10">
                                                               <div className="flex flex-col">
                                                                      <span className="text-sm font-black text-slate-900 dark:text-white">¿Es Socio?</span>
                                                                      <span className="text-[10px] text-slate-500">Tarifa preferencial</span>
                                                               </div>
                                                               <label className="relative inline-flex items-center cursor-pointer">
                                                                      <input type="checkbox" className="sr-only peer" checked={formData.isMember} onChange={() => setFormData({ ...formData, isMember: !formData.isMember })} />
                                                                      <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                                               </label>
                                                        </div>

                                                        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#252525] rounded-xl border border-slate-100 dark:border-white/5 group transition-colors hover:border-slate-200 dark:hover:border-white/10">
                                                               <div className="flex flex-col">
                                                                      <span className="text-sm font-black text-slate-900 dark:text-white">Turno Fijo</span>
                                                                      <span className="text-[10px] text-slate-500">Semanalmente</span>
                                                               </div>
                                                               <label className="relative inline-flex items-center cursor-pointer">
                                                                      <input type="checkbox" className="sr-only peer" checked={formData.isRecurring} onChange={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })} />
                                                                      <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                                               </label>
                                                        </div>

                                                        {formData.isRecurring && (
                                                               <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                                                                      <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest block ml-1">Fecha de Fin</label>
                                                                      <input
                                                                             type="date"
                                                                             className="w-full bg-white dark:bg-[#1e1e1e] border border-orange-500/20 rounded-lg p-2.5 text-sm font-bold outline-none"
                                                                             value={formData.recurringEndDate}
                                                                             onChange={e => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                                      />
                                                               </div>
                                                        )}
                                                 </div>
                                          </div>

                                          {/* RIGHT COLUMN: BOOKING & PAYMENT */}
                                          <div className="flex-1 p-6 space-y-6 bg-slate-50/50 dark:bg-white/[0.02]">
                                                 <div className="space-y-4">
                                                        <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                               <span className="w-4 h-[1px] bg-slate-200 dark:bg-white/10"></span>
                                                               Detalles del Turno
                                                        </h3>

                                                        <div className="grid grid-cols-2 gap-3">
                                                               <div className="space-y-1.5">
                                                                      <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">Horario</label>
                                                                      <select
                                                                             className="block w-full px-4 py-3 text-sm font-black bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                                                             value={formData.time}
                                                                             onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                                      >
                                                                             {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                                      </select>
                                                               </div>
                                                               <div className="space-y-1.5">
                                                                      <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 ml-1 uppercase">Cancha</label>
                                                                      <select
                                                                             className="block w-full px-4 py-3 text-sm font-black bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#383838] rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 outline-none"
                                                                             value={formData.courtId}
                                                                             onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                                      >
                                                                             {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                      </select>
                                                               </div>
                                                        </div>

                                                        {/* Price & Payment */}
                                                        <div className="pt-2">
                                                               <div className="bg-white dark:bg-[#1e1e1e] border border-slate-100 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
                                                                      <div className="flex justify-between items-center">
                                                                             <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Total a Cobrar</span>
                                                                             <div className="text-right">
                                                                                    {isEditingPrice ? (
                                                                                           <div className="relative group">
                                                                                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">$</span>
                                                                                                  <input
                                                                                                         type="number"
                                                                                                         autoFocus
                                                                                                         className="w-24 bg-slate-50 dark:bg-zinc-800 border-b-2 border-[var(--primary)] text-sm font-black py-1 pl-5 pr-1 outline-none"
                                                                                                         value={formData.priceOverride}
                                                                                                         onChange={e => setFormData({ ...formData, priceOverride: e.target.value })}
                                                                                                         onBlur={() => setIsEditingPrice(false)}
                                                                                                  />
                                                                                           </div>
                                                                                    ) : (
                                                                                           <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingPrice(true)}>
                                                                                                  <span className="text-2xl font-black text-slate-900 dark:text-white">${Number(formData.priceOverride || estimatedPrice || 0).toLocaleString()}</span>
                                                                                                  <span className="material-icons text-xs text-slate-400 group-hover:text-[var(--primary)] transition-colors">edit</span>
                                                                                           </div>
                                                                                    )}
                                                                                    <div className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-tighter mt-0.5">Precio Sugerido</div>
                                                                             </div>
                                                                      </div>

                                                                      <div className="h-[1px] bg-slate-50 dark:bg-white/5 w-full" />

                                                                      <div className="space-y-3">
                                                                             <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">Seleccionar Cobro</span>
                                                                             <div className="grid grid-cols-3 gap-2">
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => setFormData({ ...formData, paymentType: 'none', depositAmount: '' })}
                                                                                           className={cn(
                                                                                                  "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-[0.98]",
                                                                                                  formData.paymentType === 'none' ? "bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20" : "bg-white dark:bg-[#1e1e1e] border-slate-100 dark:border-white/5 opacity-50 text-muted-foreground"
                                                                                           )}
                                                                                    >
                                                                                           <span className="material-icons text-base">money_off</span>
                                                                                           <span className="text-[9px] font-black uppercase">Impago</span>
                                                                                    </button>
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => setFormData({ ...formData, paymentType: 'partial' })}
                                                                                           className={cn(
                                                                                                  "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-[0.98]",
                                                                                                  formData.paymentType === 'partial' ? "bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]" : "bg-white dark:bg-[#1e1e1e] border-slate-100 dark:border-white/5 opacity-50 text-muted-foreground"
                                                                                           )}
                                                                                    >
                                                                                           <span className="material-icons text-base">savings</span>
                                                                                           <span className="text-[9px] font-black uppercase">Seña</span>
                                                                                    </button>
                                                                                    <button
                                                                                           type="button"
                                                                                           onClick={() => setFormData({ ...formData, paymentType: 'full' })}
                                                                                           className={cn(
                                                                                                  "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all active:scale-[0.98]",
                                                                                                  formData.paymentType === 'full' ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-white dark:bg-[#1e1e1e] border-slate-100 dark:border-white/5 opacity-50 text-muted-foreground"
                                                                                           )}
                                                                                    >
                                                                                           <span className="material-icons text-base">payments</span>
                                                                                           <span className="text-[9px] font-black uppercase">Pagado</span>
                                                                                    </button>
                                                                             </div>
                                                                      </div>

                                                                      {formData.paymentType === 'partial' && (
                                                                             <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                                                                                    <div className="relative group">
                                                                                           <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-500 font-black">$</span>
                                                                                           <input
                                                                                                  type="number"
                                                                                                  className="w-full bg-slate-50 dark:bg-[#1e1e1e] border border-orange-500/20 rounded-xl py-2.5 pl-8 pr-4 text-sm font-black outline-none focus:border-orange-500"
                                                                                                  placeholder="Monto de la seña"
                                                                                                  value={formData.depositAmount}
                                                                                                  onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                                                           />
                                                                                    </div>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                                                               <span className="material-icons text-sm">info</span>
                                                        </div>
                                                        <p className="text-[10px] text-blue-600 dark:text-blue-300 font-medium leading-relaxed">
                                                               El sistema notificará automáticamente al cliente vía WhatsApp si el teléfono es válido.
                                                        </p>
                                                 </div>
                                          </div>
                                   </div>
                            </form>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#18181b] flex items-center justify-between z-10 relative">
                                   <button
                                          onClick={() => { if (!formData.notes) setFormData({ ...formData, notes: 'Alquila paletas' }) }}
                                          className="text-[9px] font-black text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                          type="button"
                                   >
                                          <span className="material-icons text-xs">add_comment</span>
                                          Atajo rápido: Paletas
                                   </button>
                                   <div className="flex gap-3">
                                          <button
                                                 onClick={onClose}
                                                 type="button"
                                                 disabled={isSubmitting}
                                                 className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/5 transition-all uppercase tracking-widest"
                                          >
                                                 Cerrar
                                          </button>
                                          <button
                                                 onClick={() => handleSubmit()}
                                                 disabled={isSubmitting}
                                                 type="button"
                                                 className="px-8 py-3 rounded-xl text-xs font-black text-[#111] bg-[var(--primary)] hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all flex items-center gap-2 uppercase tracking-widest"
                                          >
                                                 {isSubmitting ? (
                                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                 ) : (
                                                        <span className="material-icons text-base">check_circle</span>
                                                 )}
                                                 {isSubmitting ? 'Guardando...' : 'Confirmar Reserva'}
                                          </button>
                                   </div>
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
