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
       Loader2
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
       }
       initialDateStr: string
       openMatches?: OpenMatch[]
}

function hexToRgb(hex: string) {
       const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
       return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '34, 197, 94';
}

type BookingMode = 'guest' | 'premium' | null

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
                            setStep(1)
                     } else {
                            alert('No encontramos una cuenta con este número. Por favor regístrate.')
                            setStep('register')
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
                     setStep(1)
              }
       }

       const handleBooking = async (e: React.FormEvent) => {
              e.preventDefault()
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
                     setStep(3)
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

       const PageWrapper = ({ children, hideHeader = false }: { children: React.ReactNode, hideHeader?: boolean }) => (
              <div
                     className="min-h-screen bg-background text-foreground font-sans relative flex flex-col overflow-x-hidden transition-colors duration-300"
                     style={{ '--primary': primaryColor, '--primary-rgb': primaryRgb } as React.CSSProperties}
              >
                     {/* Premium Background Effects */}
                     <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 opacity-60 dark:opacity-40" />

                     {!hideHeader && (
                            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                          {(step !== 0) && (
                                                 <button
                                                        onClick={() => {
                                                               if (step === 3) setStep(0)
                                                               else if (step === 2) setStep(1)
                                                               else if (step === 1) setStep(0)
                                                               else if (step === 'matchmaking') setStep(0)
                                                               else if (step === 'login' || step === 'register') setStep(0)
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95"
                                                 >
                                                        <ArrowLeft size={20} />
                                                 </button>
                                          )}
                                          <div className="flex flex-col">
                                                 <span className="font-black text-xs uppercase tracking-[0.2em] text-primary">{club.name}</span>
                                                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Reservas Online</span>
                                          </div>
                                   </div>
                                   <ThemeToggle />
                            </header>
                     )}
                     <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-8 relative z-10">
                            {children}
                     </main>
              </div>
       )

       // --- STEP 0: LANDING (MATCHING THE IMAGE) ---
       if (step === 0) {
              return (
                     <PageWrapper hideHeader>
                            <div className="flex flex-col items-center flex-1">
                                   <div className="flex justify-end w-full mb-4">
                                          <ThemeToggle />
                                   </div>

                                   {/* Club Brand Section */}
                                   <header className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                                          <div className="relative group mb-6">
                                                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-60 transition-all duration-700"></div>
                                                 <div className="relative w-24 h-24 bg-card rounded-3xl flex items-center justify-center shadow-2xl border border-border overflow-hidden">
                                                        {club.logoUrl ? (
                                                               <img src={club.logoUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                               <span className="text-primary text-4xl font-black">{club.name.substring(0, 1)}</span>
                                                        )}
                                                 </div>
                                          </div>
                                          <h2 className="text-3xl font-black tracking-tighter text-center leading-none mb-3">{club.name}</h2>
                                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400 opacity-80">Club Abierto</span>
                                          </div>
                                   </header>

                                   <div className="w-full space-y-4 mb-10">
                                          <p className="text-center text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mb-6 px-10">¿Qué quieres hacer hoy?</p>

                                          {/* RESERVAR CARD (Light/Premium Style) */}
                                          <motion.button
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => { setMode('guest'); setStep(1); }}
                                                 className="w-full p-6 rounded-[2.5rem] bg-card border border-border shadow-xl shadow-primary/5 flex items-center justify-between group relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <Calendar size={80} />
                                                 </div>
                                                 <div className="flex flex-col items-start gap-3 relative z-10 text-left">
                                                        <div className="bg-primary/10 p-2.5 rounded-2xl">
                                                               <Calendar size={28} className="text-primary" />
                                                        </div>
                                                        <div>
                                                               <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Reservar</h3>
                                                               <p className="text-muted-foreground text-sm font-medium">Buscar cancha disponible</p>
                                                        </div>
                                                 </div>
                                                 <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 relative z-10">
                                                        <ChevronRight size={22} />
                                                 </div>
                                          </motion.button>

                                          {/* PARTIDOS CARD (Matching) */}
                                          <motion.button
                                                 whileHover={{ scale: 1.02, y: -2 }}
                                                 whileTap={{ scale: 0.98 }}
                                                 onClick={() => setStep('matchmaking')}
                                                 className="w-full p-6 rounded-[2.5rem] bg-card border border-border shadow-xl shadow-primary/5 flex items-center justify-between group relative overflow-hidden"
                                          >
                                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <Trophy size={80} />
                                                 </div>
                                                 <div className="flex flex-col items-start gap-3 relative z-10 text-left">
                                                        <div className="flex items-center gap-3">
                                                               <div className="bg-primary/10 p-2.5 rounded-2xl">
                                                                      <Trophy size={28} className="text-primary" />
                                                               </div>
                                                               {openMatches.length > 0 && (
                                                                      <span className="bg-primary text-primary-foreground text-[8px] font-black px-2.5 py-1 rounded-full animate-pulse tracking-widest uppercase">
                                                                             {openMatches.length} Activos
                                                                      </span>
                                                               )}
                                                        </div>
                                                        <div>
                                                               <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Partidos</h3>
                                                               <p className="text-muted-foreground text-sm font-medium">Súmate a jugar con otros</p>
                                                        </div>
                                                 </div>
                                                 <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 relative z-10">
                                                        <ChevronRight size={22} />
                                                 </div>
                                          </motion.button>
                                   </div>

                                   {/* MEMBER ACCESS (CLEANER BOX) */}
                                   <div className="w-full mt-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                                          <div className="bg-card/30 backdrop-blur-md border border-border/40 rounded-[2.5rem] p-6 text-center">
                                                 <div className="flex items-center justify-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/80 border border-border/50">
                                                               <User size={24} />
                                                        </div>
                                                        <div className="text-left">
                                                               <h4 className="text-lg font-black tracking-tight">Soy Miembro</h4>
                                                               <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mt-0.5">Accede a tus beneficios</p>
                                                        </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('login'); }}
                                                               className="py-3.5 bg-background border border-border/80 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                                                        >
                                                               Iniciar Sesión
                                                        </button>
                                                        <button
                                                               onClick={() => { setMode('premium'); setStep('register'); }}
                                                               className="py-3.5 bg-background border border-border/80 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                                                        >
                                                               Registrarme
                                                        </button>
                                                 </div>
                                          </div>

                                          <footer className="mt-10 mb-2 flex flex-col items-center gap-4">
                                                 <div className="flex items-center gap-2 opacity-20 hover:opacity-100 transition-all duration-500">
                                                        <Search size={10} className="text-foreground" />
                                                        <span className="text-[9px] font-black tracking-[0.4em] uppercase">Powered by CourtOps</span>
                                                 </div>
                                          </footer>
                                   </div>
                            </div>
                     </PageWrapper>
              )
       }

       // --- OTHER STEPS (KEEPING THE PREMIUM CLEAN LOOK) ---
       if (step === 'matchmaking') {
              return (
                     <PageWrapper>
                            <div className="space-y-6">
                                   <div className="flex flex-col gap-1">
                                          <h2 className="text-3xl font-black tracking-tighter">Partidos Abiertos</h2>
                                          <p className="text-muted-foreground text-sm font-medium">Busca nivel compatible y súmate al juego.</p>
                                   </div>
                                   <OpenMatchesFeed matches={openMatches} />
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'login') {
              return (
                     <PageWrapper>
                            <div className="flex flex-col flex-1">
                                   <div className="mb-10 pt-4">
                                          <h2 className="text-4xl font-black tracking-tighter leading-tight mb-4">Bienvenido</h2>
                                          <p className="text-muted-foreground text-lg font-medium">Ingresa tu número para acceder a tu perfil de jugador.</p>
                                   </div>

                                   <form onSubmit={handleLogin} className="space-y-6">
                                          <div className="space-y-2">
                                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Teléfono</label>
                                                 <input
                                                        required
                                                        autoFocus
                                                        type="text"
                                                        value={clientData.phone}
                                                        onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                                        className="w-full h-16 rounded-2xl bg-card border border-border px-6 text-lg font-bold outline-none ring-primary/20 focus:ring-4 focus:border-primary transition-all placeholder:text-muted-foreground/30"
                                                        placeholder="Ej: 351234..."
                                                 />
                                          </div>

                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="w-full h-16 bg-primary text-primary-foreground rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                          >
                                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight size={20} /></>}
                                          </button>

                                          <p className="text-center text-xs text-muted-foreground font-medium">¿Aún no tienes cuenta? <button onClick={() => setStep('register')} className="text-primary font-black uppercase tracking-widest">Regístrate</button></p>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 'register') {
              return (
                     <PageWrapper>
                            <div className="flex flex-col flex-1">
                                   <div className="mb-8 pt-4 text-left">
                                          <h2 className="text-4xl font-black tracking-tighter leading-tight mb-3">Únete</h2>
                                          <p className="text-muted-foreground text-lg font-medium leading-tight">Crea tu perfil en {club.name} para gestionar tus reservas.</p>
                                   </div>

                                   <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
                                                        <input required value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} className="w-full h-14 rounded-2xl bg-card border border-border px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                                 </div>
                                                 <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Apellido</label>
                                                        <input required value={clientData.lastname} onChange={e => setClientData({ ...clientData, lastname: e.target.value })} className="w-full h-14 rounded-2xl bg-card border border-border px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                                 </div>
                                          </div>
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">WhatsApp</label>
                                                 <input required value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} className="w-full h-14 rounded-2xl bg-card border border-border px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Ej: 351..." />
                                          </div>
                                          <div className="space-y-1">
                                                 <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email <span className="text-[8px] opacity-30">(Opcional)</span></label>
                                                 <input type="email" value={clientData.email} onChange={e => setClientData({ ...clientData, email: e.target.value })} className="w-full h-14 rounded-2xl bg-card border border-border px-5 font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                          </div>

                                          <div className="mt-8 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex gap-4">
                                                 <div className="bg-primary/20 text-primary p-2 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                                        <ShieldCheck size={20} />
                                                 </div>
                                                 <div className="text-left">
                                                        <p className="text-sm font-black uppercase tracking-tight">Cuenta Corriente</p>
                                                        <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">Tu historial de pagos se habilitará automáticamente.</p>
                                                 </div>
                                          </div>

                                          <button type="submit" className="w-full h-16 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20 mt-6 active:scale-95 transition-all">
                                                 Confirmar Registro
                                          </button>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 1) {
              return (
                     <PageWrapper>
                            <div className="space-y-8 pb-32">
                                   <div className="flex items-center justify-between px-1">
                                          <div className="flex items-center gap-2">
                                                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                 <span className="text-[9px] font-black uppercase tracking-widest text-primary opacity-80">
                                                        {mode === 'guest' ? 'Reserva como Invitado' : `Jugador: ${clientData.name}`}
                                                 </span>
                                          </div>
                                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Paso 1 / 2</span>
                                   </div>

                                   <section>
                                          <div className="flex items-center gap-2 mb-4 px-1 text-muted-foreground/60">
                                                 <Calendar size={12} />
                                                 <h2 className="text-[9px] font-black uppercase tracking-[0.2em]">Elige una fecha</h2>
                                          </div>
                                          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x -mx-6 px-6">
                                                 {days.map(d => {
                                                        const active = isSameDay(d, selectedDate)
                                                        return (
                                                               <motion.button
                                                                      key={d.toString()}
                                                                      whileTap={{ scale: 0.95 }}
                                                                      onClick={() => setSelectedDate(d)}
                                                                      className={cn(
                                                                             "flex-shrink-0 w-[68px] h-[90px] flex flex-col items-center justify-center rounded-[1.5rem] transition-all duration-300 snap-center border-2",
                                                                             active
                                                                                    ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105"
                                                                                    : "bg-card border-border text-muted-foreground/60"
                                                                      )}
                                                               >
                                                                      <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">
                                                                             {format(d, 'EEE', { locale: es })}
                                                                      </span>
                                                                      <span className="text-xl font-black tracking-tighter">
                                                                             {format(d, 'd')}
                                                                      </span>
                                                               </motion.button>
                                                        )
                                                 })}
                                          </div>
                                   </section>

                                   <section className="space-y-6">
                                          <div className="flex items-center gap-2 mb-2 px-1 text-muted-foreground/60">
                                                 <Clock size={12} />
                                                 <h2 className="text-[9px] font-black uppercase tracking-[0.2em]">Horarios Disponibles</h2>
                                          </div>

                                          {loading ? (
                                                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                        <Loader2 className="animate-spin text-primary" size={40} />
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Sincronizando Disponibilidad...</p>
                                                 </div>
                                          ) : slots.length === 0 ? (
                                                 <div className="text-center py-20 bg-card/40 rounded-[2rem] border border-dashed border-border flex flex-col items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30"><Search size={24} /></div>
                                                        <p className="text-xs font-bold text-muted-foreground/40 italic uppercase tracking-widest">No hay turnos libres</p>
                                                 </div>
                                          ) : (
                                                 <div className="space-y-5">
                                                        {slots.map((slot, idx) => (
                                                               <motion.div
                                                                      initial={{ opacity: 0, scale: 0.98 }}
                                                                      whileInView={{ opacity: 1, scale: 1 }}
                                                                      transition={{ delay: idx * 0.05 }}
                                                                      key={idx}
                                                                      className="bg-card border border-border/80 rounded-[2.2rem] p-7 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
                                                               >
                                                                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                                                      <div className="flex justify-between items-end mb-6 relative z-10">
                                                                             <div className="flex flex-col">
                                                                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Horario</span>
                                                                                    <span className="text-4xl font-black tracking-tighter leading-none">{slot.time}</span>
                                                                             </div>
                                                                             <div className="text-right">
                                                                                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">Precio</span>
                                                                                    <span className="text-2xl font-black text-primary leading-none">${slot.price}</span>
                                                                             </div>
                                                                      </div>
                                                                      <div className="grid grid-cols-2 gap-3 relative z-10">
                                                                             {slot.courts.map((court: any) => (
                                                                                    <button
                                                                                           key={court.id}
                                                                                           onClick={() => {
                                                                                                  setSelectedSlot({ time: slot.time, price: slot.price, courtId: court.id, courtName: court.name })
                                                                                                  setStep(2)
                                                                                           }}
                                                                                           className="h-14 bg-muted/60 hover:bg-primary hover:text-primary-foreground rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center justify-center px-4 text-center leading-tight shadow-sm"
                                                                                    >
                                                                                           {court.name}
                                                                                    </button>
                                                                             ))}
                                                                      </div>
                                                               </motion.div>
                                                        ))}
                                                 </div>
                                          )}
                                   </section>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 2 && selectedSlot) {
              return (
                     <PageWrapper>
                            <div className="space-y-8 pb-32 animate-in slide-in-from-right duration-500">
                                   <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                          <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Confirmación</h2>
                                          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-8">Revisa los datos de tu turno</p>

                                          <div className="space-y-6 text-left">
                                                 <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                               <Calendar size={24} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 opacity-60">Fecha</p>
                                                               <p className="font-black text-lg capitalize">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                                      <Clock size={24} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 opacity-60">Hora</p>
                                                                      <p className="font-black text-2xl tracking-tighter">{selectedSlot.time} HS</p>
                                                               </div>
                                                        </div>
                                                        <div className="text-right">
                                                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 opacity-60">Total</p>
                                                               <p className="font-black text-2xl text-primary tracking-tighter">${selectedSlot.price}</p>
                                                        </div>
                                                 </div>

                                                 <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                                                               <MapPin size={24} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-0.5 opacity-60">Cancha</p>
                                                               <p className="font-black text-lg uppercase tracking-tight">{selectedSlot.courtName}</p>
                                                        </div>
                                                 </div>
                                          </div>
                                   </div>

                                   <form onSubmit={handleBooking} className="space-y-6">
                                          {mode === 'guest' ? (
                                                 <div className="space-y-4">
                                                        <div className="p-6 bg-orange-500/10 border border-orange-500/15 rounded-[2rem] flex gap-4 text-left">
                                                               <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-600 flex items-center justify-center shrink-0">
                                                                      <CreditCard size={22} />
                                                               </div>
                                                               <div>
                                                                      <p className="text-sm font-black uppercase tracking-tight text-orange-700">Seña Requerida</p>
                                                                      <p className="text-xs text-orange-900/60 dark:text-orange-200/50 font-medium mt-1 leading-relaxed">
                                                                             Debes abonar una seña de <b>${club.bookingDeposit || 0}</b> para confirmar este turno.
                                                                      </p>
                                                               </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                               <input required className="w-full h-16 rounded-2xl bg-card border border-border px-6 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="NOMBRE COMPLETO" value={clientData.name} onChange={e => setClientData({ ...clientData, name: e.target.value })} />
                                                               <input required type="tel" className="w-full h-16 rounded-2xl bg-card border border-border px-6 font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm" placeholder="CELULAR (WHATSAPP)" value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} />
                                                        </div>
                                                 </div>
                                          ) : (
                                                 <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center justify-between shadow-sm">
                                                        <div className="flex gap-4 items-center">
                                                               <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black uppercase text-sm border-2 border-primary/20">{clientData.name[0]}</div>
                                                               <div className="text-left">
                                                                      <p className="font-black text-xl leading-none">{clientData.name} {clientData.lastname}</p>
                                                                      <p className="text-[10px] text-muted-foreground font-black mt-1.5 uppercase tracking-widest">{clientData.phone}</p>
                                                               </div>
                                                        </div>
                                                        <div className="bg-primary/20 p-2.5 rounded-2xl text-primary" title="Perfil Verificado">
                                                               <ShieldCheck size={24} />
                                                        </div>
                                                 </div>
                                          )}

                                          {/* OPEN MATCH OPTION */}
                                          <div className="p-7 bg-card border border-border rounded-[2.2rem] space-y-5 shadow-sm text-left">
                                                 <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCreateOpenMatch(!createOpenMatch)}>
                                                               <div className={cn("w-13 h-7 rounded-full px-1 flex items-center transition-all duration-300", createOpenMatch ? "bg-primary" : "bg-muted")}>
                                                                      <div className={cn("w-5.5 h-5.5 rounded-full bg-white shadow-xl transition-all duration-300 transform", createOpenMatch ? "translate-x-6" : "translate-x-0")}></div>
                                                               </div>
                                                               <span className="text-[13px] font-black uppercase tracking-tight">Buscar Rivales</span>
                                                        </div>
                                                        <Trophy size={26} className={cn("transition-colors", createOpenMatch ? "text-primary" : "text-muted-foreground/20")} />
                                                 </div>
                                                 <AnimatePresence>
                                                        {createOpenMatch && (
                                                               <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ opacity: 0 }} className="pt-4 space-y-5 border-t border-border overflow-hidden">
                                                                      <p className="text-[11px] font-bold text-muted-foreground/60 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">Tu reserva se hará pública para que otros jugadores puedan sumarse al partido.</p>
                                                                      <div className="grid grid-cols-2 gap-4">
                                                                             <div className="space-y-1.5">
                                                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">Nivel Deseado</label>
                                                                                    <select value={matchLevel} onChange={e => setMatchLevel(e.target.value)} className="w-full h-12 bg-muted/60 border-none rounded-2xl text-xs font-bold px-4 focus:ring-2 focus:ring-primary/20 appearance-none">
                                                                                           <option value="8va">8VA INC.</option>
                                                                                           <option value="7ma">7MA</option>
                                                                                           <option value="6ta">6TA</option>
                                                                                           <option value="5ta">5TA</option>
                                                                                           <option value="4ta">4TA</option>
                                                                                    </select>
                                                                             </div>
                                                                             <div className="space-y-1.5">
                                                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-1 opacity-50">Género</label>
                                                                                    <select value={matchGender} onChange={e => setMatchGender(e.target.value)} className="w-full h-12 bg-muted/60 border-none rounded-2xl text-xs font-bold px-4 focus:ring-2 focus:ring-primary/20 appearance-none">
                                                                                           <option value="Masculino">MASCULINO</option>
                                                                                           <option value="Femenino">FEMENINO</option>
                                                                                           <option value="Mixto">MIXTO</option>
                                                                                    </select>
                                                                             </div>
                                                                      </div>
                                                               </motion.div>
                                                        )}
                                                 </AnimatePresence>
                                          </div>

                                          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background to-transparent pointer-events-none max-w-md mx-auto">
                                                 <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="w-full h-16 bg-primary text-primary-foreground rounded-[1.5rem] font-black text-lg uppercase tracking-widest shadow-2xml shadow-primary/30 pointer-events-auto active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                 >
                                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <>Confirmar Reserva <ArrowRight size={20} /></>}
                                                 </button>
                                          </div>
                                   </form>
                            </div>
                     </PageWrapper>
              )
       }

       if (step === 3 && selectedSlot) {
              return (
                     <PageWrapper>
                            <div className="flex flex-col items-center flex-1 animate-in zoom-in-95 duration-700">
                                   <div className="relative mb-12 pt-10">
                                          <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full scale-150 opacity-60"></div>
                                          <div className="relative w-36 h-36 rounded-[3rem] bg-card border-2 border-primary/30 flex items-center justify-center text-primary shadow-2xl overflow-hidden group">
                                                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                                                 {mode === 'guest' ? <Clock size={80} strokeWidth={2.5} /> : <CheckCircle2 size={80} strokeWidth={2.5} />}
                                          </div>
                                          <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-primary rounded-2xl border-4 border-background flex items-center justify-center text-primary-foreground shadow-2xl">
                                                 <Trophy size={24} />
                                          </div>
                                   </div>

                                   <h2 className="text-4xl font-black tracking-tighter text-center mb-4 uppercase">
                                          {mode === 'guest' ? 'Casi listo' : '¡Excelente!'}
                                   </h2>
                                   <p className="text-muted-foreground text-sm font-medium text-center max-w-[300px] mb-12 leading-relaxed opacity-80">
                                          {mode === 'guest'
                                                 ? 'Tu solicitud fue recibida. Por favor, abona la seña para confirmar tu lugar en la grilla.'
                                                 : 'Tu reserva ya fue confirmada. No olvides presentarte 10 minutos antes del turno.'}
                                   </p>

                                   <div className="w-full space-y-4 mb-12">
                                          <div className="bg-card border border-border rounded-[2.2rem] p-7 shadow-sm flex items-center justify-between text-left relative overflow-hidden">
                                                 <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20"></div>
                                                 <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/60 border border-border/50">
                                                               <Calendar size={26} />
                                                        </div>
                                                        <div>
                                                               <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-1">{format(selectedDate, 'EEEE d MMMM', { locale: es })}</p>
                                                               <p className="font-black text-xl uppercase tracking-tighter leading-none">{selectedSlot.time} HS — <span className="text-primary">{selectedSlot.courtName}</span></p>
                                                        </div>
                                                 </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                 <button
                                                        onClick={() => {
                                                               const text = `¡Hola! Reservé cancha en ${club.name} para el ${format(selectedDate, 'EEEE d', { locale: es })} a las ${selectedSlot.time}hs. 🎾`
                                                               window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                                                        }}
                                                        className="h-16 bg-[#25D366] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-green-600/10 active:scale-95 transition-all"
                                                 >
                                                        <MessageCircle size={22} /> Compartir
                                                 </button>
                                                 <button
                                                        onClick={() => {
                                                               const start = selectedDate.toISOString().replace(/-|:|\.\d\d\d/g, "")
                                                               const endDate = new Date(selectedDate.getTime() + 90 * 60000)
                                                               const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "")
                                                               const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Padel en ${club.name}`)}&dates=${start}/${end}&details=${encodeURIComponent(`Cancha: ${selectedSlot.courtName}`)}`
                                                               window.open(url, '_blank')
                                                        }}
                                                        className="h-16 bg-card border border-border text-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                                                 >
                                                        <Calendar size={22} /> Agendar
                                                 </button>
                                          </div>
                                   </div>

                                   {mode === 'guest' && (
                                          <div className="w-full space-y-4 pt-8 border-t border-border/60">
                                                 <p className="text-center text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">Confirmar Turno</p>
                                                 {club.mpAccessToken && (
                                                        <button
                                                               onClick={handlePayment}
                                                               disabled={isPaying}
                                                               className="w-full h-18 bg-[#009EE3] text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-[#009EE3]/25 flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:brightness-110"
                                                        >
                                                               {isPaying ? <Loader2 className="animate-spin" /> : <>Mercado Pago <ArrowRight size={22} /></>}
                                                        </button>
                                                 )}
                                                 <a
                                                        href={`https://wa.me/${club.phone}?text=${encodeURIComponent(`Hola! Reservé el turno de las ${selectedSlot.time}hs el ${format(selectedDate, 'd/M')}. Envío comprobante.`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="w-full h-16 bg-card border border-border/80 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm hover:border-primary/50 transition-all"
                                                 >
                                                        <Phone size={20} /> Enviar Comprobante
                                                 </a>
                                          </div>
                                   )}

                                   <button
                                          onClick={() => setStep(0)}
                                          className="mt-14 mb-8 text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.6em] hover:text-primary transition-all duration-500 hover:opacity-100"
                                   >
                                          Cerrar
                                   </button>
                            </div>
                     </PageWrapper>
              )
       }

       return null
}
