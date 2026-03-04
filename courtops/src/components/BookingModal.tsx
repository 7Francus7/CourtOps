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
import { Check, MessageCircle, AlertTriangle, User, Phone, Mail, FileText, UserCheck, Repeat, Clock, Layout, DollarSign, Info, Trash2, Edit2, CheckCircle2, X, ChevronDown, Wallet, Ban, PiggyBank, Receipt } from 'lucide-react'
import { createPortal } from 'react-dom'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string, duration?: number }[]
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
       const [isManualPrice, setIsManualPrice] = useState(false)

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
                            // Update override ONLY if user hasn't manually set it
                            if (!isManualPrice) {
                                   setFormData(prev => ({ ...prev, priceOverride: res.price.toString() }))
                            }
                     }
              }
              // Debounce slightly or just run
              const timer = setTimeout(fetchPrice, 300)
              return () => clearTimeout(timer)
       }, [formData.courtId, formData.time, formData.isMember, initialDate, isOpen, isManualPrice]) // Added isManualPrice dependency

       useEffect(() => {
              if (isOpen) {
                     setSuccessData(null) // Reset success state
                     setIsManualPrice(false) // Reset manual flag
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

                                   // Find selected court's duration
                                   const selectedCourt = courts.find(c => c.id === formData.courtId)
                                   const courtDuration = selectedCourt?.duration || slotDuration || 90

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
                                          current.setMinutes(current.getMinutes() + courtDuration)
                                   }
                                   setTimeOptions(slots)
                            }
                     } catch (e) {
                            console.error("Error loading time settings", e)
                            setTimeOptions(['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30'])
                     }
              }
              loadSettings()
       }, [formData.courtId, courts])

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
                            import('canvas-confetti').then(mod => mod.default({
                                   particleCount: 150,
                                   spread: 70,
                                   origin: { y: 0.6 },
                                   colors: ['#a3e635', '#222', '#ffffff'] // Brand colors
                            }))
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
                     <div className="fixed inset-0 z-[110] bg-black/95 sm:bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 text-gray-100 font-sans backdrop-blur-md">
                            <div className="bg-[#1e1e1e] border border-[#3f3f46] w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                                   <div className="w-20 h-20 bg-[#a3e635]/20 rounded-full flex items-center justify-center text-[#a3e635] mb-6 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                                          <CheckCircle2 size={40} className="stroke-[3px]" />
                                   </div>

                                   <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">¡Reserva Creada!</h2>
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
                                                 className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
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

       if (!mounted) return null

       return createPortal(
              <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
                     <div className="bg-card/95 dark:bg-zinc-950/95 border-t sm:border border-white/10 w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-4xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 relative font-inter flex flex-col">
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-muted/50 dark:bg-white/5">
                                   <div className="flex items-center gap-4">
                                          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
                                          <div>
                                                 <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Nueva Reserva</h2>
                                                 <div className="flex items-center gap-2 mt-1">
                                                        <Clock size={12} className="text-primary" />
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                                               {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                                        </span>
                                                 </div>
                                          </div>
                                   </div>
                                   <button
                                          onClick={onClose}
                                          className="w-10 h-10 rounded-2xl bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
                                   >
                                          <X size={20} />
                                   </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                                   <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row pb-safe">
                                          {/* Left Column: Client Data */}
                                          <div className="flex-[1.2] p-8 space-y-8">
                                                 <div className="space-y-6">
                                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                                               <div className="w-8 h-[1px] bg-primary/30"></div>
                                                               Datos del Cliente
                                                        </h3>

                                                        {error && (
                                                               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black flex items-center gap-3 animate-in shake duration-300">
                                                                      <AlertTriangle size={16} />
                                                                      {error.toUpperCase()}
                                                               </div>
                                                        )}

                                                        <div className="space-y-5">
                                                               {/* Client Name SEARCH */}
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Nombre Completo</label>
                                                                      <div className="relative group">
                                                                             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                    <User size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                                             </div>
                                                                             <input
                                                                                    required
                                                                                    type="text"
                                                                                    className="block w-full pl-12 pr-4 py-4 text-sm font-bold bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-muted-foreground transition-all outline-none shadow-inner"
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
                                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
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
                                                                                                         className="w-full text-left px-5 py-4 hover:bg-muted/50 flex flex-col border-b border-border/50 last:border-0 transition-colors"
                                                                                                  >
                                                                                                         <span className="text-sm font-black text-foreground">{client.name}</span>
                                                                                                         <span className="text-[10px] text-muted-foreground font-bold">{client.phone || 'SIN TELÉFONO'}</span>
                                                                                                  </button>
                                                                                           ))}
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               </div>

                                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                      <div className="space-y-2">
                                                                             <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">WhatsApp</label>
                                                                             <div className="relative group">
                                                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                           <Phone size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                                                    </div>
                                                                                    <input
                                                                                           required
                                                                                           type="tel"
                                                                                           className="block w-full pl-12 pr-4 py-4 text-sm font-bold bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-muted-foreground transition-all outline-none shadow-inner"
                                                                                           placeholder="351..."
                                                                                           value={formData.phone}
                                                                                           onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Email (Opcional)</label>
                                                                             <div className="relative group">
                                                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                           <Mail size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                                                    </div>
                                                                                    <input
                                                                                           type="email"
                                                                                           className="block w-full pl-12 pr-4 py-4 text-sm font-bold bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-muted-foreground transition-all outline-none shadow-inner"
                                                                                           placeholder="cliente@..."
                                                                                           value={formData.email}
                                                                                           onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                                    />
                                                                             </div>
                                                                      </div>
                                                               </div>

                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Notas Especiales</label>
                                                                      <div className="relative group">
                                                                             <div className="absolute top-4 left-4 pointer-events-none">
                                                                                    <FileText size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                                             </div>
                                                                             <textarea
                                                                                    className="block w-full pl-12 pr-4 py-4 text-sm font-bold bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder-muted-foreground transition-all outline-none shadow-inner min-h-[100px] resize-none"
                                                                                    placeholder="¿Alguna aclaración?"
                                                                                    value={formData.notes}
                                                                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-4">
                                                        <button
                                                               type="button"
                                                               onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                                               className={cn(
                                                                      "p-4 rounded-2xl border transition-all flex flex-col gap-2 items-start",
                                                                      formData.isMember ? "bg-primary/10 border-primary text-primary" : "bg-muted/30 border-transparent text-muted-foreground"
                                                               )}
                                                        >
                                                               <UserCheck size={18} />
                                                               <div className="text-left">
                                                                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">¿Es Socio?</p>
                                                                      <p className="text-[8px] font-bold opacity-60 mt-1 uppercase">Tarifa preferencial</p>
                                                               </div>
                                                        </button>
                                                        <button
                                                               type="button"
                                                               onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                                               className={cn(
                                                                      "p-4 rounded-2xl border transition-all flex flex-col gap-2 items-start",
                                                                      formData.isRecurring ? "bg-primary/10 border-primary text-primary" : "bg-muted/30 border-transparent text-muted-foreground"
                                                               )}
                                                        >
                                                               <Repeat size={18} />
                                                               <div className="text-left">
                                                                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Turno Fijo</p>
                                                                      <p className="text-[8px] font-bold opacity-60 mt-1 uppercase">Semanalmente</p>
                                                               </div>
                                                        </button>
                                                 </div>

                                                 {formData.isRecurring && (
                                                        <div className="animate-in slide-in-from-top-4 duration-300">
                                                               <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
                                                                      <div className="flex items-center gap-3 text-primary">
                                                                             <Repeat size={16} />
                                                                             <span className="text-[10px] font-black uppercase tracking-widest">Configuración de Repetición</span>
                                                                      </div>
                                                                      <div className="space-y-2">
                                                                             <label className="text-[10px] font-black text-muted-foreground uppercase ml-1">Fecha de Finalización</label>
                                                                             <input
                                                                                    type="date"
                                                                                    value={formData.recurringEndDate}
                                                                                    onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                                                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                                             />
                                                                      </div>
                                                               </div>
                                                        </div>
                                                 )}
                                          </div>

                                          {/* Right Column: Turn Details & Payment */}
                                          <div className="flex-1 p-8 space-y-8 bg-muted/20 dark:bg-black/20 border-l border-border/50">
                                                 <div className="space-y-6">
                                                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
                                                               <div className="w-8 h-[1px] bg-primary/30"></div>
                                                               Detalles del Turno
                                                        </h3>

                                                        <div className="grid grid-cols-2 gap-4">
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Horario</label>
                                                                      <div className="relative group/select">
                                                                             <select
                                                                                    className="block w-full px-5 py-4 text-sm font-black bg-card dark:bg-zinc-900 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground appearance-none transition-all shadow-sm"
                                                                                    value={formData.time}
                                                                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                                             >
                                                                                    {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                                             </select>
                                                                             <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/select:text-primary pointer-events-none transition-colors" />
                                                                      </div>
                                                               </div>
                                                               <div className="space-y-2">
                                                                      <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest">Cancha</label>
                                                                      <div className="relative group/select">
                                                                             <select
                                                                                    className="block w-full px-5 py-4 text-sm font-black bg-card dark:bg-zinc-900 border border-border/50 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground appearance-none transition-all shadow-sm"
                                                                                    value={formData.courtId}
                                                                                    onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                                             >
                                                                                    {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                             </select>
                                                                             <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/select:text-primary pointer-events-none transition-colors" />
                                                                      </div>
                                                               </div>
                                                        </div>

                                                        {/* Total Card */}
                                                        <div className="bg-card dark:bg-zinc-900/50 border border-border/50 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                                               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                                                               <div className="flex justify-between items-center relative">
                                                                      <div className="flex flex-col">
                                                                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total a Cobrar</span>
                                                                             <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Precio Sugerido</div>
                                                                      </div>
                                                                      <div className="text-right">
                                                                             {isEditingPrice ? (
                                                                                    <div className="relative flex items-center justify-end">
                                                                                           <DollarSign size={20} className="text-primary mr-1" />
                                                                                           <input
                                                                                                  type="number"
                                                                                                  autoFocus
                                                                                                  className="w-32 bg-transparent text-3xl font-black outline-none text-foreground border-b-2 border-primary"
                                                                                                  value={formData.priceOverride}
                                                                                                  onChange={e => {
                                                                                                         setFormData({ ...formData, priceOverride: e.target.value })
                                                                                                         setIsManualPrice(true)
                                                                                                  }}
                                                                                                  onBlur={() => setIsEditingPrice(false)}
                                                                                           />
                                                                                    </div>
                                                                             ) : (
                                                                                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditingPrice(true)}>
                                                                                           <span className="text-4xl font-black text-foreground tracking-tighter transition-transform group-hover:scale-110">
                                                                                                  ${Number(formData.priceOverride || estimatedPrice || 0).toLocaleString()}
                                                                                           </span>
                                                                                           <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/20 transition-colors">
                                                                                                  <Edit2 size={14} className="text-muted-foreground group-hover:text-primary" />
                                                                                           </div>
                                                                                    </div>
                                                                             )}
                                                                      </div>
                                                               </div>

                                                               <div className="h-[1px] bg-border/50 w-full relative"></div>

                                                               <div className="space-y-4">
                                                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block ml-1">Método de Pago</span>
                                                                      <div className="grid grid-cols-3 gap-3">
                                                                             {[
                                                                                    { id: "none", label: "Impago", icon: Ban, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
                                                                                    { id: "partial", label: "Seña", icon: PiggyBank, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                                                                                    { id: "full", label: "Pagado", icon: Receipt, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
                                                                             ].map((method) => {
                                                                                    const isSelected = formData.paymentType === method.id
                                                                                    return (
                                                                                           <button
                                                                                                  key={method.id}
                                                                                                  type="button"
                                                                                                  onClick={() => setFormData({ ...formData, paymentType: method.id as any })}
                                                                                                  className={cn(
                                                                                                         "group relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden",
                                                                                                         isSelected
                                                                                                                ? `${method.bg} ${method.border} shadow-lg scale-105 z-10`
                                                                                                                : "bg-muted/30 border-transparent opacity-60 hover:opacity-100"
                                                                                                  )}
                                                                                           >
                                                                                                  <div className={cn("p-2 rounded-xl transition-all", isSelected ? "bg-white dark:bg-zinc-900 shadow-sm" : "bg-transparent")}>
                                                                                                         <method.icon size={20} className={isSelected ? method.color : "text-muted-foreground"} />
                                                                                                  </div>
                                                                                                  <span className={cn("text-[9px] font-black uppercase tracking-widest transition-all", isSelected ? method.color : "text-muted-foreground")}>
                                                                                                         {method.label}
                                                                                                  </span>
                                                                                           </button>
                                                                                    )
                                                                             })}
                                                                      </div>

                                                                      {formData.paymentType === 'partial' && (
                                                                             <div className="animate-in slide-in-from-top-4 duration-300 relative z-0">
                                                                                    <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-[1.5rem] space-y-3">
                                                                                           <label className="text-[9px] font-black text-orange-500 uppercase ml-1">Monto de la Seña</label>
                                                                                           <div className="relative">
                                                                                                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                                                                                                  <input
                                                                                                         type="number"
                                                                                                         value={formData.depositAmount}
                                                                                                         onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                                                                                                         placeholder="0"
                                                                                                         className="w-full bg-background border border-orange-500/20 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-foreground outline-none focus:ring-2 focus:ring-orange-500/20"
                                                                                                  />
                                                                                           </div>
                                                                                    </div>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>

                                                        <div className="p-5 bg-primary/5 border border-primary/10 rounded-[1.5rem] flex items-center gap-4 group/info transition-all hover:bg-primary/10">
                                                               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover/info:scale-110 transition-transform">
                                                                      <Info size={22} />
                                                               </div>
                                                               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight leading-relaxed">
                                                                      El sistema notificará automáticamente al cliente vía WhatsApp si el teléfono es válido.
                                                               </p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <div className="p-6 sm:p-8 border-t border-border/50 bg-muted/60 dark:bg-white/[0.02] flex flex-col items-center justify-between gap-6 relative shrink-0">
                                          <button
                                                 onClick={() => { if (!formData.notes) setFormData({ ...formData, notes: 'Alquila paletas' }) }}
                                                 className="text-[10px] sm:w-auto w-full justify-center font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all flex items-center gap-2 group"
                                                 type="button"
                                          >
                                                 <FileText size={16} className="group-hover:scale-110 transition-transform" />
                                                 ATAJO RÁPIDO: PALETAS
                                          </button>

                                          <div className="flex gap-3 w-full sm:w-auto sm:self-end">
                                                 <button
                                                        onClick={onClose}
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        className="flex-1 sm:flex-none px-6 sm:px-10 py-4 rounded-2xl text-[10px] font-black text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all uppercase tracking-widest sm:tracking-[0.2em]"
                                                 >
                                                        CERRAR
                                                 </button>
                                                 <button
                                                        onClick={() => handleSubmit()}
                                                        disabled={isSubmitting}
                                                        type="button"
                                                        className="flex-[2] sm:flex-none px-4 sm:px-12 py-4 rounded-2xl text-[10px] font-black text-primary-foreground bg-primary hover:brightness-110 hover:shadow-2xl hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3 uppercase tracking-wider sm:tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis"
                                                 >
                                                        {isSubmitting ? (
                                                               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                                                        ) : (
                                                               <CheckCircle2 size={18} className="shrink-0" />
                                                        )}
                                                        <span className="truncate">{isSubmitting ? 'GUARDANDO...' : 'CONFIRMAR RESERVA'}</span>
                                                 </button>
                                          </div>
                                   </div>
                            </form>

                            {isSubmitting && (
                                   <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                                          <div className="flex flex-col items-center gap-4">
                                                 <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]" />
                                                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Procesando...</span>
                                          </div>
                                   </div>
                            )}
                     </div>
              </div>,
              document.body
       )
}
