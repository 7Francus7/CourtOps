'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking } from '@/actions/public-booking'
import { createPreference } from '@/actions/mercadopago'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { OpenMatch } from '@/actions/open-matches'
import OpenMatchesFeed from './OpenMatchesFeed'
import {
       CalendarDays,
       MapPin,
       User,
       Zap,
       ChevronRight,
       ArrowRight,
       ArrowLeft,
       CheckCircle2,
       Clock,
       Trophy,
       Calendar,
       Users,
       ShieldCheck,
       CreditCard,
       MessageCircle,
       Phone,
       Search,
       Loader2,
       AlertCircle,
       Copy,
       Check,
       Lock,
       Share2,
       CalendarPlus,
       Sparkles,
       CircleDot,
       ChevronDown
} from 'lucide-react'
import VenueLayout from './VenueLayout'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = {
       club: {
              id: string
              name: string
              slug: string
              logoUrl?: string | null
              coverUrl?: string | null
              description?: string | null
              amenities?: string | null
              socialInstagram?: string | null
              socialFacebook?: string | null
              socialTwitter?: string | null
              socialTiktok?: string | null
              mpAlias?: string | null
              mpCvu?: string | null
              mpAccessToken?: string | null
              mpPublicKey?: string | null
              bookingDeposit?: number | null
              phone?: string | null
              themeColor?: string | null
              address?: string | null
              slotDuration?: number | null
       }
       initialDateStr: string
       openMatches?: OpenMatch[]
}

function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 197, 94';
}

type BookingMode = 'guest' | 'premium' | null

// Extracted PageWrapper to prevent re-renders losing focus
interface PageWrapperProps {
       children: React.ReactNode
       hideHeader?: boolean
       step: number | string
       goToStep: (step: number | string) => void
       club: Props['club']
       primaryColor: string
       primaryRgb: string
}

const PageWrapper = ({ children, hideHeader = false, step, goToStep, club }: PageWrapperProps) => (
       <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 font-sans relative flex flex-col overflow-x-hidden transition-colors duration-300">
              {/* Ambient glow */}
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                     <div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-primary/8 dark:bg-primary/5 rounded-full blur-[150px] animate-pulse" />
                     <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[40%] bg-blue-400/5 dark:bg-blue-500/3 rounded-full blur-[120px]" />
              </div>

              {!hideHeader && (
                     <header className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl border-b border-gray-100/80 dark:border-white/[0.04] px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                   {(step !== 0) && (
                                          <button
                                                 onClick={() => {
                                                        if (step === 3) goToStep(0)
                                                        else if (step === 2) goToStep(1)
                                                        else if (step === 1) goToStep(0)
                                                        else if (step === 'matchmaking') goToStep(0)
                                                        else if (step === 'login' || step === 'register') goToStep(0)
                                                 }}
                                                 className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.08] text-gray-500 dark:text-gray-400 transition-all active:scale-95"
                                          >
                                                 <ArrowLeft size={17} strokeWidth={2.5} />
                                          </button>
                                   )}
                                   <span className="font-bold text-[11px] uppercase tracking-[0.15em] text-primary">{club.name}</span>
                            </div>
                            <ThemeToggle />
                     </header>
              )}
              <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-5 py-6 relative z-10">
                     <AnimatePresence initial={false} custom={0} mode="wait">
                            <motion.div
                                   key={step}
                                   initial={{ opacity: 0, y: 12 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, y: -12 }}
                                   transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                   className="flex-1 flex flex-col"
                            >
                                   {children}
                            </motion.div>
                     </AnimatePresence>
              </main>
       </div>
)

export default function PublicBookingWizard({ club, initialDateStr, openMatches = [] }: Props) {
       const today = useMemo(() => new Date(initialDateStr), [initialDateStr])
       const primaryColor = club.themeColor || '#22c55e'
       const primaryRgb = hexToRgb(primaryColor)

       // --- TABS & LAYOUT ---
       const [layoutTab, setLayoutTab] = useState<'booking' | 'info'>('booking')

       const handleBack = () => {
              if (step === 2) setStep(0)
              else if ((step as any) === 'login' || (step as any) === 'register' || (step as any) === 'matchmaking') setStep(2)
              else if (step === 3) setStep(0)
       }

       // Payment Return Handler
       const searchParams = useSearchParams()
       useEffect(() => {
              const status = searchParams.get('status')
              const externalRef = searchParams.get('external_reference')

              if (status === 'approved' && externalRef) {
                     getPublicBooking(Number(externalRef), club.id).then(booking => {
                            if (booking && booking.court) {
                                   setStep(3)
                                   setCreatedBookingId(booking.id)
                                   setMode(booking.guestName ? 'guest' : 'premium')
                                   const date = new Date(booking.startTime)
                                   setSelectedDate(date)
                                   setSelectedSlot({
                                          time: format(date, 'HH:mm'),
                                          price: Number(booking.price),
                                          courtId: booking.court.id,
                                          courtName: booking.court.name
                                   })
                                   import('canvas-confetti').then(mod => mod.default({ particleCount: 150, spread: 80, origin: { y: 0.6 } }))
                            }
                     }).catch(console.error)
              }
       }, [searchParams])

       const [direction, setDirection] = useState(0)
       const [step, setStep] = useState<number | 'register' | 'login' | 'matchmaking'>(0)
       const [mode, setMode] = useState<BookingMode>(null)
       const [selectedDate, setSelectedDate] = useState<Date>(today)
       const [slots, setSlots] = useState<any[]>([])
       const [loading, setLoading] = useState(true)
       const [selectedSlot, setSelectedSlot] = useState<{ time: string, price: number, courtId: number, courtName: string } | null>(null)
       const selectedDuration = 90
       const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [registerError, setRegisterError] = useState('')
       const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)
       const [createOpenMatch, setCreateOpenMatch] = useState(false)
       const [matchLevel, setMatchLevel] = useState('6ta')
       const [matchGender, setMatchGender] = useState('Masculino')
       const [consentAccepted, setConsentAccepted] = useState(false)
       const [copied, setCopied] = useState(false)
       const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

       // Helpers for navigation with direction
       const goToStep = (newStep: number | string) => {
              const currentStepIndex = typeof step === 'number' ? step : (step === 'register' ? 0.5 : 0.8)
              const newStepIndex = typeof newStep === 'number' ? newStep : (newStep === 'register' ? 0.5 : 0.8)
              setDirection(newStepIndex > currentStepIndex ? 1 : -1)
              setStep(newStep as any)
       }

       useEffect(() => {
              // Slots should load if we are on step 0 (Venue Page) or step 1
              if (step !== 0 && step !== 1) return
              const fetchSlots = async () => {
                     setLoading(true)
                     setSelectedSlot(null)
                     try {
                            const data = await getPublicAvailability(club.id, selectedDate, selectedDuration)
                            setSlots(data)
                     } catch (error) {
                            console.error(error)
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id, step, selectedDuration])

       const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i)), [today])

       const handleLogin = async (e: React.FormEvent) => {
              e.preventDefault()
              setIsSubmitting(true)
              try {
                     const client = await getPublicClient(club.id, clientData.phone)
                     if (client) {
                            const parts = client.name.split(' ')
                            const name = parts[0]
                            const lastname = parts.slice(1).join(' ') || ''
                            setClientData({ name, lastname, phone: client.phone, email: client.email || '' })
                            setMode('premium')
                            goToStep(1)
                     } else {
                            alert('No encontramos una cuenta con este número. Por favor regístrate.')
                            goToStep('register')
                     }
              } catch (error) {
                     console.error(error)
                     alert('Ocurrió un error al buscar tu cuenta.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleRegisterSubmit = async (e: React.FormEvent) => {
              e.preventDefault()
              if (!clientData.name || !clientData.lastname || !clientData.phone) return
              setIsSubmitting(true)
              try {
                     const existing = await getPublicClient(club.id, clientData.phone)
                     if (existing) {
                            setRegisterError('Ya existe una cuenta con este número. Usá "Iniciar Sesión" para ingresar.')
                            return
                     }
                     setRegisterError('')
                     goToStep(1)
              } catch {
                     setRegisterError('Error al verificar tu cuenta. Intentá de nuevo.')
              } finally {
                     setIsSubmitting(false)
              }
       }

       const handleBooking = async (e: React.FormEvent) => {
              if (e) e.preventDefault()
              if (!selectedSlot) return
              setIsSubmitting(true)

              const fullName = mode === 'premium'
                     ? `${clientData.name} ${clientData.lastname}`.trim()
                     : clientData.name

              const res = await createPublicBooking({
                     clubId: club.id,
                     courtId: selectedSlot.courtId,
                     dateStr: format(selectedDate, 'yyyy-MM-dd'),
                     timeStr: selectedSlot.time,
                     clientName: fullName,
                     clientPhone: clientData.phone,
                     email: clientData.email,
                     isGuest: mode === 'guest',
                     isOpenMatch: createOpenMatch,
                     matchLevel: createOpenMatch ? matchLevel : undefined,
                     matchGender: createOpenMatch ? matchGender : undefined,
                     durationMinutes: selectedDuration
              })

              if (res.success && res.bookingId) {
                     setCreatedBookingId(res.bookingId)
                     goToStep(3)
                     import('canvas-confetti').then(mod => mod.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } }))
              } else {
                     alert("Error: " + res.error)
              }
              setIsSubmitting(false)
       }

       const handlePayment = async () => {
              if (!createdBookingId) return
              setIsPaying(true)
              const res = await createPreference(createdBookingId, `/p/${club.slug}`)
              setIsPaying(false)
              if (res.success && res.init_point) {
                     window.location.href = res.init_point
              } else {
                     alert("Error al generar pago: " + (res.error || 'Desconocido'))
              }
       }

       // ============================================
       // WIZARD RENDER — UNIFIED VENUE LAYOUT
       // ============================================
       if (step !== 3) {
              return (
                     <VenueLayout 
                            club={club} 
                            activeTab={layoutTab} 
                            setActiveTab={setLayoutTab}
                            onBack={step !== 0 ? handleBack : undefined}
                     >
                            {layoutTab === 'booking' && (
                                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                          {step === 0 && (
                                                 <div className="space-y-8">
                                                        <div className="space-y-4">
                                                               <div className="flex items-center justify-between px-1">
                                                                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{format(selectedDate, 'MMMM yyyy', { locale: es })}</h3>
                                                                      <span className="text-[10px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">Hoy: {format(today, 'd/M')}</span>
                                                               </div>
                                                               <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                                                                      {days.map((date) => {
                                                                             const isSelected = isSameDay(date, selectedDate)
                                                                             return (
                                                                                    <button
                                                                                           key={date.toString()}
                                                                                           onClick={() => setSelectedDate(date)}
                                                                                           className={cn(
                                                                                                  "flex flex-col items-center justify-center min-w-[62px] h-[82px] rounded-2xl transition-all duration-300 snap-center border",
                                                                                                  isSelected 
                                                                                                         ? "bg-primary text-white shadow-xl shadow-primary/30 border-primary scale-105" 
                                                                                                         : "bg-white dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-primary/40"
                                                                                           )}
                                                                                    >
                                                                                           <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] mb-1 opacity-70", isSelected && "text-white")}>{format(date, 'eee', { locale: es })}</span>
                                                                                           <span className={cn("text-lg font-black tracking-tight", isSelected ? "text-white" : "text-slate-700 dark:text-slate-200")}>{format(date, 'd')}</span>
                                                                                           {isSelected && <motion.div layoutId="dot" className="w-1.5 h-1.5 bg-white rounded-full mt-1" />}
                                                                                    </button>
                                                                             )
                                                                      })}
                                                               </div>
                                                        </div>

                                                        <div className="space-y-5">
                                                               <div className="flex items-center justify-between px-1">
                                                                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleccioná un Horario</h3>
                                                                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200/60 dark:border-white/5">
                                                                             <Clock size={10} className="text-slate-400" />
                                                                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{selectedDuration} MIN</span>
                                                                      </div>
                                                               </div>

                                                               <div className="grid grid-cols-1 gap-3">
                                                                      {loading ? (
                                                                             <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                                                    <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Buscando disponibilidad...</p>
                                                                             </div>
                                                                      ) : slots.length > 0 ? (
                                                                             slots.map((slot, idx) => {
                                                                                    const isExpanded = expandedSlot === slot.time
                                                                                    return (
                                                                                           <div key={slot.time} className="space-y-2">
                                                                                                  <motion.button
                                                                                                         initial={{ opacity: 0, y: 10 }}
                                                                                                         animate={{ opacity: 1, y: 0 }}
                                                                                                         transition={{ delay: idx * 0.03 }}
                                                                                                         onClick={() => setExpandedSlot(isExpanded ? null : slot.time)}
                                                                                                         className={cn(
                                                                                                                "w-full flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-[1.5rem] transition-all group hover:border-primary/40",
                                                                                                                isExpanded ? "ring-2 ring-primary ring-offset-4 ring-offset-[#F8FAFC] dark:ring-offset-zinc-950 shadow-2xl" : "shadow-sm"
                                                                                                         )}
                                                                                                  >
                                                                                                         <div className="flex items-center gap-4">
                                                                                                                <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                                                                                                                       <Clock size={20} className="text-primary" />
                                                                                                                </div>
                                                                                                                <div className="text-left">
                                                                                                                       <p className="text-xl font-black tracking-tighter dark:text-white uppercase leading-none">{slot.time}<span className="text-[10px] text-slate-400 ml-1">HS</span></p>
                                                                                                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Desde ${slot.minPrice}</p>
                                                                                                                </div>
                                                                                                         </div>
                                                                                                         <div className={cn(
                                                                                                                "w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 transition-all",
                                                                                                                isExpanded && "rotate-180 bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                                                                         )}>
                                                                                                                <ChevronDown size={14} strokeWidth={3} />
                                                                                                         </div>
                                                                                                  </motion.button>

                                                                                                  <AnimatePresence>
                                                                                                         {isExpanded && (
                                                                                                                <motion.div 
                                                                                                                       initial={{ height: 0, opacity: 0 }}
                                                                                                                       animate={{ height: 'auto', opacity: 1 }}
                                                                                                                       exit={{ height: 0, opacity: 0 }}
                                                                                                                       className="grid grid-cols-1 gap-2 pt-1 pb-3 px-2"
                                                                                                                >
                                                                                                                       {slot.courts.map((court: any) => (
                                                                                                                              <button
                                                                                                                                     key={court.id}
                                                                                                                                     onClick={() => {
                                                                                                                                            setSelectedSlot({
                                                                                                                                                   time: slot.time,
                                                                                                                                                   courtId: court.id,
                                                                                                                                                   courtName: court.name,
                                                                                                                                                   price: court.price
                                                                                                                                            });
                                                                                                                                            goToStep(2);
                                                                                                                                     }}
                                                                                                                                     className="flex items-center justify-between p-4 bg-primary/[0.03] dark:bg-primary/[0.05] border border-primary/10 rounded-[1.25rem] hover:bg-primary hover:text-white transition-all group/court shadow-sm active:scale-[0.98]"
                                                                                                                              >
                                                                                                                                     <div className="flex items-center gap-4">
                                                                                                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center text-primary group-hover/court:bg-white/20 group-hover/court:text-white transition-colors">
                                                                                                                                                   <Trophy size={18} />
                                                                                                                                            </div>
                                                                                                                                            <span className="text-[13px] font-black uppercase tracking-tight">{court.name}</span>
                                                                                                                                     </div>
                                                                                                                                     <div className="text-right">
                                                                                                                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">Precio Total</p>
                                                                                                                                            <p className="text-base font-black tracking-tighter">${court.price}</p>
                                                                                                                                     </div>
                                                                                                                              </button>
                                                                                                                       ))}
                                                                                                                </motion.div>
                                                                                                         )}
                                                                                                  </AnimatePresence>
                                                                                           </div>
                                                                                    )
                                                                             })
                                                                      ) : (
                                                                             <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 border border-dashed border-slate-200/60 dark:border-white/10 rounded-[2.5rem] opacity-60">
                                                                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center mb-6">
                                                                                           <Calendar size={40} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
                                                                                    </div>
                                                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sin turnos para este día</p>
                                                                             </div>
                                                                      )}
                                                               </div>
                                                        </div>

                                                        {openMatches.length > 0 && (
                                                               <motion.button 
                                                                      whileHover={{ scale: 1.02 }}
                                                                      whileTap={{ scale: 0.98 }}
                                                                      onClick={() => goToStep('matchmaking')}
                                                                      className="w-full relative overflow-hidden p-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/30 group"
                                                               >
                                                                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors duration-500" />
                                                                      <div className="relative z-10 flex items-center justify-between">
                                                                             <div className="flex items-center gap-5 text-left">
                                                                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/10 shadow-inner">
                                                                                           <Trophy size={28} />
                                                                                    </div>
                                                                                    <div>
                                                                                           <h4 className="text-lg font-black tracking-tight leading-tight">Matchmaking</h4>
                                                                                           <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">{openMatches.length} Partidos Abiertos</p>
                                                                                    </div>
                                                                             </div>
                                                                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform border border-white/5">
                                                                                    <ChevronRight size={20} className="text-primary" />
                                                                             </div>
                                                                      </div>
                                                               </motion.button>
                                                        )}
                                                 </div>
                                          )}

                                          {step === 'matchmaking' && (
                                                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        <OpenMatchesFeed matches={openMatches} />
                                                 </div>
                                          )}
                                   </div>
                            )}
                     </VenueLayout>
              )
       }

       if (step === 3 && selectedSlot) {
              const isGuest = mode === 'guest'
              return (
                     <PageWrapper hideHeader step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col flex-1 items-center justify-center py-6 w-full max-w-[360px] mx-auto">
                                   <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/40 mb-5">
                                          <div className="relative p-7 pb-10 bg-gradient-to-br from-primary via-primary to-primary/90 text-white text-center overflow-hidden">
                                                 <div className="absolute top-[-30%] right-[-20%] w-[60%] h-[120%] bg-white/[0.06] rounded-full blur-sm" />
                                                 <div className="absolute bottom-[-20%] left-[-15%] w-[40%] h-[80%] bg-white/[0.04] rounded-full" />
                                                 <div className="relative z-10 flex flex-col items-center">
                                                        <motion.div
                                                               initial={{ scale: 0 }}
                                                               animate={{ scale: 1 }}
                                                               transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                                                               className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30"
                                                        >
                                                               <Check size={24} strokeWidth={3} />
                                                        </motion.div>
                                                        <motion.h2
                                                               initial={{ opacity: 0, y: 10 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: 0.3 }}
                                                               className="text-lg font-bold uppercase tracking-tight mb-1"
                                                        >
                                                               Turno Reservado!
                                                        </motion.h2>
                                                        <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.15em]">{club.name}</p>
                                                 </div>
                                          </div>
                                          <div className="relative flex items-center justify-between -mt-4 px-0 z-20">
                                                 <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -ml-3.5" />
                                                 <div className="flex-1 border-b-2 border-dashed border-gray-200/30 dark:border-white/[0.06] mx-1" />
                                                 <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -mr-3.5" />
                                          </div>
                                          <div className="bg-zinc-900 p-6 pt-4 space-y-4">
                                                 <div className="flex justify-between items-start">
                                                        <div>
                                                               <p className="text-[8px] text-gray-500 uppercase font-semibold tracking-widest mb-1">Fecha</p>
                                                               <p className="font-bold text-base text-white capitalize leading-tight">{format(selectedDate, 'EEEE d', { locale: es })}</p>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[8px] text-gray-500 uppercase font-semibold tracking-widest mb-1">Hora</p>
                                                               <p className="font-bold text-2xl text-primary leading-none tracking-tight">{selectedSlot.time}<span className="text-xs ml-0.5 text-gray-500">HS</span></p>
                                                        </div>
                                                 </div>
                                                 <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] rounded-xl border border-white/[0.04]">
                                                        <span className="text-[10px] font-bold uppercase text-white tracking-wider">{selectedSlot.courtName}</span>
                                                        <span className="text-[12px] font-bold text-primary">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(selectedSlot.price)}</span>
                                                 </div>
                                                 {isGuest && (
                                                        <div className="flex items-center justify-center gap-2 py-3 bg-amber-500/[0.08] rounded-xl border border-amber-500/10">
                                                               <Lock size={11} className="text-amber-500" />
                                                               <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Reserva Pendiente</span>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>
                                   <div className="w-full grid grid-cols-2 gap-2.5 mb-3">
                                          <a
                                                 href={(() => {
                                                        const startDate = new Date(selectedDate)
                                                        const [hh, mm] = selectedSlot.time.split(':').map(Number)
                                                        startDate.setHours(hh, mm, 0)
                                                        const endDate = new Date(startDate)
                                                        endDate.setMinutes(endDate.getMinutes() + (club.slotDuration || 90))
                                                        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
                                                        const title = encodeURIComponent('Turno en ' + club.name)
                                                        const details = encodeURIComponent('Cancha: ' + selectedSlot.courtName + '\nPrecio: $' + selectedSlot.price + '\nReserva #' + createdBookingId)
                                                        const loc = encodeURIComponent(club.address || club.name)
                                                        return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + fmt(startDate) + '/' + fmt(endDate) + '&details=' + details + '&location=' + loc
                                                 })()}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="flex items-center justify-center gap-2 h-12 bg-white dark:bg-white/[0.03] rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-white/[0.06] hover:border-primary/40 hover:text-primary active:scale-[0.98] transition-all"
                                          >
                                                 <CalendarPlus size={14} className="text-primary" />
                                                 Calendario
                                          </a>
                                          <button
                                                 onClick={() => {
                                                        const dateStr = format(selectedDate, 'EEEE d/M', { locale: es })
                                                        const text = '\u00A1Reserv\u00E9 cancha! \uD83C\uDFBE\n\n\uD83D\uDCCD ' + club.name + '\n\uD83D\uDCC5 ' + dateStr + '\n\uD83D\uDD50 ' + selectedSlot.time + 'hs\n\uD83C\uDFDF\uFE0F ' + selectedSlot.courtName + '\n\n\u00BFJugamos? \uD83D\uDCAA'
                                                        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
                                                 }}
                                                 className="flex items-center justify-center gap-2 h-12 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                                          >
                                                 <Share2 size={14} />
                                                 Compartir
                                          </button>
                                   </div>
                                   <div className="w-full space-y-2.5">
                                          {isGuest ? (
                                                 club.mpAccessToken ? (
                                                        <button
                                                               onClick={handlePayment}
                                                               disabled={isPaying}
                                                               className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                        >
                                                               {isPaying ? <Loader2 className="animate-spin" size={16} /> : <>Pagar Sena con MercadoPago</>}
                                                        </button>
                                                 ) : (
                                                        <>
                                                               <div className="p-4 bg-zinc-900 rounded-xl text-center border border-white/[0.04]">
                                                                      <p className="text-[8px] text-gray-500 uppercase font-semibold tracking-widest mb-2">Transferencia Bancaria</p>
                                                                      <p
                                                                             className="text-base font-bold text-white tracking-tight select-all cursor-pointer hover:text-primary transition-colors"
                                                                             onClick={() => { navigator.clipboard.writeText(club.mpAlias || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                                                                      >
                                                                             {club.mpAlias || 'N/A'}
                                                                      </p>
                                                                      {copied && <p className="text-[9px] text-primary font-semibold mt-1 animate-pulse">Copiado!</p>}
                                                               </div>
                                                               <a
                                                                      href={`https://wa.me/${club.phone}?text=${encodeURIComponent(`Hola! Reservé el ${format(selectedDate, 'd/M')} a las ${selectedSlot.time}hs. Envío comprobante.`)}`}
                                                                      target="_blank"
                                                                      className="w-full h-12 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                               >
                                                                      <MessageCircle size={15} /> Enviar Comprobante
                                                               </a>
                                                        </>
                                                 )
                                          ) : (
                                                 <button
                                                        onClick={() => goToStep(0)}
                                                        className="w-full h-12 bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-white/[0.06] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-gray-300 dark:hover:border-white/[0.1] active:scale-[0.98] transition-all"
                                                 >
                                                        Volver al Inicio
                                                 </button>
                                          )}
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       return null
}
