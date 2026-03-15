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
import Image from 'next/image'
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
       CircleDot
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

type Props = {
       club: {
              id: string
              name: string
              logoUrl?: string | null
              slug: string
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
       const [copied, setCopied] = useState(false)

       // Helpers for navigation with direction
       const goToStep = (newStep: number | string) => {
              const currentStepIndex = typeof step === 'number' ? step : (step === 'register' ? 0.5 : 0.8)
              const newStepIndex = typeof newStep === 'number' ? newStep : (newStep === 'register' ? 0.5 : 0.8)
              setDirection(newStepIndex > currentStepIndex ? 1 : -1)
              setStep(newStep as any)
       }

       useEffect(() => {
              if (step !== 1) return
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

       const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today])

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
       // STEP 0 — HOME / LANDING
       // ============================================
       if (step === 0) {
              return (
                     <PageWrapper hideHeader step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col items-center flex-1 py-4">
                                   {/* Top bar */}
                                   <div className="flex justify-between w-full mb-10 items-center">
                                          <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-600 tracking-widest">{format(new Date(), 'EEEE d', { locale: es })}</span>
                                          <ThemeToggle />
                                   </div>

                                   {/* Club Brand */}
                                   <header className="flex flex-col items-center mb-14">
                                          <motion.div
                                                 initial={{ scale: 0.9, opacity: 0 }}
                                                 animate={{ scale: 1, opacity: 1 }}
                                                 transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                                 className="relative group mb-5"
                                          >
                                                 {/* Glow ring */}
                                                 <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 via-primary/10 to-blue-500/10 dark:from-primary/15 dark:via-primary/5 dark:to-blue-500/5 blur-2xl rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                                                 <div className="relative w-24 h-24 bg-white dark:bg-zinc-900 rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200/40 dark:shadow-black/40 border border-white dark:border-white/[0.06] overflow-hidden ring-1 ring-gray-100 dark:ring-white/[0.04]">
                                                        {club.logoUrl ? (
                                                               <Image src={club.logoUrl} alt={club.name} fill sizes="96px" priority className="object-cover" />
                                                        ) : (
                                                               <span className="text-primary text-4xl font-bold">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </motion.div>

                                          <motion.h2
                                                 initial={{ opacity: 0, y: 8 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.1 }}
                                                 className="text-2xl font-bold tracking-tight text-center leading-none mb-3 text-[#0F172A] dark:text-white"
                                          >
                                                 {club.name}
                                          </motion.h2>

                                          <motion.div
                                                 initial={{ opacity: 0, scale: 0.9 }}
                                                 animate={{ opacity: 1, scale: 1 }}
                                                 transition={{ delay: 0.2 }}
                                                 className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200/60 dark:border-emerald-500/15"
                                          >
                                                 <span className="relative flex h-1.5 w-1.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                                 </span>
                                                 <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">Club Abierto</span>
                                          </motion.div>
                                   </header>

                                   {/* Action Cards */}
                                   <div className="w-full space-y-3 mb-10">
                                          <p className="text-center text-[9px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-[0.25em] mb-5">Selecciona una opcion</p>

                                          {/* Reservar Turno */}
                                          <motion.button
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.15 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => { setMode('guest'); goToStep(1); }}
                                                 className="w-full group"
                                          >
                                                 <div className="w-full bg-white dark:bg-white/[0.03] rounded-2xl p-5 flex items-center justify-between border border-gray-100 dark:border-white/[0.05] shadow-sm shadow-gray-100/50 dark:shadow-none hover:shadow-md hover:shadow-gray-200/40 dark:hover:border-white/[0.08] transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/[0.08] flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                                                                      <Calendar size={22} />
                                                               </div>
                                                               <div className="text-left">
                                                                      <h3 className="text-[15px] font-bold tracking-tight leading-none mb-1 text-[#0F172A] dark:text-white group-hover:text-primary transition-colors">Reservar Turno</h3>
                                                                      <p className="text-gray-400 dark:text-gray-500 text-xs">Buscar horarios libres</p>
                                                               </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                               <ChevronRight size={16} />
                                                        </div>
                                                 </div>
                                          </motion.button>

                                          {/* Jugadores */}
                                          <motion.button
                                                 initial={{ opacity: 0, y: 10 }}
                                                 animate={{ opacity: 1, y: 0 }}
                                                 transition={{ delay: 0.2 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => goToStep('matchmaking')}
                                                 className="w-full group"
                                          >
                                                 <div className="w-full bg-white dark:bg-white/[0.03] rounded-2xl p-5 flex items-center justify-between border border-gray-100 dark:border-white/[0.05] shadow-sm shadow-gray-100/50 dark:shadow-none hover:shadow-md hover:shadow-gray-200/40 dark:hover:border-white/[0.08] transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/[0.08] flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform duration-300">
                                                                      <Trophy size={22} />
                                                               </div>
                                                               <div className="text-left">
                                                                      <div className="flex items-center gap-2 mb-1">
                                                                             <h3 className="text-[15px] font-bold tracking-tight leading-none text-[#0F172A] dark:text-white group-hover:text-orange-500 transition-colors">Jugadores</h3>
                                                                             {openMatches.length > 0 && (
                                                                                    <span className="bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md tabular-nums">{openMatches.length}</span>
                                                                             )}
                                                                      </div>
                                                                      <p className="text-gray-400 dark:text-gray-500 text-xs">Sumate a partidos abiertos</p>
                                                               </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                                               <ChevronRight size={16} />
                                                        </div>
                                                 </div>
                                          </motion.button>
                                   </div>

                                   {/* Member Section */}
                                   <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: 0.3 }}
                                          className="w-full mt-auto"
                                   >
                                          <div className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-gray-100/80 dark:border-white/[0.04] rounded-2xl p-5">
                                                 <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                               <User size={17} />
                                                        </div>
                                                        <div className="text-left">
                                                               <h4 className="text-sm font-bold tracking-tight text-[#1E293B] dark:text-white">Acceso Socios</h4>
                                                               <p className="text-[10px] text-gray-400 dark:text-gray-500">Gestiona tus abonos y perfil</p>
                                                        </div>
                                                 </div>
                                                 <div className="flex gap-2.5">
                                                        <button onClick={() => { setMode('premium'); goToStep('login'); }} className="flex-1 py-2.5 bg-white dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/[0.06] rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:border-primary/40 text-gray-500 dark:text-gray-400 transition-all active:scale-[0.98]">
                                                               Login
                                                        </button>
                                                        <button onClick={() => { setMode('premium'); goToStep('register'); }} className="flex-1 py-2.5 bg-white dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/[0.06] rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:border-primary/40 text-gray-500 dark:text-gray-400 transition-all active:scale-[0.98]">
                                                               Crear Cuenta
                                                        </button>
                                                 </div>
                                          </div>
                                   </motion.div>
                            </div>
                     </PageWrapper>
              )
       }

       // ============================================
       // STEP 1 — SELECT SLOT
       // ============================================
       if (step === 1) {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="space-y-6 pb-20">
                                   {/* Title */}
                                   <div className="flex flex-col gap-1">
                                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Paso 1 de 2</span>
                                          <h2 className="text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">Elegi tu turno</h2>
                                   </div>

                                   {/* Days Slider */}
                                   <div className="relative">
                                          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 snap-x">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        return (
                                                               <motion.button
                                                                      key={d.toString()}
                                                                      whileTap={{ scale: 0.95 }}
                                                                      onClick={() => setSelectedDate(d)}
                                                                      className={cn(
                                                                             "relative flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl transition-all duration-200 snap-center",
                                                                             active
                                                                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                                                    : "bg-white dark:bg-white/[0.03] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/[0.05] hover:border-gray-300 dark:hover:border-white/[0.08]"
                                                                      )}
                                                               >
                                                                      <span className={cn("text-[9px] font-bold uppercase tracking-widest mb-0.5", active ? "text-white/80" : "text-gray-400 dark:text-gray-500")}>
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className={cn("text-xl font-bold tracking-tight leading-none", active ? "text-white" : "text-gray-700 dark:text-gray-300")}>
                                                                             {format(d, 'd')}
                                                                      </span>
                                                               </motion.button>
                                                        )
                                                 })}
                                          </div>
                                   </div>

                                   {/* Slots */}
                                   <div className="space-y-3 mt-2">
                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                        <div className="relative">
                                                               <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                                        </div>
                                                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Buscando canchas...</p>
                                                 </div>
                                          ) : slots.length === 0 ? (
                                                 <div className="text-center py-16 px-6 bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.04] flex flex-col items-center gap-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                               <Search size={22} />
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">No hay turnos disponibles para esta fecha</p>
                                                 </div>
                                          ) : (
                                                 slots.map((slot, idx) => (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: 15 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: idx * 0.04, duration: 0.3 }}
                                                               key={idx}
                                                               className="bg-zinc-900 dark:bg-zinc-900 rounded-2xl p-5 flex flex-col gap-4 border border-white/[0.04] shadow-lg shadow-black/10"
                                                        >
                                                               {/* Time & Price */}
                                                               <div className="flex justify-between items-center">
                                                                      <div className="flex items-baseline gap-1.5">
                                                                             <span className="text-3xl font-bold tracking-tight text-white">{slot.time}</span>
                                                                             <span className="text-xs font-semibold text-gray-500">hs</span>
                                                                      </div>
                                                                      <div className="px-3 py-1 bg-primary/15 rounded-lg">
                                                                             <span className="text-[12px] font-bold text-primary">${slot.price.toLocaleString()}</span>
                                                                      </div>
                                                               </div>

                                                               {/* Courts */}
                                                               <div className="flex flex-wrap gap-2">
                                                                      {slot.courts.map((court: any) => (
                                                                             <button
                                                                                    key={court.id}
                                                                                    onClick={() => {
                                                                                           setSelectedSlot({ time: slot.time, price: slot.price, courtId: court.id, courtName: court.name })
                                                                                           goToStep(2)
                                                                                    }}
                                                                                    className="flex-1 min-w-[120px] py-3 bg-white/[0.04] hover:bg-primary hover:text-white rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.97] group border border-white/[0.04] hover:border-primary"
                                                                             >
                                                                                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-white mb-0.5">{court.name}</span>
                                                                                    <span className="text-[8px] font-semibold text-gray-500 group-hover:text-white/70 uppercase tracking-wider leading-none">{court.sport || 'PADEL'} &bull; {court.duration || selectedDuration} min</span>
                                                                             </button>
                                                                      ))}
                                                               </div>
                                                        </motion.div>
                                                 ))
                                          )}
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       // ============================================
       // STEP 2 — CONFIRM DATA
       // ============================================
       if (step === 2 && selectedSlot) {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 mb-6">
                                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Paso 2 de 2</span>
                                          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">Confirmar Datos</h2>
                                   </div>

                                   {/* Summary Card */}
                                   <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-white/[0.05] shadow-sm overflow-hidden mb-6">
                                          {/* Date row */}
                                          <div className="p-5 pb-4 flex items-center gap-4 border-b border-gray-100/80 dark:border-white/[0.04]">
                                                 <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/[0.08] flex items-center justify-center text-primary shrink-0">
                                                        <Calendar size={18} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-widest">Fecha & Hora</p>
                                                        <p className="font-bold text-base capitalize text-[#1E293B] dark:text-white leading-tight">
                                                               {format(selectedDate, 'EEE d', { locale: es })} &bull; {selectedSlot.time}hs
                                                        </p>
                                                 </div>
                                          </div>
                                          {/* Court + Price */}
                                          <div className="p-5 pt-4 flex justify-between items-center">
                                                 <div>
                                                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-widest mb-0.5">Cancha</p>
                                                        <p className="font-bold text-sm uppercase text-[#1E293B] dark:text-white">{selectedSlot.courtName}</p>
                                                 </div>
                                                 <div className="text-right">
                                                        <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-semibold tracking-widest mb-0.5">Precio</p>
                                                        <p className="font-bold text-xl text-primary tracking-tight">${selectedSlot.price.toLocaleString()}</p>
                                                 </div>
                                          </div>
                                   </div>

                                   {/* Form */}
                                   <form onSubmit={handleBooking} className="space-y-6 flex-1 flex flex-col">
                                          {mode === 'guest' ? (
                                                 <div className="space-y-4">
                                                        {/* Name */}
                                                        <div className="relative">
                                                               <input
                                                                      required type="text" id="name" autoComplete="name"
                                                                      className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all"
                                                                      placeholder=" " value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })}
                                                               />
                                                               <label htmlFor="name" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">Nombre Completo</label>
                                                        </div>

                                                        {/* Phone */}
                                                        <div className="relative">
                                                               <input
                                                                      required type="tel" id="phone" autoComplete="tel"
                                                                      className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all"
                                                                      placeholder=" " value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                               />
                                                               <label htmlFor="phone" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">Telefono</label>
                                                        </div>

                                                        {/* Deposit Notice */}
                                                        {(club.bookingDeposit !== null && club.bookingDeposit !== undefined) && (
                                                               <div className="p-4 bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200/60 dark:border-amber-500/10 rounded-xl flex gap-3 text-left">
                                                                      <AlertCircle size={17} className="text-amber-500 shrink-0 mt-0.5" />
                                                                      <div>
                                                                             <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Requiere Sena</p>
                                                                             <p className="text-[11px] text-amber-600/80 dark:text-amber-400/60 leading-relaxed mt-0.5">
                                                                                    Tu turno quedara en estado <span className="font-semibold">Pendiente</span> hasta que abones la sena minima de ${club.bookingDeposit || 0}.
                                                                             </p>
                                                                      </div>
                                                               </div>
                                                        )}
                                                 </div>
                                          ) : (
                                                 <div className="p-4 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] rounded-xl flex items-center gap-3.5 shadow-sm">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                                                               {clientData.name[0]}
                                                        </div>
                                                        <div className="text-left">
                                                               <p className="font-semibold text-sm text-[#0F172A] dark:text-white">{clientData.name} {clientData.lastname}</p>
                                                               <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{clientData.phone}</p>
                                                        </div>
                                                 </div>
                                          )}

                                          <div className="mt-auto pt-4">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-14 bg-primary text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Confirmar Turno <ArrowRight size={17} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       // ============================================
       // STEP 3 — SUCCESS / CONFIRMATION
       // ============================================
       if (step === 3 && selectedSlot) {
              const isGuest = mode === 'guest'
              return (
                     <PageWrapper hideHeader step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col flex-1 items-center justify-center py-6 w-full max-w-[360px] mx-auto">

                                   {/* Ticket Card */}
                                   <div className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/40 mb-5">
                                          {/* Top — Hero section */}
                                          <div className="relative p-7 pb-10 bg-gradient-to-br from-primary via-primary to-primary/90 text-white text-center overflow-hidden">
                                                 {/* Decorative circles */}
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

                                          {/* Rip / tear line */}
                                          <div className="relative flex items-center justify-between -mt-4 px-0 z-20">
                                                 <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -ml-3.5" />
                                                 <div className="flex-1 border-b-2 border-dashed border-gray-200/30 dark:border-white/[0.06] mx-1" />
                                                 <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-950 -mr-3.5" />
                                          </div>

                                          {/* Bottom — Details */}
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

                                                 {/* Pending warning for guests */}
                                                 {isGuest && (
                                                        <div className="flex items-center justify-center gap-2 py-3 bg-amber-500/[0.08] rounded-xl border border-amber-500/10">
                                                               <Lock size={11} className="text-amber-500" />
                                                               <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Reserva Pendiente</span>
                                                        </div>
                                                 )}
                                          </div>
                                   </div>

                                   {/* Quick Actions */}
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

                                   {/* Payment / Actions */}
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
                                                               {/* Bank transfer */}
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

       // ============================================
       // REGISTER
       // ============================================
       if (step === 'register') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 mb-6">
                                          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">Crear Perfil</h2>
                                          <p className="text-sm text-gray-400 dark:text-gray-500">Unite al club para reservar mas rapido.</p>
                                   </div>

                                   <form onSubmit={handleRegisterSubmit} className="space-y-4 flex-1 flex flex-col">
                                          <div className="relative">
                                                 <input required type="text" id="reg-name" autoComplete="given-name" className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all" placeholder=" " value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} />
                                                 <label htmlFor="reg-name" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">Nombre</label>
                                          </div>
                                          <div className="relative">
                                                 <input required type="text" id="reg-last" autoComplete="family-name" className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all" placeholder=" " value={clientData.lastname} onChange={e => setClientData({ ...clientData, lastname: e.target.value })} />
                                                 <label htmlFor="reg-last" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">Apellido</label>
                                          </div>
                                          <div className="relative">
                                                 <input required type="tel" id="reg-phone" autoComplete="tel" className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all" placeholder=" " value={clientData.phone} onChange={e => { setRegisterError(''); setClientData({ ...clientData, phone: e.target.value }); }} />
                                                 <label htmlFor="reg-phone" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">WhatsApp</label>
                                          </div>

                                          {registerError && (
                                                 <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                        <div className="text-sm">
                                                               <p className="text-red-600 dark:text-red-400 font-medium">{registerError}</p>
                                                               <button type="button" onClick={() => { setRegisterError(''); goToStep('login'); }} className="text-primary font-semibold text-xs mt-1 hover:underline">
                                                                      Ir a Iniciar Sesion
                                                               </button>
                                                        </div>
                                                 </div>
                                          )}

                                          <div className="mt-auto pt-4">
                                                 <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-primary text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50">
                                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Registrarme'}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       // ============================================
       // LOGIN
       // ============================================
       if (step === 'login') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 mb-6">
                                          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">Ingresar</h2>
                                          <p className="text-sm text-gray-400 dark:text-gray-500">Escribi tu numero para buscar tu cuenta.</p>
                                   </div>

                                   <form onSubmit={handleLogin} className="space-y-4 flex-1 flex flex-col">
                                          <div className="relative">
                                                 <input required autoFocus type="tel" id="login-phone" className="block px-4 pb-2.5 pt-5 w-full text-sm font-semibold text-gray-900 bg-white dark:bg-white/[0.03] dark:text-white rounded-xl border border-gray-200/80 dark:border-white/[0.06] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary peer transition-all" placeholder=" " value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                 <label htmlFor="login-phone" className="absolute text-[10px] font-semibold text-gray-400 dark:text-gray-500 duration-200 transform -translate-y-2.5 scale-75 top-3.5 z-10 origin-[0] left-4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5 cursor-text uppercase tracking-wider">Numero de Celular</label>
                                          </div>

                                          <div className="mt-auto pt-4">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-14 bg-primary text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <>Continuar <ArrowRight size={17} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       // ============================================
       // MATCHMAKING
       // ============================================
       if (step === 'matchmaking') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <OpenMatchesFeed matches={openMatches} />
                     </PageWrapper>
              )
       }

       return null
}
