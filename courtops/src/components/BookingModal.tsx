'use client'


import React, { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getClients } from '@/actions/clients'
import { getBookingPriceEstimate } from '@/actions/getBookingPrice'
import { getClubSettings } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import { MessagingService } from '@/lib/messaging'
import { MessageCircle, AlertTriangle, User, Phone, Mail, FileText, UserCheck, Repeat, Clock, DollarSign, CheckCircle2, X, ChevronDown, Sparkles, CalendarDays, MapPin, Search } from 'lucide-react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getTeachers } from '@/actions/teachers'

type Props = {
       isOpen: boolean
       onClose: () => void
       onSuccess: () => void
       initialDate: Date
       initialTime?: string
       initialCourtId?: number
       courts: { id: number, name: string, duration?: number }[]
}

const PADEL_SLOT_MINUTES = 90
const FALLBACK_TIME_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00', '22:30']

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
              priceOverride: '',
              bookingType: 'NORMAL' as 'NORMAL' | 'CLASS' | 'MATCH',
              teacherId: '',
              skillLevel: '4.0'
       })
       const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([])
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [error, setError] = useState('')

       // Search
       const [searchResults, setSearchResults] = useState<{ id: number; name: string; phone?: string; email?: string; membershipStatus?: string; notes?: string }[]>([])
       const [showSuggestions, setShowSuggestions] = useState(false)
       const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

       const [mounted, setMounted] = useState(false)
       const [successData, setSuccessData] = useState<Record<string, unknown> | null>(null)

       // Price Estimation
       const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
       const [isEditingPrice, setIsEditingPrice] = useState(false)
       const [isManualPrice, setIsManualPrice] = useState(false)

       // Notes expanded
       const [showNotes, setShowNotes] = useState(false)

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
                            if (!isManualPrice) {
                                   setFormData(prev => ({ ...prev, priceOverride: res.price.toString() }))
                            }
                     }
              }
              const timer = setTimeout(fetchPrice, 300)
              return () => clearTimeout(timer)
       }, [formData.courtId, formData.time, formData.isMember, initialDate, isOpen, isManualPrice])

       useEffect(() => {
              if (isOpen) {
                     setSuccessData(null)
                     setIsManualPrice(false)
                     setShowNotes(false)
                     setFormData(prev => ({
                            ...prev,
                            time: initialTime || '14:00',
                            courtId: initialCourtId || (courts[0]?.id || 0),
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
                                   const selectedCourt = courts.find(c => c.id === Number(formData.courtId))
                                   const courtDuration = Number(slotDuration || selectedCourt?.duration || PADEL_SLOT_MINUTES)

                                   const slots: string[] = []
                                   const [openH, openM] = (openTime || '08:00').split(':').map(Number)
                                   const [closeH, closeM] = (closeTime || '23:00').split(':').map(Number)

                                   const current = new Date()
                                   current.setHours(openH, openM, 0, 0)

                                   const end = new Date()
                                   end.setHours(closeH, closeM, 0, 0)
                                   if (end <= current) end.setDate(end.getDate() + 1)

                                   while (current < end) {
                                          const timeStr = current.getHours().toString().padStart(2, '0') + ':' + current.getMinutes().toString().padStart(2, '0')
                                          slots.push(timeStr)
                                          current.setMinutes(current.getMinutes() + courtDuration)
                                   }

                                   const normalizedSlots = slots.length > 0 ? slots : FALLBACK_TIME_SLOTS
                                   setTimeOptions(normalizedSlots)
                                   setFormData(prev => ({
                                          ...prev,
                                          time: normalizedSlots.includes(prev.time)
                                                 ? prev.time
                                                 : normalizedSlots[0]
                                   }))
                            } else {
                                   setTimeOptions(FALLBACK_TIME_SLOTS)
                                   setFormData(prev => ({
                                          ...prev,
                                          time: FALLBACK_TIME_SLOTS.includes(prev.time) ? prev.time : FALLBACK_TIME_SLOTS[0]
                                   }))
                            }
                     } catch (e) {
                             console.error("Error loading time settings", e)
                             setTimeOptions(FALLBACK_TIME_SLOTS)
                             setFormData(prev => ({
                                    ...prev,
                                    time: FALLBACK_TIME_SLOTS.includes(prev.time) ? prev.time : FALLBACK_TIME_SLOTS[0]
                             }))
                     }
              }
              const loadTeachers = async () => {
                     const res = await getTeachers()
                     if (res.success && res.data) setTeachers(res.data)
              }
              loadSettings()
              loadTeachers()
       }, [formData.courtId, courts])

       const handleSubmit = async (e?: React.FormEvent) => {
              if (e) e.preventDefault()
              setIsSubmitting(true)
              setError('')

              try {
                     const [hours, minutes] = formData.time.split(':').map(Number)
                     const startDate = new Date(initialDate)
                     startDate.setHours(hours, minutes, 0, 0)

                      const payload = {
                             clientName: formData.name,
                             clientPhone: formData.phone,
                             clientEmail: formData.email || undefined,
                             courtId: Number(formData.courtId),
                             startTime: startDate,
                             paymentStatus: 'UNPAID' as const,
                             notes: formData.notes,
                             isMember: formData.isMember,
                             recurringEndDate: formData.isRecurring && formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
                             totalPrice: formData.priceOverride ? Number(formData.priceOverride) : undefined,
                            bookingType: formData.bookingType,
                            teacherId: formData.bookingType === 'CLASS' ? formData.teacherId : undefined,
                            skillLevel: formData.bookingType === 'MATCH' ? Number(formData.skillLevel) : undefined
                     }

                     const apiRes = await fetch('/api/bookings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                     })
                     const res = await apiRes.json()

                     if (res.success && 'booking' in res) {
                            setSuccessData({
                                   booking: res.booking,
                                   client: res.client,
                                   adaptedBooking: {
                                          schedule: {
                                                 startTime: res.booking.startTime,
                                                 courtName: courts.find(c => c.id === res.booking?.courtId)?.name || 'Cancha'
                                          }
                                   }
                            })
                            import('canvas-confetti').then(mod => mod.default({
                                   particleCount: 150,
                                   spread: 70,
                                   origin: { y: 0.6 },
                                   colors: ['#a3e635', '#222', '#ffffff']
                            }))
                            onSuccess()
                     } else {
                            setError(('error' in res ? res.error : 'Error desconocido') as string)
                     }
              } catch {
                     setError('Error al crear reserva. Intente de nuevo.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleClientSearch = (val: string) => {
              setFormData(prev => ({ ...prev, name: val }))
              if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
              if (val.length > 2) {
                     searchTimeoutRef.current = setTimeout(async () => {
                            const res = await getClients(val)
                            setSearchResults(res.success ? (res.data ?? []) : [])
                            setShowSuggestions(true)
                     }, 200)
              } else {
                     setShowSuggestions(false)
              }
       }

       const displayPrice = Number(formData.priceOverride || estimatedPrice || 0)

       // Success View
       if (successData) {
              return createPortal(
                     <div className="fixed inset-0 z-[110] bg-black/95 sm:bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 text-gray-100 font-sans backdrop-blur-md">
                            <motion.div
                                   initial={{ scale: 0.9, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   className="bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center"
                            >
                                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                                          <CheckCircle2 size={40} className="stroke-[3px]" />
                                   </div>

                                   <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Reserva Creada!</h2>
                                   <p className="text-muted-foreground text-sm font-medium mb-8">
                                          El turno ha sido agendado correctamente.
                                   </p>

                                   <div className="space-y-3 w-full">
                                          <button
                                                 onClick={() => {
                                                        const phone = (successData.client as Record<string, unknown>)?.phone as string | undefined
                                                        if (phone) {
                                                               const text = MessagingService.generateBookingMessage(successData.adaptedBooking as Record<string, unknown>, 'new_booking')
                                                               const url = MessagingService.getWhatsAppUrl(phone, text)
                                                               window.open(url, '_blank')
                                                        }
                                                 }}
                                                 className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
                                          >
                                                 <MessageCircle className="w-5 h-5 fill-current" />
                                                 ENVIAR POR WHATSAPP
                                          </button>

                                          <button
                                                 onClick={onClose}
                                                 className="w-full h-14 bg-muted hover:bg-muted/80 text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                          >
                                                 Cerrar
                                          </button>
                                   </div>
                            </motion.div>
                     </div>,
                     document.body
              )
       }

       if (!mounted) return null

       return createPortal(
              <AnimatePresence>
                     {isOpen && (
                            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 pb-[env(safe-area-inset-bottom)]">
                                    {/* Backdrop */}
                                    <motion.div
                                           initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                          onClick={onClose}
                                   />

                                   {/* Modal */}
                                   <motion.div
                                          initial={{ y: "100%", opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          exit={{ y: "100%", opacity: 0 }}
                                          transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                          className="relative z-10 bg-card w-full h-[92dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border-t sm:border border-border"
                                   >
                                          {/* Mobile Drag Handle */}
                                          <div className="sm:hidden w-full flex justify-center pt-2 pb-1">
                                                 <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
                                          </div>

                                          {/* Header */}
                                          <div className="px-6 sm:px-8 pt-4 sm:pt-6 pb-4 flex justify-between items-start">
                                                 <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                               {formData.bookingType === 'NORMAL' ? <Sparkles size={22} /> : 
                                                                formData.bookingType === 'CLASS' ? <User size={22} /> : <UserCheck size={22} />}
                                                        </div>
                                                        <div>
                                                               <h2 className="text-xl font-black text-foreground tracking-tight">Nueva Reserva</h2>
                                                               <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                                                      <CalendarDays size={13} />
                                                                      <span className="text-xs font-semibold capitalize">
                                                                             {format(initialDate, "EEEE d 'de' MMMM", { locale: es })}
                                                                      </span>
                                                               </div>
                                                        </div>
                                                 </div>
                                                 <button
                                                        onClick={onClose}
                                                        className="w-9 h-9 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all flex items-center justify-center"
                                                 >
                                                        <X size={18} />
                                                 </button>
                                          </div>

                                          {/* Divider */}
                                          <div className="h-px bg-border mx-6 sm:mx-8" />

                                          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                        <div className="flex flex-col md:flex-row">
                                                               {/* Left Column: Client + Schedule */}
                                                               <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6">

                                                                      {/* Booking Type Selector (Tabs) */}
                                                                      <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/50">
                                                                             {[
                                                                                    { id: 'NORMAL', label: 'Reserva', icon: Sparkles },
                                                                                    { id: 'CLASS', label: 'Clase', icon: User },
                                                                                    { id: 'MATCH', label: 'Partido', icon: UserCheck }
                                                                             ].map((type) => (
                                                                                    <button
                                                                                           key={type.id}
                                                                                           type="button"
                                                                                           onClick={() => setFormData({ ...formData, bookingType: type.id as any })}
                                                                                           className={cn(
                                                                                                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                                                                                                  formData.bookingType === type.id 
                                                                                                         ? "bg-card text-primary shadow-sm border border-border" 
                                                                                                         : "text-muted-foreground hover:text-foreground"
                                                                                           )}
                                                                                    >
                                                                                           <type.icon size={14} />
                                                                                           {type.label}
                                                                                    </button>
                                                                             ))}
                                                                      </div>

                                                                      {/* Error */}
                                                                      <AnimatePresence>
                                                                             {error && (
                                                                                    <motion.div
                                                                                           initial={{ opacity: 0, height: 0 }}
                                                                                           animate={{ opacity: 1, height: 'auto' }}
                                                                                           exit={{ opacity: 0, height: 0 }}
                                                                                           className="overflow-hidden"
                                                                                    >
                                                                                           <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-3">
                                                                                                  <AlertTriangle size={16} className="shrink-0" />
                                                                                                  {error}
                                                                                           </div>
                                                                                    </motion.div>
                                                                             )}
                                                                      </AnimatePresence>

                                                                      {/* Client Name */}
                                                                      <div className="space-y-2 relative">
                                                                             <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">Nombre</label>
                                                                             <div className="relative">
                                                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                           <Search size={16} className="text-muted-foreground" />
                                                                                    </div>
                                                                                    <input
                                                                                           required
                                                                                           type="text"
                                                                                           className="block w-full pl-11 pr-4 py-3.5 text-sm font-semibold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder-muted-foreground/60 transition-all outline-none"
                                                                                           autoFocus
                                                                                           placeholder="Buscar o escribir nombre..."
                                                                                           value={formData.name}
                                                                                           onChange={(e) => handleClientSearch(e.target.value)}
                                                                                           onFocus={() => { if (formData.name.length > 2) setShowSuggestions(true) }}
                                                                                           onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                                                                    />
                                                                             </div>

                                                                             {/* Autocomplete Dropdown */}
                                                                             <AnimatePresence>
                                                                                    {showSuggestions && searchResults.length > 0 && (
                                                                                           <motion.div
                                                                                                  initial={{ opacity: 0, y: -4 }}
                                                                                                  animate={{ opacity: 1, y: 0 }}
                                                                                                  exit={{ opacity: 0, y: -4 }}
                                                                                                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto"
                                                                                           >
                                                                                                  {searchResults.map((client) => (
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
                                                                                                                className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center gap-3 border-b border-border/30 last:border-0 transition-colors"
                                                                                                         >
                                                                                                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                                                                                                                       {client.name.charAt(0).toUpperCase()}
                                                                                                                </div>
                                                                                                                <div className="min-w-0">
                                                                                                                       <p className="text-sm font-bold text-foreground truncate">{client.name}</p>
                                                                                                                       <p className="text-[11px] text-muted-foreground">{client.phone || 'Sin teléfono'}</p>
                                                                                                                </div>
                                                                                                                {client.membershipStatus === 'ACTIVE' && (
                                                                                                                       <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase shrink-0">Socio</span>
                                                                                                                )}
                                                                                                         </button>
                                                                                                  ))}
                                                                                           </motion.div>
                                                                                    )}
                                                                             </AnimatePresence>
                                                                      </div>

                                                                      {/* Phone + Email Row */}
                                                                      <div className="grid grid-cols-2 gap-3">
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">WhatsApp</label>
                                                                                    <div className="relative">
                                                                                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                                  <Phone size={14} className="text-muted-foreground" />
                                                                                           </div>
                                                                                           <input
                                                                                                  required
                                                                                                  type="tel"
                                                                                                  className="block w-full pl-11 pr-4 py-3.5 text-sm font-semibold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder-muted-foreground/60 transition-all outline-none"
                                                                                                  placeholder="351..."
                                                                                                  value={formData.phone}
                                                                                                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                                                           />
                                                                                    </div>
                                                                             </div>
                                                                             <div className="space-y-2">
                                                                                    <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">Email <span className="opacity-50">(opc.)</span></label>
                                                                                    <div className="relative">
                                                                                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                                  <Mail size={14} className="text-muted-foreground" />
                                                                                           </div>
                                                                                           <input
                                                                                                  type="email"
                                                                                                  className="block w-full pl-11 pr-4 py-3.5 text-sm font-semibold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder-muted-foreground/60 transition-all outline-none"
                                                                                                  placeholder="correo@..."
                                                                                                  value={formData.email}
                                                                                                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                                                           />
                                                                                    </div>
                                                                             </div>
                                                                      </div>

                                                                      {/* Dynamic Fields (Academy / Match) */}
                                                                      <AnimatePresence mode="wait">
                                                                             {formData.bookingType === 'CLASS' && (
                                                                                    <motion.div
                                                                                           key="class-fields"
                                                                                           initial={{ opacity: 0, height: 0 }}
                                                                                           animate={{ opacity: 1, height: 'auto' }}
                                                                                           exit={{ opacity: 0, height: 0 }}
                                                                                           className="space-y-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl overflow-hidden"
                                                                                    >
                                                                                           <label className="text-[11px] font-bold text-primary uppercase tracking-wider">Profesor de Academia</label>
                                                                                           <div className="relative">
                                                                                                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary">
                                                                                                         <User size={14} />
                                                                                                  </div>
                                                                                                  <select
                                                                                                         required
                                                                                                         className="block w-full pl-11 pr-10 py-3.5 text-sm font-bold bg-card border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground appearance-none shadow-sm"
                                                                                                         value={formData.teacherId}
                                                                                                         onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                                                                                                  >
                                                                                                         <option value="">Seleccionar Profesor...</option>
                                                                                                         {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                                                  </select>
                                                                                                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                                                                                           </div>
                                                                                    </motion.div>
                                                                             )}

                                                                             {formData.bookingType === 'MATCH' && (
                                                                                    <motion.div
                                                                                           key="match-fields"
                                                                                           initial={{ opacity: 0, height: 0 }}
                                                                                           animate={{ opacity: 1, height: 'auto' }}
                                                                                           exit={{ opacity: 0, height: 0 }}
                                                                                           className="space-y-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl overflow-hidden"
                                                                                    >
                                                                                           <div className="flex justify-between items-center">
                                                                                                  <label className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Nivel Sugerido del Partido</label>
                                                                                                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">⭐ {formData.skillLevel}</span>
                                                                                           </div>
                                                                                           <input 
                                                                                                  type="range"
                                                                                                  min="1.0"
                                                                                                  max="7.0"
                                                                                                  step="0.5"
                                                                                                  value={formData.skillLevel}
                                                                                                  onChange={e => setFormData({ ...formData, skillLevel: e.target.value })}
                                                                                                  className="w-full accent-emerald-500 h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                                                                                           />
                                                                                           <div className="flex justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-widest px-1">
                                                                                                  <span>Principiante</span>
                                                                                                  <span>Pro</span>
                                                                                           </div>
                                                                                    </motion.div>
                                                                             )}
                                                                      </AnimatePresence>

                                                                      {/* Time + Court Row */}
                                                                       <div className="grid grid-cols-2 gap-3">
                                                                              <div className="space-y-2">
                                                                                     <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">Horario</label>
                                                                                     <div className="relative">
                                                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                                   <Clock size={14} className="text-primary" />
                                                                                            </div>
                                                                                            <select
                                                                                                   className="block w-full pl-11 pr-10 py-3.5 text-sm font-bold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-foreground appearance-none transition-all"
                                                                                                   value={formData.time}
                                                                                                   onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                                                            >
                                                                                                   {timeOptions.map(t => <option key={t} value={t}>{t} Hs</option>)}
                                                                                            </select>
                                                                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                                                                     </div>
                                                                              </div>
                                                                              <div className="space-y-2">
                                                                                     <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">Cancha</label>
                                                                                    <div className="relative">
                                                                                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                                                                  <MapPin size={14} className="text-primary" />
                                                                                           </div>
                                                                                           <select
                                                                                                  className="block w-full pl-11 pr-10 py-3.5 text-sm font-bold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none text-foreground appearance-none transition-all"
                                                                                                  value={formData.courtId}
                                                                                                  onChange={e => setFormData({ ...formData, courtId: Number(e.target.value) })}
                                                                                           >
                                                                                                  {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                                                           </select>
                                                                                           <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                                                                    </div>
                                                                             </div>
                                                                      </div>

                                                                      {/* Quick Toggles: Member + Recurring */}
                                                                      <div className="flex gap-3">
                                                                             <button
                                                                                    type="button"
                                                                                    onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}
                                                                                    className={cn(
                                                                                           "flex-1 flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                                                                                           formData.isMember
                                                                                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                                                                                  : "bg-muted/30 border-border/40 text-muted-foreground hover:border-border"
                                                                                    )}
                                                                             >
                                                                                    <UserCheck size={16} />
                                                                                    <div className="text-left">
                                                                                           <p className="text-[11px] font-bold leading-none">Socio</p>
                                                                                           <p className="text-[9px] opacity-60 mt-0.5">Tarifa preferencial</p>
                                                                                    </div>
                                                                                    {formData.isMember && <CheckCircle2 size={14} className="ml-auto" />}
                                                                             </button>
                                                                             <button
                                                                                    type="button"
                                                                                    onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                                                                                    className={cn(
                                                                                           "flex-1 flex items-center gap-3 p-3.5 rounded-xl border transition-all",
                                                                                           formData.isRecurring
                                                                                                  ? "bg-primary/10 border-primary/30 text-primary"
                                                                                                  : "bg-muted/30 border-border/40 text-muted-foreground hover:border-border"
                                                                                    )}
                                                                             >
                                                                                    <Repeat size={16} />
                                                                                    <div className="text-left">
                                                                                           <p className="text-[11px] font-bold leading-none">Fijo</p>
                                                                                           <p className="text-[9px] opacity-60 mt-0.5">Semanal</p>
                                                                                    </div>
                                                                                    {formData.isRecurring && <CheckCircle2 size={14} className="ml-auto" />}
                                                                             </button>
                                                                      </div>

                                                                      {/* Recurring Config */}
                                                                      <AnimatePresence>
                                                                             {formData.isRecurring && (
                                                                                    <motion.div
                                                                                           initial={{ opacity: 0, height: 0 }}
                                                                                           animate={{ opacity: 1, height: 'auto' }}
                                                                                           exit={{ opacity: 0, height: 0 }}
                                                                                           className="overflow-hidden"
                                                                                    >
                                                                                           <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl space-y-3">
                                                                                                  <div className="flex items-center gap-2 text-primary">
                                                                                                         <Repeat size={14} />
                                                                                                         <span className="text-[11px] font-bold uppercase tracking-wider">Repetir hasta</span>
                                                                                                  </div>
                                                                                                  <input
                                                                                                         type="date"
                                                                                                         value={formData.recurringEndDate}
                                                                                                         onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                                                                                         className="w-full bg-background border border-border/50 rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                                                                                  />
                                                                                           </div>
                                                                                    </motion.div>
                                                                             )}
                                                                      </AnimatePresence>

                                                                      {/* Notes Toggle */}
                                                                      {!showNotes ? (
                                                                             <button
                                                                                    type="button"
                                                                                    onClick={() => setShowNotes(true)}
                                                                                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold"
                                                                             >
                                                                                    <FileText size={14} />
                                                                                    Agregar nota...
                                                                             </button>
                                                                      ) : (
                                                                             <motion.div
                                                                                    initial={{ opacity: 0, height: 0 }}
                                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                                    className="space-y-2 overflow-hidden"
                                                                             >
                                                                                    <label className="text-[11px] font-bold text-muted-foreground ml-1 uppercase tracking-wider">Notas</label>
                                                                                    <textarea
                                                                                           autoFocus
                                                                                           className="block w-full px-4 py-3 text-sm font-semibold bg-muted/40 border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-foreground placeholder-muted-foreground/60 transition-all outline-none min-h-[80px] resize-none"
                                                                                           placeholder="Alguna aclaración?"
                                                                                           value={formData.notes}
                                                                                           onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                                                    />
                                                                             </motion.div>
                                                                      )}
                                                               </div>

                                                               {/* Right Column: Payment */}
                                                               <div className="md:w-[320px] p-6 sm:p-8 md:border-l border-t md:border-t-0 border-border bg-muted/20 space-y-6">

                                                                      {/* Price Card */}
                                                                      <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5 shadow-sm">
                                                                             <div className="flex items-center justify-between">
                                                                                    <div>
                                                                                           <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                                                                                           {estimatedPrice !== null && !isManualPrice && (
                                                                                                  <p className="text-[10px] text-primary font-semibold mt-0.5">Precio sugerido</p>
                                                                                           )}
                                                                                           {isManualPrice && (
                                                                                                  <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Precio manual</p>
                                                                                           )}
                                                                                    </div>
                                                                                    {isEditingPrice ? (
                                                                                           <div className="flex items-center gap-1">
                                                                                                  <span className="text-2xl font-black text-foreground">$</span>
                                                                                                  <input
                                                                                                         type="number"
                                                                                                         autoFocus
                                                                                                         className="w-28 bg-transparent text-3xl font-black outline-none text-foreground border-b-2 border-primary text-right"
                                                                                                         value={formData.priceOverride}
                                                                                                         onChange={e => {
                                                                                                                setFormData({ ...formData, priceOverride: e.target.value })
                                                                                                                setIsManualPrice(true)
                                                                                                         }}
                                                                                                         onBlur={() => setIsEditingPrice(false)}
                                                                                                         onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingPrice(false) }}
                                                                                                  />
                                                                                           </div>
                                                                                    ) : (
                                                                                           <button
                                                                                                  type="button"
                                                                                                  onClick={() => setIsEditingPrice(true)}
                                                                                                  className="group flex items-center gap-2 transition-all hover:opacity-80 active:scale-95"
                                                                                           >
                                                                                                  <span className="text-3xl font-black text-foreground tracking-tighter">
                                                                                                         ${displayPrice.toLocaleString()}
                                                                                                  </span>
                                                                                                  <DollarSign size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                                                                           </button>
                                                                                    )}
                                                                             </div>

                                                                             <div className="h-px bg-border" />

                                                                             <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 space-y-2">
                                                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                                                                           Cobro pendiente
                                                                                    </p>
                                                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                                                           Este formulario solo crea la reserva. El cobro se registra después desde la ventana de pagos o gestión del turno.
                                                                                    </p>
                                                                             </div>
                                                                      </div>

                                                                      {/* WhatsApp Info */}
                                                                      <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                                                             <MessageCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                                                             <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                                                    Se notificará al cliente por WhatsApp si el teléfono es válido.
                                                                             </p>
                                                                      </div>

                                                                      {/* Quick Shortcut */}
                                                                      <button
                                                                             type="button"
                                                                             onClick={() => {
                                                                                    if (!formData.notes) {
                                                                                           setFormData({ ...formData, notes: 'Alquila paletas' })
                                                                                           setShowNotes(true)
                                                                                    }
                                                                             }}
                                                                             className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                                                                      >
                                                                             <User size={14} />
                                                                             Atajo: Paletas
                                                                      </button>
                                                               </div>
                                                        </div>
                                                 </div>

                                                 {/* Footer */}
                                                 <div className="border-t border-border px-6 sm:px-8 py-4 flex items-center justify-between gap-3 bg-card shrink-0">
                                                        <button
                                                               onClick={onClose}
                                                               type="button"
                                                               disabled={isSubmitting}
                                                               className="px-5 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                                        >
                                                               Cancelar
                                                        </button>
                                                        <button
                                                               onClick={() => handleSubmit()}
                                                               disabled={isSubmitting || !formData.name || !formData.phone}
                                                               type="button"
                                                               className="px-8 py-3 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2.5 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
                                                        >
                                                               {isSubmitting ? (
                                                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                               ) : (
                                                                      <CheckCircle2 size={18} />
                                                               )}
                                                               {isSubmitting ? 'Guardando...' : 'Confirmar Reserva'}
                                                        </button>
                                                 </div>
                                          </form>

                                          {/* Submitting Overlay */}
                                          <AnimatePresence>
                                                 {isSubmitting && (
                                                        <motion.div
                                                               initial={{ opacity: 0 }}
                                                               animate={{ opacity: 1 }}
                                                               exit={{ opacity: 0 }}
                                                               className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"
                                                        >
                                                               <div className="flex flex-col items-center gap-4">
                                                                      <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                                      <span className="text-sm font-bold text-muted-foreground">Procesando...</span>
                                                               </div>
                                                        </motion.div>
                                                 )}
                                          </AnimatePresence>
                                   </motion.div>
                            </div>
                     )}
              </AnimatePresence>,
              document.body
       )
}
