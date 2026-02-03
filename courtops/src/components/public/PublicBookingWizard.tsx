'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { getPublicAvailability, createPublicBooking, getPublicClient, getPublicBooking } from '@/actions/public-booking'
import { createPreference } from '@/actions/mercadopago'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { OpenMatch } from '@/actions/open-matches'
import OpenMatchesFeed from './OpenMatchesFeed'
import {
       CalendarDays,
       MapPin,
       User,
       Settings,
       Star,
       Wallet,
       History,
       Zap,
       ChevronRight,
       ArrowRight,
       ArrowLeft,
       LogIn,
       CheckCircle2,
       Download,
       Home,
       Clock,
       Ticket,
       Trophy,
       Calendar,
       Users,
       GripHorizontal,
       Activity,
       ShieldCheck,
       CreditCard,
       MessageCircle,
       Phone,
       Search,
       Loader2,
       AlertCircle,
       ExternalLink,
       Copy,
       Check,
       Lock
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

const variants = {
       enter: (direction: number) => ({
              x: direction > 0 ? 20 : -20,
              opacity: 0,
              filter: 'blur(5px)'
       }),
       center: {
              zIndex: 1,
              x: 0,
              opacity: 1,
              filter: 'blur(0px)'
       },
       exit: (direction: number) => ({
              zIndex: 0,
              x: direction < 0 ? 20 : -20,
              opacity: 0,
              filter: 'blur(5px)'
       })
};

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

const PageWrapper = ({ children, hideHeader = false, step, goToStep, club, primaryColor, primaryRgb }: PageWrapperProps) => (
       <div
              className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] text-[#1E293B] dark:text-[#F1F5F9] font-sans relative flex flex-col overflow-x-hidden transition-colors duration-300"
              style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
       >
              {/* Dynamic Ambient Background */}
              <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                     <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-40 animate-pulse" />
                     <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] opacity-30" />
              </div>

              {!hideHeader && (
                     <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0A0B0E]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-4">
                                   {(step !== 0) && (
                                          <button
                                                 onClick={() => {
                                                        if (step === 3) goToStep(0)
                                                        else if (step === 2) goToStep(1)
                                                        else if (step === 1) goToStep(0)
                                                        else if (step === 'matchmaking') goToStep(0)
                                                        else if (step === 'login' || step === 'register') goToStep(0)
                                                 }}
                                                 className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95"
                                          >
                                                 <ArrowLeft size={18} strokeWidth={2.5} />
                                          </button>
                                   )}
                                   <div className="flex flex-col">
                                          <span className="font-black text-xs uppercase tracking-[0.2em] text-primary">{club.name}</span>
                                   </div>
                            </div>
                            <ThemeToggle />
                     </header>
              )}
              <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-6 relative z-10">
                     <AnimatePresence initial={false} custom={0} mode="wait">
                            <motion.div
                                   key={step}
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   exit={{ opacity: 0, y: -10 }}
                                   transition={{ duration: 0.2 }}
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
                     getPublicBooking(Number(externalRef)).then(booking => {
                            if (booking && booking.court) {
                                   setStep(3)
                                   setCreatedBookingId(booking.id)
                                   setMode(booking.guestName ? 'guest' : 'premium')
                                   const date = new Date(booking.startTime)
                                   setSelectedDate(date)
                                   setSelectedSlot({
                                          time: format(date, 'HH:mm'),
                                          price: Number(booking.price),
                                          courtId: booking.courtId,
                                          courtName: booking.court.name
                                   })
                                   confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
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
       const [clientData, setClientData] = useState({ name: '', lastname: '', phone: '', email: '' })
       const [isSubmitting, setIsSubmitting] = useState(false)
       const [createdBookingId, setCreatedBookingId] = useState<number | null>(null)
       const [isPaying, setIsPaying] = useState(false)
       const [createOpenMatch, setCreateOpenMatch] = useState(false)
       const [matchLevel, setMatchLevel] = useState('6ta')
       const [matchGender, setMatchGender] = useState('Masculino')
       const [copied, setCopied] = useState(false)

       // Helpers for navigation with direction
       const goToStep = (newStep: number | string) => {
              const currentStepIndex = typeof step === 'number' ? step : (step === 'register' ? 0.5 : 0.8) // approx
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
                            const data = await getPublicAvailability(club.id, selectedDate)
                            setSlots(data)
                     } catch (error) {
                            console.error(error)
                     } finally {
                            setLoading(false)
                     }
              }
              fetchSlots()
       }, [selectedDate, club.id, step])

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

       const handleRegisterSubmit = (e: React.FormEvent) => {
              e.preventDefault()
              if (clientData.name && clientData.lastname && clientData.phone) {
                     goToStep(1)
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
                     matchGender: createOpenMatch ? matchGender : undefined
              })

              if (res.success && res.bookingId) {
                     setCreatedBookingId(res.bookingId)
                     goToStep(3)
                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
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

       // --- STEPS RENDER ---
       if (step === 0) {
              return (
                     <PageWrapper hideHeader step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col items-center flex-1 py-4">
                                   <div className="flex justify-between w-full mb-8 items-center">
                                          <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">{format(new Date(), 'EEEE d', { locale: es })}</span>
                                          <ThemeToggle />
                                   </div>

                                   {/* Club Brand */}
                                   <header className="flex flex-col items-center mb-12">
                                          <div className="relative group mb-6">
                                                 <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-110 opacity-60 animate-pulse"></div>
                                                 <div className="relative w-28 h-28 bg-white dark:bg-[#1A1F26] rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/50 dark:border-white/5 overflow-hidden ring-4 ring-white/20 dark:ring-black/20">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                               <span className="text-primary text-5xl font-black">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </div>
                                          <h2 className="text-3xl font-black tracking-tighter text-center leading-none mb-3 text-[#0F172A] dark:text-white">{club.name}</h2>
                                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                                                 <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                 </span>
                                                 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">Club Abierto</span>
                                          </div>
                                   </header>

                                   <div className="w-full space-y-4 mb-10">
                                          <p className="text-center text-[10px] font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.3em] mb-6 opacity-60">Selecciona una opción</p>

                                          <motion.button
                                                 whileHover={{ scale: 1.02 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => { setMode('guest'); goToStep(1); }}
                                                 className="w-full p-1 bg-gradient-to-br from-white to-gray-50 dark:from-[#161B22] dark:to-[#0D1117] rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-white/50 dark:border-white/5 group"
                                          >
                                                 <div className="w-full h-full rounded-[2.3rem] bg-white dark:bg-[#161B22] p-5 flex items-center justify-between border border-gray-100 dark:border-white/5">
                                                        <div className="flex items-center gap-5">
                                                               <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                                                      <Calendar size={32} />
                                                               </div>
                                                               <div className="text-left">
                                                                      <h3 className="text-xl font-black tracking-tight leading-none mb-1 text-[#0F172A] dark:text-white group-hover:text-primary transition-colors">Reservar Turno</h3>
                                                                      <p className="text-[#475569] dark:text-[#94A3B8] text-xs font-medium">Buscar horarios libres</p>
                                                               </div>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-primary group-hover:text-white transition-all">
                                                               <ArrowRight size={20} />
                                                        </div>
                                                 </div>
                                          </motion.button>

                                          <motion.button
                                                 whileHover={{ scale: 1.02 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => goToStep('matchmaking')}
                                                 className="w-full p-1 bg-gradient-to-br from-white to-gray-50 dark:from-[#161B22] dark:to-[#0D1117] rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-white/50 dark:border-white/5 group"
                                          >
                                                 <div className="w-full h-full rounded-[2.3rem] bg-white dark:bg-[#161B22] p-5 flex items-center justify-between border border-gray-100 dark:border-white/5">
                                                        <div className="flex items-center gap-5">
                                                               <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform duration-500">
                                                                      <Trophy size={32} />
                                                               </div>
                                                               <div className="text-left">
                                                                      <div className="flex items-center gap-2 mb-1">
                                                                             <h3 className="text-xl font-black tracking-tight leading-none text-[#0F172A] dark:text-white group-hover:text-orange-500 transition-colors">Jugadores</h3>
                                                                             {openMatches.length > 0 && <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md animate-pulse">{openMatches.length}</span>}
                                                                      </div>
                                                                      <p className="text-[#475569] dark:text-[#94A3B8] text-xs font-medium">Sumate a partidos abiertos</p>
                                                               </div>
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                               <ArrowRight size={20} />
                                                        </div>
                                                 </div>
                                          </motion.button>
                                   </div>

                                   {/* MEMBER SECTION */}
                                   <div className="w-full mt-auto">
                                          <div className="bg-white/50 dark:bg-[#161B22]/50 backdrop-blur-md border border-white/60 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm">
                                                 <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[#475569] dark:text-[#94A3B8]">
                                                               <User size={20} />
                                                        </div>
                                                        <div className="text-left">
                                                               <h4 className="text-sm font-black tracking-tight text-[#1E293B] dark:text-white">Acceso Socios</h4>
                                                               <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-none mt-1">Gestiona tus abonos y perfil</p>
                                                        </div>
                                                 </div>
                                                 <div className="flex gap-3">
                                                        <button onClick={() => { setMode('premium'); goToStep('login'); }} className="flex-1 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary text-[#334155] dark:text-[#CBD5E1] transition-all">
                                                               Login
                                                        </button>
                                                        <button onClick={() => { setMode('premium'); goToStep('register'); }} className="flex-1 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary text-[#334155] dark:text-[#CBD5E1] transition-all">
                                                               Crear Cuenta
                                                        </button>
                                                 </div>
                                          </div>
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 1) {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="space-y-6 pb-20">
                                   <div className="flex flex-col gap-1 px-1">
                                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Paso 1 de 2</span>
                                          <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] dark:text-white">Elegí tu turno</h2>
                                   </div>

                                   {/* Days Slider */}
                                   <div className="relative">
                                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 snap-x -mx-6 px-6">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        return (
                                                               <motion.button
                                                                      key={d.toString()}
                                                                      whileTap={{ scale: 0.95 }}
                                                                      onClick={() => setSelectedDate(d)}
                                                                      className={cn(
                                                                             "flex-shrink-0 w-[72px] h-[96px] flex flex-col items-center justify-center rounded-[1.8rem] transition-all duration-300 snap-center border-2 group",
                                                                             active
                                                                                    ? "bg-primary border-primary text-white shadow-xl shadow-primary/30 scale-105 z-10"
                                                                                    : "bg-white dark:bg-[#161B22] border-transparent text-[#64748B] dark:text-[#94A3B8] hover:border-gray-200 dark:hover:border-white/10"
                                                                      )}
                                                               >
                                                                      <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1", active ? "opacity-100" : "opacity-50")}>
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className="text-2xl font-black tracking-tighter">
                                                                             {format(d, 'd')}
                                                                      </span>
                                                               </motion.button>
                                                        )
                                                 })}
                                          </div>
                                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8F9FA] dark:from-[#050505] to-transparent pointer-events-none" />
                                   </div>

                                   {/* Slots List */}
                                   <div className="space-y-4">
                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                        <Loader2 className="animate-spin text-primary" size={32} strokeWidth={2.5} />
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Buscando canchas...</p>
                                                 </div>
                                          ) : slots.length === 0 ? (
                                                 <div className="text-center py-20 px-8 bg-white dark:bg-[#161B22] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center gap-4">
                                                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-white/20"><Search size={32} /></div>
                                                        <p className="text-xs font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.1em]">No hay turnos disponibles para esta fecha.</p>
                                                 </div>
                                          ) : (
                                                 slots.map((slot, idx) => (
                                                        <motion.div
                                                               initial={{ opacity: 0, y: 20 }}
                                                               animate={{ opacity: 1, y: 0 }}
                                                               transition={{ delay: idx * 0.05 }}
                                                               key={idx}
                                                               className="bg-white dark:bg-[#161B22] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden relative"
                                                        >
                                                               <div className="flex justify-between items-center mb-6">
                                                                      <div className="flex items-baseline gap-1">
                                                                             <span className="text-4xl font-black tracking-tighter text-[#0F172A] dark:text-white">{slot.time}</span>
                                                                             <span className="text-xs font-bold text-muted-foreground">hs</span>
                                                                      </div>
                                                                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                                                                             <span className="text-sm font-black text-primary">${slot.price}</span>
                                                                      </div>
                                                               </div>
                                                               <div className="grid grid-cols-2 gap-3">
                                                                      {slot.courts.map((court: any) => (
                                                                             <button
                                                                                    key={court.id}
                                                                                    onClick={() => {
                                                                                           setSelectedSlot({ time: slot.time, price: slot.price, courtId: court.id, courtName: court.name })
                                                                                           goToStep(2)
                                                                                    }}
                                                                                    className="h-12 bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent hover:border-primary/50 text-[#334155] dark:text-[#E2E8F0]"
                                                                             >
                                                                                    {court.name}
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

       if (step === 2 && selectedSlot) {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 px-1 mb-8">
                                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Paso 2 de 2</span>
                                          <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] dark:text-white">Confirmar Datos</h2>
                                   </div>

                                   {/* Summary Card */}
                                   <div className="bg-white dark:bg-[#161B22] rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-black/20 mb-8 relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                                                 <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary border border-gray-100 dark:border-white/5">
                                                        <Calendar size={24} />
                                                 </div>
                                                 <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Fecha & Hora</p>
                                                        <p className="font-black text-lg capitalize text-[#1E293B] dark:text-white leading-tight">
                                                               {format(selectedDate, 'EEE d', { locale: es })} • {selectedSlot.time}hs
                                                        </p>
                                                 </div>
                                          </div>

                                          <div className="flex justify-between items-center">
                                                 <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Cancha</p>
                                                        <p className="font-black text-base uppercase text-[#1E293B] dark:text-white">{selectedSlot.courtName}</p>
                                                 </div>
                                                 <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Precio</p>
                                                        <p className="font-black text-xl text-primary">${selectedSlot.price}</p>
                                                 </div>
                                          </div>
                                   </div>

                                   <form onSubmit={handleBooking} className="space-y-8 flex-1 flex flex-col">
                                          {mode === 'guest' ? (
                                                 <div className="space-y-6">
                                                        <div className="relative group">
                                                               <input required type="text" id="name" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} />
                                                               <label htmlFor="name" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">Nombre Completo</label>
                                                        </div>
                                                        <div className="relative group">
                                                               <input required type="tel" id="phone" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                               <label htmlFor="phone" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">Teléfono</label>
                                                        </div>

                                                        {/* Seña Info */}
                                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl flex gap-3 text-left">
                                                               <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                                                               <div>
                                                                      <p className="text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-400">Requiere Seña</p>
                                                                      <p className="text-[11px] text-orange-600/80 dark:text-orange-300/60 font-medium leading-relaxed mt-1">
                                                                             Tu turno quedará en estado <b>Pendiente</b> hasta que abones la seña mínima de ${club.bookingDeposit || 0}.
                                                                      </p>
                                                               </div>
                                                        </div>
                                                 </div>
                                          ) : (
                                                 <div className="p-5 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-white/10 rounded-3xl flex items-center gap-4 shadow-sm">
                                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                                                               {clientData.name[0]}
                                                        </div>
                                                        <div className="text-left">
                                                               <p className="font-bold text-sm text-[#0F172A] dark:text-white">{clientData.name} {clientData.lastname}</p>
                                                               <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{clientData.phone}</p>
                                                        </div>
                                                 </div>
                                          )}

                                          <div className="mt-auto pt-4">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmar Turno <ArrowRight size={20} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 3 && selectedSlot) {
              const isGuest = mode === 'guest'
              return (
                     <PageWrapper hideHeader step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col flex-1 items-center justify-center py-6">

                                   {/* TICKET UI */}
                                   <div className="w-full bg-white dark:bg-[#161B22] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 relative mb-8">
                                          {/* Top Part */}
                                          <div className="p-8 pb-10 relative bg-primary text-white text-center">
                                                 <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                                 <div className="relative z-10 flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border-2 border-white/30 text-white shadow-lg">
                                                               <Check size={32} strokeWidth={4} />
                                                        </div>
                                                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">¡Turno Reservado!</h2>
                                                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest">{club.name}</p>
                                                 </div>
                                          </div>

                                          {/* Rip Effect */}
                                          <div className="relative flex items-center justify-between -mt-4 px-2">
                                                 <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#050505]"></div>
                                                 <div className="flex-1 border-b-2 border-dashed border-gray-300 dark:border-white/10 mx-2"></div>
                                                 <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#050505]"></div>
                                          </div>

                                          {/* Content Part */}
                                          <div className="p-8 pt-4 space-y-6">
                                                 <div className="flex justify-between items-start">
                                                        <div className="text-left">
                                                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Fecha</p>
                                                               <p className="font-black text-lg text-[#1E293B] dark:text-white capitalize">{format(selectedDate, 'EEEE d', { locale: es })}</p>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Hora</p>
                                                               <p className="font-black text-3xl text-primary leading-none">{selectedSlot.time}<span className="text-sm align-top ml-0.5">HS</span></p>
                                                        </div>
                                                 </div>
                                                 <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex justify-between items-center">
                                                        <span className="text-xs font-black uppercase text-[#1E293B] dark:text-white">{selectedSlot.courtName}</span>
                                                        <span className="text-xs font-black text-primary">${selectedSlot.price}</span>
                                                 </div>
                                          </div>

                                          {/* Warning for Guest */}
                                          {isGuest && (
                                                 <div className="p-6 bg-orange-50 dark:bg-orange-500/10 border-t border-orange-100 dark:border-orange-500/20 text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
                                                               <Lock size={14} />
                                                               <span className="text-[10px] font-black uppercase tracking-widest">Reserva Pendiente</span>
                                                        </div>
                                                        <p className="text-[11px] text-orange-800/80 dark:text-orange-200/70 font-medium leading-tight">
                                                               Pagá la seña para asegurar tu lugar.
                                                        </p>
                                                 </div>
                                          )}
                                   </div>

                                   {/* ACTIONS */}
                                   <div className="w-full space-y-4">
                                          {isGuest ? (
                                                 club.mpAccessToken ? (
                                                        <button
                                                               onClick={handlePayment}
                                                               disabled={isPaying}
                                                               className="w-full h-16 bg-[#009EE3] hover:bg-[#008ED0] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#009EE3]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                                        >
                                                               {isPaying ? <Loader2 className="animate-spin" /> : <>Pagar Seña con MercadoPago</>}
                                                        </button>
                                                 ) : (
                                                        <div className="space-y-4">
                                                               <div className="p-5 bg-white dark:bg-[#161B22] rounded-2xl border border-gray-200 dark:border-white/10 text-center">
                                                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Transferencia Bancaria</p>
                                                                      <p className="text-xl font-black text-[#1E293B] dark:text-white tracking-tight mb-2 select-all cursor-pointer" onClick={() => { navigator.clipboard.writeText(club.mpAlias || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>{club.mpAlias || 'N/A'}</p>
                                                                      {copied && <span className="text-[10px] text-primary font-bold animate-pulse">¡Copiado!</span>}
                                                               </div>
                                                               <a
                                                                      href={`https://wa.me/${club.phone}?text=${encodeURIComponent(`Hola! Reservé el ${format(selectedDate, 'd/M')} a las ${selectedSlot.time}hs. Envío comprobante.`)}`}
                                                                      target="_blank"
                                                                      className="w-full h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#25D366]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                                               >
                                                                      <MessageCircle size={20} /> Enviar Comprobante
                                                               </a>
                                                        </div>
                                                 )
                                          ) : (
                                                 <button
                                                        onClick={() => goToStep(0)}
                                                        className="w-full h-14 bg-white dark:bg-[#161B22] text-[#1E293B] dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary active:scale-[0.98] transition-all"
                                                 >
                                                        Volver al Inicio
                                                 </button>
                                          )}
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'register') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 px-1 mb-8">
                                          <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] dark:text-white">Crear Perfil</h2>
                                          <p className="text-sm font-medium text-muted-foreground">Unite al club para reservar más rápido.</p>
                                   </div>

                                   <form onSubmit={handleRegisterSubmit} className="space-y-6 flex-1 flex flex-col">
                                          <div className="relative group">
                                                 <input required type="text" id="reg-name" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} />
                                                 <label htmlFor="reg-name" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">Nombre</label>
                                          </div>
                                          <div className="relative group">
                                                 <input required type="text" id="reg-last" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.lastname} onChange={e => setClientData({ ...clientData, lastname: e.target.value })} />
                                                 <label htmlFor="reg-last" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">Apellido</label>
                                          </div>
                                          <div className="relative group">
                                                 <input required type="tel" id="reg-phone" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                 <label htmlFor="reg-phone" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">WhatsApp</label>
                                          </div>

                                          <div className="mt-auto pt-4">
                                                 <button
                                                        type="submit"
                                                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
                                                 >
                                                        Registrarme
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'login') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <div className="flex flex-col h-full">
                                   <div className="flex flex-col gap-1 px-1 mb-8">
                                          <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] dark:text-white">Ingresar</h2>
                                          <p className="text-sm font-medium text-muted-foreground">Escribí tu número para buscar tu cuenta.</p>
                                   </div>

                                   <form onSubmit={handleLogin} className="space-y-6 flex-1 flex flex-col">
                                          <div className="relative group">
                                                 <input required autoFocus type="tel" id="login-phone" className="block px-5 pb-3 pt-6 w-full text-base font-bold text-gray-900 bg-white dark:bg-[#161B22] dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer transition-all" placeholder=" " value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                 <label htmlFor="login-phone" className="absolute text-xs font-bold text-gray-400 dark:text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 cursor-text uppercase tracking-wider">Número de Celular</label>
                                          </div>

                                          <div className="mt-auto pt-4">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Continuar <ArrowRight size={20} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'matchmaking') {
              return (
                     <PageWrapper step={step} goToStep={goToStep} club={club} primaryColor={primaryColor} primaryRgb={primaryRgb}>
                            <OpenMatchesFeed matches={openMatches} />
                     </PageWrapper>
              )
       }

       return null
}
